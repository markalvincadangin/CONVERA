<!--
Sync Note: This document is the OPERATIONAL PROJECTION of docs/00-foundation/CONSTITUTION.md.
Do not edit this document independently; all changes must originate in docs/00-foundation/CONSTITUTION.md.
-->

# CONVERA — Agent Operational Constitution

> **Non-Negotiable Rules for Antigravity & Spec Kit Agents.**  
> Derived directly from `docs/00-foundation/CONSTITUTION.md`. Every proposed change, tool execution, and code generation must comply with these operational constraints.

---

## 1. Rule I: Knowledge ≠ Workflow (Canonical Persistence)
* Canonical knowledge entities (`Problem`, `Claim`, `Evidence`, `Assumption`, `Decision`, `Requirement`) exist independently of UI phases or frameworks.
* Framework switching (Innovation $\leftrightarrow$ Research) must **never** delete, duplicate, or mutate persistent knowledge records.
* Workflows query and enrich knowledge; they do not own or isolate domain truth.

---

## 2. Rule II: Decoupled Confidence & Anti-Hallucination
* Strictly enforce:
  $$\text{AI Linguistic Certainty} \neq \text{Empirical Evidence Strength} \neq \text{Decision Confidence}$$
* Never treat fluent AI responses as factual ground truth.
* If AI confidence is $\ge 0.80$ while empirical evidence strength is $\le 0.40$, trigger an **`OVERCONFIDENCE_WARNING`**.

---

## 3. Rule III: Mandatory Provenance & Evidence Tiers
* No information may be promoted to an Evidence record without provenance metadata sufficient to reconstruct its origin, extraction context, and verification state.
* Provenance records must preserve historical lineage and must not be silently overwritten or deleted:
  - Connector / Extraction Source ID
  - Authoritative Source Identifier (DOI, PMID, URL, or File Hash)
  - Extraction Timestamp (UTC)
  - Extracting Model & Version, when applicable
  - Researcher Verification Status (`UNVERIFIED`, `VERIFIED_BY_RESEARCHER`, `DISPUTED`)
* Evaluated Evidence weights: Tier A (3.0), Tier B (2.0), Tier C (1.0).

---

## 4. Rule IV: Non-Destructive Invalidation & Blast Radius
* Decision audit logs are **immutable**; decision validity is **reactive**.
* When evidence is refuted or assumptions fail, the **Impact Engine** must flag dependent decisions with `STALE_REVIEW_REQUIRED`.
* Never silently overwrite or delete human decisions; surface the `ImpactAlertBanner`.

---

## 5. Rule V: External Boundary & Free-First Posture
* External AI/search providers are ephemeral signal generators; CONVERA exclusively owns persistent context and knowledge structure.
* Core platform must function at $0 cost on local SQLite WAL and free-access APIs (OpenAlex, CrossRef, PubMed, Europe PMC, Semantic Scholar, Ollama).
* Always maintain multi-tier provider fallbacks (`Gemini` $\to$ `Groq` $\to$ `Ollama`).

---

## 6. Rule VI: Two-Way Documentation Consistency & Conflict Resolution
* Do not assert unverified features in documentation; do not leave permanent architectural changes undocumented.
* When documentation, specifications, implementation, and tests disagree, it is a **ratification defect**, not permission to silently reinterpret any layer.
* Surface the conflict and obtain human ratification before making a consequential change.

---

## 7. Rule VII: Human Ratification for Consequential Gates
* AI acts as Socratic assistant (generating breakdowns, literature grids, gap analyses).
* Humans must ratify Quality Gates 1–4, decision commitments, and final proposal submissions.
