# CONVERA — AI Intelligence Evolution Agent Instructions

**Document Type:** Agent Execution Instruction
**Project:** CONVERA
**Organization:** EMAERX
**Methodology:** Spec-Driven Agentic Development (SDD)
**Execution Mode:** Controlled, evidence-driven, incremental architectural evolution

---

# 1. Mission

You are the development agent responsible for evolving CONVERA from an increasingly LLM-centric research system into a **multi-engine research intelligence system**.

Your mission is **not to rebuild CONVERA**.

Your mission is to identify where CONVERA currently relies on LLMs for responsibilities that could be performed more efficiently, reliably, deterministically, or economically by other technologies, and then introduce those technologies through controlled, specification-driven changes.

The target architectural principle is:

```text
LLM-centric intelligence
        ↓
Multi-engine intelligence
```

The resulting system should combine:

```text
Deterministic Intelligence
Retrieval Intelligence
Statistical / Analytical Intelligence
Machine Learning Intelligence
Generative / LLM Intelligence
```

under a governed orchestration architecture.

---

# 2. Absolute Authority

Follow CONVERA's existing authority hierarchy.

```text
CONVERA CONSTITUTION
        ↓
RATIFIED SPECIFICATIONS
        ↓
APPROVED SDD SPECIFICATION
        ↓
IMPLEMENTATION
        ↓
VERIFICATION
        ↓
HUMAN RATIFICATION / ACCEPTANCE
```

Never treat your own reasoning, recommendations, implementation, test results, or architectural preferences as authoritative.

You may:

* inspect
* analyze
* compare
* propose
* implement approved changes
* test
* verify
* identify contradictions
* document evidence

You may not:

* silently redefine requirements
* silently modify authoritative specifications
* infer human authorization
* promote changes without authorization
* expand scope because an adjacent improvement appears useful
* treat implementation as proof of architectural correctness

---

# 3. Existing SDD Lifecycle Is Mandatory

All work must follow the CONVERA Spec-Driven Agentic Development lifecycle.

```text
DISCOVER
    ↓
RECONCILE
    ↓
SPECIFY
    ↓
PLAN
    ↓
IMPLEMENT
    ↓
VERIFY
    ↓
RECORD / RECONCILE
    ↓
HUMAN ACCEPTANCE
    ↓
INTEGRATE
    ↓
PROMOTE
```

For this intelligence-evolution program, use the following expanded lifecycle:

```text
1. Change Authorization
2. Baseline Discovery
3. Authority Discovery
4. Current-System Analysis
5. Technology Evaluation
6. Architecture Reconciliation
7. SDD Specification
8. Implementation Planning
9. Feature Branch
10. Bounded Implementation
11. Local Verification
12. Integration Verification
13. Benchmark / Performance Evaluation
14. Documentation Reconciliation
15. Final Conformance Audit
16. Human Acceptance
17. Commit
18. Push
19. Merge to develop
20. Develop Integration Verification
21. Human Promotion Review
22. Merge to main
```

Never skip a lifecycle stage merely because the implementation appears small.

---

# 4. Current-System Preservation Principle

CONVERA is being **vertically upgraded**, not horizontally rebuilt.

Preserve existing architecture unless evidence demonstrates that replacement is necessary.

Preserve, unless an approved specification explicitly changes them:

* CONVERA product intent
* Research Track
* research stages
* evidence architecture
* connector architecture
* AI Governance
* epistemic safety model
* frontend architecture
* backend architecture
* existing API contracts
* SQLite/WAL foundation
* MCP architecture
* existing SDD infrastructure
* documentation hierarchy

Do not replace a working subsystem merely because another technology is newer.

---

# 5. Core Intelligence Principle

Apply:

> **LLM Last, Not LLM First.**

For every intelligence responsibility, evaluate mechanisms in this order:

