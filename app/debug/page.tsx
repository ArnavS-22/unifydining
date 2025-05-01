"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function DebugPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Check current user on load
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    if (!supabase) return

    try {
      const { data } = await supabase.auth.getUser()
      setCurrentUser(data.user)
    } catch (error) {
      console.error("Error checking current user:", error)
    }
  }

  const checkUserByEmail = async () => {
    if (!email || !supabase) return

    setIsLoading(true)
    setResult(null)

    try {
      // Check auth user
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
        filter: {
          email: email,
        },
      })

      // Check database user
      const { data: dbUser, error: dbError } = await supabase.from("users").select("*").eq("email", email).maybeSingle()

      // Check supplier profile
      const supplierProfile = dbUser
        ? await supabase.from("supplier_profiles").select("*").eq("user_id", dbUser.id).maybeSingle()
        : null

      // Check restaurant profile
      const restaurantProfile = dbUser
        ? await supabase.from("restaurant_profiles").select("*").eq("user_id", dbUser.id).maybeSingle()
        : null

      setResult({
        authUser: authData?.users?.[0] || null,
        authError: authError?.message,
        dbUser: dbUser || null,
        dbError: dbError?.message,
        supplierProfile: supplierProfile?.data || null,
        supplierError: supplierProfile?.error?.message,
        restaurantProfile: restaurantProfile?.data || null,
        restaurantError: restaurantProfile?.error?.message,
      })
    } catch (error: any) {
      setResult({
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Debug User Accounts</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
            <CardDescription>Information about the currently logged in user</CardDescription>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{currentUser.email}</p>
                </div>
                <div>
                  <p className="font-medium">User ID:</p>
                  <p>{currentUser.id}</p>
                </div>
                <div>
                  <p className="font-medium">User Type:</p>
                  <p>{currentUser.user_metadata?.user_type || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium">Metadata:</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(currentUser.user_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>Not logged in</AlertTitle>
                <AlertDescription>No user is currently logged in</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkCurrentUser}>Refresh</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check User by Email</CardTitle>
            <CardDescription>Look up user information by email address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={checkUserByEmail} disabled={isLoading || !email}>
                    {isLoading ? "Checking..." : "Check User"}
                  </Button>
                </div>
              </div>

              {result && (
                <div className="space-y-4 mt-4">
                  {result.error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-2">Auth User</h3>
                    {result.authUser ? (
                      <div className="bg-gray-100 p-4 rounded">
                        <p>
                          <strong>ID:</strong> {result.authUser.id}
                        </p>
                        <p>
                          <strong>Email:</strong> {result.authUser.email}
                        </p>
                        <p>
                          <strong>Created:</strong> {new Date(result.authUser.created_at).toLocaleString()}
                        </p>
                        <p>
                          <strong>User Type:</strong> {result.authUser.user_metadata?.user_type || "Not specified"}
                        </p>
                        <div>
                          <p>
                            <strong>Metadata:</strong>
                          </p>
                          <pre className="bg-white p-2 rounded overflow-auto text-xs">
                            {JSON.stringify(result.authUser.user_metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-500">{result.authError || "User not found in auth system"}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Database User</h3>
                    {result.dbUser ? (
                      <div className="bg-gray-100 p-4 rounded">
                        <p>
                          <strong>ID:</strong> {result.dbUser.id}
                        </p>
                        <p>
                          <strong>Email:</strong> {result.dbUser.email}
                        </p>
                        <p>
                          <strong>User Type:</strong> {result.dbUser.user_type}
                        </p>
                        <p>
                          <strong>Business Name:</strong> {result.dbUser.business_name}
                        </p>
                        <p>
                          <strong>Created:</strong> {new Date(result.dbUser.created_at).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-red-500">{result.dbError || "User not found in database"}</p>
                    )}
                  </div>

                  {result.dbUser?.user_type === "supplier" && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Supplier Profile</h3>
                      {result.supplierProfile ? (
                        <div className="bg-gray-100 p-4 rounded">
                          <p>
                            <strong>ID:</strong> {result.supplierProfile.id}
                          </p>
                          <p>
                            <strong>User ID:</strong> {result.supplierProfile.user_id}
                          </p>
                          <p>
                            <strong>Supplier Type:</strong> {result.supplierProfile.supplier_type}
                          </p>
                          <p>
                            <strong>Certification:</strong> {result.supplierProfile.certification_authority || "None"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-500">{result.supplierError || "Supplier profile not found"}</p>
                      )}
                    </div>
                  )}

                  {result.dbUser?.user_type === "restaurant" && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Restaurant Profile</h3>
                      {result.restaurantProfile ? (
                        <div className="bg-gray-100 p-4 rounded">
                          <p>
                            <strong>ID:</strong> {result.restaurantProfile.id}
                          </p>
                          <p>
                            <strong>User ID:</strong> {result.restaurantProfile.user_id}
                          </p>
                          <p>
                            <strong>Restaurant Type:</strong> {result.restaurantProfile.restaurant_type}
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-500">{result.restaurantError || "Restaurant profile not found"}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
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
