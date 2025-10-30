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
    const { message, moodContext, conversationHistory, conversationId } = await request.json()
    console.log("Request body parsed:", { message: message.substring(0, 50), moodContext, conversationHistoryLength: conversationHistory.length, conversationId })

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

    // Save conversation and messages to database
    let currentConversationId = conversationId

    if (!currentConversationId) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        })
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        return new Response(JSON.stringify({ error: "Failed to create conversation" }), { status: 500 })
      }

      currentConversationId = newConversation.id
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: currentConversationId,
        role: "user",
        content: message,
      })

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError)
    }

    // Save assistant message
    const { error: assistantMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: currentConversationId,
        role: "assistant",
        content: text,
      })

    if (assistantMsgError) {
      console.error("Error saving assistant message:", assistantMsgError)
    }

    // Update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", currentConversationId)

    return new Response(JSON.stringify({ message: text, conversationId: currentConversationId }), {
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
    const conversationId = url.searchParams.get("conversationId")

    if (conversationId) {
      // Get messages for a specific conversation
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return new Response(JSON.stringify({ error: "Failed to fetch messages" }), { status: 500 })
      }

      return new Response(JSON.stringify({ messages }), {
        headers: { "Content-Type": "application/json" },
      })
    } else {
      // Get all conversations for the user
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching conversations:", error)
        return new Response(JSON.stringify({ error: "Failed to fetch conversations" }), { status: 500 })
      }

      return new Response(JSON.stringify({ conversations }), {
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
      }),
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const url = new URL(request.url)
    const conversationId = url.searchParams.get("conversationId")

    if (!conversationId) {
      return new Response(JSON.stringify({ error: "Conversation ID required" }), { status: 400 })
    }

    // Delete messages first (due to foreign key constraint)
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId)

    if (messagesError) {
      console.error("Error deleting messages:", messagesError)
      return new Response(JSON.stringify({ error: "Failed to delete messages" }), { status: 500 })
    }

    // Delete the conversation
    const { error: conversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id) // Ensure user can only delete their own conversations

    if (conversationError) {
      console.error("Error deleting conversation:", conversationError)
      return new Response(JSON.stringify({ error: "Failed to delete conversation" }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
      }),
      { status: 500 },
    )
  }
}
