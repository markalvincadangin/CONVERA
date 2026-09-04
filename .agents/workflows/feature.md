# CONVERA Feature Development Workflow

## Goal
Implement a CONVERA feature using specification-driven, verification-gated engineering.

## Execution Sequence

### Phase 1 — Understand
1. Read `.specify/memory/constitution.md`.
2. Inspect affected domain engines, routers, storage models, and UI components.
3. Identify existing test coverage and constraints.

### Phase 2 — Specify
Define:
- User value & actor personas
- Functional requirements & acceptance criteria
- Epistemic invariants & edge cases

### Phase 3 — Plan & Tasks
1. Break down changes into minimal, decoupled tasks.
2. Order tasks logically: Storage $	o$ Engine $	o$ Router $	o$ UI $	o$ Tests.

### Phase 4 — Implement & Test
1. Implement changes in small, coherent batches.
2. Run targeted unit tests after each batch.

### Phase 5 — Verification Gate
1. Full backend test suite: `python -m pytest tests -v`.
2. Frontend type check: `npx tsc --noEmit`.
3. Verify backward/forward traceability.

### Phase 6 — Review & Ratify
Report changed files, test outputs, and verification status for human review.
