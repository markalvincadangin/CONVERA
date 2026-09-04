# Research Track Specification (Computing Research & DSR Ratchet)

**Document ID**: `CONVERA-TRK-002`  
**Classification**: Computing Research & DSR Ratchet (Stages A–F)  
**Authority Tier**: Tier 2 Track Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/07-tracks/RESEARCH_TRACK.md`  
**Upstream Dependencies**: `00-foundation/CONSTITUTION.md, 02-system/DOMAIN_MODEL.md`  
**Downstream Dependents**: `07-tracks/TRACK_INTEROPERABILITY.md, 07-tracks/TRACK_GOVERNANCE.md`  

---

## 1. Executive Summary & Purpose

The **Research Track** is CONVERA's domain-specific inquiry workflow tailored for academic discovery, scientific computing capstones, and Design Science Research (DSR). Operating as a systematic, rigor-first methodology, the Research Track guides academic researchers, student investigators, and thesis candidates through a 6-stage progressive scientific inquiry ratchet:
$$\text{Stage A: Discovery} \longrightarrow \text{Stage B: Grounding} \longrightarrow \text{Stage C: Opportunity} \longrightarrow \text{Stage D: Artifact} \longrightarrow \text{Stage E: Evaluation} \longrightarrow \text{Stage F: Feasibility & Ethics}$$

### Epistemic Grounding & Authority
* **Knowledge $\ne$ Workflow (Constitution Article I)**: The Research Track is an inquiry workflow lens operating upon the canonical epistemic knowledge model/graph (`ProblemRecord`, `ProblemClaim`, `EvidenceItem`, `ProvenanceRecord`, `DecisionRecord`, `ResearchDomain`, `CircumscriptionIteration`, `GateReview`). Advancing through research stages augments the shared epistemic core; it does not silo, mutate, or redefine canonical entities.
* **Separation from SDD (Spec-Driven Development)**: The Research Track is an *exploratory scientific inquiry workflow* (discovering research gaps, formulating hypotheses, designing evaluation protocols, and executing circumscription loops). In contrast, SDD is the *engineering delivery workflow* (`SPECIFY` $\rightarrow$ `CLARIFY` $\rightarrow$ `PLAN` $\rightarrow$ `CHECKLIST` $\rightarrow$ `TASKS` $\rightarrow$ `ANALYZE` $\rightarrow$ `IMPLEMENT` $\rightarrow$ `CONVERGE`), which governs software implementation once research specifications are stabilized.
* **Non-Destructive Dual-Track Interoperability**: Projects in the Research Track maintain full interoperability with the Innovation Track. A project can be viewed through the Research Track lens (focusing on literature matrices, DSR circumscription, and academic evaluation) or the Innovation Track lens (focusing on market screening, Mom Test validation, and commercial MVP economics) without data loss or entity mutation.

---

## 2. Research Track Architecture (Stages A–F)

```
                       RESEARCH TRACK (DSR RATCHET)
                                     │
 ┌───────────────────────────────────┼───────────────────────────────────┐
 │                                   │                                   │
 ▼                                   ▼                                   ▼
Stage A: Problem Discovery          Stage B: Problem Grounding          Stage C: Opportunity & Prior Art
• Real-world computing frictions    • Literature grounding matrix       • Semantic Scholar / OpenAlex search
• Signal classification             • Consequence & magnitude sizing    • Research gap synthesis
• Domain categorization             • Gate 1: Empirical Grounding       • Gate 2: Research Opportunity
                                     │
 ┌───────────────────────────────────┴───────────────────────────────────┐
 │                                   │                                   │
 ▼                                   ▼                                   ▼
Stage D: Artifact Formulation       Stage E: Evaluation Design          Stage F: Feasibility & Ethics
• DSR artifact specification        • Metric & dataset definition       • Institutional ethics compliance
• Theoretical mechanism design      • Baseline benchmarking protocol    • Compute & timeline feasibility
• Technical justification           • Circumscription loopback engine   • Gate 4 / Attributable Clearance
                                    • Gate 3: Evaluation Protocol
