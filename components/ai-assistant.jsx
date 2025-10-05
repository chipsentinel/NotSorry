"use client";

import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Power,
  Square,
  Mic,
  X,
  AlertCircle,
} from "lucide-react";
import { useConversation } from "@elevenlabs/react";

export function AIAssistant({ handleLocationSelect, externalContext = null }) {
  const [aiState, setAIState] = useState("initial");
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bars, setBars] = useState(Array(12).fill(0));
  const [currentText, setCurrentText] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Estados para el modal de código
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showUsageWarning, setShowUsageWarning] = useState(false);

  // Códigos válidos (en producción deberían estar en el backend)
  const VALID_CODES = ["8459", "9012", "2039"];

  // Verificar si ya está autorizado al cargar
  useEffect(() => {
    const authorized = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ai_authorized="));
    if (authorized) {
      setIsAuthorized(true);
    }
  }, []);

  // Configuración del hook de ElevenLabs
  const conversation = useConversation({
    clientTools: {
      showAlert: async (parameters) => {
        try {
          const { message } = parameters;
          alert(message);
          return `Alerta mostrada: ${message}`;
        } catch (error) {
          return `Error al mostrar alerta: ${error.message}`;
        }
      },
      searchLocation: async (parameters) => {
        try {
          const { query, date } = parameters || {};
          const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(
              query
            )}&limit=1`
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [lon, lat] = feature.geometry.coordinates;
            const { name, city, state, country } = feature.properties;
            const locationName = [name || city, state, country]
              .filter(Boolean)
              .join(", ");

            // Si se pasa una fecha opcional, pasarla al handler para que calcule y devuelva resultados
            if (date) {
              try {
                const result = await handleLocationSelect(
                  { name: locationName, lat, lon },
                  date
                );
                // Devolver objeto estructurado para que la IA lo entienda directamente
                return {
                  success: !!(result && result.success),
                  mode: result?.mode || null,
                  location: { name: locationName, lat, lon },
                  date,
                  payload: result?.data || null,
                  raw: result || null,
                  summary:
                    result && result.success
                      ? `Resultados calculados para ${locationName} en ${date} (modo: ${result.mode}).`
                      : `No se pudieron obtener los datos para ${locationName} en ${date}.`,
                };
              } catch (e) {
                return { success: false, error: e.message || "Error" };
              }
            }

            // Si no hay fecha, solo enviar la ubicación al buscador y devolver info simple
            const res = await handleLocationSelect({
              name: locationName,
              lat,
              lon,
            });
            return {
              success: true,
              mode: res?.mode || "unknown",
              location: { name: locationName, lat, lon },
              date: res?.date || null,
              payload: res?.data || null,
              summary: `Ubicación enviada: ${locationName} (${lat.toFixed(
                4
              )}°, ${lon.toFixed(4)}°)`,
            };
          } else {
            return {
              success: false,
              error: `No se encontró la ubicación: ${query}`,
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error al buscar ubicación: ${error.message}`,
          };
        }
      },
      getCurrentLocation: async (parameters) => {
        try {
          const { date } = parameters || {};
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const { name, city, state, country } = feature.properties;
            const locationName = [name || city, state, country]
              .filter(Boolean)
              .join(", ");

            if (date) {
              // Llamar al handler con la fecha para obtener cálculos inmediatos
              try {
                const result = await handleLocationSelect(
                  { name: locationName, lat: latitude, lon: longitude },
                  date
                );
                return {
                  success: !!(result && result.success),
                  mode: result?.mode || null,
                  location: {
                    name: locationName,
                    lat: latitude,
                    lon: longitude,
                  },
                  date,
                  payload: result?.data || null,
                  raw: result || null,
                  summary:
                    result && result.success
                      ? `Ubicación actual enviada: ${locationName} (${latitude.toFixed(
                          4
                        )}°, ${longitude.toFixed(
                          4
                        )}°) y calculados los datos para ${date} (modo: ${
                          result.mode
                        }).`
                      : `Ubicación actual enviada: ${locationName} (${latitude.toFixed(
                          4
                        )}°, ${longitude.toFixed(
                          4
                        )}°). No se pudo obtener cálculos para ${date}.`,
                };
              } catch (e) {
                return { success: false, error: e.message || "Error" };
              }
            } else {
              const res = await handleLocationSelect({
                name: locationName,
                lat: latitude,
                lon: longitude,
              });
              return {
                success: true,
                mode: res?.mode || "unknown",
                location: { name: locationName, lat: latitude, lon: longitude },
                date: res?.date || null,
                payload: res?.data || null,
                summary: `Ubicación actual enviada: ${locationName} (${latitude.toFixed(
                  4
                )}°, ${longitude.toFixed(4)}°)`,
              };
            }
          } else {
            return {
              success: false,
              error: `Ubicación actual: ${latitude.toFixed(
                4
              )}°, ${longitude.toFixed(4)}°`,
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error al obtener ubicación actual: ${error.message}`,
          };
        }
      },
      searchByCoordinates: async (parameters) => {
        try {
          const { latitude, longitude, date } = parameters || {};

          const response = await fetch(
            `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const { name, city, state, country } = feature.properties;
            const locationName = [name || city, state, country]
              .filter(Boolean)
              .join(", ");

            if (date) {
              try {
                const result = await handleLocationSelect(
                  { name: locationName, lat: latitude, lon: longitude },
                  date
                );
                return {
                  success: !!(result && result.success),
                  mode: result?.mode || null,
                  location: {
                    name: locationName,
                    lat: latitude,
                    lon: longitude,
                  },
                  date,
                  payload: result?.data || null,
                  raw: result || null,
                  summary:
                    result && result.success
                      ? `Ubicación encontrada: ${locationName} (${latitude.toFixed(
                          4
                        )}°, ${longitude.toFixed(
                          4
                        )}°). Datos calculados (modo: ${result.mode}).`
                      : `Ubicación encontrada: ${locationName} (${latitude.toFixed(
                          4
                        )}°, ${longitude.toFixed(
                          4
                        )}°). No se pudieron calcular datos para ${date}.`,
                };
              } catch (e) {
                return { success: false, error: e.message || "Error" };
              }
            } else {
              const res = await handleLocationSelect({
                name: locationName,
                lat: latitude,
                lon: longitude,
              });
              return {
                success: true,
                mode: res?.mode || "unknown",
                location: { name: locationName, lat: latitude, lon: longitude },
                date: res?.date || null,
                payload: res?.data || null,
                summary: `Ubicación encontrada: ${locationName} (${latitude.toFixed(
                  4
                )}°, ${longitude.toFixed(4)}°).`,
              };
            }
          } else {
            const res = await handleLocationSelect({
              name: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
              lat: latitude,
              lon: longitude,
            });
            return {
              success: true,
              mode: res?.mode || "unknown",
              location: {
                name:
                  res?.location?.name ||
                  `${latitude.toFixed(4)},${longitude.toFixed(4)}`,
                lat: latitude,
                lon: longitude,
              },
              date: res?.date || null,
              payload: res?.data || null,
              summary: `Coordenadas establecidas: ${latitude.toFixed(
                4
              )}°, ${longitude.toFixed(4)}°`,
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error al buscar por coordenadas: ${error.message}`,
          };
        }
      },
    },
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

  useEffect(() => {
    if (!externalContext) return;

    const ctxString =
      typeof externalContext === "string"
        ? externalContext
        : JSON.stringify(externalContext);

    try {
      if (
        conversation &&
        typeof conversation.sendSystemMessage === "function"
      ) {
        conversation
          .sendSystemMessage({ message: ctxString })
          .catch((e) => console.error("sendSystemMessage error:", e));
      } else if (
        conversation &&
        typeof conversation.sendMessage === "function"
      ) {
        conversation
          .sendMessage({ role: "system", content: ctxString })
          .catch((e) => console.error("sendMessage error:", e));
      } else {
        console.log("External context (no conversation API):", ctxString);
      }
    } catch (err) {
      console.error("Error forwarding externalContext:", err);
    }
  }, [externalContext]);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const validateCode = (code) => {
    if (VALID_CODES.includes(code)) {
      // Mostrar advertencia de uso antes de autorizar
      setShowUsageWarning(true);
    } else {
      setCodeError(
        "Código incorrecto. Por favor, verifica e intenta de nuevo."
      );
    }
  };

  const confirmActivation = async () => {
    // Guardar en cookie por 365 días
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365);
    document.cookie = `ai_authorized=true; expires=${expiryDate.toUTCString()}; path=/`;
    setIsAuthorized(true);
    setShowCodeModal(false);
    setShowUsageWarning(false);
    setCodeError("");

    // Llamar directamente a la activación sin pasar por handleActivate
    setAIState("requesting-permission");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "agent_2201k6tsr144egrbnaz1td85yrxk",
        connectionType: "webrtc",
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

  const handleEmailSubmit = () => {
    if (emailInput && emailInput.includes("@")) {
      // Aquí se enviaría el email al backend
      console.log("Email enviado:", emailInput);
      setEmailSubmitted(true);
      setTimeout(() => {
        setShowCodeModal(false);
        setEmailSubmitted(false);
        setEmailInput("");
      }, 3000);
    }
  };

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
    if (!isAuthorized) {
      setShowCodeModal(true);
      return;
    }

    setAIState("requesting-permission");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "agent_2201k6tsr144egrbnaz1td85yrxk",
        connectionType: "webrtc",
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
    <>
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
                    <p
                      className={`font-mono text-xs ${colors.text} capitalize`}
                    >
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
                      <span className="font-mono text-xs">Activate</span>
                    </button>
                  ) : aiState === "error" ? (
                    <button
                      onClick={handleRetry}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-orange-200 transition-colors hover:bg-orange-500/20 hover:text-orange-100 border border-orange-500/30"
                    >
                      <Mic className="h-4 w-4" />
                      <span className="font-mono text-xs">Retry</span>
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
                      <span className="font-mono text-xs">Stop</span>
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

      {/* Modal de código de acceso */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
          <div
            className="relative w-full max-w-4xl mx-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              animation: "slideIn 0.4s ease-out",
            }}
          >
            <button
              onClick={() => {
                setShowCodeModal(false);
                setCodeError("");
                setEmailSubmitted(false);
                setShowUsageWarning(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {!showUsageWarning ? (
              <div className="grid md:grid-cols-2 divide-x divide-slate-700/50">
                {/* Sección izquierda - Código de acceso */}
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-100">
                      Acceso al Asistente IA
                    </h2>
                    <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                      <p className="text-xs font-mono text-blue-300">
                        MENSAJE IMPORTANTE
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Debido al alto consumo de tokens por el extenso contexto
                      de datos climáticos, el acceso a la IA está reservado para
                      jueces y testers autorizados del concurso NASA Space Apps
                      Challenge 2025.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-300 mb-2 block">
                        Código de acceso (4 dígitos)
                      </span>
                      <input
                        type="text"
                        maxLength={4}
                        value={codeInput}
                        onChange={(e) => {
                          setCodeInput(e.target.value.replace(/\D/g, ""));
                          setCodeError("");
                        }}
                        placeholder="••••"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-center text-2xl font-mono tracking-widest text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </label>

                    {codeError && (
                      <p className="text-sm text-red-400 text-center">
                        {codeError}
                      </p>
                    )}

                    <button
                      onClick={() => validateCode(codeInput)}
                      disabled={codeInput.length !== 4}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      Validar código
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-center text-slate-500">
                      Disculpa las molestias. Esto nos ayuda a mantener el
                      servicio disponible para todos.
                    </p>
                  </div>
                </div>

                {/* Sección derecha - Solicitar código */}
                <div className="p-8 space-y-6 bg-slate-800/30">
                  {!emailSubmitted ? (
                    <>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-100">
                          Solicitar código
                        </h2>
                        <p className="text-sm text-slate-400">
                          Jurado o tester autorizado
                        </p>
                      </div>

                      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          Si eres jurado o tester del concurso, envía tu
                          solicitud de código de acceso a:
                        </p>
                        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3">
                          <p className="text-sm font-mono text-blue-300 text-center">
                            rubenmoraleszgz@gmail.com
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Estamos atentos a este correo para responder lo más
                          rápido posible.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          window.location.href =
                            "mailto:rubenmoraleszgz@gmail.com?subject=Solicitud de código - NASA Space Apps&body=Hola, soy jurado/tester del concurso NASA Space Apps Challenge 2025 y solicito un código de acceso al asistente IA.%0A%0AMi nombre:%0AMi rol (jurado/tester):%0A%0AGracias.";
                          setEmailSubmitted(true);
                        }}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Abrir cliente de correo
                      </button>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-blue-300 leading-relaxed">
                          💡 Al hacer clic se abrirá tu cliente de correo con un
                          mensaje predefinido. También puedes copiar el correo y
                          escribirnos directamente.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                        <svg
                          className="w-8 h-8 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="space-y-2 text-center">
                        <h3 className="text-xl font-semibold text-slate-100">
                          Cliente de correo abierto
                        </h3>
                        <p className="text-sm text-slate-400 max-w-sm">
                          Envía el correo y recibirás un código de acceso lo más
                          pronto posible.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Modal de advertencia de uso
              <div className="p-8 max-w-2xl mx-auto space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-slate-100">
                      Uso responsable del asistente
                    </h2>
                    <p className="text-sm text-slate-400">
                      Por favor, lee esta información importante
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                        1
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed flex-1">
                        <span className="font-semibold text-slate-200">
                          Usa la IA solo cuando sea necesario.
                        </span>{" "}
                        El asistente consume recursos significativos debido al
                        extenso contexto de datos climáticos que debe procesar.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                        2
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed flex-1">
                        <span className="font-semibold text-slate-200">
                          Desactiva el asistente cuando termines.
                        </span>{" "}
                        Por favor, detén la sesión cuando no lo estés usando
                        activamente para liberar recursos.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                        3
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed flex-1">
                        <span className="font-semibold text-slate-200">
                          Queremos que todos puedan probarlo.
                        </span>{" "}
                        Tu uso responsable ayuda a garantizar que todos los
                        jueces y testers tengan acceso al asistente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300 leading-relaxed text-center">
                    💙 Gracias por tu comprensión y colaboración
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowUsageWarning(false)}
                    className="flex-1 py-3 border border-slate-600 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={confirmActivation}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Entendido, activar asistente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
