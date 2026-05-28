/**
 * QDischarge Design Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for colours, spacing, and semantic values used across
 * the app.  These mirror globals.css exactly — update both together.
 *
 * Usage (Tailwind utilities are preferred; use these for inline styles,
 * Canvas/SVG elements, or any place Tailwind classes cannot reach):
 *
 *   import { colors } from "@/lib/theme"
 *   style={{ background: colors.slate.DEFAULT }}
 */

// ── Raw Palette ──────────────────────────────────────────────────────────────
export const palette = {
  slate: {
    50:  "#EEF2F5",
    100: "#C8D6DF",
    200: "#91ADBF",
    400: "#2E7A9A",
    DEFAULT: "#0B3D4F",   // primary — navigation, card headers
    700: "#082F3D",
    900: "#05202B",
  },
  teal: {
    50:  "#E0F5F2",        // teal-soft — hover fills, secondary bg
    DEFAULT: "#00A896",   // accent — primary CTA: Approve, Finalise, Save
    700: "#007A6D",
  },
  amber: {
    50:  "#FEF4E3",        // amber-soft — warning backgrounds
    DEFAULT: "#E8930A",   // warning — urgent items only
    700: "#A05E00",
  },
  green: {
    50:  "#E3F5EE",        // green-soft — discharged/safe backgrounds
    DEFAULT: "#1A7A5A",   // success — cleared, discharged
    700: "#104830",
  },
  red: {
    50:  "#FDECEA",        // red-soft — critical backgrounds
    DEFAULT: "#C0392B",   // destructive — critical alerts, void actions
    700: "#8B2820",
  },
  cream: {
    DEFAULT: "#F7F4EF",   // page background — warmer than pure white
    dark:    "#EDE9E1",   // muted surfaces, table alternate rows
  },
  text: {
    primary:  "#1A2733",  // foreground — main body text
    secondary: "#4A6070", // muted-foreground — labels, metadata
    soft:      "#8A9BAA", // disabled / hint text
  },
  border: "#D0D8DC",
  white:  "#FFFFFF",
} as const

// ── Semantic Aliases ─────────────────────────────────────────────────────────
export const colors = {
  // Surfaces
  background:     palette.cream.DEFAULT,
  card:           palette.white,
  sidebar:        "#0D2E3D",

  // Text
  foreground:     palette.text.primary,
  mutedForeground: palette.text.secondary,

  // Actions
  primary:        palette.slate.DEFAULT,
  accent:         palette.teal.DEFAULT,
  warning:        palette.amber.DEFAULT,
  success:        palette.green.DEFAULT,
  destructive:    palette.red.DEFAULT,

  // Soft fills (badge backgrounds, icon containers)
  accentSoft:     palette.teal[50],
  warningSoft:    palette.amber[50],
  successSoft:    palette.green[50],
  destructiveSoft: palette.red[50],

  // Borders
  border:         palette.border,
} as const

// ── Status Colour Map ─────────────────────────────────────────────────────────
// Use with PatientStatus type from @/types
export type DischargeStatus =
  | "admitted"
  | "ready"
  | "pending"
  | "discharged"
  | "critical"
  | "on-hold"

export const statusColors: Record<
  DischargeStatus,
  { bg: string; text: string; dot: string; label: string }
 > = {
  admitted:   { bg: "#E8EEF2", text: palette.slate.DEFAULT, dot: palette.slate.DEFAULT,   label: "Admitted"    },
  ready:      { bg: palette.teal[50],  text: "#006A5F",              dot: palette.teal.DEFAULT,   label: "Ready"       },
  pending:    { bg: palette.amber[50], text: palette.amber[700],     dot: palette.amber.DEFAULT,  label: "Pending"     },
  discharged: { bg: palette.green[50], text: palette.green[700],     dot: palette.green.DEFAULT,  label: "Discharged"  },
  critical:   { bg: palette.red[50],   text: palette.red.DEFAULT,    dot: palette.red.DEFAULT,    label: "Critical"    },
  "on-hold":  { bg: "#FFF8E1",         text: "#6D4C00",              dot: "#C07A00",              label: "On Hold"     },
}

// ── Typography ────────────────────────────────────────────────────────────────
export const fonts = {
  sans: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
  mono: "var(--font-dm-mono), ui-monospace, monospace",
} as const

// ── Spacing & Radius ─────────────────────────────────────────────────────────
export const radius = {
  sm: "4px",
  md: "8px",    // default — tight & clinical
  lg: "10px",   // cards
  xl: "14px",   // modals, sheets
  full: "9999px",
} as const

// ── Z-Index ───────────────────────────────────────────────────────────────────
export const zIndex = {
  nav:     100,
  sidebar: 90,
  modal:   200,
  toast:   300,
} as const
