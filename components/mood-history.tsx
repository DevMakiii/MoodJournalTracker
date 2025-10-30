"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Sprout, Trash2 } from "lucide-react"

interface MoodEntry {
  id: string
  created_at: string
  mood_level: number
  mood_emoji: string
  mood_color: string
  notes: string | null
}

interface MoodHistoryProps {
  entries: MoodEntry[]
}

export function MoodHistory({ entries }: MoodHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    setDeletingId(id)

    try {
      const { error } = await supabase.from("mood_entries").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error("Failed to delete entry:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const inspirationalQuotes = [
    "Every storm runs out of rain.",
    "You are stronger than you know.",
    "This too shall pass.",
    "Small steps lead to big changes.",
    "Your feelings are valid.",
  ]

  const [randomQuote, setRandomQuote] = useState<string>("")

  useEffect(() => {
    // Use a seeded random based on current date to ensure server/client consistency
    const today = new Date().toDateString()
    let hash = 0
    for (let i = 0; i < today.length; i++) {
      const char = today.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    const seed = Math.abs(hash) % inspirationalQuotes.length
    setRandomQuote(inspirationalQuotes[seed])
  }, [])

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center font-light">Recent Mood Entries</CardTitle>
        <CardDescription className="text-center">Your journey of self-reflection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Sprout className="w-16 h-16 opacity-50 animate-gentle-bounce mx-auto" />
              <p className="text-sm text-muted-foreground">No mood entries yet. Start your journey of self-discovery!</p>
              <p className="text-xs text-muted-foreground italic">
                "{randomQuote}"
              </p>
            </div>
          ) : (
            sortedEntries.slice(0, 3).map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 bg-accent/30 rounded-xl hover:bg-accent/50 transition-all duration-300 animate-slide-up border border-accent/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4 flex-1">
                  <span className="text-3xl animate-fade-in">{entry.mood_emoji}</span>
                  <div className="flex-1">
                    <p className="font-light text-foreground">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {entry.notes && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{entry.notes}</p>}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === entry.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                    >
                      {deletingId === entry.id ? (
                        <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Mood Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this mood entry? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(entry.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
