"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail } from "lucide-react"

interface Supplier {
  id: string
  business_name: string
  email: string
  phone: string
  address: string
  user_type: string
  created_at: string
  supplier_profile?: {
    id: number
    supplier_type: string
    certification_authority: string
    product_categories: string[]
    delivery_areas: string[]
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
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
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          supplier_profile:supplier_profiles(*)
        `)
        .eq("user_type", "supplier")

      if (error) {
        throw error
      }

      // Filter out the test user
      const filteredData = data?.filter((supplier) => !supplier.business_name.includes("ArnavManduriLol")) || []

      setSuppliers(filteredData)
    } catch (error: any) {
      console.error("Error fetching suppliers:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch suppliers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.supplier_profile?.certification_authority || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !typeFilter || (supplier.supplier_profile?.supplier_type || "") === typeFilter

    return matchesSearch && matchesType
  })

  const supplierTypes = [
    ...new Set(suppliers.map((supplier) => supplier.supplier_profile?.supplier_type).filter(Boolean)),
  ]

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
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/listings" className="text-sm font-medium">
              Listings
            </Link>
            <Link href="/suppliers" className="text-sm font-medium">
              Suppliers
            </Link>
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Halal Food Suppliers Directory</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search by name, location, or certification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="type" className="sr-only">
                Supplier Type
              </Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Supplier Types</option>
                {supplierTypes.map((type) => (
                  <option key={type} value={type}>
                    {type?.charAt(0).toUpperCase() + type?.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredSuppliers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <CardTitle>{supplier.business_name}</CardTitle>
                    <CardDescription>
                      {supplier.supplier_profile?.supplier_type?.charAt(0).toUpperCase() +
                        supplier.supplier_profile?.supplier_type?.slice(1) || "Halal Supplier"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <p className="text-sm">{supplier.address || "Address not provided"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{supplier.phone || "Phone not provided"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{supplier.email}</p>
                      </div>
                      {supplier.supplier_profile?.certification_authority && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Certification:</p>
                          <p className="text-sm">{supplier.supplier_profile.certification_authority}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/dashboard/connect/${supplier.id}`}>
                      <Button className="w-full">Connect</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground mb-4">No suppliers found</p>
                <Link href="/signup?type=supplier">
                  <Button>Register as a Supplier</Button>
                </Link>
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
