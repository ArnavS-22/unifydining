"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Database } from "lucide-react"

export function DatabaseSetup() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const initializeDatabase = async () => {
    setStatus("loading")
    setMessage("Initializing database...")

    try {
      const response = await fetch("/api/init-database")
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Database initialized successfully")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to initialize database")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "An unexpected error occurred")
    }
  }

  useEffect(() => {
    // Auto-initialize on component mount
    initializeDatabase()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Initialize and check your Supabase database connection</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Processing
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="border-green-500 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDatabase} disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Initializing..." : "Reinitialize Database"}
        </Button>
      </CardFooter>
    </Card>
  )
}
