"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"

type AIState = "listening" | "speaking" | "idle"

export function AIAssistant() {
  const [aiState, setAIState] = useState<AIState>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [bars, setBars] = useState<number[]>(Array(12).fill(0))

  useEffect(() => {
    const stateInterval = setInterval(() => {
      setAIState((prev) => {
        if (prev === "idle") return "listening"
        if (prev === "listening") return "speaking"
        return "idle"
      })
    }, 4000)

    return () => clearInterval(stateInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => {
          if (aiState === "speaking") {
            // High energy animation for speaking
            return Math.random() * 100
          } else if (aiState === "listening") {
            // Medium energy animation for listening
            return Math.random() * 60
          } else {
            // Gentle idle animation
            return 20 + Math.random() * 20
          }
        }),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [aiState])

  const getStateColors = () => {
    switch (aiState) {
      case "speaking":
        return {
          border: "border-blue-400",
          bg: "bg-blue-500/20",
          shadow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
          text: "text-blue-300",
        }
      case "listening":
        return {
          border: "border-green-400",
          bg: "bg-green-500/20",
          shadow: "shadow-[0_0_20px_rgba(34,197,94,0.5)]",
          text: "text-green-300",
        }
      default:
        return {
          border: "border-blue-500/40",
          bg: "bg-slate-900/80",
          shadow: "",
          text: "text-blue-400/70",
        }
    }
  }

  const colors = getStateColors()

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
              ? "rounded-2xl border-2 bg-slate-900/95 backdrop-blur-xl p-4 shadow-xl w-64"
              : `h-16 w-16 rounded-full border-2 ${colors.border} ${colors.bg} ${colors.shadow} backdrop-blur-xl`
          }`}
        >
          {/* Circular waveform bars - only show when not hovered */}
          {!isHovered && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {bars.map((height, index) => {
                const angle = (index / bars.length) * 2 * Math.PI
                const radius = 20
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                const barHeight = 8 + (height / 100) * 12

                return (
                  <div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${(angle * 180) / Math.PI + 90}deg)`,
                      width: "2px",
                      height: `${barHeight}px`,
                      background:
                        aiState === "speaking"
                          ? `linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(147, 197, 253, 0.4))`
                          : aiState === "listening"
                            ? `linear-gradient(to top, rgba(34, 197, 94, 0.8), rgba(134, 239, 172, 0.4))`
                            : `linear-gradient(to top, rgba(59, 130, 246, 0.5), rgba(147, 197, 253, 0.2))`,
                      borderRadius: "1px",
                      transition: "height 0.05s ease-out",
                    }}
                  />
                )
              })}
            </div>
          )}

          {isHovered ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-semibold text-blue-200">AI Assistant</h3>
                  <p className={`font-mono text-xs ${colors.text} capitalize`}>{aiState}...</p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    aiState === "speaking"
                      ? "bg-blue-400 animate-pulse"
                      : aiState === "listening"
                        ? "bg-green-400 animate-pulse"
                        : "bg-blue-400/50"
                  }`}
                />
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
                            : `linear-gradient(to top, rgba(59, 130, 246, 0.5), rgba(147, 197, 253, 0.2))`,
                    }}
                  />
                ))}
              </div>

              {/* Mute button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-200 transition-colors hover:bg-blue-500/20 hover:text-blue-100 border border-blue-500/30"
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
          ) : null}
        </div>
      </div>
    </div>
  )
}
