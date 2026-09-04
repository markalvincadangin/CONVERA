# CONVERA SDD-002: Invariant Checklists

## 1. Constitutional & Governance Invariants
- [x] **Authority Hierarchy Respected**: Constitution → Specifications → SDD Criteria → Implementation → Agent Judgment.
- [x] **Zero Preference Overrides**: No code changed solely due to agent subjective aesthetic preference.
- [x] **Target Integrity**: Documented [TARGET] items are not falsely classified as bugs or implemented prematurely.
- [x] **Epistemic Separation**: AI suggestions and unverified claims are visually and semantically distinct from verified evidence.
- [x] **Human Authority Preserved**: Irreversible actions, commits, and stage promotions require human confirmation.

## 2. Technical & Quality Invariants
- [x] **Minimal Correct Changes**: Fixes are targeted, atomic, and bounded to verified root causes (+128 / -20 lines).
- [x] **Architecture Preserved**: Layer boundaries (Presentation → Router → Engine → Adapter) strictly maintained.
- [x] **Schema Conformance**: All database operations conform to the 23-table SQLite WAL schema.
- [x] **Zero Regression**: Backend test count remains 91 passing (baseline was 86); Next.js builds with 0 errors.
- [x] **Contract Alignment**: Frontend service TypeScript interfaces exactly match FastAPI Pydantic response models.

## 3. UI/UX & Accessibility Invariants
- [x] **Design Tokens**: 60-30-10 palette (#0066FF, #0B0F14), Exo 2 & Inter typography strictly utilized.
- [x] **Complete States**: Every data-driven view provides Loading Skeleton, Empty, Error, and Populated states.
- [x] **WCAG 2.2 AA**: All interactive elements are keyboard focusable with visible focus rings and ARIA labels.
- [x] **Responsive Fluidity**: Layouts adapt gracefully without horizontal scrollbars or clipping.
