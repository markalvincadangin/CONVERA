# SPEC-PROBLEM-DISCOVERY-UX-001: Unified Problem Intake & Problem Bank UX Remediation

**Specification ID**: `SPEC-PROBLEM-DISCOVERY-UX-001`  
**Target Milestone**: CONVERA Stabilization / Problem Bank UX  
**Baseline Git Revision**: `main @ ac3584c`  
**Authoritative Evidence Base**:
- `CONVERA_RUNTIME_FEATURE_AUDIT.md` (Committed at `ac3584c`)
- `CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md` (Committed at `ac3584c`)  
**Status**: `RATIFIED — IMPLEMENTATION NOT AUTHORIZED`

---

## 1. Purpose

This specification establishes a bounded, evidence-based implementation blueprint to remediate the **Problem Discovery**, **Problem Intake**, and **Problem Bank** user experience in CONVERA.

The primary objective is to transform a fragmented, jargon-heavy interface into an intuitive, low-cognitive-load, and trustworthy problem management system. This is achieved by:
1. Resolving the orphaned "Ingest AI / GC Notes" button (`DEF-PB-001`).
2. Eliminating competing intake workflows by converging manual entry and notes import into a single, canonical intake component (`DEF-PB-002`).
3. Defaulting the intake experience to structured Manual Entry, maintaining optional AI-assisted Notes Import in strict alignment with **"LLM Last, Not LLM First"**.
4. Replacing intimidating internal and colloquial jargon with natural, human-centered language in visible UI copy (`DEF-PB-003`).
5. Replacing the blocking `window.prompt()` archival anti-pattern with an accessible, in-app confirmation modal (`DEF-PB-004`).
6. Streamlining the Problem Card layout with a clear visual hierarchy that prioritizes core problem friction and affected persona over redundant badge clutter (`DEF-PB-006`).
7. Preserving existing Problem Bank data integrity and historical ID generation without modifying the database schema or introducing new API routes.

---

## 2. Evidence / Audit Basis

This specification is directly grounded in empirical findings documented in `CONVERA_PROBLEM_DISCOVERY_UX_AUDIT.md` (commit `ac3584c`):

1. **`DEF-PB-001` (S1 Major)**: In `web/src/components/problem-bank/ProblemBankView.tsx`, lines 17 and 143 import `RawBrainstormIngestModal` and declare `isRawIngestOpen`. Line 466 sets `isRawIngestOpen(true)`. However, `<RawBrainstormIngestModal>` is omitted from the JSX return block (lines 1101–1159). The button updates state in memory, but nothing renders to the DOM.
2. **`DEF-PB-002` (S2 Normal)**: `web/src/components/problem-bank/ManualProblemModal.tsx` already contains an AI note extraction mode (`mode: "ai" | "form"`). Both `ManualProblemModal` and `RawBrainstormIngestModal` call the exact same backend endpoint (`POST /api/problems/enrich`). Having two separate header buttons ("Ingest AI / GC Notes" and "Add Problem") causes severe workflow fragmentation and user confusion.
3. **`DEF-PB-003` (S2 Normal)**: The visible UI exposes internal engineering jargon ("Ingest"), local colloquial slang ("GC" = Group Chat), military/intelligence terms ("Dossier"), aggressive agent branding ("Devil's Advocate Adversarial Challenge"), and abstract methodology labels ("SIGNAL", "5-Anchor Entry", "Mechanical Ratchet: Preview Mode").
4. **`DEF-PB-004` (S2 Normal)**: In `web/src/components/problem-bank/ProblemDetailModal.tsx` line 186, problem archival triggers a native browser `window.prompt()`, freezing the browser thread and violating interaction consistency.
5. **`DEF-PB-005` (S2 Normal)**: `web/src/components/phases/phase1/Phase1View.tsx` expects `session.phase1_ingestion_summary` in persisted session state to render dynamic counts of auto-created and merged problems. However, `backend/routers/pipeline.py` currently omits this summary from the persisted session dictionary.
6. **`DEF-PB-006` (S2 Normal)**: Problem cards render a dense wall of up to 14 competing elements, including 5 distinct badge colors and glow borders, causing visual fatigue and poor scannability.

---

## 3. Problem Statement

Founders, researchers, and students using CONVERA want to capture real-world friction, understand who experiences it, verify evidence, and organize problem backlogs. Currently, they face:
- **Dead Actions**: Clicking "Ingest AI / GC Notes" does nothing.
- **Workflow Ambiguity**: Users must guess whether to use "Ingest AI / GC Notes" or "Add Problem".
- **Cognitive Overload**: Every card resembles an analytics dashboard rather than a concise, scannable problem record.
- **Epistemic Estrangement**: Users are forced to learn internal architectural terminology ("Mechanical Ratchet", "GC", "SIGNAL", "Dossier") instead of focusing on domain validation.

