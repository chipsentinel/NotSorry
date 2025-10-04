"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Power, Square, Mic } from "lucide-react";
import { useConversation } from "@elevenlabs/react";

export function AIAssistant() {
  const [aiState, setAIState] = useState("initial"); // initial, requesting-permission, listening, speaking, idle, error
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bars, setBars] = useState(Array(12).fill(0));
  const [currentText, setCurrentText] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Configuración del hook de ElevenLabs
  const conversation = useConversation({
    onConnect: () => {
      console.log("Conectado a ElevenLabs");
      setAIState("idle");
    },
    onDisconnect: () => {
      console.log("Desconectado de ElevenLabs");
      setAIState("initial");
    },
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      if (message.type === "user_transcript") {
        setCurrentText(message.message || "Procesando...");
      } else if (message.type === "agent_response") {
        setCurrentText(message.message || "Respondiendo...");
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      setAIState("error");
      setCurrentText(`Error: ${error.message || "Ocurrió un problema"}`);
    },
    onModeChange: (mode) => {
      console.log("Modo cambiado:", mode);
      setAIState(mode.mode === "speaking" ? "speaking" : "listening");
    },
    onStatusChange: (status) => {
      console.log("Estado cambiado:", status);
      if (status.status === "connected") {
        setAIState("idle");
      } else if (status.status === "disconnected") {
        setAIState("initial");
      }
    },
  });

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Actualizar texto según estado
  useEffect(() => {
    if (aiState === "speaking") {
      if (!currentText || currentText === "En espera...") {
        setCurrentText("Hablando...");
      }
    } else if (aiState === "listening") {
      if (!currentText || currentText === "En espera...") {
        setCurrentText("Te estoy escuchando...");
      }
    } else if (aiState === "idle") {
      setCurrentText("En espera...");
    } else if (aiState === "initial") {
      setCurrentText("¿Necesitas ayuda? Activa el asistente para comenzar.");
    } else if (aiState === "requesting-permission") {
      setCurrentText("Esperando permiso para acceder al micrófono...");
    } else if (aiState === "error" && !currentText.startsWith("Error:")) {
      setCurrentText(
        "Error: No se pudo acceder al micrófono. Verifica los permisos."
      );
    }
  }, [aiState]);

  // Animación de barras
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
          } else if (aiState === "requesting-permission") {
            return 15 + Math.random() * 15;
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
      case "error":
        return {
          border: "border-red-500/60",
          bg: "bg-red-900/30",
          shadow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
          text: "text-red-300",
        };
      case "requesting-permission":
        return {
          border: "border-yellow-400/60",
          bg: "bg-yellow-500/20",
          shadow: "shadow-[0_0_20px_rgba(234,179,8,0.4)]",
          text: "text-yellow-300",
        };
      case "initial":
        return {
          border: "border-purple-500/50",
          bg: "bg-slate-900/80",
          shadow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
          text: "text-purple-300",
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

  const handleActivate = async () => {
    setAIState("requesting-permission");

    try {
      // Solicitar permiso de micrófono
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Iniciar sesión con ElevenLabs
      // IMPORTANTE: Reemplaza 'YOUR_AGENT_ID' con tu Agent ID real
      // O implementa el flujo de autenticación con signedUrl/conversationToken
      await conversation.startSession({
        agentId: "agent_5001k6kf4rcjf4zs4vvxh2vb0tsf", // <-- Cambia esto por tu Agent ID
        connectionType: "webrtc", // o "websocket"
      });

      setAIState("idle");
    } catch (error) {
      console.error("Error al activar:", error);
      setAIState("error");
      setCurrentText(
        `Error: ${error.message || "No se pudo iniciar la conversación"}`
      );
    }
  };

  const handleStop = async () => {
    try {
      await conversation.endSession();
      setAIState("initial");
      setCurrentText("¿Necesitas ayuda? Activa el asistente para comenzar.");
    } catch (error) {
      console.error("Error al detener:", error);
    }
  };

  const handleRetry = () => {
    handleActivate();
  };

  const handleMuteToggle = async () => {
    try {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      await conversation.setVolume({ volume: newMutedState ? 0 : 1 });
    } catch (error) {
      console.error("Error al cambiar volumen:", error);
    }
  };

  const getBarTransform = (index) => {
    const angle = (index / bars.length) * 2 * Math.PI;
    const radius = 20;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const roundedX = Math.round(x * 100) / 100;
    const roundedY = Math.round(y * 100) / 100;
    const rotation = Math.round((angle * 180) / Math.PI + 90);

    return `translate(-50%, -50%) translate(${roundedX}px, ${roundedY}px) rotate(${rotation}deg)`;
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
          {!isHovered && isClient && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {bars.map((height, index) => {
                const barHeight = 8 + (height / 100) * 12;

                return (
                  <div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: getBarTransform(index),
                      width: "2px",
                      height: `${barHeight}px`,
                      background:
                        aiState === "speaking"
                          ? `linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(147, 197, 253, 0.4))`
                          : aiState === "listening"
                          ? `linear-gradient(to top, rgba(34, 197, 94, 0.8), rgba(134, 239, 172, 0.4))`
                          : aiState === "error"
                          ? `linear-gradient(to top, rgba(239, 68, 68, 0.5), rgba(252, 165, 165, 0.2))`
                          : aiState === "requesting-permission"
                          ? `linear-gradient(to top, rgba(234, 179, 8, 0.6), rgba(253, 224, 71, 0.3))`
                          : aiState === "initial"
                          ? `linear-gradient(to top, rgba(168, 85, 247, 0.5), rgba(216, 180, 254, 0.2))`
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
                    {aiState === "initial"
                      ? "Inactivo"
                      : aiState === "error"
                      ? "Error"
                      : aiState === "requesting-permission"
                      ? "Solicitando permiso"
                      : aiState}
                    ...
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
                      : aiState === "error"
                      ? "bg-red-500 animate-pulse"
                      : aiState === "requesting-permission"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-purple-400/50"
                  }`}
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 min-h-16 border border-slate-700/50">
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {currentText}
                </p>
              </div>

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
                          : aiState === "error"
                          ? `linear-gradient(to top, rgba(239, 68, 68, 0.5), rgba(252, 165, 165, 0.2))`
                          : aiState === "requesting-permission"
                          ? `linear-gradient(to top, rgba(234, 179, 8, 0.6), rgba(253, 224, 71, 0.3))`
                          : aiState === "initial"
                          ? `linear-gradient(to top, rgba(168, 85, 247, 0.5), rgba(216, 180, 254, 0.2))`
                          : `linear-gradient(to top, rgba(59, 130, 246, 0.5), rgba(147, 197, 253, 0.2))`,
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {aiState === "initial" ? (
                  <button
                    onClick={handleActivate}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-green-200 transition-colors hover:bg-green-500/20 hover:text-green-100 border border-green-500/30"
                  >
                    <Power className="h-4 w-4" />
                    <span className="font-mono text-xs">Activar</span>
                  </button>
                ) : aiState === "error" ? (
                  <button
                    onClick={handleRetry}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-orange-200 transition-colors hover:bg-orange-500/20 hover:text-orange-100 border border-orange-500/30"
                  >
                    <Mic className="h-4 w-4" />
                    <span className="font-mono text-xs">Reintentar</span>
                  </button>
                ) : aiState === "requesting-permission" ? (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-yellow-200 border border-yellow-500/30 cursor-wait"
                  >
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span className="font-mono text-xs">Esperando...</span>
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
                  onClick={handleMuteToggle}
                  disabled={
                    aiState === "initial" ||
                    aiState === "error" ||
                    aiState === "requesting-permission"
                  }
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border ${
                    aiState === "initial" ||
                    aiState === "error" ||
                    aiState === "requesting-permission"
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
