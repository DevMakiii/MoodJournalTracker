import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { message, moodContext, conversationHistory } = await request.json()

    // Get user's recent mood entries for context
    const { data: recentEntries } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    const moodSummary =
      recentEntries && recentEntries.length > 0
        ? `Recent moods: ${recentEntries.map((e) => e.mood_emoji).join(", ")}`
        : "No recent mood entries"

    // Build conversation context
    const conversationContext = conversationHistory
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = `You are a compassionate and supportive mood journal assistant. Your role is to:
1. Provide personalized affirmations and encouragement based on the user's mood
2. Suggest journaling prompts to help them explore their feelings
3. Offer coping strategies and wellness tips
4. Listen empathetically and validate their emotions
5. Help them identify patterns in their mood

Current mood context: ${moodContext || "Not specified"}
${moodSummary}

Keep responses concise (2-3 sentences), warm, and supportive. Use emojis occasionally to add warmth.`

    const { text } = await generateText({
      model: "google/gemini-2.0-flash",
      system: systemPrompt,
      prompt: `${conversationContext}\n\nUser: ${message}`,
      temperature: 0.7,
      maxTokens: 200,
    })

    return new Response(JSON.stringify({ message: text }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("AI Assistant Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
      }),
      { status: 500 },
    )
  }
}
