# CONVERA — Core Principles & Architectural Philosophy

**Document ID**: `CONVERA-FND-003`  
**Classification**: Core Epistemic & Philosophical Tenets  
**Authority Tier**: Tier 1 Foundational  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/00-foundation/PRINCIPLES.md`  
**Upstream Dependencies**: `CONSTITUTION.md, CONVERA.md`  
**Downstream Dependents**: `ENGINEERING_PRINCIPLES.md, AI_GOVERNANCE.md`  

---

> **The Philosophical and Epistemic Rationale of CONVERA.**  
> While the *Constitution* dictates mandatory operational laws, this document articulates **why** CONVERA is structured around evidence-first reasoning, knowledge/workflow separation, and reactive decision intelligence.

---

## 1. Evidence Before Assertion

### The Pathology
In conventional project management and early-stage startup accelerators, assertions are cheap. Teams formulate problem statements, market sizes, and architectural designs based on intuition, authority bias, or conversational consensus. When challenged, they search for confirmatory data rather than subjecting their claims to empirical testing.

### The CONVERA Stance
CONVERA enforces the scientific method as a software architecture:
* **Claims are not facts.** A claim is merely an articulated proposition awaiting empirical evaluation.
* **Signals require provenance.** An ungrounded LLM response or an unsourced web quote cannot contribute positive weight to a project's epistemic balance.
* **Contradiction is first-class.** The appearance of refuting evidence is celebrated as risk mitigation, not hidden as a project failure.

---

## 2. Traceability by Default

### The Pathology
Six months into a complex capstone or startup engineering effort, teams frequently encounter architectural deadlock or product failure. When reviewing why a specific database, algorithm, or market pivot was selected, no one can reconstruct:
* What evidence was available at the time?
* What alternatives were evaluated and rejected?
* What assumptions were believed to be true?

### The CONVERA Stance
Every consequential artifact in CONVERA is linked through an unbroken, multi-hop causal lineage:
$$\text{Source / DOI} \longrightarrow \text{Evidence Item} \longrightarrow \text{Claim / Assumption} \longrightarrow \text{Decision Record} \longrightarrow \text{Software Requirement}$$
This ensures that any stakeholder, committee reviewer, or future developer can audit *why* the project exists in its current state.

---

## 3. Knowledge / Workflow Separation (Orthogonality of Truth)

### The Pathology
Most productivity platforms conflate the *state of knowledge* with the *step in a workflow*. If a team moves from a Kanban board to a Scrum sprint, or from an Agile sprint to a waterfall Gantt chart, their domain data is fractured or destroyed.

### The CONVERA Stance
CONVERA maintains strict orthogonality between:
1. **The Canonical Knowledge Graph** (What is true about the problem space)
2. **The Framework Workflow** (The phased methodology used to interrogate that space)

A problem statement, its linked academic papers, and its validated claims persist in normalized relational tables. Switching from the *Venture Innovation Ratchet* (Phases 1–5) to the *Computing Research Track* (Stages A–F) merely changes the operational lenses and quality gates applied to that persistent truth.

---

## 4. Decoupled Confidence & Explicit Uncertainty

### The Pathology
Modern generative AI models write with persuasive linguistic fluency regardless of factual accuracy. Humans routinely suffer from automation bias, accepting well-phrased AI assertions as objective truth.

### The CONVERA Stance
CONVERA mathematically isolates linguistic expression from factual grounding:
$$\text{AI Model Linguistic Certainty} \neq \text{Empirical Evidence Strength} \neq \text{Decision Confidence}$$
Furthermore, CONVERA embraces the **Unknowns Triangulation Model** (*Bordens & Abbott, 2018*), dividing project space into:
* **What We Know** (Verified empirical facts)
* **What We Think** (Active working hypotheses)
* **What We Don't Know** (Critical unmeasured risks and boundary conditions)

Uncertainty is made visible in real-time rather than obscured behind false confidence.

---

## 5. Reversible Decisions & Causal Blast-Radius Propagation

### The Pathology
Traditional documentation treats decisions as static entries in meeting notes or Wiki pages. When real-world conditions change (e.g., an API is deprecated, a clinical trial fails, or a customer segment rejects a value proposition), dependent technical requirements remain active in the backlog, resulting in wasted engineering cycles.

### The CONVERA Stance
Decisions in CONVERA are **living nodes** in a dependency graph. When an evidence item is invalidated or an assumption is falsified:
1. The **Impact Engine** traces the causal blast-radius downstream.
2. Dependent decisions are automatically marked with **`STALE_REVIEW_REQUIRED`**.
3. The UI surfaces an **`ImpactAlertBanner`**, enabling 1-click pivot loops and structured rationale re-evaluation without deleting historical records.

---

## 6. Provider Independence & Free-First Posture

### The Pathology
Many modern "AI platforms" are fragile wrappers around a single proprietary vendor API, requiring paid subscriptions, proprietary vector databases, and expensive cloud runtimes that exclude students, independent researchers, and developers in emerging regions.

### The CONVERA Stance
CONVERA is architecturally designed to be **100% functional at $0 cost**:
* **Persistence:** Local SQLite WAL mode with zero configuration.
* **AI Cascade:** Multi-tier fallback (Gemini Flash $\to$ Groq $\to$ Local Ollama).
* **Research Hub:** Open-access scholarly graph connectors (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar).
* **Similarity:** Fast, in-memory TF-IDF and token deduplication without vector DB hosting fees.

Cloud services (GCP, BigQuery) serve strictly as optional acceleration layers.

---

## 7. Socratic AI Collaboration (Human-in-the-Loop)

### The Pathology
Autonomous agents that make unreviewed architectural decisions or write unverified research proposals create brittle, unaccountable software and academic fraud.

### The CONVERA Stance
CONVERA positions AI as a **Socratic Critic, Literature Scout, and Methodological Verifier**:
* **AI Generates:** Candidate problem breakdowns, literature matrices, gap hypotheses, and trade-off comparisons.
* **Human Ratifies:** Phase advancement, Quality Gate sign-offs, decision commitments, and final proposal submissions.

---

## 8. Minimal Architectural Change & Clean Inversion of Control

### The Pathology
Software projects deteriorate when developers add ad-hoc tables, cross-layer imports, or redundant connector classes to satisfy short-term feature requests.

### The CONVERA Stance
* **Zero Circular Dependencies:** Domain routers call core engines; engines interact with persistence solely via abstract adapter interfaces (`BaseStorageAdapter`).
* **Additive Evolution:** New framework stages, connectors, and export formats must extend existing abstractions without breaking existing schemas or tests.
* **Test-Backed Reality:** Code and documentation must be continuously verified through comprehensive automated unit, integration, and end-to-end regression suites.
