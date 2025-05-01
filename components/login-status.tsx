"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function LoginStatus() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return

      try {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  const handleSignOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      setUser(null)
      toast({
        title: "Signed out successfully",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return <div>Checking login status...</div>
  }

  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <p>Logged in as: {user.email}</p>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div>
      <p>Not logged in</p>
      <Button onClick={() => router.push("/login")} size="sm">
        Log In
      </Button>
    </div>
  )
}
