import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatList } from "@/components/chat/chat-list"
import { MessageSquare } from "lucide-react"
import { getUser } from "@/lib/auth"

export default async function ChatPage() {
  const user = await getUser()
  const userType = user?.user_metadata?.user_type

  return (
    <div className="p-4 md:p-8">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Link href={userType === "restaurant" ? "/dashboard/find-suppliers" : "/dashboard/find-restaurants"}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              {userType === "restaurant" ? "Find Suppliers" : "Find Restaurants"}
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  Your recent conversations with {userType === "restaurant" ? "suppliers" : "restaurants"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatList />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-[600px] flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">Select a conversation</CardTitle>
              <CardDescription>
                Choose a conversation from the list or start a new one by finding{" "}
                {userType === "restaurant" ? "suppliers" : "restaurants"}
              </CardDescription>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
