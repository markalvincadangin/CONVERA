> [!WARNING]
> **SUPERSEDED / HISTORICAL BASELINE SPECIFICATION**
> This document is an early monolithic Design System draft.
> It has been **fully superseded, expanded, and ratified** in the canonical Phase 6 presentation suite:
> - Canonical Design System: [`docs/06-frontend/DESIGN_SYSTEM.md`](../../06-frontend/DESIGN_SYSTEM.md)
> - UI/UX Interaction Principles: [`docs/06-frontend/UI_UX_PRINCIPLES.md`](../../06-frontend/UI_UX_PRINCIPLES.md)
> - Information Architecture: [`docs/06-frontend/INFORMATION_ARCHITECTURE.md`](../../06-frontend/INFORMATION_ARCHITECTURE.md)
> - Accessibility & WCAG 2.2 AA: [`docs/06-frontend/ACCESSIBILITY.md`](../../06-frontend/ACCESSIBILITY.md)
>
> In accordance with **Constitution Article VII (Documentation Authority)**, the ratified modular documents take absolute precedence.


---

# CONVERA Design System Specification (v3.0)

**Parent Brand:** EMAERX  
**Product:** CONVERA — Evidence-Driven Project Intelligence and Opportunity Validation System  
**Tagline:** *WHERE POSSIBILITIES CONVERGE INTO DIRECTION.*  
**Standard Alignment:** WCAG 2.2 AA / AAA • Nielsen Norman Group 10 Usability Heuristics • 60-30-10 Color Hierarchy  

---

## 1. Design Philosophy & Golden Rules

1. **Clarity Over Decoration:** Every visual element must serve a functional purpose—communicating evidence confidence, assumption risk, or venture decision status.
2. **The Mechanical Ratchet & Convergence Metaphor:** Visual language mirrors futuristic engineering—solid structural anchors, high-contrast status ratchets, and unyielding empirical gates.
3. **No Solution Bias in UI:** Problem analysis and discovery spaces use analytical deep obsidian and electric blue/cyan tones; solution and economic spaces use vibrant emerald/teal accents.
4. **Touch-First Accessibility:** All interactive elements maintain a minimum 44x44px touch target with clear focus indicators.

---

## 2. Color System (60-30-10 Rule)

```mermaid
graph TD
    subgraph Base["60% DOMINANT BASE (Global Viewport Canvas & Deep Backgrounds)"]
        B1["Obsidian Black (#0B0F14 / slate-950)"]
        B2["Midnight Void (#030712)"]
    end

    subgraph Structure["30% STRUCTURAL SURFACES (Cards, Headers, Modals & Grids)"]
        S1["Frosted Slate Glass (rgba(15,23,42,0.75) + backdrop-blur)"]
        S2["Border Slate (#1E293B / rgba(51,65,85,0.6))"]
    end

    subgraph Accents["10% INTENTIONAL ACCENTS (Triggers, Verdicts & Telemetry)"]
        A1["EMAERX Electric Blue (#0066FF) — Primary Action"]
        A2["Active Cyan (#06B6D4) — Research Telemetry"]
        A3["Emerald (#10B981) — Validated Claims / Pass"]
        A4["Amber (#F59E0B) — Pending Risk / Workaround"]
        A5["Rose (#F43F5E) — Critical Friction / Pivot"]
    end

    Base --> Structure --> Accents

    style Base fill:#0b0f14,stroke:#334155,color:#94a3b8
    style Structure fill:#0f172a,stroke:#475569,color:#cbd5e1
    style Accents fill:#0066ff,stroke:#60a5fa,color:#ffffff
```

### 2.1 Brand & Semantic Token Palette

| Token Name | Hex / Value | Semantic Role | Contrast vs #0B0F14 |
|---|---|---|---|
| `--color-brand-primary` | `#0066FF` | EMAERX Electric Blue primary brand accent | **8.1:1 (AAA)** |
| `--color-bg-base` | `#0B0F14` | Global viewport canvas (Obsidian Black) | Base |
| `--color-surface-glass` | `rgba(15, 23, 42, 0.75)` | Glassmorphism card surfaces | Structure |
| `--color-surface-elevated` | `rgba(30, 41, 59, 0.85)` | Modals, drawers, dropdowns | 3.2:1 |
| `--color-border-subtle` | `rgba(51, 65, 85, 0.6)` | Card and table borders | 2.1:1 |
| `--color-text-primary` | `#FFFFFF` (Arctic White) | Headings and critical data | **19.5:1 (AAA)** |
| `--color-text-secondary` | `#A7B0C0` (Silver Gray) | Descriptions and metadata | **8.4:1 (AAA)** |
| `--color-accent-cyan` | `#06B6D4` (Cyan-500) | Research telemetry, active selection | **7.4:1 (AA)** |
| `--color-accent-emerald` | `#10B981` (Emerald-500) | Validated claims, passed gates | **7.1:1 (AA)** |
| `--color-accent-amber` | `#F59E0B` (Amber-500) | Workarounds, pending assumptions | **6.5:1 (AA)** |
| `--color-accent-rose` | `#F43F5E` (Rose-500) | Critical risks, pivot loop actions | **5.8:1 (AA)** |

---

## 3. Typography Hierarchy

- **Brand & Headings:** `Exo 2` (Futuristic engineering, geometric, high-contrast)
- **Product UI & Body:** `Inter` (Optimal legibility, clean human-centered spacing)
- **Code & Telemetry:** `JetBrains Mono` (DOIs, Share Codes, Claims, and Metrics)

