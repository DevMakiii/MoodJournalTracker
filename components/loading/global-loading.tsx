"use client"

import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface GlobalLoadingProps {
  type?: "spinner" | "pulse" | "dots" | "wave" | "compile"
  message?: string
  size?: "sm" | "md" | "lg"
  fullscreen?: boolean
}

export function GlobalLoading({ 
  type = "spinner",
  message,
  size = "md",
  fullscreen = false 
}: GlobalLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(message || getDefaultMessage())

  useEffect(() => {
    if (type === "compile") {
      const messages = [
        "Initializing...",
        "Compiling components...",
        "Optimizing assets...",
        "Building UI...",
        "Preparing data...",
        "Almost ready..."
      ]
      
      let messageIndex = 0
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
        
        setCurrentMessage(messages[messageIndex % messages.length])
        messageIndex++
      }, 100)

      return () => clearInterval(interval)
    }
  }, [type])

  function getDefaultMessage() {
    switch (type) {
      case "compile":
        return "Compiling..."
      case "wave":
        return "Loading..."
      case "dots":
        return "Loading"
      case "pulse":
        return "Loading"
      default:
        return "Loading..."
    }
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const containerClasses = cn(
    "flex flex-col items-center justify-center space-y-4",
    fullscreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
    !fullscreen && "min-h-[200px] py-8"
  )

  const LoadingIndicator = () => {
    switch (type) {
      case "compile":
        return (
          <div className="space-y-4 w-full max-w-xs">
            <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
          </div>
        )
      
      case "wave":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 bg-primary rounded-full animate-wave-bars"
                style={{
                  height: `${20 + i * 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )
      
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse-dot"
                style={{
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        )
      
      case "pulse":
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )
      
      default:
        return <Spinner className="size-8" />
    }
  }

  return (
    <div className={containerClasses}>
      <LoadingIndicator />
      <p className={cn("text-muted-foreground animate-fade-in", sizeClasses[size])}>
        {currentMessage}
      </p>
    </div>
  )
}