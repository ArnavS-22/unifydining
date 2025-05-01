"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function InitChatPage() {
  const [isCreatingTables, setIsCreatingTables] = useState(false)
  const [isCreatingRooms, setIsCreatingRooms] = useState(false)
  const [tablesResult, setTablesResult] = useState<any>(null)
  const [roomsResult, setRoomsResult] = useState<any>(null)
  const { toast } = useToast()

  const createChatTables = async () => {
    setIsCreatingTables(true)
    setTablesResult(null)

    try {
      const response = await fetch("/api/create-chat-tables")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chat tables")
      }

      setTablesResult(data)
      toast({
        title: "Success",
        description: "Chat tables created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreatingTables(false)
    }
  }

  const createChatRooms = async () => {
    setIsCreatingRooms(true)
    setRoomsResult(null)

    try {
      const response = await fetch("/api/create-chat-rooms")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chat rooms")
      }

      setRoomsResult(data)
      toast({
        title: "Success",
        description: `Created ${data.created} chat rooms, ${data.existing} already existed`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreatingRooms(false)
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
            <Link href="/admin/init-chat" className="text-sm font-medium">
              Initialize Chat
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Initialize Chat System</h1>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Create Chat Tables</CardTitle>
                <CardDescription>This will create the necessary database tables for the chat system.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  First, we need to create the <code>chat_rooms</code> and <code>chat_messages</code> tables in your
                  Supabase database.
                </p>

                {tablesResult && (
                  <Alert variant={tablesResult.success ? "default" : "destructive"} className="mb-4">
                    <AlertTitle>{tablesResult.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{tablesResult.message || tablesResult.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={createChatTables}
                  disabled={isCreatingTables}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isCreatingTables ? "Creating Tables..." : "Create Chat Tables"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Create Chat Rooms</CardTitle>
                <CardDescription>This will create chat rooms for all existing connections.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  After creating the tables, we need to create chat rooms for all existing connections between
                  restaurants and suppliers.
                </p>

                {roomsResult && (
                  <Alert variant={roomsResult.success ? "default" : "destructive"} className="mb-4">
                    <AlertTitle>{roomsResult.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>
                      {roomsResult.message || roomsResult.error}
                      {roomsResult.success && (
                        <div className="mt-2">
                          <p>Created: {roomsResult.created}</p>
                          <p>Already existed: {roomsResult.existing}</p>
                          <p>Errors: {roomsResult.errors}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={createChatRooms}
                  disabled={isCreatingRooms || !tablesResult?.success}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isCreatingRooms ? "Creating Chat Rooms..." : "Create Chat Rooms"}
                </Button>
              </CardFooter>
            </Card>

            <div className="flex justify-between">
              <Link href="/admin">
                <Button variant="outline">Back to Admin Dashboard</Button>
              </Link>
              <Link href="/dashboard/chat">
                <Button variant="outline">Go to Chat</Button>
              </Link>
            </div>
          </div>
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
