import { Shield } from "lucide-react"

export function TrustedBy() {
  return (
    <section className="border-y border-border/50 bg-card/50 py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground mb-6">Trusted by National Healthcare Institutions</p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {[
            "Ministry of Health",
            "Cairo University Hospital",
            "National Health Insurance",
            "Egyptian Medical Syndicate",
          ].map((name) => (
            <div key={name} className="flex items-center gap-2 text-muted-foreground/60">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
