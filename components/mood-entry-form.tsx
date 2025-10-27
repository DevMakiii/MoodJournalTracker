"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

const MOODS = [
  { level: 1, emoji: "😢", label: "Terrible", color: "#ef4444" },
  { level: 2, emoji: "😞", label: "Bad", color: "#f97316" },
  { level: 3, emoji: "😐", label: "Okay", color: "#eab308" },
  { level: 4, emoji: "🙂", label: "Good", color: "#84cc16" },
  { level: 5, emoji: "😄", label: "Great", color: "#22c55e" },
]

export function MoodEntryForm() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood) {
      setError("Please select a mood")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const mood = MOODS.find((m) => m.level === selectedMood)!
      const { error: insertError } = await supabase.from("mood_entries").insert({
        mood_level: selectedMood,
        mood_emoji: mood.emoji,
        mood_color: mood.color,
        notes: notes || null,
      })

      if (insertError) throw insertError

      setSelectedMood(null)
      setNotes("")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save mood entry")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
        <CardDescription>Track your mood and add notes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Select your mood</label>
            <div className="flex justify-between gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.level}
                  type="button"
                  onClick={() => setSelectedMood(mood.level)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                    selectedMood === mood.level ? "ring-2 ring-offset-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-600">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="What's on your mind? What triggered this mood?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Mood Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
