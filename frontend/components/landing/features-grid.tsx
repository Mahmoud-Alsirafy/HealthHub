import { FileText, QrCode, Shield, Users, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: FileText,
    title: "Unified Patient Records",
    description: "Complete medical history in one place. Every diagnosis, prescription, lab result, and visit accessible across all facilities.",
  },
  {
    icon: QrCode,
    title: "QR Emergency Access",
    description: "Paramedics scan a QR code to instantly view critical info: blood type, allergies, chronic diseases, and current medications.",
  },
  {
    icon: Shield,
    title: "Secure Encrypted Database",
    description: "Military-grade AES-256 encryption protects all patient data. HIPAA-compliant security protocols and regular audits.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description: "Granular permissions for patients, doctors, facilities, and paramedics. Everyone sees only what they need.",
  },
  {
    icon: BarChart3,
    title: "National Healthcare Analytics",
    description: "Real-time dashboards tracking disease patterns, resource allocation, and healthcare metrics across all of Egypt.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Features</span>
          <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need for Smart Healthcare
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card key={feature.title} className={`group transition-all hover:shadow-lg hover:shadow-primary/5 ${i >= 3 ? "sm:col-span-1 lg:col-span-1" : ""}`}>
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
