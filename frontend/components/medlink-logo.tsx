import { cn } from "@/lib/utils"

export function MedLinkLogo({ className, size = "default" }: { className?: string; size?: "sm" | "default" | "lg" }) {
  const sizes = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
  }
  const textSizes = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative flex items-center justify-center rounded-xl bg-primary", sizes[size])}>
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" className="text-primary-foreground" stroke="currentColor" />
        </svg>
      </div>
      <span className={cn("font-heading font-bold tracking-tight text-foreground", textSizes[size])}>
        Med<span className="text-primary">Link</span>
      </span>
    </div>
  )
}
