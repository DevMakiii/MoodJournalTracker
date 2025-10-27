import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MoodStats } from "@/components/mood-stats"
import { MoodChart } from "@/components/mood-chart"
import { MoodInsights } from "@/components/mood-insights"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MoodStats entries={entries || []} />
        <MoodChart entries={entries || []} />
        <MoodInsights entries={entries || []} />
      </main>
    </div>
  )
}
