# CONVERA SDD-020: Functional Specification
# DSR Deliverable & Comprehensive Proposal Export Engine (Phase D1)

**Specification ID**: CONVERA-SDD-020  
**Feature Title**: DSR Deliverable & Comprehensive Proposal Export Engine  
**Authority Tier**: Tier 2 (Engineering Specification)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  
**Target Feature Branch**: `feature/020-dsr-deliverable-proposal-export`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `32d70a5` (Merged Phase C3)  

---

## 1. Executive Summary & Problem Framing

CONVERA has systematically realized the Design Science Research (DSR) computing track across Stages A through F:
- **Stage A**: Problem definition, stakeholder friction, variable decomposition, and testable assumptions (`problems`, `problem_assumptions`).
- **Stage B/C**: Grounding evidence, scholarly literature matrix, research questions, and epistemic claims (`problem_sources`, `scholarly_works`, `claim_evidence_links`).
- **Stage D**: 4-Quadrant DSR artifact design, kernel theory alignment, baseline alternatives (`dsr_artifacts`).
- **Stage E**: Concept rigor evaluation, multi-criteria rubric scoring, and circumscription loopback iterations (`concept_evaluations`, `circumscription_iterations`).
- **Stage F**: Institutional ethics (RA 10173), SDG & DOST-PCIEERD alignment, resource budget, and Gate 4 defense clearance (`feasibility_records`, `mentor_signoffs`, `gate_reviews`).
- **Cross-Stage Critique Audit (Phase C3)**: Cross-stage contradiction detection, adversarial kill questions, deterministic consistency score, and Article IV human resolution log (`research_critiques`).

While individual stages display rich interactive visualizations, researchers, academic advisors, and thesis committees require **portable, publication-ready, and formal academic deliverables**. Currently, the system only outputs an unformatted rudimentary markdown draft with hardcoded fallbacks and lacks:
1. Complete synthesis of the Cross-Stage Critique & Blind-Spot Engine audit trail (SDD-019).
2. Production-grade academic **LaTeX document compilation** (`.tex` + BibTeX `.bib`) compatible with IEEE/ACM formatting guidelines and Overleaf.
3. Standalone **Printable HTML Dossier** with print styling (`@media print`) enabling 1-click PDF generation directly in any browser.
4. Cryptographically verifiable **JSON Research Monograph** containing the complete relational data tree and deterministic SHA-256 provenance digest.
5. Interactive multi-format export deck in `StageFFeasibilityView.tsx` with live format switching, syntax-highlighted preview, and instant bundle download.

SDD-020 delivers the **DSR Deliverable & Comprehensive Proposal Export Engine**, unifying all 6 research stages and the critique audit into academic deliverables.

---

## 2. Constitutional Invariants & Non-Negotiables

| Invariant ID | Constitutional Principle | Strict Requirement |
|:---|:---|:---|
| **`INV-020-01`** | **Article VII (Anti-Creep Law)** | Zero new third-party dependencies in `pyproject.toml` or `package.json`. Compilation uses Python standard library templating and browser-native download blobs. |
| **`INV-020-02`** | **Article I & II (Evidence Grounding & Provenance)** | All exported artifacts must embed a deterministic SHA-256 provenance manifest hashing all underlying relational entities (Stages A–F + Critiques). |
| **`INV-020-03`** | **Article IV (Human Sovereignty)** | All exported proposals must prominently display attributable human advisor sign-offs, gate review verdicts, and human critique resolution rationales without synthetic falsification. |
| **`INV-020-04`** | **Article VIII (Degraded Resilience & Offline Autonomy)** | The engine must compile complete, syntactically valid documents (LaTeX, BibTeX, Markdown, HTML, JSON) 100% offline without requiring internet access or cloud rendering tokens. |

---

## 3. User Stories & Acceptance Criteria

### User Story 1: LaTeX Proposal Compilation for Overleaf & Defense
> *As a computing researcher preparing for thesis proposal defense, I want to export my entire DSR project as a clean, modular LaTeX document and BibTeX file, so that I can directly compile it into an IEEE/ACM-compliant PDF monograph or import it into Overleaf.*

- **Acceptance Criteria**:
  - The engine outputs valid, compilable LaTeX (`.tex`) containing standard packages (`amsmath`, `booktabs`, `hyperref`, `graphicx`, `geometry`).
  - Mathematical variable formulations ($X, Y, C$) are properly formatted in math mode.
  - Tables for the literature matrix, circumscription iterations, and gate review matrices are formatted with `booktabs` (`\toprule`, `\midrule`, `\bottomrule`).
  - BibTeX entries (`.bib`) are generated dynamically from linked `scholarly_works` and cited in-text with `\cite{...}`.
  - Section 7 includes the Cross-Stage Critique & Blind-Spot Audit with formulaic score and mitigation strategies.

### User Story 2: Standalone Printable HTML Dossier for Committee Review
> *As an academic advisor reviewing a student's proposal, I want to view and print a self-contained HTML deliverable, so that I can print or save a styled PDF with 1 click without installing LaTeX tooling.*

- **Acceptance Criteria**:
  - The engine outputs a standalone HTML file containing embedded CSS, clean typography, executive summary badges, and `@media print` rules.
  - In print view, page breaks (`page-break-before: always`) occur cleanly before major chapters.
  - The document renders offline without external CDN dependencies.

### User Story 3: Multi-Format Export Deck in UI
> *As a researcher in the Stage F Proposal Canvas, I want an interactive Export Deck with format switcher tabs (Markdown, LaTeX, BibTeX, HTML, JSON), live preview, and download buttons, so that I can easily inspect and copy deliverables.*

- **Acceptance Criteria**:
  - `StageFFeasibilityView.tsx` features format selector pills: `MARKDOWN (.md)`, `LATEX (.tex)`, `BIBTEX (.bib)`, `PRINTABLE HTML (.html)`, `PROVENANCE JSON (.json)`.
  - Preview window updates immediately upon switching formats.
  - Quick actions provide: "Copy to Clipboard", "Download Active Format", and "Download Complete Zip/Bundle".

---

## 4. Architectural Scope & Deliverables

1. **Domain Models (`backend/models/export.py`)**:
   - `ExportFormat` enum: `MARKDOWN`, `LATEX`, `BIBTEX`, `HTML`, `JSON`, `BUNDLE`.
   - `DSRProposalCompilationRequest`, `DSRProposalCompilationResponse`, `ProvenanceManifest`.
2. **Core Engine (`backend/engines/proposal_exporter.py`)**:
   - Upgraded `ProposalExporter` aggregating Stages A–F and Table 36 (`research_critiques`).
   - Generators: `generate_markdown()`, `generate_latex()`, `generate_bibtex()`, `generate_html()`, `generate_json()`, `compile_bundle()`.
   - Deterministic SHA-256 provenance hash generation.
3. **API Router (`backend/routers/export.py`)**:
   - `GET /api/export/dsr-proposal`: Enhanced with `format` parameter.
   - `POST /api/export/compile`: Full compilation endpoint with section toggles and metadata customization.
   - `GET /api/export/bibtex`: Direct BibTeX download.
4. **Research Orchestrator Dispatch (`backend/services/research_orchestrator.py`)**:
   - Support for `ActionType.EXPORT_PROPOSAL` with format selection.
5. **Frontend UI (`web/src/components/research/feasibility/StageFFeasibilityView.tsx` & `web/src/services/exportService.ts`)**:
   - Full format selector, tabbed syntax preview, and download triggers.
