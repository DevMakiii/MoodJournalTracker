"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MoodEntry {
  id: string
  created_at: string
  mood_level: number
  mood_emoji: string
  mood_color: string
}

interface MoodCalendarProps {
  entries: MoodEntry[]
}

export function MoodCalendar({ entries }: MoodCalendarProps) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const entriesByDate = useMemo(() => {
    const map = new Map<string, MoodEntry>()
    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toISOString().split("T")[0]
      map.set(date, entry)
    })
    return map
  }, [entries])

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center font-light">Mood Calendar</CardTitle>
        <CardDescription className="text-center">{monthName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-light text-muted-foreground py-1 md:py-2">
                {day.slice(0, 3)}
              </div>
            ))}
            {days.map((day, index) => {
              const dateStr = day ? new Date(currentYear, currentMonth, day).toISOString().split("T")[0] : null
              const entry = dateStr ? entriesByDate.get(dateStr) : null

              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded-lg md:rounded-xl text-xs md:text-sm font-light transition-all duration-300 ${
                    day
                      ? entry
                        ? "bg-accent/50 cursor-pointer hover:bg-accent/70 hover:scale-105 shadow-sm"
                        : "bg-accent/20 text-muted-foreground hover:bg-accent/30"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  {entry ? (
                    <span className="text-lg md:text-xl animate-fade-in">{entry.mood_emoji}</span>
                  ) : day ? (
                    <span className="text-muted-foreground">{day}</span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
