import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RemindersSettings } from "@/components/reminders-settings"
import { AchievementsDisplay } from "@/components/achievements-display"
import { ExportData } from "@/components/export-data"
import { NotificationReminder } from "@/components/notification-reminder"
import { ProfileSettings } from "@/components/profile-settings"
import { Sidebar } from "@/components/sidebar"
import { MoodHeader } from "@/components/mood-header"
import { calculateMoodStreak } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const [{ data: reminders }, { data: achievements }, { data: profile }, { data: entries }] = await Promise.all([
    supabase.from("reminders").select("*").eq("user_id", user.id),
    supabase.from("achievements").select("*").eq("user_id", user.id),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("mood_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
  ])

  const streakCount = calculateMoodStreak(entries || [])

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      <Sidebar currentPage="/settings" />
      <div className="flex-1 flex flex-col">
        <MoodHeader latestMood={entries?.[0]} streakCount={streakCount} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="reminders">Daily Reminders</TabsTrigger>
              <TabsTrigger value="notifications">Browser Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-6 mt-6">
              <ProfileSettings profile={profile} />
            </TabsContent>
            <TabsContent value="reminders" className="space-y-6 mt-6">
              <RemindersSettings reminders={reminders || []} />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <NotificationReminder reminders={reminders || []} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
