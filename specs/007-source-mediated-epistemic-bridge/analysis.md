# CONVERA SDD-007: Architectural Impact & Technical Pre-Flight Analysis
**Source-Mediated Epistemic Bridge (Knowledge-Workflow Integration)**

**Specification ID**: CONVERA-SDD-007  
**Classification**: Architectural Impact & Technical Pre-Flight Analysis  
**Authority Tier**: Tier 2 (Technical & Architectural Specification)  
**Document Status**: 🟡 [DRAFT — NOT YET RATIFIED / IMPLEMENTATION NOT AUTHORIZED]  
**Revision**: 0.1.0 (Draft Analysis)  
**Baseline Git Commit**: `4592ebd63e1a5243cc329586a581f5281df32642` (main)  
**Proposed Feature Branch**: `feature/007-source-mediated-epistemic-bridge` (Proposed — Not Created)  
**Target Integration Branch**: `develop`  

---

## 1. Root Cause & Architectural Pre-Flight Analysis

### 1.1 Root Cause of `DEF-KNOW-001` (Destructive Source Deletion in `update_problem`)
In `sqlite_adapter.py:1682`, the method `update_problem()` was originally implemented with a naive replace pattern:
```python
conn.execute("DELETE FROM problem_sources WHERE problem_id = ?", (problem_id,))
```
- **Architectural Impact**: This implementation was written before `claim_evidence_links` was introduced. When `claim_evidence_links` was added with `FOREIGN KEY (source_id) REFERENCES problem_sources(id) ON DELETE CASCADE`, updating a problem's metadata or sources became a **destructive operation** that cascade-wipes all attached evidence links.
- **Remediation Requirement**: Refactoring to an idempotent upsert is not merely an optimization; it is a **hard prerequisite** for any claim-evidence linking.

### 1.2 Root Cause of `DEF-KNOW-002` (Scholarly Disconnection)
- **Architectural Disconnect**: SDD-006 established `scholarly_works` with a deterministic string primary key (`SW-DOI-...` or `SW-TTL-...`) to ensure global deduplication and clean FTS5 external content indexing. However, `claim_evidence_links` remained constrained to `source_id INTEGER REFERENCES problem_sources(id)`.
- **Architectural Remedy**: **Design 2 preserves database-level referential integrity between `problem_sources` and `scholarly_works` while retaining the existing integer-based `claim_evidence_links → problem_sources` relationship.**

---

## 2. Critical Evaluation of Design 2 Trade-offs

| Trade-off Dimension | Assessment | Analysis & Justification |
|---|---|---|
| **Referential Integrity** | **Highest** | SQLite natively enforces `FOREIGN KEY (scholarly_work_id) REFERENCES scholarly_works(id) ON DELETE SET NULL`. If a scholarly paper is deleted, source citations remain intact with `scholarly_work_id = NULL`. |
| **Traversal Complexity** | **2-Hop Join** | Querying literature from a claim requires joining `claim_evidence_links` → `problem_sources` → `scholarly_works`. On SQLite WAL with indexes on foreign keys, this 2-hop join executes in $< 0.1$ ms `[ESTIMATE]`. |
| **Citation Duplication** | **Managed** | If Paper X is cited by 3 problems, 3 rows exist in `problem_sources`, each pointing to `SW-DOI-X`. This is conceptually correct: each problem has its own citation instance, excerpt (`quote_or_summary`), and local credibility tier, while global bibliographic metadata is normalized in `scholarly_works`. |
| **Polymorphism Rejection** | **Validated** | Design 3 (polymorphic `source_id`) was rejected because SQLite cannot enforce conditional foreign keys. Bypassing database foreign keys would allow orphaned links and corruption. |

---

## 3. Query Performance & Storage Footprint Modeling

### 3.1 2-Hop Traversal Query Benchmark Model
```sql
SELECT l.id AS link_id, l.relation_type, l.evidence_strength,
       s.id AS source_id, s.source_name, s.source_tier, s.quote_or_summary,
       sw.id AS scholarly_id, sw.title, sw.doi, sw.venue, sw.year, sw.citation_count
FROM claim_evidence_links l
LEFT JOIN problem_sources s ON l.source_id = s.id
LEFT JOIN scholarly_works sw ON s.scholarly_work_id = sw.id
WHERE l.claim_id = ?;
```
- **Index Support**:
  - `idx_problem_sources_pid` covers `problem_sources(problem_id)`.
  - `idx_problem_sources_sw` covers `problem_sources(scholarly_work_id)`.
  - Primary keys index `claim_evidence_links(id)` and `scholarly_works(id)`.
- **Latency Projection**: $< 0.5$ ms per claim traversal on standard hardware `[ESTIMATE]`. Zero table scans.

### 3.2 Storage Growth Projection
- Adding `scholarly_work_id TEXT` (average 24 bytes) to `problem_sources`:
  - 1,000 sources: ~24 KB `[ESTIMATE]`.
  - Index `idx_problem_sources_sw`: ~16 KB `[ESTIMATE]`.
  - Negligible impact on database file size (`convera.db`).

---

## 4. Unresolved Policy Decisions (Architectural Contract Questions)

Before full workflow integration can occur beyond the vertical slice, human governance must formally resolve:

1. **`[OPEN DECISION]` Scholarly Authority Tier Rule**:
   - `knowledge_lifecycle.py` uses `source_tier` ('A': 3.0, 'B': 2.0, 'C': 1.0) to calculate epistemic points.
   - `scholarly_works` contains citation counts and venues, but no tier.
   - How should `source_tier` be assigned to academic literature?
     - *Proposed for vertical slice*: Explicit manual tier assignment.
     - *Policy needed for future*: Deterministic formula vs. researcher manual review vs. default 'B'.
2. **`[OPEN DECISION]` Claim Activation Authority**:
   - Do LLM-extracted claims activate automatically upon Phase 1 completion, or require manual verification in the Problem Bank?
3. **`[OPEN DECISION]` Evidence Relation Classification**:
   - Under what protocol are `relation_type` (`SUPPORTS` vs. `CONTRADICTS`) and `evidence_strength` assigned?
   - Automatic assignment by an LLM without human confirmation is explicitly prohibited.
4. [OPEN DECISION] Systemic Source-of-Truth Precedence:
   The broader architectural precedence between sessions.state_data JSON and SQLite relational
   entities remains an open governance decision. The SDD-007 vertical slice is explicitly restricted
   to storage adapter methods, SQLite schema integrity, and test fixtures, operating independently
   of live session state synchronization.

