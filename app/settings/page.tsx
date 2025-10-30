import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MoodHeader } from "@/components/mood-header"
import { calculateMoodStreak } from "@/lib/utils"
import { SettingsTabs } from "@/components/settings-tabs"

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
      <div className="flex-1 flex flex-col md:ml-0">
        <MoodHeader latestMood={entries?.[0]} streakCount={streakCount} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <SettingsTabs profile={profile} reminders={reminders || []} />
        </main>
      </div>
    </div>
  )
}