---

## 4. Current-State Workflow

```
[Entry Point 1: Header Button]
  User clicks "Ingest AI / GC Notes"
  → isRawIngestOpen = true
  → DEAD ACTION (Modal omitted from JSX)
  → User assumes system is broken.

[Entry Point 2: Header Button]
  User clicks "Add Problem"
  → Opens ManualProblemModal
  → Sub-Mode A: "AI Field Note Structuring" (paste text -> calls /api/problems/enrich -> switches to Form)
  → Sub-Mode B: "Manual Form" (fills fields directly)
  → User clicks Save -> POST /api/problems/

[Entry Point 3: Detail Modal Action]
  User clicks "Archive" in ProblemDetailModal
  → Native window.prompt() dialog halts browser
  → Unstyled, inaccessible, no structured reason categories.
```

---

## 5. Current-State Defects

| Defect ID | Severity | Area | Root Cause | Specification Remediation |
| :--- | :---: | :--- | :--- | :--- |
| **DEF-PB-001** | **S1** | Problem Bank Toolbar | `<RawBrainstormIngestModal>` omitted from `ProblemBankView.tsx` JSX. | Deprecate redundant modal; merge capabilities into canonical `ProblemIntakeModal`. |
| **DEF-PB-002** | **S2** | Intake Architecture | Two competing buttons hit the same `/api/problems/enrich` endpoint. | Consolidate into a single "+ Add Problem" action with canonical modal defaulting to Manual Entry. |
| **DEF-PB-003** | **S2** | Terminology / Copy | Internal engineering and colloquial slang surfaced in UI. | Enforce user-facing language translation dictionary across visible UI copy. |
| **DEF-PB-004** | **S2** | Archival Interaction | `window.prompt()` used in `ProblemDetailModal.tsx:186`. | Implement accessible, in-app `ArchiveProblemModal` with structured rejection reasons. |
| **DEF-PB-005** | **S2** | State Synchronization | `routers/pipeline.py` omits `phase1_ingestion_summary` from persisted session state. | Persist ingestion summary into existing session state storage across reloads. |
| **DEF-PB-006** | **S2** | Card Visual Hierarchy | Competing visual elements and badge overload per card. | Refactor card to prioritize Problem Statement, Persona, Location, and clear actions. |
| **DEF-PB-008** | **S3** | Accessibility | Non-semantic `div role="button"` in empty state; contrast gaps. | Use semantic controls (`button`, `a`, `input`, etc.) and satisfy applicable WCAG 2.1 AA requirements. |

---

## 6. User Goals

1. **Capture Observation**: Directly record a problem observed during field interviews or site visits.
2. **Import Notes Optionally**: Paste raw interview transcripts, conversation notes, or external drafts, allowing CONVERA to help structure candidate fields.
3. **Verify & Correct**: Review and edit how CONVERA structured the draft before committing it to the database.
4. **Organize & Prioritize**: Filter, search, and sort problem backlogs by domain sector, evidence strength, and team upvotes.
5. **Take Action**: Stress-test assumptions, view complete evidence citations, or advance candidate problems to Phase 2 screening without stumbling over system plumbing.

---

## 7. Target User Workflow

```
                        PROBLEM BANK WORKSPACE
                                  │
                                  ▼
                         [ + Add Problem ]
                                  │
              ┌───────────────────┴───────────────────┐
              ▼ (Default Mode)                        ▼ (Optional Mode)
     [Tab 1: Manual Entry]                  [Tab 2: Import from Notes]
  - Fill guided questions:               - Paste raw source material:
    "Who", "Where", "What",                interview notes, chat logs
    "Workaround", "Impact"               - Click "Extract Problem Details"
              │                          - AI structures draft fields
              │                                       │
              └───────────────────┬───────────────────┘
                                  ▼
                        MANDATORY HUMAN REVIEW
              - Human reviews pre-filled or entered fields
              - Human edits statement, persona, sector
              - Human verifies accuracy (LLM Last)
                                  │
                                  ▼
                         [ Save to Bank ]
                                  │
                                  ▼
                       SQLITE PROBLEM RECORD
                     (Preserves Canonical ID)
                                  │
                                  ▼
                        PROBLEM BANK VIEW
              - Clean Card Grid or Dense Table
              - View Details / Edit
              - Stress Test Assumptions
              - Advance to Phase 2 / Stage B
```

---

## 8. Manual Problem Intake Requirements

### FR-001: Canonical Manual Intake (Default Mode)
The manual entry interface is the default mode of the canonical intake component (`ProblemIntakeModal`). It guides the user through clear, natural questions rather than presenting an intimidating technical form.

