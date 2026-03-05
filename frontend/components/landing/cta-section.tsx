import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center lg:px-16 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,oklch(0.6_0.15_200)_0%,transparent_50%)] opacity-30" />
          <div className="relative">
            <h2 className="font-heading text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
              Ready to Transform Healthcare?
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-pretty text-primary-foreground/80 leading-relaxed">
              Join the national initiative to digitize healthcare records. Request access for your facility or register as a healthcare professional.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Button size="lg" variant="secondary" className="px-8 text-base" asChild>
                <Link href="/login?tab=register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/emergency">Emergency Access Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
