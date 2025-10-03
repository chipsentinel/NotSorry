"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Cloud, Droplets, Wind, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";

interface MapViewProps {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  onBack: () => void;
  onLocationUpdate: (location: {
    name: string;
    lat: number;
    lon: number;
  }) => void;
}

export function MapView({ location, onBack, onLocationUpdate }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initialLocation = useRef(location);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

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
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(mapInstance);

    // Custom marker with glow effect
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="marker-pin">
          <div class="marker-pulse"></div>
          <div class="marker-dot"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    marker.current = L.marker(
      [initialLocation.current.lat, initialLocation.current.lon],
      { icon: customIcon }
    ).addTo(mapInstance);

    map.current = mapInstance;

    setTimeout(() => {
      setMapLoaded(true);
    }, 500);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [scriptLoaded]);

  const handleLocationUpdate = (newLocation: {
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
    // Update parent component state
    onLocationUpdate(newLocation);
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
                <span className="font-mono text-lg font-bold text-blue-300">
                  NW
                </span>
              </div>
              <div>
                <h1 className="font-mono text-sm font-bold tracking-tight text-blue-100">
                  NOTSORRY WEATHER
                </h1>
                <p className="font-mono text-[10px] text-blue-300/70">
                  NASA DATA
                </p>
              </div>
            </div>

            <div className="pt-2">
              <SearchBar
                onLocationSelect={handleLocationUpdate}
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
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-blue-500/30 bg-blue-950/40 py-2.5 pl-10 pr-4 font-mono text-sm text-blue-100 backdrop-blur-sm transition-all placeholder:text-blue-400/50 hover:border-blue-400/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
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

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-blue-300/70">
                  Current Conditions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/40 hover:shadow-md hover:border-blue-400/30">
                    <div className="flex items-center gap-3">
                      <Cloud className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-blue-100">
                        Temperature
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-blue-50">
                      --°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/40 hover:shadow-md hover:border-blue-400/30">
                    <div className="flex items-center gap-3">
                      <Droplets className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-blue-100">
                        Humidity
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-blue-50">
                      --%
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/40 hover:shadow-md hover:border-blue-400/30">
                    <div className="flex items-center gap-3">
                      <Wind className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-blue-100">
                        Wind Speed
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-blue-50">
                      -- km/h
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-950/30 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/40 hover:shadow-md hover:border-blue-400/30">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-blue-100">
                        Visibility
                      </span>
                    </div>
                    <span className="font-mono text-lg font-bold text-blue-50">
                      -- km
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-4 backdrop-blur-sm">
                <p className="font-mono text-xs text-blue-300">
                  Data powered by NASA satellite network
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
