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
    let recentEntries = null
    try {
      const { data, error: dbError } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (dbError) {
        console.error("Database error fetching mood entries:", dbError)
        console.error("Error code:", dbError.code, "Message:", dbError.message)
      } else {
        recentEntries = data
        console.log("Mood entries fetched successfully, count:", recentEntries?.length || 0)
      }
    } catch (dbCatchError) {
      console.error("Exception during mood entries query:", dbCatchError)
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
    console.log("GOOGLE_GENERATIVE_AI_API_KEY present:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    let text: string
    try {
      console.log("Initializing Google Gemini model")
      const model = google("gemini-2.0-flash")
      console.log("Model initialized, calling generateText with prompt length:", `${conversationContext}\n\nUser: ${message}`.length)
      const result = await generateText({
        model: model,
        system: systemPrompt,
        prompt: `${conversationContext}\n\nUser: ${message}`,
        temperature: 0.7,
      })
      text = result.text
      console.log("generateText succeeded, response length:", text.length)
    } catch (aiError) {
      console.error("AI generation error details:", aiError)
      console.error("AI error message:", aiError instanceof Error ? aiError.message : 'Unknown AI error')
      console.error("AI error stack:", aiError instanceof Error ? aiError.stack : 'No stack')
      console.error("AI error type:", typeof aiError)
      throw aiError
    }

    // Save conversation and messages to database
    let currentConversationId = conversationId

    if (!currentConversationId) {
      // Create new conversation
      console.log("Creating new conversation")
      try {
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
          console.error("Conversation error code:", convError.code, "Message:", convError.message)
          return new Response(JSON.stringify({ error: "Failed to create conversation" }), { status: 500 })
        }

        currentConversationId = newConversation.id
        console.log("New conversation created with ID:", currentConversationId)
      } catch (convCatchError) {
        console.error("Exception during conversation creation:", convCatchError)
        throw convCatchError
      }
    }

    // Save user message
    console.log("Saving user message")
    try {
      const { error: userMsgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversationId,
          role: "user",
          content: message,
        })

      if (userMsgError) {
        console.error("Error saving user message:", userMsgError)
        console.error("User message error code:", userMsgError.code, "Message:", userMsgError.message)
        throw userMsgError
      } else {
        console.log("User message saved successfully")
      }
    } catch (userMsgCatchError) {
      console.error("Exception saving user message:", userMsgCatchError)
      throw userMsgCatchError
    }

    // Save assistant message
    console.log("Saving assistant message")
    try {
      const { error: assistantMsgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversationId,
          role: "assistant",
          content: text,
        })

      if (assistantMsgError) {
        console.error("Error saving assistant message:", assistantMsgError)
        console.error("Assistant message error code:", assistantMsgError.code, "Message:", assistantMsgError.message)
        throw assistantMsgError
      } else {
        console.log("Assistant message saved successfully")
      }
    } catch (assistantMsgCatchError) {
      console.error("Exception saving assistant message:", assistantMsgCatchError)
      throw assistantMsgCatchError
    }

    // Update conversation updated_at
    console.log("Updating conversation timestamp")
    try {
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversationId)

      if (updateError) {
        console.error("Error updating conversation:", updateError)
        console.error("Update error code:", updateError.code, "Message:", updateError.message)
        throw updateError
      } else {
        console.log("Conversation updated successfully")
      }
    } catch (updateCatchError) {
      console.error("Exception updating conversation:", updateCatchError)
      throw updateCatchError
    }

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
