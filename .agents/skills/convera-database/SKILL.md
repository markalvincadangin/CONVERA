---
name: convera-database
description: SQLite WAL schema reference and migration skill for CONVERA's 23 relational tables.
---

# CONVERA Database Skill

## Relational Schema (23 Tables in SQLite WAL)
1. `projects`, `project_members`, `sessions`, `session_snapshots`
2. `problems`, `problem_sources`, `problem_phase_history`, `problem_claims`
3. `problem_assumptions`, `problem_alternatives`, `decision_records`
4. `problem_comments`, `mentor_signoffs`, `claim_evidence_links`
5. `assumption_validation_tests`, `impact_invalidation_events`, `evidence_provenance`
6. `claim_contradictions`, `project_unknowns`, `requirements_traceability`
7. `gate_reviews`, `research_domains`, `circumscription_iterations`

## Best Practices
- Always use parameterized queries: `conn.execute("SELECT ... WHERE id = ?", (id,))`.
- Match column lists with value tuples precisely during `INSERT` statements.
- Use `datetime.now(timezone.utc).isoformat()` for timestamp generation.