1. **Default Mode**: Opening `ProblemIntakeModal` defaults directly to **Manual Entry**. AI-assisted Notes Import is accessible via a clearly labeled secondary tab or switch.
2. **Sector Taxonomy Invariant**: Reuse the existing sector options already defined by the current application/backend taxonomy (`ALL_SECTORS` in `web/src/lib/constants.ts`). Do not introduce, remove, or modify sector taxonomy as part of this specification.
3. **Core Required Fields**:
   - **Sector / Domain** (`sector`): Dropdown selecting from existing `ALL_SECTORS` (default: "Agriculture & Fisheries").
   - **What is the problem?** (`problem_statement`): Textarea with placeholder: *"Describe the specific friction, breakdown, or unmet need..."* (Minimum 10 characters).
   - **Who experiences this?** (`sufferer_occupation`): Text input with placeholder: *"e.g. Smallholder rice farmers, municipal health workers, sari-sari store owners"*.
   - **Where does it happen?** (`sufferer_location`): Text input with placeholder: *"e.g. Iloilo City, Dumangas, Western Visayas"*.
4. **Optional Contextual Fields (Progressive Disclosure)**:
   - Expandable section labeled *"Add Context & Evidence (Optional)"*:
     - **Current Alternative / Workaround** (`workaround`): *"How do they cope with this problem today?"*
     - **Estimated Impact or Loss** (`quantified_impact`): *"Estimated hours lost, financial damage, or failure rate..."*
     - **Evidence Presentation Level** (`evidence_tier`): Select option with display labels:
       - *"Initial Field Observation"* (maps to enum `SIGNAL`)
       - *"Documented with Evidence"* (maps to enum `DOCUMENTED`)
       - *"Strongly Verified"* (maps to enum `STRONGLY_DOCUMENTED`)
       *(Note: These are UI presentation labels only; they map strictly to existing enum values and do not alter epistemic semantics).*
     - **Supporting Sources** (`sources`): Add citation links or interview references.
5. **Validation & Error Prevention**:
   - The "Save Problem" button is disabled until `problem_statement`, `sufferer_occupation`, and `sufferer_location` contain non-whitespace text.
   - Elimination of silent default placeholder text (do not silently insert "Iloilo City" if the user clears the field; enforce explicit user entry).

---

## 9. Import Notes Requirements

### FR-002: Optional Notes Ingestion Interface
The notes import interface replaces "Ingest AI / GC Notes" with a clear, user-directed draft generation workflow.

1. **Input Area**:
   - Title: **"Import from Notes or Chat"**
   - Supporting text: *"Paste interview notes, field observations, team chat messages, or unstructured drafts. CONVERA will help identify and organize potential problem details for your review."*
   - Textarea with placeholder: *"Example: We spoke with 4 onion growers in Miagao. They lose 30% of their harvest to rot during the wet season because there is no local cold storage facility, forcing them to dry crops on roadside asphalt..."*
   - Character count indicator (maximum recommended: 8,000 characters).
2. **Extraction Action**:
   - Button label: **"Extract Problem Details"** (with subtle sparkle icon).
   - Displays active spinner with descriptive label: *"Analyzing notes and structuring problem draft..."*
   - Invokes existing `problemService.enrichManualNote` (`POST /api/problems/enrich`).
3. **Extraction Failure & Recovery**:
   - If extraction fails or returns an ungrounded result, display an inline warning: *"Could not clearly extract a structured problem. Please provide more context or enter details manually."*
   - The user's raw pasted text is **never lost**. It remains preserved in the textarea.

---

## 10. AI / Epistemic Safety Boundaries & Data Flow

### FR-003: Explicit AI Data Flow & Mandatory Human Review

```
RAW USER NOTES (Source Material)
      ↓
AI EXTRACTION (POST /api/problems/enrich)
      ↓
EDITABLE DRAFT (Transient Client State)
      ↓
MANDATORY HUMAN REVIEW (User Inspection & Editing)
      ↓
EXPLICIT USER SAVE (POST /api/problems/)
      ↓
PERSISTENT PROBLEM RECORD (SQLite Database)
```

1. **Source Material Boundary**: Raw user notes are treated strictly as unverified founder/researcher observations.
2. **Draft Classification**: All AI-extracted fields are strictly **provisional drafts**, not verified facts.
3. **No Autonomous Verification**: AI extraction does **not** constitute verification. AI cannot independently assert that a problem is empirically validated, nor can it alter epistemic status.
4. **No Autonomous Persistence**: AI extraction **cannot** directly persist a record to the database. The endpoint `/api/problems/enrich` returns a draft payload to client state; persistence occurs **only** when the user explicitly reviews the fields and clicks `"Save to Problem Bank"`.
5. **Mandatory Human Verification**:
   - Upon extraction, the interface transitions to the review form with an informational notice: *"AI-Extracted Draft: Please review and adjust the extracted details before saving."*
   - Every field (Sector, Problem Statement, Persona, Location, Workaround, Impact) is fully editable.
   - A *"← Back to Raw Notes"* action allows returning to the source text without losing draft entries.
