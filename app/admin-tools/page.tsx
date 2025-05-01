"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AdminToolsPage() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const checkLoginStatus = async () => {
    if (!supabase) return

    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const deleteTestUser = async () => {
    setIsDeleting(true)
    setResult(null)

    try {
      // Direct database query to delete test user
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // Find test users
      const { data: users, error: findError } = await supabase
        .from("users")
        .select("id")
        .ilike("business_name", "%ArnavManduriLol%")

      if (findError) {
        throw new Error("Error finding test users: " + findError.message)
      }

      if (users.length === 0) {
        setResult({ message: "No test users found" })
        return
      }

      // Delete all related data for each test user
      for (const user of users) {
        const userId = user.id

        // Delete from supplier_profiles
        await supabase.from("supplier_profiles").delete().eq("user_id", userId)

        // Delete from connections
        await supabase.from("connections").delete().eq("supplier_id", userId)
        await supabase.from("connections").delete().eq("restaurant_id", userId)

        // Delete from supplier_listings
        await supabase.from("supplier_listings").delete().eq("supplier_id", userId)

        // Delete the user
        await supabase.from("users").delete().eq("id", userId)
      }

      setResult({
        success: true,
        message: `Deleted ${users.length} test users with name containing 'ArnavManduriLol'`,
      })

      toast({
        title: "Success",
        description: `Deleted ${users.length} test users with name containing 'ArnavManduriLol'`,
      })
    } catch (error: any) {
      setResult({ error: error.message })
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Tools</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Status</CardTitle>
            <CardDescription>Check your current login status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkLoginStatus} className="mb-4">
              Check Login Status
            </Button>

            {user ? (
              <div className="p-4 border rounded-md">
                <p className="font-medium">Logged in as:</p>
                <p>Email: {user.email}</p>
                <p>User ID: {user.id}</p>
                <p>User Type: {user.user_metadata?.user_type || "Not specified"}</p>
              </div>
            ) : (
              <p>Not logged in</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Test User</CardTitle>
            <CardDescription>Remove test users from the database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">This will delete any user with "ArnavManduriLol" in their name.</p>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message || result.error || "Operation completed"}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={deleteTestUser} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Test User"}
            </Button>
          </CardFooter>
        </Card>

        <div className="flex justify-between">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login Page</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
