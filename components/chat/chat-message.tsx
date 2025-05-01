import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    id: number
    message: string
    created_at: string
    read: boolean
    sender: {
      id: string
      business_name: string
    }
  }
  isCurrentUser: boolean
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-xs flex-col gap-2 rounded-lg px-4 py-2",
        isCurrentUser ? "ml-auto bg-emerald-600 text-white" : "mr-auto bg-muted text-foreground",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{isCurrentUser ? "You" : message.sender.business_name}</span>
      </div>
      <p className="text-sm">{message.message}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-70">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
        {isCurrentUser && <span className="text-xs opacity-70">{message.read ? "Read" : "Delivered"}</span>}
      </div>
    </div>
  )
}
