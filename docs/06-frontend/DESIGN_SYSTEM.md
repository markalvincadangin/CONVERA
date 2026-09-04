# CONVERA Design System Specification (CDS)

**Document ID**: `CONVERA-FE-002`  
**Classification**: Visual Tokens, Typography & Component Standards  
**Authority Tier**: Tier 2 Frontend Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/06-frontend/DESIGN_SYSTEM.md`  
**Upstream Dependencies**: `06-frontend/FRONTEND_ARCHITECTURE.md`  
**Downstream Dependents**: `06-frontend/UI_UX_PRINCIPLES.md, 06-frontend/ACCESSIBILITY.md`  

---

`[AUTHORITATIVE VISUAL LANGUAGE & TOKEN SPECIFICATION]`
*Document Version: 1.1.0*  
*Last Verified: 2026-09-04*  
*Source Authority: `web/src/lib/design-system.ts`, `web/src/app/globals.css`, `web/src/components/common/`*  
*Authority Boundary: Subordinate to SYSTEM_ARCHITECTURE.md (Area 1) and FRONTEND_ARCHITECTURE.md; Governs visual tokens, component primitives, and epistemic presentation standards*

---

## 1. Document Authority & Scope

The CONVERA Design System (CDS) establishes the canonical visual language, token architecture, component styling standards, and epistemic visualization semantics across the platform.

### Core Architectural Boundaries

* **Subordinate to Frontend Architecture**: CDS operates strictly within the presentation boundaries defined in `FRONTEND_ARCHITECTURE.md`. It specifies visual tokens and component aesthetics without altering domain service routing, state boundaries, or backend invariants.
* **Epistemic Integrity Over Decoration**: Visual styling is not merely cosmetic; color, typography, borders, and animations carry precise epistemic semantics (e.g., distinguishing verified peer-reviewed evidence from unverified AI hypotheses).
* **Implementation-First Evidence Basis**: This document codifies the design tokens implemented in `web/src/lib/design-system.ts` and Tailwind CSS v4 directives in `web/src/app/globals.css`.

---

## 2. The 60–30–10 Visual Composition Principle

CONVERA adopts the **60–30–10 Visual Design Principle** as a normative guide for visual balance, cognitive clarity, and low eye-strain during prolonged research sessions:

> **`[NORMATIVE]` Visual Composition Principle**: The 60–30–10 rule is an intentional design heuristic for atmospheric hierarchy, not a mathematically enforceable screen-by-screen pixel quota.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ~60% DOMINANT CANVAS (Deep Void & Low Eye-Strain Background)                │
│ • Base Color: `#030712` (Slate 950 / Deep Charcoal)                         │
│ • Role: Ground canvas, page backdrop, low glare during extended research.   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ ~30% STRUCTURAL GLASS SURFACES (Cards, Panels, Workspaces, Drawers)         │
│ • Surface: `rgba(15, 23, 42, 0.75)` (Slate 900 Glass)                       │
│ • Borders: `rgba(51, 65, 85, 0.60)` (Slate 700 Subtle)                      │
│ • Role: Epistemic containers, comparative grids, modular side-sheets.       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ ~10% INTENTIONAL ACCENTS (Epistemic Status, Actions, Invalidation Alerts)   │
│ • Semantic Colors: Cyan, Emerald, Amber, Rose, Purple                       │
│ • Role: Status badges, primary action buttons, active tabs, pulse alerts.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Color Token System

### 3.1 Base Surface Tokens

| Token Name | CSS Value / Storage | HSL / Hex | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| `colors.base.bg` | `var(--background)` | `#030712` | Canvas root background |
| `colors.base.surface` | `var(--card)` | `rgba(15, 23, 42, 0.75)` | Structural glass card surface |
| `colors.base.elevated` | `var(--popover)` | `rgba(30, 41, 59, 0.85)` | Elevated popovers, tooltips, dialogs |
| `colors.base.border` | `var(--border)` | `rgba(51, 65, 85, 0.60)` | Card and panel boundary borders |
| `colors.base.text` | `var(--foreground)` | `#f8fafc` | Primary high-contrast typography |
| `colors.base.muted` | `var(--muted-foreground)` | `#94a3b8` | Secondary labels, timestamps, captions |

### 3.2 Semantic & Epistemic Accent Tokens

Accents carry strict domain meaning across all Phase views and epistemic cards:

