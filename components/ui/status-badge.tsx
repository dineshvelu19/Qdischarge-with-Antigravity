/**
 * StatusBadge — Discharge status indicator
 * Usage: <StatusBadge status="pending" />  <StatusBadge status="discharged" size="sm" />
 */
import { cn } from "@/lib/utils"
import { statusColors, type DischargeStatus } from "@/lib/theme"

interface StatusBadgeProps {
  status: DischargeStatus
  size?: "sm" | "md"
  showDot?: boolean
  className?: string
}

export function StatusBadge({ status, size = "md", showDot = true, className }: StatusBadgeProps) {
  const { bg, text, dot, label } = statusColors[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{ background: bg, color: text }}
    >
      {showDot && (
        <span
          className="rounded-full shrink-0"
          style={{ background: dot, width: size === "sm" ? "5px" : "6px", height: size === "sm" ? "5px" : "6px" }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  )
}
