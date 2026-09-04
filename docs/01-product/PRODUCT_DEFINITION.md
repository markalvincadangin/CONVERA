# CONVERA — Product Definition

**Document ID**: `CONVERA-PRD-001`  
**Classification**: Product Scope, Personas & User Journeys  
**Authority Tier**: Tier 2 Product Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/01-product/PRODUCT_DEFINITION.md`  
**Upstream Dependencies**: `00-foundation/CONVERA.md, 00-foundation/PRINCIPLES.md`  
**Downstream Dependents**: `01-product/CAPABILITIES.md, 02-system/DOMAIN_MODEL.md`  

---

> **Technology-Independent Product Specification.**  
> This document defines what CONVERA does, who it serves, its universal transformation lifecycle, and its core deliverables, independent of underlying implementation technologies.

---

## 1. Product Identity & Purpose

**CONVERA** is an evidence-driven project intelligence platform that transforms fragmented information, raw observations, empirical citations, and active assumptions into **validated, traceable, and decision-ready project direction**.

```text
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                               CONVERA MISSION                               │
    │  To eliminate premature solutioning and hallucinated consensus by providing │
    │  an empirical intelligence system that bridges scientific rigor with        │
    │  venture execution.                                                         │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Universal Transformation Model

At a product level, CONVERA processes project uncertainty through a 7-stage value transformation lifecycle:

```text
  ┌────────────┐     ┌─────────────┐     ┌────────────┐     ┌────────────┐
  │ 1. INPUTS  │ ──> │ 2. KNOWLEDGE│ ──> │ 3. EVIDENCE│ ──> │ 4. ANALYSIS│
  └────────────┘     └─────────────┘     └────────────┘     └────────────┘
                                                                   │
  ┌────────────┐     ┌─────────────┐     ┌────────────┐            │
  │7. LEARNING │ <── │ 6. DECISION │ <── │5.VALIDATION│ <──────────┘
  └────────────┘     └─────────────┘     └────────────┘
```

| Stage | Product Role | Input State | Output State |
| :--- | :--- | :--- | :--- |
| **1. Inputs** | Intake of raw signals, user notes, problem canvas drafts, or academic paper queries. | Unstructured text, field notes, DOIs. | Structured problem briefs and candidate claims. |
| **2. Knowledge** | Epistemic modeling of what is known, what is assumed, and what is unmeasured. | Unexamined beliefs and propositions. | Triangulated Unknowns Map (Facts, Hypotheses, Risks). |
| **3. Evidence** | Ingestion, normalization, and tier-weighting of empirical data and scholarly literature. | Raw search hits and citations. | Provenance-stamped evidence items linked to claims. |
| **4. Analysis** | AI-assisted Socratic interrogation, gap vs. limitation discrimination, and literature matrices. | Disconnected evidence items. | Comparative synthesis, contradiction pairs, and candidate gaps. |
| **5. Validation** | Falsification testing, customer interview logging, and Quality Gate rubric evaluations. | Active assumptions and hypotheses. | Mathematically scored Net Epistemic Balance and Gate sign-offs. |
| **6. Decision** | Immutable decision recording, trade-off synthesis, and causal blast-radius propagation. | Competing candidate directions. | Ratified decision records with linked rationale and requirement lineage. |
| **7. Learning** | Circumscription iteration, evaluation benchmark failure logging, and pivot loops. | System evaluation results. | New design constraints and refined research protocols. |

---

## 3. Target User Personas & Scenarios

### Persona 1: The Computing Researcher / Capstone Student
* **Context:** Senior CS/IT/IS student or graduate researcher conducting Design Science Research (DSR).
* **Pain Point:** Struggles to identify authentic computing research gaps, often building generic apps without theoretical grounding or empirical justification.
* **CONVERA Value:** Guides the student through 25 Master Computing Domains, auto-populates literature matrices from OpenAlex/CrossRef, discriminates study limitations from authentic gaps, and exports formal academic proposals (`/api/export/dsr-proposal`).

### Persona 2: The Early-Stage Technopreneur / Founder
* **Context:** University or regional startup incubator team developing a tech-enabled venture.
* **Pain Point:** Falls in love with a premature technical solution before validating market demand or stakeholder willingness to pay.
* **CONVERA Value:** Enforces the Socratic Mom Test clinic, evaluates behavioral commitment tiers (LOIs/pre-orders), and maps concept solutions across 15 mechanism families.

### Persona 3: The Faculty Advisor / Panel Reviewer
* **Context:** Capstone coordinator, thesis committee member, or incubator mentor.
* **Pain Point:** Reviewing proposals with fake or superficial citations, missing methodology justifications, and vague evaluation metrics.
* **CONVERA Value:** Uses code-enforced Quality Gates (Gates 1–4) with standardized rubrics, verifiable DOI provenance, and immutable committee sign-off logs.

### Persona 4: The R&D Systems Engineer / Product Lead
* **Context:** Lead software architect or engineering manager in an applied research lab.
* **Pain Point:** When foundational requirements or technical assumptions fail, dependent architecture remains stale in Jira/Docs.
* **CONVERA Value:** Downstream Impact Propagation automatically alerts the team when refuting evidence invalidates foundational technical choices.

---

## 4. Dual Operational Tracks

CONVERA provides two specialized product workflows operating on a shared knowledge core:

```text
                              CANONICAL KNOWLEDGE CORE
         (Problems · Claims · Evidence · Assumptions · Decisions · Lineage)
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
│    INNOVATION TRACK (VENTURE)       │ │     RESEARCH TRACK (COMPUTING)      │
├─────────────────────────────────────┤ ├─────────────────────────────────────┤
│ • Focus: Market Opportunity         │ │ • Focus: Scientific Contribution    │
│ • Framework: Venture Ratchet (1–5)  │ │ • Framework: DSR / CRCDP (A–F)      │
│ • Gate: Skin-in-the-game Commitments│ │ • Gate: Academic Quality Gates 1–4  │
│ • Output: Formal SRS Specification  │ │ • Output: Academic Proposal Brief   │
└─────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 5. Core Product Deliverables

CONVERA outputs three authoritative, production-ready deliverables:

1. **The Academic Research Proposal Brief (`/api/export/dsr-proposal`):**  
   A complete, publication-ready Markdown/PDF document compiling the project's background, Master Domain classification, Bordens & Abbott literature triage, federated literature matrix, research questions, DSR methodology, and Gate 1–4 sign-off logs.
2. **The Software Requirements Specification (SRS / IEEE 830):**  
   A structured engineering specification containing functional requirements, non-functional constraints, and technical architecture directly mapped back to validated claims and evidence.
3. **The Decision Intelligence & Traceability Dossier:**  
   An immutable audit trail documenting every evaluated concept, rejected alternative, human rationale, and downstream causal lineage.

---

## 6. Product Guardrails & Anti-Patterns (What CONVERA is Not)

| What CONVERA Is NOT | What CONVERA IS |
| :--- | :--- |
| **Not a generic conversational chatbot.** | A structured, stateful intelligence system that preserves relational knowledge. |
| **Not an automated proposal ghostwriter.** | A Socratic research assistant that enforces scientific rigor and human ratification. |
| **Not a static document repository.** | A living, reactive epistemic graph with causal blast-radius invalidation. |
| **Not an ungrounded search engine.** | An evidence-driven platform that enforces citation tiers, DOI provenance, and contradiction detection. |
