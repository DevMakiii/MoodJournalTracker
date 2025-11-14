import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MoodEntryForm } from "@/components/mood-entry-form"
import { MoodCalendar } from "@/components/mood-calendar"
import { MoodHistory } from "@/components/mood-history"
import { Sidebar } from "@/components/sidebar"
import { MoodHeader } from "@/components/mood-header"
import { LoadingWrapper } from "@/components/loading/loading-wrapper"
import {
  DashboardSkeleton,
  MoodEntrySkeleton,
  MoodHistorySkeleton,
  CalendarSkeleton
} from "@/components/loading/skeletons"
import { calculateMoodStreak } from "@/lib/utils"

export default async function DashboardPage() {
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

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Create profile if it doesn't exist
  if (!profile) {
    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name
    if (firstName && lastName) {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`.trim(),
        })
      if (error) {
        console.error('Error creating profile in dashboard:', error)
      } else {
        // Refetch profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        profile = newProfile
      }
    }
  }

  const streakCount = calculateMoodStreak(entries || [])

  const getMoodGradient = () => {
    if (!entries || entries.length === 0) {
      return "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    }

    const latestMood = entries[0].mood_level
    switch (latestMood) {
      case 1:
        return "bg-gradient-to-br from-rose-50 via-pink-50 to-slate-50"
      case 2:
        return "bg-gradient-to-br from-orange-50 via-amber-50 to-slate-50"
      case 3:
        return "bg-gradient-to-br from-yellow-50 via-lime-50 to-slate-50"
      case 4:
        return "bg-gradient-to-br from-green-50 via-emerald-50 to-slate-50"
      case 5:
        return "bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50"
      default:
        return "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    }
  }

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      <Sidebar currentPage="/dashboard" />
      <div className="flex-1 flex flex-col md:ml-0">
        <MoodHeader latestMood={entries?.[0]} streakCount={streakCount} profile={profile} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 lg:col-span-2 space-y-4 md:space-y-6">
              <div className="animate-slide-up">
                <LoadingWrapper fallback={<MoodEntrySkeleton />}>
                  <MoodEntryForm />
                </LoadingWrapper>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <LoadingWrapper fallback={<MoodHistorySkeleton />}>
                  <MoodHistory entries={entries || []} />
                </LoadingWrapper>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <LoadingWrapper fallback={<CalendarSkeleton />}>
                  <MoodCalendar entries={entries || []} />
                </LoadingWrapper>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
