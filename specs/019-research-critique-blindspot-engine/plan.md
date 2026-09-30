# CONVERA SDD-019: Technical Plan & Architecture
# Cross-Stage Research Critique & Blind-Spot Engine (Phase C3)

**Specification ID**: CONVERA-SDD-019  
**Feature Title**: Cross-Stage Research Critique & Blind-Spot Engine  
**Authority Tier**: Tier 2 (Technical Plan)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  
**Target Feature Branch**: `feature/019-research-critique-blindspot-engine`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `8ada2a7`  

---

## 1. Architectural Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CrossStageCritiqueEngine                             │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Relational State Aggregator                    │   │
│   │  Stage A: problems                                             │   │
│   │  Stage C: scholarly_works, claim_evidence_links                 │   │
│   │  Stage D: dsr_artifacts                                        │   │
│   │  Stage E: concept_evaluations, circumscription_iterations      │   │
│   │  Stage F: research_feasibility_records                         │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                   │
│            ┌───────────────────────┴───────────────────────┐            │
│            ▼                                               ▼            │
│   ┌────────────────────────────────┐              ┌────────────────┐   │
│   │ Deterministic Heuristic Rules  │              │ Gemini AI Meta │   │
│   │ - Metric failure unaddressed   │              │ Advisory Layer │   │
│   │ - Budget vs Hardware mismatch  │              │ - Kill questions│  │
│   │ - Thermal/quantization tension │              │ - Lethal flaw  │   │
│   └────────────────┬───────────────┘              └────────┬───────┘   │
│                    │                                       │           │
│                    └───────────────────┬───────────────────┘           │
│                                        ▼                               │
│                         Table 36: research_critiques                   │
└────────────────────────────────────────┬───────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      /api/critique/* Router                     ResearchOrchestrator
      (Evaluation & Resolution)                  (Action Dispatch)
                   │
                   ▼
      CritiqueDeckDrawer.tsx & CrossStageCritiqueCard.tsx
```

---

## 2. Component Design & Responsibilities

### 2.1 Storage Adapter & Relational Schema (Table 36)
- **Table Name**: `research_critiques`
- **Primary Key**: `id` (`TEXT`)
- **Foreign Keys**: `session_id REFERENCES sessions(session_id)`, `project_id REFERENCES projects(id)`
- **Columns**:
  - `id`: Unique critique ID (e.g. `CRIT-STAGE-001`)
  - `session_id`: Active session identifier
  - `project_id`: Project identifier
  - `critique_type`: `CROSS_STAGE_BLIND_SPOT` | `EVIDENCE_VULNERABILITY` | `CIRCUMSCRIPTION_TENSION` | `ETHICS_FEASIBILITY_DISCORD`
  - `severity`: `FATAL` | `CRITICAL` | `WARNING` | `ADVISORY`
  - `target_stages_json`: JSON list of stage codes involved (e.g. `["STAGE_C", "STAGE_E"]`)
  - `cross_stage_claims_json`: JSON list of claim excerpts illustrating the tension
  - `fatal_flaw_summary`: Description of the systemic gap or contradiction
  - `kill_question`: Lethal adversarial inquiry
  - `mitigation_recommendation`: Remedial action suggested to harden the research
  - `plausibility_score`: Real $[0.0, 100.0]$
  - `status`: `OPEN` | `RESOLVED` | `DISMISSED`
  - `resolution_notes`: Attributable human explanation of resolution/dismissal
  - `created_at`: ISO 8601 UTC
  - `resolved_at`: ISO 8601 UTC

### 2.2 CrossStageCritiqueEngine (`backend/engines/cross_stage_critique_engine.py`)
- **Heuristic Detector**:
  - Checks if Stage E `circumscription_iterations` contains failure modes that target loopbacks to Stage D or Stage A that have not been revised.
  - Checks if Stage D `primary_artifact` kernel theory or latency goals conflict with empirical observations in Stage E.
  - Checks if Stage F budget is under-resourced compared to sample size / equipment defined in Stage E.
- **Inverted AI Adversary**:
  - Uses `llm_gateway.generate_with_meta` with `TaskCategory.ADVERSARIAL_CRITIQUE`.
  - Formulates clinical fatal kill questions.
  - Fallback: deterministic heuristic critique generation when offline (`is_degraded = True`).
- **Mathematical Epistemic Consistency Score**:
  $$\text{Consistency} = \max(0.0, 100.0 - (25.0 \times N_{\text{fatal}} + 15.0 \times N_{\text{critical}} + 8.0 \times N_{\text{warning}} + 3.0 \times N_{\text{advisory}}))$$

### 2.3 API Router (`backend/routers/critique.py`)
- `POST /api/critique/evaluate`: Triggers cross-stage audit for a session/project.
- `GET /api/critique/session/{session_id}`: Retrieves all stored critiques and epistemic consistency summary.
- `POST /api/critique/resolve`: Resolves or dismisses a critique with mandatory human notes.

### 2.4 Orchestrator Integration (`backend/services/research_orchestrator.py`)
- Updates `ActionType.CROSS_EXAMINE_EVIDENCE` and `ActionType.STRESS_TEST_PROBLEM` handlers to execute `CrossStageCritiqueEngine.evaluate_cross_stage_critique()`.

### 2.5 Frontend Presentation Layer (`web/src/components/research/critique/`)
- `CritiqueAuditDeck.tsx`: CCDS v2.0 drawer / scorecard presenting:
  - Epistemic Consistency Gauge $[0..100\%]$
  - Severity Badges (`FATAL`, `CRITICAL`, `WARNING`, `ADVISORY`)
  - Stage Tension Connectors (e.g. `Stage C` $\leftrightarrow$ `Stage E`)
  - Fatal Kill Questions with interactive Resolve/Dismiss modal with mandatory rationale text.
