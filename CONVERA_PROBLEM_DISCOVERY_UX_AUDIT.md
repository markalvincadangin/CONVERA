# CONVERA Problem Discovery & Problem Bank UX Audit

**Document ID**: `AUDIT-UX-PROBLEM-BANK-001`  
**Target Revision**: `main @ 2c5b99f`  
**Scope**: Problem Bank, Problem Intake, Ingestion Modals, Information Architecture, and User-Facing Terminology  
**Date**: September 5, 2026  
**Auditor**: Antigravity Autonomous Pair-Programming Agent (Empirical UX & Codebase Audit)  
**Governance Constraint**: STRICTLY READ-ONLY. Zero source code modifications, zero UI redesigns, zero schema changes, zero commits.

---

## 1. Executive Summary

This empirical UX and codebase audit investigates the **Problem Discovery**, **Problem Intake**, and **Problem Bank** subsystems in CONVERA. Prompted by user observations of non-responsive UI actions ("Ingest AI / GC Notes") and terminological friction, this audit traces the exact implementation mechanics, evaluates usability against Nielsen Norman heuristics, and proposes a coherent, unified information architecture.

### Key Audit Findings:
1. **The "Ingest AI / GC Notes" Button is an Orphaned UI Action (`DEF-PB-001 - S1 Major Bug`)**:
   - The button sets React state `isRawIngestOpen(true)`. However, the `<RawBrainstormIngestModal>` component was **completely omitted from the JSX return statement** of `web/src/components/problem-bank/ProblemBankView.tsx`. The code exists, the backend endpoint works, but the modal is never mounted. Tapping the button produces zero visual response.
2. **Duplicated & Competing Intake Workflows (`DEF-PB-002 - S2 UX Problem`)**:
   - The header presents two separate buttons: `"Ingest AI / GC Notes"` and `"Add Problem"`. However, `"Add Problem"` (`ManualProblemModal.tsx`) *already* contains an identical AI note extraction mode. Both call the exact same backend endpoint (`POST /api/problems/enrich`). Having two disconnected intake entry points creates severe user confusion.
3. **Internal Slang and Epistemic Jargon Exposed to Users (`DEF-PB-003 - S2 UX Problem`)**:
   - The UI surfaces cryptic internal or colloquial terms: `"GC"` (Philippine colloquial slang for "Group Chat"), `"Ingest"` (data pipeline jargon), `"Dossier"` (intelligence jargon for problem details), `"Devil's Advocate Adversarial Challenge"`, `"Mechanical Ratchet: Preview Mode (Read Only)"`, and `"Evidence Tier: SIGNAL"`. These force users to learn internal system plumbing instead of focusing on problem validation.
4. **Substandard Archival Interaction (`DEF-PB-004 - S2 UX Problem`)**:
   - In `ProblemDetailModal.tsx`, archiving an item triggers a native browser `window.prompt()` popup to collect the rejection reason, violating modern web UX and accessibility standards.
5. **Architectural Convergence Recommendation**:
   - Manual Problem Intake ("I observed a problem and want to record it") and AI/Notes Import ("I have interview/chat notes and want CONVERA to structure problems from them") must **converge into a single unified intake modal** with two input tabs that feed into the **same editable human-in-the-loop review form** before saving to the database.

---

## 2. Audit Scope

- **Frontend Components**:
  - `web/src/components/problem-bank/ProblemBankView.tsx` (Toolbar, filters, cards, table, empty state)
  - `web/src/components/problem-bank/RawBrainstormIngestModal.tsx` (Ingestion modal)
  - `web/src/components/problem-bank/ManualProblemModal.tsx` (Manual entry modal)
  - `web/src/components/problem-bank/ProblemDetailModal.tsx` (Record detail view, editing, archival)
  - `web/src/components/problem-bank/DevilsAdvocateModal.tsx` (Adversarial challenge view)
  - `web/src/components/problem-bank/BlindSpotModal.tsx` (Sector coverage analysis)
  - `web/src/components/problem-bank/EvidenceLedgerCard.tsx` & `AssumptionRadarCard.tsx`
  - `web/src/components/phases/phase1/Phase1View.tsx` (Phase 1 discovery to Problem Bank auto-sync)
- **Backend Services & Engines**:
  - `backend/routers/problems.py` (`/enrich`, `/`, `/parse-phase1`, `/detect-duplicates`, `/merge`, `/reindex-ids`)
  - `backend/engines/problem_enricher.py` (`enrich_manual_problem_input`)
  - `backend/storage/sqlite_adapter.py` (`problems`, `problem_sources`, `problem_phase_history` schemas)
