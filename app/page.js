"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { AnimatedGlobe } from "@/components/animated-globe";
import { MapView } from "@/components/map-view";
import { LoadingTransition } from "@/components/loading-transition";
import { useAI } from "@/components/ai-provider";

export default function Home() {
  const { sendContext, registerLocationHandler } = useAI();
  const [view, setView] = useState("search");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [climateStatistics, setClimateStatistics] = useState(null);
  const [rawYearlyData, setRawYearlyData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);

  // Función para obtener predicción meteorológica de OpenMeteo
  const fetchWeatherForecast = async (lat, lon, targetDate) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=16`;

      console.log("Obteniendo pronóstico de OpenMeteo...");
      const response = await fetch(url);
      const data = await response.json();

      if (!data.daily) {
        throw new Error("No se recibieron datos de pronóstico");
      }

      // Convertir los datos al formato esperado
      const forecastDays = data.daily.time.map((date, index) => ({
        date: date,
        tempMax: data.daily.temperature_2m_max[index],
        tempMin: data.daily.temperature_2m_min[index],
        tempAvg:
          (data.daily.temperature_2m_max[index] +
            data.daily.temperature_2m_min[index]) /
          2,
        precipitation: data.daily.precipitation_sum[index],
        weatherCode: data.daily.weather_code[index],
      }));

      console.log("Pronóstico obtenido:", forecastDays);
      return forecastDays;
    } catch (error) {
      console.error("Error obteniendo pronóstico:", error);
      throw error;
    }
  };

  // Función para obtener datos climáticos de los últimos 30 años para un día específico
  const fetchHistoricalClimateData = async (lat, lon, targetDate) => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 30;

    // Extraer mes y día de la fecha objetivo (formato: YYYY-MM-DD)
    const [year, month, day] = targetDate.split("-");

    try {
      const startDateStr = `${startYear}0101`;
      const endDateStr = `${currentYear}1231`;

      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=${startDateStr}&end=${endDateStr}&format=JSON`;

      console.log(
        `Descargando datos históricos de ${startYear} a ${currentYear}...`
      );

      const response = await fetch(url);
      const data = await response.json();

      if (!data.properties || !data.properties.parameter) {
        throw new Error("No se recibieron datos válidos de la API");
      }

      const t2m = data.properties.parameter.T2M;
      const prectotcorr = data.properties.parameter.PRECTOTCORR;

      const allYearsData = [];

      // Extraer el día específico de cada año
      for (let y = startYear; y <= currentYear; y++) {
        const yearStr = y.toString();
        const targetKey = `${yearStr}${month}${day}`;

        let tempValue = null;
        let precipValue = null;

        if (t2m && t2m[targetKey] !== undefined && t2m[targetKey] !== -999) {
          tempValue = t2m[targetKey];
        }

        if (
          prectotcorr &&
          prectotcorr[targetKey] !== undefined &&
          prectotcorr[targetKey] !== -999
        ) {
          precipValue = prectotcorr[targetKey];
        }

        allYearsData.push({
          year: y,
          temperature: tempValue,
          precipitation: precipValue,
          dateKey: targetKey,
        });
      }

      return allYearsData;
    } catch (error) {
      console.error("Error obteniendo datos climáticos históricos:", error);
      throw error;
    }
  };

  // Función para obtener datos de un solo día del pasado desde NASA
  const fetchSingleDayData = async (lat, lon, targetDate) => {
    try {
      // Convertir fecha YYYY-MM-DD a YYYYMMDD
      const [year, month, day] = targetDate.split("-");
      const dateStr = `${year}${month}${day}`;

      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=${dateStr}&end=${dateStr}&format=JSON`;

      console.log(`Obteniendo datos para el día ${targetDate}...`);

      const response = await fetch(url);
      const data = await response.json();

      if (!data.properties || !data.properties.parameter) {
        throw new Error("No se recibieron datos válidos de la API");
      }

      const t2m = data.properties.parameter.T2M;
      const prectotcorr = data.properties.parameter.PRECTOTCORR;

      const tempValue =
        t2m && t2m[dateStr] !== undefined && t2m[dateStr] !== -999
          ? t2m[dateStr]
          : null;

      const precipValue =
        prectotcorr &&
        prectotcorr[dateStr] !== undefined &&
        prectotcorr[dateStr] !== -999
          ? prectotcorr[dateStr]
          : null;

      return {
        temperature:
          tempValue !== null ? parseFloat(tempValue.toFixed(2)) : null,
        precipitation:
          precipValue !== null ? parseFloat(precipValue.toFixed(2)) : null,
        date: targetDate,
      };
    } catch (error) {
      console.error("Error obteniendo datos del día:", error);
      throw error;
    }
  };

  // Función para calcular estadísticas del día específico
  const calculateDayStatistics = (allYearsData) => {
    const temperatures = allYearsData
      .map((d) => d.temperature)
      .filter((t) => t !== null && t !== -999 && !isNaN(t));

    const precipitation = allYearsData
      .map((d) => d.precipitation)
      .filter((p) => p !== null && p !== -999 && !isNaN(p));

    const calculateStats = (values) => {
      if (values.length === 0) return null;

      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

      const variance =
        values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        values.length;
      const stdDev = Math.sqrt(variance);

      return {
        mean: parseFloat(mean.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        min: parseFloat(Math.min(...values).toFixed(2)),
        max: parseFloat(Math.max(...values).toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        count: values.length,
      };
    };

    return {
      temperature: calculateStats(temperatures),
      precipitation: calculateStats(precipitation),
      yearsAnalyzed: allYearsData.length,
      validTemperatureData: temperatures.length,
      validPrecipitationData: precipitation.length,
    };
  };

  // Determinar el tipo de fecha y qué datos cargar
  const determineDateType = (targetDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);

    const maxForecastDate = new Date(today);
    maxForecastDate.setDate(maxForecastDate.getDate() + 16);

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: "past", diffDays };
    } else if (diffDays >= 0 && diffDays <= 16) {
      return { type: "forecast", diffDays };
    } else {
      return { type: "future", diffDays };
    }
  };

  // Función principal para handleLocationSelect
  const handleLocationSelect = async (location, targetDateStr = null) => {
    console.log("Ubicación seleccionada:", location);

    const { lat, lon, name } = location;

    // Si no se proporciona fecha, usar la fecha actual
    if (!targetDateStr) {
      const today = new Date();
      targetDateStr = today.toISOString().split("T")[0];
    }

    const dateInfo = determineDateType(targetDateStr);
    console.log(`Tipo de fecha: ${dateInfo.type}, días: ${dateInfo.diffDays}`);

    setSelectedLocation(location);
    setCurrentDate(targetDateStr);
    setView("loading");

    try {
      if (dateInfo.type === "past") {
        // Fecha en el pasado: obtener solo datos de ese día específico
        console.log("Obteniendo datos históricos para un día específico...");
        const singleDayData = await fetchSingleDayData(lat, lon, targetDateStr);

        const stats = {
          temperature:
            singleDayData.temperature !== null
              ? {
                  mean: singleDayData.temperature,
                  median: singleDayData.temperature,
                  min: singleDayData.temperature,
                  max: singleDayData.temperature,
                  stdDev: 0,
                  count: 1,
                }
              : null,
          precipitation:
            singleDayData.precipitation !== null
              ? {
                  mean: singleDayData.precipitation,
                  median: singleDayData.precipitation,
                  min: singleDayData.precipitation,
                  max: singleDayData.precipitation,
                  stdDev: 0,
                  count: 1,
                }
              : null,
        };

        setClimateStatistics(stats);
        setRawYearlyData([]);
        setForecastData(null);

        // (Opcional) seguir enviando contexto para UI, pero la IA recibirá el resultado directo
        try {
          sendContext?.(
            `El usuario seleccionó ${name} (${lat}, ${lon}) para la fecha ${targetDateStr}. Datos del día: Temperatura ${singleDayData.temperature}°C, Precipitación ${singleDayData.precipitation}mm.`
          );
        } catch (e) {
          console.warn("No se pudo enviar contexto al asistente:", e);
        }

        setView("map");

        return {
          success: true,
          mode: "past",
          location: { name, lat, lon },
          date: targetDateStr,
          data: { singleDayData, statistics: stats },
        };
      } else if (dateInfo.type === "forecast") {
        // Fecha dentro de los próximos 16 días: pronóstico de OpenMeteo
        console.log("Obteniendo pronóstico meteorológico...");
        const forecast = await fetchWeatherForecast(lat, lon, targetDateStr);

        // Encontrar el día específico en el pronóstico
        const targetDayForecast = forecast.find(
          (day) => day.date === targetDateStr
        );

        if (targetDayForecast) {
          setClimateStatistics({
            temperature: {
              mean: targetDayForecast.tempAvg,
              median: targetDayForecast.tempAvg,
              min: targetDayForecast.tempMin,
              max: targetDayForecast.tempMax,
              stdDev: 0,
              count: 1,
            },
            precipitation: {
              mean: targetDayForecast.precipitation,
              median: targetDayForecast.precipitation,
              min: targetDayForecast.precipitation,
              max: targetDayForecast.precipitation,
              stdDev: 0,
              count: 1,
            },
          });
        } else {
          setClimateStatistics(null);
        }

        setForecastData(forecast);
        setRawYearlyData([]);

        try {
          sendContext?.({
            location: { name, lat, lon },
            date: targetDateStr,
            mode: "forecast",
            forecast,
            targetDayForecast,
          });
        } catch (e) {
          console.warn("No se pudo enviar contexto al asistente:", e);
        }

        setView("map");

        return {
          success: true,
          mode: "forecast",
          location: { name, lat, lon },
          date: targetDateStr,
          data: { forecast, targetDayForecast },
        };
      } else {
        // Fecha futura (más de 16 días): datos históricos del mismo día
        console.log(
          "Obteniendo datos históricos del mismo día en años anteriores..."
        );
        const allYearsData = await fetchHistoricalClimateData(
          lat,
          lon,
          targetDateStr
        );
        const statistics = calculateDayStatistics(allYearsData);

        setClimateStatistics(statistics);
        setRawYearlyData(allYearsData);
        setForecastData(null);

        try {
          sendContext?.({
            location: { name, lat, lon },
            date: targetDateStr,
            mode: "future",
            statistics,
            allYearsData,
          });
        } catch (e) {
          console.warn("No se pudo enviar contexto al asistente:", e);
        }

        setView("map");

        return {
          success: true,
          mode: "future",
          location: { name, lat, lon },
          date: targetDateStr,
          data: { statistics, allYearsData },
        };
      }
    } catch (error) {
      console.error("Error al obtener datos climáticos:", error);
      setView("error");
      return { success: false, error: error.message || "Error desconocido" };
    }
  };

  const handleBackToSearch = () => {
    setView("search");
    setSelectedLocation(null);
    setClimateStatistics(null);
    setRawYearlyData(null);
    setForecastData(null);
    setCurrentDate(null);
  };

  const handleLocationUpdate = (location) => {
    setSelectedLocation(location);
  };

  useEffect(() => {
    // register the handler with the provider so the AI assistant can call it
    registerLocationHandler?.(handleLocationSelect);
    return () => registerLocationHandler?.(null);
  }, [registerLocationHandler]);

  if (view === "loading") {
    return (
      <>
        <LoadingTransition locationName={selectedLocation?.name || ""} />
      </>
    );
  }

  if (view === "map" && selectedLocation) {
    return (
      <>
        <MapView
          location={selectedLocation}
          onBack={handleBackToSearch}
          onLocationUpdate={handleLocationSelect}
          temperatureStats={climateStatistics?.temperature}
          precipitationStats={climateStatistics?.precipitation}
          historicalData={rawYearlyData || []}
          forecastData={forecastData}
          selectedDate={currentDate}
        />
      </>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background animate-in fade-in duration-500">
      <AnimatedGlobe />

      <header
        className={`relative z-10 flex items-center justify-between px-6 py-6 md:px-12 animate-in slide-in-from-top duration-700 transition-all ${
          isInputActive
            ? "opacity-0 -translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent">
            <span className="flex items-center">
              <img
                src="/logo.png"
                alt="NotSorry Weather logo"
                className="w-10 h-10"
              />
            </span>
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-tight text-foreground">
              NOTSORRY WEATHER
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground">
              NASA SPACEAPPS 2025
            </p>
          </div>
        </div>
      </header>

      <div
        className={`relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center px-6 transition-all duration-700 ${
          isInputActive ? "justify-start pt-12" : "justify-center"
        }`}
      >
        <div className="w-full max-w-3xl space-y-8 text-center animate-in fade-in slide-in-from-bottom duration-700 delay-150">
          <div
            className={`space-y-4 transition-all duration-800 ${
              isInputActive
                ? "opacity-0 -translate-y-8 pointer-events-none max-h-0"
                : "opacity-100 translate-y-0 max-h-[500px]"
            }`}
          >
            <h2 className="text-balance font-sans text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Future weather on time
            </h2>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              Real-time predictions using NASA data
            </p>
          </div>

          <SearchBar
            handleLocationSelect={handleLocationSelect}
            onInputActiveChange={setIsInputActive}
          />

          <div
            className={`flex flex-wrap items-center justify-center gap-3 pt-4 transition-all duration-500 ${
              isInputActive
                ? "opacity-0 translate-y-8 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="rounded-full border border-border bg-card/30 px-4 py-2 backdrop-blur-sm">
              <p className="font-mono text-xs text-muted-foreground">
                REAL-TIME STATISTICS
              </p>
            </div>
            <div className="rounded-full border border-border bg-card/30 px-4 py-2 backdrop-blur-sm">
              <p className="font-mono text-xs text-muted-foreground">
                SIMPLE INFORMATION
              </p>
            </div>
            <div className="rounded-full border border-border bg-card/30 px-4 py-2 backdrop-blur-sm">
              <p className="font-mono text-xs text-muted-foreground">
                AI POWERED
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* AIAssistant is mounted once at the app level via AIAssistantProvider */}
    </main>
  );
}
