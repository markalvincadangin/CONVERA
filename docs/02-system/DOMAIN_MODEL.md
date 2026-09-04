# CONVERA — Domain Model Specification

**Document ID**: `CONVERA-SYS-002`  
**Classification**: 16 Canonical Domain Entities & Lifecycle  
**Authority Tier**: Tier 2 System Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/02-system/DOMAIN_MODEL.md`  
**Upstream Dependencies**: `00-foundation/GLOSSARY.md, 02-system/SYSTEM_ARCHITECTURE.md`  
**Downstream Dependents**: `05-data/DATABASE_SCHEMA.md, 06-frontend/INFORMATION_ARCHITECTURE.md`  

---

> **Canonical Domain Entities, Semantic Invariants & Entity Relationships.**  
> This document authoritatively specifies what entities exist within CONVERA, what each entity represents semantically, their lifecycle state machines, and their conceptual relationships, independent of physical database storage schemas.

---

## 1. Domain Model Scope & Core Invariants

The CONVERA Domain Model governs the **conceptual meaning, epistemic classifications, and logical relationships** of project intelligence. It enforces four domain invariants:
1. **Entity Orthogonality (Knowledge ≠ Workflow):** Canonical domain entities exist independently of any user interface phase or operational framework.
2. **First-Class Epistemics:** Hypotheses, assumptions, opposing evidence, and unmeasured risks are modeled as first-class domain entities rather than untracked metadata.
3. **Traceable Epistemic Basis:** Every consequential decision and requirement must maintain traceable justification, connecting to its supporting evidence, active assumptions, constraints, and/or prior decisions.
4. **Audit Immutability vs. Reactive Validity:** Historical records of what occurred are immutable; the current validity status of claims and decisions is reactive and revisable.

---

## 2. Canonical Domain Entity Catalog

CONVERA distinguishes between **16 Canonical Domain Entities** (which model core project intelligence) and **4 Support / Operational Entities** (which manage collaboration and runtime state).

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CANONICAL DOMAIN ENTITY TAXONOMY                       │
├───────────────────────┬─────────────────────────┬───────────────────────────────┤
│ KNOWLEDGE CORE (1–9)  │ DECISION & IMPACT(10–13)│ GOVERNANCE & RESEARCH (14–16) │
├───────────────────────┼─────────────────────────┼───────────────────────────────┤
│ 1. Project            │ 10. DecisionRecord      │ 14. GateReview                │
│ 2. ProblemRecord      │ 11. ProblemAlternative  │ 15. ResearchDomain            │
│ 3. ProblemClaim       │ 12. RequirementsTrace   │ 16. CircumscriptionIteration  │
│ 4. EvidenceItem       │ 13. ImpactInvalidation  │                               │
│ 5. ProvenanceRecord   │                         │                               │
│ 6. ProblemAssumption  │                         │                               │
│ 7. ValidationTest     │                         │                               │
│ 8. ProjectUnknown     │                         │                               │
│ 9. ClaimContradiction │                         │                               │
├───────────────────────┴─────────────────────────┴───────────────────────────────┤
│ SUPPORT & OPERATIONAL ENTITIES (Implementation Layer)                           │
│ • ProjectMember · SessionState · SessionSnapshot · MentorSignoff                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### A. Knowledge Core Entities (1–9)

#### 1. `Project`
* **Semantic Definition:** The top-level root boundary establishing workspace isolation, collaboration scope, and access control.
* **Core Attributes:** `id`, `name`, `description`, `share_code`, `passcode_hash`, `created_at`, `updated_at`.
* **Relationships:** 1-to-Many with `ProblemRecord`, `ProjectUnknown`, `GateReview`, `ProjectMember`, `SessionState`.

#### 2. `ProblemRecord`
* **Semantic Definition:** An articulated real-world challenge, empirical obstacle, knowledge gap, or technical limitation that provides the focal subject of innovation or research within a project.
* **Core Attributes:** `id`, `project_id`, `problem_statement`, `affected_stakeholders`, `quantified_consequence`, `source_type`, `domain_id` (optional `0..1`), `current_stage`, `created_at`.
* **Relationships:** 1-to-Many with `ProblemClaim`, `ProblemAssumption`, `ProblemAlternative`, `CircumscriptionIteration`. Optional Many-to-1 with `ResearchDomain`.

#### 3. `ProblemClaim`
* **Semantic Definition:** A testable proposition asserting a specific causal, empirical, or factual truth within a problem space.
* **Core Attributes:** `id`, `problem_id`, `claim_statement`, `epistemic_status` (`UNKNOWN`, `HYPOTHESIS`, `SUPPORTED`, `VALIDATED`, `CONTESTED`, `FALSIFIED`), `net_epistemic_balance`, `confidence_score`.
* **Relationships:** Many-to-Many with `EvidenceItem` (via typed links), 1-to-Many with `ClaimContradiction`.

#### 4. `EvidenceItem`
* **Semantic Definition:** An empirical observation, published academic study, clinical trial, or verified field dataset providing factual support or refutation for a claim.
* **Core Attributes:** `id`, `title`, `abstract_or_summary`, `tier` (`TIER_A`, `TIER_B`, `TIER_C`), `relevance_score`, `freshness_score`.
* **Implementation Mapping (`CURRENT_IMPLEMENTATION`):** Stored in `evidence_provenance` and `problem_sources` tables. In the current SQLite schema, each row embeds one evidence unit with its primary provenance metadata (1:1 in `CURRENT_IMPLEMENTATION`). Conceptually, an evidence item may associate with multiple provenance verification events.
* **Relationships:** Many-to-Many with `ProblemClaim` through typed edges (`SUPPORTS`, `CONTRADICTS`, `CONTEXTUALIZES`, `FALSIFIES`). Associated with `ProvenanceRecord`.

#### 5. `ProvenanceRecord`
* **Semantic Definition:** The lineage record establishing where an evidence item originated, how it was ingested, and its verification context. Historical origin lineage and extraction metadata are preserved and must not be silently overwritten or deleted; verification status remains governed and revisable.
* **Core Attributes:** `id`, `evidence_id`, `connector_id`, `source_identifier` (DOI, PMID, URL, hash), `extraction_timestamp` (UTC), `extracting_model`, `verification_status` (`UNVERIFIED`, `VERIFIED_BY_RESEARCHER`, `DISPUTED`).
* **Relationships:** Bound to `EvidenceItem`.

#### 6. `ProblemAssumption`
* **Semantic Definition:** An unverified premise or condition that must hold true for the current understanding, technical architecture, or venture model to be valid.
* **Core Attributes:** `id`, `problem_id`, `assumption_text`, `risk_level` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `origin` (`FOUNDER_INPUT`, `AI_EXTRACTED`), `validation_status` (`UNTESTED`, `IN_PROGRESS`, `SUPPORTED`, `FALSIFIED`).
* **Relationships:** 1-to-Many with `AssumptionValidationTest`.

#### 7. `AssumptionValidationTest`
* **Semantic Definition:** A planned or executed empirical experiment, user interview, benchmark test, or field trial designed to validate or falsify an assumption.
* **Core Attributes:** `id`, `assumption_id`, `test_methodology`, `falsification_criteria`, `results_summary`, `test_status` (`PLANNED`, `EXECUTING`, `PASSED`, `FAILED`), `tested_at`.
* **Relationships:** Many-to-1 with `ProblemAssumption`.

#### 8. `ProjectUnknown`
* **Semantic Definition:** A structured item of identified uncertainty within a project's problem space.
* **Core Attributes:** `id`, `project_id`, `unknown_text`, `triangulation_category` (`WHAT_WE_KNOW`, `WHAT_WE_THINK`, `WHAT_WE_DONT_KNOW`), `urgency` (`HIGH`, `MEDIUM`, `LOW`).
* **Epistemic Note:** While the entity is named `ProjectUnknown`, it participates in the **Epistemic Triangulation framework**, classifying items into verified constants (*What We Know*), active working hypotheses (*What We Think*), or unmeasured risks (*What We Don't Know*).
* **Relationships:** Many-to-1 with `Project`.

#### 9. `ClaimContradiction`
* **Semantic Definition:** A formally recognized epistemic conflict affecting the validity, interpretation, or empirical balance of a claim.
* **Implementation Mapping (`CURRENT_IMPLEMENTATION`):** Represented in `claim_contradictions` as associations between opposing and supporting evidence items attached to the same claim.
* **Core Attributes:** `id`, `claim_id`, `supporting_evidence_id`, `opposing_evidence_id`, `severity` (`PARTIAL_TENSION`, `DIRECT_CONTRADICTION`, `CRITICAL_FALSIFICATION`), `detected_at`.
* **Relationships:** Many-to-1 with `ProblemClaim`.

---

### B. Decision & Impact Entities (10–13)

#### 10. `DecisionRecord`
* **Semantic Definition:** The authoritative record of an explicit project choice, preserving the chosen concept, rejected alternatives, rationale, and causal dependencies.
* **Audit Immutability vs. Validity:** The historical record of the decision event is **immutable**; its operational validity status is **reactive and revisable**.
* **Core Attributes:** `id`, `problem_id`, `chosen_concept`, `rejected_alternatives` (JSON list), `decision_rationale`, `selected_by`, `validity_status` (`PROPOSED`, `ACTIVE`, `STALE_REVIEW_REQUIRED`, `SUPERSEDED_PIVOT`), `timestamp`.
* **Relationships:** 1-to-Many with `RequirementsTraceability`, 1-to-Many with `ImpactInvalidationEvent`.

#### 11. `ProblemAlternative`
* **Semantic Definition:** A distinct solution candidate, mechanism family concept, or architectural approach evaluated during the decision-making process.
* **Core Attributes:** `id`, `problem_id`, `alternative_name`, `description`, `mechanism_category`, `status` (`CANDIDATE`, `SELECTED`, `REJECTED`), `created_at`.
* **Relationships:** Many-to-1 with `ProblemRecord`.

#### 12. `RequirementsTraceability`
* **Semantic Definition:** A functional, non-functional, or architectural software specification linked back to its underlying decisions, claims, and evidence.
* **Core Attributes:** `id`, `project_id`, `decision_id`, `requirement_text`, `requirement_type` (`FUNCTIONAL`, `NON_FUNCTIONAL`, `ARCHITECTURAL`), `verification_method`.
* **Relationships:** Many-to-1 with `DecisionRecord`.

#### 13. `ImpactInvalidationEvent`
* **Semantic Definition:** A reactive notification record generated when evidence refutation or assumption falsification impacts a downstream decision.
* **Core Attributes:** `id`, `decision_id`, `trigger_entity_type` (`EVIDENCE`, `ASSUMPTION`), `trigger_entity_id`, `event_description`, `status` (`UNACKNOWLEDGED`, `ACKNOWLEDGED`, `RESOLVED_VIA_PIVOT`), `created_at`.
* **Relationships:** Many-to-1 with `DecisionRecord`.

---

### C. Governance & Research Entities (14–16)

#### 14. `GateReview`
* **Semantic Definition:** A formal quality gate review record capturing rubric scores, criteria verifications, and committee sign-offs.
* **Core Attributes:** `id`, `project_id`, `gate_id` (`GATE_1`, `GATE_2`, `GATE_3`, `GATE_4`), `review_status` (`PENDING`, `APPROVED`, `REVISE_RESUBMIT`, `REJECTED`), `rubric_scores` (JSON), `committee_notes`, `reviewed_at`.
* **Relationships:** Many-to-1 with `Project`.

#### 15. `ResearchDomain`
* **Semantic Definition:** A canonical or custom computing research field defining domain keywords, typical methodologies, and evaluation criteria.
* **Core Attributes:** `id` (`D01`–`D25`, `CUSTOM_*`), `domain_code`, `domain_name`, `description`, `sample_variables`, `is_canonical`.
* **Relationships:** Optional 1-to-Many with `ProblemRecord`.

#### 16. `CircumscriptionIteration`
* **Semantic Definition:** A DSR iteration record capturing artifact evaluation deficits and translating them into new design constraints for the subsequent research cycle.
* **Core Attributes:** `id`, `problem_id`, `iteration_number`, `evaluation_metric_name`, `target_value`, `observed_value`, `extracted_constraint`, `next_action`, `logged_at`.
* **Relationships:** Many-to-1 with `ProblemRecord`.

---

### D. Support & Operational Entities

These entities support multi-user collaboration, session state tracking, and state snapshots, but do not represent persistent epistemic knowledge:
* **`ProjectMember`:** Collaborator profiles, workspace permissions, and audit attribution.
* **`SessionState`:** Ephemeral session tracking (active phase, UI step, navigation history).
* **`SessionSnapshot`:** Point-in-time serialized state checkpoint for backup and rollback.
* **`MentorSignoff`:** Advisory sign-off stamps for institutional milestone tracking.

---

## 3. Domain Entity Relationship Graph

```text
                               ┌─────────────┐
                               │   Project   │
                               └──────┬──────┘
                                      │ 1
                         ┌────────────┼────────────┐
                         │ *          │ *          │ *
                         ▼            ▼            ▼
                   ┌──────────┐ ┌───────────┐ ┌──────────┐
                   │ GateRev. │ │  Unknown  │ │ Member   │
                   └──────────┘ └───────────┘ └──────────┘
                         │
                         │ 1
                         ▼
                  ┌──────────────┐
                  │ProblemRecord │ ◀─── 0..1 [ ResearchDomain ]
                  └──────┬───────┘
                         │ 1
         ┌───────────────┼───────────────┬───────────────┐
         │ *             │ *             │ *             │ *
         ▼               ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │ProblemClm │   │ProblemAsm │   │ProblemAlt │   │Circumscr. │
   └─────┬─────┘   └─────┬─────┘   └───────────┘   └───────────┘
         │ *             │ 1             
         ▼               ▼               
   ┌───────────┐   ┌───────────┐   
   │EvidenceItm│   │Valid.Test │   
   └─────┬─────┘   └───────────┘   
         │ (Associated Lineage)    
         ▼                         
   ┌───────────┐                   
   │Provenance │                   ┌───────────┐
   └───────────┘                   │ Decision  │ ◀─── (Informed by Claims)
         ▲                         └─────┬─────┘
         │ (opposing pairs)              │ 1
   ┌─────┴─────┐                         ├──────────────┐
   │Contradict.│                         │ *            │ *
   └───────────┘                         ▼              ▼
                                   ┌───────────┐  ┌───────────┐
                                   │ReqTraceab.│  │ImpactEvent│
                                   └───────────┘  └───────────┘
