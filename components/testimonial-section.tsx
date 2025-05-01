export function TestimonialSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 mb-2">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Users Say</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Hear from restaurants and suppliers who have found success with UnifyDining.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="UnifyDining helped us find reliable halal suppliers for our restaurant. The quality and consistency have been excellent."
            author="Ahmed Khan"
            role="Restaurant Owner"
          />
          <TestimonialCard
            quote="As a halal meat supplier, UnifyDining has connected us with dozens of new restaurant clients. Our business has grown 30% since joining."
            author="Fatima Ali"
            role="Halal Meat Supplier"
          />
          <TestimonialCard
            quote="The platform is intuitive and makes it easy to find exactly what we need. We've built great relationships with our suppliers."
            author="Michael Chen"
            role="Restaurant Manager"
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="flex flex-col p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="mb-4 text-emerald-600">
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
          className="h-8 w-8 opacity-50"
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
        </svg>
      </div>
      <p className="mb-4 text-muted-foreground italic">{quote}</p>
      <div className="mt-auto">
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
