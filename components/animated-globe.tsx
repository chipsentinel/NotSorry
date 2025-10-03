"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: string;
  top: string;
  animation: string;
  boxShadow: string;
}

export function AnimatedGlobe() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const getParticleAnimation = (index: number) => {
    const animations = [
      "float-diagonal-1",
      "float-diagonal-2",
      "float-diagonal-3",
      "float-diagonal-4",
      "float-circular",
    ];
    const animationType = animations[index % animations.length];
    const duration = 8 + (index % 5) * 2;
    const delay = (index * 0.3) % 4;

    return `${animationType} ${duration}s ease-in-out infinite ${delay}s, twinkle ${
      3 + (index % 4)
    }s ease-in-out infinite ${delay}s`;
  };

  useEffect(() => {
    // Generar partículas solo en el cliente para evitar errores de hydration
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: getParticleAnimation(i),
      boxShadow:
        "0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(59, 130, 246, 0.4)",
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Imagen mapa mundi con glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          <img
            src="/backmap.jpg"
            alt="Mapa mundi"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            style={{
              filter:
                "drop-shadow(0 0 30px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.4)) brightness(1.2) contrast(1.3)",
              animation: "pulse-glow 4s ease-in-out infinite",
            }}
          />

          <img
            src="/backmap.jpg"
            alt="Glow del mapa mundi"
            className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xl"
            style={{
              animation: "pulse-glow 4s ease-in-out infinite 0.5s",
            }}
          />
        </div>
      </div>

      {/* Grid animado */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Partículas animadas - solo se renderizan en el cliente */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute h-1 w-1 rounded-full bg-white/60"
            style={{
              left: particle.left,
              top: particle.top,
              animation: particle.animation,
              boxShadow: particle.boxShadow,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
          animation: "scan 8s linear infinite",
          height: "200px",
        }}
      />

      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)",
          animation: "scan-horizontal 12s linear infinite",
          width: "300px",
        }}
      />

      <div
        className="absolute top-0 left-0 h-96 w-96 opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          animation: "pulse-corner 3s ease-in-out infinite",
        }}
      />

      <div
        className="absolute bottom-0 right-0 h-96 w-96 opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
          animation: "pulse-corner 3s ease-in-out infinite 1.5s",
        }}
      />
    </div>
  );
}