| Accent Token | Hex Code | Semantic Role in UI | Epistemic Meaning |
| :--- | :--- | :--- | :--- |
| **`accent.cyan`** | `#06b6d4` | Primary actions, Socratic dialogue, active phase | Active inquiry, cognitive exploration |
| **`accent.emerald`** | `#10b981` | Success states, advance phase buttons, verified tags | Validated claim, Tier A evidence, passed gate |
| **`accent.amber`** | `#f59e0b` | Warnings, second-look alerts, contested evidence | Unvalidated assumption, pending sign-off |
| **`accent.rose`** | `#f43f5e` | Danger, fatal contradictions, blast alerts | Falsified hypothesis, invalidation trigger |
| **`accent.purple`** | `#a855f7` | Circumscription loop, computing/research hypothesis | Dialectic synthesis, empirical loopback |

---

## 4. Elevation & Glassmorphism Tokens

The platform implements 4 discrete glassmorphic elevation layers using backdrop blur filters:

| Elevation Layer | Background RGBA | Border RGBA | Blur Filter | Component Context |
| :--- | :--- | :--- | :--- | :--- |
| **`glass-subtle`** | `rgba(15, 23, 42, 0.45)` | `rgba(51, 65, 85, 0.40)` | `backdrop-blur-sm` (8px) | Embedded table rows, sub-cards |
| **`glass-card`** | `rgba(15, 23, 42, 0.75)` | `rgba(51, 65, 85, 0.60)` | `backdrop-blur-md` (12px) | Standard problem cards, widgets |
| **`glass-elevated`**| `rgba(30, 41, 59, 0.85)` | `rgba(71, 85, 105, 0.70)` | `backdrop-blur-lg` (16px) | Popovers, command palette, toasts |
| **`glass-modal`** | `rgba(15, 23, 42, 0.95)` | `rgba(71, 85, 105, 0.80)` | `backdrop-blur-xl` (24px) | Decision room, gate review modal |

> [!IMPORTANT]
> **Elevation Decoupling Invariant**: Visual elevation and z-index depth represent **interaction hierarchy, focus, and modal priority**, NOT epistemic confidence, truth, or evidentiary weight. A high-elevation modal does not convey increased epistemic validity.

---

## 5. Typography Token System

### 5.1 Font Stacks

* **Primary Sans (`typography.fontSans`)**:
  `var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  * *Usage*: Headings, body copy, form inputs, button labels, navigation.
* **Technical Monospace (`typography.fontMono`)**:
  `var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  * *Usage*: Entity UUIDs (`CLM-042`, `PRV-103`), prompt hashes (`SHA256[:16]`), code blocks, formulas ($C_{\text{AI}} \ne S_{\text{EVID}}$), share codes.

### 5.2 Type Scale & Line Heights

| Tailwind Class | Font Size | Line Height | Tracking | Visual Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | $12\text{px}$ ($0.75\text{rem}$) | $16\text{px}$ | `tracking-wide` | Status badges, metadata, timestamps |
| `text-sm` | $14\text{px}$ ($0.875\text{rem}$) | $20\text{px}$ | `tracking-normal` | Form labels, secondary text, table data |
| `text-base` | $16\text{px}$ ($1.0\text{rem}$) | $24\text{px}$ | `tracking-normal` | Primary body copy, problem descriptions |
| `text-lg` | $18\text{px}$ ($1.125\text{rem}$) | $28\text{px}$ | `tracking-tight` | Card titles, modal sub-headers |
| `text-xl` | $20\text{px}$ ($1.25\text{rem}$) | $28\text{px}$ | `tracking-tight` | Section headers, workspace titles |
| `text-2xl` | $24\text{px}$ ($1.5\text{rem}$) | $32\text{px}$ | `tracking-tight` | Stage view headers |
| `text-3xl` | $30\text{px}$ ($1.875\text{rem}$) | $36\text{px}$ | `tracking-tighter` | Main application title, hero metrics |

---

## 6. Spacing, Radius & Layout Grid

### 6.1 Baseline Grid

* **Base Unit**: 4px standard grid step ($0.25\text{rem}$).
* **Component Padding**:
  * Micro (Badges, Tooltips): `px-2 py-0.5` ($8\text{px} \times 2\text{px}$)
  * Standard Button: `px-4 py-2` ($16\text{px} \times 8\text{px}$)
  * Card Container: `p-5` ($20\text{px}$) or `p-6` ($24\text{px}$)
  * Workspace Gutter: `gap-6` ($24\text{px}$) or `gap-8` ($32\text{px}$)

