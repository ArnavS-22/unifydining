"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getUser, signOut } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getUser()
        if (!userData) {
          router.push("/login")
          return
        }

        setUser(userData)

        // Load profile data
        if (userData.id) {
          const { data, error } = await supabase?.from("users").select("*").eq("id", userData.id).single()

          if (error) {
            console.error("Error loading profile:", error)
          } else if (data) {
            setFormData({
              businessName: userData.user_metadata?.business_name || "",
              email: userData.email || "",
              phone: userData.user_metadata?.phone || "",
              address: userData.user_metadata?.address || "",
              description: data.description || "",
              website: data.website || "",
            })
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !supabase) return

    setSaving(true)

    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          business_name: formData.businessName,
          phone: formData.phone,
          address: formData.address,
        },
      })

      if (metadataError) {
        throw metadataError
      }

      // Update profile in users table
      const { error: profileError } = await supabase
        .from("users")
        .update({
          business_name: formData.businessName,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) {
        throw profileError
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

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
            {user?.user_metadata?.user_type === "supplier" && (
              <Link href="/dashboard/listings" className="text-sm font-medium">
                My Listings
              </Link>
            )}
            <Link href="/dashboard/connections" className="text-sm font-medium">
              Connections
            </Link>
            {user?.user_metadata?.user_type === "restaurant" && (
              <Link href="/dashboard/find-suppliers" className="text-sm font-medium">
                Find Suppliers
              </Link>
            )}
            <Link href="/dashboard/profile" className="text-sm font-medium">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and profile information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={formData.email} disabled readOnly />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell customers about your business..."
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
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
