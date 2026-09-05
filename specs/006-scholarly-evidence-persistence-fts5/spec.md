# CONVERA SDD-006: Scholarly Evidence Persistence & Native Lexical Retrieval (SQLite FTS5 / BM25) Specification

**Specification ID**: CONVERA-SDD-006  
**Classification**: Literature Persistence, Local Retrieval & Offline Research Resilience  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟢 [RATIFIED & AUTHORIZED FOR IMPLEMENTATION]  
**Revision**: 1.1.0  
**Baseline Git Commit**: `dac0f0f6e7e252dbcf036417441dd92b4d56d2cd` (Released & Deployed SDD-005)  
**Proposed Feature Branch**: `feature/006-scholarly-evidence-persistence-fts5`  
**Target Integration Branch**: `develop`  
**Authoritative Upstream**:  
- `docs/00-foundation/CONSTITUTION.md` (Articles I, II, III, V, VI, VII, VIII)
- `docs/02-system/ARCHITECTURE.md` (Section 3: Storage Doctrine — SQLite WAL)
- `docs/02-system/EVIDENCE_MODEL.md` (CIIA v1.0 & CCDS Epistemic Taxonomy)
- `docs/04-ai/AI_ARCHITECTURE.md` (Rule 1: "LLM Last, Not LLM First")
- `docs/04-ai/AI_EVOLUTION_ROADMAP.md` (Capability Matrix: Local Lexical Retrieval Engine)
- `backend/connectors/base.py` (`NormalizedScholarlyWork`, `ProvenanceMetadata`)

---

## 1. Executive Summary & Purpose

The purpose of **SDD-006** is to establish the smallest adequate, fully persistent, and locally searchable scholarly evidence layer for CONVERA using the platform's existing SQLite WAL storage engine and native FTS5 full-text indexing with BM25 ranking.

### 1.1 The Operational & Architectural Problem
An empirical audit of CONVERA's research pipeline revealed that the platform operates in an **amnesic, context-starved state**:
1. **Ephemeral External Retrieval `[MEASURED PREFLIGHT FACT]`**: Academic literature queried through external connectors (OpenAlex, Semantic Scholar, Crossref, PubMed) is discarded as soon as the HTTP request terminates. Results are not stored in SQLite as a reusable scholarly corpus.
2. **Context Truncation `[MEASURED PREFLIGHT FACT]`**: Paper abstracts are aggressively truncated to exactly 400 characters (~50 words) before LLM prompt injection (`backend/agents/research_agent.py:82`), stripping empirical methodologies, sample sizes, and quantitative findings.
3. **Absence of Local Search `[MEASURED PREFLIGHT FACT]`**: CONVERA possesses zero local full-text search capability. If an external API encounters rate limits (HTTP 429), timeouts, or network disconnection, research scouting halts completely.
4. **Table-Scan Inefficiency `[MEASURED PREFLIGHT FACT]`**: Keyword filtering across the database relies strictly on unindexed `LIKE '%query%'` queries.

### 1.2 The Solution
SDD-006 introduces a zero-dependency, native SQLite architecture:
- **`scholarly_works` Relational Table**: Permanently stores fetched scholarly literature with full, untruncated abstracts, complete author lists, citation counts, and provenance metadata.
- **`scholarly_works_fts` Native FTS5 Virtual Table**: Provides sub-millisecond lexical search with native BM25 relevance ranking (`bm25()`) and Porter stemming (`tokenize='porter unicode61'`).
- **Synchronized Trigger Lifecycle & Rebuild Support**: Maintains FTS5 index integrity automatically on `INSERT`, `UPDATE`, and `DELETE`, with explicit `rebuild` protocol.
- **Connector Auto-Persistence & Offline Fallback**: Ingests external API results directly into SQLite on discovery, and automatically falls back to local BM25 search when offline or when external APIs fail, strictly preserving epistemic boundaries.

---

## 2. Specification Precedence & Governing Invariants

All agents, auditors, and engineers working on SDD-006 are governed by the strict constitutional precedence hierarchy:

```text
CONSTITUTION (docs/00-foundation/CONSTITUTION.md)
       ↓
AUTHORITATIVE SPECIFICATIONS (docs/00 through docs/08)
       ↓
SDD-006 SPECIFICATION (specs/006-scholarly-evidence-persistence-fts5/spec.md)
       ↓
CURRENT IMPLEMENTATION (backend/storage/, backend/connectors/, backend/agents/)
       ↓
AGENT REASONING
```

