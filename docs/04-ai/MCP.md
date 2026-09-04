# MODEL CONTEXT PROTOCOL (MCP) SPECIFICATION

**Document ID**: `CONVERA-AI-005`  
**Classification**: AI Subsystem Architecture & MCP Server Specification  
**Authority Tier**: Tier 1 Normative / Tier 2 Descriptive  
**Status**: 🟢 RATIFICATION-READY  
**Canonical Path**: `docs/04-ai/MCP.md`  
**Upstream Dependencies**: `CONSTITUTION.md` (Articles I, II, VI, VII), `SYSTEM_ARCHITECTURE.md` (Area 5), `DOMAIN_MODEL.md`, `KNOWLEDGE_MODEL.md`, `EVIDENCE_MODEL.md`, `DECISION_MODEL.md`, `TRACEABILITY_MODEL.md`, `ENGINEERING_PRINCIPLES.md`, `SECURITY.md`, `CIIA.md`, `AI_ARCHITECTURE.md`, `AI_GOVERNANCE.md`, `CONNECTOR_ARCHITECTURE.md`  
**Downstream Dependents**: `backend/mcp_server.py`, external LLM orchestrators, Spec Kit tooling  

---

## 1. Executive Summary & Architectural Scope

This document specifies the **Model Context Protocol (MCP)** server interface of Area 5 (CIIA). It defines the transport protocol, project scoping rules, schema contracts, and human governance boundaries governing the **seven ratified CONVERA MCP tools**.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        MCP CORE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│  1. SEVEN RATIFIED GOVERNED TOOLS                                       │
│     Exposes high-level epistemic, query, and research operations.       │
│                                                                         │
│  2. MANDATORY PROJECT-SCOPED ISOLATION                                  │
│     ALL tool calls without exception MUST require a target project_id.  │
│                                                                         │
│  3. UNIFIED DOMAIN & SECURITY BOUNDARY                                  │
│     MCP tools execute under identical validation as core REST routes.   │
│                                                                         │
│  4. READ & CANDIDATE-PROPOSAL ORIENTATION                               │
│     Tools inspect state and propose candidates; cannot bypass gates.    │
│                                                                         │
│  5. ZERO PERSISTENCE BYPASS                                             │
│     Tool executions cross Domain Engine services and BaseStorageAdapter.│
└─────────────────────────────────────────────────────────────────────────┘
```

The fundamental governing invariant for MCP execution is:

$$\begin{aligned}
\mathbf{\text{MCP Invariant:}} \quad &\text{An external MCP client operates as an advisory cognitive actor;} \\
&\text{it possesses zero authority to bypass project scoping, mutate persistence directly, or ratify decisions.}
\end{aligned}$$

---

## 2. Statement Classification Framework

Following the governance standards established across Phases 1–3, all specifications in this document adhere to four explicit classification markers:

| Class | Definition | Normative Authority |
| :--- | :--- | :--- |
| **`[NORMATIVE]`** | Inviolable architectural law that MCP tool implementations **MUST** satisfy. | Mandatory baseline constraint. |
| **`[IMPLEMENTED]`** | Architecture verified against the active codebase in `backend/mcp_server.py`. | Active code in `backend/`. |
| **`[TARGET]`** | Planned architectural capabilities scheduled for progressive development. | Governed implementation target. |
| **`[VERIFICATION]`** | The explicit test suite or inspection establishing architectural compliance. | Verification contract (`TESTING_STRATEGY.md`). |

---

## 3. The Seven Ratified MCP Tool Specifications

The CONVERA MCP server exposes seven standardized tools designed to assist external agents and AI development environments:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              RATIFIED MCP TOOL SUITE                                   │
├──────┬────────────────────────────────┬──────────────────────────┬─────────────────────┤
│ Tool │ Tool Name                      │ Primary Function         │ Operational Mode    │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 1    │ convera_query_knowledge        │ Inspect claims & graphs  │ Read-Only Inspection│
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 2    │ convera_query_unknowns         │ Inspect gaps & unknowns  │ Read-Only Inspection│
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 3    │ convera_query_decisions        │ Inspect decision records │ Read-Only Inspection│
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 4    │ convera_calibrate_confidence   │ Evaluate C_AI vs S_EVID  │ Epistemic Analysis  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 5    │ convera_discriminate_gap       │ Dual-track gap analysis  │ Epistemic Analysis  │
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 6    │ convera_trace_requirement      │ Traverse trace graph     │ Read-Only Inspection│
├──────┼────────────────────────────────┼──────────────────────────┼─────────────────────┤
│ 7    │ convera_search_literature      │ Federated scholarly query│ External Retrieval │
└──────┴────────────────────────────────┴──────────────────────────┴─────────────────────┘
```