6. **Epistemic Invariant**: Existing epistemic governance, evidence tier definitions, and promotion authority remain authoritative and unchanged by this specification. Display labels ("Initial Field Observation", "Documented with Evidence", "Strongly Verified") are UI presentation aliases for the canonical enums `SIGNAL`, `DOCUMENTED`, and `STRONGLY_DOCUMENTED`.

---

## 11. Problem Record Requirements & Data Preservation

### FR-004: Relational Schema Fidelity & Empirical Data Preservation
1. **Preserve Existing ID Generation**: This specification must **not** introduce a choice between sector-prefixed IDs and UUIDs. The backend storage engine (`backend/storage/sqlite_adapter.py:1389–1400`) retains full authority over canonical sector-prefixed ID generation (e.g. `AGR-001`, `HLT-002`) and uniqueness checks.
2. **Empirical Data Preservation Invariant**: Existing Problem Bank records present in SQLite before implementation must remain readable and have equivalent persisted field values after implementation. Verification will compare a pre-change record snapshot/inventory against post-change records to confirm zero unintended loss or field alteration.
3. **Schema Compliance**: The unified intake workflow maps directly to the existing 24-table relational SQLite schema without requiring database migrations:
   - `id`: Assigned canonically by storage engine.
   - `project_id`: Current active project ID.
   - `session_id`: Current active session ID.
   - `sector`: Selected sector string.
   - `problem_statement`: Verified problem friction text.
   - `sufferer_occupation`: Specific affected persona.
   - `sufferer_location`: Geographic or operational scope.
   - `workaround`: Existing alternative or workaround.
   - `quantified_impact`: Measured or estimated loss metric.
   - `evidence_tier`: Existing tier string (`SIGNAL`, `DOCUMENTED`, or `STRONGLY_DOCUMENTED`).
   - `source`: `"manual"` or `"notes_import"`.
   - `source_detail`: Contextual provenance description.
   - `status`: Existing problem status (`discovered`).

---

## 12. Problem Bank Information Architecture

### FR-005: Clean Workspace Toolbar & Canonical Entry
In `ProblemBankView.tsx`, the top bar is restructured for clarity and focus:

1. **Header Action Consolidation**:
   - Completely remove the orphaned `"Ingest AI / GC Notes"` button.
   - Elevate `"+ Add Problem"` as the single primary call-to-action button.
   - Secondary utilities (`Blind Spot Scanner`, `Refresh`, `Export CSV`) styled consistently as secondary actions.
2. **Canonical Intake Invariant**:
   - The header `"+ Add Problem"` button, the empty-state `"Enter Details Manually"` card, and the empty-state `"Import from Notes"` card all invoke the **exact same canonical `ProblemIntakeModal` component**, differing only in their initial mode (Manual Entry vs. Import Notes).
3. **Search & Filter Controls**:
   - Text search box filtering statements, personas, locations, and citations.
   - Sector filter dropdown (All Sectors + existing options from `ALL_SECTORS`).
   - Evidence filter dropdown (All Evidence / Strongly Verified / Documented / Initial Observations).
   - Sort dropdown (Highest Priority Score / Most Upvoted / Evidence Level / Sector Name).
4. **Batch Management**:
   - Retain multi-select toolbar when `>= 1` item is selected: Merge Selected (if `>= 2`), Delete Selected, and Screen in Phase 2.

---

## 13. Problem Card Requirements

### FR-006: Visual Hierarchy & De-Cluttering
Rather than enforcing an arbitrary fixed element count, the Problem Card in Card View (`ProblemBankView.tsx:964–1098`) must enforce a clear visual hierarchy:

1. **Primary Information Hierarchy**:
   - **Top Priority**: The Problem Statement rendered as the prominent visual element in clear typography (`text-sm font-semibold`, max 3 lines clamped).
   - **Second Priority**: The affected person (`sufferer_occupation`) and geographic scope (`sufferer_location`) with muted contextual icons.
   - **Third Priority**: High-impact evidence summary or quantified loss (if present), cleanly formatted without garish container nesting.
2. **Removal of Redundant Badges**:
   - Restrict card header badges to essential identifiers: Problem ID, Sector pill, and Evidence Confidence pill.
   - Eliminate duplicate visual markers (e.g. redundant flame icons and decorative glow rings).
3. **Card Actions**:
   - Left: Source citation count (`N sources cited`).
   - Right Actions:
     - Secondary button: `"Stress Test"` (runs existing challenge modal).
     - Primary action: `"View Details →"` (replaces "Dossier" and opens the complete problem detail view).

