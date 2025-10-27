import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "json"

    // Fetch all user data
    const [{ data: entries }, { data: achievements }, { data: profile }] = await Promise.all([
      supabase.from("mood_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("achievements").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      profile: profile,
      moodEntries: entries || [],
      achievements: achievements || [],
    }

    if (format === "csv") {
      // Convert to CSV
      let csv = "Date,Time,Mood Level,Mood Emoji,Notes\n"

      if (entries) {
        entries.forEach((entry) => {
          const date = new Date(entry.created_at)
          const dateStr = date.toLocaleDateString()
          const timeStr = date.toLocaleTimeString()
          const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : ""
          csv += `${dateStr},${timeStr},${entry.mood_level},${entry.mood_emoji},${notes}\n`
        })
      }

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="mood-journal-export.csv"',
        },
      })
    } else {
      // JSON format
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="mood-journal-export.json"',
        },
      })
    }
  } catch (error) {
    console.error("Export Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to export data",
      }),
      { status: 500 },
    )
  }
}
