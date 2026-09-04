# CONVERA Core Engineering Rules

## Purpose
These rules govern all development work performed by AI agents in the CONVERA repository.

## Non-Negotiable Principles
- Knowledge is not workflow state.
- Evidence is not equivalent to claims.
- AI output is not automatically validated truth.
- External services provide signals; CONVERA owns persistent context and governance.
- Preserve canonical knowledge across framework changes.
- Preserve traceability wherever the architecture requires it.
- Prefer minimal changes over unnecessary architectural expansion.
- Do not rewrite working subsystems without evidence that the change is required.

## Agent Behavior Before Modifying Code
1. Inspect the existing implementation and related files.
2. Identify affected domains and storage layers.
3. Identify relevant architecture constraints and active constitution rules.
4. Identify relevant automated tests.
5. Identify downstream blast-radius and impact.
6. Read the active specification and implementation plan.
Do not infer that a missing feature requires a new subsystem until the existing architecture has been inspected.

## Definition of Completion
A task is complete only when:
- Executable implementation exists.
- Relevant automated tests pass (Pytest + TypeScript `tsc --noEmit`).
- No architectural invariant is violated.
- Documentation and schema definitions are synchronized.
- The outcome is verified and reported with evidence.