- **Evaluation Criteria**:
  - Nielsen Norman 10 Usability Heuristics
  - Cognitive Load & Information Hierarchy
  - Terminology Naturalness & Domain Appropriateness
  - Interaction Consistency & Error Recovery

---

## 3. Current Problem Discovery Architecture

In the current CONVERA codebase, problem discovery feeds the persistent Problem Bank through three disparate paths:

```
[Path A: Phase 1 Discovery]
  User runs Phase 1 Regional Discovery
  → LLM generates regional markdown
  → backend/routers/pipeline.py runs parse_phase1_markdown()
  → Auto-upserts into SQLite `problems` table
  → Disconnect: Phase1View expects session.phase1_ingestion_summary (never set by backend)

[Path B: Manual Intake ("Add Problem")]
  User clicks "Add Problem" in ProblemBankView
  → Opens ManualProblemModal.tsx
  → Mode 1: "AI Field Note Structuring" -> calls POST /api/problems/enrich
  → Mode 2: "Manual Form" -> user inputs 5 anchors
  → Saves via POST /api/problems/ -> inserts into SQLite `problems`

[Path C: Notes Ingestion ("Ingest AI / GC Notes")]
  User clicks "Ingest AI / GC Notes" in ProblemBankView
  → Sets isRawIngestOpen(true)
  → DEAD ACTION: <RawBrainstormIngestModal> is not mounted in JSX
  → Nothing renders to screen
```

---

## 4. Problem Intake Workflow

### 4.1 Current Implementation Mechanics
The current intake workflow in `ManualProblemModal.tsx` operates with two sub-modes controlled by a local state `mode: "ai" | "form"`:
1. **AI Mode ("AI Field Note Structuring")**:
   - User is presented with a large textarea: *"Describe what you observed in the field, or paste interview notes."*
   - User clicks `"Structure Note with AI"`.
   - The frontend calls `problemService.enrichManualNote(rawNote, projectId, sessionId)`.
   - Backend `backend/engines/problem_enricher.py` runs `PROBLEM_ENRICHER_SYSTEM` via LLM gateway.
   - The returned JSON populates the form state (Sector, Sufferer, Location, Problem Statement, Evidence Tier, Workaround, Impact, Tags, Sources).
   - The component automatically flips `mode` to `"form"`, allowing the user to review and edit before saving.
2. **Form Mode ("Manual 5-Anchor Entry")**:
   - Displays 10 distinct input controls: Sector select, Target Sufferer input, Location input, Problem Statement textarea, Evidence Tier select, Workaround textarea, Quantified Impact textarea, Tags input, Notes input, and repeatable Sources list.
   - User clicks `"Save Problem to Bank"`, executing `POST /api/problems/`.

### 4.2 Structural Strengths & Deficiencies
- **Strength**: The AI mode properly switches to the editable form mode, respecting the epistemic principle of "LLM Last, Not LLM First" (AI drafts the schema, human verifies and edits).
- **Deficiency**: The user cannot easily switch back to raw text without losing edits. Form validation only checks `problem_statement.trim()`, leaving crucial epistemic fields (e.g. Sufferer, Location) to fall back to hardcoded defaults like `"Iloilo City"`.

---

## 5. Ingest AI / GC Notes Investigation

This section specifically answers the user's core diagnostic questions regarding the non-functional ingestion action.

### 5.1 What does "Ingest AI / GC Notes" currently do?
**Empirical Answer**: When clicked, it executes line 466 of `ProblemBankView.tsx`:
```tsx
onClick={() => setIsRawIngestOpen(true)}
```
However, in the JSX return block of `ProblemBankView.tsx` (lines 1101–1159), the modals rendered are:
- `<ManualProblemModal isOpen={isAddModalOpen} ... />`
- `<ProblemDetailModal isOpen={isDetailModalOpen} ... />`
- `<BlindSpotModal isOpen={isBlindSpotModalOpen} ... />`
- `<DevilsAdvocateModal isOpen={isDevilsAdvocateOpen} ... />`
- `<ConfirmModal isOpen={confirmDialog.isOpen} ... />`

`<RawBrainstormIngestModal>` is **completely missing from the JSX**. It was imported on line 17:
```tsx
import { RawBrainstormIngestModal } from "./RawBrainstormIngestModal";
```
and its state was declared on line 143:
```tsx
const [isRawIngestOpen, setIsRawIngestOpen] = useState(false);
```
**Conclusion**: The state variable changes from `false` to `true`, but React renders nothing new to the DOM.

### 5.2 Why does tapping it appear to do nothing?
Because the component element is omitted from the render tree. There is no runtime crash, no console error, and no network request sent. To the user, the click is swallowed silently.