### 6.2 Border Radius Hierarchy

| Radius Token | CSS Value | Visual Style | Usage Context |
| :--- | :--- | :--- | :--- |
| `rounded-sm` | $4\text{px}$ ($0.25\text{rem}$) | Crisp small curve | Code tags, table cell selection |
| `rounded-md` | $6\text{px}$ ($0.375\text{rem}$) | Subtle radius | Sub-buttons, compact inputs |
| `rounded-lg` | $8\text{px}$ ($0.5\text{rem}$) | Standard radius | Form textareas, dropdown menus |
| `rounded-xl` | $12\text{px}$ ($0.75\text{rem}$) | Prominent curve | Standard cards (`Card.tsx`), panels |
| `rounded-2xl`| $16\text{px}$ ($1.0\text{rem}$) | High-emphasis | Large modals, decision workspace |
| `rounded-full`| $9999\text{px}$ | Pill capsule | Status badges, user avatar badges |

---

## 7. Component Styling Primitives

### 7.1 Buttons (`Button.tsx`)

| Variant | Visual Treatment | Epistemic Context |
| :--- | :--- | :--- |
| `primary` | Cyan gradient (`from-cyan-500 to-cyan-600`), white text, shadow glow | Primary workflow action, submit |
| `secondary` | Slate-800 glass (`bg-slate-800/80 border-slate-700`), slate-200 text | Secondary option, filter toggle |
| `success` | Emerald gradient (`from-emerald-500 to-emerald-600`), white text | Validate, Advance Phase, Ratify |
| `danger` | Rose gradient (`from-rose-500 to-rose-600`), white text | Invalidate, Reject, Delete |
| `outline` | Transparent fill, `border-slate-700`, hover: `bg-slate-800/50` | Non-blocking action, cancel |
| `ghost` | No border, no background, hover: `bg-slate-800/60` | Icon buttons, inline triggers |

### 7.2 Badges & Multi-Modal Status Indication (`Badge.tsx`, `badges.ts`)

> **`[NORMATIVE]` Accessibility Invariant**: **Color alone must NEVER be the sole carrier of epistemic meaning.** Every status badge, alert, and indicator MUST pair color with a distinct icon and human-readable text label.

```
┌────────────────────────────────────────────────────────────┐
│ [Icon]  STATUS TEXT (e.g.  ✓ VERIFIED_BY_RESEARCHER )      │
└────────────────────────────────────────────────────────────┘
```

* **Tier A Evidence**: Emerald badge with `BookOpen` or `CheckCircle` icon + "Tier A".
* **Tier B Evidence**: Cyan badge with `FileText` icon + "Tier B".
* **Tier C Evidence**: Slate badge with `File` icon + "Tier C".
* **Synthetic / AI**: Amber badge with `Sparkles` or `Bot` icon + "Synthetic / AI".
* **Contradiction Alert**: Pulsing Rose badge with `AlertTriangle` icon + "Contested".

---

## 8. Epistemic Visualization Standards

### 8.1 Tri-Part Confidence Indicators

> **`[NORMATIVE]` Epistemic Visualization Invariant**: AI generation confidence ($C_{\text{AI}}$), evidence corroboration strength ($S_{\text{EVID}}$), and human decision confidence ($C_{\text{DEC}}$) MUST **never visually collapse into a single ambiguous percentage**. They must be rendered as discrete segmented scores:

