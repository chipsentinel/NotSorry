"use client";

import { Calendar } from "lucide-react";

interface HistoricalYearData {
  year: number;
  temperature: number;
  precipitation: number;
  dateKey: string;
}

interface HistoricalYearsDisplayProps {
  data: HistoricalYearData[];
  isLoading: boolean;
}

export function HistoricalYearsDisplay({
  data,
  isLoading,
}: HistoricalYearsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <div
            className="absolute inset-2 animate-spin rounded-full border-4 border-blue-400/20 border-t-blue-400"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
        <p className="mt-3 font-mono text-xs text-blue-300/70">
          Loading historical data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-300/70">
        Historical Data (Same Date)
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((yearData, index) => (
          <div
            key={yearData.year}
            className="group rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-950/40 to-blue-900/20 p-3 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/10 animate-in slide-in-from-right duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-sm font-bold text-blue-100">
                  {yearData.year}
                </span>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="font-mono text-[10px] text-blue-400/70">Temp</p>
                  <p className="font-mono text-sm font-bold text-blue-50">
                    {yearData.temperature?.toFixed(1)}°C
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-blue-400/70">
                    Precip
                  </p>
                  <p className="font-mono text-sm font-bold text-blue-50">
                    {yearData.precipitation?.toFixed(2)} mm
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
