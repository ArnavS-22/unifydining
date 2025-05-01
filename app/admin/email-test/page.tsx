"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function EmailTestPage() {
  const [activeTab, setActiveTab] = useState("signup")
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  // Signup notification test state
  const [signupData, setSignupData] = useState({
    userEmail: "",
    businessName: "",
    userType: "restaurant",
    phone: "",
    address: "",
    restaurantType: "full-service",
    supplierType: "butcher",
    certification: "",
  })

  const handleSignupDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSignupData({
      ...signupData,
      [id]: value,
    })
  }

  const handleUserTypeChange = (value: string) => {
    setSignupData({
      ...signupData,
      userType: value,
    })
  }

  const handleRestaurantTypeChange = (value: string) => {
    setSignupData({
      ...signupData,
      restaurantType: value,
    })
  }

  const handleSupplierTypeChange = (value: string) => {
    setSignupData({
      ...signupData,
      supplierType: value,
    })
  }

  const testSignupEmail = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/notify-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: "Email test successful! Check your inbox.",
        })
        toast({
          title: "Email Test Successful",
          description: "The test emails have been sent successfully.",
        })
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to send test email.",
        })
        toast({
          title: "Email Test Failed",
          description: data.error || "Failed to send test email.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "An unexpected error occurred.",
      })
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
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
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Email System Test</h1>

          <Card>
            <CardHeader>
              <CardTitle>Test Email Notifications</CardTitle>
              <CardDescription>
                Use this tool to test the email notification system. Emails will be sent to the specified addresses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="signup">Signup Notification</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">User Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={signupData.userEmail}
                      onChange={handleSignupDataChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Business Name"
                      value={signupData.businessName}
                      onChange={handleSignupDataChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>User Type</Label>
                    <RadioGroup
                      value={signupData.userType}
                      onValueChange={handleUserTypeChange}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="restaurant" id="restaurant" />
                        <Label htmlFor="restaurant" className="font-normal">
                          Restaurant
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="supplier" id="supplier" />
                        <Label htmlFor="supplier" className="font-normal">
                          Supplier
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Phone Number"
                      value={signupData.phone}
                      onChange={handleSignupDataChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Business Address"
                      value={signupData.address}
                      onChange={handleSignupDataChange}
                    />
                  </div>

                  {signupData.userType === "restaurant" && (
                    <div className="space-y-2">
                      <Label>Restaurant Type</Label>
                      <RadioGroup
                        value={signupData.restaurantType}
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
                  )}

                  {signupData.userType === "supplier" && (
                    <>
                      <div className="space-y-2">
                        <Label>Supplier Type</Label>
                        <RadioGroup
                          value={signupData.supplierType}
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
                        <Label htmlFor="certification">Certification</Label>
                        <Input
                          id="certification"
                          placeholder="Halal Certification Details"
                          value={signupData.certification}
                          onChange={handleSignupDataChange}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              {testResult && (
                <div
                  className={`mt-6 p-4 rounded-md ${
                    testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{testResult.success ? "Success" : "Error"}</p>
                      <p>{testResult.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={testSignupEmail}
                disabled={isLoading || !signupData.userEmail || !signupData.businessName}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Sending Test Email..." : "Send Test Email"}
              </Button>
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
