# Innovation Track Specification (Venture Ratchet)

**Document ID**: `CONVERA-TRK-001`  
**Classification**: Technopreneurship Venture Ratchet (Phases 1–5)  
**Authority Tier**: Tier 2 Track Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/07-tracks/INNOVATION_TRACK.md`  
**Upstream Dependencies**: `00-foundation/CONVERA.md, 02-system/DOMAIN_MODEL.md`  
**Downstream Dependents**: `07-tracks/TRACK_INTEROPERABILITY.md, 07-tracks/TRACK_GOVERNANCE.md`  

---

## 1. Executive Summary & Purpose

The **Innovation Track** is CONVERA's domain-specific inquiry workflow tailored for technopreneurship ventures, startup incubation, and commercial product validation. Operating as a systematic, anti-premature-convergence methodology, the Innovation Track guides student founders and venture teams through a 5-phase progressive discovery ratchet:
$$\text{Discovery (Phase 1)} \longrightarrow \text{Screening (Phase 2)} \longrightarrow \text{Socratic Validation (Phase 3)} \longrightarrow \text{Mechanism Exploration (Phase 4)} \longrightarrow \text{MVP & Gate Review (Phase 5)}$$

### Epistemic Grounding & Authority
* **Knowledge $\ne$ Workflow (Constitution Article I)**: The Innovation Track is an inquiry workflow lens operating upon the canonical epistemic knowledge model/graph (`ProblemRecord`, `ProblemClaim`, `EvidenceItem`, `ProblemAssumption`, `DecisionRecord`). Advancing through track phases augments the shared epistemic core; it does not silo or redefine canonical entities.
* **Separation from SDD (Spec-Driven Development)**: The Innovation Track is an *exploratory product validation workflow* (discovering what to build and verifying customer value). In contrast, SDD is the *engineering delivery workflow* (`SPECIFY` $\rightarrow$ `CLARIFY` $\rightarrow$ `PLAN` $\rightarrow$ `CHECKLIST` $\rightarrow$ `TASKS` $\rightarrow$ `ANALYZE` $\rightarrow$ `IMPLEMENT` $\rightarrow$ `CONVERGE`), which governs system implementation once requirements are stabilized.
* **Non-Destructive Bidirectional Interoperability**: Projects in the Innovation Track maintain full interoperability with the Research Track. All empirical claims, field interviews, and market validation items are stored in the canonical schema without data amnesia.

---

## 2. Venture Ratchet Architecture (Phases 1–5)

```
                       INNOVATION TRACK (VENTURE RATCHET)
                                      │
 ┌────────────────────────────────────┼────────────────────────────────────┐
 │                                    │                                    │
 ▼                                    ▼                                    ▼
Phase 1: Discovery & Problem Bank    Phase 2: Socratic Screening          Phase 3: Deep Validation
• Problem identification (>=3 cards) • 4-Filter Rubric evaluation         • Mom Test customer interviews
• Source attribution & friction      • Severity & frequency scoring       • ProblemAssumption falsification
• Collaborative team voting          • ProblemAlternative mapping         • AssumptionValidationTest records
                                                                           • ProblemRecord support comments
                                      │
 ┌────────────────────────────────────┴────────────────────────────────────┐
 │                                                                         │
 ▼                                                                         ▼
