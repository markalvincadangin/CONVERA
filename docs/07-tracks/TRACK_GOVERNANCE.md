# Track Governance Specification

**Document ID**: `CONVERA-TRK-004`  
**Classification**: Quality Gates, Mentor Clearance & Human Authority  
**Authority Tier**: Tier 2 Track Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/07-tracks/TRACK_GOVERNANCE.md`  
**Upstream Dependencies**: `00-foundation/CONSTITUTION.md (Article II), 07-tracks/TRACK_INTEROPERABILITY.md`  
**Downstream Dependents**: `08-operations/SYSTEM_CERTIFICATION.md`  

---

## 1. Executive Summary & Core Governance Principles

The **Track Governance Specification** defines the authority boundaries, actor roles, milestone clearance protocols, and decision governance rules governing CONVERA's domain tracks (the **Innovation Track** / Venture Ratchet and the **Research Track** / DSR Ratchet).

Subordinate to the ratified CONVERA Constitution (specifically Article II: *Human Sovereignty*, Article IV: *Socratic Mandate*, Article V: *Gate Clearance*, Article VI: *Epistemic Invalidation*, and Article VII: *Documentation Authority*) and the canonical domain models, this specification establishes **who is authorized to create, evaluate, approve, invalidate, ratify, or override track-specific states, rubrics, and consequential decisions**.

### Core Governance Axioms
1. **Human Sovereignty Over Consequential Transitions (Constitution Article II)**: Consequential milestone clearance, gate progression, venture graduation, and academic defense authorization require attributable human action. AI systems operate strictly as advisory agents; they cannot grant gate clearance, sign off on deliverables, or self-authorize milestone progression.
2. **Tri-Part Independence in Governance**: Evaluators and interfaces must preserve the strict independence between AI model confidence ($C_{AI}$), empirical evidence strength ($S_{EVID}$), and human decision confidence ($C_{DEC}$). High AI confidence never substitutes for human attributable signoff or empirical field evidence.
3. **Attributable Accountability**: Every consequential action (gate evaluation, mentor signoff, problem winner selection, evidence refutation, and decision override) must record an immutable audit trail specifying the human actor, timestamp, rationale, and affected entity lineage.

---

## 2. Governance Precedence Hierarchy

Track Governance is subordinate to the CONVERA Constitution and canonical epistemic, evidence, decision, security, and traceability models. Where governance rules conflict, authority resolves in strict hierarchical precedence:

```
                         GOVERNANCE PRECEDENCE
                                   │
                                   ▼
                    1. CONVERA CONSTITUTION
                       (Supreme Operating Authority)
                                   │
                                   ▼
                    2. CANONICAL EPISTEMIC MODELS
                       (Knowledge, Evidence, Decision, Traceability)
                                   │
                                   ▼
                    3. INSTITUTIONAL ETHICS & EXTERNAL VETO
                       (IRB / REC / Institutional Defense Committee)
                                   │
                                   ▼
                    4. HUMAN ATTRIBUTABLE RATIFICATION
                       (Faculty Mentors, Advisors & Founders)
                                   │
                                   ▼
                    5. TRACK-SPECIFIC METHODOLOGY RUBRICS
                       (Innovation 4-Filter / DSR Circumscription)
                                   │
                                   ▼
                    6. ADVISORY AI SYSTEMS (CONVERA AI)
                       (0.0 Approval Authority / Strictly Advisory)
```

1. **CONSTITUTION** prevails over all track governance rules and implementations.
2. **Canonical Epistemic & Data Models** prevail over track-specific workflow semantics.
3. **Institutional Authority** prevails over CONVERA's internal academic readiness assessment where external authorization is required.
4. **Human-Ratified Decisions** prevail over AI recommendations.
5. **Track-Specific Governance** prevails only within its defined methodological scope (e.g., Innovation rubrics do not bind Research stages).
6. **Implementation Behavior** cannot silently redefine normative governance; discrepancies become ratification defects.

---

## 3. Governance Roles & Actor Hierarchy

```
                               ACTOR GOVERNANCE HIERARCHY
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
[ Student Founder / Researcher ]     [ Faculty Mentor / Advisor ]     [ Institutional Committee ]
• Problem intake & card curation     • Formal GateReview rubric audit • Institutional ethics (IRB/REC)
• Empirical evidence collection      • Attributable MentorSignoff     • Capstone defense evaluation
• Assumption formulation & tests     • Decision review & override     • Formal academic accreditation
• Consensus voting & deliverables    • Blast-radius review guidance   • External regulatory compliance
                                            │
                                            ▼
                              [ AI Assistant / Socratic Engine ]
                              • Advisory Socratic interrogation
                              • Literature synthesis & gap mining
                              • Blast-radius impact calculation
                              • STRICTLY ADVISORY (0.0 approval rights)
