# CONVERA Verification Checklist: SDD-022
# Interactive Evidence Chain Visualization & Provenance Graph (Phase D2)

**Specification ID**: `CONVERA-SDD-022`  
**Feature Title**: Interactive Evidence Chain Visualization & Provenance Graph Engine  
**Authority Tier**: Tier 2 (Quality & Verification Checklist)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  

---

## 1. Constitutional Invariants Checklist

- [ ] **CHK-022-01 (Article VII Anti-Creep Law)**: Zero new dependencies added to `backend/pyproject.toml` or `web/package.json`. Visual DAG rendered using native SVG and existing CSS/animation libraries.
- [ ] **CHK-022-02 (Article I Grounding & Article II Tri-Part Confidence)**: Every node and edge in the graph corresponds 1:1 to verified SQLite WAL database records. No synthetic or hallucinated relations.
- [ ] **CHK-022-03 (Article IV Human Sovereignty)**: Interactive filtering, edge inspection, and export are fully user-controlled without automated state modifications.
- [ ] **CHK-022-04 (Article VIII Degraded Resilience)**: Graph engine operates 100% offline using local SQLite queries.

---

## 2. Backend Graph Engine & API Verification

- [ ] **CHK-022-05 (Tier Allocation)**: Graph engine correctly maps entities into Tiers 0 through 5 (`scholarly_works` -> 0, `claims` -> 1, `assumptions` -> 2, `dsr_artifacts` -> 3, `concept_evaluations` -> 4, `feasibility` -> 5).
- [ ] **CHK-022-06 (Evidentiary Edge Linking)**: Relationships (`SUPPORTS`, `CONTRADICTS`, `EXTENDS`, `DERIVES`, `GROUNDS`, `EVALUATES`, `SYNTHESIZES`) are accurately extracted from junction and foreign key tables.
- [ ] **CHK-022-07 (Contradiction & Tension Detection)**: Contradicting evidence links are flagged with `is_contradiction = True` and counted in `contradiction_count`.
- [ ] **CHK-022-08 (Orphan Detection)**: Nodes without incident edges are identified and reported in `orphaned_nodes_count`.
- [ ] **CHK-022-09 (Cryptographic State Hash)**: Graph generation outputs a deterministic SHA-256 hash over canonical JSON structure.
- [ ] **CHK-022-10 (REST Endpoint Validation)**: `GET /api/provenance/graph` correctly supports filtering by `min_confidence`, `stages`, and `include_orphans`.
- [ ] **CHK-022-11 (Canonical Export)**: `GET /api/provenance/export/{session_id}` returns valid verifiable JSON payload.

---

## 3. Frontend Canvas & UX Verification

- [ ] **CHK-022-12 (Deterministic SVG Layout)**: Coordinates $(x, y)$ are laid out in distinct vertical columns by tier with non-overlapping node cards.
- [ ] **CHK-022-13 (Curved Bézier Connectors)**: Evidentiary edges render smooth cubic Bézier curves between source and target anchors.
- [ ] **CHK-022-14 (Contradiction Highlighting)**: Contradicting links render with distinct warning styling (rose/amber dash pattern).
- [ ] **CHK-022-15 (Interactive Pan & Zoom)**: Canvas supports mouse wheel / drag panning and zoom controls with 60fps responsiveness.
- [ ] **CHK-022-16 (Node Inspector Drawer)**: Clicking any node opens side flyout displaying verbatim excerpts, DOI links, confidence gauges, and direct upstream/downstream connections.
- [ ] **CHK-022-17 (Cockpit Integration)**: "Evidence Chain" button in `ResearchCockpit` header opens interactive visualization seamlessly.
- [ ] **CHK-022-18 (SVG / JSON Export)**: Researchers can download graph as vector SVG or canonical JSON file.

---

## 4. Static Typing & Regression Verification

- [ ] **CHK-022-19 (Frontend Static Typing)**: `npm run typecheck --prefix web` exits with 0 errors.
- [ ] **CHK-022-20 (Frontend Production Build)**: `npm run build --prefix web` completes successfully.
- [ ] **CHK-022-21 (Backend Pytest Regression)**: Full test suite passes 100% offline (`pytest -m "not live"` — expanding from 324 baseline).
- [ ] **CHK-022-22 (Knowledge Graph AST Sync)**: `graphify update .` runs cleanly without errors.
