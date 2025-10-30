import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MoodHistory } from "@/components/mood-history"
import { Sidebar } from "@/components/sidebar"
import { MoodHeader } from "@/components/mood-header"
import { LoadingWrapper } from "@/components/loading/loading-wrapper"
import { MoodHistorySkeleton } from "@/components/loading/skeletons"
import { calculateMoodStreak } from "@/lib/utils"

export default async function EntriesPage() {
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
    console.error("Error details:", JSON.stringify(entriesError, null, 2))
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const streakCount = calculateMoodStreak(entries || [])

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      <Sidebar currentPage="/entries" />
      <div className="flex-1 flex flex-col">
        <MoodHeader latestMood={entries?.[0]} streakCount={streakCount} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-slide-up">
            <LoadingWrapper fallback={<MoodHistorySkeleton />}>
              <MoodHistory entries={entries || []} />
            </LoadingWrapper>
          </div>
        </main>
      </div>
    </div>
  )
}