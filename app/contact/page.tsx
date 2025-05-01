import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Listings
            </Link>
            <Link href="/suppliers" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Suppliers
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:text-emerald-600 hover:bg-emerald-50">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact Us</h1>
            <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px]">
              Have questions about UnifyDining? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us directly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">(408) 517-0489</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">unifydining@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">San Francisco Bay Area, California</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Find what you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/signup?type=restaurant">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Join as Restaurant</Button>
                </Link>
                <Link href="/signup?type=supplier">
                  <Button className="w-full" variant="outline">
                    Join as Supplier
                  </Button>
                </Link>
                <Link href="/listings">
                  <Button className="w-full" variant="outline">
                    Browse Listings
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
