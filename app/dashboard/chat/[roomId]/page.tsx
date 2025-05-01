import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatList } from "@/components/chat/chat-list"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { getChatRoomDetails, getChatMessages, markMessagesAsRead } from "@/app/actions/chat"
import { getUser } from "@/lib/auth"
import { ArrowLeft } from "lucide-react"

export default async function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const roomId = Number.parseInt(params.roomId)

  if (isNaN(roomId)) {
    notFound()
  }

  try {
    const [user, room, messages] = await Promise.all([getUser(), getChatRoomDetails(roomId), getChatMessages(roomId)])

    if (!user || !room) {
      notFound()
    }

    // Mark messages as read
    await markMessagesAsRead(roomId)

    const isRestaurant = user.user_metadata?.user_type === "restaurant"
    const partner = isRestaurant ? room.supplier : room.restaurant

    return (
      <div className="p-4 md:p-8">
        <div className="container max-w-5xl">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/chat" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatList />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle>{partner?.business_name || "Chat"}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatMessage key={message.id} message={message} isCurrentUser={message.sender_id === user.id} />
                    ))
                  )}
                </CardContent>
                <div className="border-t p-4">
                  <ChatInput roomId={roomId} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading chat room:", error)
    notFound()
  }
}