```

### Stage-to-Canonical-Entity Mapping

| Stage | Scientific Inquiry Focus | Canonical Domain Entities / Support Data | Physical Relational Persistence |
| :--- | :--- | :--- | :--- |
| **Stage A** | Problem Discovery & Signal Classification | `ProblemRecord` (E03), `ResearchDomain` (E19), `ProvenanceRecord` (E06, where applicable) | `problems`, `research_domains`, `problem_sources` (support data), `evidence_provenance` (where source attribution enters provenance lifecycle) |
| **Stage B** | Problem Validation & Grounding (Gate 1) | `ProblemRecord` (E03), `ProblemClaim` (E04), `EvidenceItem` (E05, conceptual), `GateReview` (E18) | `problems`, `problem_claims`, `claim_evidence_links` (link table), `gate_reviews` |
| **Stage C** | Opportunity & Literature Matrix (Gate 2) | `EvidenceItem` (E05, conceptual), `ProvenanceRecord` (E06), `ProjectUnknown` (E16), `ClaimContradiction` (E15), `GateReview` (E18) | `evidence_provenance`, `claim_evidence_links`, `project_unknowns`, `claim_contradictions`, `gate_reviews` |
| **Stage D** | Solution & DSR Artifact Design | `ProblemAlternative` (E09), `DecisionRecord` (E08), `RequirementsTraceability` (E17) | `problem_alternatives`, `decision_records`, `requirements_traceability` |
| **Stage E** | Evaluation & Circumscription (Gate 3) | `CircumscriptionIteration` (E20), `GateReview` (E18) | `circumscription_iterations`, `gate_reviews` |
| **Stage F** | Feasibility, Ethics & Clearance (Gate 4) | `GateReview` (E18), `RequirementsTraceability` (E17), `MentorSignoff` (Support) | `gate_reviews`, `requirements_traceability`, `mentor_signoffs`, `sessions` |

> [!NOTE]
> `EvidenceItem` is a conceptual domain entity modeled via canonical provenance (`evidence_provenance`) and relational evidence links (`claim_evidence_links`). `problem_sources` contains supporting source data attached directly to `ProblemRecord`.

---

## 3. Stage Details & Scientific Methodology Rules

### Stage A: Problem Discovery & Signal Classification
* **Objective**: Capture and classify observed real-world computing, software, or algorithmic friction into structured research problem statements.
* **Methodology**: Ingest field observations, empirical telemetry, or domain pain points. Associate problem statements with a specific `ResearchDomain` (e.g., *Distributed Systems*, *NLP / Language Models*, *Software Engineering*, *Computer Vision*, *Security & Cryptography*).
* **Normative Gate Requirement**: At least 1 well-scoped problem statement logged with clear operational context and domain tagging.

### Stage B: Problem Validation & Empirical Grounding (Gate 1)
* **Objective**: Ground the observed computing friction in empirical evidence and establish the severity/magnitude of consequences if left unresolved.
* **Methodology**: Link candidate problems to observable metrics (e.g., latency, failure rate, memory overhead, developer hours lost).
* **Track Gate Criterion (Gate 1)**: Problem verified by at least 2 independent empirical sources originating from distinct datasets, publications, or observational contexts (duplicate references do not qualify). *This is an Innovation/Research Track gate threshold and does not alter canonical Evidence Model taxonomy or weighting.*

### Stage C: Research Opportunity, Prior Art & Literature Matrix (Gate 2)
* **Objective**: Conduct systematic literature matrix extraction against canonical scholarly connectors (Semantic Scholar, OpenAlex, Crossref, PubMed, Europe PMC) to identify research gaps and formulate answerable research questions.
* **Workflow View vs Canonical Core**: The *Literature Matrix* is a research workflow view/artifact; underlying scholarly sources and citation links persist as canonical `ProvenanceRecord` and `claim_evidence_links` entities, strictly adhering to *Knowledge $
e$ Workflow*.
* **Methodology**: Extract prior art approaches, baseline benchmarks, and limitations. Synthesize explicit *Research Gaps* distinguishing the proposed inquiry from routine software engineering. Register conflicting claims in `ClaimContradiction` and unknown variables in `ProjectUnknown`.
* **Track Gate Criterion (Gate 2)**: Documented literature matrix with identified research gaps; formulation of a clear, scoped, and empirically answerable research question.

### Stage D: Solution & DSR Artifact Formulation
* **Objective**: Formulate the proposed research artifact (construct, model, method, or instantiation) with theoretical justification.
* **Methodology**: Design the architectural and algorithmic mechanism. Map how the proposed artifact addresses the constraints identified in Stage C literature gaps. Document design rationale in `DecisionRecord`.
* **Normative Gate Requirement**: Formal artifact specification with explicit technical justification and theoretical grounding.

### Stage E: Evaluation Design, Benchmarking & Circumscription Loop (Gate 3)
* **Objective**: Design rigorous empirical evaluation protocols (metrics, datasets, baseline comparisons) and execute iterative circumscription loops.
* **Design Science Research (DSR) Circumscription Engine**:
  * When observed evaluation metrics fall short of target benchmarks, CONVERA executes a structured circumscription iteration (`CircumscriptionIteration`).
  * The circumscription engine captures `artifact_name`, `test_run_name`, `metric_name`, `observed_value`, `target_value`, extracts `constraint_extracted`, and directs the research workflow to loop back to either **Stage C** (re-examining prior art / assumptions) or **Stage D** (re-architecting artifact mechanisms).
  * *Epistemic Precision*: A circumscription iteration does not automatically mutate validated claims or decision records; it generates new research telemetry and constraints, after which normal epistemic propagation and human decision processes evaluate downstream impacts.
* **Track Gate Criterion (Gate 3)**: Objective evaluation protocol defined with clear metrics, verified target datasets/participants, and recorded circumscription iteration history.

### Stage F: Feasibility, Ethics, Defense & Mentor Clearance (Gate 4)
* **Objective**: Complete institutional ethics compliance checks, compute budget, and timeline audits, followed by formal defense gate review and attributable mentor signoff.
* **Ethics Authority Boundary**: Applicable institutional and ethical requirements are identified and, where required, documented evidence of compliance or approval is recorded. CONVERA's gate evaluation evaluates internal methodology readiness; it does not claim to constitute or replace formal institutional ethics committee (IRB/REC) authorization.
* **Methodology**: Review data privacy, ethical compliance documentation, and execution resource availability. Complete the formal rubric review (`GateReview`) and record the attributable advisor/mentor authorization (`MentorSignoff`).
* **Track Gate Criterion (Gate 4)**: Documented ethics compliance records, compute resources validated, passing score on Gate 4 rubric evaluation, and signed `MentorSignoff`.

---

## 4. Research Track Invariants (RES-01 through RES-10)

| Invariant ID | Formulation | Enforceability & Status |
| :--- | :--- | :--- |
| **RES-01** | **Problem Grounding Before Solution**: Canonical research-stage and gate progression is governed by backend domain state (reflected in the UI stepper). A research project cannot formulate solution artifacts (Stage D) until the underlying problem passes Stage B empirical grounding and Stage C prior art benchmarking. | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in backend framework engine & stage progression state. |
| **RES-02** | **Literature Matrix Extraction Completeness**: Stage C requires systematic literature extraction benchmarking existing baselines, extracting methodology limitations, and synthesizing distinct research gaps. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `LiteratureMatrixEngine` and `LiteratureMatrixTable.tsx`. |
| **RES-03** | **Circumscription Loopback Fidelity**: Evaluation failures in Stage E must generate structured `CircumscriptionIteration` records that extract newly discovered constraints and direct targeted loopbacks to Stage C or D without mutating established knowledge. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `CircumscriptionLoopView.tsx` and `circumscription_iterations` table. |
| **RES-04** | **Tri-Part Confidence Separation**: Research Track interfaces and decision workflows must preserve the canonical separation between $C_{AI}$ (AI/model confidence), $S_{EVID}$ (evidence strength), and $C_{DEC}$ (human decision confidence). Research-specific dimensions (theoretical grounding, methodological rigor) may be evaluated separately as quality metrics, but must not replace, collapse, or redefine the canonical Tri-Part Confidence model. | `[NORMATIVE / IMPLEMENTED]`<br>Preserved in intelligence scorecard and evidence verification pipeline. |
| **RES-05** | **Contradiction & Unknown Epistemic Tracking**: Disputed literature findings must be registered in `ClaimContradiction`, and unresolved scientific questions tracked in `ProjectUnknown`. | `[NORMATIVE / IMPLEMENTED]`<br>Integrated into `UnknownsMap.tsx`, `project_unknowns`, and `claim_contradictions`. |
| **RES-06** | **AI Scholarly Boundary**: AI-generated synthesis is not itself independent empirical evidence; its evidentiary grounding derives entirely from the traceable evidence and provenance records it accurately references. Synthetic fallback material (`source=synthetic_fb`) is explicitly NON-EVIDENTIARY and contributes zero evidence weight ($0.0$ weight). | `[NORMATIVE / IMPLEMENTED]`<br>Enforced in evidence pipeline; synthetic hypotheses tagged `source=synthetic_fb`. |
| **RES-07** | **Formal Stage Gate Reviews**: Progression past Stages B, C, E, and F requires formal rubric evaluation (`GateReview`) recorded in the database against objective criteria before advancing. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `GateReviewModal.tsx` and `gate_reviews` relational storage. |
| **RES-08** | **Research Spec Traceability**: Generated Research Specifications, DSR briefs, and methodology protocols must maintain bidirectional traceability links to underlying claims and literature citations. | `[NORMATIVE / PARTIALLY IMPLEMENTED]`<br>Traceability lineage supported via `requirements_traceability` and `TraceabilityDrawer.tsx`. |
| **RES-09** | **Domain Taxonomy Categorization**: Research problems must be categorized under an active `ResearchDomain` to inherit domain-specific evaluation standards and literature pools. | `[NORMATIVE / IMPLEMENTED]`<br>Implemented via `research_domains` table, router endpoints, and domain selector UI. |
| **RES-10** | **Attributable Milestone Clearance**: Final Stage F thesis and feasibility clearance requires an attributable human authorization record (`MentorSignoff`) distinct from automated rubric checks. | `[NORMATIVE / IMPLEMENTED]`<br>`GateReview` evaluates rubric criteria; `MentorSignoff` records human advisor authorization. |

---

## 5. Architectural & Track Boundary Summary

1. **Scientific Inquiry vs Engineering Implementation**: The Research Track discovers, grounds, benchmark-compares, and validates scientific hypotheses and DSR artifacts. SDD engineers, tests, and deploys the underlying software implementation.
2. **Canonical Data Model Integrity**: Research Track operations interact exclusively with canonical domain tables (`problems`, `problem_claims`, `claim_evidence_links`, `evidence_provenance`, `problem_alternatives`, `decision_records`, `project_unknowns`, `claim_contradictions`, `requirements_traceability`, `gate_reviews`, `research_domains`, `circumscription_iterations`, `mentor_signoffs`). No parallel or siloed data structures exist.
3. **Cross-Track Continuity**: Any research problem, claim, or literature source created in the Research Track remains immediately available and valid if the user switches to the Innovation Track (e.g., commercializing a DSR research artifact).