---

## 14. Terminology / Language Requirements

### FR-007: User-Facing Language Normalization Dictionary
The following translations apply **strictly to visible user-facing Problem Bank UI copy**. They do **not** require renaming internal database columns, API parameters, test identifiers, or governance documents:

| Current Visible UI Copy | Standardized User-Facing Copy | Target UI Scope |
| :--- | :--- | :--- |
| `Ingest AI / GC Notes` | **`Import from Notes`** | `ProblemBankView.tsx`, Empty State |
| `AI Field Note Structuring` | **`Extract from Raw Notes`** | `ProblemIntakeModal.tsx` |
| `Manual 5-Anchor Entry` | **`Enter Details Manually`** | `ProblemIntakeModal.tsx`, Empty State |
| `Dossier` | **`View Details`** | `ProblemBankView.tsx` (Cards and Table) |
| `Devil's Advocate Adversarial Challenge` | **`Stress Test Assumptions`** | `ProblemBankView.tsx`, `ProblemDetailModal.tsx` |
| `Unleash Devil's Advocate` | **`Run Stress Test`** | `DevilsAdvocateModal.tsx` |
| `SIGNAL` (Evidence Tier) | **`Initial Observation`** | Badges, Filters, Dropdowns, Detail Modal |
| `STRONGLY_DOCUMENTED` | **`Strongly Verified`** | Badges, Filters, Dropdowns, Detail Modal |
| `DOCUMENTED` | **`Documented`** | Badges, Filters, Dropdowns, Detail Modal |
| `Mechanical Ratchet: Preview Mode (Read Only)` | **`Stage Locked: Review Only`** | Phase 3, 4, 5 Header Banners |
| `Locked by Mechanical Ratchet` | **`Prerequisites Incomplete`** | Stepper tooltips |
| `KNOW / UNCERTAIN` | **`Verified Fact / Unverified Assumption`** | `EvidenceLedgerCard.tsx` |

*(Note: "Initial Observation", "Documented", and "Strongly Verified" are UI presentation labels only and map directly to internal enums `SIGNAL`, `DOCUMENTED`, and `STRONGLY_DOCUMENTED`).*

---

## 15. Archive Interaction Requirements

### FR-008: In-App Problem Archival Modal (`ArchiveProblemModal`)
Replaces the native `window.prompt()` in `ProblemDetailModal.tsx:186`.

1. **Trigger**: User clicks `"Archive Problem"` in `ProblemDetailModal`.
2. **Modal Presentation**:
   - Title: **"Archive Problem Record"**
   - Bounded Explanatory copy: *"Archiving removes this problem from the active backlog."*
   - Problem summary display showing ID and statement snippet.
3. **Structured Reason Selection (`archive_reason`)**:
   - *"Failed Customer / Persona Validation"*
   - *"Market Size / Economics Unfavorable"*
   - *"Technical Feasibility Barrier"*
   - *"Duplicate / Merged with Another Record"*
   - *"Out of Strategic Scope"*
   - *"Other (enter custom note below)"*
4. **Optional Notes Field**: Allows team members to record contextual details.
5. **Bounded Behavior**: Archiving requirements are bounded strictly to existing supported backend behavior (`POST /api/problems/{id}/archive`). Archiving updates the problem status to `"archived"` and removes it from the active backlog view. This specification does not introduce or promise restore functionality.
6. **Actions**:
   - `"Cancel"` (dismisses dialog, leaves problem active).
   - `"Archive Record"` (destructive button variant, calls existing archive endpoint, updates problem status to `"archived"`).

---

## 16. State Synchronization: Phase 1 Ingestion Telemetry

### FR-010: Persistent Session Telemetry for Phase 1 Auto-Sync (`DEF-PB-005`)
To resolve the disconnect where `Phase1View.tsx` expects dynamic counts of auto-created and merged problems:

1. **State Persistence**: In `backend/routers/pipeline.py` (lines 98–105), the execution of `bulk_upsert_problems` returns ingestion counts and IDs (`new_created_count`, `created_ids`, `merged_count`, `merged_ids`).
2. **Session Storage Requirement**: `pipeline.py` must explicitly write this dictionary to `state["phase1_ingestion_summary"]` and persist it via `storage.save_session(req.session_id, state)`.
3. **Persistence Verification**: The summary data must remain present in SQLite session state and reload accurately when the user revisits Phase 1, rather than existing only as a transient endpoint response.

---

## 17. Loading, Empty, and Error States

