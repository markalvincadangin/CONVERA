# CONVERA — The System Constitution

**Document ID**: `CONVERA-FND-001`  
**Classification**: Constitutional Invariants & Supreme Governance  
**Authority Tier**: Tier 1 Supreme Normative  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/00-foundation/CONSTITUTION.md`  
**Upstream Dependencies**: `None (First Principles)`  
**Downstream Dependents**: `All Layers (01-product through 08-operations)`  

---

> **The Supreme Normative Law of CONVERA and its Engineering Agents.**  
> Every architectural modification, engine implementation, agent prompt, and code commit must strictly comply with the Articles of this Constitution. No operational rule or prompt may override these Articles.

---

## Article I: Knowledge ≠ Workflow (Canonical Independence)

1. **Persistent Canonical Reality:**  
   Canonical knowledge entities—including **Problems, Claims, Evidence, Assumptions, Decisions, and Requirements**—exist independently of the user interface, active phase, or selected framework.
2. **Framework Non-Destruction:**  
   Switching operational frameworks (e.g., from `INNOVATION_RATCHET` to `RESEARCH_CRCDP`) must preserve all canonical entities and historical decision logs without data loss, schema corruption, or entity duplication.
3. **Workflow as a Lens:**  
   Workflow phases, quality gates, and wizards are temporary lenses that query, enrich, and test canonical knowledge; they do not own or silo persistent domain truth.

---

## Article II: Tri-Part Confidence Decoupling

1. **The Decoupling Invariant:**  
   CONVERA strictly decouples and independently calculates three distinct confidence dimensions:
   $$\text{AI Model Linguistic Certainty} \neq \text{Empirical Evidence Strength} \neq \text{Decision Confidence}$$
2. **Anti-Hallucination Guardrail:**  
   Linguistic fluency, syntactic confidence, or emphatic language from an LLM must never be treated as empirical validation or factual ground truth.
3. **Overconfidence Risk Enforcement:**  
   Whenever AI linguistic certainty is high ($\ge 0.80$) while supporting empirical evidence is weak or unverified ($\le 0.40$), the system must explicitly raise an **`OVERCONFIDENCE_WARNING`**.

---

## Article III: Evidence Progression & Provenance Integrity

1. **The Three-Stage Evidence Lifecycle:**  
   Raw data must progress through three strict epistemic gates before influencing decision validity:
   $$\text{Raw Signal (Untrusted)} \longrightarrow \text{Provenance-Bearing Item (Traceable)} \longrightarrow \text{Evaluated Evidence (Weighted)}$$
2. **Mandatory Provenance Metadata:**  
   No information may be promoted to an Evidence record without provenance metadata sufficient to reconstruct its origin, extraction context, and verification state.

   Provenance records must preserve historical lineage and must not be silently overwritten or deleted. At minimum, provenance should record:
   * Connector / Extraction Source ID
   * Authoritative Source Identifier (e.g., DOI, PMID, URL, or File Hash)
   * Extraction Timestamp (UTC)
   * Extracting Model & Version, when applicable
   * Researcher Verification Status (`UNVERIFIED`, `VERIFIED_BY_RESEARCHER`, `DISPUTED`)
3. **Decoupled Scoring:**  
   Only evaluated evidence possessing verified provenance may contribute positive weight to a claim's Net Epistemic Balance.

---

## Article IV: Non-Destructive Invalidation & Reactive Blast Radius

1. **Immutable History, Reactive Validity:**  
   Decision audit logs, past evaluation records, and historical phase outputs are **immutable** and must never be deleted or silently edited. However, their **validity status** is reactive and subject to empirical review.
2. **Causal Blast-Radius Propagation:**  
   When an empirical evidence item is contradicted, falsified, or retracted, the **Impact Propagation Engine** must trace all downstream dependencies:
   $$\text{Evidence Invalidation} \longrightarrow \text{Claim State: CONTESTED} \longrightarrow \text{Dependent Decision: STALE\_REVIEW\_REQUIRED}$$
3. **Non-Destructive Alerting:**  
   Contradictory evidence must never silently overwrite or destroy human decisions; it must alert the user via visible blast-radius warnings (`ImpactAlertBanner`) and prompt explicit human review or structured pivot loops.

---

## Article V: External Boundary Principle (Context Ownership)

1. **Signals vs. Truth:**  
   External LLM providers, web search engines, and academic databases provide ephemeral signals and computational capabilities.  
2. **CONVERA Owns Truth:**  
   CONVERA exclusively owns and governs persistent context, provenance records, the epistemic knowledge graph, gate criteria, and decision audit logs.
3. **Provider Agnosticism:**  
   No core feature or engine may depend permanently on a single third-party AI provider or proprietary cloud API. The platform must maintain automated fallback chains (Primary Cloud $\to$ Fast Secondary $\to$ Local Offline Engine).

---

## Article VI: Free-First Posture & Zero Mandatory Cost

1. **Zero-Cost Baseline:**  
   Every core capability of CONVERA—including problem formulation, literature synthesis, epistemic balance scoring, decision logging, and export—must be 100% operational using local storage (SQLite WAL) and free-tier/open-access services (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar, Ollama).
2. **Optional Cloud Acceleration:**  
   Enterprise cloud integrations (e.g., Google Cloud Platform, BigQuery, Vector DBs) are strictly optional acceleration layers. Their absence must never disable or break core platform functionality.

---

## Article VII: Two-Way Documentation Consistency Invariant

1. **No Phantom Claims:**  
   No authoritative documentation may assert features, architectural capabilities, or test guarantees that are not supported by the active codebase, automated tests, or explicitly ratified specifications.
2. **No Dark Architectures:**  
   No validated, permanent architectural behavior or database table may remain undocumented.
3. **Conflict Resolution & Ratification:**  
   When documentation, specifications, implementation, and tests disagree:
   * The **Constitution** defines non-negotiable intent and constraints.
   * The **Descriptive Architecture** defines the ratified structural model.
   * The **Procedural Workflows** define the required method of execution.
   * The **Implementation** represents current system behavior.
   * The **Automated Test Suite** provides executable evidence of observed behavior.

   A conflict is a **ratification defect**, not permission to silently reinterpret any layer. The responsible agent must surface the conflict, identify the affected authority, and obtain the appropriate human ratification before making a consequential change.

---

## Article VIII: Human Ratification for Consequential Commitments

1. **AI as Socratic Assistant:**  
   AI agents generate candidate problem breakdowns, propose working hypotheses, surface potential contradictions, and extract literature comparisons.
2. **Human as Authoritative Decision-Maker:**  
   Quality Gate advancement (Gates 1–4), formal decision commitments, pivot executions, and final requirements specifications strictly require human ratification.
