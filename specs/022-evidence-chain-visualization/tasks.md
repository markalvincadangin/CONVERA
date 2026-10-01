# CONVERA Engineering Tasks: SDD-022
# Interactive Evidence Chain Visualization & Provenance Graph (Phase D2)

**Specification ID**: `CONVERA-SDD-022`  
**Feature Title**: Interactive Evidence Chain Visualization & Provenance Graph Engine  
**Authority Tier**: Tier 2 (Actionable Engineering Task Manifest)  
**Document Status**: 🟡 DRAFT / FORMULATED FOR HUMAN RATIFICATION  
**Target Feature Branch**: `feature/022-evidence-chain-visualization`  

---

## Task Matrix & Dependency Graph

```text
TASK-022-01 (Pydantic Models & Provenance Graph Engine)
    │
    ▼
TASK-022-02 (FastAPI Router & Endpoint Mounting)
    │
    ▼
TASK-022-03 (Backend Pytest Verification Suite)
    │
    ▼
TASK-022-04 (Frontend Types & Provenance Service Client)
    │
    ▼
TASK-022-05 (CCDS v2.0 SVG DAG Canvas & Node Inspector)
    │
    ▼
TASK-022-06 (Research Cockpit Integration & Export Actions)
    │
    ▼
TASK-022-07 (Integration, Regression & Closed-Loop Verification)
```

---

## Detailed Task Specifications

### TASK-022-01: Pydantic Schemas & Provenance Graph Engine
- **Files**:
  - `backend/models/provenance.py`
  - `backend/engines/provenance_graph_engine.py`
- **Actions**:
  1. Define Pydantic models: `ProvenanceNode`, `ProvenanceEdge`, `ProvenanceMetrics`, `ProvenanceGraphPayload`, `ProvenanceFilterQuery`.
  2. Implement `ProvenanceGraphEngine`:
     - Method `build_provenance_graph(session_id: str, filters: ProvenanceFilterQuery) -> ProvenanceGraphPayload`.
     - Extract entities from `scholarly_works`, `problem_claims`, `claim_evidence_links`, `problem_assumptions`, `dsr_artifacts`, `concept_evaluations`, and `research_feasibility_records`.
     - Link edges with semantic relationship types: `SUPPORTS`, `CONTRADICTS`, `EXTENDS`, `DERIVES`, `GROUNDS`, `EVALUATES`, `SYNTHESIZES`.
     - Calculate graph summary metrics (node/edge count, contradiction count, average confidence, grounding density, orphans).
     - Compute cryptographic SHA-256 state hash over canonical serialized graph.
- **Verification**: Unit tests on mock session data construct valid DAG and state hash.

---

### TASK-022-02: FastAPI Provenance Router & Mounting
- **Files**:
  - `backend/routers/provenance.py`
  - `backend/routers/__init__.py`
  - `backend/server.py`
- **Actions**:
  1. Implement FastAPI router with endpoints:
     - `GET /api/provenance/graph`: Query full session provenance graph with optional filtering.
     - `GET /api/provenance/node/{node_id}`: Deep node inspection with ancestor/descendant chains.
     - `GET /api/provenance/export/{session_id}`: Download canonical JSON provenance archive.
  2. Export router in `backend/routers/__init__.py` and mount in `backend/server.py`.
- **Verification**: Endpoints registered, route docs accessible at `/docs`.

---

### TASK-022-03: Backend Pytest Verification Suite
- **Files**:
  - `backend/tests/test_provenance_graph.py`
- **Actions**:
  1. Implement unit and integration tests:
     - `test_provenance_graph_empty_session`: Valid empty payload with default metrics.
     - `test_provenance_graph_multi_tier_traversal`: Complete 6-tier graph traversal from papers to proposals.
     - `test_provenance_contradiction_detection`: Verification of adversarial contradiction edges.
     - `test_provenance_filtering_confidence_and_stages`: Accurate filtering by confidence score and stage tags.
     - `test_provenance_state_hash_determinism`: Consistent SHA-256 digest across identical inputs.
     - `test_provenance_node_detail_endpoint`: Successful extraction of ancestor/descendant relationships.
  2. Run suite via pytest runner.
- **Verification**: `backend/.venv/bin/pytest backend/tests/test_provenance_graph.py -v` passes 100%.

---

### TASK-022-04: Frontend Types & Provenance Service Client
- **Files**:
  - `web/src/types/provenanceGraph.ts`
  - `web/src/services/provenanceService.ts`
- **Actions**:
  1. Define TypeScript types mirroring Pydantic schemas.
  2. Implement `provenanceService` with fetch methods: `getGraph()`, `getNodeDetails()`, `exportJson()`, `exportSvg()`.
- **Verification**: `npm run typecheck --prefix web` passes without type errors.

---

### TASK-022-05: CCDS v2.0 SVG DAG Canvas & Node Inspector Components
- **Files**:
  - `web/src/components/research/provenance/EvidenceChainGraph.tsx`
  - `web/src/components/research/provenance/ProvenanceNodeInspector.tsx`
  - `web/src/components/research/provenance/ProvenanceToolbar.tsx`
  - `web/src/components/research/provenance/index.ts`
- **Actions**:
  1. Implement deterministic layered layout algorithm (Sugiyama-style column ranking):
     - Compute column positions $x$ for Tiers 0-5.
     - Compute vertical positions $y$ with dynamic spacing based on node count.
  2. Implement native SVG rendering with smooth cubic Bézier curves for edges (`path d="M... C..."`).
  3. Implement `ProvenanceToolbar` with stage filter chips, confidence threshold slider, zoom controls, and export buttons.
  4. Implement `ProvenanceNodeInspector` slide-out drawer showing metadata, citations, excerpts, and ancestor/descendant paths.
  5. Apply CCDS v2.0 design tokens (slate/cyan/emerald theme, amber/rose contradiction pulse).
- **Verification**: Visual rendering renders cleanly with zero console warnings.

---

### TASK-022-06: Research Cockpit Integration & Export Actions
- **Files**:
  - `web/src/components/research/cockpit/ResearchCockpit.tsx`
  - `web/src/app/page.tsx`
- **Actions**:
  1. Add "Evidence Chain DAG" action / toggle in `ResearchCockpit` header.
  2. Embed `EvidenceChainGraph` as a dedicated inspection view or full-screen modal.
  3. Implement SVG export and JSON export triggers.
- **Verification**: Users can toggle between Cockpit stages and full Evidence Chain view seamlessly.

---

### TASK-022-07: Closed-Loop Verification & Promotion
- **Files**:
  - `specs/022-evidence-chain-visualization/audit-trail.md`
  - `specs/022-evidence-chain-visualization/checklist.md`
  - `docs/04-ai/AI_EVOLUTION_ROADMAP.md`
- **Actions**:
  1. Execute full backend pytest regression (`pytest -m "not live"`).
  2. Execute frontend static typecheck (`tsc --noEmit`).
  3. Execute Next.js production build (`next build`).
  4. Update knowledge graph (`graphify update .`).
  5. Close all checklist items and update audit trail.
  6. Git commit, merge to `develop`, and promote to `main`.
- **Verification**: All gates passed, 0 failures across entire workspace.