### FR-009: Robust State Feedback
1. **Loading Feedback**: Display skeleton placeholders during initial backlog fetch or refresh, avoiding disruptive full-page spinners.
2. **Empty Backlog State**:
   - Display a clean onboarding view when `problems.length === 0`.
   - Title: *"Your Workspace Problem Bank is Empty"*.
   - 2 Action Cards:
     - **"Enter Details Manually"** (opens canonical intake modal in Manual mode).
     - **"Import from Notes"** (opens canonical intake modal in Notes Import mode).
   - Tertiary button: *"Load 15 Western Visayas Starter Problems (Sample Dataset)"*.
   - **Zero Dead Actions**: Both cards link directly to the canonical intake dialog.
3. **Empty Search / Filter State**:
   - Display: *"No matching problems found"*, with a single `"Reset All Filters"` button.
4. **Error Recovery**: Non-blocking alert banner with a `"Retry"` action if data loading fails.

---

## 18. Accessibility Requirements

### NFR-001: Component-Scoped WCAG 2.1 AA Target
This specification applies strictly to the affected Problem Bank components:

1. **Semantic Controls**: All interactive elements in affected Problem Bank components must use appropriate native semantic controls (`button`, `a`, `input`, `select`, `textarea`, etc.) with visible focus rings. Non-semantic clickable containers (such as clickable `div`s) must not be used where a native semantic control is appropriate.
2. **Outcome-Based Contrast**: All visible text within affected components must achieve a minimum contrast ratio of 4.5:1 for normal text (3:1 for large text >= 18pt) against its background, satisfying applicable WCAG 2.1 AA requirements.
3. **Keyboard Navigability & Focus**:
   - Modals trap focus and close on `Escape`.
   - All interactive controls exhibit visible, high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-500`).
4. **Screen Reader Support**: Modals include descriptive `aria-labelledby` attributes; icon-only buttons include explicit `aria-label`s.

---

## 19. Responsive & Performance Requirements

### NFR-002: Fluid Breakpoints
1. **Mobile (< 640px)**:
   - Header actions collapse into a primary full-width `"+ Add Problem"` button with secondary actions in a compact utility row.
   - Cards render as a single column with touch-friendly button targets (minimum 44x44px).
   - Modal renders full-width with sticky action footer.
2. **Tablet (640px – 1024px)**:
   - Cards render in a 2-column grid; control bar wraps cleanly.
3. **Desktop (> 1024px)**:
   - Cards render in an optimized 3-column spatial grid; table view provides smooth horizontal scrolling with pinned action columns.

### NFR-003: Observable Input Responsiveness
Problem Intake interactions must remain responsive during normal text entry and field editing, with no observed input blocking or visible UI stalls during manual verification.

---

## 20. Nielsen Norman Heuristic Compliance

| Heuristic | Implementation Requirement in this Specification |
| :--- | :--- |
| **1. Visibility of System Status** | Spinner and descriptive progress label during note extraction; skeleton cards during backlog reload; toasts confirm save and archive. |
| **2. Match Between System & Real World** | Elimination of "Ingest", "GC", "Dossier", and "Ratchet Preview" in favor of natural terms ("Import from Notes", "View Details", "Stage Locked"). |
| **3. User Control & Freedom** | Users can cancel intake at any point; bi-directional navigation between raw text and draft form; in-app archival modal with cancel. |
| **4. Consistency & Standards** | Single canonical intake component invoked across all entry points; standardized badge hierarchy and modal styling. |
| **5. Error Prevention** | Form requires essential fields (statement, persona, location) before saving; confirmation dialog on problem archival; prevents saving empty placeholder text. |
| **6. Recognition Rather than Recall** | Prominent problem statements; clear persona and location icons; visible quick-filter chips. |
| **7. Flexibility & Efficiency** | Dual Card/Table views; multi-select batch actions (Merge, Delete, Screen); quick filter chips for triage. |
| **8. Aesthetic & Minimalist Design** | Card layout streamlined; redundant badges eliminated; clean dark-mode surfaces prioritizing core text. |
| **9. Help Users Recover from Errors** | Raw pasted text preserved if extraction fails; clear inline validation messages; 1-click filter reset on empty searches. |
| **10. Help & Documentation** | Contextual placeholder examples in intake forms; clear descriptions of evidence levels in tooltips. |

---

## 21. Functional Requirements Summary

- **FR-001**: Implement progressive disclosure manual intake form (default mode).
- **FR-002**: Implement optional notes import interface with raw text parsing.
- **FR-003**: Enforce explicit AI data flow and mandatory human review before persistence.
- **FR-004**: Preserve existing relational schema, empirical data integrity, and canonical ID generation.
- **FR-005**: Restructure Problem Bank toolbar, eliminating dead actions and establishing canonical intake.
- **FR-006**: Redesign Problem Card visual hierarchy, removing badge clutter and prioritizing statement/persona.
- **FR-007**: Apply natural language terminology translations across visible UI copy.
- **FR-008**: Replace `window.prompt()` with in-app `ArchiveProblemModal`.
- **FR-009**: Implement skeleton loading, polished empty states, and error recovery banners.
- **FR-010**: Persist Phase 1 discovery ingestion summary into session state across reloads.

---

## 22. Non-Functional Requirements Summary

- **NFR-001**: Affected Problem Bank components target applicable WCAG 2.1 AA requirements (contrast, semantic controls, focus rings, keyboard traps).
- **NFR-002**: Responsive fluid layout across mobile (<640px), tablet, and desktop viewports.
- **NFR-003**: Problem Intake interactions remain responsive during normal text entry and field editing with zero observed input blocking.
- **NFR-004**: Zero new runtime dependencies.
- **NFR-005**: Zero schema migrations or database changes.
- **NFR-006**: Safe component cleanup: removal of legacy modals is conditional on verifying zero remaining references.

---

## 23. Acceptance Criteria

- [ ] **AC-001**: Clicking "+ Add Problem" opens the canonical `ProblemIntakeModal` defaulting to Manual Entry.
- [ ] **AC-002**: The orphaned "Ingest AI / GC Notes" button is completely removed from the header and empty state.
- [ ] **AC-003**: Pasting unstructured notes in the "Import from Notes" tab and clicking "Extract Problem Details" calls `POST /api/problems/enrich` and populates the editable review form.
- [ ] **AC-004**: The user can edit all fields on the review form before saving.
- [ ] **AC-005**: Clicking "Save to Problem Bank" persists the record via `POST /api/problems/` and prepends it to the active Problem Bank list with a canonically assigned sector ID.
- [ ] **AC-006**: Manual entry requires Problem Statement, Persona, and Location before saving.
- [ ] **AC-007**: Every problem card renders the Problem Statement as the primary visual focus, with at most 3 clear metadata badges in the header (ID, Sector, Evidence).
- [ ] **AC-008**: The card action button reads "View Details" (not "Dossier") and opens the detail modal.
- [ ] **AC-009**: The challenge action button reads "Stress Test" (not "Devil's Advocate Adversarial Challenge").
- [ ] **AC-010**: Clicking "Archive" in the detail modal opens `ArchiveProblemModal` with a reason dropdown (no browser `window.prompt`).
- [ ] **AC-011**: Confirming archival marks the problem status as `"archived"` and removes it from the active backlog view.
- [ ] **AC-012**: Empty-state shortcuts ("Enter Details Manually" and "Import from Notes") invoke the canonical `ProblemIntakeModal` in their respective initial modes.
- [ ] **AC-013**: Visible user-facing Problem Bank UI copy contains zero occurrences of "GC", "Ingest", "Dossier", or "Mechanical Ratchet: Preview".
- [ ] **AC-014**: All interactive elements in affected Problem Bank components use appropriate native semantic controls (`button`, `a`, `input`, `select`, `textarea`, etc.) with visible focus rings and WCAG 2.1 AA compliant contrast.
- [ ] **AC-015**: Phase 1 ingestion summary data persists in session state and displays correctly upon page reload.
- [ ] **AC-016**: Existing Problem Bank records present before implementation remain readable and have equivalent persisted field values after implementation, verified via pre/post snapshot comparison.

---

## 24. Explicit Non-Goals

1. **No Backend AI Architecture Changes**: No changes to `llm_gateway.py`, provider cascades, or Ollama models.
2. **No Database Schema Changes**: No alterations to SQLite tables, column names, or migrations.
3. **No New Epistemic Rules**: No changes to evidence-tier rules, epistemic promotion authority, Mechanical Ratchet criteria, or claim/evidence governance.
4. **No API Route Additions or Deletions**: Preserve all existing API endpoints and contracts.
5. **No Capstone / Product Framework Activation**: Dormant frameworks remain inactive.
6. **No Research B–F Implementation**: Computing Research Stages B, D, E, and F remain bounded placeholders.
7. **No General Session Architecture Overhaul**: Session persistence invariants from `SPEC-REMEDIATION-USABILITY-001` remain untouched.

---

## 25. Defect-to-Requirement Traceability

| Defect ID | Defect Description | Fulfilling Requirements | Acceptance Criteria | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **`DEF-PB-001`** | Orphaned "Ingest AI / GC Notes" button | FR-002, FR-005 | AC-001, AC-002, AC-012 | UI click check; DOM mount audit |
| **`DEF-PB-002`** | Duplicated intake entry points | FR-001, FR-002, FR-003 | AC-001, AC-003, AC-004 | Inspection of unified modal tabs |
| **`DEF-PB-003`** | Internal jargon exposed in UI | FR-007 | AC-008, AC-009, AC-013 | UI copy grep on affected views |
| **`DEF-PB-004`** | `window.prompt()` archival anti-pattern | FR-008 | AC-010, AC-011 | Click archive; verify modal |
| **`DEF-PB-005`** | Phase 1 auto-sync summary disconnect | FR-010 | AC-015 | Phase 1 execution & reload check |
| **`DEF-PB-006`** | Card layout clutter and visual noise | FR-006 | AC-007 | Card visual hierarchy audit |
| **`DEF-PB-008`** | Non-semantic buttons and contrast gaps | NFR-001 | AC-014 | HTML element & contrast audit |

---

## 26. Verification Plan

### 1. Automated Verification
- **TypeScript Typecheck**: `cd web && npm run typecheck` (0 errors).
- **Production Web Build**: `cd web && npm run build` (successful compilation with Turbopack).
- **Scoped Backend Tests**: Require all applicable offline unit/contract tests for this specification to pass (e.g. `pytest backend/tests/test_remediation_usability.py`, `pytest backend/tests/test_gate_engine.py`, etc.). Provider-dependent/live AI network tests are reported separately and are not treated as failures of this specification unless directly in scope.

### 2. Mandatory Manual / Browser Verification Checklist
*(Mandatory Gate: Browser and manual verification is mandatory for interactive and visual acceptance criteria. Automated tests, typecheck, and build alone do not constitute verification for UI behavior. The implementation cannot be considered VERIFIED until this checklist has been completed successfully).*

1. **Existing Records Integrity**: Record a pre-implementation snapshot/inventory of existing problem records in `convera.db`; verify post-implementation that all existing records load, render, and have equivalent field values.
2. **New Manual Intake**: Open "+ Add Problem" (defaults to Manual Entry); verify required fields enforce validation; save problem and confirm canonical sector ID assignment.
3. **Notes Import & AI Extraction Failure/Recovery**: Switch to "Import from Notes"; test both valid text extraction and malformed/unparseable text; verify raw text is preserved and error feedback displays.
4. **Mandatory Human Review**: Confirm that AI extraction always routes to the editable review form before saving, and cannot save autonomously.
5. **Persistence Across Reload**: Save a new problem, refresh the browser, and confirm the record persists in SQLite with identical attributes.
6. **Archival Flow**: Click "View Details" -> "Archive Problem"; verify in-app modal opens (no browser prompt); select a reason and confirm archival; verify problem moves out of active backlog.
7. **Empty State Shortcuts**: On an empty workspace, click "Enter Details Manually" and "Import from Notes" shortcuts; verify they invoke the canonical modal in the correct modes.
8. **Visible UI Terminology**: Audit visible Problem Bank copy; confirm zero occurrences of "GC", "Ingest", "Dossier", or "Mechanical Ratchet: Preview".
9. **Keyboard Accessibility**: Verify `Tab`, `Space`, `Enter`, and `Escape` operate cleanly on native semantic controls with visible focus rings.
10. **Responsive Layout**: Test viewports at 375px (mobile), 768px (tablet), and 1440px (desktop); confirm no layout overflow.
11. **Phase 1 Ingestion Telemetry**: Run Phase 1 discovery; reload the page; confirm dynamic created/merged problem counts persist in session state and render accurately.

---

## 27. Governance Gate

### Current Unbuilt Status
- **Source Code Modified**: 0 lines.
- **UI Components Altered**: 0 lines.
- **Specification Status**: PRECISION-COMPLETE.

### Verification Governance
Browser and manual verification is mandatory for interactive and visual acceptance criteria. Automated tests, typechecks, and builds alone do not constitute verification for UI behavior. The implementation cannot be considered VERIFIED until the manual/browser checklist has been completed successfully.

### Proposed Implementation Sequence
1. Create `web/src/components/problem-bank/ProblemIntakeModal.tsx` (canonical intake defaulting to Manual Entry with optional Notes Import and mandatory human review).
2. Create `web/src/components/problem-bank/ArchiveProblemModal.tsx` (in-app archival dialog).
3. Refactor `web/src/components/problem-bank/ProblemBankView.tsx`:
   - Remove orphaned "Ingest AI / GC Notes" button.
   - Connect "+ Add Problem" and empty-state shortcuts to `ProblemIntakeModal`.
   - De-clutter card layout and apply terminology normalization.
4. Update `web/src/components/problem-bank/ProblemDetailModal.tsx` (integrate `ArchiveProblemModal`, update terminology).
5. Safe Component Removal: Verify that no external references require `RawBrainstormIngestModal.tsx` and `ManualProblemModal.tsx` before deleting them.
6. Update `backend/routers/pipeline.py` to persist `phase1_ingestion_summary` in session state.
7. Execute automated and manual verification suite (`pytest` offline tests, `npm run typecheck`, `npm run build`, mandatory browser checklist).

---

# 28. GOVERNANCE CONCLUSION

STATUS:
RATIFIED — IMPLEMENTATION NOT AUTHORIZED
