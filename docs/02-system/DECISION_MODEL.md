# CONVERA - Decision Model Specification

**Document ID**: `CONVERA-SYS-005`  
**Classification**: Governed Decisions & Blast Radius Cascades  
**Authority Tier**: Tier 2 System Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/02-system/DECISION_MODEL.md`  
**Upstream Dependencies**: `02-system/EVIDENCE_MODEL.md, 00-foundation/CONSTITUTION.md (Article VI)`  
**Downstream Dependents**: `02-system/TRACEABILITY_MODEL.md, backend/engines/impact_engine.py`  

---

> **Architectural Decisions, Validity States, Impact Blast Radius & Pivot Dynamics.**  
> This document authoritatively specifies how decisions are formulated, evaluated, recorded, validated, invalidated, and evolved across the CONVERA platform. It operationalizes DecisionRecord (Entity 10), ProblemAlternative (Entity 11), and ImpactInvalidationEvent (Entity 13) from DOMAIN_MODEL.md, integrating tightly with KNOWLEDGE_MODEL.md and EVIDENCE_MODEL.md.

---

## 1. Decision Model Scope & Core Invariants

In CONVERA, a decision is not an ephemeral discussion note; it is a **first-class governed architectural record** that links human strategic intent to empirical evidence and downstream technical requirements.

The Decision Model is governed by four inviolable principles:
1. **Traceable Epistemic Basis:** Every consequential decision must have a traceable epistemic basis connecting the decision to relevant claims, evidence, assumptions, constraints, prior decisions, or other governed justification records as applicable.
2. **Decoupled Decision Confidence ({\\text{DEC}}$):** A decision maker\'s confidence ({\\text{DEC}} \\in [0.0, 1.0]$) represents explicit human-ratified conviction, decoupled from raw AI generation confidence ({\\text{AI}}$) and mathematical evidence strength ({\\text{EVID}}$).
3. **Reactive Impact Invalidation:** When an underlying justification claim is contested, falsified, or its evidence retracted, dependent decisions are automatically placed into **STALE_REVIEW_REQUIRED** rather than silently remaining active.
4. **Permanent Audit Lineage:** Decisions are never deleted or overwritten in place. Pivots and architectural shifts create new versioned decision records with explicit supercession pointers (superseded_by_id), preserving the complete decision trajectory.

---

## 2. Decision Structure & Attribute Schema

Every DecisionRecord encapsulates the comprehensive context required to understand *why* a choice was made and *what* alternatives were rejected:

`	ext
+-----------------------------------------------------------------------------+
|                           DECISION RECORD SCHEMA                            |
+-------------------------+---------------------------------------------------+
| Field                   | Semantic Specification                            |
+-------------------------+---------------------------------------------------+
| id                      | Canonical UUIDv4 identifier.                      |
| project_id              | Scoped project context.                           |
| title                   | Concise, imperative statement of choice.          |
| context_summary         | Problem space context and situational pressures.  |
| status                  | Governed state (PROPOSED, ACTIVE, STALE, etc.).   |
| selected_alternative_id | Reference to chosen ProblemAlternative.           |
| trade_off_analysis      | Structured pros/cons of evaluated alternatives.   |
| decision_confidence     | C_DEC in [0.0, 1.0] (Human-ratified conviction).  |
| ratifier_id             | User ID of human authority who locked decision.   |
| ratification_timestamp  | ISO 8601 UTC timestamp of formal adoption.        |
| superseded_by_id        | Optional pointer to replacing DecisionRecord.     |
+-------------------------+---------------------------------------------------+
`

---

## 3. Decision Lifecycle & Validity State Machine

A decision moves through five governed states during its lifecycle:

`	ext
  +--------------+
  |   PROPOSED   |  <-- Drafted by researcher or synthesized by AI assistance
  +------+-------+
         | Human Ratification (ratifier_id + C_DEC assigned)
         v
  +--------------+
  |    ACTIVE    |  <-- Current binding architectural baseline
  +------+-------+
         |
         +-- Underlying Basis CONTESTED / FALSIFIED --> +-------------------------+
         |                                              |  STALE_REVIEW_REQUIRED  |
         |                                              +------------+------------+
         |                                                           |
         | Re-ratified with updated evidence/rationale --------------+
         |                                                           |
         | Strategic Pivot or Architectural Replacement -------> +---+---------------------+
         |                                                       |    SUPERSEDED_PIVOT     |
         |                                                       +-------------------------+
         | Explicit Abandonment (No replacement)
         v
  +--------------+
  |  DEPRECATED  |
  +--------------+
