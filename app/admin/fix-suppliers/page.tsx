"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function FixSuppliersPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const fixSupplierAccounts = async () => {
    setIsFixing(true)
    setResult(null)

    try {
      const response = await fetch("/api/fix-supplier-auth")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix supplier accounts")
      }

      setResult(data)
      toast({
        title: "Success",
        description: `Fixed ${data.results?.filter((r: any) => r.status === "fixed").length || 0} supplier accounts`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsFixing(false)
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
            <Link href="/admin/fix-suppliers" className="text-sm font-medium">
              Fix Suppliers
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Fix Supplier Accounts</h1>

          <Card>
            <CardHeader>
              <CardTitle>Fix Email Confirmation for Suppliers</CardTitle>
              <CardDescription>
                This tool will fix all supplier accounts by marking their emails as confirmed in Supabase Auth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Use this tool if supplier accounts are having trouble logging in due to email confirmation issues.
              </p>

              {result && (
                <div className="mt-4 space-y-4">
                  <Alert variant="default">
                    <AlertTitle>Results</AlertTitle>
                    <AlertDescription>
                      <p>Processed {result.results?.length || 0} supplier accounts</p>
                      <p>Fixed: {result.results?.filter((r: any) => r.status === "fixed").length || 0} accounts</p>
                      <p>Errors: {result.results?.filter((r: any) => r.status === "error").length || 0} accounts</p>
                    </AlertDescription>
                  </Alert>

                  <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                    <h3 className="font-medium mb-2">Detailed Results:</h3>
                    <ul className="space-y-2">
                      {result.results?.map((item: any, index: number) => (
                        <li
                          key={index}
                          className={`text-sm ${item.status === "error" ? "text-red-500" : "text-green-500"}`}
                        >
                          {item.supplier}: {item.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={fixSupplierAccounts} disabled={isFixing} className="bg-emerald-600 hover:bg-emerald-700">
                {isFixing ? "Fixing Accounts..." : "Fix All Supplier Accounts"}
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
