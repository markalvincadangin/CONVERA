# CONVERA — System Identity & Ecosystem Boundaries

**Document ID**: `CONVERA-FND-005`  
**Classification**: Core System Identity, Orchestration Doctrine & Ecosystem Boundaries  
**Authority Tier**: Tier 1 Foundational Normative  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 RATIFIED ARCHITECTURE  
**Canonical Path**: `docs/00-foundation/IDENTITY.md`  
**Upstream Dependencies**: `docs/00-foundation/CONSTITUTION.md`  
**Downstream Dependents**: `docs/00-foundation/CONVERA.md`, `docs/01-product/PRODUCT_DEFINITION.md`, `docs/02-system/SYSTEM_ARCHITECTURE.md`, `docs/04-ai/CONNECTOR_ARCHITECTURE.md`, `docs/04-ai/MCP.md`

---

> **"CONVERA is the intelligence and orchestration layer of the research ecosystem, not a replacement for the ecosystem itself."**  
> CONVERA coordinates research reasoning, methodology, evidence, decisions, and workflow while integrating specialized external systems such as Notion, Zotero, academic databases, whiteboards, and development platforms.

---

## 1. Core Identity & Canonical Definitions

### 1.1 Canonical Definition
**CONVERA is an AI-powered Research Intelligence and Workflow Orchestration System.**

Its primary purpose is to act as the **intelligence and coordination layer for the entire research and ideation process**. CONVERA helps a research team move through:

$$\text{Problem Discovery} \longrightarrow \text{Evidence Gathering} \longrightarrow \text{Ideation} \longrightarrow \text{Concept Evaluation} \longrightarrow \text{Validation} \longrightarrow \text{Methodology} \longrightarrow \text{Research Execution} \longrightarrow \text{Deliverables} \longrightarrow \text{Knowledge Management}$$

Instead of requiring researchers to manually coordinate all of these activities across disconnected tools, CONVERA provides a unified intelligence layer that understands the current research context, determines what needs to happen next, applies appropriate research methodologies and decision rules, and coordinates with specialized external tools.

### 1.2 One-Sentence Definition
> **CONVERA is an AI-powered Research Intelligence and Workflow Orchestration System that helps teams discover, evaluate, validate, develop, and execute research by combining evidence-aware intelligence, structured methodologies, decision support, and integration with specialized external research tools.**

### 1.3 Short Definition
> **CONVERA — AI Research Intelligence & Workflow Orchestration.**

### 1.4 Canonical Equation
$$\text{CONVERA} = \text{Research Intelligence} + \text{Workflow Orchestration} + \text{Evidence Provenance} + \text{Methodology Contracts} + \text{Ecosystem Integration}$$

* **CONVERA is NOT**: Another standalone research tool, isolated chatbot, or monolithic productivity suite.
* **CONVERA IS**: The intelligence layer that connects research tools and organizes the research process.

---

## 2. What CONVERA Fundamentally Does

CONVERA must **never** be understood or built as:
* An AI chatbot or conversational assistant;
* An LLM wrapper with a dashboard;
* A generic research database or knowledge graph;
* A project management system or task tracker;
* A document editor or word processor;
* A reference or citation manager;
* A digital whiteboard or diagramming canvas;
* A replacement for existing mature research platforms.

Instead, CONVERA operates as the **intelligence and orchestration layer connecting these capabilities together**.

At any point in a project, the system understands:
1. **What the researchers are trying to accomplish** (Inquiry intent and objectives)
2. **What stage of the research process they are currently in** (Active methodology stage and contract)
3. **What information and evidence already exist** (Empirical facts, citations, verified claims)
4. **What information is missing** (Gaps, unmeasured variables, blind spots)
5. **What assumptions still need validation** (Active working hypotheses, unvalidated risks)
6. **What research methodology or workflow should be applied** (Stage governance, required inputs/outputs)
7. **What decisions need to be made** (Candidate options, criteria, constraints, trade-offs)
8. **What tools are appropriate for the current task** (Notion, Zotero, Academic APIs, MCP, Miro, GitHub)
9. **What outputs or deliverables need to be produced** (Research briefs, SRS specs, literature matrices)
10. **What should happen next** (Deterministic next step recommendations based on methodology state)

The goal is not merely to generate answers; the goal is to **help the research team make progress through a structured, evidence-aware research process.**

---

## 3. Core Value Proposition: Curing Research Fragmentation

The central problem CONVERA addresses is the severe fragmentation of modern scientific and technological inquiry.

