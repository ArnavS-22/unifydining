"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare } from "lucide-react"
import { ConnectionNotification } from "@/components/connection-notification"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return

      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          // Not logged in, redirect to login page
          toast({
            title: "Authentication required",
            description: "Please log in to access the dashboard",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        console.log("User authenticated:", data.user.email)
        console.log("User metadata:", data.user.user_metadata)

        // User is logged in
        setUser(data.user)

        // Get additional user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)

          // If we can't find the user in the users table, but they're authenticated,
          // let's create a record for them based on their auth metadata
          if (userError.code === "PGRST116") {
            // Record not found
            console.log("User not found in users table, creating record from auth metadata")

            const userType = data.user.user_metadata?.user_type
            if (userType) {
              const { error: insertError } = await supabase.from("users").insert({
                id: data.user.id,
                email: data.user.email,
                user_type: userType,
                business_name: data.user.user_metadata?.business_name || "Unknown Business",
                phone: data.user.user_metadata?.phone || "",
                address: data.user.user_metadata?.address || "",
              })

              if (insertError) {
                console.error("Error creating user record:", insertError)
              } else {
                console.log("Created user record from auth metadata")
              }
            }
          }
        } else if (userData) {
          console.log("User data retrieved from database:", userData)
          // Combine auth user with database user data
          setUser({
            ...data.user,
            ...userData,
          })
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router, toast])

  const handleSignOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out successfully",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Get user type from either the database record or auth metadata
  const userType = user?.user_type || user?.user_metadata?.user_type || "user"
  console.log("Determined user type:", userType)

  const isSupplier = userType === "supplier"
  const isRestaurant = userType === "restaurant"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">UD</span>
              </div>
              <span className="font-bold text-xl hidden md:inline-block">UnifyDining</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            {isSupplier && (
              <Link href="/dashboard/listings" className="text-sm font-medium">
                My Listings
              </Link>
            )}
            <Link href="/dashboard/connections" className="text-sm font-medium">
              Connections
            </Link>
            <Link href="/dashboard/chat" className="text-sm font-medium flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Messages
            </Link>
            {isRestaurant && (
              <Link href="/dashboard/find-suppliers" className="text-sm font-medium">
                Find Suppliers
              </Link>
            )}
            {isSupplier && (
              <Link href="/dashboard/find-restaurants" className="text-sm font-medium">
                Find Restaurants
              </Link>
            )}
            <Link href="/dashboard/profile" className="text-sm font-medium">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold">UnifyDining</span>
            </Link>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} UnifyDining. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <ConnectionNotification />
    </div>
  )
}