```

### Role & Permission Matrix

| Role | Inquiry Permissions | Milestone Clearance Rights | Invalidation & Override Rights | Evidentiary Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Student Founder / Researcher** | Create/edit problems, claims, tests, and alternatives; run discovery interviews. | Submit milestones for gate evaluation; cannot self-approve formal gates. | Propose refutations; resolve team contradictions. | Authors empirical observations ($S_{EVID} \in [0.1, 1.0]$ based on proof). |
| **Project Team Member (Peer)** | Co-author inquiry artifacts; cast consensus upvotes/downvotes on problem cards. | Participate in peer reviews; collaborative voting provides team input but does not constitute gate clearance. | Propose contradictions or flags on teammate claims. | Contributes peer evidence and observational notes. |
| **Faculty Mentor / Advisor** | Inspect full epistemic lineage, rubric criteria, and decision histories. | **Sole authority to record `MentorSignoff`**; evaluates and records `GateReview`. | Authority to override decisions, mandate pivots, or reject gate submissions. | Validates methodology rigor and evidentiary adequacy. |
| **Institutional Committee** | Audits ethics compliance and academic rigor for thesis/capstone defense. | Grants external academic defense accreditation and institutional clearance. | Final institutional veto on ethical, privacy, or safety non-compliance. | External institutional authority (outside CONVERA runtime). |
| **AI Assistant (CONVERA AI)** | Generates Socratic counter-probes, synthesizes literature, calculates blast radius. | **Zero approval authority**; cannot advance phases or create signoffs. | Identifies potential contradictions; cannot unilaterally invalidate human decisions. | Advisory only; synthetic fallback material carries $0.0$ evidentiary weight. |

---

## 4. Two-Tier Milestone Clearance Protocol

CONVERA enforces a strict structural separation between **Objective Rubric Evaluation** and **Attributable Human Authorization**.

```
                        TWO-TIER MILESTONE CLEARANCE
                                     │
 ┌───────────────────────────────────┴───────────────────────────────────┐
 │                                                                       │
 ▼                                                                       ▼
Tier 1: Formal Rubric Evaluation (GateReview)           Tier 2: Attributable Human Signoff (MentorSignoff)
• Evaluates objective track criteria                    • Immutable human authorization record
• Calculates composite scoring (e.g. >= 75/100)         • Captures mentor identity, timestamp, and notes
• Produces structured verdict:                          • Validates institutional readiness
  [ PASS | REVISE | HOLD | FAIL ]                       • Required for venture graduation / defense
