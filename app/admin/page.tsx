"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DatabaseSetup } from "@/components/database-setup"
import { EnvStatus } from "@/components/env-status"
import { AuthStatus } from "@/components/auth-status"

interface User {
  id: string
  email: string
  business_name: string
  user_type: string
  phone: string
  address: string
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Supabase client is not initialized",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (activeTab === "all") return true
    return user.user_type === activeTab
  })

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
            <Link href="/admin" className="text-sm font-medium">
              Admin Dashboard
            </Link>
            <Link href="/admin/email-test" className="text-sm font-medium">
              Email Test
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <EnvStatus />
            <DatabaseSetup />
            <div className="md:col-span-2">
              <AuthStatus />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Signups</CardTitle>
              <CardDescription>View all user signups on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
                  <TabsTrigger value="supplier">Suppliers</TabsTrigger>
                </TabsList>
              </Tabs>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Business Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Phone</th>
                        <th className="text-left py-3 px-4">Signup Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{user.business_name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={user.user_type === "restaurant" ? "outline" : "secondary"}
                              className={
                                user.user_type === "restaurant"
                                  ? "border-emerald-500 text-emerald-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }
                            >
                              {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{user.phone || "N/A"}</td>
                          <td className="py-3 px-4">
                            {new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" className="mr-2">
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                              onClick={() => {
                                // Send test email to this user
                                fetch("/api/notify-signup", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    userEmail: user.email,
                                    businessName: user.business_name,
                                    userType: user.user_type,
                                    phone: user.phone,
                                    address: user.address,
                                  }),
                                })
                                  .then((response) => {
                                    if (response.ok) {
                                      toast({
                                        title: "Email Sent",
                                        description: `Test email sent to ${user.email}`,
                                      })
                                    } else {
                                      toast({
                                        title: "Error",
                                        description: "Failed to send email",
                                        variant: "destructive",
                                      })
                                    }
                                  })
                                  .catch((error) => {
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive",
                                    })
                                  })
                              }}
                            >
                              Email
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={fetchUsers}>
                Refresh Data
              </Button>
              <Link href="/admin/email-test">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Test Email System</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
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
