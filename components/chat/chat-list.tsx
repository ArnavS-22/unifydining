"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { getChatRooms } from "@/app/actions/chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"

export function ChatList() {
  const [chatRooms, setChatRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const userData = await getUser()
        setUser(userData)

        if (!userData) {
          console.error("No user found")
          return
        }

        console.log("Fetching chat rooms for user:", userData.email)
        const rooms = await getChatRooms()
        console.log("Fetched chat rooms:", rooms.length)
        setChatRooms(rooms)
      } catch (error) {
        console.error("Error loading chat rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Poll for new messages every 30 seconds
    const interval = setInterval(async () => {
      try {
        const rooms = await getChatRooms()
        setChatRooms(rooms)
      } catch (error) {
        console.error("Error polling chat rooms:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="cursor-pointer hover:bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (chatRooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No conversations yet</p>
          <Link
            href={
              user?.user_metadata?.user_type === "restaurant"
                ? "/dashboard/find-suppliers"
                : "/dashboard/find-restaurants"
            }
          >
            <Button>{user?.user_metadata?.user_type === "restaurant" ? "Find Suppliers" : "Find Restaurants"}</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {chatRooms.map((room) => {
        const isRestaurant = user?.user_metadata?.user_type === "restaurant"
        const partner = isRestaurant ? room.supplier : room.restaurant
        const isActive = pathname === `/dashboard/chat/${room.id}`
        const unreadCount = room.unread_count || 0

        return (
          <Link href={`/dashboard/chat/${room.id}`} key={room.id}>
            <Card className={cn("cursor-pointer hover:bg-muted/50", isActive && "bg-muted")}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{partner?.business_name || "Unknown Business"}</h3>
                    <p className="text-sm text-muted-foreground">{isRestaurant ? "Supplier" : "Restaurant"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(room.last_message_at), { addSuffix: true })}
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="default" className="bg-emerald-600">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
