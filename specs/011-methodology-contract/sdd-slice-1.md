# SOFTWARE DESIGN DOCUMENT (SDD) — VERTICAL SLICE 1 (REVISION 01)
## Document Identifier: SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01
**Title**: Methodology Contract Architecture — Vertical Slice 1: Contract Definition & Workflow Runtime Parameterization  
**Classification**: Tier 2 Software Design Document (SDD Candidate)  
**Governing Standard**: CONVERA Concept Development Standard (CCDS v2.0) — *“Knowledge != Workflow”*  
**Parent Architectural Authority**: `ADR-METHODOLOGY-CONTRACT-001-REV-01` (Accepted 2026-09-06)  
**Baseline Git Commit**: `a63249c` (`main`)  
**Document Status**: 🟡 CANDIDATE — PENDING HUMAN LEADERSHIP REVIEW (IMPLEMENTATION NOT AUTHORIZED)  
**Working Branch**: None (Branch creation NOT authorized)  

---

## 1. GOVERNANCE MANDATE & IMPLEMENTATION NOTICE

```text
================================================================================
CRITICAL GOVERNANCE NOTICE: CANDIDATE SPECIFICATION ONLY
================================================================================
This document is a READ-ONLY Software Design Document candidate derived from the 
human-accepted ADR-METHODOLOGY-CONTRACT-001-REV-01.

IT DOES NOT CONSTITUTE AUTHORIZATION TO WRITE CODE, CREATE BRANCHES, MODIFY 
DATABASES, ALTER APIS, MUTATE WORKFLOW RUNTIMES, OR DEPLOY.

Implementation remains strictly unauthorized until Human Leadership formally
ratifies this SDD and issues explicit Human Implementation Authorization.
================================================================================
```

### Epistemic Categorization Framework
To maintain documentation integrity and prevent conflating decisions with assumptions:
- **`[VERIFIED FACT]`**: Empirical truth directly verified in baseline commit `a63249c`.
- **`[ARCHITECTURAL INFERENCE]`**: Logical deduction derived from verified facts and design rules.
- **`[RECOMMENDATION]`**: Proposed implementation choice for this vertical slice.
- **`[TARGET]`**: Strategic architectural direction approved in the ADR.
- **`[UNKNOWN]`**: Open design question deferred to future specifications.

---

## 2. VERTICAL SLICE 1: BOUNDARY & OBJECTIVES

### 2.1 Why This Is the Smallest Justified Vertical Slice

