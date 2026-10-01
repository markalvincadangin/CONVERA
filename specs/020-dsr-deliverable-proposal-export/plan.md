# CONVERA SDD-020: Architecture & Implementation Plan
# DSR Deliverable & Comprehensive Proposal Export Engine (Phase D1)

**Specification ID**: CONVERA-SDD-020  
**Feature Title**: DSR Deliverable & Comprehensive Proposal Export Engine  
**Authority Tier**: Tier 2 (Engineering Plan)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  
**Target Feature Branch**: `feature/020-dsr-deliverable-proposal-export`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `32d70a5`  

---

## 1. System Architecture & Information Flow

The Proposal Export Engine serves as the terminal synthesis layer of the CONVERA platform, ingesting structured relational data across all 6 DSR stages and the cross-stage critique engine:

```mermaid
flowchart TD
    subgraph Relational State [CONVERA SQLite WAL Storage]
        StageA[Stage A: Problems & Assumptions]
        StageBC[Stage B & C: Scholarly Works & Claims]
        StageD[Stage D: 4 DSR Artifact Specs]
        StageE[Stage E: Rigor Evals & Circumscription Iterations]
        StageF[Stage F: Ethics RA 10173, SDGs, Budget, Gate Reviews]
        Critique[Phase C3: Table 36 Research Critiques & Score]
    end

    subgraph Core Export Engine [backend/engines/proposal_exporter.py]
        Aggregator[Relational Telemetry Aggregator]
        Provenance[SHA-256 Provenance Generator]
        MDGen[Markdown Generator]
        TexGen[LaTeX Generator & BibTeX Builder]
        HTMLGen[Self-Contained HTML / Print Generator]
        JSONGen[Provenance JSON Monograph Builder]
    end

    subgraph API Router [backend/routers/export.py]
        GET_Proposal[GET /api/export/dsr-proposal]
        POST_Compile[POST /api/export/compile]
    end

    subgraph Frontend UI [web/src/components/research/feasibility/]
        View[StageFFeasibilityView.tsx]
        FormatPills[Format Selector Pills: MD / LaTeX / BibTeX / HTML / JSON]
        PreviewArea[Multi-Format Preview Window]
        Downloader[1-Click Download & Copy Actions]
    end

    Relational State --> Aggregator
    Aggregator --> Provenance
    Provenance --> MDGen & TexGen & HTMLGen & JSONGen
    MDGen & TexGen & HTMLGen & JSONGen --> GET_Proposal & POST_Compile
    GET_Proposal & POST_Compile --> FormatPills --> PreviewArea & Downloader
```

---

## 2. Component Design & Modifications

### 2.1 Backend Data Models (`backend/models/export.py`)
- Define `ExportFormat` enum: `MARKDOWN`, `LATEX`, `BIBTEX`, `HTML`, `JSON`, `BUNDLE`.
- Define `ProposalSection` enum: `COVER_METADATA`, `PROBLEM_SCOUTING`, `THEORETICAL_GROUNDING`, `LITERATURE_MATRIX`, `EVALUATION_CIRCUMSCRIPTION`, `ETHICS_FEASIBILITY`, `GATE_REVIEWS`, `CRITIQUE_AUDIT`, `BIBLIOGRAPHY`.
- Define `DSRProposalCompilationRequest`:
  - `project_id: str`
  - `session_id: Optional[str]`
  - `format: ExportFormat = ExportFormat.MARKDOWN`
  - `include_sections: Optional[List[ProposalSection]]`
  - `target_document_class: str = "article"` (for LaTeX: `article`, `report`, `ieeeconf`)
- Define `DSRProposalCompilationResponse`:
  - `project_id: str`
  - `session_id: Optional[str]`
  - `format: ExportFormat`
  - `content: str`
  - `auxiliary_files: Dict[str, str]` (e.g. `references.bib` for LaTeX)
  - `provenance_hash: str`
  - `section_count: int`
  - `compiled_at: str`

### 2.2 Core Engine Upgrade (`backend/engines/proposal_exporter.py`)
Upgrade `ProposalExporter` to support:
1. **Critique Synthesis**:
   - Query `storage.list_critique_records(session_id=session_id)` and calculate consistency score.
   - Aggregate fatal/critical flaws, kill questions, and human resolution notes.
2. **LaTeX Generation (`_compile_latex`)**:
   - Generates clean, standard LaTeX markup.
   - BibTeX citation mappings: Generates citation keys (e.g., `santos2024tropical`, `reyes2025embedded`) and outputs matching `references.bib`.
   - Math equations ($X, Y, C$) and `booktabs` tables.
3. **Printable HTML Generation (`_compile_html`)**:
   - Generates a standalone single-file HTML document with CSS, typography, responsive cards, and `@media print` rules.
4. **JSON Monograph Generation (`_compile_json`)**:
   - Structured JSON export including complete raw entity data trees.
5. **Deterministic Provenance Digest**:
   - Computes SHA-256 hash of canonical JSON string of aggregated stage data.

### 2.3 API Router (`backend/routers/export.py`)
- Upgrade `GET /api/export/dsr-proposal` to accept query params `format` and `session_id`.
- Add `POST /api/export/compile` accepting `DSRProposalCompilationRequest`.
- Add `GET /api/export/bibtex` for direct `.bib` file retrieval.

### 2.4 Research Orchestrator (`backend/services/research_orchestrator.py`)
- Map `ActionType.EXPORT_PROPOSAL` to call `ProposalExporter.compile_proposal()`.

### 2.5 Frontend Integration (`web/src/components/research/feasibility/StageFFeasibilityView.tsx`)
- Enhance TAB 4 (Living Proposal Canvas) to provide:
  - Format selector pills: `Markdown (.md)`, `LaTeX (.tex)`, `BibTeX (.bib)`, `Printable HTML (.html)`, `Provenance JSON (.json)`.
  - Format-specific syntax preview.
  - Download buttons tailored to the active format (e.g., download `.tex`, `.bib`, `.html`, `.md`, `.json`).
  - "Print to PDF" direct browser trigger for the HTML format.
- Add client helper in `web/src/services/exportService.ts`.

---

## 3. Verification Protocol
1. **Unit & Integration Tests (`backend/tests/test_proposal_exporter.py`)**:
   - LaTeX syntax validation: Verify document structure (`\documentclass`, `\begin{document}`, `\maketitle`, `\end{document}`).
   - BibTeX generation: Verify valid BibTeX syntax (`@article{...}`, `@inproceedings{...}`).
   - HTML generation: Verify standalone doctype, embedded CSS, and `@media print`.
   - Provenance hashing: Verify deterministic SHA-256 calculation.
   - Full 7-section content coverage (including Stage F and Critique Audit).
2. **Regression Suite**:
   - Run `pytest backend/tests/ -m "not live"` (ensure 309+ tests remain passing).
3. **Frontend Verification**:
   - Run `npm run typecheck --prefix web`.
   - Run `npm run build --prefix web`.
4. **Knowledge Graph Sync**:
   - Run `graphify update .`.
