"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface Reminder {
  id: string
  time: string
  enabled: boolean
}

interface RemindersSettingsProps {
  reminders: Reminder[]
}

export function RemindersSettings({ reminders }: RemindersSettingsProps) {
  const [remindersList, setRemindersList] = useState<Reminder[]>(reminders)
  const [newTime, setNewTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddReminder = async () => {
    if (!newTime) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("reminders").insert({
        time: newTime,
        enabled: true,
      })

      if (error) throw error

      setNewTime("")
      router.refresh()
    } catch (err) {
      console.error("Error adding reminder:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("reminders").update({ enabled: !enabled }).eq("id", id)

      if (error) throw error

      setRemindersList((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)))
      router.refresh()
    } catch (err) {
      console.error("Error updating reminder:", err)
    }
  }

  const handleDeleteReminder = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id)

      if (error) throw error

      setRemindersList((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } catch (err) {
      console.error("Error deleting reminder:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Reminders</CardTitle>
        <CardDescription>Set reminders to track your mood regularly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reminder-time">Add a new reminder</Label>
          <div className="flex gap-2">
            <Input
              id="reminder-time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleAddReminder} disabled={isLoading || !newTime}>
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Your reminders</h3>
          {remindersList.length === 0 ? (
            <p className="text-sm text-gray-500">No reminders set yet</p>
          ) : (
            <div className="space-y-2">
              {remindersList.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={() => handleToggleReminder(reminder.id, reminder.enabled)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{reminder.time}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
