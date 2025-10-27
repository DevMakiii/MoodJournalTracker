import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  console.log("AI Assistant API called")
  try {
    console.log("Creating Supabase client")
    const supabase = await createClient()
    console.log("Getting user")
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("User not authenticated")
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }
    console.log("User authenticated:", user.id)

    console.log("Parsing request body")
    const { message, moodContext, conversationHistory } = await request.json()
    console.log("Request body parsed:", { message: message.substring(0, 50), moodContext, conversationHistoryLength: conversationHistory.length })

    // Get user's recent mood entries for context
    console.log("Querying mood entries")
    const { data: recentEntries, error: dbError } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (dbError) {
      console.error("Database error:", dbError)
    }

    const moodSummary =
      recentEntries && recentEntries.length > 0
        ? `Recent moods: ${recentEntries.map((e) => e.mood_emoji).join(", ")}`
        : "No recent mood entries"
    console.log("Mood summary:", moodSummary)

    // Build conversation context
    const conversationContext = conversationHistory
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")
    console.log("Conversation context built")

    const systemPrompt = `You are a compassionate and supportive mood journal assistant. Your role is to:
1. Provide personalized affirmations and encouragement based on the user's mood
2. Suggest journaling prompts to help them explore their feelings
3. Offer coping strategies and wellness tips
4. Listen empathetically and validate their emotions
5. Help them identify patterns in their mood

Current mood context: ${moodContext || "Not specified"}
${moodSummary}

Keep responses concise (2-3 sentences), warm, and supportive. Use emojis occasionally to add warmth.`

    console.log("Calling generateText")
    const { text } = await generateText({
      model: google("models/gemini-2.0-flash-exp"),
      system: systemPrompt,
      prompt: `${conversationContext}\n\nUser: ${message}`,
      temperature: 0.7,
    })
    console.log("generateText succeeded, response length:", text.length)

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
