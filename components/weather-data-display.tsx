"use client";

import {
  Cloud,
  Droplets,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoricalYearData {
  year: number;
  temperature: number;
  precipitation: number;
  dateKey: string;
}

interface StatisticalData {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
}

interface ForecastData {
  date: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  precipitation: number;
  weatherCode: number;
}

interface WeatherDataDisplayProps {
  dateType: "past" | "forecast" | "future";
  isLoading: boolean;
  temperatureStats?: StatisticalData;
  precipitationStats?: StatisticalData;
  historicalData?: HistoricalYearData[];
  forecastData?: ForecastData[];
  selectedDate?: string;
  onDownloadCSV?: () => void;
  onDownloadJSON?: () => void;
}

export function WeatherDataDisplay({
  dateType,
  isLoading,
  temperatureStats,
  precipitationStats,
  historicalData,
  forecastData,
  selectedDate,
  onDownloadCSV,
  onDownloadJSON,
}: WeatherDataDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <div
            className="absolute inset-2 animate-spin rounded-full border-4 border-blue-400/20 border-t-blue-400"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
          <div
            className="absolute inset-4 animate-spin rounded-full border-4 border-blue-300/20 border-t-blue-300"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <p className="mt-4 font-mono text-sm text-blue-300/70">
          Loading data...
        </p>
      </div>
    );
  }

  // Vista para fechas futuras (más de 16 días) - Estadísticas históricas
  if (dateType === "future") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300/70">
            Historical Estimates
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadCSV}
              className="h-7 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
            >
              <Download className="mr-1 h-3 w-3" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadJSON}
              className="h-7 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
            >
              <Download className="mr-1 h-3 w-3" />
              JSON
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Temperature Statistics */}
          <div className="group rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 animate-in slide-in-from-left duration-300">
            <div className="mb-3 flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300">
                Temperature
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-blue-950/50 p-2">
                <p className="font-mono text-[10px] text-blue-400/70">Mean</p>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {temperatureStats?.mean.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <p className="font-mono text-[10px] text-blue-400/70">Median</p>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {temperatureStats?.median.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-blue-400" />
                  <p className="font-mono text-[10px] text-blue-400/70">Min</p>
                </div>
                <p className="font-mono text-sm font-bold text-blue-200">
                  {temperatureStats?.min.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-400" />
                  <p className="font-mono text-[10px] text-blue-400/70">Max</p>
                </div>
                <p className="font-mono text-sm font-bold text-blue-200">
                  {temperatureStats?.max.toFixed(1)}°C
                </p>
              </div>
            </div>
            <div className="mt-2 rounded-md bg-blue-950/30 p-2">
              <p className="font-mono text-[10px] text-blue-400/70">
                Std Dev: {temperatureStats?.stdDev.toFixed(2)}°C • Based on{" "}
                {temperatureStats?.count} years
              </p>
            </div>
          </div>

          {/* Precipitation Statistics */}
          <div className="group rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 animate-in slide-in-from-left duration-300 delay-100">
            <div className="mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300">
                Precipitation
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-blue-950/50 p-2">
                <p className="font-mono text-[10px] text-blue-400/70">Mean</p>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {precipitationStats?.mean.toFixed(2)} mm
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <p className="font-mono text-[10px] text-blue-400/70">Median</p>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {precipitationStats?.median.toFixed(2)} mm
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-blue-400" />
                  <p className="font-mono text-[10px] text-blue-400/70">Min</p>
                </div>
                <p className="font-mono text-sm font-bold text-blue-200">
                  {precipitationStats?.min.toFixed(2)} mm
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-400" />
                  <p className="font-mono text-[10px] text-blue-400/70">Max</p>
                </div>
                <p className="font-mono text-sm font-bold text-blue-200">
                  {precipitationStats?.max.toFixed(2)} mm
                </p>
              </div>
            </div>
            <div className="mt-2 rounded-md bg-blue-950/30 p-2">
              <p className="font-mono text-[10px] text-blue-400/70">
                Std Dev: {precipitationStats?.stdDev.toFixed(2)} mm • Based on{" "}
                {precipitationStats?.count} years
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista para pronóstico (0-16 días en el futuro)
  if (dateType === "forecast" && forecastData && selectedDate) {
    const selectedForecast = forecastData.find(
      (day) => day.date === selectedDate
    );

    if (!selectedForecast) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-4">
            <p className="font-mono text-sm text-yellow-300">
              No forecast data available for the selected date.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300/70">
            Weather Forecast
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadCSV}
              className="h-7 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
            >
              <Download className="mr-1 h-3 w-3" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadJSON}
              className="h-7 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
            >
              <Download className="mr-1 h-3 w-3" />
              JSON
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Temperature Forecast */}
          <div className="group rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 animate-in slide-in-from-left duration-300">
            <div className="mb-3 flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300">
                Temperature
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-blue-950/50 p-2">
                <p className="font-mono text-[10px] text-blue-400/70">
                  Average
                </p>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {selectedForecast.tempAvg.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-400" />
                  <p className="font-mono text-[10px] text-blue-400/70">Max</p>
                </div>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {selectedForecast.tempMax.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-blue-400" />
                  <p className="font-mono text-[10px] text-blue-400/70">Min</p>
                </div>
                <p className="font-mono text-lg font-bold text-blue-50">
                  {selectedForecast.tempMin.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-md bg-blue-950/50 p-2">
                <p className="font-mono text-[10px] text-blue-400/70">Range</p>
                <p className="font-mono text-sm font-bold text-blue-200">
                  {(
                    selectedForecast.tempMax - selectedForecast.tempMin
                  ).toFixed(1)}
                  °C
                </p>
              </div>
            </div>
          </div>

          {/* Precipitation Forecast */}
          <div className="group rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 animate-in slide-in-from-left duration-300 delay-100">
            <div className="mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300">
                Precipitation
              </span>
            </div>
            <div className="rounded-md bg-blue-950/50 p-3 text-center">
              <p className="font-mono text-3xl font-bold text-blue-50">
                {selectedForecast.precipitation.toFixed(1)} mm
              </p>
              <p className="mt-1 font-mono text-[10px] text-blue-400/70">
                Expected rainfall
              </p>
            </div>
          </div>

          {/* Date Info */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-950/30 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <p className="font-mono text-xs text-blue-300">
                Forecast for{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista para fechas pasadas - Datos históricos de un solo día
  if (dateType === "past") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300/70">
            Historical Data
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadCSV}
              className="h-7 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
            >
              <Download className="mr-1 h-3 w-3" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDownloadJSON}
              className="h-7 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
            >
              <Download className="mr-1 h-3 w-3" />
              JSON
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {temperatureStats && temperatureStats.mean !== null ? (
            <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 animate-in slide-in-from-left duration-300">
              <div className="mb-2 flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Temperature
                </span>
              </div>
              <p className="font-mono text-3xl font-bold text-blue-50">
                {temperatureStats.mean.toFixed(1)}°C
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-400/50" />
                <span className="font-mono text-xs text-blue-300/70">
                  Temperature data not available
                </span>
              </div>
            </div>
          )}

          {precipitationStats && precipitationStats.mean !== null ? (
            <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 animate-in slide-in-from-left duration-300 delay-100">
              <div className="mb-2 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Precipitation
                </span>
              </div>
              <p className="font-mono text-3xl font-bold text-blue-50">
                {precipitationStats.mean.toFixed(2)} mm
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400/50" />
                <span className="font-mono text-xs text-blue-300/70">
                  Precipitation data not available
                </span>
              </div>
            </div>
          )}

          {/* Date Info */}
          {selectedDate && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-950/30 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <p className="font-mono text-xs text-blue-300">
                  Data from{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