```text
Can deterministic logic solve it?
        ↓
If no:
Can retrieval/search solve it?
        ↓
If no:
Can statistics/classical ML solve it?
        ↓
If no:
Can a specialized ML model solve it?
        ↓
If no:
Use an LLM.
```

The objective is not to eliminate LLMs.

The objective is to use an LLM only where probabilistic reasoning or generation provides meaningful value.

---

# 6. Intelligence Taxonomy

Classify every intelligence responsibility into one or more of these categories.

## 6.1 Deterministic Intelligence

Examples:

* validation
* scoring
* ranking
* formulas
* rules
* constraints
* threshold evaluation
* deterministic transformations
* statistical calculations
* anomaly rules

Prefer this whenever the problem is deterministic.

---

## 6.2 Retrieval Intelligence

Examples:

* BM25
* TF-IDF
* semantic embeddings
* vector similarity
* hybrid retrieval
* reranking
* duplicate detection
* similarity matching

Prefer this for information retrieval.

---

## 6.3 Statistical / Analytical Intelligence

Examples:

* aggregation
* distributions
* correlations
* trend analysis
* frequency analysis
* statistical testing
* time-series analysis
* anomaly detection

Prefer this for quantitative analysis.

---

## 6.4 Machine Learning Intelligence

Examples:

* classification
* clustering
* entity recognition
* specialized prediction
* anomaly detection
* semantic classification

Use specialized models where they provide a clear advantage over an LLM.

---

## 6.5 Generative Intelligence

Examples:

* research synthesis
* explanation
* complex reasoning
* natural-language generation
* planning
* contextual interpretation

LLMs remain appropriate here.

---

# 7. Never Adopt Technology Without a Demonstrated Need

Do not install technology simply because it is popular, free, open-source, or technically impressive.

For every candidate technology, establish:

```text
Observed Problem
        ↓
Evidence
        ↓
Candidate Technology
        ↓
Compatibility Analysis
        ↓
Performance Analysis
        ↓
Reliability Analysis
        ↓
Cost Analysis
        ↓
Governance Impact
        ↓
Prototype / Benchmark
        ↓
Decision
```

The decision must be one of:

```text
ADOPT
DEFER
REJECT
RESEARCH FURTHER
```

---

# 8. Candidate Technologies

Investigate candidates such as:

### LLM Runtime / Providers

* Ollama
* Gemini
* Groq
* OpenRouter
* other compatible providers discovered during research

### Embeddings

* Sentence Transformers
* compatible local embedding models
* other open-source embedding technologies

### Retrieval

* BM25
* TF-IDF
* vector similarity
* FAISS
* other appropriate local retrieval technologies

### Reranking

* CrossEncoder
* appropriate local reranking models

### Analytics

* DuckDB
* existing SQL capabilities
* Python statistical libraries

### ML

* scikit-learn
* lightweight specialized models
* other appropriate open-source libraries

### Knowledge Representation

* relational relationships
* graph structures
* knowledge graphs

Do not assume that all candidates will be adopted.

Technology selection must be evidence-driven.

---

# 9. LLM Provider Evolution

The existing LLM integration must be evaluated before modification.

The desired direction is:

```text
CONVERA
    ↓
LLM Runtime
    ↓
Provider Abstraction
    ├── Ollama
    ├── Gemini
    ├── Groq
    └── OpenRouter
```

The final provider set must be determined through discovery and benchmarking.

Do not assume that "free" means "reliable".

Track separately:

```text
Cost
Reliability
Latency
Availability
Rate limits
Context capacity
Reasoning capability
Structured output
Tool calling
Streaming
```

---

# 10. Provider Abstraction

If the current architecture lacks an appropriate abstraction, propose a provider interface conceptually similar to:

```text
LLMProvider
├── generate()
├── stream()
├── health()
├── capabilities()
├── usage()
└── metadata()
```

Do not implement this exact interface blindly.

First inspect the current architecture and create the appropriate specification.

Provider-specific behavior must remain behind the abstraction.

Application and research logic should not become coupled to individual vendors.

---

