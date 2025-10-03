"use client";

import { AnimatedGlobe } from "./animated-globe";

interface LoadingTransitionProps {
  locationName: string;
}

export function LoadingTransition({ locationName }: LoadingTransitionProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      <AnimatedGlobe />

      <div className="relative z-10 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative h-20 w-20">
            {/* Círculos giratorios */}
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-accent/20 border-t-accent"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
            <div
              className="absolute inset-4 animate-spin rounded-full border-4 border-accent/20 border-t-accent"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        <h2 className="mb-2 font-mono text-2xl font-bold text-foreground">
          LOADING INFORMATION
        </h2>
        <p className="font-sans text-lg text-muted-foreground">
          Loading weather data for {locationName}
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-accent"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-accent"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-accent"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
