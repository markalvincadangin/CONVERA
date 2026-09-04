# Track Interoperability Specification

**Document ID**: `CONVERA-TRK-003`  
**Classification**: Cross-Track Knowledge Translation & Parity  
**Authority Tier**: Tier 2 Track Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/07-tracks/TRACK_INTEROPERABILITY.md`  
**Upstream Dependencies**: `07-tracks/INNOVATION_TRACK.md, 07-tracks/RESEARCH_TRACK.md`  
**Downstream Dependents**: `07-tracks/TRACK_GOVERNANCE.md, 06-frontend/INFORMATION_ARCHITECTURE.md`  

---

## 1. Executive Summary & Core Axioms

CONVERA provides multiple specialized inquiry tracks (the **Innovation Track** / Venture Ratchet and the **Research Track** / DSR Ratchet) to support distinct inquiry archetypes—from commercial technopreneurship incubation to scientific computing capstones and Design Science Research (DSR).

The **Track Interoperability Specification** defines the architectural rules, state transition protocols, and data flow mechanisms that allow projects to operate across, transition between, or synthesize deliverables from multiple inquiry tracks without data loss, entity mutation, or methodological cross-contamination.

### Governing Epistemic Axioms
1. **Knowledge $\ne$ Workflow (Constitution Article I)**: Tracks are *orthogonal inquiry workflow lenses* projecting domain-specific views over a shared, persistent canonical epistemic core. Switching tracks changes the active inquiry lens and UI workflow; it does not delete, silo, orphan, or destructively reinterpret canonical entities (`ProblemRecord`, `ProblemClaim`, `EvidenceItem`, `ProvenanceRecord`, `DecisionRecord`, `RequirementsTraceability`, `ImpactInvalidationEvent`, `ProjectUnknown`, `ClaimContradiction`).
2. **Methodology Progress Isolation**: Progress within one track (e.g., passing Phase 2 Screening in the Innovation Track) does not fabricate or automatically grant stage completion in another track (e.g., Stage B Grounding in the Research Track). Each track maintains its own independent gate criteria.
3. **Non-Destructive State Transitions**: Framework transitions are fully auditable, reversible, and non-destructive. Point-in-time state snapshots (`SessionSnapshot`) are captured prior to transition, and track-specific progress vectors are isolated in `framework_progress`.

---

## 2. Shared Epistemic Core vs Operational State

CONVERA strictly separates the **Canonical Epistemic Core** (track-neutral knowledge, claims, evidence, decisions, and traceability) from **Operational & Workflow State** (session management, snapshots, gate reviews, and progress tracking).

```
                    CONVERA OPERATING SYSTEM
                               │
               ┌───────────────┴───────────────┐
               │                               │
        Innovation Track                 Research Track
        Venture Ratchet                  Computing & DSR
         (Phases 1–5)                     (Stages A–F)
               │                               │
               └───────────────┬───────────────┘
                               │
 ┌─────────────────────────────┴─────────────────────────────┐
 │               CANONICAL EPISTEMIC CORE                    │
 ├─────────────────────────────┬─────────────────────────────┤
 │ Knowledge Core              │ ProblemRecord, ProblemClaim │
 │                             │ ProblemAssumption, Unknowns │
 │                             │ ClaimContradictions         │
 ├─────────────────────────────┼─────────────────────────────┤
 │ Evidence & Provenance       │ EvidenceItem (conceptual)   │
 │                             │ ProvenanceRecord            │
 │                             │ ClaimEvidenceLinks          │
 ├─────────────────────────────┼─────────────────────────────┤
 │ Decision & Impact           │ DecisionRecord, ImpactEvent │
 │                             │ ProblemAlternative          │
 ├─────────────────────────────┼─────────────────────────────┤
 │ Traceability                │ RequirementsTraceability    │
 └─────────────────────────────┬─────────────────────────────┘
                               │
 ┌─────────────────────────────┴─────────────────────────────┐
 │             OPERATIONAL & WORKFLOW STATE                  │
 ├───────────────────────────────────────────────────────────┤
 │ • SessionState (E10) · SessionSnapshot (E12)              │
 │ • GateReview (E18, track-scoped milestone evaluation)     │
 │ • MentorSignoff (Support, attributable human signoff)     │
 │ • session.framework_progress (isolated progress dict)    │
 └───────────────────────────────────────────────────────────┘