A research team routinely uses:
* Generative AI systems (ChatGPT, Claude) for brainstorming and synthesis;
* Google Docs / LaTeX for document drafting;
* Notion for project notes and team knowledge;
* Zotero / Mendeley for reference and citation storage;
* Academic databases (Google Scholar, OpenAlex, Semantic Scholar, PubMed) for literature;
* Whiteboards (Miro, FigJam) for exploratory visual ideation;
* GitHub / GitLab for technical artifacts and code;
* Spreadsheets for multi-criteria candidate evaluation;
* Manual checklists for academic methodology adherence.

While each tool excels independently, the **research process itself becomes fragmented**. Researchers are forced to manually maintain fragile, error-prone connections between:

$$\text{Ideas} \longleftrightarrow \text{Problems} \longleftrightarrow \text{Evidence} \longleftrightarrow \text{Sources} \longleftrightarrow \text{Decisions} \longleftrightarrow \text{Methodologies} \longleftrightarrow \text{Artifacts} \longleftrightarrow \text{Deliverables}$$

**CONVERA exists to coordinate and guarantee those relationships.**

---

## 4. CONVERA's Role in the Ecosystem

CONVERA is an **orchestration and intelligence layer**, not a monolithic destination platform:

```text
                         CONVERA
              AI RESEARCH INTELLIGENCE
                         +
              WORKFLOW ORCHESTRATION
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     Intelligence   Methodology      Decision
        Engine         Engine         Support
          │              │              │
          └──────────────┼──────────────┘
                         │
                  TOOL ORCHESTRATION
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
     Notion           Zotero          Whiteboards
     (Knowledge)   (References)        (Ideation)
        │                │                │
        └────────────────┼────────────────┘
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          GitHub    Academic APIs  Other Tools
```

External tools remain specialized systems of record and interaction workspaces. CONVERA orchestrates them into a unified, rigorous research workflow.

---

## 5. Supreme Architectural Principle: Intelligence Layer, Not Replacement Ecosystem

> ### CONVERA should be the intelligence layer, not the replacement ecosystem.

CONVERA must **never** attempt to recreate mature tools that researchers already rely on:
* **Do NOT build "CONVERA Notion"** — Notion already handles flexible team knowledge bases.
* **Do NOT build "CONVERA Zotero"** — Zotero already handles citation management and PDF library indexing.
* **Do NOT build "CONVERA Whiteboard"** — Figma, Miro, and FigJam already handle collaborative canvas ideation.
* **Do NOT build "CONVERA GitHub"** — GitHub already handles version control, pull requests, and code repositories.

Instead:
> **CONVERA understands WHEN and HOW those tools should be used within the research workflow.**

### Concrete Workflow Example
```text
Researcher: "We are considering this problem as a potential research topic."
    │
    ▼
CONVERA:
    ├─ 1. Identify research stage (e.g., Stage A: Problem Discovery)
    ├─ 2. Evaluate problem definition against empirical criteria
    ├─ 3. Determine evidence requirements
    ├─ 4. Search academic / external sources via pluggable adapters (OpenAlex, Semantic Scholar)
    ├─ 5. Normalize, deduplicate, and analyze evidence
    ├─ 6. Identify gaps and unvalidated assumptions
    ├─ 7. Critique the problem framing (Devil's Advocate)
    ├─ 8. Recommend next research action
    ├─ 9. Store structured findings in Notion
    ├─ 10. Save verified references to Zotero
    ├─ 11. Update research state in SQLite WAL
    └─ 12. Advance to the next methodology step under contract governance
```

---

## 6. Research Lifecycle Capabilities

CONVERA focuses its intelligence on the front-to-middle research lifecycle:

### A. Problem Discovery
Helps researchers identify, interrogate, and bound authentic problems:
* What problems exist in a specific domain?
* Who experiences the problem, and what is its quantifiable severity?
* What empirical evidence demonstrates that the problem exists?
* What are the existing workarounds and competing solutions?
* What authentic research gaps remain?
* Is this an authentic, researchable problem or a fabricated inconvenience?

### B. Ideation
Transforms validated problems into rigorous research directions:
* Generates structured, defensible research directions from validated problem statements;
* Explores multi-disciplinary solution approaches;
* Challenges premature solution assumptions;
* Detects "solutions looking for a problem";
* Compares candidate directions against resource and methodology constraints;
* Identifies assumptions that must be falsified before engineering begins.