```

---

## 4. Entity Lifecycle & State Transition Models

### A. Claim Epistemic State Machine (Revisable Transitions)
```text
                       ┌──────────────┐
                       │   UNKNOWN    │
                       └──────┬───────┘
                              │ Stated as working proposition
                              ▼
                       ┌──────────────┐
                       │  HYPOTHESIS  │
                       └──────┬───────┘
                              │
                ┌─────────────┴─────────────┐
                │ Positive evidence linked  │ Refuting evidence linked
                ▼                           ▼
         ┌──────────────┐            ┌──────────────┐
  ┌─────>│  SUPPORTED   │            │  CONTESTED   │<─────┐
  │      └──────┬───────┘            └──────┬───────┘      │
  │             │ Strong balance            │              │
  │             ▼                           │              │
  │      ┌──────────────┐                   │              │
  │      │  VALIDATED   │───────────────────┘              │
  │      └──────┬───────┘ Refuting evidence added          │
  │             │                                          │
  │             │ High-tier refuting evidence              │
  │             └──────────────────────────────────────────┘
  │                                         │ Definitively disproven
  │ Contradiction resolved with new data    ▼
  └──────────────────────────────────┌──────────────┐
                                     │  FALSIFIED   │
                                     └──────────────┘
```

> **Epistemic Note on Revisability:**  
> A claim's historical evaluation records are never erased. When new empirical evidence alters the net balance, the current epistemic status is recalculated while preserving the complete audit history.

### B. Decision Validity State Machine
```text
                       ┌──────────────┐
                       │   PROPOSED   │ (Synthesizing alternatives)
                       └──────┬───────┘
                              │ Human ratification
                              ▼
                       ┌──────────────┐
                       │    ACTIVE    │ (Lineage linked to requirements)
                       └──────┬───────┘
                              │ Underlying evidence contradicted
                              ▼
                       ┌──────────────────────────────┐
                       │    STALE_REVIEW_REQUIRED     │ (Impact Alert surfaced)
                       └──────────────┬───────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │ Human reaffirms rationale     │ Human executes pivot
                      ▼                               ▼
               ┌──────────────┐               ┌───────────────────┐
               │    ACTIVE    │               │ SUPERSEDED_PIVOT  │ (New Decision committed)
               └──────────────┘               └───────────────────┘
```

---

## 5. Semantic Integrity Invariants

1. **Strict Context Binding:** Every claim, assumption, alternative, and decision must be bound to a valid `ProblemRecord`.
2. **Provenance Non-Severability:** An `EvidenceItem` cannot be promoted to evaluated status without an associated `ProvenanceRecord`.
3. **Decoupled Verification Status:** Algorithmic tier weight ($A=3.0, B=2.0, C=1.0$) is mathematically independent of human `verification_status` (`UNVERIFIED`, `VERIFIED_BY_RESEARCHER`, `DISPUTED`).
4. **Revisable Validity with Preserved History:** Validated claims and active decisions remain permanently revisable upon receipt of contradictory empirical evidence, while historical evaluation logs remain permanently preserved.
