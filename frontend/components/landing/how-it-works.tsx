import { UserPlus, Stethoscope, ScanLine } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register with National ID",
    description: "Citizens register using their National ID. A unique digital medical record and QR code are generated instantly.",
  },
  {
    icon: Stethoscope,
    step: "02",
    title: "Doctor Updates Record",
    description: "Authorized doctors add diagnoses, prescriptions, lab results, and notes. Everything is securely synced in real-time.",
  },
  {
    icon: ScanLine,
    step: "03",
    title: "Emergency QR Access",
    description: "In emergencies, paramedics scan the patient's QR code to instantly access critical medical information without login.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-secondary/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</span>
          <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three Simple Steps
          </h2>
        </div>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <item.icon className="h-7 w-7" />
                </div>
                <span className="mt-4 text-sm font-bold text-primary">Step {item.step}</span>
                <h3 className="mt-2 font-heading text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