### 3.1 Tool 1: `convera_query_knowledge`
* **Purpose**: Retrieves problem records, claims, evidence items, and graph linkages for a specified project.
* **Input Schema Contract**:
  ```python
  class QueryKnowledgeInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      domain_scope: Optional[str] = Field(default=None, description="Optional domain filter")
      claim_status: Optional[str] = Field(default=None, description="Filter by claim status")
      limit: int = Field(default=20, ge=1, le=100)
  ```
* **Output**: Structured list of `ProblemClaim` and associated `EvidenceItem` summaries.

### 3.2 Tool 2: `convera_query_unknowns`
* **Purpose**: Surfaces explicit epistemic gaps, unverified claims, and contradictory research signals.
* **Input Schema Contract**:
  ```python
  class QueryUnknownsInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      min_contradiction_severity: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)
      unverified_only: bool = Field(default=True)
  ```
* **Output**: Categorized list of open epistemic unknowns and ungrounded hypotheses.

### 3.3 Tool 3: `convera_query_decisions`
* **Purpose**: Inspects active, proposed, superseded, and deprecated `DecisionRecord` items with full rationale and conviction ratings ($C_{\text{DEC}}$).
* **Input Schema Contract**:
  ```python
  class QueryDecisionsInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      validity_status: Optional[str] = Field(default=None, description="Filter by validity state")
  ```
* **Output**: List of decision records, epistemic bases, and historical pivot references.

### 3.4 Tool 4: `convera_calibrate_confidence`
* **Purpose**: Evaluates the tri-part confidence calibration ($C_{\text{AI}}$, $S_{\text{EVID}}$, $C_{\text{DEC}}$) for a specific claim or decision proposal, checking for `OVERCONFIDENCE_WARNING` conditions.
* **Input Schema Contract**:
  ```python
  class CalibrateConfidenceInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      claim_id: Optional[str] = Field(default=None, description="Target claim ID")
      decision_id: Optional[str] = Field(default=None, description="Target decision ID")
      c_ai: float = Field(ge=0.0, le=1.0, description="Model confidence score")
      s_evid: float = Field(ge=0.0, le=1.0, description="Evidentiary support strength")
      c_dec_override: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Hypothetical conviction override")
  ```
* **Epistemic Invariant**: When `decision_id` is provided, human decision conviction ($C_{\text{DEC}}$) is retrieved directly from the canonical `DecisionRecord`. If evaluating a hypothetical proposal, `c_dec_override` MAY be supplied.
* **Output**: Calibration analysis, delta calculation, and anomaly warnings.

### 3.5 Tool 5: `convera_discriminate_gap`
* **Purpose**: Executes dual-track discrimination, categorizing an epistemic gap as either an Innovation / Venture Track problem or a Research Track scientific gap.
* **Input Schema Contract**:
  ```python
  class DiscriminateGapInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      statement: str = Field(description="Problem or research gap statement")
  ```
* **Output**: Track classification (Innovation Track vs. Research Track), structural rationale, and recommended verification path.

### 3.6 Tool 6: `convera_trace_requirement`
* **Purpose**: Traverses upstream and downstream traceability links from a specified requirement ID, evaluating verification states (`VERIFIED_PASS`, `VERIFIED_FAIL`, `VERIFICATION_STALE`).
* **Input Schema Contract**:
  ```python
  class TraceRequirementInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      requirement_id: str = Field(description="Target requirement identifier")
      direction: Literal["upstream", "downstream", "both"] = Field(default="both", description="Traversal direction")
  ```
