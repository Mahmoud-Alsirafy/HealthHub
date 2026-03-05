import { MedLinkLogo } from "@/components/medlink-logo"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <MedLinkLogo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {"Egypt's National Smart Medical Record System. Secure, unified, and accessible healthcare for every citizen."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Platform</h4>
            <ul className="mt-3 space-y-2">
              {["Features", "Security", "How It Works", "API"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Support</h4>
            <ul className="mt-3 space-y-2">
              {["Help Center", "Contact", "Status", "Documentation"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="mt-3 space-y-2">
              {["Privacy Policy", "Terms of Service", "Data Protection", "Compliance"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">2026 MedLink. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">A National Healthcare Initiative</p>
        </div>
      </div>
    </footer>
  )
}
