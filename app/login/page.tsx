"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      if (!supabase) return

      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          // User is already logged in, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!supabase) {
      setError("Supabase client is not initialized. Check your environment variables.")
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting to sign in with email:", email)

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        if (error.message.includes("Email not confirmed")) {
          setError(
            "Your email is not confirmed. Please check your inbox for a confirmation email or try the 'Fix Account' button below.",
          )
          return
        } else if (error.message.includes("Invalid login credentials")) {
          setError("Incorrect email or password. Please try again.")
        } else {
          setError(error.message)
        }
        return
      }

      if (!data || !data.user) {
        setError("Something went wrong. Please try again.")
        return
      }

      console.log("Login successful for user:", data.user.email)
      console.log("User metadata:", data.user.user_metadata)

      // Get user type from metadata
      const userType = data.user.user_metadata?.user_type
      console.log("User type:", userType)

      toast({
        title: "Login successful",
        description: `Welcome back! Redirecting to your ${userType} dashboard...`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFixAccount = async () => {
    if (!email || !supabase) return

    setIsLoading(true)
    setError("")

    try {
      // First try to get the user by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, user_type")
        .eq("email", email)
        .single()

      if (userError) {
        throw new Error("Account not found. Please check your email address.")
      }

      // If it's a supplier, try to fix it
      if (userData.user_type === "supplier") {
        // Call our fix endpoint
        const response = await fetch(`/api/fix-supplier-auth?email=${encodeURIComponent(email)}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fix account")
        }

        toast({
          title: "Account fixed",
          description: "Your account has been fixed. Please try logging in again.",
        })
      } else {
        toast({
          title: "Account is fine",
          description:
            "Your account doesn't need fixing. If you're having trouble logging in, please check your password.",
        })
      }
    } catch (error: any) {
      console.error("Fix account error:", error)
      setError(error.message || "Failed to fix account")
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Checking login status...</p>
        </div>
      </div>
    )
  }

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
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/listings" className="text-sm font-medium">
              Listings
            </Link>
            <Link href="/suppliers" className="text-sm font-medium">
              Suppliers
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {error && error.includes("not confirmed") && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleFixAccount}
                  disabled={isLoading || !email}
                >
                  Fix Account
                </Button>
              )}

              <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-emerald-600 underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>

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
    </div>
  )
}
