"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Cloud,
  Calendar,
  CloudRain,
  CloudSnow,
  Sun,
  CloudDrizzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { WeatherDataDisplay } from "@/components/weather-data-display";
import { HistoricalYearsDisplay } from "@/components/historical-years-display";

interface MapViewProps {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  onBack: () => void;
  onLocationUpdate: (
    location: {
      name: string;
      lat: number;
      lon: number;
    },
    date: string
  ) => void;
  temperatureStats?: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    count: number;
  };
  precipitationStats?: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    count: number;
  };
  historicalData?: Array<{
    year: number;
    temperature: number;
    precipitation: number;
    dateKey: string;
  }>;
  forecastData?: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    tempAvg: number;
    precipitation: number;
    weatherCode: number;
  }>;
  isLoadingWeatherData?: boolean;
  selectedDate?: string;
}

// Mapeo de códigos de clima de OpenMeteo a iconos
const getWeatherIcon = (code: number) => {
  if (code === 0) return Sun; // Cielo despejado
  if (code <= 3) return Cloud; // Parcialmente nublado
  if (code <= 48) return Cloud; // Niebla
  if (code <= 57) return CloudDrizzle; // Llovizna
  if (code <= 67) return CloudRain; // Lluvia
  if (code <= 77) return CloudSnow; // Nieve
  if (code <= 82) return CloudRain; // Chubascos
  if (code <= 86) return CloudSnow; // Chubascos de nieve
  return Cloud;
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow Showers";
  return "Unknown";
};

