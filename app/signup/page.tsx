"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { signUp } from "@/lib/auth"

interface RestaurantData {
  name: string
  email: string
  phone: string
  address: string
  password: string
  restaurantType: string
}

interface SupplierData {
  name: string
  email: string
  phone: string
  address: string
  password: string
  supplierType: string
  certification: string
}

export default function SignupPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("restaurant")
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseError, setSupabaseError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Restaurant form state
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    restaurantType: "full-service",
  })

  // Supplier form state
  const [supplierData, setSupplierData] = useState<SupplierData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    supplierType: "butcher",
    certification: "",
  })

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "restaurant" || type === "supplier") {
      setActiveTab(type)
    }

    // Check if Supabase client is available
    if (!supabase) {
      setSupabaseError(true)
    }
  }, [searchParams, supabase])

  const handleRestaurantChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setRestaurantData({
      ...restaurantData,
      [id.replace("restaurant-", "")]: value,
    })
  }

  const handleSupplierChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSupplierData({
      ...supplierData,
      [id.replace("supplier-", "")]: value,
    })
  }

  const handleRestaurantTypeChange = (value: string) => {
    setRestaurantData({
      ...restaurantData,
      restaurantType: value,
    })
  }

  const handleSupplierTypeChange = (value: string) => {
    setSupplierData({
      ...supplierData,
      supplierType: value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!supabase) {
      toast({
        title: "Error",
        description: "Supabase client is not initialized. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    // Add password validation
    const formData = activeTab === "restaurant" ? restaurantData : supplierData
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = activeTab === "restaurant" ? restaurantData : supplierData

      // Prepare user metadata for Supabase
      const userData: Record<string, any> = {
        business_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        user_type: activeTab,
      }

      if (activeTab === "restaurant") {
        userData.restaurant_type = restaurantData.restaurantType
      } else {
        userData.supplier_type = supplierData.supplierType
        userData.certification = supplierData.certification
      }

      console.log("Attempting to sign up user:", {
        email: formData.email,
        userData: { ...userData, password: "REDACTED" },
      })

      // Use our custom signUp function instead of direct Supabase call
      const { data, error } = await signUp(formData.email, formData.password, userData)

      if (error) {
        console.error("Signup error returned:", error)
        throw error
      }

      console.log("Signup successful:", data?.user?.id)

      toast({
        title: "Account created successfully!",
        description: "You can now log in to your account.",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error: any) {
      console.error("Signup error caught:", error)
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Join our platform to connect with halal suppliers or restaurants</CardDescription>
          </CardHeader>

          {supabaseError && (
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Supabase client is not initialized. Please check your environment variables.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                  <TabsTrigger value="supplier">Supplier</TabsTrigger>
                </TabsList>
                <TabsContent value="restaurant" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                      id="restaurant-name"
                      placeholder="Your Restaurant Name"
                      value={restaurantData.name}
                      onChange={handleRestaurantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-email">Business Email</Label>
                    <Input
                      id="restaurant-email"
                      type="email"
                      placeholder="restaurant@example.com"
                      value={restaurantData.email}
                      onChange={handleRestaurantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-phone">Phone Number</Label>
                    <Input
                      id="restaurant-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={restaurantData.phone}
                      onChange={handleRestaurantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-address">Restaurant Address</Label>
                    <Input
                      id="restaurant-address"
                      placeholder="123 Main St, City, State"
                      value={restaurantData.address}
                      onChange={handleRestaurantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-password">Password</Label>
                    <Input
                      id="restaurant-password"
                      type="password"
                      value={restaurantData.password}
                      onChange={handleRestaurantChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">Password must be at least 6 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Restaurant Type</Label>
                    <RadioGroup
                      value={restaurantData.restaurantType}
                      onValueChange={handleRestaurantTypeChange}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full-service" id="full-service" />
                        <Label htmlFor="full-service" className="font-normal">
                          Full-Service Restaurant
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fast-casual" id="fast-casual" />
                        <Label htmlFor="fast-casual" className="font-normal">
                          Fast-Casual
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cafe" id="cafe" />
                        <Label htmlFor="cafe" className="font-normal">
                          Café
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other-restaurant" />
                        <Label htmlFor="other-restaurant" className="font-normal">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>
                <TabsContent value="supplier" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier-name">Business Name</Label>
                    <Input
                      id="supplier-name"
                      placeholder="Your Business Name"
                      value={supplierData.name}
                      onChange={handleSupplierChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-email">Business Email</Label>
                    <Input
                      id="supplier-email"
                      type="email"
                      placeholder="supplier@example.com"
                      value={supplierData.email}
                      onChange={handleSupplierChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-phone">Phone Number</Label>
                    <Input
                      id="supplier-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={supplierData.phone}
                      onChange={handleSupplierChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-address">Business Address</Label>
                    <Input
                      id="supplier-address"
                      placeholder="123 Main St, City, State"
                      value={supplierData.address}
                      onChange={handleSupplierChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-password">Password</Label>
                    <Input
                      id="supplier-password"
                      type="password"
                      value={supplierData.password}
                      onChange={handleSupplierChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">Password must be at least 6 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier Type</Label>
                    <RadioGroup
                      value={supplierData.supplierType}
                      onValueChange={handleSupplierTypeChange}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="butcher" id="butcher" />
                        <Label htmlFor="butcher" className="font-normal">
                          Halal Butcher
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wholesaler" id="wholesaler" />
                        <Label htmlFor="wholesaler" className="font-normal">
                          Halal Wholesaler
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="distributor" id="distributor" />
                        <Label htmlFor="distributor" className="font-normal">
                          Food Distributor
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other-supplier" />
                        <Label htmlFor="other-supplier" className="font-normal">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-certification">Halal Certification Details</Label>
                    <Input
                      id="supplier-certification"
                      placeholder="Certification authority and number"
                      value={supplierData.certification}
                      onChange={handleSupplierChange}
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                type="submit"
                disabled={isLoading || supabaseError}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 underline-offset-4 hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
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
