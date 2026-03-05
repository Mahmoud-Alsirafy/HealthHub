import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Activity, FileText, QrCode, Users } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.05_240)_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 lg:px-8 lg:pt-32 lg:pb-28">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Secure & Encrypted Healthcare Platform</span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            Med<span className="text-primary">Link</span>
          </h1>
          <p className="mt-3 font-heading text-balance text-lg font-medium text-muted-foreground sm:text-xl lg:text-2xl">
            {"Egypt's National Smart Medical Record System"}
          </p>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            A centralized, encrypted digital medical record for every citizen, connected to their National ID.
            Instant QR-based emergency access, seamless doctor collaboration, and real-time healthcare analytics
            {"  for a healthier Egypt."}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" className="px-8 text-base" asChild>
              <Link href="/login?tab=register">Request Access</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-base" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 w-full max-w-4xl">
            <div className="relative rounded-2xl border border-border/50 bg-card p-2 shadow-2xl shadow-primary/5">
              <div className="rounded-xl bg-secondary/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-destructive/50" />
                  <div className="h-3 w-3 rounded-full bg-accent/70" />
                  <div className="h-3 w-3 rounded-full bg-primary/30" />
                  <div className="ml-4 h-5 w-48 rounded-md bg-border/70" />
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { icon: FileText, label: "Records", value: "18,450" },
                    { icon: Users, label: "Patients", value: "12,340" },
                    { icon: Activity, label: "Active", value: "847" },
                    { icon: QrCode, label: "QR Scans", value: "3,291" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                      <stat.icon className="h-5 w-5 text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="col-span-2 rounded-xl border border-border/50 bg-card p-4">
                    <div className="mb-3 h-4 w-32 rounded bg-border/70" />
                    <div className="flex items-end gap-2">
                      {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 65, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-primary/20"
                          style={{ height: `${h}px` }}
                        >
                          <div
                            className="w-full rounded-t bg-primary"
                            style={{ height: `${h * 0.7}px`, marginTop: `${h * 0.3}px` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-4">
                    <div className="mb-3 h-4 w-24 rounded bg-border/70" />
                    <div className="space-y-3">
                      {[75, 60, 45, 30].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-secondary">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${w}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{w}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
