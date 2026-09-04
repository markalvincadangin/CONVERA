# CONVERA — Platform Capabilities Catalog

**Document ID**: `CONVERA-PRD-002`  
**Classification**: Functional Capabilities & Inquiry Workflows  
**Authority Tier**: Tier 2 Product Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/01-product/CAPABILITIES.md`  
**Upstream Dependencies**: `01-product/PRODUCT_DEFINITION.md`  
**Downstream Dependents**: `02-system/SYSTEM_ARCHITECTURE.md, 06-frontend/INFORMATION_ARCHITECTURE.md`  

---

> **Implementation-Backed Capability Inventory.**  
> This document authoritatively defines the functional, epistemic, research, and governance capabilities of CONVERA. Every capability is mapped through: **User Value $\to$ Domain Responsibility $\to$ Implementation Evidence $\to$ Epistemic Limitations.**

---

## 1. Capability Taxonomy Overview

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CONVERA CAPABILITY CLUSTERS                           │
├───────────────────────────────┬─────────────────────────────────────────────────┤
│ 1. Epistemic Knowledge Core   │ Claims · Unknowns Triangulation · Net Balance   │
│ 2. Evidence & Scholarly Hub   │ Federated Retrieval · Provenance · Freshness    │
│ 3. Contradiction & Blast Rad. │ Opposing Literature · Causal Invalidation Alerts│
│ 4. Decision Intelligence      │ Immutable Audit Logs · Trade-offs · Lineage     │
│ 5. Computing Research (DSR)   │ Master Domains · Lit Matrix · Circumscription   │
│ 6. Venture Innovation Track   │ Socratic Mom Test · 15 Mechanisms · MVP Audit   │
│ 7. Quality Gate Governance    │ Gates 1–4 Rubrics · Committee Sign-off Records  │
│ 8. CIIA & Interoperability    │ 6-Tier LLM Cascade · JSON-RPC 2.0 MCP Server    │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 2. Cluster 1: Knowledge Management & Epistemic Triangulation

### Capability 1.1: Relational Claim & Assumption Decomposition
* **User Value:** Prevents unexamined assertions from polluting the project backlog; breaks complex problems into testable propositions.
* **Domain Responsibility:** `KnowledgeEngine` & `KnowledgeRouter`.
* **Implementation Evidence:**
  - Database: `problem_claims`, `problem_assumptions` tables in SQLite WAL.
  - Endpoints: `POST /api/knowledge/claims`, `POST /api/knowledge/assumptions`, `GET /api/knowledge/problems/{id}/epistemic-graph`.
  - Frontend: `KnowledgeGraphView.tsx`, `ClaimsList.tsx`.
* **Limitations:** Extraction of claims from unstructured text is AI-assisted and requires researcher review to confirm semantic accuracy.

### Capability 1.2: Dynamic Unknowns Map (Epistemic Triangulation)
* **User Value:** Makes uncertainty visible in real-time, separating verified empirical facts from active working hypotheses and unmeasured risks.
* **Domain Responsibility:** `UnknownsEngine` & `KnowledgeRouter`.
* **Implementation Evidence:**
  - Database: `project_unknowns` table.
  - Endpoints: `GET /api/knowledge/projects/{id}/unknowns`, `POST /api/knowledge/projects/{id}/unknowns`.
  - Frontend: `UnknownsMap.tsx` with 3-column triangulation HUD (*What We Know*, *What We Think*, *What We Don't Know*).
* **Limitations:** Does not automatically execute physical field tests; records and visualizes the state of empirical testing.

### Capability 1.3: Mathematical Net Epistemic Balance Scoring
* **User Value:** Provides an objective, reproducible metric of empirical support rather than relying on subjective intuition.
* **Domain Responsibility:** `knowledge_lifecycle.py`.
* **Implementation Evidence:**
  - Algorithm: $\text{Balance} = \sum (\text{Tier Weight} \times \text{Multiplier})_{\text{Supports}} - \sum (\text{Tier Weight} \times \text{Multiplier})_{\text{Contradicts}}$.
  - Test Suite: `test_knowledge_lifecycle.py` (verified mathematical edge cases).
* **Limitations:** Score is dependent on the completeness and tier accuracy of ingested evidence items.

---

## 3. Cluster 2: Evidence Management & Scholarly Retrieval

### Capability 2.1: Federated Multi-Database Literature Retrieval
* **User Value:** Eliminates manual searching across disparate academic databases, aggregating peer-reviewed literature in parallel.
* **Domain Responsibility:** `ResearchClient` & `ConnectorHub`.
* **Implementation Evidence:**
  - Connectors: `OpenAlexConnector`, `CrossRefConnector`, `PubMedConnector`, `SemanticScholarConnector`, `EuropePMCConnector`.
  - Endpoints: `POST /api/research/search-federated`, `POST /api/problems/{id}/auto-research`.
  - Frontend: `LiteratureMatrixTable.tsx`, `ConnectorSearchModal.tsx`.
* **Limitations:** Operates strictly on open-access scholarly graphs; paywalled proprietary vendor databases (e.g., Scopus, IEEE Xplore direct APIs) are excluded by design to preserve free-first access.

### Capability 2.2: First-Class Source Provenance Tracking
* **User Value:** Guarantees academic citation authenticity; enables reviewers to verify DOIs, PMIDs, and retrieval timestamps instantly.
* **Domain Responsibility:** `ProvenanceEngine` & `StorageAdapter`.
* **Implementation Evidence:**
  - Database: `evidence_provenance`, `claim_evidence_links` tables.
  - Model: `ProvenanceMetadata` schema with status (`UNVERIFIED`, `VERIFIED_BY_RESEARCHER`, `DISPUTED`).
* **Limitations:** Cannot physically prevent a user from pasting a forged citation, but records the exact model/user signature that generated or entered it.

### Capability 2.3: Domain-Calibrated Freshness Decay
* **User Value:** Automatically alerts researchers when foundational claims rely on outdated citations in rapidly evolving fields.
* **Domain Responsibility:** `freshness_engine.py`.
* **Implementation Evidence:**
  - Half-Life Matrix: AI/Computing = 2.5y, Market Telemetry = 2.0y, Biomedical/Agronomy = 5.0y.
  - Endpoints: `GET /api/knowledge/claims/{id}/freshness-score`.
* **Limitations:** Foundational mathematical theorems and historical baseline papers may trigger decay warnings, requiring explicit researcher override (`VERIFIED_HISTORICAL_CANON`).

---

## 4. Cluster 3: Contradiction Detection & Reactive Invalidation

### Capability 3.1: Contradiction Intelligence & `CONTESTED` State
* **User Value:** Detects opposing empirical evidence and prevents teams from hiding contradictory research findings.
* **Domain Responsibility:** `contradiction_engine.py`.
* **Implementation Evidence:**
  - Database: `claim_contradictions` table.
  - Lifecycle: When a refuting evidence link (`CONTRADICTS` / `FALSIFIES`) is added, claim state automatically flips to `CONTESTED`.
  - Test Suite: `test_e2e_closed_loop_intelligence.py`.
* **Limitations:** Semantic contradiction detection between complex research papers requires human verification of experimental conditions.

### Capability 3.2: Causal Blast-Radius Impact Propagation
* **User Value:** Eliminates silent invalidation; immediately warns engineering and research teams when a disproven assumption impacts downstream software requirements.
* **Domain Responsibility:** `impact_engine.py`.
* **Implementation Evidence:**
  - Database: `impact_invalidation_events` table.
  - Logic: Traverses DAG from `Evidence` $\to$ `Claim` $\to$ `Assumption` $\to$ `Decision` $\to$ `Requirement`.
  - Frontend: `ImpactAlertBanner.tsx` with 1-click pivot trigger.
* **Limitations:** Blast-radius depth is bounded by the completeness of the project's explicit traceability links.

---

## 5. Cluster 4: Decision Intelligence & Traceability

### Capability 5.1: Immutable Decision Logging & Rationale Preservation
* **User Value:** Preserves the complete context of *why* choices were made, what alternatives were rejected, and what evidence existed at the time.
* **Domain Responsibility:** `DecisionRoom` & `decisions.py`.
* **Implementation Evidence:**
  - Database: `decision_records` table (`chosen_concept`, `rejected_alternatives`, `rationale`, `selected_by`, `timestamp`).
  - Endpoints: `POST /api/decisions/synthesize`, `POST /api/decisions/commit`, `POST /api/decisions/pivot`.
  - Frontend: `DecisionRoomView.tsx`.
* **Limitations:** While decision logs are immutable, downstream validity is reactive. A decision record cannot be altered, but can be superseded by a formal pivot record.

### Capability 5.2: Multi-Hop Requirements Traceability Matrix
* **User Value:** Proves compliance and software integrity for capstone panels, funding bodies, and enterprise auditors.
* **Domain Responsibility:** `TraceabilityRouter` & `sqlite_adapter.py`.
* **Implementation Evidence:**
  - Database: `requirements_traceability` table.
  - Endpoints: `GET /api/traceability/matrix/{project_id}`.
  - Frontend: `TraceabilityMatrixDrawer.tsx`.
* **Limitations:** Traceability links must be established during phase execution; cannot infer unlinked ad-hoc code changes without manual association.

---

## 6. Cluster 5: Computing Research Intelligence (DSR Track)

### Capability 6.1: Master Computing Research Domains & Empirical Discovery
* **User Value:** Rapidly scopes computing capstone/thesis problems within 25 verified research fields, preventing vague or non-computing proposals.
* **Domain Responsibility:** `research.py` & `research_domains`.
* **Implementation Evidence:**
  - Database: `research_domains` table containing canonical 25 domains (`D01`–`D25`) + custom domain CRUD.
  - Generator: `POST /api/research/stage-a/discover` using Bordens & Abbott empirical scouting prompts.
  - Frontend: `ResearchWorkspaceView.tsx` with domain chips and sample breakdowns.
* **Limitations:** Generates empirical problem candidates; does not substitute for preliminary field data collection.

### Capability 6.2: Literature Matrix Comparative Synthesizer
* **User Value:** Transforms chaotic paper collections into an interactive comparative grid (Study, Problem, Method, Findings, Limitations).
* **Domain Responsibility:** `literature_matrix.py` & `research.py`.
* **Implementation Evidence:**
  - Endpoints: `POST /api/research/literature-matrix/synthesize`, `GET /api/research/literature-matrix/{problem_id}`.
  - Frontend: `LiteratureMatrixTable.tsx`.
* **Limitations:** Depends on open-access paper abstracts and available PDF full-text parsed chunks.

### Capability 6.3: AI-Assisted Research Gap vs. Limitation Discriminator
* **User Value:** Prevents students from mistaking a paper's self-reported limitation or simple software absence for an authentic research gap.
* **Domain Responsibility:** `evaluation_engine.py`.
* **Implementation Evidence:**
  - Discriminator Formula: $\text{Limitation} \neq \text{Missing Knowledge} \neq \text{Authentic Gap} \neq \text{Premature Solution}$.
  - Endpoints: `POST /api/evaluation/discriminate-gap`.
* **Limitations:** Outputs candidate gap interpretations; requires scientific peer validation.

### Capability 6.4: DSR Circumscription Iteration Loop
* **User Value:** Formally captures artifact evaluation failures and translates them into new design constraints for the next research iteration.
* **Domain Responsibility:** `circumscription_engine.py`.
* **Implementation Evidence:**
  - Database: `circumscription_iterations` table.
  - Endpoints: `POST /api/research/circumscription/log-failure`, `GET /api/research/circumscription/{problem_id}`.
  - Frontend: `CircumscriptionLoopView.tsx`.
* **Limitations:** Requires researchers to input structured evaluation benchmark data (e.g., latency, accuracy, throughput metrics).

### Capability 6.5: Automated DSR Proposal Brief Exporter
* **User Value:** 1-click compilation of a formal, academic thesis/capstone proposal in Markdown and PDF formats.
* **Domain Responsibility:** `proposal_exporter.py` & `export.py`.
* **Implementation Evidence:**
  - Endpoints: `GET /api/export/dsr-proposal/{problem_id}`.
  - Output Structure: Background, Master Domain, Bordens & Abbott Triage, Literature Matrix, RQs, DSR Methodology, Gate 1–4 Sign-offs.
* **Limitations:** Output is a formatted draft requiring student editing and advisor review before official university submission.

---

## 7. Cluster 6: Venture Innovation Track (Venture Ratchet)

### Capability 7.1: Socratic Mom Test Validation Clinic
* **User Value:** Guides founders through non-leading customer discovery interviews (Levels 1–6) to detect real past behavior vs. polite conversational lies.
* **Domain Responsibility:** `pipeline.py` & `prompts/socratic_clinic.py`.
* **Implementation Evidence:**
  - Frontend: Phase 3 Socratic Clinic interactive wizard.
  - Validation: Behavioral commitment logging (Skin-in-the-game Tiers 1–5: Letters of Intent, pilot deposits, active time investment).
* **Limitations:** Founder must conduct actual human interviews; system evaluates the logged responses for bias and commitment strength.

### Capability 7.2: 15-Mechanism Solution Ideation Matrix
* **User Value:** Prevents generic "build an app" thinking by systematically mapping problems across 15 distinct technical mechanism families (e.g., edge caching, mesh relay, automated triage, telemetry anomaly detection).
* **Domain Responsibility:** `pipeline.py` (Phase 4 engine).
* **Implementation Evidence:**
  - Database: `problem_solutions` table.
  - Endpoints: `POST /api/pipeline/phase4/ideate`.
* **Limitations:** Proposes technical mechanism candidates; architectural feasibility must be evaluated in Phase 5 / Stage E.

---

## 8. Cluster 7: Quality Gate Governance

### Capability 8.1: Multi-Gate Review & Committee Sign-offs
* **User Value:** Enforces institutional governance, ensuring teams cannot skip rigorous validation steps.
* **Domain Responsibility:** `gate_engine.py` & `gates.py`.
* **Implementation Evidence:**
  - Database: `gate_reviews` table.
  - Supported Gates: Gate 1 (Problem Grounding), Gate 2 (Lit Matrix & Methodology), Gate 3 (Artifact Verification), Gate 4 (Evaluation & Defense).
  - Frontend: `GateReviewModal.tsx` with rubric checklists and sign-off recording.
* **Limitations:** Gating is advisory or strict depending on project workspace configuration (e.g., student capstone vs. solo sandbox mode).

---

## 9. Cluster 8: CIIA & Interoperability Architecture

### Capability 9.1: Multi-Tier Resilient LLM Gateway (6-Tier Failover Cascade)
* **User Value:** Provides enterprise-grade multi-provider execution without requiring a single paid AI subscription ($0.00 infrastructure cost).
* **Domain Responsibility:** `llm_gateway.py`.
* **Implementation Evidence:**
  - Cascade: Primary (Google Gemini 3.5-flash-lite) $\to$ Secondary (Groq `openai/gpt-oss-20b` / `groq/compound-mini`) $\to$ High-Volume Buffer (Cerebras Cloud `llama-3.3-70b` with 14,400 free req/day) $\to$ Developer Models (GitHub Models `gpt-4o-mini`) $\to$ Multi-Model Proxy (OpenRouter free tier) $\to$ Local Sovereign (Ollama `localhost:11434`).
  - Synthetic Fallback: Gracefully generates synthetic mock outputs (`is_degraded = True`) if completely disconnected from network and local models.
* **Limitations:** Quality of analysis will vary depending on model size and token context windows.

### Capability 9.2: Standalone JSON-RPC 2.0 MCP Server Daemon
* **User Value:** Exposes CONVERA's knowledge graph, decisions, and literature search tools directly into AI IDEs (Antigravity IDE, Claude Desktop, Cursor).
* **Domain Responsibility:** `backend/mcp_server.py`.
* **Implementation Evidence:**
  - Protocol: Standard stdio JSON-RPC 2.0 daemon.
  - 7 Active Tools: `convera_query_knowledge`, `convera_query_unknowns`, `convera_query_decisions`, `convera_calibrate_confidence`, `convera_discriminate_gap`, `convera_trace_requirement`, `convera_search_literature`.
  - Test Suite: `test_mcp_server.py`.
* **Limitations:** Requires an MCP-compliant client interface to interact with the stdio stream.