Phase 4: Mechanism Exploration                               Phase 5: Synthesis & Gate Clearance
• 15 Mechanism Families taxonomy                             • 5-Tier Skin-in-the-Game audit
• Multi-vector solution alternatives                         • Formal GateReview rubric evaluation
• Unfair advantage & moat synthesis                          • Attributable MentorSignoff authorization
• Risk & bottleneck analysis                                 • Lean Canvas, Pitch Deck & SRS generation
```

### Phase-to-Canonical-Entity Mapping

| Phase | Innovation Track Focus | Canonical Domain Entities / Support Data | Primary Relational Tables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Discovery & Problem Capture | `ProblemRecord`, `ProvenanceRecord` | `problems`, `problem_sources` |
| **Phase 2** | Socratic Screening & Filtering | `ProblemRecord`, `ProblemClaim`, `DecisionRecord` | `problems`, `problem_claims`, `decision_records` |
| **Phase 3** | Socratic Field Validation | `ProblemAssumption`, `AssumptionValidationTest`, Supporting `ProblemRecord` comments | `problem_assumptions`, `assumption_validation_tests`, `problem_comments` |
| **Phase 4** | Mechanism Exploration | `ProblemAlternative`, `DecisionRecord` | `problem_alternatives`, `decision_records` |
| **Phase 5** | Synthesis, MVP & Gate Review | `GateReview`, `RequirementsTraceability`, `MentorSignoff` (Support) | `gate_reviews`, `requirements_traceability`, `mentor_signoffs`, `sessions` |

---

## 3. Phase Details & Methodology Rules

### Phase 1: Problem Discovery & Bank Curation
* **Objective**: Identify, log, and curate high-friction real-world customer problems across target segments before committing to solution ideas.
* **Methodology**: Capture candidate problem statements with context, target persona, observed friction, and source attribution.
* **Normative Gate Requirement**: At least 3 candidate problem cards logged with verified source attribution.

### Phase 2: Socratic Screening & 4-Filter Rubric
* **Objective**: Rigorously evaluate candidate problems against commercial and operational realities to filter out low-value or non-viable ideas.
* **Methodology**: Apply CONVERA's 4-Filter Rubric:
  1. *Economic Friction*: Is the pain point tied to measurable loss of time, capital, or compliance?
  2. *Market Urgency & Frequency*: How often does the user experience this friction, and is there active workaround spending?
  3. *Unfair Advantage / Moat Feasibility*: Can the team establish regulatory, distribution, or algorithmic differentiation?
  4. *Technical / Operational Feasibility*: Is delivery feasible within target resource constraints?
* **Normative Gate Requirement**: Socratic scoring across all 4 filters; selection of a primary candidate backed by an attributable `DecisionRecord`.

### Phase 3: Socratic Customer Validation & Assumption Falsification
* **Objective**: Subject core problem assumptions to empirical falsification via customer field discovery (Mom Test protocol).
* **Methodology**: Extract critical business assumptions (`ProblemAssumption`). Design empirical tests (`AssumptionValidationTest`) using past behavior inquiry (never pitching hypothetical features). Record qualitative findings, customer quotes, and collaborative team observations in supporting `problem_comments` attached to `ProblemRecord`.
* **Normative Gate Requirement**: Validation or falsification of at least 3 critical assumptions with documented field proof.

### Phase 4: Mechanism Exploration & Solution Diversification
* **Objective**: Systematically explore multiple solution pathways across distinct mechanism families to prevent premature convergence on trivial architectures.
* **Methodology**: Classify solution concepts across CONVERA's **15 Mechanism Families Taxonomy**:
  1. *Workflow Automation*
  2. *Marketplace / Platform Aggregation*
  3. *Data Synthesis & Intelligence*
  4. *Regulatory / Compliance Orchestration*
  5. *Hardware-Enabled Sensing / IoT*
  6. *Decentralized / Trustless Verification*
  7. *API & Infrastructure Layer*
  8. *Direct-to-Consumer Behavioral Loop*
  9. *Embedded Financial Mechanism*
  10. *Resource Pooling & Shared Economy*
  11. *Predictive Analytics & Forecasting*
  12. *Network Coordination & Dispatch*
  13. *Supply Chain & Inventory Ledger*
  14. *Community / Social Knowledge Graph*
  15. *Domain-Specific Hybrid Model*
* **Normative Gate Requirement**: Documentation of at least 3 distinct `ProblemAlternative` solutions spanning at least 3 differing mechanism families.

### Phase 5: Synthesis, MVP Definition, Skin-in-the-Game Audit & Gate Review
* **Objective**: Synthesize validated problem-solution fit into commercial deliverables (Lean Canvas, Pitch Deck, SRS), audit customer commitment, and undergo formal mentor gate clearance.
* **5-Tier Skin-in-the-Game Commitment Framework**:
  * *Tier 1 (Attention/Survey)*: Form submissions, social likes, email list signups.
  * *Tier 2 (Time Investment)*: 30+ minute workflow observational sessions, usability trials.
  * *Tier 3 (Reputation/Data)*: Sharing internal proprietary datasets, introducing senior decision-makers, providing a public quote.
  * *Tier 4 (Financial Commitment)*: Signed Letters of Intent (LOI), paid pilot deposits, pre-orders.
  * *Tier 5 (Contractual Usage)*: Deployed paid contract, live active enterprise subscription.
* **Normative Gate Requirement**: Formal rubric evaluation (`GateReview`) and attributable human authorization (`MentorSignoff`) prior to project graduation.

---

## 4. Innovation Track Invariants (INV-01 through INV-10)

| Invariant ID | Formulation | Enforceability & Status |
| :--- | :--- | :--- |
| **INV-01** | **Problem Primacy Over Solution**: A project cannot enter Phase 4 (Mechanism Exploration) until a primary `ProblemRecord` has passed Phase 2 screening and Phase 3 field assumption testing. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced via phase progression rules. |
| **INV-02** | **Socratic Screening Completeness**: Phase 2 screening requires evaluation across all 4 rubric filters before selecting a primary candidate. | `[NORMATIVE / IMPLEMENTED]`<br>Evaluated in `Phase2View.tsx`. |
| **INV-03** | **Anti-Convergence Solution Breadth**: Phase 4 exploration requires at least 3 distinct `ProblemAlternative` solutions spanning at least 3 differing mechanism families. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in `Phase4View.tsx` mechanism selector. |
| **INV-04** | **Skin-in-the-Game Commitment Gate**: Phase 5 venture deliverable ratification requires verified customer commitment audited at Tier 3 or higher. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Innovation Track Gate Rule; commitment tiers defined in `constants.ts`/`Phase5View.tsx`. |
| **INV-05** | **Attributable Gate Clearance**: Venture phase progression to graduation requires a completed formal rubric evaluation (`GateReview`) and an attributable human authorization record (`MentorSignoff`). | `[NORMATIVE / IMPLEMENTED]`<br>`GateReview` (evaluation) and `MentorSignoff` (human authorization) in backend storage. |
| **INV-06** | **AI Suggestion Evidentiary Boundary**: AI-generated hypotheses and suggestions have no independent evidentiary contribution ($0.0$ weight); they become epistemically relevant only when supported by independently traceable and evaluated evidence. | `[NORMATIVE / IMPLEMENTED]`<br>Synthetic suggestions tagged with `source=synthetic_fb` and $0.0$ weight in evidence pipeline. |
| **INV-07** | **Impact Invalidation Reactivity**: Falsification of a core customer assumption in Phase 3 generates an `ImpactInvalidationEvent` that propagates blast-radius alerts across downstream Phase 4/5 deliverables. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Backend `ImpactEngine` calculates blast radius; UI alerts surface in Phase 4/5 views. |
| **INV-08** | **Deliverable-to-Knowledge Traceability**: Generated Lean Canvas, Pitch Deck, and SRS items must trace directly to underlying canonical entities (`ProblemRecord`, `ProblemClaim`, `EvidenceItem`, `ProblemAlternative`, `DecisionRecord`). | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Deliverables synthesizers pull from canonical database entities. |
| **INV-09** | **Collaborative Consensus Voting**: Team members can cast upvotes/downvotes on candidate problem cards during Phase 1 & 2 problem bank curation. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `vote_problem` in sqlite adapter and problem bank cards. |
| **INV-10** | **Persistent Venture Telemetry & Health Grading**: Venture progress metrics and health grades dynamically compute based on completed phase milestones and empirical evidence scores. | `[NORMATIVE / IMPLEMENTED]`<br>Computed via session state and phase completion heuristics. |

---

## 5. Architectural & Track Boundary Summary

1. **Inquiry vs Engineering**: The Innovation Track explores, screens, and validates problem-market viability. SDD engineers, tests, and deploys the technical implementation.
2. **Canonical Data Model Integrity**: Innovation Track operations mutate only canonical and support tables (`problems`, `problem_claims`, `problem_assumptions`, `assumption_validation_tests`, `problem_alternatives`, `decision_records`, `gate_reviews`, `mentor_signoffs`, `problem_comments`). No parallel database schemas exist.
3. **Traceability**: All commercial claims, customer quotes, and pitch deck metrics maintain bidirectional links to verifiable evidence records.