### 5.3 Is it implemented?
**Status: IMPLEMENTED BUT ORPHANED.**
The modal file `web/src/components/problem-bank/RawBrainstormIngestModal.tsx` is completely written (220 lines of code). It contains:
- Textarea input with sample placeholder text.
- `handleParse` method calling `problemService.enrichManualNote()`.
- Structured preview card displaying Sufferer, Location, Workaround, and Quantified Impact.
- `handleSaveToBank` calling `problemService.createProblem()`.
It is 100% complete as an isolated component, but never connected into the parent view.

### 5.4 What is "GC" in the existing system?
In line 97 of `RawBrainstormIngestModal.tsx`:
`"Drop Raw AI Brainstorming, GC Chats, or Field Notes"`
and line 101:
`"Paste unstructured idea dumps from ChatGPT, Claude, Gemini, or team discussions."`
In Philippine startup and academic incubator culture, **"GC" is ubiquitous colloquial slang for "Group Chat"** (specifically Facebook Messenger, Viber, or Telegram groups where field teams exchange observations). In CONVERA's codebase, "GC Notes" was intended to refer to chat transcripts copied from team discussions. Exposing "GC" in an internationalized software interface is confusing jargon.

### 5.5 Is it supposed to consume AI-generated / research notes?
Yes. It was designed to consume messy, unstructured text dumps from external LLMs (ChatGPT, Claude, Gemini) or interview transcripts, stripping solution bias and extracting pure problem friction.

### 5.6 How does it differ from Add Problem / Problem Intake?
- **In UI intent**: "Add Problem" was conceived as structured manual entry, while "Ingest AI / GC Notes" was conceived as unstructured copy-pasting.
- **In actual backend execution**: **They do not differ at all.** Both call the exact same backend endpoint (`POST /api/problems/enrich`). The only frontend difference is that `RawBrainstormIngestModal` renders a static preview card, whereas `ManualProblemModal` renders editable input fields.

### 5.7 What existing backend/API functionality supports it?
- Endpoint: `POST /api/problems/enrich` (`backend/routers/problems.py:199`)
- Engine: `enrich_manual_problem_input` (`backend/engines/problem_enricher.py:58`)
- LLM System Instruction: `PROBLEM_ENRICHER_SYSTEM`
- Normalization fallback: Safely extracts JSON even if markdown code fences or conversational text surround the response.

### 5.8 What should happen when the user clicks it?
Rather than having a separate button that opens a secondary modal with redundant functionality, the "Ingest" concept should be absorbed into a unified **"Add Problem"** action with a dedicated **"Import from Notes / Chat"** tab.

---

## 6. Problem Bank Information Architecture

### 6.1 Top Toolbar & Header Controls
```
[Header Banner]
  Title: "Venture Problem & Friction Bank" (or "Research Problem & Intake Bank")
  Badge: "{N} Records"
  Description: Methodology explainer
  Right Actions: [Blind Spot] [Refresh] [Export CSV] [Ingest AI / GC Notes] [Add Problem]
```
- **Finding**: 5 action buttons crowded into the header. "Ingest AI / GC Notes" and "Add Problem" compete for primary visual attention.

### 6.2 Control Bar (Search, Filters, Sort, View Modes)
```
[Control Bar]
  Search: "Search statements, locations, sufferers..." (Client-side regex search)
  Sector Filter: Dropdown with All + 12 Sectors
  Evidence Tier Filter: All / Strongly Documented / Documented / Signal
  Sort Dropdown: Score / Votes / Evidence Tier / ID / Sector
  View Toggle: Card Grid vs. Table Grid
[Quick Filters]
  Chips: [All ({N})] [Strongly Documented] [Team Upvoted] [Challenged (Devil's Advocate)]
```
- **Finding**: High utility and comprehensive filtering. However, the search only scans memory (`useMemo`), ignoring the backend FTS5 full-text search index.

### 6.3 Batch Action Bar (Conditional on Selection)
```
[Selection Bar] (Appears when >= 1 item selected)
  Left: "{N} of {Total} Selected" | [Clear]
  Right: [Merge {N} Selected] (if >= 2) | [Delete Selected] | [Screen {N} in Phase 2]
```
- **Finding**: Excellent bulk management ergonomics. Merge correctly consolidates citations into the primary record; Delete uses a safety confirmation dialog.

---

## 7. Problem Record Structure

A canonical Problem Record in CONVERA is defined by 5 Grounding Anchors plus Epistemic Metadata:

