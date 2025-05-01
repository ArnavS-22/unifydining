"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Listing {
  id: number
  supplier_id: string
  title: string
  description: string
  category: string
  price: number
  unit: string
  certification_details: string
  images: string[]
  created_at: string
  updated_at: string
  supplier?: {
    business_name: string
    email: string
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
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
      // Modified query to remove the is_available filter
      const { data, error } = await supabase.from("supplier_listings").select(`
          *,
          supplier:supplier_id (
            business_name,
            email
          )
        `)

      if (error) {
        throw error
      }

      setListings(data || [])
    } catch (error: any) {
      console.error("Error fetching listings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch listings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.supplier?.business_name || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !categoryFilter || listing.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(listings.map((listing) => listing.category))]

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
          <h1 className="text-3xl font-bold mb-6">Halal Food Supplier Listings</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search by name, description, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="category" className="sr-only">
                Category
              </Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                        No image available
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{listing.title}</CardTitle>
                    <CardDescription>{listing.supplier?.business_name || "Unknown Supplier"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{listing.description}</p>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          ${listing.price} / {listing.unit}
                        </span>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {listing.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/listings/${listing.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground mb-4">No listings found</p>
                <Link href="/dashboard/create-listing">
                  <Button>Create a Listing</Button>
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