### C. Concept Evaluation
Critically assesses candidate concepts with traceable reasoning:
* Evaluates problem relevance, evidence strength, research gap validity, stakeholder impact, technical feasibility, novelty, and methodology fit;
* Replaces subjective intuition or opaque "AI scores" with **traceable, transparent mathematical models and empirical evidence**.

---

## 7. Research Critique & Socratic Interrogation

CONVERA acts as a **structured research critic**, not a sycophantic chatbot. The system actively challenges the researcher's thinking:
* *"What empirical evidence supports this claim?"*
* *"Is this an authentic problem or merely an inconvenience?"*
* *"Who experiences this failure, and how do we know?"*
* *"What existing academic or commercial solutions already address this?"*
* *"What is the exact scientific gap between state-of-the-art and your proposal?"*
* *"Are you assuming a specific technology is necessary before validating the need?"*
* *"What empirical signal would completely falsify this hypothesis?"*
* *"What critical evidence is still missing before making this decision?"*

**CONVERA does not merely accelerate research output; it actively prevents weak, ungrounded decisions from advancing through the research pipeline.**

---

## 8. Methodology Guidance & Contracts

Research is not an unstructured list of tasks. Valid research adheres to governed scientific and engineering methodologies.

```text
Research Stage ──► Current Objective ──► Methodology Contract ──► Required Evidence ──► Action ──► Output ──► Validation Gate ──► Next Stage
```

Through the **Methodology Contract Architecture**, CONVERA enforces:
* Explicit stage objectives and allowed actions;
* Mandatory input prerequisites and evidence thresholds;
* Stage-specific validation criteria and exit conditions;
* Deterministic stage transitions without vendor or framework lock-in.

---

## 9. Evidence-Aware Intelligence & Epistemic Progression

CONVERA enforces strict epistemic discipline over raw generative AI outputs. All claims adhere to an explicit epistemic progression:

$$\text{FACT} \longrightarrow \text{SOURCE} \longrightarrow \text{EVIDENCE} \longrightarrow \text{INTERPRETATION} \longrightarrow \text{INFERENCE} \longrightarrow \text{DECISION}$$

* **Linguistic Fluency $\neq$ Empirical Truth**: Syntactic eloquence from an LLM carries zero epistemic weight.
* **Traceable Lineage**: Every claim must link to authoritative sources (DOI, PMID, dataset) with immutable retrieval provenance.
* **Epistemic Balance**: Positive decision weight is granted only to evidence with verified provenance.

---

## 10. Deterministic Decision Intelligence

Decision-making in CONVERA is governed by deterministic mathematical evaluation rather than non-deterministic AI generation:

```text
Decision Context ──► Evaluation Criteria ──► Available Evidence ──► Missing Evidence ──► Constraints ──► Trade-offs ──► Mathematical Ranking ──► Human Decision
```

* **Mathematical Scoring**: Problem rankings and candidate scores use pure deterministic formulas ($S_{\text{composite}} = 0.40 S_{\text{rubric}} + 0.35 S_{\text{epistemic}} + 0.25 S_{\text{impact}} - R_{\text{assumptions}}$).
* **Strict Tie-Breaking**: 4-tier deterministic tie-breaking hierarchy.
* **Immutable Winner Invariant**: AI models may explain trade-offs and risks, but they cannot override the mathematically determined winner.
* **Human Sovereignty**: CONVERA structures and clarifies decisions; the human researcher retains sole authority to ratify them.

---

## 11. Deliverable Generation from Accumulated State

Deliverables (Research Briefs, Problem Statements, Concept Papers, Literature Matrices, SRS Specifications, Research Proposals) are **synthesized from accumulated, verified research state**:

$$\text{Research State} + \text{Evidence} + \text{Decisions} + \text{Methodology Traceability} \xrightarrow{\text{CONVERA}} \text{Governed Deliverables}$$

Deliverables are never hallucinated from scratch. They are auditable projections of the underlying relational database records.

---

## 12. External Tool Ecosystem Integrations

| Subsystem Domain | Integrated Ecosystem Tools | Role & Interaction Pattern |
|:---|:---|:---|
| **Knowledge Management** | Notion, Google Docs | CONVERA pushes structured findings, stage syntheses, and briefs into user workspaces. |
| **Reference Management** | Zotero | CONVERA exports verified citations, DOIs, and literature collections directly into reference libraries. |
| **Academic Research** | OpenAlex, Crossref, PubMed, Europe PMC, Semantic Scholar, ArXiv | Federated query execution via pluggable adapters (REST & MCP). |
| **Ideation & Visualization** | Figma, FigJam, Miro | Visual whiteboards for team brainstorming; CONVERA synchronizes concept candidate states. |
| **Development & Code** | GitHub, GitLab | Technical artifact storage, issue generation, and code repositories. |
| **AI Runtime Providers** | Gemini, Groq, Cerebras, OpenRouter, GitHub Models, Ollama | Multi-provider LLM gateway with automated failover and fallback cascades. |

