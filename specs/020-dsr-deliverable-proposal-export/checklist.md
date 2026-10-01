# CONVERA SDD-020: Verification & Constitutional Checklist
# DSR Deliverable & Comprehensive Proposal Export Engine (Phase D1)

**Specification ID**: CONVERA-SDD-020  
**Feature Title**: DSR Deliverable & Comprehensive Proposal Export Engine  
**Authority Tier**: Tier 2 (Quality Assurance Checklist)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  
**Target Feature Branch**: `feature/020-dsr-deliverable-proposal-export`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `32d70a5`  

---

## 1. Constitutional Invariants Checklist

- [ ] **`INV-020-01` (Article VII Anti-Creep Law)**:
  - [ ] Zero new packages added to `backend/pyproject.toml`.
  - [ ] Zero new packages added to `web/package.json`.
- [ ] **`INV-020-02` (Article I & II Evidence Grounding & Cryptographic Provenance)**:
  - [ ] Deterministic SHA-256 provenance hash computed from canonical JSON tree of all underlying relational records (Stages A–F + Critiques).
  - [ ] Provenance hash embedded across all export formats (LaTeX, BibTeX, Markdown, HTML, JSON).
- [ ] **`INV-020-03` (Article IV Human Sovereignty)**:
  - [ ] Attributable human mentor/committee sign-offs prominently displayed in Section 6.
  - [ ] Article IV human critique resolution notes prominently displayed in Section 7 without synthetic alteration.
- [ ] **`INV-020-04` (Article VIII Degraded Resilience & Autonomous Compilation)**:
  - [ ] All document formats (LaTeX, BibTeX, Markdown, HTML, JSON) compile 100% offline without requiring internet or third-party cloud rendering APIs.

---

## 2. Engineering Verification Protocol

- [ ] **Backend Data Models & Core Engine**:
  - [ ] `backend/models/export.py` authored with `ExportFormat`, `ProposalSection`, `DSRProposalCompilationRequest`, `DSRProposalCompilationResponse`.
  - [ ] `backend/engines/proposal_exporter.py` upgraded to compile Markdown, LaTeX (`.tex`), BibTeX (`.bib`), Printable HTML (`.html`), and Provenance JSON (`.json`).
  - [ ] Section 7 (Cross-Stage Critique Audit) integrated with formulaic consistency score, fatal flaws, and human resolution notes.
- [ ] **API Router & Orchestrator**:
  - [ ] `backend/routers/export.py` endpoints updated: `GET /api/export/dsr-proposal`, `POST /api/export/compile`, `GET /api/export/bibtex`.
  - [ ] Research orchestrator dispatches `ActionType.EXPORT_PROPOSAL`.
- [ ] **Frontend UI & Client Service**:
  - [ ] `web/src/services/exportService.ts` created with client methods for multi-format export.
  - [ ] `web/src/components/research/feasibility/StageFFeasibilityView.tsx` updated with format switcher pills, live syntax preview, and 1-click download actions.
- [ ] **Quality Gates**:
  - [ ] Dedicated test suite `backend/tests/test_proposal_exporter.py` passes 100%.
  - [ ] Full backend regression suite (`pytest backend/tests/ -m "not live"`) passes 100%.
  - [ ] TypeScript static typing (`npm run typecheck --prefix web`) passes with 0 errors.
  - [ ] Next.js production build (`npm run build --prefix web`) succeeds.
  - [ ] AST Knowledge Graph synced via `graphify update .`.
