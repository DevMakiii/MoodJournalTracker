import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AIAssistant } from "@/components/ai-assistant"
import { Sidebar } from "@/components/sidebar"
import { MoodHeader } from "@/components/mood-header"
import { calculateMoodStreak } from "@/lib/utils"

export default async function AssistantPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get latest mood entry for context
  const { data: latestEntry } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const moodContext = latestEntry
    ? `Your latest mood was ${latestEntry.mood_emoji} (${latestEntry.mood_level}/5)${latestEntry.notes ? ` with notes: ${latestEntry.notes}` : ""}`
    : undefined

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const streakCount = calculateMoodStreak([latestEntry].filter(Boolean))

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      <Sidebar currentPage="/assistant" />
      <div className="flex-1 flex flex-col">
        <MoodHeader latestMood={latestEntry} streakCount={streakCount} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4">
          <AIAssistant userMoodContext={moodContext} />
        </main>
      </div>
    </div>
  )
}
