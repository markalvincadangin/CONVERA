# CONVERA SDD-007: Defect & Scope Boundary Register
**Source-Mediated Epistemic Bridge (Knowledge-Workflow Integration)**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Architectural & Operational Defect Register  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [DRAFT — NOT YET RATIFIED / IMPLEMENTATION NOT AUTHORIZED]  
**Revision**: 0.1.0 (Draft Register)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  

---

## 1. Triaged Defect Inventory

| Defect ID | Severity | Category | Title & Summary | Remediation in SDD-007 | Scope Status | Resolution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEF-KNOW-001`** | **CRITICAL** | Data Integrity | **Destructive Source Deletion in `update_problem`**<br>`sqlite_adapter.py:1682` executes `DELETE FROM problem_sources WHERE problem_id = ?`, triggering `ON DELETE CASCADE` and wiping out all `claim_evidence_links` on problem updates `[MEASURED FACT]`. | **MANDATORY BLOCKER**: Refactor `update_problem()` to implement idempotent upsert/reconciliation matching by ID, URL, or scholarly key. | **IN-SCOPE (Task 1)** | 🟡 **SPECIFIED (SDD-007)** |
| **`DEF-KNOW-002`** | **HIGH** | Architecture | **Scholarly Literature Disconnected from Claim Links**<br>`claim_evidence_links.source_id` is an `INTEGER` referencing `problem_sources`, while `scholarly_works.id` is `TEXT` (`SW-...`). Academic works cannot be linked to claims `[MEASURED FACT]`. | Implement Design 2: Add `scholarly_work_id TEXT REFERENCES scholarly_works(id)` to `problem_sources`. | **IN-SCOPE (Core)** | 🟡 **SPECIFIED (SDD-007)** |
| **`DEF-KNOW-003`** | **HIGH** | Epistemic | **Muted Decision Room Epistemic Balance Calculation**<br>`decision_engine.py:160–162` defaults epistemic score to 50.0 and risk penalty to 0.0 because problems enter DB with zero claims `[MEASURED FACT]`. | Activate vertical slice proving candidate composite scoring consumes live epistemic balance calculation. | **IN-SCOPE (Slice)** | 🟡 **SPECIFIED (SDD-007)** |
| **`DEF-DATA-001`** | **HIGH** | Data Integrity | **Problem Bank Deduplication Storage Bypass**<br>`sqlite_adapter.py:1258` bypasses matching whenever `raw_id` is present, causing 922 duplicate rows across 997 Problem Bank records `[MEASURED FACT]`. | **STRICTLY EXCLUDED** under Article VII (Anti-Creep Rule). Resolving deduplication requires independent problem clustering workflows. | **EXCLUDED** | ⏸️ **LOGGED (Separate Scope)** |
| **`DEF-DEV-007`** | **MEDIUM** | Performance | **Unmocked LLM Gateway Egress in Integration Tests**<br>`test_assumption_extraction_engine` (43.6s) and `test_srs_generator_flow` (43.4s) consume 87s of 91s suite duration `[MEASURED FACT]`. | Known deferred defect from SDD-005. Strictly excluded per scope isolation rules. | **EXCLUDED** | 📋 **DEFERRED DEFECT** |
| **`DEF-SCORE-001`**| **HIGH** | Heuristics | **Evidence Scorer Superficial Metric Gaming**<br>`evidence_scorer.py` awards maximum points to strings with `₱` and digits, restricting geography to Iloilo towns. | Excluded from SDD-007. Sequenced to follow knowledge-workflow integration. | **EXCLUDED** | 📋 **SEQUENCED FOR FUTURE SDD** |

---

## 2. Scope Reconciliation & Anti-Creep Justification

### Why `DEF-DATA-001` (Problem Bank Deduplication) is Excluded:
1. **Separation of Concerns**: SDD-007 focuses strictly on the **epistemic link bridge** between claims, sources, and scholarly literature. Deduplication of 922 legacy problem bank records requires clustering, fuzzy matching, and multi-table foreign key consolidation.
2. **Blast Radius Control**: Conflating database deduplication with schema migration and upsert refactoring would create unacceptable regression risk for a single specification.
3. **Anti-Creep Law Compliance**: Article VII mandates isolating distinct architectural concerns into bounded, verifiable increments.

### Why Automated LLM Claim Extraction is Excluded:
1. **Human Boundary Law (Article VIII)**: Auto-extracting and auto-committing claims into canonical relational tables without human review risks polluting the knowledge graph with unverified LLM assertions.
2. **Minimum Safe Slice**: The vertical slice proves that the database and epistemic engines function correctly given valid data; automating the generation of that data is an upstream workflow problem for a subsequent phase.

### Why Research Track Stages B–F are Excluded:
1. **Independence Finding**: The discovery spike established that knowledge-workflow integration is structurally independent of Research Track execution endpoints.
2. **Foundation First**: Establishing the referentially safe relational bridge must precede building specialized UI canvases and execution pipelines.
