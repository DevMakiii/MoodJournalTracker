"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Mood Entries</CardTitle>
        <CardDescription>Your mood history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEntries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No mood entries yet. Start tracking your mood!</p>
          ) : (
            sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-4 flex-1">
                  <span className="text-3xl">{entry.mood_emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === entry.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