### Governing Invariants for SDD-006:

1. **`[NORMATIVE]` Zero External ML/Vector Dependencies Invariant**:
   - Zero machine learning frameworks (PyTorch, TensorFlow, ONNX), dense vector embeddings (`sentence-transformers`), external vector databases (FAISS, Chroma, Qdrant), or columnar engines (DuckDB) shall be introduced.
   - Retrieval MUST be executed strictly through native SQLite FTS5 with BM25 ranking.
2. **`[NORMATIVE]` Single-File SQLite WAL Storage Invariant**:
   - All scholarly literature, indices, and triggers MUST reside within the canonical SQLite database file (`backend/convera.db` / `SQLITE_PATH`).
   - Journal mode MUST remain `WAL`, synchronous MUST remain `NORMAL`, foreign keys MUST remain `ON`.
3. **`[NORMATIVE]` Full Abstract Retention Invariant**:
   - Scholarly paper abstracts MUST be persisted in full without character truncation.
   - Storage schemas MUST NOT enforce artificial truncation limits on abstract fields.
4. **`[NORMATIVE]` Epistemic Provenance Integrity Invariant**:
   - Every persisted scholarly work MUST capture source connector identifier, retrieval timestamp, canonical URL/DOI, and raw metadata JSON to satisfy CIIA v1.0.
5. **`[NORMATIVE]` Graceful Offline Degradation Invariant**:
   - On network outage or connector failure, `ConnectorHub` MUST fall back to local FTS5 BM25 search, stamping returned records with `is_offline = True`, `is_cached = True`, and preserving operational continuity.
6. **`[NORMATIVE INV-006-FTS]` FTS5 Index Synchrony Invariant**:
   - The virtual table `scholarly_works_fts` MUST reflect 100% of rows in `scholarly_works`. Every write operation MUST atomically update or delete corresponding index entries. Explicit index rebuild (`'rebuild'`) MUST be supported.
7. **`[NORMATIVE INV-006-EPISTEMIC]` Offline Epistemic Non-Elevation Invariant**:
   - Storing a record locally is strictly a storage mechanism, not an epistemic elevation event. Local cached retrieval MUST NOT upgrade or alter the authority tier of an evidence candidate. Cached status MUST be explicitly disclosed in downstream outputs.

---

## 3. Database Schema & Architecture

### 3.1 Relational Storage: `scholarly_works`

A dedicated relational table is introduced in `backend/storage/sqlite_adapter.py`:

```sql
CREATE TABLE IF NOT EXISTS scholarly_works (
    id TEXT PRIMARY KEY,                       -- Deterministic canonical ID: 'SW-DOI-' or 'SW-TTL-' + SHA256(...)[:16]
    doi TEXT UNIQUE,                           -- Normalized lowercase DOI (NULL if unpublished/unassigned)
    title TEXT NOT NULL,                       -- Cleaned title
    abstract TEXT,                             -- Full, untruncated abstract
    authors TEXT,                              -- JSON array of author strings
    year INTEGER,                              -- Publication year (e.g. 2024)
    venue TEXT,                                -- Journal or conference name
    citation_count INTEGER DEFAULT 0,          -- Normalized citation count
    source_connector TEXT NOT NULL,            -- 'openalex' | 'semantic_scholar' | 'crossref' | 'pubmed' | 'manual'
    source_url TEXT,                           -- Direct URL or DOI link
    raw_metadata TEXT,                         -- Complete raw JSON payload from connector
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scholarly_works_doi ON scholarly_works(doi);
CREATE INDEX IF NOT EXISTS idx_scholarly_works_year ON scholarly_works(year);
CREATE INDEX IF NOT EXISTS idx_scholarly_works_connector ON scholarly_works(source_connector);
```

### 3.2 Full-Text Indexing: `scholarly_works_fts`

