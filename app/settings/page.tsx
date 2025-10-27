import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RemindersSettings } from "@/components/reminders-settings"
import { AchievementsDisplay } from "@/components/achievements-display"
import { ExportData } from "@/components/export-data"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const [{ data: reminders }, { data: achievements }] = await Promise.all([
    supabase.from("reminders").select("*").eq("user_id", user.id),
    supabase.from("achievements").select("*").eq("user_id", user.id),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <RemindersSettings reminders={reminders || []} />
        <AchievementsDisplay achievements={achievements || []} />
        <ExportData />
      </main>
    </div>
  )
}