`

### State Definitions:
1. **PROPOSED**: Candidate decision formulated with candidate alternatives; awaiting human evaluation and ratification.
2. **ACTIVE**: Ratified, authoritative architectural decision actively governing downstream requirements and implementation artifacts.
3. **STALE_REVIEW_REQUIRED**: A reactive validity state raised when one or more underlying justification claims are contested, refuted, or decayed below threshold. It may resolve back to ACTIVE after human reassessment, or progress to a replacement (SUPERSEDED_PIVOT) or DEPRECATED state.
4. **SUPERSEDED_PIVOT**: Historical decision replaced by a newer decision record via a structured pivot loop. Retained for retrospective audit.
5. **DEPRECATED**: Formally retired decision that has been phased out without a direct 1:1 replacement.

---

## 4. Alternative Synthesis & Evaluation Protocol

Before an architectural choice can be ratified, CONVERA requires the evaluation of structured ProblemAlternative entities (Entity 11):

`	ext
+-----------------------------------------------------------------------------+
|                       ALTERNATIVE EVALUATION MATRIX                         |
+------------------+-------------------+---------------------+----------------+
| Alternative      | Evidence Basis    | Implementation Risk | Status         |
+------------------+-------------------+---------------------+----------------+
| Option A (Chosen)| Strong (Validated)| Low (Feasible)      | SELECTED       |
| Option B         | Moderate (Prepr.) | High (Complexity)   | REJECTED       |
| Option C         | Weak / Contradict.| Extreme (Unviable)  | REJECTED       |
+------------------+-------------------+---------------------+----------------+
`

* **Candidate Synthesis (AI Role):** The AI assistance layer may propose viable alternatives, highlight technical trade-offs, and surface relevant literature evidence.
* **Selection Authority (Human Role):** Only human researchers/engineers hold the authority to designate an alternative as SELECTED and transition the decision to ACTIVE.

---

## 5. Reactive Impact Engine & Blast Radius Propagation

The **Impact Engine** (backend/engines/impact_engine.py) evaluates dependency impact when relevant evidence, claim, or decision state changes occur.

### A. Blast Radius Traversal Algorithm
1. **Source Event:** An EvidenceItem is invalidated, or a ProblemClaim transitions to CONTESTED or FALSIFIED.
2. **Traceability Resolution:** The engine resolves traceability relationships between the affected claim and dependent decisions.
3. **State Demotion:** The status of all linked ACTIVE decisions is updated to **STALE_REVIEW_REQUIRED**.
4. **Downstream Traceability Cascade:** Downstream requirements associated through governed traceability relationships are flagged for verification review.
5. **Audit Event Generation:** An ImpactInvalidationEvent (Entity 13) is created with the full dependency graph and blast radius count.

`	ext
  [Evidence Refutation]
          |
          v
  [ProblemClaim: CONTESTED]
          |
          v  (Impact Engine Blast Radius Analysis)
  +-------------------------------------------------------+
  │ DecisionRecord (ID: dec-104) --> STALE_REVIEW_REQUIRED│
  +---------------------------+---------------------------+
                              |
                              v
  +-------------------------------------------------------+
  │ Downstream Requirements Flagged for Verification Review│
  +-------------------------------------------------------+
`

---

## 6. The Structured Pivot Loop

When a key hypothesis is falsified or a decision is invalidated by emerging evidence, CONVERA guides the project through a **Structured Pivot Loop**:

`	ext
  1. INVALIDATION DETECTION --> Impact Engine flags Decision as STALE_REVIEW_REQUIRED
                |
                v
  2. PROBLEM RE-CIRCUMSCRIPTION --> New CircumscriptionIteration registered
                |
                v
  3. ALTERNATIVE RE-EVALUATION --> Unselected ProblemAlternatives re-evaluated
                |
                v
  4. NEW DECISION FORMULATION --> DecisionRecord (v2) created (PROPOSED)
                |
                v
  5. HUMAN RATIFICATION --> DecisionRecord (v2) -> ACTIVE;
                            DecisionRecord (v1) -> SUPERSEDED_PIVOT
`

> **Audit Guarantee:**  
> The pivot loop never alters the historical record of Decision (v1). Retrospective reviewers can inspect why Decision (v1) was made, which evidence originally supported it, why it was invalidated, and how Decision (v2) resolved the deficiency.
