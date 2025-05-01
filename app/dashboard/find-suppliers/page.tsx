"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getChatRoom } from "@/app/actions/chat"

export default function FindSuppliersPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [supplierType, setSupplierType] = useState("")
  const [connectingId, setConnectingId] = useState<string | null>(null)

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

        // Check if user is a restaurant
        if (userData.user_metadata?.user_type !== "restaurant") {
          toast({
            title: "Access denied",
            description: "Only restaurants can access the supplier directory.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setUser(userData)

        // Load suppliers
        if (supabase) {
          const { data, error } = await supabase
            .from("users")
            .select(`
              *,
              supplier_profiles(*)
            `)
            .eq("user_type", "supplier")

          if (error) {
            console.error("Error loading suppliers:", error)
            toast({
              title: "Error",
              description: "Failed to load suppliers. Please try again.",
              variant: "destructive",
            })
          } else {
            setSuppliers(data || [])
            setFilteredSuppliers(data || [])
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

  useEffect(() => {
    // Filter suppliers based on search term and type
    let filtered = suppliers

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (supplier) =>
          supplier.business_name?.toLowerCase().includes(term) || supplier.description?.toLowerCase().includes(term),
      )
    }

    if (supplierType) {
      filtered = filtered.filter((supplier) => supplier.supplier_profiles?.[0]?.supplier_type === supplierType)
    }

    setFilteredSuppliers(filtered)
  }, [searchTerm, supplierType, suppliers])

  const handleConnect = async (supplierId: string) => {
    if (!user || !supabase) return

    try {
      setConnectingId(supplierId)

      // Check if connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from("connections")
        .select("*")
        .eq("restaurant_id", user.id)
        .eq("supplier_id", supplierId)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      let isNewConnection = false

      if (!existingConnection) {
        // Create new connection
        const { error: connectionError } = await supabase.from("connections").insert({
          restaurant_id: user.id,
          supplier_id: supplierId,
          status: "pending",
          created_at: new Date().toISOString(),
        })

        if (connectionError) {
          throw connectionError
        }

        isNewConnection = true

        toast({
          title: "Connection request sent",
          description: "Your connection request has been sent to the supplier.",
        })
      } else {
        toast({
          title: "Already connected",
          description: "You are already connected with this supplier.",
        })
      }

      // Create or get chat room
      const chatRoom = await getChatRoom(user.id, supplierId)

      if (!chatRoom) {
        throw new Error("Failed to create chat room")
      }

      // Show confirmation with clear next steps
      toast({
        title: isNewConnection ? "Connection established!" : "Connection exists",
        description: "You can now chat with this supplier. Redirecting to chat...",
      })

      // Navigate to the chat room
      router.push(`/dashboard/chat/${chatRoom.id}`)
    } catch (error: any) {
      console.error("Error connecting with supplier:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to connect with supplier. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnectingId(null)
    }
  }

  const handleMessage = async (supplierId: string) => {
    if (!user) return

    try {
      setConnectingId(supplierId)

      // Create or get chat room
      const chatRoom = await getChatRoom(user.id, supplierId)

      // Navigate to the chat room
      router.push(`/dashboard/chat/${chatRoom.id}`)
    } catch (error: any) {
      console.error("Error creating chat room:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to open chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConnectingId(null)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="p-4 md:p-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Find Halal Suppliers</h1>
          <Link href="/dashboard/chat">
            <Button variant="outline">View Messages</Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={supplierType} onValueChange={setSupplierType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="butcher">Halal Butcher</SelectItem>
                <SelectItem value="wholesaler">Halal Wholesaler</SelectItem>
                <SelectItem value="distributor">Food Distributor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSuppliers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <CardTitle>{supplier.business_name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mr-2">
                      {supplier.supplier_profiles?.[0]?.supplier_type === "butcher"
                        ? "Halal Butcher"
                        : supplier.supplier_profiles?.[0]?.supplier_type === "wholesaler"
                          ? "Halal Wholesaler"
                          : supplier.supplier_profiles?.[0]?.supplier_type === "distributor"
                            ? "Food Distributor"
                            : "Other"}
                    </Badge>
                    {supplier.supplier_profiles?.[0]?.certification_authority && (
                      <Badge variant="secondary">Certified</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {supplier.description || "No description provided."}
                  </p>
                  {supplier.supplier_profiles?.[0]?.certification_authority && (
                    <p className="text-sm">
                      <span className="font-medium">Certification:</span>{" "}
                      {supplier.supplier_profiles[0].certification_authority}
                    </p>
                  )}
                  {supplier.address && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Location:</span> {supplier.address}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleConnect(supplier.id)}
                    className="flex-1"
                    disabled={connectingId === supplier.id}
                  >
                    Connect
                  </Button>
                  <Button
                    onClick={() => handleMessage(supplier.id)}
                    variant="outline"
                    className="flex-1"
                    disabled={connectingId === supplier.id}
                  >
                    Message
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No suppliers found matching your criteria. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
