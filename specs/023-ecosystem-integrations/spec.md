# CONVERA Feature Specification: SDD-023
# Ecosystem Integrations & Research Dissemination Bridge (Phase E)

**Specification ID**: `CONVERA-SDD-023`  
**Feature Title**: Ecosystem Integrations & Research Dissemination Bridge (Phase E)  
**Authority Tier**: Tier 2 (Actionable System Specification)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/023-ecosystem-integrations`  
**Target Integration Branch**: `develop`  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VI, VII, VIII  

---

## 1. Problem Statement & Motivation

Following the completion of the core research methodology, multi-tier intelligence, and DAG visualization engines (SDD-001 through SDD-022), CONVERA researchers face an external dissemination bottleneck:
1. **Disconnected Researcher Toolchains**: Research outputs (Gate 4 DSR Proposals, Literature Matrices, SRS specs, and Evidence Chains) remain isolated inside CONVERA's local SQLite database unless manually copy-pasted into researcher knowledge hubs (Notion), reference managers (Zotero), or engineering repositories (GitHub).
2. **Missing Bi-Directional Knowledge Flow**: Field notes, user interviews, and literature gathered in Notion or Zotero cannot be seamlessly ingested into CONVERA's Stage A/B intake pipeline with guaranteed provenance.
3. **Loss of Epistemic Provenance during External Handoff**: When proposals and technical requirements are exported to external tracking systems, the underlying evidence chain (epistemic tiers, confidence gauges, and SHA-256 state hashes) is lost.

SDD-023 establishes a bi-directional research dissemination bridge connecting CONVERA to Notion, Zotero, and GitHub while enforcing **Human Sovereignty (Article IV)**, **Cryptographic Provenance (Articles I & II)**, and the **Anti-Creep Law (Article VII — 0 new dependencies)**.

---

## 2. Personas & Core User Stories

### Persona 1: Academic & Venture Researcher
- **As a** researcher using Notion for collaborative lab notes and Zotero for citation libraries,
- **I want to** export my validated CONVERA Gate 4 Proposal Canvas and literature matrix directly into my Notion workspace and Zotero collections with one click,
- **So that** my team can review synthesized findings without losing DOI citations, verbatim quotes, or epistemic confidence weights.

### Persona 2: Research Software Engineer / DSR Practitioner
- **As a** research software engineer operationalizing a DSR artifact,
- **I want to** export CONVERA's functional requirements and technical architecture specifications directly into GitHub Issues with milestone tags,
- **So that** engineering teams can immediately build from ratified research specifications with full traceability back to empirical problem claims.

### Persona 3: Principal Investigator / Reviewer
- **As a** principal investigator overseeing research governance,
- **I want** every external export and import to carry a verifiable SHA-256 state hash and be logged in a local SQLite sync audit trail,
- **So that** all external research dissemination is reproducible and tamper-evident.

---

## 3. Scope Boundaries & Anti-Goals

### In-Scope:
1. **Bi-Directional Notion Sync**:
   - Export: Push DSR Proposal Canvas, Literature Matrix, and Evidence Chain summary as rich Notion blocks and database rows.
   - Import: Ingest unstructured or semi-structured notes from Notion pages into CONVERA Problem Bank / Literature Pool.
2. **Zotero Reference Collection Export**:
   - Export session literature items as formatted BibTeX and CSL-JSON reference bundles tagged with CONVERA session metadata.
3. **GitHub Technical Manifest & Issue Export**:
   - Convert DSR system requirements and SRS specifications (SDD-018/020) into GitHub Issue templates and milestone roadmaps.
4. **Ecosystem Sync Engine**:
   - Unified orchestration engine (`backend/engines/ecosystem_sync_engine.py`) managing external payloads, rate limits, retry policies, and offline dry-run previews.
5. **FastAPI Endpoints**:
   - `/api/ecosystem/notion/export`, `/api/ecosystem/notion/import`, `/api/ecosystem/zotero/export`, `/api/ecosystem/github/export`, `/api/ecosystem/audit-trail`.
6. **CCDS v2.0 UI Modal**:
   - `EcosystemExportModal` in the frontend allowing researchers to preview rendered Markdown/JSON, verify credentials, and confirm sync actions.

### Anti-Goals (Out of Scope):
- **No Background Automated Sync**: Automated polling or cron sync without explicit human initiation is forbidden (violates Article IV Human Sovereignty).
- **No Heavy External SDKs**: Do NOT add heavyweight third-party libraries (e.g. `PyGithub`, `notion-client`). All integrations must use standard Python `httpx` or existing adapters (violating Article VII Anti-Creep Law).
- **No Proprietary Cloud Storage Lock-In**: CONVERA remains 100% self-hosted; external integrations are strictly modular outbound/inbound bridges.

---

## 4. Constitutional Invariant Constraints

1. **INV-023-01 (Article VII Anti-Creep Law)**: Exactly 0 new dependencies in `backend/pyproject.toml` or `web/package.json`. Integrations utilize existing `httpx` and browser APIs.
2. **INV-023-02 (Article IV Human Sovereignty)**: All external synchronization requires explicit user confirmation via the preview modal. No implicit background uploads.
3. **INV-023-03 (Article I & II Evidence Grounding & Cryptographic Provenance)**: Every export payload includes the session's SHA-256 state hash, timestamp, and methodology stage. Every import is recorded with `source_name` and `authority_tier`.
4. **INV-023-04 (Article VIII Degraded Resilience)**: When external API keys are absent, disconnected, or rate-limited, the system falls back gracefully to deterministic offline dry-run payloads and local downloadable files.
