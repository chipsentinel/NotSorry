"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Power, Square } from "lucide-react";

type AIState = "listening" | "speaking" | "idle" | "stopped";

export function AIAssistant() {
  const [aiState, setAIState] = useState<AIState>("stopped");
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(12).fill(0));
  const [currentText, setCurrentText] = useState("");

  // Textos simulados que la IA está diciendo
  const speakingTexts = [
    "Procesando tu solicitud...",
    "He encontrado información relevante sobre tu consulta.",
    "Basándome en los datos, te recomiendo...",
    "¿Necesitas que profundice en algún aspecto?",
  ];

  const listeningTexts = [
    "Te estoy escuchando...",
    "Continúa, estoy atento...",
    "Entiendo, sigue por favor...",
    "Procesando tu voz...",
  ];

  useEffect(() => {
    if (aiState === "stopped") return;

    const stateInterval = setInterval(() => {
      setAIState((prev) => {
        if (prev === "idle") return "listening";
        if (prev === "listening") return "speaking";
        return "idle";
      });
    }, 4000);

    return () => clearInterval(stateInterval);
  }, [aiState]);

  useEffect(() => {
    if (aiState === "speaking") {
      setCurrentText(
        speakingTexts[Math.floor(Math.random() * speakingTexts.length)]
      );
    } else if (aiState === "listening") {
      setCurrentText(
        listeningTexts[Math.floor(Math.random() * listeningTexts.length)]
      );
    } else if (aiState === "idle") {
      setCurrentText("En espera...");
    } else {
      setCurrentText("IA detenida. Activa el asistente para comenzar.");
    }
  }, [aiState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => {
          if (aiState === "speaking") {
            return Math.random() * 100;
          } else if (aiState === "listening") {
            return Math.random() * 60;
          } else if (aiState === "idle") {
            return 20 + Math.random() * 20;
          } else {
            return 10;
          }
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [aiState]);

  const getStateColors = () => {
    switch (aiState) {
      case "speaking":
        return {
          border: "border-blue-400",
          bg: "bg-blue-500/20",
          shadow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
          text: "text-blue-300",
        };
      case "listening":
        return {
          border: "border-green-400",
          bg: "bg-green-500/20",
          shadow: "shadow-[0_0_20px_rgba(34,197,94,0.5)]",
          text: "text-green-300",
        };
      case "stopped":
        return {
          border: "border-red-500/40",
          bg: "bg-slate-900/80",
          shadow: "",
          text: "text-red-400/70",
        };
      default:
        return {
          border: "border-blue-500/40",
          bg: "bg-slate-900/80",
          shadow: "",
          text: "text-blue-400/70",
        };
    }
  };

  const colors = getStateColors();

  const handleActivate = () => {
    setAIState("idle");
  };

  const handleStop = () => {
    setAIState("stopped");
  };

  return (
    <div
      className="fixed right-6 top-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div
          className={`relative transition-all duration-300 ${
            isHovered
              ? "border-2 bg-slate-900/95 backdrop-blur-xl p-4 shadow-xl w-80"
              : `h-16 w-16 border-2 ${colors.border} ${colors.bg} ${colors.shadow} backdrop-blur-xl`
          }`}
          style={{
            borderRadius: isHovered ? "1rem" : "50%",
          }}
        >
          {!isHovered && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {bars.map((height, index) => {
                const angle = (index / bars.length) * 2 * Math.PI;
                const radius = 20;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const barHeight = 8 + (height / 100) * 12;

                return (
                  <div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${
                        (angle * 180) / Math.PI + 90
                      }deg)`,
                      width: "2px",
                      height: `${barHeight}px`,
                      background:
                        aiState === "speaking"
                          ? `linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(147, 197, 253, 0.4))`
                          : aiState === "listening"
                          ? `linear-gradient(to top, rgba(34, 197, 94, 0.8), rgba(134, 239, 172, 0.4))`
                          : aiState === "stopped"
                          ? `linear-gradient(to top, rgba(239, 68, 68, 0.3), rgba(252, 165, 165, 0.1))`
                          : `linear-gradient(to top, rgba(59, 130, 246, 0.5), rgba(147, 197, 253, 0.2))`,
                      borderRadius: "1px",
                      transition: "height 0.05s ease-out",
                    }}
                  />
                );
              })}
            </div>
          )}

          {isHovered ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-semibold text-blue-200">
                    AI Assistant
                  </h3>
                  <p className={`font-mono text-xs ${colors.text} capitalize`}>
                    {aiState === "stopped" ? "Detenida" : aiState}...
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    aiState === "speaking"
                      ? "bg-blue-400 animate-pulse"
                      : aiState === "listening"
                      ? "bg-green-400 animate-pulse"
                      : aiState === "idle"
                      ? "bg-blue-400/50"
                      : "bg-red-500/50"
                  }`}
                />
              </div>

              {/* Texto de transcripción */}
              <div className="bg-slate-800/50 rounded-lg p-3 min-h-16 border border-slate-700/50">
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {currentText}
                </p>
              </div>

              {/* Horizontal waveform for card view */}
              <div className="flex items-center justify-center gap-1 h-12">
                {bars.map((height, index) => (
                  <div
                    key={index}
                    className="w-1 rounded-full transition-all duration-75"
                    style={{
                      height: `${20 + (height / 100) * 32}px`,
                      background:
                        aiState === "speaking"
                          ? `linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(147, 197, 253, 0.4))`
                          : aiState === "listening"
                          ? `linear-gradient(to top, rgba(34, 197, 94, 0.8), rgba(134, 239, 172, 0.4))`
                          : aiState === "stopped"
                          ? `linear-gradient(to top, rgba(239, 68, 68, 0.3), rgba(252, 165, 165, 0.1))`
                          : `linear-gradient(to top, rgba(59, 130, 246, 0.5), rgba(147, 197, 253, 0.2))`,
                    }}
                  />
                ))}
              </div>

              {/* Control buttons */}
              <div className="flex gap-2">
                {aiState === "stopped" ? (
                  <button
                    onClick={handleActivate}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-green-200 transition-colors hover:bg-green-500/20 hover:text-green-100 border border-green-500/30"
                  >
                    <Power className="h-4 w-4" />
                    <span className="font-mono text-xs">Activar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/20 hover:text-red-100 border border-red-500/30"
                  >
                    <Square className="h-4 w-4" />
                    <span className="font-mono text-xs">Detener</span>
                  </button>
                )}

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={aiState === "stopped"}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border ${
                    aiState === "stopped"
                      ? "text-slate-500 border-slate-700/30 cursor-not-allowed"
                      : "text-blue-200 border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-100"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="h-4 w-4" />
                      <span className="font-mono text-xs">Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span className="font-mono text-xs">Mute</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