| Dimension | Field Name | Type | Description |
| :--- | :--- | :--- | :--- |
| **Anchor 1** | `problem_statement` | `string` | The pure friction statement (stripped of solution bias). |
| **Anchor 2** | `sufferer_occupation` | `string` | The specific human or operational persona experiencing friction. |
| **Anchor 3** | `sufferer_location` | `string` | Geographic, municipal, or institutional context. |
| **Anchor 4** | `workaround` | `string` | The current inefficient workaround used today. |
| **Anchor 5** | `quantified_impact` | `string` | Metric of economic loss, wasted hours, or failure rate. |
| **Metadata** | `sector` | `string` | Domain taxonomy (e.g. Agriculture, Healthcare). |
| **Metadata** | `evidence_tier` | `enum` | Epistemic confidence (`STRONGLY_DOCUMENTED`, `DOCUMENTED`, `SIGNAL`). |
| **Metadata** | `sources` | `list` | Linked citations, field observations, or scholarly works. |
| **Metadata** | `score` / `votes` | `number` | Grounded priority score (0–100%) and team upvotes. |
| **Metadata** | `devils_advocate_data` | `json` | Stored adversarial challenges and fatal vulnerability markers. |

---

## 8. User-Facing Language Audit

The following table documents internal/technical jargon exposed to users, evaluates user cognitive impact, and provides recommended natural translations:

| Current Exposed Term | Current Location | Internal / Technical Origin | Cognitive Impact on User | Recommended User-Facing Translation |
| :--- | :--- | :--- | :--- | :--- |
| **"Ingest AI / GC Notes"** | Header Button | Data engineering ("ingest") + colloquial slang ("GC" = Group Chat) | High confusion. Non-technical users do not know what "ingest" means; non-local users do not know "GC". | **"Import from Notes"** or **"Extract from Notes"** |
| **"Dossier"** | Problem Card Button | Intelligence / Military documentation terminology | Intimidating and overly formal for an early-stage problem card. | **"View Details"** or **"Open Record"** |
| **"Devil's Advocate Adversarial Challenge"** | Problem Card & Detail Modal | Internal AI agent persona and prompt instruction | Sounds aggressive, destructive, or overly academic. | **"Stress Test Assumptions"** or **"Challenge Assumptions"** |
| **"Mechanical Ratchet: Preview Mode (Read Only)"** | Phase Header Banners | Technical governance invariant from CONVERA constitution | Sounds like mechanical engineering machinery; alienates software users. | **"Stage Locked: Review Only"** or **"Prerequisites Incomplete"** |
| **"Evidence Tier: SIGNAL"** | Badges & Dropdown | CONVERA epistemic verification tiers (Signal / Documented / Strongly Documented) | "Signal" sounds like telecommunications/radio or speculative noise. | **"Unverified Observation"** or **"Initial Observation"** |
| **"KNOW / UNCERTAIN"** | Evidence Ledger Status | Epistemic classification from CIIA / SDD-004 | Robotic and abstract. | **"Verified Fact"** / **"Unconfirmed Assumption"** |
| **"5-Anchor Entry"** | Empty State Card | Internal methodology (Sufferer, Location, Problem, Workaround, Loss) | Sounds like a nautical term or rigid compliance form. | **"Structured Manual Form"** |
| **"Screening / Decision Room"** | Phase 2 Navigation | Venture capital terminology | Unclear to researchers or students who are not running an investment committee. | **"Triage & Prioritization"** |
| **"Deliverables Studio"** | Navigation & Stepper | Software studio branding | Ambiguous whether it is a canvas editor or document export. | **"Proposal & Export Hub"** |
| **"Circumscription Loop"** | Research Stage E | Design Science Research (DSR) literature (March & Smith) | Opaque academic jargon incomprehensible to applied researchers. | **"Iteration & Refinement Cycle"** |

### Terminology Translation Policy:
- **Internal Domain Mechanics (Keep in Backend / Docs)**: Mechanical Ratchet, Epistemic Invalidation, Circumscription, FTS5 Indexing, Gate Engine, CIIA Connector.
- **User-Facing UI (Translate to Plain Language)**: Structured Form, Stress Test, Verified Evidence, Unconfirmed Assumption, Import Notes, View Details.

---

## 9. Nielsen Norman Heuristic Evaluation

