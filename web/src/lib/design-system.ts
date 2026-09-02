/**
 * RatchetAI Design System Tokens & Constants
 * Standard Alignment: 60-30-10 Color Rule, WCAG 2.1 AAA, NN/g Usability Standards
 */

export const DESIGN_TOKENS = {
  colors: {
    base: {
      bg: "#030712", // 60% Dominant Canvas (Slate 950)
      surface: "rgba(15, 23, 42, 0.75)", // 30% Structural Glass
      elevated: "rgba(30, 41, 59, 0.85)", // Modals & Popovers
      border: "rgba(51, 65, 85, 0.6)", // Border Subtle
    },
    accent: {
      cyan: "#06b6d4", // 10% Primary Action & Research Status
      emerald: "#10b981", // Validated / Advance
      amber: "#f59e0b", // Second Look / Warning
      rose: "#f43f5e", // Park / Red Flag / Error
      purple: "#a855f7", // Ideation / Hypothesis
    },
  },
  typography: {
    fontSans: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    fontMono: "var(--font-geist-mono), ui-monospace, monospace",
  },
  animation: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    standard: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  radius: {
    badge: "8px",
    button: "12px",
    card: "16px",
    modal: "24px",
  },
} as const;
