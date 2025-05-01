"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthStatus } from "@/components/auth-status"
import { signIn, signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AuthTestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        throw error
      }

      toast({
        title: "Login successful",
        description: `Logged in as ${data?.user?.email}`,
      })

      // Force refresh the page to update auth status
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Logged out",
        description: "You have been signed out successfully",
      })
      // Force refresh the page to update auth status
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>

      <div className="grid gap-6">
        <AuthStatus />

        <Card>
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
            <CardDescription>Use this form to test login functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-sm text-muted-foreground">Password must be at least 6 characters long</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSignIn} disabled={isLoading || !email || !password}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        <div className="flex justify-between">
          <Link href="/login">
            <Button variant="outline">Go to Login Page</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Go to Signup Page</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Go to Admin Page</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
