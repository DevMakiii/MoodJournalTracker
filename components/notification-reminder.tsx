"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Bell } from "lucide-react"

interface NotificationReminderProps {
  reminders: Array<{
    id: string
    time: string
    enabled: boolean
  }>
}

export function NotificationReminder({ reminders }: NotificationReminderProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ("Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return

    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const scheduleNotifications = () => {
    if (permission !== "granted") return

    // For demo purposes, we'll use setTimeout for scheduling
    // In production, consider using service workers for more reliable scheduling
    reminders
      .filter(r => r.enabled)
      .forEach(reminder => {
        const [hours, minutes] = reminder.time.split(":").map(Number)
        const now = new Date()
        const reminderTime = new Date()
        reminderTime.setHours(hours, minutes, 0, 0)

        if (reminderTime < now) {
          reminderTime.setDate(reminderTime.getDate() + 1)
        }

        const delay = reminderTime.getTime() - now.getTime()

        setTimeout(() => {
          new Notification("Serenote Reminder", {
            body: "How are you feeling today?",
            icon: "/placeholder-logo.png",
            tag: `mood-reminder-${reminder.id}`
          })
        }, delay)
      })
  }

  useEffect(() => {
    if (permission === "granted" && reminders.length > 0) {
      scheduleNotifications()
    }
  }, [permission, reminders])

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Browser Notifications</CardTitle>
          <CardDescription>Browser notifications are not supported in this browser</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Notifications</CardTitle>
        <CardDescription>Get reminded via browser notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {permission === "granted" ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span>Notifications enabled. You'll receive reminders at your set times.</span>
          </div>
        ) : permission === "denied" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <X className="w-4 h-4" />
              <span>Notifications blocked. Please enable them in your browser settings.</span>
            </div>
            <Button onClick={requestPermission} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <Button onClick={requestPermission}>
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        )}
      </CardContent>
    </Card>
  )
}