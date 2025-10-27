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
    <Card>
      <CardHeader>
        <CardTitle>Mood Calendar</CardTitle>
        <CardDescription>{monthName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dateStr = day ? new Date(currentYear, currentMonth, day).toISOString().split("T")[0] : null
              const entry = dateStr ? entriesByDate.get(dateStr) : null

              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                    day ? (entry ? "bg-gray-100 cursor-pointer hover:opacity-80" : "bg-gray-50 text-gray-400") : ""
                  }`}
                >
                  {entry ? (
                    <span className="text-xl">{entry.mood_emoji}</span>
                  ) : day ? (
                    <span className="text-gray-400">{day}</span>
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
