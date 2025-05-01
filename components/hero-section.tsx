import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-emerald-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500">
              Connect with Halal Food Suppliers
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              UnifyDining helps restaurants find certified halal suppliers and helps suppliers reach new customers.
            </p>
          </div>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex">
            <Link href="/signup?type=restaurant">
              <Button size="lg" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                Join as Restaurant
              </Button>
            </Link>
            <Link href="/signup?type=supplier">
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-auto border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Join as Supplier
              </Button>
            </Link>
          </div>
          <div className="mt-8 md:mt-16 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg blur opacity-30"></div>
            <div className="relative bg-white p-2 rounded-lg shadow-lg">
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="UnifyDining Platform"
                className="rounded border border-gray-200 w-full max-w-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