To eliminate redundant text storage `[ESTIMATE: saves ~60% index storage footprint]`, the FTS5 virtual table utilizes SQLite's native **External Content Table** pattern (`content='scholarly_works'`). FTS5 indexes tokens while referencing raw text directly from the parent table's `rowid`:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS scholarly_works_fts USING fts5(
    title,
    abstract,
    venue,
    content='scholarly_works',
    content_rowid='rowid',
    tokenize='porter unicode61 remove_diacritics 1'
);
```

#### Tokenizer Configuration:
- `porter`: Applies standard Porter Stemming algorithm (e.g., `harvesting` $\rightarrow$ `harvest`, `losses` $\rightarrow$ `loss`, `agricultural` $\rightarrow$ `agricultur`).
- `unicode61`: Handles multi-lingual unicode characters and punctuation stripping.
- `remove_diacritics 1`: Normalizes accented characters.

### 3.3 Automated Index Lifecycle Triggers & Rebuild Protocol

SQLite database triggers maintain 100% synchronization between `scholarly_works` and `scholarly_works_fts`:

```sql
-- Trigger: Synchronize on INSERT
CREATE TRIGGER IF NOT EXISTS trg_scholarly_works_ai AFTER INSERT ON scholarly_works BEGIN
    INSERT INTO scholarly_works_fts(rowid, title, abstract, venue)
    VALUES (new.rowid, new.title, new.abstract, new.venue);
END;

-- Trigger: Synchronize on DELETE
CREATE TRIGGER IF NOT EXISTS trg_scholarly_works_ad AFTER DELETE ON scholarly_works BEGIN
    INSERT INTO scholarly_works_fts(scholarly_works_fts, rowid, title, abstract, venue)
    VALUES ('delete', old.rowid, old.title, old.abstract, old.venue);
END;

-- Trigger: Synchronize on UPDATE
CREATE TRIGGER IF NOT EXISTS trg_scholarly_works_au AFTER UPDATE ON scholarly_works BEGIN
    INSERT INTO scholarly_works_fts(scholarly_works_fts, rowid, title, abstract, venue)
    VALUES ('delete', old.rowid, old.title, old.abstract, old.venue);
    INSERT INTO scholarly_works_fts(rowid, title, abstract, venue)
    VALUES (new.rowid, new.title, new.abstract, new.venue);
