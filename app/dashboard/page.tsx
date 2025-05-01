"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [listings, setListings] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function loadUserData() {
      if (!supabase) return

      try {
        // Get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
          console.error("Error loading user:", userError)
          return
        }

        setUser(userData.user)

        // Get additional user data
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
        } else {
          setProfile(profileData)
        }

        // Load user-specific data
        const userType = userData.user.user_metadata?.user_type

        if (userType === "supplier") {
          await loadSupplierData(userData.user.id)
        } else if (userType === "restaurant") {
          await loadRestaurantData(userData.user.id)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [supabase])

  const loadSupplierData = async (userId: string) => {
    if (!supabase) return

    // Load supplier listings
    const { data: listingsData, error: listingsError } = await supabase
      .from("supplier_listings")
      .select("*")
      .eq("supplier_id", userId)

    if (listingsError) {
      console.error("Error loading supplier listings:", listingsError)
    } else {
      setListings(listingsData || [])
    }

    // Load supplier connections
    const { data: connectionsData, error: connectionsError } = await supabase
      .from("connections")
      .select("*, restaurant:restaurant_id(*)")
      .eq("supplier_id", userId)

    if (connectionsError) {
      console.error("Error loading supplier connections:", connectionsError)
    } else {
      setConnections(connectionsData || [])
    }
  }

  const loadRestaurantData = async (userId: string) => {
    if (!supabase) return

    // Load restaurant connections
    const { data: connectionsData, error: connectionsError } = await supabase
      .from("connections")
      .select("*, supplier:supplier_id(*)")
      .eq("restaurant_id", userId)

    if (connectionsError) {
      console.error("Error loading restaurant connections:", connectionsError)
    } else {
      setConnections(connectionsData || [])
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const userType = user?.user_metadata?.user_type || "user"
  const isSupplier = userType === "supplier"
  const isRestaurant = userType === "restaurant"
  const businessName = user?.user_metadata?.business_name || profile?.business_name || "User"

  return (
    <div className="p-4 md:p-8">
      <div className="container">
        <h1 className="text-3xl font-bold mb-6">Welcome, {businessName}</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Dashboard</CardTitle>
              <CardDescription>
                You are logged in as a {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                  {isSupplier && <TabsTrigger value="listings">Listings</TabsTrigger>}
                  {isRestaurant && <TabsTrigger value="suppliers">Suppliers</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{connections.length}</div>
                      </CardContent>
                    </Card>

                    {isSupplier && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{listings.length}</div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Business Name</dt>
                          <dd>{user?.user_metadata?.business_name || profile?.business_name || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                          <dd>{user?.email || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                          <dd>{user?.user_metadata?.phone || profile?.phone || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                          <dd>{user?.user_metadata?.address || profile?.address || "Not provided"}</dd>
                        </div>
                        {isSupplier && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Certification</dt>
                            <dd>{user?.user_metadata?.certification || "Not provided"}</dd>
                          </div>
                        )}
                        {isRestaurant && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Restaurant Type</dt>
                            <dd>{user?.user_metadata?.restaurant_type || "Not provided"}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="connections" className="space-y-4 pt-4">
                  {connections.length > 0 ? (
                    <div className="grid gap-4">
                      {connections.map((connection) => (
                        <Card key={connection.id}>
                          <CardHeader>
                            <CardTitle>
                              {isSupplier
                                ? connection.restaurant?.business_name || "Restaurant"
                                : connection.supplier?.business_name || "Supplier"}
                            </CardTitle>
                            <CardDescription>
                              Connected since {new Date(connection.created_at).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>Status: {connection.status || "Active"}</p>
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm">
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          You don't have any connections yet.
                          {isRestaurant && (
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
                </TabsContent>

                {isSupplier && (
                  <TabsContent value="listings" className="space-y-4 pt-4">
                    {listings.length > 0 ? (
                      <div className="grid gap-4">
                        {listings.map((listing) => (
                          <Card key={listing.id}>
                            <CardHeader>
                              <CardTitle>{listing.title || "Product Listing"}</CardTitle>
                              <CardDescription>{listing.category || "General"}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p>{listing.description || "No description provided."}</p>
                              <p className="mt-2">Price: ${listing.price || "N/A"}</p>
                              <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">
                            You don't have any listings yet.{" "}
                            <Link
                              href="/dashboard/create-listing"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              Create a listing
                            </Link>{" "}
                            to showcase your products.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )}

                {isRestaurant && (
                  <TabsContent value="suppliers" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          <Link
                            href="/dashboard/find-suppliers"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Browse our directory
                          </Link>{" "}
                          to find halal suppliers for your restaurant.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