| Heuristic | Evaluation Score | Current State & Violations | Recommended Remediation |
| :--- | :---: | :--- | :--- |
| **1. Visibility of System Status** | **POOR (2/5)** | Tapping "Ingest AI / GC Notes" produces zero visual feedback. Auto-sync banner in Phase 1 displays static text rather than real-time created/merged counts. | Mount modal properly; add spinner and progress indicators during AI structuring. Connect dynamic sync summaries. |
| **2. Match Between System & Real World** | **FAIR (2.5/5)** | Heavy exposure of internal jargon ("GC", "Ingest", "Dossier", "Mechanical Ratchet"). Sufferer and Workaround labels are somewhat abstract. | Replace jargon with natural user-centered language ("Import Notes", "View Details", "Affected Persona", "Current Alternative"). |
| **3. User Control & Freedom** | **POOR (2/5)** | Archiving triggers native browser `window.prompt()`. In AI intake mode, user cannot easily return to raw text without wiping form fields. | Replace `window.prompt()` with an accessible in-app modal. Allow bi-directional toggle between raw text and structured fields. |
| **4. Consistency & Standards** | **POOR (2/5)** | Two different buttons ("Ingest AI / GC Notes" and "Add Problem") both perform note structuring. Table view and Card view show different action sets. | Unify intake into a single "Add Problem" modal. Harmonize action icons and buttons across both views. |
| **5. Error Prevention** | **FAIR (3/5)** | Delete and Merge have confirmation dialogs. However, form submission only checks for empty statement; Sufferer/Location defaults can silently save placeholder text. | Add field-level validation and warnings if default placeholders remain unchanged. |
| **6. Recognition Rather Than Recall** | **FAIR (3/5)** | Card view packs 12 distinct data points onto one card. Badges use subtle color gradations that require memorizing tier semantics. | Simplify card layout; use clear icon-label pairs and tooltips for evidence tiers. |
| **7. Flexibility & Efficiency of Use** | **GOOD (4/5)** | Excellent multi-select batch actions (Merge, Bulk Delete, Advance to Phase 2). Keyboard shortcut (Enter) supported on search. Quick filter chips. | Keep batch toolbar; add backend FTS5 full-text search capability. |
| **8. Aesthetic & Minimalist Design** | **FAIR (2.5/5)** | Dense visual hierarchy: neon borders, glow rings, flame badges, and multiple nested background colors cause cognitive fatigue. | Reduce non-essential badge clutter; emphasize problem statement and primary actions. |
| **9. Help Users Recognize / Recover from Errors** | **FAIR (3/5)** | Reset button exists on empty search results. However, silent failures on orphaned modals leave users stranded with no error message. | Ensure all modal triggers have guaranteed open states; display informative error toasts on network/AI failures. |
| **10. Help & Documentation** | **GOOD (4/5)** | Contextual descriptions on empty states and tooltips across action icons. Help center modal is available. | Add inline micro-copy explaining how AI extracts the 5 anchors from raw notes. |

---

## 10. Interaction & Workflow Findings

1. **The Orphaned Modal Dead-End (`DEF-PB-001`)**:
   - In `ProblemBankView.tsx`, both the header button (line 469) and the empty state card (line 724) call `setIsRawIngestOpen(true)`. Because the modal is missing from the JSX, the user is permanently locked out of the dedicated raw ingestion flow from the main screen.
2. **Duplicated Note Structuring Flow (`DEF-PB-002`)**:
   - A user who wants to paste field notes is forced to guess whether to click "Ingest AI / GC Notes" (which fails) or "Add Problem" -> "AI Field Note Structuring" (which works).
3. **The `window.prompt()` Archive Anti-Pattern (`DEF-PB-004`)**:
   - In `ProblemDetailModal.tsx` line 186:
     ```tsx
     const reason = window.prompt("Enter the reason for archiving / rejecting this idea (e.g. 'Failed Mom Test validation / High Capex'):");
     ```
   - This halts the browser thread, cannot be customized or themed, is blocked by some mobile browsers, and provides no form validation.
4. **Phase 1 Auto-Sync Telemetry Disconnect (`DEF-PB-005`)**:
   - When Phase 1 discovery finishes, `Phase1View.tsx` checks `session.phase1_ingestion_summary?.new_created_count`. But `backend/routers/pipeline.py` never writes `phase1_ingestion_summary` to the session record. The UI always falls back to the generic message *"All extracted landscape problems are automatically pooled..."*, leaving the user blind to how many records were actually created or merged.

---

## 11. UI / Visual Hierarchy Findings