```

### Entity Persistence & Role Boundary Across Tracks

| Canonical / Operational Entity | Innovation Track Role | Research Track Role | Physical Relational Persistence |
| :--- | :--- | :--- | :--- |
| `ProblemRecord` (E03) | Target customer pain point & market friction | Computing/algorithmic friction statement | `problems`, `problem_sources` (support) |
| `ProblemClaim` (E04) | Value proposition & market assumptions | Scientific hypothesis & technical claims | `problem_claims` |
| `EvidenceItem` (E05, conceptual) | Field observations & customer evidence | Empirical benchmarks & scholarly evidence | Canonical evidence represented through `evidence_provenance` and `claim_evidence_links` |
| `ProvenanceRecord` (E06) | Interviewees, surveys & field sources | Scholarly DOIs, papers & academic indexes | `evidence_provenance` |
| `ProblemAlternative` (E09) | Commercial solution mechanism concepts | DSR artifact architecture & models | `problem_alternatives` |
| `DecisionRecord` (E08) | Pivot, screening & winner selection logs | Design rationale & algorithm choices | `decision_records` |
| `GateReview` (E18, operational) | Phase 2/5 rubric gate evaluations | Stage B/C/E/F rubric gate evaluations | `gate_reviews` |
| `MentorSignoff` (Support, operational) | Venture clearance & graduation signoff | Thesis feasibility & defense signoff | `mentor_signoffs` |
| `SessionSnapshot` (E12, operational) | Phase progression backup checkpoint | Stage transition & pre-switch snapshot | `session_snapshots` |

---

## 3. Framework Transition Protocol (CCDS Rules)

When a project transitions between inquiry frameworks (e.g., from `INNOVATION` to `RESEARCH` or vice versa) via `switch_session_framework`, CONVERA executes a 4-step controlled transition protocol:

```
[ Active Framework: OLD ]
           │
           ▼
1. Pre-Transition Snapshot Capture
   • Captures SessionSnapshot labeled "Pre-transition snapshot (OLD -> NEW)"
   • Stores complete point-in-time serialization of session state and phase progress
           │
           ▼
2. Progress State Isolation
   • Persists current framework-specific progress under session.framework_progress[OLD]
   • Protects completion flags without transferring completion semantics to target
           │
           ▼
3. Target Framework State Realization
   • Loads target framework progress from session.framework_progress[NEW] if previously visited
   • Initializes clean, non-fabricated progress vector if entering framework for first time
           │
           ▼
4. Epistemic Core Continuity
   • Track switching does not create, delete, or rewrite canonical epistemic entities solely
     because active framework changes; canonical knowledge remains accessible under new track
           │
           ▼
