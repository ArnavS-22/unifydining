"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getChatRoom } from "@/app/actions/chat"

export default function FindRestaurantsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [restaurantType, setRestaurantType] = useState("")
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await getUser()
        if (!userData) {
          router.push("/login")
          return
        }

        // Check if user is a supplier
        if (userData.user_metadata?.user_type !== "supplier") {
          toast({
            title: "Access denied",
            description: "Only suppliers can access the restaurant directory.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setUser(userData)

        // Load restaurants
        if (supabase) {
          const { data, error } = await supabase
            .from("users")
            .select(`
              *,
              restaurant_profiles(*)
            `)
            .eq("user_type", "restaurant")

          if (error) {
            console.error("Error loading restaurants:", error)
            toast({
              title: "Error",
              description: "Failed to load restaurants. Please try again.",
              variant: "destructive",
            })
          } else {
            setRestaurants(data || [])
            setFilteredRestaurants(data || [])
          }
        }
      } catch (error) {
        console.error("Error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, toast, supabase])

  useEffect(() => {
    // Filter restaurants based on search term and type
    let filtered = restaurants

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.business_name?.toLowerCase().includes(term) ||
          restaurant.description?.toLowerCase().includes(term),
      )
    }

    if (restaurantType) {
      filtered = filtered.filter(
        (restaurant) => restaurant.restaurant_profiles?.[0]?.restaurant_type === restaurantType,
      )
    }

    setFilteredRestaurants(filtered)
  }, [searchTerm, restaurantType, restaurants])

  const handleConnect = async (restaurantId: string) => {
    if (!user || !supabase) return

    try {
      setConnectingId(restaurantId)

      // Check if connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from("connections")
        .select("*")
        .eq("supplier_id", user.id)
        .eq("restaurant_id", restaurantId)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      let isNewConnection = false

      if (!existingConnection) {
        // Create new connection
        const { error: connectionError } = await supabase.from("connections").insert({
          supplier_id: user.id,
          restaurant_id: restaurantId,
          status: "pending",
          created_at: new Date().toISOString(),
        })

        if (connectionError) {
          throw connectionError
        }

        isNewConnection = true

        toast({
          title: "Connection request sent",
          description: "Your connection request has been sent to the restaurant.",
        })
      } else {
        toast({
          title: "Already connected",
          description: "You are already connected with this restaurant.",
        })
      }

      // Create or get chat room
      const chatRoom = await getChatRoom(restaurantId, user.id)

      if (!chatRoom) {
        throw new Error("Failed to create chat room")
      }

      // Show confirmation with clear next steps
      toast({
        title: isNewConnection ? "Connection established!" : "Connection exists",
        description: "You can now chat with this restaurant. Redirecting to chat...",
      })

      // Navigate to the chat room
      router.push(`/dashboard/chat/${chatRoom.id}`)
    } catch (error: any) {
      console.error("Error connecting with restaurant:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to connect with restaurant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnectingId(null)
    }
  }

  const handleMessage = async (restaurantId: string) => {
    if (!user) return

    try {
      setConnectingId(restaurantId)

      // Create or get chat room
      const chatRoom = await getChatRoom(restaurantId, user.id)

      // Navigate to the chat room
      router.push(`/dashboard/chat/${chatRoom.id}`)
    } catch (error: any) {
      console.error("Error creating chat room:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to open chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnectingId(null)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="p-4 md:p-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Find Restaurants</h1>
          <Link href="/dashboard/chat">
            <Button variant="outline">View Messages</Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={restaurantType} onValueChange={setRestaurantType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-service">Full-Service Restaurant</SelectItem>
                <SelectItem value="fast-casual">Fast-Casual</SelectItem>
                <SelectItem value="cafe">Café</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardHeader>
                  <CardTitle>{restaurant.business_name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">
                      {restaurant.restaurant_profiles?.[0]?.restaurant_type === "full-service"
                        ? "Full-Service Restaurant"
                        : restaurant.restaurant_profiles?.[0]?.restaurant_type === "fast-casual"
                          ? "Fast-Casual"
                          : restaurant.restaurant_profiles?.[0]?.restaurant_type === "cafe"
                            ? "Café"
                            : "Other"}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {restaurant.description || "No description provided."}
                  </p>
                  {restaurant.address && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Location:</span> {restaurant.address}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleConnect(restaurant.id)}
                    className="flex-1"
                    disabled={connectingId === restaurant.id}
                  >
                    Connect
                  </Button>
                  <Button
                    onClick={() => handleMessage(restaurant.id)}
                    variant="outline"
                    className="flex-1"
                    disabled={connectingId === restaurant.id}
                  >
                    Message
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No restaurants found matching your criteria. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
