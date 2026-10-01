# CONVERA Implementation Plan: SDD-022
# Interactive Evidence Chain Visualization & Provenance Graph (Phase D2)

**Specification ID**: `CONVERA-SDD-022`  
**Feature Title**: Interactive Evidence Chain Visualization & Provenance Graph Engine  
**Authority Tier**: Tier 2 (Engineering Implementation Plan)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/022-evidence-chain-visualization`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `0fef8c6`  

---

## 1. Implementation Phases & Architecture Work Breakdown

```text
Phase 1: Domain Models & Graph Engine (Python)
    │
    ▼
Phase 2: FastAPI Router & Endpoint Integration
    │
    ▼
Phase 3: Backend Pytest Suite & Idempotency Tests
    │
    ▼
Phase 4: Frontend Types & Provenance Service Client (TypeScript)
    │
    ▼
Phase 5: CCDS v2.0 SVG DAG Canvas & Node Inspector Components
    │
    ▼
Phase 6: Research Cockpit Integration & Export Capabilities
    │
    ▼
Phase 7: Closed-Loop Verification, Regression & Promotion
```

---

## 2. Phase-by-Phase Technical Specifications

### Phase 1: Domain Models & Graph Engine
- **Files**:
  - `backend/models/provenance.py`
  - `backend/engines/provenance_graph_engine.py`
- **Responsibilities**:
  1. Define Pydantic models for `ProvenanceNode`, `ProvenanceEdge`, `ProvenanceGraphPayload`, `ProvenanceMetrics`.
  2. Implement `ProvenanceGraphEngine`:
     - Query SQLite storage across `scholarly_works`, `problem_claims`, `claim_evidence_links`, `problem_assumptions`, `dsr_artifacts`, `concept_evaluations`, and `research_feasibility_records`.
     - Assign canonical epistemic tiers (0 through 5).
     - Compute edge relationships:
       - `scholarly_works` $\rightarrow$ `problem_claims` (`SUPPORTS`, `CONTRADICTS`, `EXTENDS`).
       - `problem_claims` $\rightarrow$ `problem_assumptions` (`DERIVES`).
       - `problem_assumptions` / `claims` $\rightarrow$ `dsr_artifacts` (`GROUNDS`).
       - `dsr_artifacts` $\rightarrow$ `concept_evaluations` (`EVALUATES`).
       - `concept_evaluations` $\rightarrow$ `research_feasibility_records` (`SYNTHESIZES`).
     - Detect isolated/orphaned nodes and calculate graph health metrics (grounding density, contradiction ratio, average epistemic confidence).
     - Compute deterministic SHA-256 hash across canonical serialized graph data.

### Phase 2: FastAPI Router & Endpoints
- **Files**:
  - `backend/routers/provenance.py`
  - `backend/routers/__init__.py`
  - `backend/server.py`
- **Responsibilities**:
  1. Implement endpoints:
     - `GET /api/provenance/graph`: Query session DAG with optional filtering (`min_confidence`, `stages`, `include_orphans`).
     - `GET /api/provenance/node/{node_id}`: Detailed node ancestor/descendant inspection.
     - `GET /api/provenance/export/{session_id}`: Export canonical provenance JSON.
  2. Register router in `backend/server.py`.

### Phase 3: Backend Pytest Suite
- **Files**:
  - `backend/tests/test_provenance_graph.py`
- **Responsibilities**:
  1. Test graph construction with full multi-stage mock session.
  2. Test confidence threshold filtering and stage filtering.
  3. Test contradiction edge classification and orphan detection.
  4. Test SHA-256 graph digest consistency and reproducibility.

### Phase 4: Frontend Types & Service Client
- **Files**:
  - `web/src/types/provenanceGraph.ts`
  - `web/src/services/provenanceService.ts`
- **Responsibilities**:
  1. TypeScript interfaces mirroring backend Pydantic models.
  2. REST client methods with error handling and local caching.

### Phase 5: CCDS v2.0 DAG Canvas & Components
- **Files**:
  - `web/src/components/research/provenance/EvidenceChainGraph.tsx`
  - `web/src/components/research/provenance/ProvenanceNodeInspector.tsx`
  - `web/src/components/research/provenance/ProvenanceToolbar.tsx`
  - `web/src/components/research/provenance/index.ts`
- **Responsibilities**:
  1. **Deterministic Layered Layout Engine**: Computes SVG coordinates $(x, y)$ for tiered columns with node spacing and Bézier curve routing (`cubic-bezier`).
  2. **Interactive Controls**: Pan, zoom, reset view, stage chips, confidence slider.
  3. **Node Inspector Flyout**: Displays full citation details, claim verbatim excerpts, confidence badges, and ancestor/descendant chains.
  4. **Status Badges**: Visual indicator for contradictions (amber/rose pulse) and verified anchors (emerald/cyan glow).

### Phase 6: Research Cockpit Integration & Export
- **Files**:
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
  - `web/src/components/research/sessions/SessionResumeBanner.tsx`
- **Responsibilities**:
  1. Add "Evidence Chain" button / tab in `ResearchCockpit` header to view full session DAG.
  2. Add quick "Export DAG (SVG / JSON)" action in toolbar.

### Phase 7: Closed-Loop Verification & Promotion
- **Responsibilities**:
  1. Run full backend pytest suite (`pytest -m "not live"` — all existing + new tests passing).
  2. Run `npm run typecheck --prefix web` (0 errors).
  3. Run `npm run build --prefix web` (production build verified).
  4. Run `graphify update .` to keep knowledge graph current.
  5. Close all checklist items and merge to `develop` and `main`.
