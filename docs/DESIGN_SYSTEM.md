# RatchetAI Design System Specification (v1.1)
**Framework Reference:** [docs/UIUX Design Framework.md](./UIUX%20Design%20Framework.md)  
**Standard Alignment:** WCAG 2.1 AA / AAA | Nielsen Norman Group 10 Usability Heuristics | 60-30-10 Color Theory

---

## 1. Design Philosophy & Golden Rules

1. **Clarity Over Decoration:** Every visual element must serve a functional purpose—communicating system status, evidence confidence, or actionable venture decisions.
2. **The Evidence Ratchet Metaphor:** Visual language mirrors mechanical engineering—solid structural anchors, high-contrast status ratchets, and unyielding empirical gates.
3. **No Solution Bias in UI:** Problem analysis spaces (Phases 1-3) use analytical cool cyan/slate tones; ideation and testing spaces (Phases 4-5) use vibrant emerald/violet accents.

---

## 2. Color System (60-30-10 Rule)

```
+-----------------------------------------------------------------------------------+
| 60% DOMINANT BASE (Backgrounds & Deep Canvas)                                     |
| Deep Obsidian (#030712 / slate-950) | Midnight Slate (#0f172a / slate-900)       |
+-----------------------------------------------------------------------------------+
| 30% STRUCTURAL SURFACES (Cards, Headers, Modals & Data Grids)                     |
| Frosted Glass Surface (#1e293b with backdrop-blur-md) | Border Slate (#334155)    |
+-----------------------------------------------------------------------------------+
| 10% INTENTIONAL ACCENTS (Interactive Triggers, Verdicts & Telemetry)              |
| Active Cyan (#06b6d4) | Success Emerald (#10b981) | Amber (#f59e0b) | Rose (#f43f5e) |
+-----------------------------------------------------------------------------------+
```

### 2.1 Semantic Token Palette

| Token Name | Hex / HSL | Usage | Contrast vs #030712 |
|---|---|---|---|
| `--color-bg-base` | `#030712` (slate-950) | Global viewport canvas | Base |
| `--color-surface-glass` | `rgba(15, 23, 42, 0.75)` | Glassmorphism card surfaces | Structure |
| `--color-surface-elevated` | `rgba(30, 41, 59, 0.85)` | Modals, drawers, dropdowns | 3.2:1 |
| `--color-border-subtle` | `rgba(51, 65, 85, 0.6)` | Card and table borders | 2.1:1 |
| `--color-text-primary` | `#f8fafc` (slate-50) | Headings and critical data | **18.2:1 (AAA)** |
| `--color-text-secondary` | `#94a3b8` (slate-400) | Descriptions and metadata | **6.8:1 (AA)** |
| `--color-accent-cyan` | `#06b6d4` (cyan-500) | Primary actions, research agent status | **7.4:1 (AA)** |
| `--color-accent-emerald` | `#10b981` (emerald-500) | Validated gates, Advance verdicts, complete | **8.1:1 (AA)** |
| `--color-accent-amber` | `#f59e0b` (amber-500) | Second look, assumption risk (P1/P2) | **9.2:1 (AA)** |
| `--color-accent-rose` | `#f43f5e` (rose-500) | Fatal red flags, park verdicts, errors | **6.5:1 (AA)** |

---

## 3. Typography Scale & Hierarchy

- **Primary Sans:** `Inter`, `Geist`, or system-ui font stack.
- **Monospace Telemetry:** `Geist Mono`, `JetBrains Mono`, or `Consolas` for timers, IDs (`AGR-001`), and data tokens.

| Role | Tailwind Class | Size / Line Height | Font Weight |
|---|---|---|---|
| **Display Header** | `text-2xl sm:text-3xl` | 1.875rem / 2.25rem | 800 (ExtraBold) |
| **Section Title** | `text-lg sm:text-xl` | 1.25rem / 1.75rem | 700 (Bold) |
| **Card Header** | `text-base` | 1.0rem / 1.5rem | 600 (SemiBold) |
| **Body Standard** | `text-sm` | 0.875rem / 1.5rem | 400 (Regular) |
| **Helper / Caption** | `text-xs` | 0.75rem / 1.25rem | 400–500 (Medium) |
| **Badge / Telemetry**| `text-[11px] font-mono` | 0.6875rem / 1.0rem | 600 (SemiBold) |

---

## 4. Component Interaction Matrix (6 States)

Every interactive component adheres to the complete state matrix:

```
[ Default ] ➔ [ Hover ] ➔ [ Active (Pressed) ] ➔ [ Focus-Visible (Keyboard) ] ➔ [ Disabled ] ➔ [ Loading ]
```

1. **Default:** Crisp 1px border with glass transparency and subtle text glow.
2. **Hover:** Elevation lift (`translate-y-[-1px]`), background saturation boost, border brightening.
3. **Active:** Physical compression click (`scale-[0.98]`).
4. **Focus-Visible:** High-contrast focus ring (`outline-2 outline-offset-2 outline-cyan-400`).
5. **Disabled:** Opacity reduction (`opacity-40 pointer-events-none grayscale-[50%]`).
6. **Loading:** Inline spinning indicator, button lock, ARIA busy live update.

---

## 5. Nielsen Norman Group Heuristic Mapping

| NN/g Heuristic | UI Implementation in RatchetAI |
|---|---|
| **#1: Visibility of System Status** | `LoadingStatusCard` with live elapsed seconds, animated radar pulse, and phase ticker. |
| **#2: Match Real World** | Uses authentic Iloilo barangays, PSA Region VI terms, and standard Lean Startup vocabulary. |
| **#3: User Control & Freedom** | Cancel request button, reset selectors, back navigation, and multi-session switching. |
| **#4: Consistency & Standards** | Unified `MarkdownRenderer` data tables, uniform pill badges, and standard action buttons. |
| **#5: Error Prevention** | Dynamic form validation, concept minimum checks, and level sequence enforcement. |
| **#6: Recognition over Recall** | Interactive Cheatsheet Drawer, framework tooltips, and pinned problem context cards. |
| **#7: Flexibility & Efficiency** | 1-Click "Select All Sectors", keyboard navigation shortcuts, instant Markdown copy/export. |
| **#8: Aesthetic & Minimalist Design** | Card glassmorphism, progressive disclosure drawers, and clean vertical hierarchy. |
| **#9: Recognize & Recover from Errors**| `AlertBanner` with clear diagnostic reason and 1-click **"🔄 Retry Now"** recovery trigger. |
| **#10: Help & Documentation** | Embedded Framework Guide side drawer and expandable field observation guides. |

---

## 6. Layout & Spatial Grid (8pt Grid System)

- **Base Unit:** 4px / 8px (0.25rem / 0.5rem increments).
- **Container Max-Width:** `max-w-7xl` (80rem / 1280px) centered with responsive padding (`px-4 sm:px-6 lg:px-8`).
- **Surface Radii:**
  - Micro tags / Badges: `rounded-lg` (8px)
  - Interactive Buttons: `rounded-xl` (12px)
  - Cards & Containers: `rounded-2xl` (16px)
  - Modals & Sheets: `rounded-3xl` (24px)
- **Transitions:** `transition-all duration-200 ease-out`.