```css
/* Typography Scale */
--text-display: 1.875rem / 2.25rem (30px / 36px), font-weight: 800; /* Exo 2 */
--text-heading: 1.25rem / 1.75rem (20px / 28px), font-weight: 700;   /* Exo 2 */
--text-subhead: 1.00rem / 1.50rem (16px / 24px), font-weight: 600;   /* Inter */
--text-body:    0.875rem / 1.25rem (14px / 20px), font-weight: 400;  /* Inter */
--text-caption: 0.75rem / 1.00rem (12px / 16px), font-weight: 500;  /* Inter */
--text-mono:    0.6875rem / 0.95rem (11px / 15px), font-weight: 700; /* JetBrains Mono */
```

---

## 4. Component Standards

### 4.1 Step 1: Evidence Ledger & Assumption Radar
- **Evidence Ledger (`<EvidenceLedgerCard />`):** 4-claim matrix with Commercial (WTP) vs Civic/Academic Institutional feasibility toggle.
- **Assumption Radar (`<AssumptionRadarCard />`):** Prioritized risk tiers (Critical, High, Medium, Low) with 1-tap Mom Test question copy.

### 4.2 Step 2: Decision Room & Timeline
- **Decision Room (`<DecisionRoomWorkspace />`):** Side-by-side candidate comparison with AI Judge explainable ranking and 1-click winner commitment.
- **Decision Timeline (`<DecisionTimelineModal />`):** Chronological audit trail of all selections, rejected alternatives, and pivot loops.

### 4.3 Step 3: Project Translation (SRS Spec)
- **SRS Spec Viewer (`<SrsSpecView />`):** Dual-mode IEEE 830 / CHED CICT Capstone and Startup MVP specification view with 1-click Markdown copy.

---

## 5. Accessibility & Heuristic Compliance

- **WCAG 2.2 AA/AAA:** High contrast text ratios strictly >= 4.5:1 for body and >= 3:1 for large headings.
- **Nielsen Norman Heuristic 1 (Visibility of System Status):** Clear progress indicators, phase lock badges, and model attribution pills.
- **Nielsen Norman Heuristic 5 (Error Prevention):** Irreversible actions (Archive, Reset, Pivot) require explicit user confirmation.

---

## 7. Interactive Component State Matrix (9 Standard States)

Every interactive element (Buttons, Input Fields, Selectors, Table Rows, and Card Items) in CONVERA must implement the full **9-State Matrix** to guarantee cognitive predictability and WCAG 2.2 AA compliance:

```text
┌─────────────────────────┬─────────────────────────────────────────────────────────────────────────┐
│ State                   │ Visual Behavior & Accessibility Token                                  │
├─────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
│ 1. Default (Idle)       │ bg-slate-900/80, border-slate-800, text-slate-200, shadow-sm            │
│ 2. Hover                │ border-cyan-500/50, bg-slate-850, shadow-cyan-500/10, scale-[1.01]       │
│ 3. Focus-Visible (A11y) │ ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 outline-none    │
│ 4. Active (Pressed)     │ scale-[0.98], bg-slate-800, border-cyan-500/80                          │
│ 5. Disabled             │ opacity-40 cursor-not-allowed pointer-events-none select-none           │
│ 6. Loading (Busy)       │ Spinner animation, opacity-75, cursor-wait, aria-busy="true"            │
│ 7. Success              │ border-emerald-500/50 bg-emerald-950/30 text-emerald-300                │
│ 8. Warning              │ border-amber-500/50 bg-amber-950/30 text-amber-300                      │
│ 9. Error / Destructive  │ border-rose-500/50 bg-rose-950/30 text-rose-300                         │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Toast Notifications & Custom Dialog Standards

Browser-native `alert()`, `confirm()`, and `prompt()` dialogs are **strictly banned** across the CONVERA codebase. They violate design consistency, block UI rendering, and break accessibility.

### 8.1 Toast Notification System (`useToast()`)
- **Hook:** `const toast = useToast();`
- **Variants:**
  - `toast.success(message, title?, duration?)`: Emerald accent with CheckCircle2.
  - `toast.error(message, title?, duration?)`: Rose accent with AlertCircle.
  - `toast.warning(message, title?, duration?)`: Amber accent with AlertTriangle.
  - `toast.info(message, title?, duration?)`: Cyan accent with Info.
- **Positioning:** Fixed bottom-right (`bottom-5 right-5 z-[9999]`) with backdrop blur and smooth exit animations.

### 8.2 Confirmation Dialog (`ConfirmModal`)
- **Component:** `<ConfirmModal isOpen={...} onClose={...} onConfirm={...} title={...} message={...} variant="danger"|"warning"|"info" />`
- **Destructive Deletion:** Must use `variant="danger"` with red button, explicit title, and non-blocking escape dismissal.

---

## 9. Badge Invariants & Formatting Hygiene

To prevent typographic errors such as `"Tier Tier A"` or redundant labels:
1. **Never double-prefix strings:** When receiving data from backend tables (e.g. `source_tier`), sanitize before prefixing:
   ```typescript
   export const formatTierBadge = (tier?: string) => {
     if (!tier) return "Tier B";
     const clean = tier.trim();
     return clean.toLowerCase().startsWith("tier") ? clean : `Tier ${clean}`;
   };
   ```
2. **Domain URL Beautification:** Replace raw truncated search URLs (`www.google.com/sea..`) with semantic badge pills (e.g. `PSA (Gov)`, `DA-BFAR (Gov)`, `Panay News`, `Peer-Reviewed Journal`).
3. **Epistemic Confidence Standard:**
   - `VALIDATED` (Emerald 500)
   - `STRONGLY_SUPPORTED` (Teal 500)
   - `SUPPORTED` (Cyan 500)
   - `HYPOTHESIS` (Amber 500)
   - `REFUTED / CONTESTED` (Rose 500)