In accordance with the principle of minimal risk and incremental evolution, **Vertical Slice 1** addresses the primary architectural debt identified in `a63249c` without expanding into frontend layout refactoring or dynamic UI generation.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     VERTICAL SLICE 1 SCOPE BOUNDARY                     │
├────────────────────────────────────┬────────────────────────────────────┤
│           IN SCOPE (Tier 1)        │       EXCLUDED / DEFERRED          │
├────────────────────────────────────┼────────────────────────────────────┤
│ 1. Minimal Methodology Contract    │ 1. Frontend layout / page.tsx refactor│
│    semantic models (backend)       │ 2. PipelineStepper generalization   │
│ 2. Innovation & Research contract  │ 3. Workspace component registry    │
│    compatibility implementations   │ 4. Database schema alterations     │
│ 3. Parameterization of             │ 5. API endpoint changes (/api/*)   │
│    WorkflowTransitionService       │ 6. Dynamic UI / Form generation    │
│ 4. Regression test harness for     │ 7. Asynchronous external review    │
│    transition parity verification  │ 8. Generalized non-linear topology │
└────────────────────────────────────┴────────────────────────────────────┘
```

### 2.2 Core Objectives of Slice 1
1. **Eliminate Hardcoded Transition Dictionaries**: Replace module-level `RESEARCH_GATE_MAP`, `INNOVATION_GATE_MAP`, `RESEARCH_SEQUENCE`, and `INNOVATION_SEQUENCE` in [`backend/services/workflow_transition_service.py`](file:///home/markc/projects/active/CONVERA/backend/services/workflow_transition_service.py) with declarative lookups driven by a strongly-typed methodology contract.
2. **Harmonize Framework Models**: Bridge the existing declarative models in [`backend/engines/framework_engine.py`](file:///home/markc/projects/active/CONVERA/backend/engines/framework_engine.py) with the operational workflow state machine.
3. **Behavioral Parity**: Preserve exact transition, validation, and error behavior for Innovation and Research workflows.
4. **Zero Consumer Impact**: Zero changes to frontend components, HTTP API schemas, or SQLite database tables.

---

## 3. CONTRACT & GOVERNANCE BOUNDARIES

To ensure clean separation of concerns and prevent contract over-reach, responsibilities are partitioned strictly:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          METHODOLOGY CONTRACT                           │
│   (Process Topology & Methodology-Specific Workflow Rules, Stages, Gates)│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ consumed by
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            WORKFLOW RUNTIME                             │
│   (Execution of Authorized Workflow Transitions & Monotonic Ratchet)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ references
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            EPISTEMIC DOMAIN                             │
│      (Claims, Evidence, Citations, Assumptions & Truth Semantics)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ persisted by
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION POLICY                            │
│   (Session Lifecycle, Authoritative Single-Writer Storage, Security)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ visualized by
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION                               │
│        (Methodology-Aware Shell & Bespoke Handcrafted Workspaces)       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Boundary Invariant
`[ARCHITECTURAL INFERENCE]`: `GateContract` **must not** become a container for unrelated epistemic, UI, persistence, or application-policy semantics. A gate contract declares only the transition checkpoint, the expected gate ID, the evaluator role, and the required evidence type identifiers. It does not own or evaluate truth semantics.

---

## 4. SEMANTIC METHODOLOGY CONTRACT SPECIFICATION

### 4.1 Proposed Data Architecture (`backend/contracts/methodology.py`)

The contract defines a pure semantic interface for defining methodologies, stages, gates, and transitions.

```python
"""
CONVERA Methodology Contract Specification
Governed by CCDS v2.0: Knowledge != Workflow
"""
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field


class GateVerdict(str, Enum):
    PASS = "PASSED"
    REVISE = "REVISE"
    HOLD = "HOLD"
    FAIL = "FAILED"


class StageContract(BaseModel):
    """Semantic definition of a single methodology stage."""
    id: str
    number: int
    code: str                     # e.g. "Phase 1", "Stage A"
    label: str                    # e.g. "Problem Discovery"
    short_description: str
    gate_id: Optional[str] = None # Expected gate for clearance, if any
    required_activities: List[str] = Field(default_factory=list)
    output_artifacts: List[str] = Field(default_factory=list)


class GateContract(BaseModel):
    """Semantic definition of a stage clearance gate."""
    id: str                       # e.g. "GATE_1"
    name: str
    stage_id: str                 # Stage to which this gate belongs
    evaluator_role: str = "FOUNDER_AND_PANEL"
    required_evidence_types: List[str] = Field(default_factory=list)
    passing_criteria_descriptions: List[str] = Field(default_factory=list)


class MethodologyContract(BaseModel):
    """Top-level semantic contract for a methodology track."""
    id: str                       # Unique identifier: "INNOVATION", "RESEARCH"
    name: str
    version: str                  # Semver: "3.0.0"
    governing_standard: str = "CCDS v2.0"
    stages: List[StageContract]
    gates: List[GateContract]
    stage_sequence: List[str]     # Ordered list of stage_ids + terminal ["studio"]
    gate_map: Dict[str, str]      # Mapping: stage_id -> gate_id

    def get_expected_gate(self, stage_id: str) -> Optional[str]:
        """Returns the expected gate ID for the given stage, if required."""
        return self.gate_map.get(stage_id)

    def get_next_stage(self, current_stage_id: str) -> str:
        """Resolves the next stage ID in sequence upon gate passage."""
        try:
            curr_idx = self.stage_sequence.index(current_stage_id)
            if curr_idx + 1 < len(self.stage_sequence):
                return self.stage_sequence[curr_idx + 1]
            return "studio"
        except ValueError:
            return "studio"

    def has_stage(self, stage_id: str) -> bool:
        """Validates if a stage belongs to this methodology."""
        return stage_id in self.stage_sequence or stage_id == "studio"
```

### 4.2 Compatibility Implementation: Innovation Track (`INNOVATION_CONTRACT`)

Reconciles the 5-phase venture exploration methodology:

```python
INNOVATION_CONTRACT = MethodologyContract(
    id="INNOVATION",
    name="Venture Innovation & Opportunity Validation Framework",
    version="3.0.0",
    governing_standard="CCDS v2.0",
    stage_sequence=[
        "p1_discovery",
        "p2_screening",
        "p3_mom_test",
        "p4_mechanism",
        "p5_economics",
        "studio",
    ],
    gate_map={
        "p2_screening": "GATE_1",
        "p3_mom_test": "GATE_2",
        "p5_economics": "GATE_3",
    },
    stages=[
        StageContract(id="p1_discovery", number=1, code="Phase 1", label="Regional Problem Discovery", short_description="Discover socio-economic friction..."),
        StageContract(id="p2_screening", number=2, code="Phase 2", label="Screening, Sizing & Decision Room", gate_id="GATE_1", short_description="10-column screening matrix..."),
        StageContract(id="p3_mom_test", number=3, code="Phase 3", label="Socratic Mom Test Validation", gate_id="GATE_2", short_description="Founder conversational interview..."),
        StageContract(id="p4_mechanism", number=4, code="Phase 4", label="Solution Concept & Mechanism", short_description="Mechanism canvas & architecture..."),
        StageContract(id="p5_economics", number=5, code="Phase 5", label="Unit Economics & Viability", gate_id="GATE_3", short_description="Lean economics testing..."),
    ],
    gates=[
        GateContract(id="GATE_1", name="Gate 1: Problem Screening Clearance", stage_id="p2_screening"),
        GateContract(id="GATE_2", name="Gate 2: Mom Test Validation Clearance", stage_id="p3_mom_test"),
        GateContract(id="GATE_3", name="Gate 3: Economic Viability Clearance", stage_id="p5_economics"),
    ]
)
```

### 4.3 Compatibility Implementation: Research Track (`RESEARCH_CONTRACT`)

Reconciles the 6-stage Design Science Research methodology:

```python
RESEARCH_CONTRACT = MethodologyContract(
    id="RESEARCH",
    name="Computing Research & Concept Development Process (CRCDP)",
    version="1.0.0",
    governing_standard="CCDS v2.0",
    stage_sequence=[
        "stage_a_scouting",
        "stage_b_validation",
        "stage_c_opportunity",
        "stage_d_formulation",
        "stage_e_evaluation",
        "stage_f_feasibility",
        "studio",
    ],
    gate_map={
        "stage_b_validation": "GATE_1",
        "stage_c_opportunity": "GATE_2",
        "stage_e_evaluation": "GATE_3",
        "stage_f_feasibility": "GATE_4",
    },
    stages=[
        StageContract(id="stage_a_scouting", number=1, code="Stage A", label="Domain Scouting & Problem Identification", short_description="Domain exploration..."),
        StageContract(id="stage_b_validation", number=2, code="Stage B", label="Academic Grounding & Gap Analysis", gate_id="GATE_1", short_description="Literature citation analysis..."),
        StageContract(id="stage_c_opportunity", number=3, code="Stage C", label="Opportunity Framing & Thesis Formulation", gate_id="GATE_2", short_description="Research opportunity definition..."),
        StageContract(id="stage_d_formulation", number=4, code="Stage D", label="Artifact Formulation & Design Synthesis", short_description="Design science formulation..."),
        StageContract(id="stage_e_evaluation", number=5, code="Stage E", label="Controlled Evaluation & Rigor Assessment", gate_id="GATE_3", short_description="Empirical benchmark evaluation..."),
        StageContract(id="stage_f_feasibility", number=6, code="Stage F", label="Feasibility Analysis & Defense Readiness", gate_id="GATE_4", short_description="Technical defense readiness..."),
    ],
    gates=[
        GateContract(id="GATE_1", name="Gate 1: Academic Grounding Clearance", stage_id="stage_b_validation"),
        GateContract(id="GATE_2", name="Gate 2: Opportunity Clearance", stage_id="stage_c_opportunity"),
        GateContract(id="GATE_3", name="Gate 3: Evaluation Rigor Clearance", stage_id="stage_e_evaluation"),
        GateContract(id="GATE_4", name="Gate 4: Feasibility Clearance", stage_id="stage_f_feasibility"),
    ]
)
```

---

## 5. WORKFLOW TRANSITION SERVICE PARAMETERIZATION SPECIFICATION

### 5.1 Parameterization Logic in `WorkflowTransitionService`

In [`backend/services/workflow_transition_service.py`](file:///home/markc/projects/active/CONVERA/backend/services/workflow_transition_service.py):

#### Step 1: Replace Hardcoded Maps with Registry Lookup
```python
from contracts.methodology import get_methodology_contract

# Remove lines 22-52 (RESEARCH_GATE_MAP, INNOVATION_GATE_MAP, etc.)

class WorkflowTransitionService:
    def __init__(self, storage=None, contract_resolver=None):
        self.storage = storage or get_storage()
        self.contract_resolver = contract_resolver or get_methodology_contract
```

#### Step 2: Contract-Driven Stage & Gate Evaluation (Lines 78–101)
```python
        # Step 1: Load Current Workflow
        raw_framework_id = session.get("framework_id") or stage_progress.get("framework_id")
        
        # Controlled failure on missing/empty framework identity
        if not raw_framework_id or not str(raw_framework_id).strip():
            raise ValueError("Methodology framework identity is missing or empty for this session")

        framework_id = str(raw_framework_id).strip().upper()
        
        # Resolve Contract (Controlled failure on unrecognized framework)
        contract = self.contract_resolver(framework_id)
        if not contract:
            raise ValueError(f"Unknown or unsupported methodology framework: '{framework_id}'")

        # Step 2: Identify Current Stage & Validate
        current_stage_id = stage_progress.get("current_stage_id")
        stages = stage_progress.get("stages", {})

        if not contract.has_stage(stage_id):
            raise ValueError(f"Stage '{stage_id}' is not recognized for framework '{framework_id}'")

        # Step 3: Identify Expected Gate for Current Stage
        expected_gate = contract.get_expected_gate(stage_id)
        if not expected_gate:
            raise ValueError(f"Stage '{stage_id}' does not require a quality gate transition in framework '{framework_id}'")

        # Step 4: Verify Submitted Gate Matches Expected Gate
        if gate_id.upper() != expected_gate.upper():
            raise ValueError(
                f"Gate mismatch: submitted gate '{gate_id}' does not match expected gate '{expected_gate}' for stage '{stage_id}'"
            )
```

#### Step 3: Contract-Driven Next Stage Advancement (Lines 146–152)
```python
        # Step 7: Transition Workflow State
        stages[stage_id]["status"] = "COMPLETED"
        stages[stage_id]["gate_status"] = "PASSED"
        stages[stage_id]["completed_at"] = datetime.now(timezone.utc).isoformat()

        # Resolve next stage via contract
        next_stage_id = contract.get_next_stage(stage_id)

        if next_stage_id != "studio" and next_stage_id in stages:
            stages[next_stage_id]["status"] = "IN_PROGRESS"
            stages[next_stage_id]["started_at"] = datetime.now(timezone.utc).isoformat()

        stage_progress["current_stage_id"] = next_stage_id
        session["current_stage_id"] = next_stage_id
        session["stage_progress"] = stage_progress
```

---

## 6. PRECISE PARITY DEFINITION & COMPATIBILITY BOUNDARIES

### 6.1 Behavioral Parity Contract
`[ARCHITECTURAL INFERENCE]`: Rather than generic "100% equivalence", parity for Vertical Slice 1 is explicitly defined across the following seven behavioral facets:

1. **Accepted Transitions**: A submitted gate review with verdict `PASSED` advances the workflow to the identical next stage ID as produced by baseline `a63249c`.
2. **Rejected Transitions**: Gate mismatches, missing gate reviews, or non-passing verdicts (`REVISE`, `HOLD`, `FAILED`) leave the stage in the identical state as baseline `a63249c`.
3. **Gate Requirements**: Every stage in Innovation and Research enforces the identical expected gate identifier.
4. **Stage Progression**: Progression metadata (`status`, `gate_status`, `completed_at`, `started_at`) is mutated identically in `stage_progress`.
5. **Specified Error Behavior**: Missing sessions, unrecognized stages, ungated stage transition requests, gate mismatches, and unrecorded gate reviews raise identical exception classes with specified error messaging.
6. **Persisted Workflow State**: Atomic write of canonical `stage_progress` to SQLite session persistence occurs through the authoritative persistence adapter.
7. **Legacy Projection Behavior**: Compatibility flags (`phase1_complete`..`phase5_complete`) are projected identically by the persistence adapter.

> **Parity Invariant**:  
> *"Parity does not require preservation of undocumented defects."*

### 6.2 Existing Session Compatibility Baseline
- `[VERIFIED FACT]`: Baseline inspection of `backend/convera.db` measured exactly **13 active sessions** present at commit `a63249c`.
- `[ARCHITECTURAL INFERENCE]`: The specific count (13) is a preflight measurement, not an architectural invariant.
- **Session Compatibility Invariant**: All sessions present at the migration/test baseline must remain readable and behaviorally compatible without destructive mutation, following deterministic compatibility rules.

### 6.3 Epistemic Boundary Invariant
`[ARCHITECTURAL INFERENCE]`: **No epistemic semantics, evidence authority, confidence calculation, or LLM governance behavior may change as a result of this SDD.** The existing epistemic system remains unchanged and outside implementation scope.

---

## 7. IMPLEMENTATION DECISIONS REQUIRING HUMAN RATIFICATION

Before implementation authorization, Human Leadership must review and ratify the following technical choices:

### Decision Q-1: Contract Code Placement
- **Option A (Recommended)**: Create `backend/contracts/methodology.py` to house `MethodologyContract`, `StageContract`, `GateContract`, and compatibility instances.
- **Option B**: Co-locate inside `backend/engines/framework_engine.py` by refactoring existing models.
- *Trade-off*: Option A keeps pure contract definitions cleanly separated from engine evaluation logic, adhering to CCDS layering.

### Decision Q-2: Registry Scope & Resolution Strategy
- **Option A (Recommended for Slice 1)**: Static dictionary registry in `contracts/methodology.py`:
  `METHODOLOGY_REGISTRY: Dict[str, MethodologyContract] = {"INNOVATION": INNOVATION_CONTRACT, "RESEARCH": RESEARCH_CONTRACT}`.
- **Option B**: Dynamic resolver class with factory lookup.
- *Scope Note*: **This is an implementation choice for this vertical slice, not a ratified permanent registry architecture.** The ADR's unresolved static-vs-dynamic registry decision remains unresolved beyond this slice (`[UNKNOWN]`).

### Decision Q-3: Topology Scope
- **Option A (Recommended for Slice 1)**: Linear sequence array with gate map (`stage_sequence: List[str]`, `gate_map: Dict[str, str]`).
- **Scope Clarification**:
  - Vertical Slice 1 uses the existing linear topology of Innovation and Research because those are the currently supported methodologies.
  - The implementation preserves current linear behavior for these two tracks.
  - The contract abstraction must not preclude future governed branching or non-linear topology.
  - Generalized non-linear topology remains `[UNKNOWN]`/deferred under the ADR.

### Decision Q-4: Unknown & Missing Methodology Identity Handling
- **Ratified Rule**:
  - **New/Explicit Requests**: Missing or empty `framework_id` fails deterministically with `ValueError("Methodology framework identity is missing or empty for this session")`.
  - **Unrecognized Methodology**: Unrecognized string fails deterministically with `ValueError("Unknown or unsupported methodology framework: '{framework_id}'")`.
  - **No Silent Fallback**: No silent default may convert an unknown methodology into Innovation.
  - **Legacy Sessions**: Stored legacy sessions pre-dating explicit framework tagging are characterized via an explicit, deterministic compatibility mapping during session load, rather than a silent runtime fallback. (No new migration implementation is introduced in this SDD).

---

## 8. TEST & VERIFICATION PROTOCOL

1. **Existing Test Suite Baseline**:
   - Run full backend pytest suite (all 179 tests must pass with 0 failures).
2. **New Methodology Contract Unit Tests (`backend/tests/test_methodology_contracts.py`)**:
   - Verify `INNOVATION_CONTRACT` and `RESEARCH_CONTRACT` definitions.
   - Verify `get_expected_gate()` and `get_next_stage()`.
   - Verify deterministic failure on missing or unrecognized `framework_id`.
3. **Workflow Transition Parameterization Tests (`backend/tests/test_workflow_transition_service_contracts.py`)**:
   - Test all Innovation stage transitions against parity requirements.
   - Test all Research stage transitions against parity requirements.
   - Test Negative Cases: Gate mismatch rejection, non-existent stage rejection, unrecorded gate review rejection, REVISE/FAIL handling.
4. **Frontend Type & Build Verification**:
   - Execute `npm run typecheck` and `npm run build` to confirm zero regression in web consumers.

---

## 9. REPOSITORY STATUS & HOLD NOTICE

- **Current Branch**: `main`
- **HEAD Commit**: `a63249c` (`merge: promote SPEC-TECH-DEBT-CCDS-001 (Phases 1-3 & Amendment 01) to main`)
- **Working Tree**: Clean (`nothing to commit, working tree clean`).
- **Code Mutations**: Exactly 0 source files modified.
- **Database**: All 23 SQLite tables intact.

```text
================================================================================
NEXT GOVERNANCE GATE: HUMAN SDD REVIEW & RATIFICATION
================================================================================
Current State:        SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01 Produced
Next Action:          STOPPED — Awaiting Human Leadership Review and Ratification
Implementation Code:  HOLD (Not Authorized)
Branch Creation:      HOLD (Not Authorized)
================================================================================
```