• Records passed and failed criteria vectors            • Persisted in mentor_signoffs table
• Persisted in gate_reviews table                       • Prevents automated / algorithmic graduation
```

### Distinct Semantic Separation
* **Automated Assistant $
e$ GateReview**: Automated rubric checking (e.g., verifying that 3 problem cards exist) provides computational assistance to the user; it does not constitute a completed `GateReview`.
* **GateReview $
e$ MentorSignoff**: A passing `GateReview` indicates that objective methodology thresholds are satisfied; `MentorSignoff` represents the accountable human mentor's explicit authorization of project milestone readiness where required by track governance.

---

## 5. Track-Specific Governance Standards

### A. Innovation Track Gate Governance (Venture Ratchet)

| Phase Milestone | Governance Gate | Required Evaluation Criteria | Authorization Mechanism |
| :--- | :--- | :--- | :--- |
| **Phase 1: Discovery** | Intake Review | $\ge 3$ candidate problem cards with verified source attribution and target personas. | Team consensus voting & problem bank curation. |
| **Phase 2: Screening** | Socratic Decision Gate | 4-Filter Rubric scoring (Economic, Urgency, Moat, Feasibility) composite $\ge 75/100$; documented `DecisionRecord`. | Team winner selection backed by recorded rationale. |
| **Phase 3: Validation** | Mom Test Gate | Zero refuted critical assumptions; $\ge 3$ empirical past-behavior customer interviews documented. | Field evidence validation in `problem_comments` and test records. |
| **Phase 4: Exploration**| Anti-Convergence Gate | $\ge 3$ distinct `ProblemAlternative` solutions spanning $\ge 3$ differing mechanism families. | Mechanism taxonomy audit in `Phase4View.tsx`. |
| **Phase 5: Clearance** | Venture Graduation | Track-specific Skin-in-the-Game audit ($\ge 	ext{Tier 3}$ verified commitment where required) + completed `GateReview` + `MentorSignoff`. | Formal rubric `GateReview` + attributable `MentorSignoff`. |

### B. Research Track Gate Governance (Computing & DSR Ratchet)

| Stage Milestone | Governance Gate | Required Evaluation Criteria | Authorization Mechanism |
| :--- | :--- | :--- | :--- |
| **Stage A: Discovery** | Domain Intake | Real-world computing friction logged and assigned to active `ResearchDomain`. | Student researcher intake & domain tagging. |
| **Stage B: Grounding** | **Gate 1: Empirical Grounding** | Problem verified by $\ge 2$ independent empirical sources; measurable consequence metric defined. | Formal `GateReview` (Gate 1: `research_gate_1`). |
| **Stage C: Opportunity**| **Gate 2: Research Opportunity**| Documented literature matrix from canonical connectors; identified research gap; scoped answerable question. | Formal `GateReview` (Gate 2: `research_gate_2`). |
| **Stage D: Artifact** | Artifact Specification | Formal DSR artifact specification with theoretical justification and baseline comparison design. | Advisor methodology review & `DecisionRecord`. |
| **Stage E: Evaluation** | **Gate 3: Evaluation Protocol** | Objective evaluation protocol with defined metrics, verified dataset availability, and circumscription loop history. | Formal `GateReview` (Gate 3: `research_gate_3`). |
| **Stage F: Feasibility** | **Gate 4 & Capstone Defense** | Documented institutional ethics compliance, compute resource verification, passing Gate 4 rubric, and signed `MentorSignoff`. | Formal `GateReview` (Gate 4: `research_gate_4`) + attributable `MentorSignoff`. |

---

## 6. Invalidation & Epistemic Override Governance

When evidence provenance is disputed, assumptions fail, or conflicting scientific findings emerge, CONVERA executes an auditable invalidation governance protocol:

```
[ Invalidation Trigger: Refuted Assumption / Falsified Evidence / Disputed Provenance ]
                                      │
                                      ▼
1. Epistemic Contribution Update
   • When evidence provenance is disputed or invalidated, the evidence relationship loses its
     applicable evidentiary contribution; historical record is preserved for auditability
                                      │
                                      ▼
2. Claim Re-Evaluation
   • Dependent claims are re-evaluated under canonical claim-state transition rules and may
     transition to CONTESTED or FALSIFIED, or lose evidentiary weight
                                      │
                                      ▼
3. Blast-Radius Propagation (Impact Engine)
   • ImpactEngine computes dependency reach across downstream decisions and deliverables
   • Generates an ImpactInvalidationEvent recording affected entity IDs
                                      │
                                      ▼
4. Stale State & Alert Flagging
   • Dependent decisions tagged with STALE_REVIEW_REQUIRED
   • Dependent requirements in RequirementsTraceability flagged for review
   • UI surfaces prominent alert banners across affected phase/stage views
                                      │
                                      ▼
5. Human Governance Resolution
   • Human team/mentor reviews blast radius and selects resolution:
     a) Pivot / Re-evaluate: Formulate new alternatives or hypotheses
     b) Re-test: Conduct higher-fidelity empirical validation
     c) Re-confirm / Override: Document attributable justification override
