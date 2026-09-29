# SOFTWARE DESIGN DOCUMENT (SDD) — VERTICAL SLICE 3 (CANDIDATE)
## Document Identifier: SPEC-METHODOLOGY-CONTRACT-003-SDD-03
**Title**: Methodology Contract Architecture — Vertical Slice 3: Unified Methodology Discovery API & Contract-Driven Frontend Parameterization  
**Classification**: Tier 2 Software Design Document (SDD Candidate)  
**Governing Standard**: CONVERA Concept Development Standard (CCDS v2.0) — *“Knowledge != Workflow”*  
**Parent Architectural Authority**: [`ADR-METHODOLOGY-CONTRACT-001-REV-01`](file:///home/markc/.gemini/antigravity-ide/brain/882f87f3-936c-4f17-a33c-850e59c66fc7/ADR-METHODOLOGY-CONTRACT-001-REV-01.md)  
**Predecessor SDDs**:  
- [`SPEC-METHODOLOGY-CONTRACT-001-SDD-01-REV-01`](file:///home/markc/projects/active/CONVERA/specs/011-methodology-contract/sdd-slice-1.md) (Vertical Slice 1 — Ratified, Implemented, Promoted to `main`)  
- [`SPEC-METHODOLOGY-CONTRACT-002-SDD-02-REV-01`](file:///home/markc/projects/active/CONVERA/specs/011-methodology-contract/sdd-slice-2.md) (Vertical Slice 2 — Ratified, Implemented, Promoted to `main`)  
**Predecessor Discovery**: [`ARCH-DISCOVERY-METHODOLOGY-CONTRACT-003-REV-01`](file:///home/markc/.gemini/antigravity-ide/brain/c20984a3-af87-4622-a773-5a3b3311c782/ARCH-DISCOVERY-METHODOLOGY-CONTRACT-003-REV-01.md)  
**Baseline Git Commit**: `main @ 9be68bd`  
**Document Status**: 🟢 RATIFIED — AUTHORIZED FOR IMPLEMENTATION  
**Working Branch**: `feature/011-methodology-contract-slice-3`  

---

## 1. GOVERNANCE MANDATE & IMPLEMENTATION NOTICE

```text
================================================================================
CRITICAL GOVERNANCE NOTICE: CANDIDATE SPECIFICATION ONLY
================================================================================
This document is a READ-ONLY Software Design Document candidate derived from the 
human-accepted ADR-METHODOLOGY-CONTRACT-001-REV-01 and grounded in verified 
discovery evidence ARCH-DISCOVERY-METHODOLOGY-CONTRACT-003-REV-01.

IT DOES NOT CONSTITUTE AUTHORIZATION TO WRITE CODE, CREATE BRANCHES, MODIFY 
DATABASES, ALTER APIS, MUTATE WORKFLOW RUNTIMES, OR DEPLOY.

Implementation remains strictly unauthorized until Human Leadership formally
ratifies this SDD and issues explicit Human Implementation Authorization.
================================================================================
```

### Epistemic Categorization Framework
To maintain documentation integrity and prevent conflating decisions with assumptions:
- **`[VERIFIED FACT]`**: Empirical truth directly verified in baseline commit `main @ 9be68bd`.
- **`[ARCHITECTURAL INFERENCE]`**: Logical deduction derived from verified facts and design rules.
- **`[DESIGN DECISION]`**: Binding design choice within SDD-03 scope, contingent on human ratification.
- **`[RECOMMENDATION]`**: Proposed implementation choice for this vertical slice.

---

## 2. SCOPE DEMARCATION & BOUNDARY INVARIANTS

### In-Scope (Vertical Slice 3):
1. **Contract Metadata Enrichment**: Add UI-agnostic presentation metadata (`category`, `tagline`, `description`, `target_audience`, `icon_key`, `required_artifacts`) to `StageContract` and `MethodologyContract` in [`backend/contracts/methodology.py`](file:///home/markc/projects/active/CONVERA/backend/contracts/methodology.py).
2. **Unified Discovery API & `framework_engine.py` Retirement**:
   - Add `list_methodologies()` and `get_methodology_contract()` backed metadata accessors.
   - Serve canonical `GET /api/methodologies` and backward-compatible `GET /api/frameworks` directly from contracts.
   - Retire the redundant, divergent 501-line [`backend/engines/framework_engine.py`](file:///home/markc/projects/active/CONVERA/backend/engines/framework_engine.py), redirecting all remaining calls to `backend/contracts/methodology.py`.
   - Update `backend/routers/sessions.py` to use `contracts.methodology` directly.
3. **Frontend Contract Mirror & Offline Continuity**:
   - Create typed mirror `web/src/lib/contracts/methodology.ts` matching backend contracts to guarantee zero UI layout shift and offline mode support.
4. **Contract-Driven Stepper**:
   - Refactor [`web/src/components/layout/PipelineStepper.tsx`](file:///home/markc/projects/active/CONVERA/web/src/components/layout/PipelineStepper.tsx) to generate stages dynamically from the active contract and `session.stage_progress`.
   - Parameterize progress metrics, gate clearance counts, and dynamic grid layouts.
5. **Decoupled Handcrafted Workspace Resolution**:
   - Create [`web/src/components/frameworks/WorkspaceRegistry.tsx`](file:///home/markc/projects/active/CONVERA/web/src/components/frameworks/WorkspaceRegistry.tsx) to cleanly dispatch views by `(frameworkId, stageIndex)`.
   - Simplify [`web/src/app/page.tsx`](file:///home/markc/projects/active/CONVERA/web/src/app/page.tsx) by replacing hardcoded binary conditionals with the workspace resolver.

### Strictly Out-of-Scope (Deferred):
- Zero database migrations or schema alterations across all 23 SQLite tables.
- Zero modifications to gate evaluation logic or epistemic scoring (`INV-METHODOLOGY-002`).
- Zero changes to AI prompt templates or LLM gateway.
- Zero dynamic UI code generation or plugin sandboxing (`INV-METHODOLOGY-004`).

---

## 3. INVARIANT PRESERVATION

| Invariant | Title | Preservation Mechanism |
| :--- | :--- | :--- |
| `INV-METHODOLOGY-001` | Primitive Agnosticism | `PipelineStepper` and `page.tsx` operate solely on generic `MethodologyContract` interfaces rather than hardcoded track branches. |
| `INV-METHODOLOGY-002` | Epistemic Superiority | Evidence tiers, citation verification, and AI confidence calculators are untouched. |
| `INV-METHODOLOGY-003` | Governed Transitions | Monotonic progression through stages and quality gates remains strictly enforced. |
| `INV-METHODOLOGY-004` | Craftsmanship Preservation | All workspace views remain handcrafted and bespoke; zero generic JSON Schema forms. |
| `INV-METHODOLOGY-005` | Historical Immutability | Backward-compatible `/api/frameworks` endpoint and legacy boolean projection fallbacks are preserved. |
| `INV-METHODOLOGY-006` | Authoritative Persistence | Persistence boundary behind `sqlite_adapter.py` is preserved with zero changes. |

---

## 4. DETAILED COMPONENT DESIGN

### 4.1 Backend Contract Enrichment (`backend/contracts/methodology.py`)

Add the following fields to `StageContract` and `MethodologyContract`:

```python
class StageContract(BaseModel):
    id: str
    number: int
    code: str
    label: str
    short_description: str
    gate_id: Optional[str] = None
    required_activities: List[str] = Field(default_factory=list)
    output_artifacts: List[str] = Field(default_factory=list)
    icon_key: str = "Layers"  # Icon resolver key for UI consumers
    lock_reason_template: Optional[str] = None

class MethodologyContract(BaseModel):
    id: str
    name: str
    version: str
    category: str = "INNOVATION"  # INNOVATION, RESEARCH, etc.
    tagline: str = ""
    description: str = ""
    target_audience: str = ""
    governing_standard: str = "CCDS v2.0"
    required_artifacts: List[str] = Field(default_factory=list)
    stages: List[StageContract]
    gates: List[GateContract]
    stage_sequence: List[str]
    gate_map: Dict[str, str]

def list_methodologies() -> List[Dict[str, Any]]:
    """Return summary metadata for all distinct registered methodologies."""
    seen = set()
    results = []
    for contract in METHODOLOGY_REGISTRY.values():
        if contract.id in seen:
            continue
        seen.add(contract.id)
        results.append({
            "id": contract.id,
            "name": contract.name,
            "version": contract.version,
            "category": contract.category,
            "tagline": contract.tagline,
            "description": contract.description,
            "stage_count": len([s for s in contract.stage_sequence if s != "studio"]),
            "gate_count": len(contract.gates),
            "target_audience": contract.target_audience,
        })
    return results
```

### 4.2 Router Architecture & `framework_engine.py` Retirement

1. **`backend/routers/frameworks.py`**:
   Refactored to delegate directly to `contracts.methodology`:
   ```python
   from contracts.methodology import list_methodologies, get_methodology_contract

   @router.get("")
   async def api_list_frameworks():
       return {"frameworks": list_methodologies()}

   @router.get("/{framework_id}")
   async def api_get_framework(framework_id: str):
       contract = get_methodology_contract(framework_id)
       if not contract:
           raise HTTPException(status_code=404, detail=f"Framework '{framework_id}' not found")
       return contract.model_dump()
   ```
2. **Canonical Router `backend/routers/methodologies.py`**:
   Exposes `/api/methodologies` and `/api/methodologies/{id}` identically.
3. **`backend/routers/sessions.py`**:
   Replace `from engines.framework_engine import get_framework` with:
   `from contracts.methodology import get_methodology_contract`
4. **`backend/engines/framework_engine.py`**:
   Replace the 501-line duplicate implementation with a lightweight backward-compatibility facade delegating to `contracts.methodology`.

### 4.3 Frontend Contract Mirror (`web/src/lib/contracts/methodology.ts`)

Define client-side contracts matching backend definitions with icon mappings:
- `INNOVATION_CONTRACT`: 5 stages (`p1_discovery`..`p5_economics`), 3 gates.
- `RESEARCH_CONTRACT`: 6 stages (`stage_a_scouting`..`stage_f_feasibility`), 4 gates.
- `getMethodologyContract(frameworkId: string)`: Returns the contract with static fallback for offline mode.

### 4.4 Parameterized `PipelineStepper.tsx`

Construct steps dynamically:
1. `Step 0`: Problem Bank (`FolderOpen`, `isBank: true`).
2. `Steps 1..N`: Derived from `contract.stages`.
   - `isComplete`: `session.stage_progress?.stages[stage.id]?.status === "COMPLETED"` (with fallback to `session.phase{i}_complete`).
   - `isAvailable`: `session.stage_progress?.stages[stage.id]?.status !== "LOCKED"`.
   - `icon`: resolved from `stage.icon_key`.
3. `Step N+1`: Deliverables Studio (`Sparkles`, `isStudio: true`).
4. Telemetry Header:
   - Dynamic track title: `contract.name`.
   - Dynamic cleared gates count: `clearedGates` out of `contract.gates.length`.
   - Dynamic progress percentage: `Math.round((completedStages / totalStages) * 100)`.
   - Dynamic grid cols: `grid-cols-2 sm:grid-cols-4 md:grid-cols-${steps.length}`.

### 4.5 Handcrafted Workspace Registry (`web/src/components/frameworks/WorkspaceRegistry.tsx`)

```tsx
interface WorkspaceResolverProps {
  session: SessionState;
  problems: ProblemRecord[];
  activePhase: number;
  onUpdateSession: (s: SessionState) => void;
  onSelectPhase: (phase: number) => void;
  onSendToPhase2?: (problem: any) => void;
  onExportDossier?: () => void;
  phase2SelectedIds?: string[];
}

export const WorkspaceResolver: React.FC<WorkspaceResolverProps> = (props) => {
  const { session, activePhase } = props;
  const contract = getMethodologyContract(session.framework_id);
  const studioPhaseIndex = contract.stages.length + 1;

  if (activePhase === 0) {
    return <ProblemBankView session={session} onSendToPhase2={props.onSendToPhase2} />;
  }

  if (activePhase === studioPhaseIndex) {
    return (
      <DeliverablesStudio
        session={session}
        onExportDossier={props.onExportDossier}
        onNavigatePhase={props.onSelectPhase}
      />
    );
  }

  // Bespoke view resolution per methodology
  if (contract.id === "RESEARCH") {
    return (
      <ResearchWorkspaceView
        session={session}
        problems={props.problems}
        activePhase={activePhase}
        onUpdateSession={props.onUpdateSession}
      />
    );
  }

  // Innovation Track Handcrafted Views
  switch (activePhase) {
    case 1:
      return <ProblemDiscoveryView session={session} onUpdateSession={props.onUpdateSession} onAdvanceToNextPhase={() => props.onSelectPhase(2)} />;
    case 2:
      return <ProblemScreeningView session={session} onUpdateSession={props.onUpdateSession} selectedProblemIds={props.phase2SelectedIds} onAdvanceToNextPhase={(prob) => { if (prob) props.onUpdateSession({ ...session, phase3_problem: prob }); props.onSelectPhase(3); }} onGoBack={() => props.onSelectPhase(1)} />;
    case 3:
      return <ProblemValidationView session={session} onUpdateSession={props.onUpdateSession} onAdvanceToNextPhase={() => props.onSelectPhase(4)} onGoBack={() => props.onSelectPhase(2)} initialProblemStatement={session.phase3_problem} />;
    case 4:
      return <SolutionConceptView session={session} onUpdateSession={props.onUpdateSession} onAdvanceToNextPhase={() => props.onSelectPhase(5)} onGoBack={() => props.onSelectPhase(3)} />;
    case 5:
      return <EconomicsTestingView session={session} onUpdateSession={props.onUpdateSession} onGoBack={() => props.onSelectPhase(4)} onExportDossier={props.onExportDossier} />;
    default:
      return <DeliverablesStudio session={session} onExportDossier={props.onExportDossier} onNavigatePhase={props.onSelectPhase} />;
  }
};
```

---

## 5. AUTOMATED VERIFICATION PLAN

1. **Backend Unit Tests**:
   - `test_methodology_contracts.py`: Test enriched contract metadata fields (`category`, `tagline`, `description`, `icon_key`, `list_methodologies()`).
   - `test_frameworks_router.py`: Test `GET /api/frameworks` and `GET /api/methodologies` return identical contract schemas.
   - `test_framework_engine.py`: Confirm facade compatibility and zero regressions.
2. **Frontend Typecheck & Build**:
   - `npm run test:frontend`: Zero TypeScript errors.
   - `npm run build`: Production build passes with 0 errors.
3. **Execution Verification**:
   - `npm run test:backend`: All 259+ tests pass.

---

## 6. GOVERNANCE STATUS & IMPLEMENTATION HOLD NOTICE

```text
================================================================================
NEXT GOVERNANCE GATE: HUMAN LEADERSHIP SDD-03 RATIFICATION
================================================================================
Current State:        SPEC-METHODOLOGY-CONTRACT-003-SDD-03 Formulated (Candidate)
Next Action:          STOPPED — Awaiting Human Leadership Review and Ratification
Implementation Code:  HOLD (Not Authorized)
Branch Creation:      HOLD (Not Authorized)
================================================================================
```