const getDayName = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export function MapView({
  location,
  onBack,
  onLocationUpdate,
  temperatureStats,
  precipitationStats,
  historicalData = [],
  forecastData = null,
  isLoadingWeatherData = false,
  selectedDate,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initialLocation = useRef(location);
  const [currentSelectedDate, setCurrentSelectedDate] = useState(
    selectedDate || new Date().toISOString().split("T")[0]
  );

  // Determinar el tipo de vista según la fecha
  const determineDateType = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);

    const maxForecastDate = new Date(today);
    maxForecastDate.setDate(maxForecastDate.getDate() + 16);

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "past";
    } else if (diffDays >= 0 && diffDays <= 16) {
      return "forecast";
    } else {
      return "future";
    }
  };

  const dateType = determineDateType(currentSelectedDate);

  const handleDownloadCSV = () => {
    if (!temperatureStats || !precipitationStats) return;

    let csvContent = [
      "Metric,Mean,Median,Min,Max,Std Dev,Count",
      `Temperature (°C),${temperatureStats.mean.toFixed(
        2
      )},${temperatureStats.median.toFixed(2)},${temperatureStats.min.toFixed(
        2
      )},${temperatureStats.max.toFixed(2)},${temperatureStats.stdDev.toFixed(
        2
      )},${temperatureStats.count}`,
      `Precipitation (mm),${precipitationStats.mean.toFixed(
        2
      )},${precipitationStats.median.toFixed(
        2
      )},${precipitationStats.min.toFixed(2)},${precipitationStats.max.toFixed(
        2
      )},${precipitationStats.stdDev.toFixed(2)},${precipitationStats.count}`,
    ];

    if (historicalData && historicalData.length > 0) {
      csvContent.push(
        "",
        "Historical Data",
        "Year,Temperature (°C),Precipitation (mm),Date",
        ...historicalData.map(
          (d) =>
            `${d.year},${d.temperature?.toFixed(2) || "N/A"},${
              d.precipitation?.toFixed(2) || "N/A"
            },${d.dateKey}`
        )
      );
    }

    if (forecastData && forecastData.length > 0) {
      csvContent.push(
        "",
        "Forecast Data",
        "Date,Temp Max (°C),Temp Min (°C),Temp Avg (°C),Precipitation (mm),Weather Code",
        ...forecastData.map(
          (d) =>
            `${d.date},${d.tempMax?.toFixed(2)},${d.tempMin?.toFixed(
              2
            )},${d.tempAvg?.toFixed(2)},${d.precipitation?.toFixed(2)},${
              d.weatherCode
            }`
        )
      );
    }

    const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weather-data-${location.name}-${currentSelectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonData = {
      location: location.name,
      coordinates: { lat: location.lat, lon: location.lon },
      date: currentSelectedDate,
      dateType: dateType,
      statistics: {
        temperature: temperatureStats,
        precipitation: precipitationStats,
      },
      historicalData: historicalData,
      forecastData: forecastData,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weather-data-${location.name}-${currentSelectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).L) {
      setScriptLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !mapContainer.current || map.current) return;

    const L = (window as any).L;

    const mapInstance = L.map(mapContainer.current, {
      center: [initialLocation.current.lat, initialLocation.current.lon],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" }
    ).addTo(mapInstance);

    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="marker-pin"><div class="marker-pulse"></div><div class="marker-dot"></div></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    marker.current = L.marker(
      [initialLocation.current.lat, initialLocation.current.lon],
      { icon: customIcon }
    ).addTo(mapInstance);

    map.current = mapInstance;
    setMapLoaded(true);

    // ⚠️ NO hacemos cleanup que destruya el mapa salvo en unmount real
    return () => {
      mapInstance.off();
      mapInstance.remove();
      if (mapContainer.current) {
        mapContainer.current.innerHTML = ""; // limpiar DOM residual de Leaflet
      }
    };
  }, [scriptLoaded]);

  const handleLocationUpdateInternal = (newLocation: {
    name: string;
    lat: number;
    lon: number;
  }) => {
    if (map.current && marker.current) {
      map.current.flyTo([newLocation.lat, newLocation.lon], 15, {
        duration: 2,
        easeLinearity: 0.25,
      });
      marker.current.setLatLng([newLocation.lat, newLocation.lon]);
    }
    onLocationUpdate(newLocation, currentSelectedDate);
  };

  const handleDateChange = (newDate: string) => {
    setCurrentSelectedDate(newDate);
    onLocationUpdate(location, newDate);
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div
          ref={mapContainer}
          className="h-full w-full leaflet-map-container"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-600/15" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]" />

        {(!scriptLoaded || !mapLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
              <p className="font-mono text-sm text-muted-foreground">
                {!scriptLoaded ? "Loading map..." : "Initializing..."}
              </p>
            </div>
          </div>
        )}

        {/* Bottom panel - Forecast o Historical Data */}
        <div className="pointer-events-auto absolute bottom-4 left-0 right-0 z-10 px-4 md:left-96 md:px-8">
          {dateType === "forecast" &&
            forecastData &&
            forecastData.length > 0 && (
              <div className="relative rounded-xl border border-blue-500/30 bg-slate-900/80 p-4 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900/50 to-transparent" />
                <div className="relative">
                  <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">
                    16-Day Forecast
                  </h3>
                  <div className="max-h-[180px] overflow-x-auto pb-1 custom-scrollbar">
                    <div className="flex gap-2">
                      {forecastData.map((day, index) => {
                        const Icon = getWeatherIcon(day.weatherCode);
                        const isSelectedDay = day.date === currentSelectedDate;
                        return (
                          <div
                            key={day.date}
                            className={`flex min-w-[90px] flex-col items-center gap-2 rounded-lg border p-3 backdrop-blur-sm transition-all hover:scale-105 animate-in slide-in-from-bottom duration-300 ${
                              isSelectedDay
                                ? "border-blue-400 bg-blue-900/60 hover:bg-blue-900/70"
                                : "border-blue-500/20 bg-blue-950/40 hover:border-blue-400/40 hover:bg-blue-900/50"
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <span className="font-mono text-xs font-semibold text-blue-200">
                              {getDayName(day.date)}
                            </span>
                            <Icon className="h-6 w-6 text-blue-400" />
                            <span className="font-mono text-base font-bold text-blue-50">
                              {day.tempMax?.toFixed(0)}°
                            </span>
                            <span className="font-mono text-xs text-blue-300/70">
                              {day.tempMin?.toFixed(0)}°
                            </span>
                            <span className="font-mono text-[10px] text-blue-300/70">
                              {getWeatherCondition(day.weatherCode)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {dateType === "future" &&
            historicalData &&
            historicalData.length > 0 && (
              <div className="relative rounded-xl border border-blue-500/30 bg-slate-900/80 p-4 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900/50 to-transparent" />
                <div className="relative">
                  <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">
                    Historical Data (Same Date)
                  </h3>
                  <div className="max-h-[180px] overflow-x-auto pb-1 custom-scrollbar">
                    <div className="flex gap-2">
                      {historicalData.map((yearData, index) => {
                        if (yearData.temperature !== null) {
                          return (
                            <div
                              key={yearData.year}
                              className="flex min-w-[110px] flex-col gap-2 rounded-lg border border-blue-500/20 bg-blue-950/40 p-3 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:bg-blue-900/50 animate-in slide-in-from-right duration-300"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <span className="font-mono text-xs font-semibold text-blue-200">
                                {yearData.year}
                              </span>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] text-blue-300/70">
                                    Temp
                                  </span>
                                  <span className="font-mono text-sm font-bold text-blue-50">
                                    {yearData.temperature?.toFixed(1)}°C
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] text-blue-300/70">
                                    Precip
                                  </span>
                                  <span className="font-mono text-sm font-bold text-blue-50">
                                    {yearData.precipitation?.toFixed(1)} mm
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      <aside className="relative z-20 flex w-full flex-col md:w-96 animate-in slide-in-from-left duration-700">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/60 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-950/30" />

        <div className="relative z-10 flex h-full flex-col border-r border-blue-500/20 shadow-2xl">
          <div className="border-b border-blue-500/20 p-6 space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="-ml-2 text-blue-200 hover:text-blue-100 transition-all hover:translate-x-[-4px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to search
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                <img
                  src="/logo.png"
                  alt="NotSorry Weather logo"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h1 className="font-mono text-sm font-bold tracking-tight text-blue-100">
                  NOTSORRY WEATHER
                </h1>
                <p className="font-mono text-[10px] text-blue-300/70">
                  NASA SPACEAPPS
                </p>
              </div>
            </div>

            <div className="pt-2">
              <SearchBar
                onLocationSelect={handleLocationUpdateInternal}
                isInMapView={true}
              />
            </div>

            <div className="pt-2">
              <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-blue-300/70">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                <input
                  type="date"
                  value={currentSelectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full rounded-lg border border-blue-500/30 bg-blue-950/40 py-2.5 pl-10 pr-4 font-mono text-sm text-blue-100 backdrop-blur-sm transition-all placeholder:text-blue-400/50 hover:border-blue-400/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-blue-300/70">
                {dateType === "past" && "Showing historical data for this date"}
                {dateType === "forecast" &&
                  "Showing weather forecast (up to 16 days)"}
                {dateType === "future" &&
                  "Showing historical data from previous years"}
              </p>
            </div>
          </div>

          <div className="border-b border-blue-500/20 p-6">
            <h2 className="mb-1 font-sans text-2xl font-bold text-blue-50">
              {location.name}
            </h2>
            <p className="font-mono text-xs text-blue-300/70">
              {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-6">
              <WeatherDataDisplay
                dateType={dateType}
                isLoading={isLoadingWeatherData}
                temperatureStats={temperatureStats}
                precipitationStats={precipitationStats}
                historicalData={historicalData}
                forecastData={forecastData}
                selectedDate={currentSelectedDate}
                onDownloadCSV={handleDownloadCSV}
                onDownloadJSON={handleDownloadJSON}
              />

              <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-4 backdrop-blur-sm">
                <p className="font-mono text-xs text-blue-300">
                  {dateType === "forecast"
                    ? "Forecast data powered by Open-Meteo"
                    : "Data powered by NASA satellite network"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