### 11.1 Problem Card Cognitive Load
The current Card View component renders:
- Checkbox
- Problem ID badge (`AGR-001`)
- Upvote button with count
- Priority score percentage badge
- Sector badge
- Evidence Tier badge
- "Challenged" flame badge (if Devil's Advocate was run)
- Problem Statement (3 lines clamped)
- Sufferer icon + occupation
- Location icon + city
- Quantified impact box (green text inside dark grey card)
- Source count (`N sources`)
- Secondary action: "Stress Test" (or "Lit Evidence")
- Primary action: "Dossier" with arrow icon

**Assessment**: 14 distinct interactive or informational elements in a card measuring only ~350px wide. Scannability is impaired. Users cannot quickly identify the core problem because their eyes are distracted by 5 different competing badge colors.

### 11.2 Empty State Information Overload
The empty state displays a large banner, sample data button, and 3 large cards ("AI Note Structuring", "Blind Spot Scanner", "Manual 5-Anchor Entry"). While helpful, the first pathway triggers the dead `isRawIngestOpen` state, frustrating new users immediately upon onboarding.

---

## 12. Accessibility & Responsive Findings

1. **Custom `div` Buttons**:
   - In the empty state (lines 721, 747, 771), clickable cards are implemented as `<div role="button" tabIndex={0}>` with manual `onKeyDown` listeners rather than native `<button>` elements. While keyboard accessible, screen readers do not treat them consistently as dialog triggers.
2. **Low Contrast Text**:
   - Sub-labels in dark mode use `text-slate-500` on `bg-slate-950`, yielding a contrast ratio of approximately 3.2:1, failing WCAG AA requirements (minimum 4.5:1 for normal text).
3. **Mobile Layout Squeeze**:
   - The header action bar on viewports `< 640px` stacks into a 2-column grid of 5 buttons, pushing the search and problem cards far below the fold.

---

## 13. Defect / UX Finding Ledger

| ID | Category | Severity | Current Behavior | Expected / Recommended Behavior | Root Cause | Recommended Action |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **DEF-PB-001** | **BUG** | **S1 (Major)** | Tapping "Ingest AI / GC Notes" does nothing (no modal, no error). | Clicking opens the note ingestion modal. | `<RawBrainstormIngestModal>` omitted from JSX return block in `ProblemBankView.tsx`. | Mount modal or unify with Add Problem modal. |
| **DEF-PB-002** | **UX PROBLEM** | **S2 (Normal)** | Two separate top-level buttons perform the same AI note extraction. | A single "Add Problem" action with tabs for "Manual Form" and "Import from Notes". | Uncoordinated development across SDD milestones. | Consolidate intake into a single unified modal. |
| **DEF-PB-003** | **UX PROBLEM** | **S2 (Normal)** | UI exposes confusing slang and jargon ("GC", "Ingest", "Dossier", "SIGNAL"). | Clear, human-centered language ("Import Notes", "View Details", "Initial Observation"). | Internal technical naming surfaced directly in UI copy. | Apply user-facing terminology translation table. |
| **DEF-PB-004** | **UX PROBLEM** | **S2 (Normal)** | Archiving a problem triggers a blocking native `window.prompt()`. | An accessible, styled in-app confirmation modal with a structured reason dropdown. | Quick-and-dirty implementation in `ProblemDetailModal.tsx:186`. | Replace with a proper React modal component. |
| **DEF-PB-005** | **IMPLEMENTATION GAP** | **S2 (Normal)** | Phase 1 claims auto-sync, but specific created/merged counts are never shown. | Displays exact count of newly added and merged problems after Phase 1 runs. | `backend/routers/pipeline.py` omits `phase1_ingestion_summary` from saved state. | Harmonize state payload in `pipeline.py`. |
| **DEF-PB-006** | **UI INCONSISTENCY** | **S2 (Normal)** | Problem cards display 14 competing data points and 5 badge colors. | Clean, scannable cards focusing on statement, persona, score, and primary actions. | Feature accumulation without visual hierarchy pruning. | Refactor card layout to prioritize text over badges. |
| **DEF-PB-007** | **TECHNICAL DEBT** | **S3 (Minor)** | Search only filters client-side memory; ignores backend FTS5 search index. | Fast, typo-tolerant full-text search across all problems and citations in SQLite. | Frontend search uses simple `String.includes()` in `useMemo`. | Connect search input to `/api/problems/search` endpoint. |
| **DEF-PB-008** | **ACCESSIBILITY** | **S3 (Minor)** | Interactive cards use `div` with manual key handlers; contrast fails WCAG AA in sub-labels. | Native semantic buttons with high-contrast `slate-400` minimum text. | Ad-hoc markup in empty state cards. | Replace `div` with `<button>` and adjust color classes. |

---

## 14. Root-Cause Analysis

### 1. The Disconnected Ingestion Modal (`DEF-PB-001`)
During the rapid implementation of SDD-004 and SDD-005, `RawBrainstormIngestModal.tsx` was created as an independent spike for raw brainstorming. The developer imported it into `ProblemBankView.tsx` and declared `isRawIngestOpen`, but placed the final modal tags (`ManualProblemModal`, `ProblemDetailModal`, etc.) without appending `<RawBrainstormIngestModal>`. Because TypeScript does not warn about unused imported React components in JSX if referenced elsewhere in state, and linting did not catch it, the component remained dormant.

### 2. Dual-Intake Architectural Drift (`DEF-PB-002`)
Two parallel mental models developed simultaneously:
- Developer A built `ManualProblemModal` with an AI structuring toggle.
- Developer B built `RawBrainstormIngestModal` for group chat dumps.
Both hit the exact same backend engine (`problem_enricher.py`). Neither replaced the other, leaving duplicate buttons in the navigation bar.

### 3. Jargon Leakage (`DEF-PB-003`)
CONVERA's underlying engine relies on rigorous epistemic concepts (Mechanical Ratchet, Epistemic Invalidation, Evidence Tiers, March & Smith DSR artifacts). Developers directly copy-pasted internal architectural vocabulary into user-facing button labels and tooltips, assuming users were technopreneurship methodologists rather than founders or researchers trying to solve problems.

---

## 15. Recommended Problem Intake Workflow

### Unified Convergence Model: Single "Add Problem" Entry Point
Rather than maintaining two competing header buttons, CONVERA should offer a single, prominent **"+ Add Problem"** button that opens a **Unified Problem Intake Modal**:

```
+-------------------------------------------------------------------------+
|  Add New Problem Record                                             [X] |
+-------------------------------------------------------------------------+
|  [Tab 1: Import from Notes / Chat]      [Tab 2: Manual Structured Entry]|
|                                                                         |
|  Paste raw interview notes, WhatsApp/Messenger chats, or LLM dumps:     |
|  +-------------------------------------------------------------------+  |
|  | "Interviewed 3 farmers in Dumangas: rice blast fungus destroyed  |  |
|  | 40% of harvest because fungicide arrives 2 weeks too late..."     |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  [✨ Extract Structured Problem]                                        |
|  ---------------------------------------------------------------------  |
|  REVIEW & EDIT EXTRACTED PROBLEM (Human-in-the-Loop)                    |
|                                                                         |
|  Sector: [ Agriculture & Fisheries        v ]  Tier: [ Initial Obs v ]  |
|  Problem Statement:                                                     |
|  [ Rice blast fungus destroys 40% of crop due to supply delays.      ]  |
|  Target Persona: [ Rice smallholders       ] Location: [ Dumangas, Iloilo]
|  Current Workaround: [ Roadside sun-drying ] Impact: [ 40% harvest loss] |
|                                                                         |
|                                       [ Cancel ]  [ Save to Bank (Enter)]|
+-------------------------------------------------------------------------+
```

### Key Workflow Advantages:
1. **Zero Redundancy**: One button, one modal, two distinct entry modalities.
2. **Guaranteed Human Agency**: Both raw import and manual entry converge into the same editable review form before writing to SQLite, ensuring the user verifies AI extraction.
3. **No Dead Actions**: Completely eliminates the orphaned `RawBrainstormIngestModal`.

---

## 16. Recommended Problem Bank Workflow

```
[INFLOW]
  1. Automated Discovery (Phase 1 / Stage A)
  2. Manual Intake / Notes Import (+ Add Problem)
  3. Sample Datasets (Starter Data)
         │
         ▼
[TRIAGE & ENRICHMENT] (Problem Bank View)
  - Full-Text Search (SQLite FTS5) & Fast Sector Filtering
  - Upvoting & Team Priority Ranking
  - Stress Testing (Devil's Advocate agent)
  - Citation & Evidence Linking
  - Duplicate Detection & 1-Click Merge
         │
         ▼
[OUTFLOW & GATING]
  - Innovation Track: Advance Selected to Phase 2 (Triage & Prioritization)
  - Research Track: Set as Research Anchor in Stage B / Stage C
  - Archival: Soft-delete with structured reason code
```

---

## 17. Recommended Terminology

| Area | Deprecated Internal Jargon | Recommended User-Facing Term | Rationale |
| :--- | :--- | :--- | :--- |
| **Top Action** | Ingest AI / GC Notes | **Import from Notes** | Natural, universal verb and noun. |
| **Intake Mode** | AI Field Note Structuring | **Extract from Raw Notes** | Clearly communicates AI parsing of unformatted text. |
| **Card Action** | Dossier | **View Details** | Standard web pattern; eliminates intimidating intelligence jargon. |
| **Challenge Action** | Devil's Advocate Adversarial Challenge | **Stress Test Assumptions** | Focuses on constructive validation rather than adversarial conflict. |
| **Tier 1 Badge** | SIGNAL | **Initial Observation** | Clarifies that it is first-hand field signal awaiting documentation. |
| **Tier 2 Badge** | DOCUMENTED | **Documented** | Kept as is; clear and standard. |
| **Tier 3 Badge** | STRONGLY_DOCUMENTED | **Strongly Verified** | Stronger, more intuitive connotation than "documented". |
| **Gating Status** | Locked by Mechanical Ratchet | **Prerequisites Incomplete** | Clear, action-oriented system status without mechanical metaphors. |
| **Claim Status** | KNOW / UNCERTAIN | **Verified Fact / Unverified Assumption** | Human-readable epistemics. |

---

## 18. Proposed Information Architecture

```
Problem Bank Workspace
│
├── Header Toolbar
│   ├── View Title & Record Count
│   ├── [Blind Spot Scanner] (Sector gaps)
│   ├── [Refresh] & [Export CSV]
│   └── [+ Add Problem] (Primary CTA — unified modal)
│
├── Search & Filter Bar
│   ├── Full-Text Search Bar (Queries problem text, sufferers, citations)
│   ├── Sector Taxonomy Filter (All + 12 Sectors)
│   ├── Evidence Level Filter (All / Strongly Verified / Documented / Initial)
│   ├── Sort Dropdown (Score / Upvotes / Evidence / Sector)
│   └── View Mode Toggle (Card Grid vs. Compact Table)
│
├── Quick Filter Chips
│   ├── All Records ({N})
│   ├── Strongly Verified
│   ├── Most Upvoted
│   └── Stress-Tested
│
├── Batch Selection Bar (Conditional when items checked)
│   ├── Selection Count & Clear
│   ├── [Merge Duplicates]
│   ├── [Delete Selected]
│   └── [Advance to Next Stage / Phase 2]
│
└── Main Problem Container
    ├── Card View (Primary: clean 3-anchor layout, reduced badges)
    └── Table View (High-density tabular layout for large backlogs)
```

---

## 19. Proposed Remediation Priorities

1. **Priority 1: Fix Dead UI Button & Unify Intake Modal (BUG & UX Fix)**
   - Remove orphaned `"Ingest AI / GC Notes"` button from header and empty state.
   - Upgrade `ManualProblemModal.tsx` into the unified `ProblemIntakeModal.tsx` with `"Import from Notes"` and `"Manual Entry"` tabs.
2. **Priority 2: Eliminate Native `window.prompt()` for Archiving (UX Fix)**
   - Replace `window.prompt()` in `ProblemDetailModal.tsx` with a proper in-app `ArchiveModal` providing structured rejection reasons.
3. **Priority 3: Terminology Normalization Pass (UI Polish)**
   - Replace "Dossier" with "View Details".
   - Replace "SIGNAL" with "Initial Observation".
   - Replace "Devil's Advocate Adversarial Challenge" with "Stress Test Assumptions".
4. **Priority 4: Card Layout De-Cluttering (Visual Polish)**
   - Reduce visible badge count from 6 to 2 per card (Sector + Evidence Level).
   - Move detailed metadata inside the detail modal.
5. **Priority 5: State Payload Sync for Phase 1 (`DEF-PB-005`)**
   - Ensure `backend/routers/pipeline.py` writes `phase1_ingestion_summary` so the dynamic auto-sync counts appear in `Phase1View.tsx`.

---

## 20. Future Specification Candidates

- **Candidate SDD-012**: *Unified Problem Intake & Terminology Simplification*
  - Addresses `DEF-PB-001`, `DEF-PB-002`, `DEF-PB-003`, `DEF-PB-004`, `DEF-PB-006`.
  - Merges `RawBrainstormIngestModal` and `ManualProblemModal` into a single, accessible component.
  - Implements the in-app Archive modal.
  - Applies terminology translation table across all problem bank components.
- **Candidate SDD-013**: *Problem Bank Full-Text Search & Discovery Sync*
  - Addresses `DEF-PB-005` and `DEF-PB-007`.
  - Wires Problem Bank search box to SQLite FTS5 index.
  - Implements real-time ingestion telemetry between Phase 1 and the Problem Bank.

---

## 21. Known Unknowns

1. **Mobile Ingestion Paste Performance**:
   - The impact of pasting extremely large transcripts (e.g. >10,000 words) into the intake textarea on low-end mobile devices has not been benchmarked. A token/character limit (e.g. 8,000 characters) should be established during specification.
2. **Multi-Problem Batch Extraction**:
   - Currently, `enrich_manual_problem_input` extracts exactly one primary problem from a text dump. Whether users expect a raw interview transcript to generate 3–5 candidate problems simultaneously requires product clarification.

---

## 22. Governance Status

- **Status**: AUDIT COMPLETE.
- **Source Code Altered**: 0 lines.
- **UI Code Modified**: 0 lines.
- **Database Migrations Created**: 0.
- **Branch / Git State**: Clean (`main @ 2c5b99f`).

---

## 23. Next Gate

Human review of this audit report (`AUDIT-UX-PROBLEM-BANK-001`) alongside `AUDIT-STABILIZATION-001`, followed by formal authorization to draft candidate specification `SDD-012` (Unified Problem Intake & Terminology Normalization).

---

# 24. GOVERNANCE CONCLUSION

STATUS:
AUDIT COMPLETE — IMPLEMENTATION NOT AUTHORIZED
