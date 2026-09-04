# CONVERA Project Constitution (v1.0)
**Governing Standard:** CONVERA Architectural & Engineering Governance Specification  
**Authority:** Immutable Non-Negotiable Development Principles  
**Target Scope:** Dual-Track Project Intelligence (Innovation Track + Research Track)

---

## Non-Negotiable Core Principles

1. **Knowledge is Independent from Workflow State:**  
   Problems, Claims, Evidence, Assumptions, Decisions, and Requirements exist independently in normalized relational tables. Workflow phase transitions must never destroy, overwrite, or mutate canonical knowledge records.

2. **Normalized Epistemic Entities:**  
   All epistemic components are first-class entities (`problem_claims`, `claim_evidence_links`, `problem_assumptions`, `decision_records`, `requirements_traceability`). Unstructured JSON blobs must never replace structured relational entities.

3. **Framework Portability:**  
   Switching between frameworks (e.g. `INNOVATION_RATCHET` and `RESEARCH_CRCDP`) preserves all canonical knowledge entities. Historical decisions and audit logs remain immutable, while working claims and hypotheses remain revisable.

4. **External Signals vs. Internal Ownership:**  
   External LLMs and research services provide raw signals and candidate interpretations. CONVERA exclusively owns persistent context, evidence structure, provenance, quality gate governance, and decision intelligence.

5. **AI Output is Never Validated Fact by Default:**  
   Raw LLM generation, candidate classifications, and web citations must never automatically graduate to `VALIDATED` status without verified source provenance and researcher confirmation.

6. **First-Class Evidence Provenance:**  
   All empirical evidence must retain provenance (Connector ID, DOI/PMID, retrieval timestamp, extraction model, verification status).

7. **Epistemic Classification Standard:**  
   System statements and intelligence outputs must strictly distinguish between `[FACT]`, `[OBSERVATION]`, `[INFERENCE]`, and `[RECOMMENDATION]`.

8. **CIIA Central AI Gateway Enforcement:**  
   All external AI provider interactions must pass through CIIA (`generate_response_with_fallback`) rather than direct unabstracted SDK calls.

9. **Storage Abstraction & Domain Boundaries:**  
   Domain engines and API routers must access data through `BaseStorageAdapter` / `get_storage()`. Do not tightly couple business logic to database vendor implementation details.

10. **SQLite WAL Persistence Posture:**  
    SQLite with Write-Ahead Logging (WAL) is the core persistence architecture. Do not introduce heavy external vector databases or cloud databases without an explicit architectural decision record.

11. **Regression Immunity:**  
    Validated existing functionality and passing test suites must never be casually broken or bypassed to expedite feature delivery.

12. **Mandatory Verification Gates:**  
    Every meaningful implementation change must pass automated engineering verification (Pytest suite, Next.js TypeScript build, schema integrity, and security checks).

13. **Security & Data Isolation:**  
    Enforce parameterized SQL, strict `project_id` workspace isolation, server-side secrets handling, input sanitization, and outbound URL allowlisting.

14. **Parsimonious Architecture (Minimal Necessary Complexity):**  
    Prefer the smallest, simplest architectural addition that satisfies the validated requirement.

15. **Bounded Agent Autonomy & Human Ratification:**  
    Agents may analyze, specify, plan, implement, and verify within bounded scope. Humans retain final approval over consequential architectural changes, gate sign-offs, and production commits.

16. **Prohibition of Unnecessary Multi-Agent Swarms:**  
    Do not introduce heavy multi-agent orchestration frameworks (e.g. CrewAI, AutoGen swarms) where single-responsibility autonomous agents and deterministic engines suffice.

17. **Full Multi-Hop Traceability:**  
    Preserve bi-directional lineage from Requirements $	o$ Decisions $	o$ Evidence $	o$ Claims $	o$ Problems $	o$ Artifacts.

18. **Architectural Integrity Protection:**  
    Never rewrite or restructure core architecture merely to make agent development easier.

---

## Governance & Amendment Protocol

Amendments to this constitution require:
1. A formal Architectural Decision Record (ADR) detailing the rationale, trade-offs, and empirical justification.
2. Verified regression testing across both Innovation and Research tracks.
3. Explicit human ratification before merging changes into `main`.