```
┌────────────────────────────────────────────────────────────┐
│ EVIDENCE RIGOR: [████████░░] 80% (Tier A Corroborated)     │
│ AI EXTRACTION:  [██████░░░░] 60% (Prompt Fingerprint)      │
│ DECISION GATE:  [██████████] 100% (Mentor Ratified)        │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Blast-Radius Invalidation Banner (`ImpactAlertBanner.tsx`)

When an upstream claim is falsified, the banner surfaces a high-visibility rose-tinted border with an animated pulsing indicator displaying:
* Source of invalidation (`Claim CLM-xxx`)
* Number of impacted downstream assumptions and decision records
* Immediate Action CTA ("Review Invalidation Blast")

*(Note: Visual urgency signifies that a dependency graph requires attention, but does not alter the underlying objective credibility of unrelated evidence).*

---

## 9. Motion & Animation Tokens

Powered by Framer Motion (`^13.2.0`):

| Transition Class | Duration | Curve / Easing | Application |
| :--- | :--- | :--- | :--- |
| **Fast** | $150\text{ms}$ | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover states, button clicks, tooltip fade |
| **Standard** | $200\text{ms}$ | `cubic-bezier(0.4, 0, 0.2, 1)` | Drawer slide-in, accordion expansion |
| **Modal Spring** | $300\text{ms}$ | `spring(damping: 25, stiffness: 300)` | Full workspace modal pop-in |
| **Pulse Alert** | $1500\text{ms}$ (Loop) | `easeInOut` | Contradiction alerts, blast-radius alert |

> **`[NORMATIVE]` Motion Invariant**: Motion is an enhancement for spatial continuity and focus. **Motion must not be required to understand state, hierarchy, or workflow progression.** Reduced-motion user preferences will be formally addressed in `ACCESSIBILITY.md`.

---

## 10. Accessibility & Contrast Standards

* **`[VERIFICATION]` Primary Contrast Ratio**: The specific measured color pair of primary text (`#f8fafc`) on canvas (`#030712`) achieves a contrast ratio of **$18.4:1$**.
* **`[TARGET]` Comprehensive WCAG 2.1 AAA Compliance**: Broader interface-wide WCAG 2.1 AAA compliance is a formal project target; comprehensive verification across all dynamic widgets is deferred to `docs/06-frontend/ACCESSIBILITY.md`.
* **`[IMPLEMENTED]` Multi-Modal Communication**: All semantic badges, alerts, and phase indicators combine color, iconography, and text labels.
* **`[IMPLEMENTED]` Explicit Focus Rings**: Interactive elements enforce visible focus indicators (`focus:ring-2 focus:ring-cyan-500 focus:outline-none`).

---

## 11. Design System Invariants

* **DS-01: 60–30–10 Composition** `[NORMATIVE]`: UIs must adhere to the 60% dark canvas, 30% structural glass, and 10% intentional accent visual hierarchy principle.
* **DS-02: Semantic Epistemic Mapping** `[NORMATIVE / IMPLEMENTED]`: Accent colors (Cyan, Emerald, Amber, Rose, Purple) MUST NOT be used arbitrarily; their use must conform strictly to epistemic semantics.
* **DS-03: Tri-Part Score Decoupling** `[NORMATIVE / IMPLEMENTED]`: AI confidence, evidence score, and decision confidence must never be combined into a single percentage.
* **DS-04: Non-Color Sole Reliance** `[NORMATIVE / IMPLEMENTED]`: Epistemic states must include icons and text alongside color coding.
* **DS-05: Elevation / Epistemic Decoupling** `[NORMATIVE]`: Visual elevation represents interaction priority and z-index focus, not epistemic validity or evidence strength.
* **DS-06: Standardized Font Monospace** `[NORMATIVE / IMPLEMENTED]`: All UUIDs, SHA-256 hashes, formulas, and code snippets must render using `font-mono`.
* **DS-07: Standard Elevation Hierarchy** `[IMPLEMENTED]`: Overlays, drawers, and cards must strictly utilize the 4 glassmorphic depth tiers.
* **DS-08: Truthful Synthetic Badging** `[NORMATIVE / IMPLEMENTED]`: Synthetic or AI-generated suggestions must carry the Amber/Sparkles synthetic tag.
* **DS-09: Motion Independence** `[NORMATIVE / IMPLEMENTED]`: Critical information and workflow states must remain completely intelligible without animation.
* **DS-10: Token Centralization** `[NORMATIVE / IMPLEMENTED]`: New components must source styling from Tailwind tokens and `design-system.ts`, avoiding arbitrary inline hex values.

---

## 12. Architectural Drift & Reconciliation Findings

| Finding | Discovered State | Resolution & Canonical Baseline |
| :--- | :--- | :--- |
| **Brand Drift** | Legacy docstrings in `design-system.ts` referenced "RatchetAI". | Canonicalized under CONVERA Design System (CDS v1.0). |
| **Terminology Drift** | Occasional references to "Track 2" for computing research. | Reconciled to canonical "Computing/research hypothesis & circumscription". |
| **Framework Version Alignment** | Tailwind CSS v4 uses direct `@import "tailwindcss";` without legacy `tailwind.config.js`. | Documented accurately in Section 1 and Section 3. |
| **Venture Health Badges** | `badges.ts` defines 9 venture gamification badges. | Fully integrated into CDS Section 7 as epistemic milestone badges. |