---

## 13. Ownership vs. Coordination Matrix

To prevent architectural bloat, CONVERA strictly distinguishes between what it **owns** versus what it **coordinates**:

| Responsibility | CONVERA Authority | External System Authority |
|:---|:---|:---|
| **Research Workflow** | **OWNS** | — |
| **Research State** | **OWNS & PERSISTS** | — |
| **Methodology Execution** | **OWNS & GOVERNS** | — |
| **Evidence Reasoning & Provenance** | **OWNS & MODELS** | External sources provide raw signals |
| **Decision Intelligence & Scoring** | **OWNS (Deterministic)** | Human researcher makes final choice |
| **AI Orchestration (LLM-Last)** | **OWNS** | AI providers execute inference |
| **Critique & Socratic Interrogation**| **OWNS** | — |
| **Knowledge Storage** | Coordinates | Notion / Google Docs / Obsidian |
| **Reference Management** | Coordinates | Zotero / Mendeley |
| **Academic Source Discovery** | Coordinates & Normalizes | OpenAlex, Crossref, PubMed, Semantic Scholar |
| **Whiteboard Visualization** | Coordinates | Figma / Miro / FigJam |
| **Code Repositories** | Coordinates | GitHub / GitLab |
| **Document Publication** | Coordinates & Generates | External document processors / LaTeX |

---

## 14. Internal Architecture Supporting This Identity

CONVERA's architectural components are purpose-built mechanisms serving this orchestration mission:

1. **Multi-Provider LLM Gateway**: Vendor-agnostic intelligence infrastructure with automatic rate-limit cascade, synthetic fallback, and provenance tracking.
2. **Deterministic Decision Engine**: Pure mathematical candidate evaluation and immutable winner enforcement.
3. **Two-Layer Scholarly Evidence Engine**: Canonical normalization, FTS5/BM25 retrieval, and provenance persistence decoupling research logic from transport protocols.
4. **Methodology Contract Architecture**: Declarative, framework-agnostic research steppers and quality gate validators.
5. **Source-Mediated Epistemic Bridge**: Connects raw citations to empirical evidence, claims, and decision scores.
6. **Tool Integration Surface (REST + MCP)**: Bi-directional orchestration of external workspaces and academic tools.
7. **SQLite WAL Relational Core**: 23-table authoritative relational graph capturing complete lineage and provenance.
8. **CCDS Next.js Presentation Workspace**: Research UI exposing intelligence, steppers, and decision matrices.

---

## 15. The Fundamental Mental Model

> **CONVERA is the brain and coordinator of the research workflow, while specialized external tools remain the hands, workspaces, and systems of record.**

More formally:
> **CONVERA is an AI-driven orchestration layer that maintains research context, enforces methodology contracts, reasons over empirical evidence, identifies knowledge gaps, supports deterministic decisions, invokes specialized external tools, and guides researchers through structured, verifiable research workflows.**

---

## 16. The 12 Architectural Anti-Goals

To preserve architectural integrity and avoid mission creep, CONVERA **MUST NEVER** become:
1. ❌ **A Generic Chatbot**: Conversational text generation is a secondary presentation utility, not the product.
2. ❌ **A ChatGPT / Claude Clone**: No blank prompt boxes disconnected from research state and methodology.
3. ❌ **A Standalone Note-Taking Application**: Do not replicate Apple Notes, Bear, or Evernote.
4. ❌ **A Replacement for Notion**: Do not build relational databases, kanban boards, or rich-text doc trees that duplicate Notion.
5. ❌ **A Replacement for Zotero**: Do not build PDF readers, annotation engines, or citation formatters that duplicate Zotero.
6. ❌ **A Replacement for Academic Databases**: Do not attempt to crawl, host, or mirror the global scholarly corpus.
7. ❌ **A Generic Project Management Tool**: Do not build Jira, Trello, or Asana clones.
8. ❌ **A Generic Task Manager**: Research stages are epistemic quality gates, not generic to-do checklists.
9. ❌ **A Collection of Disconnected AI Features**: Every AI interaction must bind to active research state, methodology, and evidence.
10. ❌ **An LLM Wrapper with a Dashboard**: Pure generative wrappers lack epistemic provenance and deterministic rigor.
11. ❌ **A Giant CRUD Application Without Research Intelligence**: Data storage exists solely to serve research reasoning and lineage.
12. ❌ **An Autonomous System That Decides Without Humans**: Complete human sovereignty is non-negotiable (Article IV of the Constitution).

