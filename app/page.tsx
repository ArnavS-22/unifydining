import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
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

      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
      </main>

      <Footer />
    </div>
  )
}
