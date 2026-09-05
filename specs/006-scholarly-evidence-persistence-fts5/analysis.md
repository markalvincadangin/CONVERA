# CONVERA SDD-006: Architectural Impact & Technical Pre-Flight Analysis
**Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25)**

**Specification ID**: CONVERA-SDD-006  
**Classification**: Architectural Impact & Technical Pre-Flight Analysis  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & AUTHORIZED FOR IMPLEMENTATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `dac0f0f6e7e252dbcf036417441dd92b4d56d2cd`  
**Proposed Feature Branch**: `feature/006-scholarly-evidence-persistence-fts5`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `specs/006-scholarly-evidence-persistence-fts5/spec.md`  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)  
- `docs/02-system/ARCHITECTURE.md`  
- `docs/04-ai/AI_ARCHITECTURE.md`  

---

## 1. Root Cause & Architectural Pre-Flight Analysis

### 1.1 The Ephemeral Retrieval Bottleneck `[MEASURED PREFLIGHT FACT]`
Prior to SDD-006, CONVERA treated scholarly discovery purely as a pass-through proxy. When `ConnectorHub.federated_search()` executed, results from OpenAlex, Semantic Scholar, Crossref, and PubMed were converted to Pydantic objects, rendered to JSON, and discarded.
- **Root Cause**: The storage layer lacked a generalized `scholarly_works` entity, providing only `problem_sources` (a child table requiring an existing `problem_id`). Unlinked or newly discovered literature had no database destination.
- **Technical Impact**: Any subsequent search on related topics was forced to perform redundant, rate-limited HTTP queries.

### 1.2 The Context Mutilation Defect `[MEASURED PREFLIGHT FACT]`
In `backend/agents/research_agent.py:82`, the agent builder truncated paper abstracts:
```python
# The legacy truncation:
"Abstract: " + (w.abstract[:400] if w.abstract else "No abstract provided.")
```
- **Root Cause**: Early prototyping imposed arbitrary character caps to avoid hitting legacy LLM token limits.
- **Technical Impact**: Exactly 400 characters is approximately 50 English words. It systematically stripped the *Methodology*, *Results*, *Sample Sizes*, and *Statistical Significance* sections of academic abstracts. The downstream LLM claim extractor was forced to generalize because the empirical meat of the paper was deleted before prompt construction. Retaining full abstracts provides a projected ~400–500% increase in empirical context `[ESTIMATE: based on average abstract length of 1,500–2,500 characters]`.

### 1.3 Why SQLite FTS5 Outweighs Vector Embeddings at this Stage
The discovery phase evaluated whether to introduce dense vector embeddings (`sentence-transformers`), a vector index (FAISS), or native SQLite FTS5:
1. **Infrastructure Footprint**: A neural embedding pipeline requires ~500 MB of PyTorch/ONNX runtime and model weights `[ESTIMATE]`, increasing Docker image build times and memory overhead. SQLite FTS5 is already compiled into the Linux C runtime with zero added bytes `[MEASURED FACT]`.
2. **Data Scale**: CONVERA currently manages ~1,000 problem records and 180 literature references `[MEASURED PREFLIGHT FACT]`. Inverted index lexical queries with Porter stemming execute in `< 0.5 ms` on SQLite WAL `[ESTIMATE / TO BE VERIFIED BY BENCHMARK]`. Vector indexing offers zero performance benefit at this order of magnitude.
3. **Epistemic Verifiability**: BM25 ranking is 100% deterministic and transparent. A founder or researcher can inspect exact keyword matches and term frequencies without black-box cosine similarity opacity.

---

## 2. Storage Growth & Operational Footprint Analysis

### 2.1 Database Growth Modeling
- **Average Scholarly Record Size `[ESTIMATE / PROJECTION]`**:
  - Title: ~100 bytes
  - Full Abstract: ~2,000 bytes
  - Authors & Metadata JSON: ~1,000 bytes
  - Total per record in `scholarly_works`: ~3.1 KB