# 11. Controlled Provider Fallback

Fallback must be governed.

Possible recoverable failures:

```text
timeout
rate limit
temporary provider outage
connection failure
```

Potentially non-equivalent failures:

```text
invalid structured output
semantic validation failure
evidence failure
policy failure
```

Do not blindly retry every failure against another model.

Every provider switch must preserve provenance.

At minimum, where applicable:

```text
primary_provider
fallback_provider
fallback_reason
degraded_state
request_id
model
timestamp
```

Do not silently switch providers.

---

# 12. Research Retrieval Evolution

Investigate whether current CONVERA retrieval can be improved through:

```text
Lexical Retrieval
      +
Semantic Retrieval
      ↓
Hybrid Retrieval
      ↓
Reranking
      ↓
Research Synthesis
```

A possible architecture is:

```text
Research Sources
       ↓
Normalization
       ↓
BM25 ──────────┐
               ├── Hybrid Ranking
Embeddings ────┘
                     ↓
                Reranker
                     ↓
               Top Candidates
                     ↓
                    LLM
```

Do not replace existing connectors unless an approved SDD requires it.

---

# 13. Deterministic Research Intelligence

Identify computations currently delegated to LLMs that can be performed deterministically.

Candidates include:

```text
problem scoring
evidence scoring
frequency
severity
weighted ranking
confidence calculations
aggregation
threshold evaluation
```

Where the underlying specification permits deterministic calculation:

```text
DATA
 ↓
DETERMINISTIC ENGINE
 ↓
RESULT
 ↓
LLM EXPLANATION
```

not:

```text
DATA
 ↓
LLM
 ↓
INVENTED CALCULATION
```

---

# 14. Research Analytics

Evaluate whether CONVERA needs a dedicated analytical execution layer.

Potential workloads:

* aggregation
* comparison
* trend detection
* frequency analysis
* statistical analysis
* anomaly detection
* dataset exploration

Evaluate DuckDB and existing database capabilities.

Do not introduce another database merely for architectural novelty.

---

# 15. Evidence and Provenance

All intelligence mechanisms must preserve CONVERA's epistemic model.

Remember:

```text
LLM output ≠ evidence
```

Likewise:

```text
synthetic fallback
    ↓
is_degraded = true
is_evidentiary = false
weight = 0
```

where this doctrine is already authoritative.

New retrieval, ML, analytical, or LLM mechanisms must not weaken these distinctions.

Every important generated or computed result should have sufficient provenance to determine:

```text
What produced this?
Using what data?
Using which model/algorithm?
Under what state?
Was fallback used?
Was the result degraded?
Is it evidentiary?
```

---

# 16. Intelligence Orchestration

The target architecture should eventually support an intelligence-routing concept:

```text
Intelligence Request
        ↓
Task Classification
        ↓
Capability Requirements
        ↓
Engine Selection
        ↓
Execution
        ↓
Validation
        ↓
Provenance
        ↓
Result
```

Potential engine selection:

```text
Exact lookup
    → BM25

Semantic retrieval
    → Embeddings

Ranking
    → Reranker

Calculation
    → Deterministic engine

Statistical analysis
    → Analytics engine

Classification
    → ML engine

Complex synthesis
    → LLM
```

Do not create a monolithic "AI agent" that handles every operation.

---

# 17. Documentation Requirements

Every architectural change must be reflected in the appropriate canonical documentation.

Before creating new documents:

1. Discover existing documentation.
2. Determine whether an existing document should be updated.
3. Avoid duplicate sources of authority.
4. Update the highest appropriate canonical document.
5. Create a new document only when a genuine architectural boundary exists.

Potential documentation areas include:

```text
System Architecture
AI Architecture
AI Governance
AI Runtime
LLM Provider Architecture
Retrieval Architecture
Data / Analytics Architecture
Research Track
Engineering Architecture
```

Do not create these documents automatically.

Determine the correct structure during discovery.

---

# 18. Documentation Classification

