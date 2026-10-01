# CONVERA Verification Checklist: SDD-023
# Ecosystem Integrations & Research Dissemination Bridge (Phase E)

**Specification ID**: `CONVERA-SDD-023`  
**Feature Title**: Ecosystem Integrations & Research Dissemination Bridge (Phase E)  
**Authority Tier**: Tier 2 (Quality & Verification Checklist)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  

---

## 1. Constitutional Invariants Checklist

- [x] **CHK-023-01 (Article VII Anti-Creep Law)**: Zero new dependencies added to `backend/pyproject.toml` or `web/package.json`. Integrations operate over standard HTTP / existing libraries.
- [x] **CHK-023-02 (Article IV Human Sovereignty)**: All external sync requests require explicit user trigger and payload confirmation. No autonomous background sync.
- [x] **CHK-023-03 (Article I & II Evidence Grounding & Cryptographic Provenance)**: Every export payload incorporates the session's SHA-256 state hash, timestamp, and methodology stage.
- [x] **CHK-023-04 (Article VIII Degraded Resilience)**: System operates with 100% offline dry-run preview and downloadable bundle fallback when tokens are absent.

---

## 2. Backend Sync Engine & API Verification

- [x] **CHK-023-05 (Table 38 Migration)**: Relational table `ecosystem_sync_records` is created cleanly with appropriate indexes.
- [x] **CHK-023-06 (Notion Proposal Export)**: Engine compiles DSR proposals, rubric scores, and literature matrices into structured Notion blocks / Markdown payload.
- [x] **CHK-023-07 (Notion Ingestion)**: Engine parses Notion pages/databases into verified CONVERA problem records with provenance metadata.
- [x] **CHK-023-08 (Zotero Reference Export)**: Engine formats ingested `scholarly_works` into valid BibTeX and CSL-JSON bundles.
- [x] **CHK-023-09 (GitHub Issue Generation)**: Engine extracts functional requirements from Stage D artifacts & SRS specs and formats them into GitHub Issue manifests.
- [x] **CHK-023-10 (Deterministic State Hashing)**: Every sync event calculates SHA-256 digest over the transmitted payload.
- [x] **CHK-023-11 (REST API Endpoints)**: Endpoints `/api/ecosystem/notion/export`, `/notion/import`, `/zotero/export`, `/github/export`, `/audit-trail/{session_id}` respond correctly with Pydantic validation.

---

## 3. Frontend UX & Modal Verification

- [x] **CHK-023-12 (EcosystemExportModal Rendering)**: Modal renders multi-tab interface (Notion, Zotero, GitHub) within CCDS v2.0 design tokens.
- [x] **CHK-023-13 (Pre-Transmission Preview)**: Users can inspect formatted Markdown/BibTeX/JSON payload before dispatching sync.
- [x] **CHK-023-14 (Offline Dry-Run Support)**: UI displays clear dry-run badge and allows instant local file download when tokens are unconfigured.
- [x] **CHK-023-15 (Cockpit Action Integration)**: "Ecosystem Sync" button in `ResearchCockpit` opens modal seamlessly.
- [x] **CHK-023-16 (Audit History Display)**: Users can view past sync events, timestamps, and SHA-256 hashes.

---

## 4. Static Typing & Regression Verification

- [x] **CHK-023-17 (Frontend Static Typing)**: `npm run typecheck --prefix web` exits with 0 errors.
- [x] **CHK-023-18 (Frontend Production Build)**: `npm run build --prefix web` completes successfully.
- [x] **CHK-023-19 (Backend Pytest Regression)**: Full test suite passes 100% offline (`pytest -m "not live"` — expanding from 331 baseline to 338 tests).
- [x] **CHK-023-20 (Knowledge Graph AST Sync)**: `graphify update .` runs cleanly without errors.
