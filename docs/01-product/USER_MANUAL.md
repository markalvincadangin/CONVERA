# CONVERA Platform User Manual & Operating Guide

> **Document ID**: `CONVERA-DOC-001`  
> **Classification**: Official Platform User Guide & Truth-Maintenance Protocol  
> **Authority Tier**: Tier 2 Operational Documentation  
> **Ratification Date**: September 6, 2026  
> **Status**: 🟢 ACTIVE & RATIFIED  
> **Canonical Path**: `docs/01-product/USER_MANUAL.md`  
> **Upstream Dependencies**: `docs/00-foundation/CONSTITUTION.md`, `docs/01-product/PRODUCT_DEFINITION.md`  
> **Downstream Dependents**: In-App Help & Documentation Center (`HelpCenterModal.tsx`)

---

## 1. Overview: The Epistemic Validation Workbench

CONVERA is not a standard agile project management tool or an ideation whiteboard. It is a **Socratic epistemic validation workbench** designed to enforce evidence-driven venture discovery, prevent premature consensus, and rigorously test business assumptions before code is written or capital is committed.

### The Core Axiom: Knowledge ≠ Ephemeral Workflow
In conventional tools, moving a card across a Kanban board or finishing a wizard step deletes or bypasses prior evidence. In CONVERA, all research claims, field observations, customer commitments, and Socratic challenges form a **persistent, reactive relational knowledge graph**. If an assumption made early in your venture is later disproven, the system automatically detects the conflict and alerts your team.

### 1.2 Operating the Problem Bank: Discovery, Filtering & Selection
The **Problem Bank** is your venture team's single source of truth for raw and structured problem signals.

#### Deterministic Sorting
Problems can be sorted deterministically without page reloads:
- **Latest → Oldest**: Prioritizes newly logged problems by creation timestamp, with stable secondary ID ordering.
- **Oldest → Latest**: Reverses chronological ordering to inspect initial seed discoveries.
- **Score (High → Low)**: Prioritizes problems with the highest epistemic and economic workaround scores.
- **Votes**: Surfaces team-upvoted problems prioritized during field syncs.
- **Evidence Tier**: Ranks records by documentary rigor (`Strongly Verified` $\rightarrow$ `Documented` $\rightarrow$ `Initial Observation`).

#### Universal Selection & Invariants
Selection controls operate identically in both **Card View** and **Table View**:
- **Select All Visible**: Selects every problem currently visible in the active search/filter view. It never secretly selects records hidden by active filters.
- **Filter Preservation**: If you select problems and subsequently apply a filter that hides some of them, your hidden selections remain preserved in memory. The selection toolbar explicitly communicates: `X of Y visible selected (Z outside active filter)`.
- **Clear Selection**: Unambiguously clears all selections across both visible and hidden records.
- **Batch Actions**: When multiple records are selected, you can trigger **Merge Selected** (combining duplicates and citations into a primary record), **Delete Selected**, or **Screen in Phase 2**.

#### Active Filter Badges & Quick Resets
Whenever filters are active (Text Search, Sector, Evidence Tier, or Quick Filters):
- **Dismissible Pills**: Active filters appear as badges with an `✕` button to remove that specific constraint.
- **Clear All Filters**: Resets all search and filter criteria in one click, immediately returning the full backlog.

---

## 2. Truth Maintenance & Epistemic Invalidation

### 2.1 What is an "Epistemic Invalidation"?
In research science and epistemology, an assertion's truth-value is provisional. When you formulate an initial venture hypothesis (e.g. *"Trucking cooperatives suffer severe demurrage penalties"*), you log it as an **Assumption**. 

An **Epistemic Invalidation** occurs when:
1. **Empirical Falsification**: An empirical test experiment, customer survey, or Mom Test interview fails to achieve the target threshold (e.g., target willingness-to-pay was 0%, or reported frequency was negligible).
2. **Contradicting Evidence**: Field evidence is linked that directly disproves or falsifies a core claim.