```

---

## 7. Track Governance Invariants (GOV-01 through GOV-10)

| Invariant ID | Formulation | Enforceability & Status |
| :--- | :--- | :--- |
| **GOV-01** | **Human Sovereignty Over Milestone Clearance**: Consequential milestone clearance requires the applicable track-scoped `GateReview` and, where the track governance protocol requires human authorization, an attributable `MentorSignoff`. AI agents cannot approve gate transitions. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in `sqlite_adapter.py` and gate review modals. |
| **GOV-02** | **Two-Tier Gate Review Separation**: Formal milestone clearance requires distinct recording of objective rubric evaluations (`GateReview`) and attributable human authorization (`MentorSignoff`). | `[NORMATIVE / IMPLEMENTED]`<br>Persisted in separate `gate_reviews` and `mentor_signoffs` tables. |
| **GOV-03** | **Advisory AI & Synthetic Fallback Evidentiary Boundary**: AI-generated analysis remains strictly advisory and has zero approval authority. Synthetic fallback material (`source=synthetic_fb`) is explicitly NON-EVIDENTIARY and contributes $0.0$ to evidentiary weighting. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced via `source=synthetic_fb` weighting in evidence pipeline. |
| **GOV-04** | **Skin-in-the-Game Gate Governance**: Innovation Phase 5 applies the track-specific Skin-in-the-Game criterion of Tier 3 or higher where required by the Innovation Track governance rubric. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Innovation Track Gate Rule; 5-tier framework defined in `constants.ts`/`Phase5View.tsx`. |
| **GOV-05** | **Research Gate Review Integrity**: Advancing past Research Track Stages B, C, E, and F requires formal rubric evaluation (`GateReview`) against objective criteria before stage progression. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `GateReviewModal.tsx` and `research_gate_1..4`. |
| **GOV-06** | **Traceable Decision Rationale & Authorship**: Attributable options, criteria, decision author, and rationale are recorded in `DecisionRecord`; AI-generated recommendations are recorded as advisory inputs and do not constitute human authorization. | `[NORMATIVE / IMPLEMENTED]`<br>Stored in `decision_records` table with audit metadata. |
| **GOV-07** | **Invalidation Auditability**: When an assumption or evidence item is invalidated, the system must retain the historical record, generate an `ImpactInvalidationEvent`, and flag downstream dependents as `STALE_REVIEW_REQUIRED`. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Backend `ImpactEngine` generates events; UI surfaces alert badges. |
| **GOV-08** | **Collaborative Consensus Audit**: Collaborative votes provide attributable team input during curation; they do not independently constitute `GateReview` or `MentorSignoff`. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `vote_problem` in sqlite adapter. |
| **GOV-09** | **Track-Scoped Governance Authority**: Gate clearances and mentor signoffs granted in one track remain strictly scoped to that track's methodology and cannot be transferred to grant cross-track milestone clearance. | `[NORMATIVE / IMPLEMENTED]`<br>`gate_reviews` and `mentor_signoffs` explicitly store `gate_id`/`stage_id`/`phase_number`. |
| **GOV-10** | **Institutional Ethics Authority Boundary**: CONVERA may record, track, and verify the presence of institutional ethics documentation, but cannot issue, substitute for, or override formal institutional ethics committee (IRB/REC) authorization. | `[NORMATIVE / IMPLEMENTED]`<br>Documented in Stage F gate rubrics and governance contracts. |

---

## 8. Architectural & Engineering Boundary Summary

1. **Governance vs Implementation**: Track governance establishes human authority, role boundaries, and milestone evaluation rules. SDD governs engineering implementation once specifications are approved and stabilized.
2. **Subordination to Constitution**: All track governance rules are strictly subordinate to the CONVERA Constitution. No track rule or mentor action may override the fundamental principles of *Knowledge $
e$ Workflow*, *Provenance Primacy*, or *Human Sovereignty*.
3. **Audit Trail Immutability**: All gate reviews, mentor signoffs, decision records, and invalidation events persist with immutable timestamps and attributable identifiers in SQLite WAL mode.
