"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function DeleteTestPage() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const deleteTestUser = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/admin/delete-test-user", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Test user deleted successfully",
        })
      } else {
        throw new Error(data.error || "Failed to delete test user")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
            <Link href="/admin/delete-test" className="text-sm font-medium">
              Delete Test Users
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Delete Test Users</h1>

          <Card>
            <CardHeader>
              <CardTitle>Delete Test User</CardTitle>
              <CardDescription>Remove test users from the database. This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This will delete the test user "ArnavManduriLol" and all associated data.</p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={deleteTestUser} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Test User"}
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