END;
```

#### Rebuild Protocol:
In the event of index desynchronization or manual data correction, the FTS5 index can be completely reconstructed from relational storage via:
```sql
INSERT INTO scholarly_works_fts(scholarly_works_fts) VALUES('rebuild');
```

---

## 4. Ingestion, Identity & Deduplication Protocol

### 4.1 Canonical Identity Generation
Every incoming scholarly record is assigned a deterministic primary key:
1. **DOI Present**:
   $$\text{canonical\_doi} = \text{doi.lower().strip().replace('https://doi.org/', '').replace('http://dx.doi.org/', '')}$$
   $$\text{id} = \text{"SW-DOI-" + SHA256(canonical\_doi)[:16]}$$
2. **DOI Absent**:
   $$\text{clean\_title} = \text{re.sub(r'[^a-z0-9]', '', title.lower())}$$
   $$\text{id} = \text{"SW-TTL-" + SHA256(clean\_title + str(year or 0))[:16]}$$

### 4.2 Idempotent Upsert & Deduplication Specification (Resolving DOI and DOI-less Paths)
Because SQLite treats `NULL` values as distinct under `UNIQUE(doi)`, `ON CONFLICT(doi)` fails for records lacking a DOI. To guarantee 100% idempotent ingestion across both DOI and DOI-less records, `upsert_scholarly_works` implements a **two-stage conflict resolution protocol**:

#### Stage 1: Identity & Preflight Disambiguation
For each candidate work in the batch:
1. **DOI Lookup**: If `doi` is present, check:
   ```sql
   SELECT id FROM scholarly_works WHERE doi = ?
   ```
   If a match is found, bind `id = existing_row['id']`.
2. **Title-Year Hash Lookup**: If no record is found by DOI (or if `doi` is absent):
   ```sql
   SELECT id, doi FROM scholarly_works WHERE id = ?
   ```
   If found, bind `id = existing_row['id']`. If the existing record lacked a DOI but the candidate work now has one, stage the DOI for enrichment.

#### Stage 2: Deterministic Primary Key Upsert
Because `id` is guaranteed non-null and deterministic, all upserts execute on `CONFLICT(id)`:

```sql
INSERT INTO scholarly_works (
    id, doi, title, abstract, authors, year, venue, citation_count, source_connector, source_url, raw_metadata
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
    doi = coalesce(scholarly_works.doi, excluded.doi),
    title = CASE WHEN length(excluded.title) > length(scholarly_works.title) THEN excluded.title ELSE scholarly_works.title END,
    abstract = CASE WHEN length(coalesce(excluded.abstract, '')) > length(coalesce(scholarly_works.abstract, '')) THEN excluded.abstract ELSE scholarly_works.abstract END,
    citation_count = max(coalesce(scholarly_works.citation_count, 0), coalesce(excluded.citation_count, 0)),
    venue = coalesce(nullif(scholarly_works.venue, ''), excluded.venue),
    source_url = coalesce(nullif(scholarly_works.source_url, ''), excluded.source_url),
    raw_metadata = CASE WHEN length(coalesce(excluded.raw_metadata, '')) > length(coalesce(scholarly_works.raw_metadata, '')) THEN excluded.raw_metadata ELSE scholarly_works.raw_metadata END,
    updated_at = CURRENT_TIMESTAMP;
```

This guarantees:
- **DOI records** merge cleanly by DOI or ID.
- **DOI-less records** merge deterministically on title-year hash `SW-TTL-...`.
- If a work previously inserted without a DOI is later retrieved with a DOI, the preflight associates the DOI without violating `UNIQUE(doi)`.

---

## 5. Lexical Retrieval & Relevance Ranking

### 5.1 FTS5 Query Formulation
User queries are preprocessed to support robust Boolean and prefix search:
1. Tokenize query into alphanumeric terms.
2. Filter out standard English stopwords.
3. Apply prefix wildcards: `"cold" "storage*"` or `"post-harvest*"`.

### 5.2 Composite BM25 Relevance Formula
Raw BM25 scores in SQLite FTS5 are negative values (lower is more relevant). Column weights are configured to prioritize title matches over abstract text:
- Title Weight ($w_{\text{title}}$): `5.0`
- Abstract Weight ($w_{\text{abstract}}$): `2.0`
- Venue Weight ($w_{\text{venue}}$): `1.0`

The composite ranking score balances lexical relevance with scholarly authority:
$$S_{\text{retrieval}} = (-\text{bm25}(w_{\text{title}}, w_{\text{abstract}}, w_{\text{venue}})) \times \log_{10}(10 + \text{citation\_count})$$

This formulation guarantees that:
- Highly relevant keyword matches rank first.
- Between papers with identical keyword density, the more authoritative/cited work is prioritized.
- Zero external neural reranker is required.

---

## 6. Connector Hub & Workflow Integration

### 6.1 `ConnectorHub` Ingestion Pipeline
In [`backend/connectors/hub.py`](file:///home/markc/projects/active/CONVERA/backend/connectors/hub.py):
1. `federated_search()` queries external APIs (OpenAlex, Semantic Scholar, Crossref, PubMed) as before.
2. The deduplicated `List[NormalizedScholarlyWork]` is immediately passed to `storage.upsert_scholarly_works(works)`.
3. Results returned to callers now include the permanent `id` and `stored_in_db = True`.

### 6.2 Offline Fallback Mechanism
If network connectivity fails or all connectors return errors/exceptions:
```python
if not online_results:
    # Execute local FTS5 BM25 search
    cached_works = storage.search_scholarly_works_fts(query, limit=limit_per_source * 3)
    return cached_works  # Tagged with is_offline = True, is_cached = True
```

### 6.3 Research Agent Context Expansion
In [`backend/agents/research_agent.py`](file:///home/markc/projects/active/CONVERA/backend/agents/research_agent.py):
- The artificial truncation `w.abstract[:400]` `[MEASURED PREFLIGHT FACT]` is eliminated.
- The prompt builder passes full abstracts (up to 2,000 characters per paper, subject to total context budget), providing ~400–500% `[ESTIMATE: typical abstract 1,500-2,500 chars vs 400 cap]` more empirical grounding to the claim extractor.

### 6.4 Epistemic Treatment of Locally Cached Literature
Under `[NORMATIVE INV-006-EPISTEMIC]`:
1. **Authority Tier Invariant**: Storing a paper locally does NOT upgrade its epistemic tier. A peer-reviewed paper remains `BENCHMARK` or `FIELD_STUDY`; a backfilled manual note remains `SIGNAL`.
2. **Freshness & Provenance Stamping**: All records returned from the local cache MUST be stamped with:
   - `is_offline = True`
   - `is_cached = True`
   - `cached_at = <retrieved_at_timestamp>`
3. **Disclosure in Synthesis**: Any downstream engine (e.g. Decision Room, Literature Matrix) generating outputs while offline MUST prepend an explicit disclosure:
   > *"Synthesized using locally cached literature (retrieved: YYYY-MM-DD). Live external academic federated search was unavailable at generation time."*

---

## 7. Migration, Backfill & Backward Compatibility

### 7.1 Database Migration Protocol
The migration to add `scholarly_works` and `scholarly_works_fts` is strictly non-destructive:
- Added to `_init_db()` in `backend/storage/sqlite_adapter.py`.
- Uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
- No existing tables or columns are altered or dropped.

### 7.2 Backfill from `problem_sources` (`[MEASURED PREFLIGHT FACT: 180 rows]`)
The existing `backend/convera.db` contains exactly **180 records** in `problem_sources`:
1. A migration helper scans `problem_sources` for rows where `source_name` or `source_url` contains academic literature indicators.
2. Idempotent upsert maps available metadata:
   - `title = source_name`
   - `source_url = source_url`
   - `abstract = quote_or_summary`
   - `source_connector = 'problem_sources_backfill'`
3. Duplicate sources across problems merge cleanly on title-year or URL hash into a single `scholarly_works` record.
4. Triggers automatically index backfilled rows, followed by an explicit `INSERT INTO scholarly_works_fts(scholarly_works_fts) VALUES('rebuild');` to guarantee total index synchrony.

---

## 8. Anti-Creep Scope Analysis

### 8.1 Problem Bank Deduplication Bypass (`sqlite_adapter.py:1258`)
* **Finding `[MEASURED PREFLIGHT FACT]`**: In `sqlite_adapter.py:1258`, `add_problem()` bypasses duplicate detection when `raw_id` is supplied, resulting in **922 duplicate problem records across 997 total rows**.
* **Anti-Creep Assessment**:
  - Scholarly literature persistence is an **external evidence intake** capability.
  - Problem Bank deduplication is an **internal entity lifecycle** issue.
  - De-duplicating 922 problem records requires complex foreign key remapping across 8 relational tables.
* **Determination**:
  - Formally classified as **`DEF-DATA-001`** in the Defect Register.
  - **STRICTLY EXCLUDED** from SDD-006.

### 8.2 Problem Bank FTS5 Indexing (`problems_fts`)
* Modifying Problem Bank search touches multiple user-facing endpoints (`/api/problems`).
* **Determination**: Excluded from SDD-006 to preserve single-responsibility bounds.

---

## 9. Verification & Acceptance Criteria

### 9.1 Required FTS5 Lifecycle & Deduplication Tests
The new test file `backend/tests/test_scholarly_persistence.py` MUST implement dedicated tests for:
1. **`test_fts5_insert_lifecycle`**: Verifies inserting a row in `scholarly_works` makes it immediately retrievable via `scholarly_works_fts`.
2. **`test_fts5_update_lifecycle`**: Verifies updating a title/abstract in `scholarly_works` updates FTS5 search results without ghost matches.
3. **`test_fts5_delete_lifecycle`**: Verifies deleting a row from `scholarly_works` purges it from `scholarly_works_fts`.
4. **`test_fts5_rebuild_command`**: Verifies executing `'rebuild'` completely reconstructs the index from relational storage.
5. **`test_doi_less_deduplication_idempotency`**: Inserts two records without DOIs with identical titles and years; verifies exact update in place on `ON CONFLICT(id)` with zero constraint errors.
6. **`test_doi_enrichment_of_doi_less_record`**: Inserts DOI-less record, then re-inserts same title with a newly discovered DOI; verifies DOI is enriched without constraint violation.
7. **`test_offline_fallback_epistemic_marking`**: Mocks connector outage; verifies fallback results return `is_offline = True`, `is_cached = True`, and preserve original epistemic tier.
8. **`test_full_abstract_retention`**: Inserts a 3,000-character abstract; verifies 100% character-level equality on retrieval.
9. **`test_stemmed_bm25_retrieval`**: Queries `"harvesting"` against a paper containing `"harvest"`; verifies match and BM25 score ordering.
10. **`test_backfill_synchronization`**: Executes backfill routine on sample `problem_sources` records and verifies full FTS5 searchability.

### 9.2 Regression & Performance Invariants
- Total backend test count MUST remain $\ge 130$ tests.
- Offline regression suite (`pytest -m "not live"`) MUST execute in $\le 10$ seconds `[ENGINEERING TARGET]`.
- Zero new external Python dependencies (`pip list` unchanged).
