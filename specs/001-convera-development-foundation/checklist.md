# CONVERA SDD-001: Quality & Invariant Checklist

**Specification ID**: `CONVERA-SDD-001`  
**Status**: 🟢 VERIFIED  

---

## 1. Constitutional & Epistemic Invariants
- [x] **Article I (Knowledge ≠ Workflow)**: Canonical entities exist independently of UI stage views.
- [x] **Article II (Human Sovereignty)**: AI suggestions have $0.0$ approval authority; gate reviews require human sign-off.
- [x] **Article III (Mandatory Provenance)**: Citations, extractions, and evidence maintain immutable SHA-256 provenance hashes.
- [x] **Article IV (Tri-Part Confidence)**: Independence $C_{AI} \ne S_{EVID} \ne C_{DEC}$ strictly maintained.
- [x] **Article V (Track Neutrality)**: Core knowledge is track-agnostic; Innovation and Research tracks operate with parity.
- [x] **Article VI (Blast-Radius Invalidation)**: Falsification triggers automatic `impact_invalidation_events` and marks decisions `STALE_REVIEW_REQUIRED`.
- [x] **Article VII (Documentation Primacy)**: Strict 3-tier hierarchy (Tier 1 Constitution → Tier 2 Specifications → Tier 3 Reference).

---

## 2. Technical & Implementation Invariants
- [x] **Backend Baseline**: Python 3.12.2, FastAPI, 15 REST routers, 25 core engines.
- [x] **Persistence Baseline**: SQLite WAL, 23 physical relational tables, FK cascades enabled.
- [x] **Frontend Baseline**: Next.js 15.2.0, React 19, TypeScript 5.8, Tailwind CSS 4, 10 verified services.
- [x] **AI Gateway**: Multi-cloud failover cascade active; Ollama manual provider active; synthetic fallback classified `[TARGET]`.
- [x] **Scholarly Connectors**: 4 typed connectors in `hub.py` + Europe PMC in `research_client.py`.
- [x] **Test Verification**: 86/86 backend pytest tests passing.
- [x] **Build Verification**: Next.js 15.2.0 production build completes with 0 errors (4 static routes).

---

## 3. Dossier & SDD Invariants
- [x] SDD directory renamed to `specs/001-convera-development-foundation/`.
- [x] Feature branch checked out: `feature/001-convera-development-foundation`.
- [x] Monorepo `package.json` standardized to `"name": "convera-monorepo"`.
- [x] All 6 dossier documents complete (`spec.md`, `plan.md`, `checklist.md`, `tasks.md`, `analysis.md`, `verification.md`).
- [x] Human review gate enforced before commit.