[ Active Framework: NEW ]
```

---

## 4. Workflow State $
e$ Epistemic State

A fundamental architectural invariant of CONVERA is that **a track milestone is a methodological workflow state, not an epistemic truth state**.

### Explicit State Separation Matrix

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ Methodological Workflow State         │ Canonical Epistemic State             │
│ (Track-Scoped Progression)            │ (Track-Neutral Knowledge Core)        │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Innovation Phase 3 (Mom Test Done)  │ • Claim Epistemic State: SUPPORTED    │
│ • Research Stage B (Grounding Done)   │ • Evidentiary State: VALIDATED        │
│ • Innovation Phase 5 (MVP Clearance)  │ • Decision State: ACTIVE / CONFIRMED  │
│ • Research Stage F (Defense Approved) │ • Confidence State: C_AI, S_EVID, C_DEC│
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### Invalidation & Non-Equivalence Rules
* **No Automatic Semantic Transfer**: Passing a milestone in one track never infers or validates an epistemic state in another.
  $$\text{Innovation Phase 3} \ne \text{Research Stage B}$$
  $$\text{Innovation Phase 5} \ne \text{Research Stage F}$$
  $$\text{Gate Clearance} \ne \text{Claim Truth / Evidence Validation}$$
  $$\text{Workflow Completion} \ne \text{Empirical Verification}$$
* **Tri-Part Independence**: AI model confidence ($C_{AI}$), empirical evidence strength ($S_{EVID}$), and human decision confidence ($C_{DEC}$) remain strictly independent across all tracks.

---

## 5. Cross-Track Invalidation Propagation Semantics

When an evidence item, source, or assumption originating in one track is invalidated or refuted:

1. **Lineage Preservation**: The historical evidence and provenance record remains preserved with an updated invalidation status (never deleted).
2. **Evidentiary Recalculation**: Evidentiary contribution is recalculated across all linked claims according to the canonical Evidence Model.
3. **Claim Re-Evaluation**: Dependent claims transition to `DISPUTED`, `REFUTED`, or `UNSUPPORTED`.
4. **Impact Engine Evaluation**: The backend `ImpactEngine` generates an `ImpactInvalidationEvent` tracing blast-radius reach across all downstream decisions and deliverables.
5. **Stale Requirements Alerting**: Dependent requirements in `RequirementsTraceability` transition to `STALE_REVIEW_REQUIRED`.
6. **Workflow Gate Integrity**: Track-specific workflow milestones are not silently rewritten, but the active track immediately surfaces the resulting review requirement.

> [!IMPORTANT]
> **Core Architectural Invariant**: Cross-track invalidation propagates **epistemic impact**, not workflow completion changes.

---

## 6. Cross-Track Correspondence & Recontextualization

When transitioning between inquiry tracks, canonical entities are not converted or rewritten; rather, **the same canonical entity is recontextualized under a different inquiry lens**.

### Innovation $\longleftrightarrow$ Research Correspondence Matrix

| Innovation Track (Venture Lens) | Research Track (DSR Lens) | Epistemic Relationship & Discipline |
| :--- | :--- | :--- |
| **Phase 1 Problem Discovery** | **Stage A Problem Discovery** | Conceptually related problem intake; recontextualized under academic domain. |
| **Phase 2 Socratic Screening** | **Stage B Problem Grounding** | Both evaluate problem significance, but apply distinct screening vs empirical criteria. |
| **Phase 3 Mom Test Validation** | **Stage C Prior Art & Matrix** | **Disjoint Evidence Regimes**: Customer interviews do not substitute for peer-reviewed literature. |
| **Phase 4 Mechanism Exploration**| **Stage D Artifact Design** | Both explore solutions, but apply 15 Mechanism Families vs theoretical DSR architecture. |
| **Phase 5 MVP & Economics** | **Stage E/F Evaluation & Defense**| Partial correspondence: Commercial unit economics vs academic baseline benchmarking. |
| `ProblemRecord` (E03) | `ProblemRecord` (E03) | Shared canonical problem entity recontextualized under target lens. |
| `ProblemClaim` (E04) | `ProblemClaim` (E04) | Shared canonical claim mechanism (market hypothesis vs scientific claim). |
| `EvidenceItem` / `ProvenanceRecord` | `EvidenceItem` / `ProvenanceRecord` | Shared canonical evidentiary and provenance infrastructure. |
| `DecisionRecord` (E08) | `DecisionRecord` (E08) | Shared canonical decision mechanism (venture pivot vs algorithmic design choice). |
| `GateReview` (E18) | `GateReview` (E18) | Shared governance mechanism; evaluations are track-scoped and non-transferable. |
| `RequirementsTraceability` (E17) | `RequirementsTraceability` (E17) | Shared end-to-end lineage connecting requirements to underlying evidence. |

> [!CAUTION]
> **No row in the correspondence matrix constitutes automatic gate equivalence.** Achieving clearance in an Innovation phase does not unlock the corresponding Research stage, and vice versa.

---

## 7. Dual-Track Deliverables Synthesis

CONVERA's `DeliverablesStudio` supports dual-track synthesis, allowing cross-disciplinary teams to generate composite specifications drawing from both academic literature and commercial field validation:
* **Composite SRS Specification**: Combines formal DSR artifact requirements, algorithmic constraints, and theoretical baselines from the Research Track with user personas, commercial acceptance criteria, and operational workflows from the Innovation Track.
* **Dual-Perspective Capstone Dossier**: Integrates the Research Track's Literature Matrix, research questions, and circumscription loop history alongside the Innovation Track's 4-Filter rubric scores, Mom Test field proof, and SWOT matrix.
* **End-to-End Traceability Matrix**: Maintains continuous lineage links (`RequirementsTraceability`) connecting high-level commercial requirements and scientific research questions down to underlying empirical evidence items and decision records.

---

## 8. Track Interoperability Invariants (INT-01 through INT-10)

| Invariant ID | Formulation | Enforceability & Status |
| :--- | :--- | :--- |
| **INT-01** | **Canonical Epistemic Core Invariance**: Switching inquiry tracks must never delete, orphan, or destructively reinterpret canonical entities in the shared epistemic core. Track switching changes the active inquiry lens and workflow state, not the identity, provenance, lineage, or semantic ownership of canonical knowledge. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in `sqlite_adapter.py` persistence layer. |
| **INT-02** | **Pre-Transition Snapshot Capture**: Every framework transition must automatically create an attributable, point-in-time `SessionSnapshot` before altering the session's active methodology. | `[NORMATIVE / IMPLEMENTED]`<br>Executed in `switch_session_framework`. |
| **INT-03** | **Methodology Progress Isolation**: Milestone completions in one track cannot be artificially transferred or manufactured as completed gates in another track. Each track maintains an isolated progress vector in `framework_progress`. | `[NORMATIVE / IMPLEMENTED]`<br>Managed via `framework_progress` state dict in sessions. |
| **INT-04** | **Non-Destructive Bidirectional Portability**: All problems, claims, evidence links, and decisions created in one track remain immediately readable and linkable when switching to another track. | `[NORMATIVE / IMPLEMENTED]`<br>Universal database queries by `project_id`/`session_id`. |
| **INT-05** | **Cross-Track Impact Invalidation Propagation**: Invalidation of an evidence item or assumption in one track triggers blast-radius alerts (`ImpactInvalidationEvent`) across dependent artifacts regardless of which track is currently active. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Backend `ImpactEngine` calculates cross-entity graph dependencies; UI alerts surface in active track views. |
| **INT-06** | **Entity Lineage Preservation**: Requirements traceability links (`RequirementsTraceability`) must persist uninterrupted across track transitions, preserving end-to-end lineage from problem to deliverable. | `[NORMATIVE / IMPLEMENTED]`<br>Stored in `requirements_traceability` table independent of `framework_id`. |
| **INT-07** | **Dual-Track Deliverables Synthesis**: Deliverables synthesis engines support generating composite specifications (SRS, Capstone Dossiers) pulling from research literature and commercial field validation. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Specific synthesis paths implemented in `DeliverablesStudio.tsx` and `phaseService.generateSrs`. |
| **INT-08** | **Gate Evaluation Track-Scoping**: Rubric evaluations (`GateReview`) and signoffs (`MentorSignoff`) remain bound to specific track milestones and cannot grant cross-track gate clearance. | `[NORMATIVE / IMPLEMENTED]`<br>`gate_reviews` and `mentor_signoffs` store specific `gate_id`/`stage_id`/`phase_number`. |
| **INT-09** | **Scholarly-to-Commercial Translation Discipline**: Academic research citations and benchmark accuracies do not satisfy commercial gate requirements; spinning out research into a venture requires empirical Mom Test validation and customer commitment auditing. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Enforced in Innovation Track Phase 3 and Phase 5 gate rubrics (aligning with `INV-04`). |
| **INT-10** | **Commercial-to-Scholarly Grounding Discipline**: Research Track Stage B/C gate criteria require empirical grounding and scholarly prior-art analysis; commercial/customer evidence cannot independently satisfy those scholarly requirements. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in Research Track Stage B and Stage C gate rubrics. |

---

## 9. Architectural & Engineering Boundary Summary

1. **Inquiry Lens vs Engineering Implementation**: Track interoperability governs how different exploratory inquiry methodologies coexist over shared knowledge. SDD governs software engineering delivery once specifications are synthesized from either or both tracks.
2. **No Redundant Schemas**: CONVERA maintains zero track-specific parallel databases. All track operations query and mutate the single, unified SQLite schema.
3. **Traceability Continuity**: Traceability graphs connect canonical epistemic entities and relationships across tracks without fragmentation, enabling multi-disciplinary teams to maintain continuous provenance from initial problem discovery through academic defense or venture launch.