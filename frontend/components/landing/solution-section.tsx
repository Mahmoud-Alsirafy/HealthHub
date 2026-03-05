import { CheckCircle, ArrowRight } from "lucide-react"

const solutions = [
  "One unified digital record per citizen linked to National ID",
  "Instant emergency access via QR code - no login required",
  "End-to-end encrypted data with role-based access control",
  "Real-time healthcare analytics for national planning",
  "Seamless collaboration between doctors and facilities",
  "Eliminate redundant tests with shared lab results",
]

export function SolutionSection() {
  return (
    <section id="security" className="bg-primary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">The Solution</span>
            <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              MedLink Connects Everything
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-primary-foreground/80">
              MedLink provides a centralized, encrypted platform that gives every Egyptian citizen a smart digital medical
              record accessible across all healthcare facilities nationwide.
            </p>
            <ul className="mt-8 space-y-4">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-foreground/90" />
                  <span className="text-sm leading-relaxed text-primary-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 backdrop-blur-sm">
              <div className="space-y-4">
                {/* Simulated patient card */}
                <div className="rounded-xl bg-primary-foreground/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">AH</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary-foreground">Ahmed Mohamed Hassan</p>
                      <p className="text-xs text-primary-foreground/60">National ID: 29901151234***</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary-foreground/10 p-3">
                    <p className="text-xs text-primary-foreground/60">Blood Type</p>
                    <p className="text-lg font-bold text-primary-foreground">O+</p>
                  </div>
                  <div className="rounded-lg bg-primary-foreground/10 p-3">
                    <p className="text-xs text-primary-foreground/60">Allergies</p>
                    <p className="text-lg font-bold text-primary-foreground">3</p>
                  </div>
                </div>
                <div className="rounded-lg bg-primary-foreground/10 p-3">
                  <p className="text-xs text-primary-foreground/60 mb-2">Active Medications</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-foreground">Lisinopril 10mg</span>
                      <ArrowRight className="h-3 w-3 text-primary-foreground/40" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-foreground">Metformin 500mg</span>
                      <ArrowRight className="h-3 w-3 text-primary-foreground/40" />
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