- **External Content FTS5 Index Overhead `[ESTIMATE / PROJECTION]`**:
  - By using `content='scholarly_works'`, FTS5 stores only the tokenized inverted index, not a duplicate copy of the raw text, projected to save ~60% disk space compared to duplicate content tables `[ESTIMATE]`.
  - Inverted index overhead: ~1.2 KB per record `[ESTIMATE]`.
- **Total Footprint Projection `[ESTIMATE / PROJECTION]`**:
  - 1,000 papers: ~4.3 MB
  - 10,000 papers: ~43 MB
  - 50,000 papers: ~215 MB
- **Operational Verdict**: Easily accommodated within the existing single-file SQLite WAL deployment topology (`/data/convera.db`). Backup routines in `scripts/deploy-prod.sh` remain instantaneous.

### 2.2 WAL Checkpointing & Concurrency
- `backend/storage/sqlite_adapter.py` operates in `PRAGMA journal_mode=WAL` with `PRAGMA synchronous=NORMAL`.
- Write operations on `scholarly_works` trigger automatic FTS5 index updates within the same transaction.
- Read operations (`search_scholarly_works_fts`) never block writes and execute concurrently across FastAPI worker threads.

---

## 3. Offline Resilience & Failure Mode Analysis

```text
Incoming Research Query
          │
          ▼
   Network Available?
     ├── YES ──► Query Federated APIs ──► Auto-Persist in SQLite ──► Return Works (is_cached=False)
     │                                                                   │
     └── NO (or 429/Timeout/DNS Error)                                  │
          │                                                              │
          ▼                                                              │
   Fallback to Local FTS5 BM25 Search                                   │
          │                                                              │
          ▼                                                              ▼
   Stamp with is_offline = True, is_cached = True ──────────────► Downstream Workflow
   (Strict Non-Elevation: Retain original authority tier)
```

### Failure Modes & Mitigations:
1. **External API Outage**: If OpenAlex or PubMed returns HTTP 503/429, `ConnectorHub` catches the error and executes local FTS5 search in $< 2$ ms `[ENGINEERING TARGET]`. Research scouting never crashes.
2. **DOI-less Literature Ingestion**: SQLite ignores NULLs in `UNIQUE(doi)`. Specifying a two-stage preflight lookup and universal upsert on deterministic `id` (`SW-TTL-...`) prevents duplicate rows and constraint crashes `[DESIGN GUARANTEE]`.
3. **FTS5 Index Desynchronization**: If index corruption occurs, the `'rebuild'` command completely reconstructs the index from `scholarly_works` base rows without relational data loss `[DESIGN GUARANTEE]`.

---

## 4. Anti-Creep & Scope Isolation Analysis

### 4.1 Proof of Independence: Problem Bank Deduplication (`DEF-DATA-001`)
- **Discovery `[MEASURED PREFLIGHT FACT]`**: In `backend/storage/sqlite_adapter.py:1258`, `add_problem()` bypasses `find_matching_problem()` whenever `raw_id` is passed, leading to 922 duplicate problem records across 997 total rows.
- **Dependency Test**: Does `scholarly_works` persistence or FTS5 search require resolving `DEF-DATA-001`?
  - `scholarly_works` is an independent literature entity.
  - External connector search does not write to the `problems` table.
  - Resolving `DEF-DATA-001` requires designing a founder-facing problem deduplication/merge protocol and migrating 997 problem rows.
  - **Conclusion**: Coupling `DEF-DATA-001` to SDD-006 would expand scope, delay literature persistence, and violate the anti-creep rule. It is strictly isolated.

### 4.2 Proof of Independence: Heuristic Scoring Hardening (`DEF-SCORE-001`)
- `evidence_scorer.py` evaluates evidence attached to problems.
- Persisting literature in SDD-006 establishes the data pipeline from which authentic evidence is drawn.
- Hardening scoring formulas immediately after SDD-006 ensures that new scoring rules operate on persistent, verifiable data.
