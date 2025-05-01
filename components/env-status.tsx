"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Settings } from "lucide-react"

export function EnvStatus() {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseKey: false,
    smtpConfig: false,
  })

  useEffect(() => {
    // Check environment variables
    const checkEnv = async () => {
      try {
        setEnvStatus({
          supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          smtpConfig: !!(
            process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USERNAME &&
            process.env.SMTP_PASSWORD
          ),
        })
      } catch (error) {
        console.error("Error checking environment variables:", error)
      }
    }

    checkEnv()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Environment Status
        </CardTitle>
        <CardDescription>Check the status of your environment variables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium mb-2">Application Status</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {envStatus.supabaseUrl ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">NEXT_PUBLIC_SUPABASE_URL</p>
                <p className="text-sm text-muted-foreground">Required for Supabase connection</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {envStatus.supabaseKey ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                <p className="text-sm text-muted-foreground">Required for Supabase authentication</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {envStatus.smtpConfig ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">SMTP_* (HOST, PORT, USERNAME, PASSWORD)</p>
                <p className="text-sm text-muted-foreground">Required for email notifications</p>
              </div>
            </div>
          </div>
        </div>

        {(!envStatus.supabaseUrl || !envStatus.supabaseKey) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Error</AlertTitle>
            <AlertDescription>
              Supabase connection variables are missing. The application will not function correctly.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  )
}
