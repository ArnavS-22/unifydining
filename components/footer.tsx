import Link from "next/link"
import { Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">UD</span>
              </div>
              <span className="font-bold text-xl">UnifyDining</span>
            </Link>
            <p className="text-sm text-muted-foreground">Connecting halal food suppliers with restaurants.</p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">(408) 517-0489</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">unifydining@gmail.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">For Restaurants</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/suppliers"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Find Suppliers
                </Link>
              </li>
              <li>
                <Link
                  href="/signup?type=restaurant"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Join as Restaurant
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/restaurants"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">For Suppliers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/listings"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Create Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/signup?type=supplier"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Join as Supplier
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/suppliers"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UnifyDining. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
