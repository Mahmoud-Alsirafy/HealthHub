import { AlertTriangle, Clock, FileX, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const problems = [
  {
    icon: FileX,
    title: "Lost Medical Records",
    description: "Paper-based records are easily lost, damaged, or incomplete. Patients carry files between facilities with no centralized system.",
  },
  {
    icon: Clock,
    title: "Slow Emergency Response",
    description: "In emergencies, paramedics have no access to patient history, allergies, or current medications, risking lives.",
  },
  {
    icon: RefreshCw,
    title: "Repeated Tests & Costs",
    description: "Without shared records, patients undergo redundant lab tests and diagnostics, wasting time and money.",
  },
  {
    icon: AlertTriangle,
    title: "No Data-Driven Insights",
    description: "Healthcare authorities lack real-time analytics to track disease patterns, allocate resources, or plan interventions.",
  },
]

export function ProblemSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-destructive">The Problem</span>
          <h2 className="font-heading mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {"Healthcare Challenges in Egypt"}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-pretty text-muted-foreground leading-relaxed">
            {"Millions of Egyptians face fragmented healthcare due to disconnected systems and outdated record-keeping methods."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {problems.map((problem) => (
            <Card key={problem.title} className="border-destructive/10 bg-destructive/[0.02]">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <problem.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{problem.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{problem.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