---

## 17. The Core System Loop

CONVERA's internal execution loop is structured, evidence-aware, and iterative:

```text
 1. UNDERSTAND       "What is the research team trying to accomplish?"
       │
 2. CONTEXTUALIZE    "What verified facts and assumptions already exist in state?"
       │
 3. INVESTIGATE      "What empirical literature or experimental evidence exists?"
       │
 4. IDENTIFY GAPS    "What information, evidence, or data is missing?"
       │
 5. REASON           "What does the accumulated evidence mathematically imply?"
       │
 6. CRITIQUE         "What could be wrong? What assumptions remain unvalidated?"
       │
 7. DECIDE           "What candidate options exist, and what are their trade-offs?"
       │
 8. ACT              "Which methodology contract or external tool executes this step?"
       │
 9. RECORD           "What changed in the research state, provenance, and lineage?"
       │
10. VALIDATE         "Did the action satisfy the required gate conditions?"
       │
11. CONTINUE         "What is the next validated research step?"
```

---

## 18. Two-Layer Academic Connector Architecture

To balance developer velocity with architectural longevity, CONVERA decouples academic discovery into two distinct layers:

```text
                         CONVERA RESEARCH INTELLIGENCE
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │        LAYER B: CONVERA ACADEMIC EVIDENCE SERVICE           │
        │                                                             │
        │  • Canonical AcademicWork Model     • Provenance Lineage    │
        │  • Cross-Provider Identity Match    • Evidence Persistence  │
        │  • Multi-Source Deduplication       • Epistemic Scoring     │
        │  • Research Context Association     • FTS5/BM25 Retrieval   │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │        LAYER A: ACADEMIC PROVIDER ADAPTERS                  │
        │                                                             │
        │  REST Adapters:             MCP Adapters:     File/Import:  │
        │  • OpenAlex                 • Semantic        • PDF Upload  │
        │  • Crossref                   Scholar MCP     • BibTeX      │
        │  • PubMed                   • ArXiv MCP       • CSV / JSON  │
        │  • Europe PMC               • Future Niche                  │
        └─────────────────────────────────────────────────────────────┘
```

### Layer A: Academic Provider Adapters (Replaceable Infrastructure)
* Thin, replaceable transport adapters conforming to standard query interfaces (`search`, `get_work`, `get_citations`).
* May be implemented via direct REST clients, Model Context Protocol (MCP) servers, or local file parsers.
* Carries no domain logic or proprietary data schemas.

### Layer B: CONVERA Academic Evidence Layer (Core Irreplaceable IP)
* Owns canonical normalization into `AcademicWork`, persistent SQLite FTS5 storage, cross-source deduplication, DOI resolution, and provenance tracking.
* **Does not care whether data arrived via REST, MCP, or local file.**
* Guarantees that if an external MCP server or API changes or goes offline, CONVERA's internal research data and evidence lineage remain unharmed.

---

## 19. Normative Rules for Engineering Agents

All AI coding assistants, subagents, and human software engineers working on CONVERA must adhere to these directives:

1. **Preserve the Core Identity**: Treat CONVERA primarily as an AI-powered Research Intelligence and Workflow Orchestration System. Never reduce it to a chatbot, dashboard, or LLM wrapper.
2. **Avoid Rebuilding External Tools**: When a capability is mature in Notion, Zotero, Miro, Figma, or GitHub, orchestrate it via APIs or MCP rather than coding a subpar internal clone.
3. **MCP is Replaceable Infrastructure**: MCP integrations are transport mechanisms. Canonical research models, evidence lifecycles, provenance lineage, methodology contracts, research state, and decision logic must remain provider-agnostic and owned by CONVERA.
4. **Follow the LLM-Last Doctrine**: Always check if deterministic formulas, lexical search, statistical analysis, or dedicated ML can solve a problem before invoking an LLM.
5. **Maintain State and Provenance**: Every entity, citation, and evidence item must record its origin, retrieval timestamp, and session linkage.
6. **Enforce Human Sovereignty**: Never implement automated workflows that make irreversible research or architectural decisions without explicit human ratification.
