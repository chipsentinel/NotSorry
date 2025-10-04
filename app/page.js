"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { AnimatedGlobe } from "@/components/animated-globe";
import { MapView } from "@/components/map-view";
import { LoadingTransition } from "@/components/loading-transition";

export default function Home() {
  const [view, setView] = useState("search");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInputActive, setIsInputActive] = useState(false);

  const fetchNasaData = (url, label) => {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en ${label}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`${label}:`, data);
        return data;
      })
      .catch((error) => {
        console.error(`Error en ${label}:`, error);
      });
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setView("loading");

    // 1. Climatología
    const urlClimatology =
      "https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M&community=RE&longitude=-0.4081&latitude=42.1383&format=JSON";

    fetchNasaData(urlClimatology, "Climatología").then((data) => {
      if (data?.properties?.parameter?.T2M) {
        const temps = data.properties.parameter.T2M;
        console.log("🌡️ Climatología de temperatura media (°C):");
        Object.entries(temps).forEach(([mes, valor]) => {
          console.log(`${mes}: ${valor.toFixed(2)} °C`);
        });
      }
    });

    // 2. Diario
    const urlDaily =
      "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOT&community=RE&longitude=-0.4081&latitude=42.1383&start=20200101&end=20200105&format=JSON";
    fetchNasaData(urlDaily, "Diario");

    // 3. Horario
    const urlHourly =
      "https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=-0.4081&latitude=42.1383&start=20200601&end=20200602&format=JSON";
    fetchNasaData(urlHourly, "Horario");

    // 👇 quitamos Projections y NCCS porque fallan en client (CORS/404)

    // Cambiar vista al mapa tras 2s
    setTimeout(() => {
      setView("map");
    }, 2000);
  };

  const handleBackToSearch = () => {
    setView("search");
    setSelectedLocation(null);
  };

  const handleLocationUpdate = (location) => {
    setSelectedLocation(location);
  };

  if (view === "loading") {
    return <LoadingTransition locationName={selectedLocation?.name || ""} />;
  }

  if (view === "map" && selectedLocation) {
    return (
      <MapView
        location={selectedLocation}
        onBack={handleBackToSearch}
        onLocationUpdate={handleLocationUpdate}
      />
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background animate-in fade-in duration-500">
      {/* Fondo animado */}
      <AnimatedGlobe />

      {/* Header */}
      <header
        className={`relative z-10 flex items-center justify-between px-6 py-6 md:px-12 animate-in slide-in-from-top duration-700 transition-all ${
          isInputActive
            ? "opacity-0 -translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 backdrop-blur-sm">
            <span className="flex items-center">
              <img
                src="/logo.png"
                alt="NotSorry Weather logo"
                className="w-8 h-8"
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

      {/* Main Content */}
      <div
        className={`relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center px-6 transition-all duration-700 ${
          isInputActive ? "justify-start pt-12" : "justify-center"
        }`}
      >
        <div className="w-full max-w-3xl space-y-8 text-center animate-in fade-in slide-in-from-bottom duration-700 delay-150">
          {/* Título */}
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

          {/* Barra de búsqueda */}
          <SearchBar
            onLocationSelect={handleLocationSelect}
            onInputActiveChange={setIsInputActive}
          />

          {/* Badges */}
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
    </main>
  );
}

