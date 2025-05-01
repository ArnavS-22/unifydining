"use client"

import { useEffect, useState } from "react"
import { getUser } from "@/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function AuthStatus() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await getUser()
        setUser(userData)
      } catch (err: any) {
        console.error("Error checking auth status:", err)
        setError(err.message || "Failed to check authentication status")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    router.push("/login")
  }

  if (loading) {
    return (
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          Checking authentication status...
        </AlertTitle>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (user) {
    return (
      <Alert className="border-green-500 bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Authenticated</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Logged in as: {user.email}</p>
          <p>User type: {user.user_metadata?.user_type || "Not specified"}</p>
          <p>Business: {user.user_metadata?.business_name || "Not specified"}</p>
          <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Not Authenticated</AlertTitle>
      <AlertDescription>You are not currently logged in.</AlertDescription>
    </Alert>
  )
}
