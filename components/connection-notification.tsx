"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getUser } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase/client"

export function ConnectionNotification() {
  const { toast } = useToast()
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!supabase) return

    async function checkNewConnections() {
      try {
        const user = await getUser()
        if (!user) return

        const userType = user.user_metadata?.user_type
        const userId = user.id

        // Format the date for Supabase query
        const lastCheckedStr = lastChecked.toISOString()

        // Query for new connections based on user type
        let query = supabase
          .from("connections")
          .select(`
          *,
          restaurant:restaurant_id(*),
          supplier:supplier_id(*)
        `)
          .gt("created_at", lastCheckedStr)

        if (userType === "restaurant") {
          query = query.eq("restaurant_id", userId)
        } else if (userType === "supplier") {
          query = query.eq("supplier_id", userId)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error checking for new connections:", error)
          return
        }

        // Update last checked time
        setLastChecked(new Date())

        // Show notifications for new connections
        if (data && data.length > 0) {
          data.forEach((connection) => {
            const partnerName =
              userType === "restaurant" ? connection.supplier?.business_name : connection.restaurant?.business_name

            toast({
              title: "New Connection",
              description: `You have a new connection with ${partnerName}`,
            })
          })
        }
      } catch (error) {
        console.error("Error in connection notification:", error)
      }
    }

    // Check immediately on component mount
    checkNewConnections()

    // Set up interval to check periodically
    const interval = setInterval(checkNewConnections, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [supabase, toast, lastChecked])

  // This component doesn't render anything visible
  return null
}
