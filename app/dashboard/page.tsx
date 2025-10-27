import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MoodEntryForm } from "@/components/mood-entry-form"
import { MoodCalendar } from "@/components/mood-calendar"
import { MoodHistory } from "@/components/mood-history"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AIAssistant } from "@/components/ai-assistant"

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mood Journal</h1>
          <div className="flex gap-2">
            <Link href="/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
            <Link href="/assistant">
              <Button variant="outline">Assistant</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
            <form action="/auth/logout" method="POST">
              <Button variant="outline" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MoodEntryForm />
            <MoodHistory entries={entries || []} />
          </div>
          <div className="space-y-6">
            <MoodCalendar entries={entries || []} />
            <AIAssistant userMoodContext={entries?.[0] ? `Latest mood: ${entries[0].mood_emoji}` : undefined} />
          </div>
        </div>
      </main>
    </div>
  )
}