When an assumption is falsified, the system does not silently let you proceed. Under **CONVERA Constitution Article VI (Epistemic Invalidation)**, the platform triggers an **Epistemic Invalidation Alert**.

### 2.2 What is the "Blast Radius"?
The **Blast Radius** is the directed dependency chain of downstream decisions, screening selections, mechanisms, or Lean Canvas items that were built upon the falsified assumption.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ROOT INVALIDATION (Trigger)                                             │
│ [Assumption] #IMPACT-ASM-001                                            │
│ "Validation Test Failed: Field experiment failed target metric"         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼ (Impact Propagation)
┌─────────────────────────────────────────────────────────────────────────┐
│ COMPROMISED DOWNSTREAM DECISION                                         │
│ [Decision Record] #DEC-TEST-001                                         │
│ "Phase 2 (Screening): Candidate Selection"                              │
│ Status: COMPROMISED (Selected candidate has invalidated premise)        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Resolving an Invalidation Alert: Step-by-Step
When an Epistemic Invalidation Alert appears on your Problem Bank or dashboard:

1. **Inspect the Blast Radius**:
   Click **View Blast Radius** on the alert banner to expand the directed dependency pipeline.
2. **Identify the Broken Premise**:
   Review the **Root Invalidation (Cause)** card to understand why the assumption or evidence was refuted.
3. **Execute Remediation**:
   Click the actionable button **Review in Phase 2 (Screening)**. This transitions your active workspace directly to the affected decision room or screening matrix.
4. **Recalibrate the Decision**:
   In Phase 2, either replace the candidate with an alternate problem backed by valid evidence, or update your hypothesis.
5. **Acknowledge the Alert**:
   Once your venture team has discussed and adjusted the decision, click **Acknowledge** on the banner. The alert is marked as resolved in the audit trail.

### 2.4 Managing High Alert Volumes & Audit History
If multiple background simulations, automated testing suites, or extensive field experiments ran on your session, multiple alert records may accumulate (e.g., `Item 1 of 94`).
* **Item-by-Item Paging**: Use the `‹` and `›` controls on the banner or within the drawer to review each alert independently.
* **Batch Acknowledgement**: Click **Acknowledge All (N)** to bulk-resolve historical test alerts once your team has audited the root causes.

---

## 3. The 5-Phase Venture Validation Workflow

| Phase | Name | Focus | Key Gate Criteria |
|---|---|---|---|
| **Phase 1** | **Problem Discovery & Bank** | Field observation intake, AI structuring, Devil's Advocate challenges | Evidence Score $\ge 75\%$, minimum 3 diverse sources |
| **Phase 2** | **Opportunity Screening** | Economic pain triage, frequency vs. severity matrix | **Gate 1: Opportunity Worthiness** (Market size & workaround costs) |
| **Phase 3** | **Socratic Validation** | 6-Level Mom Test interviews, zero-compliment auditing | **Gate 2: Behavioral Validation** (Past actions, verified economic sacrifice) |
| **Phase 4** | **Solution Ideation** | 15 Mechanism divergence (Software, Hardware, Pooling, Logistics) | Solution divergence across at least 3 distinct mechanism families |
| **Phase 5** | **MVP Commitment Audit** | Skin-in-the-game experiments (Tier 1 cash deposits to Tier 4 time) | **Gate 3: Commitment Audit** (PURSUE / PIVOT / RETIRE verdict) |

---

## 4. In-App Help & Documentation

For instant assistance while using the workbench:
* **Keyboard Shortcut**: Press `Ctrl+K` to open the Command Palette and search topics.
* **Help Modal**: Click the `?` icon in the top navigation bar to open the **Help & Documentation Center**. It includes:
  * **Quickstart**: 5-Minute Validation Workflow.
  * **FAQs**: Answers to common questions regarding Problem Bank, Devil's Advocate, and Invalidation Alerts.
  * **Glossary**: Authoritative definitions of technopreneurship and epistemic terms.
