import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Journal Assistant</h1>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIAssistant userMoodContext={moodContext} />
      </main>
    </div>
  )
}
