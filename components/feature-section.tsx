import type React from "react"
import { CheckCircle, Search, Users, Award } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 mb-2">
              Our Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose UnifyDining?</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              We provide a seamless platform for connecting halal food suppliers with restaurants.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Search className="h-10 w-10 text-emerald-600" />}
            title="Easy Discovery"
            description="Find certified halal suppliers in your area with our powerful search tools."
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-emerald-600" />}
            title="Verified Suppliers"
            description="All suppliers are verified to ensure they meet halal certification standards."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-emerald-600" />}
            title="Direct Connections"
            description="Connect directly with suppliers without intermediaries."
          />
          <FeatureCard
            icon={<Award className="h-10 w-10 text-emerald-600" />}
            title="Quality Assurance"
            description="Suppliers maintain high standards of quality and service."
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-emerald-600" />}
            title="Transparent Pricing"
            description="Clear pricing information helps restaurants make informed decisions."
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-emerald-600" />}
            title="Streamlined Communication"
            description="Efficient messaging system for seamless communication."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 rounded-full bg-emerald-50 p-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
