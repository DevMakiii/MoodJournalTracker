"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Send, Plus, MessageSquare, Trash2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at?: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface AIAssistantProps {
  userMoodContext?: string
}

export function AIAssistant({ userMoodContext }: AIAssistantProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId)
    } else {
      setMessages([])
    }
  }, [currentConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/ai-assistant")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai-assistant?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const startNewConversation = () => {
    setCurrentConversationId(null)
    setMessages([])
    setShowSidebar(false)
  }

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
    setShowSidebar(false)
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai-assistant?conversationId=${conversationId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        loadConversations()
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null)
          setMessages([])
        }
      } else {
        console.error("Failed to delete conversation")
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    inputRef.current?.focus()

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          moodContext: userMoodContext,
          conversationHistory: messages,
          conversationId: currentConversationId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI assistant")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update current conversation ID if this was a new conversation
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId)
        loadConversations() // Refresh the conversation list
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="text-center py-2 sm:py-4 border-b border-border bg-card">
        <h1 className="text-lg sm:text-xl font-light">Journal Assistant</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Your mindful companion for reflection</p>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`w-full md:w-64 bg-card border-r border-border transition-all duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-10 h-full`}>
          <div className="p-4">
            <Button onClick={startNewConversation} className="w-full mb-4" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center gap-2">
                    <Button
                      variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                      className="flex-1 justify-start text-left h-auto p-3"
                      onClick={() => selectConversation(conversation.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 p-2 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConversation(conversation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end p-2 sm:p-4 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
          <Card className="flex flex-col flex-1 border-0 rounded-none">
            <CardContent className="flex flex-col gap-2 sm:gap-4 h-full pb-0">
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-2 sm:p-4 bg-accent/20 rounded-xl border border-accent/30">
                {messages.length === 0 && !currentConversationId && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a new conversation or select one from the sidebar</p>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div
                      className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card text-card-foreground rounded-bl-sm border border-accent/20"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-card text-card-foreground px-4 py-3 rounded-xl rounded-bl-sm border border-accent/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-gentle-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-gentle-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-gentle-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

              <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-2 sm:p-4 -mx-2 sm:-mx-4 -mb-2 sm:-mb-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Share your thoughts..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 transition-all duration-300 focus:shadow-md"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} className="transition-all duration-300 hover:shadow-md">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