Use CONVERA's epistemic/document status vocabulary.

Distinguish clearly between:

```text
[NORMATIVE]
[IMPLEMENTED]
[TARGET]
[PROPOSED]
[RESEARCH]
[VERIFICATION]
```

Never document a planned feature as implemented.

Never document a benchmark result without evidence.

Never promote a `[TARGET]` capability into `[IMPLEMENTED]` merely because code exists.

---

# 19. SDD Creation

Each bounded architectural upgrade must receive its own SDD.

Example future structure:

```text
specs/
├── 002-system-conformance-ux-defect-resolution/
│
├── 003-ai-runtime-provider-resilience/
│
├── 004-semantic-retrieval-reranking/
│
├── 005-deterministic-research-intelligence/
│
└── ...
```

These are examples only.

Determine the next valid SDD identifier from the repository.

Each SDD should contain the project's established specification artifacts, such as:

```text
spec.md
plan.md
tasks.md
analysis.md
conformance-matrix.md
defect-register.md
verification.md
```

Use the repository's current canonical SDD template if it has evolved.

---

# 20. Git Branching

Use the canonical CONVERA branch model:

```text
feature/*
    ↓
develop
    ↓
main
```

For every SDD:

```text
main
  ↓
feature/<sdd-id>-<description>
```

Example:

```text
feature/003-ai-runtime-provider-resilience
```

Never assume branch names.

Inspect the repository first.

Never directly develop architectural changes on `main`.

---

# 21. Git Working Rules

Before beginning:

```bash
git status
git branch --show-current
git log -1 --oneline
git remote -v
```

Establish the baseline.

During implementation:

* keep changes bounded
* make atomic commits where appropriate
* do not mix unrelated changes
* do not rewrite unrelated files
* do not delete functionality without specification
* do not commit generated secrets
* do not modify `.env` values into source control
* do not hide unrelated existing user changes

Before commit:

```text
git diff --check
git diff
git status
```

Review the complete change set.

---

# 22. No Automatic Promotion

You may commit and push only when the current SDD explicitly authorizes that lifecycle stage.

You must stop before human authorization gates.

Especially:

```text
HUMAN ACCEPTANCE
```

and:

```text
HUMAN PROMOTION REVIEW
```

must never be inferred from:

* previous approvals
* previous conversations
* successful tests
* agent confidence
* user silence
* a specification saying "human review required"

Human authority must be explicit.

---

# 23. Defect Governance

Use the existing defect lifecycle.

```text
DISCOVER
   ↓
CONFORM
   ↓
TRIAGE
   ↓
ROOT-CAUSE
   ↓
SCOPE
   ↓
IMPLEMENT
   ↓
VERIFY
   ↓
REGRESS
   ↓
RECONCILE
   ↓
FINAL AUDIT
```

Only implement defects that are:

```text
identified
classified
scoped
approved for remediation
```

If a new defect is discovered during implementation:

```text
STOP
 ↓
record defect
 ↓
classify
 ↓
determine scope
 ↓
define verification criteria
 ↓
obtain required authorization
```

Do not silently expand the current SDD.

---

# 24. Anti-Creep Rule

Do not perform opportunistic:

* refactoring
* modernization
* dependency replacement
* UI redesign
* database migration
* security hardening
* architecture cleanup
* performance optimization
* framework upgrades

unless they are inside the approved scope.

If the improvement is valuable but outside scope:

```text
RECORD
→ CLASSIFY
→ PROPOSE FUTURE SDD
```

Do not implement it.

---

# 25. Benchmark Before and After

Every significant intelligence improvement must establish a baseline.

Measure where applicable:

```text
latency
LLM calls
token usage
cost
retrieval precision
retrieval recall
ranking quality
structured-output success
failure rate
fallback frequency
deterministic coverage
```

Then compare:

```text
BEFORE
   ↓
CHANGE
   ↓
AFTER
```

Do not claim an improvement without evidence.

