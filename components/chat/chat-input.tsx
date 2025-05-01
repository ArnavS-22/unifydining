"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { sendMessage } from "@/app/actions/chat"
import { Send } from "lucide-react"

interface ChatInputProps {
  roomId: number
}

export function ChatInput({ roomId }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || sending) return

    setSending(true)
    try {
      await sendMessage(roomId, message.trim())
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[80px] flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <Button
        type="submit"
        size="icon"
        className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700"
        disabled={!message.trim() || sending}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
