# CONVERA — Canonical Domain & Epistemic Glossary

**Document ID**: `CONVERA-FND-004`  
**Classification**: Authoritative Lexicon & Domain Terminology  
**Authority Tier**: Tier 1 Foundational  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/00-foundation/GLOSSARY.md`  
**Upstream Dependencies**: `CONSTITUTION.md, PRINCIPLES.md`  
**Downstream Dependents**: `DOMAIN_MODEL.md, DATABASE_SCHEMA.md`  

---

> **The Authoritative Semantic Lexicon of CONVERA.**  
> All engineering agents, researchers, developers, and documentation must use these terms strictly according to their defined meanings. Terms must never be conflated or used interchangeably.

---

## 1. Canonical Knowledge Entities

### Problem (`ProblemRecord`)
An articulated, empirical obstacle, pain point, or inefficiencies experienced by specific stakeholders, characterized by quantifiable negative consequences. Problems exist independently of any proposed technological solution.

### Claim (`ProblemClaim`)
A specific, testable proposition asserting a factual or causal relationship within a problem or solution domain. A claim begins in an unverified state (`HYPOTHESIS`) and requires empirical evidence links to graduate.

### Evidence Item (`ProblemSource` / `EvidenceProvenance`)
A verifiable, provenance-bearing empirical observation, scholarly publication, dataset, or field test result. Evidence carries an explicit source identifier (DOI/PMID/URL), timestamp, extraction model, and verification status.

### Assumption (`ProblemAssumption`)
An unverified premise or condition that must hold true for a proposed problem understanding, business model, or technical architecture to be valid. Categorized by risk severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

### Decision Record (`DecisionRecord`)
An immutable audit log capturing an explicit choice made by project creators. Records the selected concept, rejected alternatives, rationale, timestamp, author, and linked foundational claims.

### Requirement (`RequirementsTraceability`)
A technical, functional, or non-functional specification for a software system, directly traceable back to validated claims, empirical evidence, and ratified decision records.

### Unknown (`ProjectUnknown`)
An explicit item of uncertainty in a project's problem space, categorized into verified constants (*What We Know*), active working hypotheses (*What We Think*), or critical unmeasured risks (*What We Don't Know*).

### Contradiction Pair (`ClaimContradiction`)
A detected conflict between two pieces of evidence where one supports a claim and the other refutes or falsifies it, automatically transitioning the claim to `CONTESTED`.

### Provenance Metadata (`ProvenanceMetadata`)
Immutable metadata attached to every evidence item detailing its origin: connector type, unique source identifier (DOI, PMID, URL, hash), retrieval timestamp (UTC), extraction model, and human verification status.

---

## 2. Epistemic & Mathematical Concepts

### Net Epistemic Balance
A mathematical score quantifying the net empirical support for a claim, computed as:
$$\text{Net Balance} = \sum (\text{Tier Weight} \times \text{Strength Multiplier})_{\text{Supports}} - \sum (\text{Tier Weight} \times \text{Strength Multiplier})_{\text{Contradicts}}$$

### Epistemic States
The lifecycle states of a claim or assumption in CONVERA:
* **`UNKNOWN`**: Proposition stated with zero supporting or opposing evidence.
* **`HYPOTHESIS`**: Stated working assumption undergoing investigation.
* **`SUPPORTED`**: Supported by positive evidence without unresolved contradictions.
* **`VALIDATED`**: Supported by high-tier empirical evidence with strong mathematical balance.
* **`CONTESTED`**: Opposed by verified contradictory evidence; requires researcher review.
* **`FALSIFIED`**: Formally disproven by definitive empirical testing or authoritative retraction.

### Tri-Part Confidence Calibration
The strict architectural decoupling of three distinct confidence dimensions:
1. **AI Model Linguistic Certainty:** The statistical token confidence of an LLM's prose.
2. **Empirical Evidence Strength:** The methodological rigor and tier weight of citations.
3. **Decision Confidence:** The human-ratified conviction in a chosen project path.

### Evidence Tiers
* **Tier A (Weight 3.0):** Peer-reviewed scholarly papers, systematic meta-analyses, official clinical trials, and verified institutional datasets.
* **Tier B (Weight 2.0):** Conference proceedings, preprints, technical whitepapers, and verified field interview transcripts.
* **Tier C (Weight 1.0):** Industry news articles, secondary blog summaries, and unverified web signals.

### Freshness Decay
An exponential age-discounting formula that gradually reduces the epistemic weight of older citations based on domain-calibrated half-lives (e.g., AI: 2.5 years, Market Signals: 2.0 years, Agronomy: 5.0 years).

### Causal Blast-Radius / Impact Invalidation
The process by which the **Impact Engine** traces downstream dependency trees when foundational evidence is refuted, automatically flagging dependent decisions as `STALE_REVIEW_REQUIRED`.

---

## 3. Framework & Workflow Concepts

### Framework Template
A structured, phased methodology (e.g., Venture Ratchet, CRCDP Research) defining stages, required artifacts, quality gates, and transition criteria.

### Innovation Track (Venture Ratchet)
A 5-phase startup development pipeline:
1. **Phase 1 (Discovery):** Sector exploration and raw pain statement intake.
2. **Phase 2 (Screening):** Feasibility, market sizing, and kill-switch triage.
3. **Phase 3 (Validation):** Socratic Mom Test customer interviews (Levels 1–6).
4. **Phase 4 (Ideation):** 15-mechanism solution family ideation and concept mapping.
5. **Phase 5 (MVP & Evaluation):** Skin-in-the-game commitment testing and SRS generation.

### Computing Research Track (CRCDP / DSR)
A 6-stage Design Science Research pipeline (*Bordens & Abbott, 2018*):
* **Stage A (Scouting & Discovery):** 25 Master Domains (`D01`–`D25`), Custom Domains, and Empirical Discovery.
* **Stage B (Gate 1 Lit Grounding):** Scientific literature grounding triage and hypothesis falsification criteria.
* **Stage C (Literature Matrix):** Multi-database comparative matrix (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar).
* **Stage D (Research Protocol):** Variable operationalization, empirical metrics, and experimental control design.
* **Stage E (Artifact Construction):** System technical architecture, component breakdown, and telemetry integration.
* **Stage F (Evaluation & Feasibility):** Statistical significance testing, Gate 4 defense review, and Circumscription failure loopback.

### Quality Gate (Gates 1–4)
A formal checkpoint requiring explicit criteria verification, rubric scoring, and committee sign-off before a project can graduate to subsequent workflow stages.

### Circumscription Loop
The formal DSR iteration mechanism where an artifact evaluation failure in Stage F is analyzed to extract new design constraints, looping back to Stage D for protocol refinement.

### Problem Bank (Slot 0)
The persistent repository where all newly discovered, ingested, or seeded problems reside before being routed to specific workflow stages.

### Stage Anchor
The persistent navigation banner across research stages enabling 1-click active problem context switching.

---

## 4. Architectural & Subsystem Concepts

### CIIA (Cognitive Infrastructure & Interoperability Architecture)
The subsystem responsible for external AI interactions, scholarly retrieval, document parsing, and agent interoperability.

### LLM Gateway
The 3-tier multi-provider fallback cascade:
$$\text{Primary (Gemini Flash)} \longrightarrow \text{Secondary (Groq LLaMA)} \longrightarrow \text{Fallback (Local Ollama)}$$

### Connector Hub
The standardized collection of academic API adapters implementing `BaseConnector` (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar).

### MCP Subsystem (Model Context Protocol)
The standalone JSON-RPC 2.0 stdio server daemon (`backend/mcp_server.py`) that exposes CONVERA's knowledge graph, decisions, and literature search tools to external AI IDEs.

### CCDS (CONVERA Core Design System)
The dark-mode UI design system featuring HSL color tokens, glassmorphism, responsive drawers, and zero-wrap flex button layouts.