* **Output**: Upstream parent traces, downstream artifact references, and blast-radius scope.

### 3.7 Tool 7: `convera_search_literature`
* **Purpose**: Executes federated multi-registry search across OpenAlex, Crossref, PubMed, Europe PMC, and Semantic Scholar via the Scholarly Connector Hub within an active project context.
* **Input Schema Contract**:
  ```python
  class SearchLiteratureInput(BaseModel):
      project_id: str = Field(description="Target project UUID (Mandatory)")
      query: str = Field(description="Plaintext academic search query")
      registries: Optional[List[Literal["OPENALEX", "CROSSREF", "PUBMED", "EUROPE_PMC", "SEMANTIC_SCHOLAR"]]] = Field(
          default=None, description="Target scholarly services"
      )
      limit: int = Field(default=10, ge=1, le=50)
  ```
* **Output**: Deduplicated list of normalized `NormalizedScholarlyRecord` summaries.

---

## 4. Security, Scoping & Human Governance Invariants

In strict alignment with `SECURITY.md` (Threat $T_8$) and `AI_GOVERNANCE.md`, all MCP tool executions adhere to four fundamental security rules:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        MCP SECURITY INVARIANTS                          │
├─────────────────────────────────────────────────────────────────────────┤
│  1. MANDATORY PROJECT-SCOPED ENCAPSULATION                              │
│     Every single tool call MUST provide a valid project_id. Direct      │
│     cross-project data access or un-scoped queries are rejected.        │
├─────────────────────────────────────────────────────────────────────────┤
│  2. UNIFIED SCHEMA & STRUCTURED VALIDATION                              │
│     Arguments are parsed via Pydantic v2 schemas; invalid arguments     │
│     produce structured MCP validation errors.                           │
├─────────────────────────────────────────────────────────────────────────┤
│  3. ZERO DIRECT PERSISTENCE ACCESS                                      │
│     Tools interact exclusively with Domain Engine service boundaries    │
│     and BaseStorageAdapter. Direct raw SQL execution is forbidden.      │
├─────────────────────────────────────────────────────────────────────────┤
│  4. HUMAN RATIFICATION PRESERVATION                                     │
│     Tools are read and candidate-proposal oriented. An MCP tool CANNOT  │
│     unilaterally ratify decisions, alter baselines, or mutate doctrine. │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Verification & Compliance Checklist

Before any code modification affecting the MCP server is accepted, it must satisfy the following verification criteria:

| Check ID | Architectural Requirement | Verification Method | Acceptance Standard |
| :--- | :--- | :--- | :--- |
| **MCP-01** | Tool contract synchronization. | MCP tool schema reflection test. | Exactly 7 tools registered matching canonical names. |
| **MCP-02** | Universal `project_id` validation. | Negative boundary test with invalid/missing IDs across all 7 tools. | 100% of un-scoped calls rejected with structured validation errors. |
| **MCP-03** | Epistemic calibration tool accuracy. | Calibration test suite for `calibrate_confidence`. | Anomaly triggers correctly identified; $C_{\text{DEC}}$ retrieved from canonical record. |
| **MCP-04** | Traceability traversal tool accuracy. | Graph traversal test for `trace_requirement`. | Upstream/downstream links traversed accurately under constrained directions. |
| **MCP-05** | Connector search tool integration. | Federated search mock test for `search_literature`. | Deduplicated `NormalizedScholarlyRecord` list returned within project scope. |
| **MCP-06** | Zero direct database write bypass. | Architecture layer inspection. | 100% of tool routes route through Domain Engine services. |
| **MCP-07** | Unit and integration test pass rate. | Execution of `tests/mcp/`. | 100% applicable tests pass. |

---

## 6. Ratification & Version History

| Version | Date | Author / Governance | Key Changes & Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | `2026-09-04` | Antigravity AI Engine & Architectural Governance | Initial formal specification establishing 7 ratified MCP tools, mandatory project_id scoping, typed schema contracts, canonical C_DEC resolution, and human governance boundaries. | 🟢 RATIFICATION-READY |
