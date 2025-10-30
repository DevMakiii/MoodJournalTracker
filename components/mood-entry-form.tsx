"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useMoodTheme } from "@/components/theme-provider"

const MOODS = [
  { level: 1, emoji: "😢", label: "Terrible", color: "#fca5a5", animation: "" },
  { level: 2, emoji: "😞", label: "Bad", color: "#fdba74", animation: "animate-mood-bad" },
  { level: 3, emoji: "😐", label: "Okay", color: "#fde047", animation: "animate-mood-okay" },
  { level: 4, emoji: "🙂", label: "Good", color: "#bef264", animation: "animate-mood-good" },
  { level: 5, emoji: "😄", label: "Great", color: "#86efac", animation: "animate-mood-great" },
]

export function MoodEntryForm() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setMoodTheme } = useMoodTheme()

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
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Current user:', user)
      console.log('Auth error:', authError)

      const mood = MOODS.find((m) => m.level === selectedMood)!
      console.log('Inserting mood entry with data:', {
        mood_level: selectedMood,
        mood_emoji: mood.emoji,
        mood_color: mood.color,
        notes: notes || null,
        user_id: user?.id
      })

      const { error: insertError } = await supabase.from("mood_entries").insert({
        mood_level: selectedMood,
        mood_emoji: mood.emoji,
        mood_color: mood.color,
        notes: notes || null,
        user_id: user?.id,
      })

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      setSelectedMood(null)
      setNotes("")
      // Apply mood-based theme
      if (selectedMood) {
        setMoodTheme(selectedMood)
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save mood entry")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-lg font-light">How are you feeling today?</CardTitle>
        <CardDescription className="text-center">Take a moment to reflect and track your mood</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-center block">Select your mood</label>
            <div className="flex justify-center gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.level}
                  type="button"
                  onClick={() => setSelectedMood(mood.level)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                    selectedMood === mood.level
                      ? `ring-2 ring-offset-2 ring-primary bg-accent/50 shadow-lg animate-gentle-bounce ${mood.animation}`
                      : "hover:bg-accent/30"
                  }`}
                >
                  <span className="text-4xl animate-fade-in" style={{ animationDelay: `${mood.level * 0.1}s` }}>{mood.emoji}</span>
                  <span className="text-xs text-muted-foreground font-light">{mood.label}</span>
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
              className="min-h-24 resize-none"
            />
          </div>

          {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

          <Button type="submit" className="w-full transition-all duration-300 hover:shadow-md" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              "Save Mood Entry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
