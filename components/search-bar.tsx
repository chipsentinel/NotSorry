"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotonFeature {
  properties: {
    name: string;
    country?: string;
    state?: string;
    city?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface SearchBarProps {
  handleLocationSelect: (location: {
    name: string;
    lat: number;
    lon: number;
  }) => void;
  isInMapView?: boolean;
  onInputActiveChange?: (isActive: boolean) => void;
}

export function SearchBar({
  handleLocationSelect,
  isInMapView = false,
  onInputActiveChange,
}: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInMapView && onInputActiveChange) {
      const isActive = location.length > 0 || showSuggestions;
      onInputActiveChange(isActive);
    }
  }, [location, showSuggestions, isInMapView, onInputActiveChange]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (location.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            location
          )}&limit=8`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatLocationName = (feature: PhotonFeature) => {
    const { name, city, state, country } = feature.properties;
    const parts = [name || city, state, country].filter(Boolean);
    return parts.join(", ");
  };
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectSuggestion = (feature: PhotonFeature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const name = formatLocationName(feature);
    setLocation(name);
    setShowSuggestions(false);
    handleLocationSelect({ name, lat, lon });

    // 👇 Quitar focus del input
    inputRef.current?.blur();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectSuggestion(
        suggestions[selectedIndex >= 0 ? selectedIndex : 0]
      );
    }

    // 👇 También quitar focus si se presiona "BUSCAR"
    inputRef.current?.blur();
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              handleSelectSuggestion(data.features[0]);
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div
        ref={searchRef}
        className={`group relative ${
          isInMapView ? "max-w-xl" : "mx-auto max-w-2xl"
        }`}
      >
        {/* Search Input Container */}
        <div
          className={`relative flex items-center overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-md transition-all duration-500 hover:border-accent/50 focus-within:border-accent focus-within:shadow-lg focus-within:shadow-accent/20 ${
            isInMapView ? "scale-95" : ""
          }`}
        >
          {/* Icon */}
          <div className="flex items-center pl-6 pr-4">
            <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder="Enter a location or coordinates..."
            className="flex-1 bg-transparent py-5 pr-4 font-sans text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-lg"
          />

          {/* Botón de ubicación */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mr-2 h-10 w-10 rounded-xl text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
            onClick={handleGetCurrentLocation}
          >
            <MapPin className="h-5 w-5" />
            <span className="sr-only">Usar ubicación actual</span>
          </Button>

          {/* botón de búsqueda */}
          <Button
            type="submit"
            disabled={!location}
            className="mr-2 rounded-xl bg-accent px-6 py-5 font-mono text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50"
          >
            SEARCH
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-h-[50%] overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
              {suggestions.map((feature, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(feature)}
                  className={`w-full px-6 py-4 text-left transition-all duration-200 ${
                    index === selectedIndex
                      ? "bg-accent/20 text-foreground shadow-inner"
                      : "text-foreground hover:bg-accent/10 hover:shadow-sm"
                  } ${
                    index !== suggestions.length - 1
                      ? "border-b border-border/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                        index === selectedIndex
                          ? "bg-accent/30 scale-110"
                          : "bg-accent/10"
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {formatLocationName(feature)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.geometry.coordinates[1].toFixed(4)}°,{" "}
                        {feature.geometry.coordinates[0].toFixed(4)}°
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Glow del subtitulo */}
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-accent/5 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
      </div>
    </form>
  );
}
