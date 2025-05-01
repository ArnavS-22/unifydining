"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ConnectionsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

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

        setUser(userData)

        // Load connections based on user type
        if (supabase) {
          const isSupplier = userData.user_metadata?.user_type === "supplier"

          let query = supabase.from("connections").select(`
              *,
              supplier:supplier_id(*),
              restaurant:restaurant_id(*)
            `)

          if (isSupplier) {
            query = query.eq("supplier_id", userData.id)
          } else {
            query = query.eq("restaurant_id", userData.id)
          }

          const { data, error } = await query

          if (error) {
            console.error("Error loading connections:", error)
            toast({
              title: "Error",
              description: "Failed to load connections. Please try again.",
              variant: "destructive",
            })
          } else {
            setConnections(data || [])
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

  const getFilteredConnections = () => {
    if (activeTab === "all") {
      return connections
    }
    return connections.filter((conn) => conn.status === activeTab)
  }

  const handleUpdateStatus = async (connectionId: string, newStatus: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("connections").update({ status: newStatus }).eq("id", connectionId)

      if (error) {
        throw error
      }

      // Update local state
      setConnections((prev) => prev.map((conn) => (conn.id === connectionId ? { ...conn, status: newStatus } : conn)))

      toast({
        title: "Status updated",
        description: `Connection status updated to ${newStatus}.`,
      })
    } catch (error: any) {
      console.error("Error updating connection status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const isSupplier = user?.user_metadata?.user_type === "supplier"
  const filteredConnections = getFilteredConnections()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl hidden md:inline-block">UnifyDining</span>
              <span className="font-bold text-xl md:hidden">UD</span>
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
            {!isSupplier && (
              <Link href="/dashboard/find-suppliers" className="text-sm font-medium">
                Find Suppliers
              </Link>
            )}
            <Link href="/dashboard/profile" className="text-sm font-medium">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Your Connections</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredConnections.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredConnections.map((connection) => {
                const partner = isSupplier ? connection.restaurant : connection.supplier

                return (
                  <Card key={connection.id}>
                    <CardHeader>
                      <CardTitle>{partner?.business_name || "Business"}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge
                          variant={
                            connection.status === "active"
                              ? "default"
                              : connection.status === "pending"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                        </Badge>
                        <span>Since {new Date(connection.created_at).toLocaleDateString()}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {partner?.address && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Location:</span> {partner.address}
                        </p>
                      )}
                      {partner?.phone && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Phone:</span> {partner.phone}
                        </p>
                      )}
                      {partner?.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {partner.email}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2">
                      {isSupplier && connection.status === "pending" && (
                        <>
                          <Button onClick={() => handleUpdateStatus(connection.id, "active")} className="flex-1">
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(connection.id, "rejected")}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {connection.status === "active" && (
                        <Button variant="outline" className="w-full">
                          Message
                        </Button>
                      )}

                      {connection.status === "rejected" && (
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateStatus(connection.id, "active")}
                          className="w-full"
                        >
                          Reactivate
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No connections found in this category.
                  {!isSupplier && (
                    <>
                      {" "}
                      <Link
                        href="/dashboard/find-suppliers"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Find suppliers
                      </Link>{" "}
                      to connect with.
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
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