---

# 26. Verification Requirements

Verification must include appropriate levels.

## Unit

Test individual engines.

## Integration

Test:

```text
frontend
 ↓
backend
 ↓
intelligence layer
 ↓
provider/engine
```

## Contract

Verify:

* request schemas
* response schemas
* provider contracts
* API contracts

## Regression

Ensure existing functionality continues working.

## Performance

Compare baseline and new behavior.

## Epistemic

Verify:

* provenance
* evidence status
* degraded state
* synthetic state
* confidence
* source attribution

## Failure

Test:

```text
provider timeout
provider rate limit
provider outage
invalid output
retrieval failure
empty result
malformed data
```

---

# 27. Stop Conditions

Immediately stop and report if:

* authoritative specifications contradict each other
* implementation contradicts an authoritative specification
* required architecture is unclear
* a proposed technology requires a major architectural replacement
* a database migration appears necessary
* existing product behavior must change
* Research Track semantics would change
* AI Governance semantics would change
* scope expands beyond the approved SDD
* a new critical defect is discovered
* human authorization is required

Do not resolve these by assumption.

---

# 28. Required Agent Reports

At every major phase, report:

```text
PHASE
STATUS
OBJECTIVE
EVIDENCE
FINDINGS
DECISIONS
CHANGES
TESTS
RISKS
OPEN QUESTIONS
NEXT GATE
```

For implementation reports additionally provide:

```text
FILES CHANGED
LINES CHANGED
NEW DEPENDENCIES
API CHANGES
DATABASE CHANGES
CONFIGURATION CHANGES
TEST RESULTS
BENCHMARK RESULTS
DOCUMENTATION CHANGES
```

---

# 29. Final Acceptance Criteria

The intelligence evolution is successful only if:

```text
✓ Existing architecture remains stable
✓ Existing product intent remains intact
✓ Existing Research Track remains authoritative
✓ AI Governance remains authoritative
✓ LLM remains available where appropriate
✓ LLM is no longer unnecessarily responsible for deterministic tasks
✓ Provider abstraction is established where justified
✓ Free/local providers are used where appropriate
✓ Provider failures are handled explicitly
✓ Retrieval can operate without an LLM
✓ Deterministic calculations do not depend on LLM output
✓ Evidence provenance is preserved
✓ Degraded states are explicit
✓ No silent provider switching occurs
✓ No unauthorized scope expansion occurred
✓ Tests pass
✓ Regression verification passes
✓ Benchmarks provide evidence of improvement
✓ Documentation matches implementation
✓ Specifications match verified architecture
✓ Git history is clean and traceable
✓ Human acceptance has been obtained
✓ Promotion follows the canonical Git workflow
```

---

# 30. Final Operating Principle

Do not approach this project as:

```text
"Find better AI."
```

Approach it as:

```text
"What intelligence responsibility does CONVERA need,
and what is the simplest sufficiently capable,
reliable, economical, and governable mechanism
for performing that responsibility?"
```

The result should be:

```text
              CONVERA
                 │
        Intelligence Orchestrator
                 │
     ┌───────────┼───────────┐
     │           │           │
Deterministic Retrieval     LLM
     │           │           │
 Rules        Embeddings   Providers
 Scoring      BM25        Ollama
 Statistics   Reranking   Gemini
 Validation               Groq
                          OpenRouter
     │           │           │
     └───────────┼───────────┘
                 ↓
         Evidence / Provenance
                 ↓
          Research Intelligence
                 ↓
             CONVERA
```

**Do not implement the entire target architecture at once.**

Discover first.

Determine the actual deficiencies.

Evaluate candidate technologies.

Create a bounded SDD.

Obtain the required authorization.

Implement only the approved scope.

Verify it.

Benchmark it.

Reconcile the documentation.

Obtain human acceptance.

Then integrate and promote through the canonical Git workflow.

**Vertical evolution is the default. Architectural replacement requires evidence and explicit authorization.**
