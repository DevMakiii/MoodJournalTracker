import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MoodStats } from "@/components/mood-stats"
import { MoodChart } from "@/components/mood-chart"
import { MoodInsights } from "@/components/mood-insights"
import { Sidebar } from "@/components/sidebar"
import { MoodHeader } from "@/components/mood-header"
import { calculateMoodStreak } from "@/lib/utils"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: entries, error: entriesError } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (entriesError) {
    console.error("Error fetching entries:", entriesError)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const streakCount = calculateMoodStreak(entries || [])

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      <Sidebar currentPage="/analytics" />
      <div className="flex-1 flex flex-col md:ml-0">
        <MoodHeader latestMood={entries?.[0]} streakCount={streakCount} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
          <MoodStats entries={entries || []} />
          <MoodChart entries={entries || []} />
          <MoodInsights entries={entries || []} />
        </main>
      </div>
    </div>
  )
}
