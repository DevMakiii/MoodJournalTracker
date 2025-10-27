import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">Mood Journal Tracker</h1>
          <p className="text-xl text-gray-600">
            Track your daily mood, discover patterns, and improve your emotional well-being
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">Track Daily Moods</h3>
            <p className="text-sm text-gray-600 mt-2">Log your mood with emojis and notes</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900">Visualize Trends</h3>
            <p className="text-sm text-gray-600 mt-2">See patterns in your emotional well-being</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-900">Get Insights</h3>
            <p className="text-sm text-gray-600 mt-2">Receive personalized affirmations and tips</p>
          </div>
        </div>
      </div>
    </main>
  )
}
