# CONVERA SDD-019: Specification
# Cross-Stage Research Critique & Blind-Spot Engine (Phase C3)

**Specification ID**: CONVERA-SDD-019  
**Feature Title**: Cross-Stage Research Critique & Blind-Spot Engine  
**Roadmap Work Item**: Phase C: Research Intelligence Expansion (Work Item C3: Critique Enhancement & Blind-Spot Detection)  
**Authority Tier**: Tier 2 (Feature Specification)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  
**Target Feature Branch**: `feature/019-research-critique-blindspot-engine`  
**Target Integration Branch**: `develop`  
**Baseline Git Commit**: `8ada2a7`  

---

## 1. Problem Statement & Rationale

In computing research and Design Science Research (DSR), researchers frequently suffer from **Stage Siloing** and confirmation bias:
1. **Isolated Stage Rationality**: Decisions made in one stage (e.g. hardware architecture in Stage D) proceed without reconciling against empirical limitations discovered in previous literature (Stage C) or empirical failure modes observed in testing loops (Stage E).
2. **Hidden Cross-Stage Contradictions**:
   - *Stage C vs Stage D*: Literature demonstrates that 8-bit quantized models experience significant quantization drift under high ambient heat, yet Stage D proposes edge microcontrollers in tropical field environments without thermal drift mitigation.
   - *Stage E vs Stage A*: A circumscription iteration observes that solar power starvation prevents 72-hour continuous monitoring, contradicting the Stage A premise of uninterrupted cold-chain assurance.
   - *Stage F vs Stage E*: Stage F budgets for 5 off-the-shelf sensor nodes, but Stage E experimental design demands 20 distinct replicates for statistical power.
3. **Superficial Critique**: Existing adversarial critique (`devils_advocate.py`) is narrowly confined to early startup problem bank statements without visibility into relational records across Stages B, C, D, E, and F.

CONVERA requires a **Cross-Stage Research Critique & Blind-Spot Engine** that continuously cross-examines the live relational state of all 6 DSR stages, surfaces architectural and empirical contradictions, formulates fatal kill questions, and computes a deterministic cross-stage epistemic tension score.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Automated Cross-Stage Contradiction Audit
*As a Lead Researcher or Advisor, I want CONVERA to continuously cross-examine my literature claims, artifact architecture, and circumscription failure modes, so that hidden methodological blind spots are exposed before committee defense.*
- **AC 1.1**: The system scans relational tables across Stage A (`problems`), Stage C (`scholarly_works`), Stage D (`dsr_artifacts`), Stage E (`circumscription_iterations`), and Stage F (`research_feasibility_records`).
- **AC 1.2**: Contradictions are classified into 4 canonical vectors: `EVIDENCE_VULNERABILITY`, `CIRCUMSCRIPTION_TENSION`, `ETHICS_FEASIBILITY_DISCORD`, and `CROSS_STAGE_BLIND_SPOT`.
- **AC 1.3**: Each detected critique record provides a lethal *Kill Question*, *Fatal Flaw Summary*, *Severity Rating* (`FATAL`, `CRITICAL`, `WARNING`, `ADVISORY`), and *Mitigation Recommendation*.

### User Story 2: Deterministic Epistemic Tension Scoring
*As a Committee Panel Chair, I want an objective, unvarnished score of cross-stage consistency that cannot be inflated by LLM hallucinations.*
- **AC 2.1**: The engine calculates a deterministic **Cross-Stage Consistency Score** $[0.0, 100.0]$ using mathematical formula:
  $$\text{Score} = \max(0.0, 100.0 - (25.0 \times N_{\text{fatal}} + 15.0 \times N_{\text{critical}} + 8.0 \times N_{\text{warning}} + 3.0 \times N_{\text{advisory}}))$$
- **AC 2.2**: AI qualitative text is strictly advisory and does not tamper with the formulaic score (`INV-019-02`).

### User Story 3: Human Sovereignty & Critique Resolution
*As a Researcher, I want the agency to inspect, address, document mitigations, or dismiss flagged critiques with attributable rationale.*
- **AC 3.1**: Critiques are persisted in Table 36 (`research_critiques`) with statuses `OPEN`, `RESOLVED`, or `DISMISSED`.
- **AC 3.2**: Resolving or dismissing a critique requires a human rationale note (`resolution_notes`) adhering to Article IV Human Sovereignty (`INV-019-03`).

### User Story 4: Resilient Offline Operation
*As an offline researcher in remote field sites, I want the critique engine to execute rule-based heuristic audits when no internet connection or API keys are active.*
- **AC 4.1**: When LLM calls fail or `include_ai_advisory=False`, the engine produces deterministic rule-based critique records and flags `is_degraded = True` (`INV-019-04`).

---

## 3. Constitutional Invariants & Non-Functional Requirements

- **`INV-019-01` (Article VII Anti-Creep Law)**: Zero new third-party packages in `pyproject.toml` or `package.json`.
- **`INV-019-02` (Article II Tri-Part Confidence)**: Epistemic tension score and contradiction counts are mathematically deterministic. AI critique text is strictly advisory.
- **`INV-019-03` (Article IV Human Sovereignty)**: Critique resolution status transitions require explicit human interaction and rationale recording.
- **`INV-019-04` (Article VIII Degraded Resilience)**: Fully functional offline deterministic fallback.
- **`NFR-019-01` (Performance)**: Cross-stage critique evaluation must execute in $\le 500\text{ms}$ in offline mode and $\le 3500\text{ms}$ in online AI mode.
