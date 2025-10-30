"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface MoodHeaderProps {
  latestMood?: {
    mood_level: number
    mood_emoji: string
    created_at: string
  }
  streakCount?: number
  profile?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

const quotes = [
  "Every day is a new beginning.",
  "Your mood is your choice.",
  "Small steps lead to big changes.",
  "Be kind to yourself today.",
  "Gratitude turns what we have into enough.",
  "You are stronger than you think.",
  "Progress, not perfection.",
  "Mindfulness is the key to happiness.",
  "Embrace the journey.",
  "One day at a time."
]

export function MoodHeader({ latestMood, streakCount = 0, profile }: MoodHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [quote, setQuote] = useState('')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getMoodColor = (level?: number) => {
    switch (level) {
      case 1: return "text-red-600 bg-red-50 border-red-200"
      case 2: return "text-orange-600 bg-orange-50 border-orange-200"
      case 3: return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case 4: return "text-green-600 bg-green-50 border-green-200"
      case 5: return "text-blue-600 bg-blue-50 border-blue-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <header className="bg-card/50 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {latestMood && (
        <div className={`px-2 md:px-3 py-1 rounded-full border text-xs md:text-sm flex-shrink-0 hidden md:flex ${getMoodColor(latestMood.mood_level)}`}>
          <span className="text-base md:text-lg mr-1 md:mr-2">{latestMood.mood_emoji}</span>
          <span className="font-medium">Level {latestMood.mood_level}</span>
        </div>
      )}

      <div className="flex-1 text-center min-w-0 md:text-left md:flex-1">
        <h1 className="text-base md:text-lg font-semibold font-serif truncate hidden md:block">{getGreeting()}!</h1>
        <p className="text-xs md:text-sm text-muted-foreground italic block">{quote}</p>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {profile && (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden sm:block">
              <h2 className="text-xs md:text-sm font-medium">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-xs text-muted-foreground">Welcome back</p>
            </div>
            <Avatar className="size-8 md:size-10">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={`${profile.first_name} ${profile.last_name}`}
                onError={(e) => {
                  console.error('Avatar image failed to load:', profile.avatar_url);
                  // Hide the broken image
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <AvatarFallback className="text-xs md:text-sm">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {streakCount > 0 && (
          <Badge variant="secondary" className="gap-1 text-xs md:text-sm">
            🔥 {streakCount} day streak
          </Badge>
        )}
      </div>
    </header>
  )
}