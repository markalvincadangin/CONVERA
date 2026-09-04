# CONVERA Provenance & Lineage Architecture Specification

**Document ID**: `CONVERA-DAT-003`  
**Classification**: Immutable Lineage, Hashes & Citation Trails  
**Authority Tier**: Tier 2 Data Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/05-data/PROVENANCE.md`  
**Upstream Dependencies**: `00-foundation/CONSTITUTION.md (Article III), 05-data/DATA_ARCHITECTURE.md`  
**Downstream Dependents**: `04-ai/CONNECTOR_ARCHITECTURE.md, 06-frontend/DESIGN_SYSTEM.md`  

---

`[AUTHORITATIVE EVIDENCE & PROVENANCE SPECIFICATION]`
*Document Version: 1.1.0*  
*Last Verified: 2026-09-04*  
*Target Engine: ProvenanceEngine (`backend/engines/provenance_engine.py`) & `evidence_provenance` (Table T17)*  
*Authority Alignment: Subordinate to CONSTITUTION.md (Arts. III & IV) and EVIDENCE_MODEL.md; Governs lineage implementation and physical mapping to DATABASE_SCHEMA.md*

---

## 1. Executive Summary & Cross-Document Authority

Provenance in CONVERA establishes the unbroken, cryptographically auditable chain of custody from external scholarly or empirical assets to internal claims, assumptions, and human decision records. In accordance with Constitutional Axiom *“Evidence before assertion; traceability before transformation”*, provenance ensures that no proposition attains epistemic standing without verified origin.

### Cross-Document Authority Boundary

* **`EVIDENCE_MODEL.md`**: Authoritatively governs epistemic criteria, source taxonomy definitions, credibility tier weights, and Net Epistemic Balance contributions. `PROVENANCE.md` does not independently define or override epistemic weights.
* **`PROVENANCE.md`**: Authoritatively governs the provenance recording lifecycle, cryptographic extraction fingerprinting, connector metadata tracking, and supersession lineage chains.
* **`DATABASE_SCHEMA.md`**: Authoritatively governs the physical persistence representation (SQLite storage classes, nullability, indices, and application-level references) of provenance records.

---

## 2. Core Provenance Invariants

### PRV-01: Lineage Reconstruction
* **`[NORMATIVE]`**: External empirical or literature assets entering the canonical Evidence lifecycle MUST maintain sufficient provenance metadata to reconstruct their source origin, retrieval parameters, and extraction lineage.
* **`[IMPLEMENTED]`**: `ProvenanceEngine.record_evidence_provenance()` records connector source, original canonical identifier, UTC retrieval timestamp, extraction model, and SHA-256 prompt hash prefix for implemented ingestion and extraction pathways.
* **`[VERIFICATION]`**: Ingestion and extraction paths are verified via automated integration suites (`backend/tests/test_phase1_knowledge_integrity.py`).

### PRV-02: Cryptographic AI Extraction Fingerprinting
* **`[NORMATIVE]`**: Any claim derived or extracted via Cognitive Infrastructure (CIIA / LLM) MUST be bound to a reproducible extraction fingerprint.
* **`[IMPLEMENTED]`**: `ProvenanceEngine` computes and stores the 16-hexadecimal prefix of the SHA-256 hash of the complete extraction prompt:
  $$\text{extraction\_prompt\_hash} = \text{hashlib.sha256}(\text{prompt.encode(\"utf-8\")}).\text{hexdigest()}[0:16]$$
* **`[VERIFICATION]`**: Prompt hash uniqueness and deterministic generation are validated on every extraction call.

### PRV-03: Tri-Part Decoupling & Verification State Separation
* **`[NORMATIVE]`**: Provenance records enforce the mathematical separation of AI generation confidence ($C_{\text{AI}}$), source evidence corroboration strength ($S_{\text{EVID}}$), and human decision confidence ($C_{\text{DEC}}$). Automated extractions MUST initialize as unverified.
* **`[IMPLEMENTED]`**: All newly recorded provenance entries default to `UNVERIFIED`. Verification status is explicitly updated only via `ProvenanceEngine.verify_provenance()`.

### PRV-04: Non-Destructive Lineage & Forward Supersession
* **`[NORMATIVE]`**: Historical provenance lineage MUST NOT be silently overwritten or deleted when evidence is refreshed, updated, or re-extracted.
* **`[IMPLEMENTED]`**: Provenance revisions and corrections are tracked using the `superseded_by_id` lineage pointer, referencing the successor provenance UUID.
* **`[VERIFICATION]`**: Immutability and forward-pointer traversal are enforced at the application service boundary.

### PRV-05: Dual-Identifier Storage Resolution
* **`[IMPLEMENTED]`**: In SQLite Table `T17: evidence_provenance`, `source_id` is stored as `TEXT` without an engine-level foreign key constraint. This accommodates both stringified local integer keys (`problem_sources.id`) and raw external scholarly identifiers (e.g., DOIs, PMCIDs, OpenAlex URIs).

---

## 3. Canonical Three-Stage Evidence Lifecycle Alignment

In strict alignment with `EVIDENCE_MODEL.md` (Section 2), provenance progresses across three canonical stages:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. RAW SIGNAL (Ephemeral)                                                  │
│ • Untrusted external output (web search result, LLM text, unparsed feed).  │
│ • Zero epistemic standing; unweighted; unpersisted.                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Ingestion & Lineage Stamping
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. TRACEABLE PROVENANCE ITEM (Persisted & Fingerprinted)                   │
│ • Bound to an immutable ProvenanceRecord (`evidence_provenance`, Table T17).│
│ • Connector ID, Canonical Source ID, UTC Timestamp, Model ID, Prompt Hash.  │
│ • Initial Epistemic State: `UNVERIFIED` (Traceable != Verified).             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Typed Linking to Claim & Human Gate
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. EVALUATED EVIDENCE (Weighted & Linked)                                   │
│ • Linked to ProblemClaim via `claim_evidence_links` (Table T14).            │
│ • Human Verification State calibrated: `VERIFIED_BY_RESEARCHER` / `DISPUTED`│
│ • Contributes canonical Tier Weight (A=3.0, B=2.0, C=1.0) to Net Balance.   │
│ • Subject to contradiction detection and blast-radius invalidation.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Epistemic Weighting Governance & Canonical Taxonomy

As authoritatively established in `EVIDENCE_MODEL.md`, evidence credibility and Net Epistemic Balance contributions are governed strictly by source tier:

| Source Tier | Canonical Weight ($W_{\text{tier}}$) | Primary Source Types (Governed by EVIDENCE_MODEL.md) | Epistemic Contribution | Canonical Connectors |
| :--- | :---: | :--- | :--- | :--- |
| **Tier A** | **$3.0$** | Peer-reviewed journal papers, systematic reviews & meta-analyses, official institutional datasets, clinical trial registries. | Full Positive Corroboration | `OPENALEX`, `CROSSREF`, `PUBMED`, `EUROPE_PMC` |
| **Tier B** | **$2.0$** | Peer-reviewed conference proceedings, institutional working papers, preprints (arXiv, bioRxiv, medRxiv), doctoral dissertations. | Substantial Corroboration | `OPENALEX`, `SEMANTIC_SCHOLAR`, `MANUAL` |
| **Tier C** | **$1.0$** | Industry whitepapers & technical documentation, trade publication case studies, expert interview logs, reputable technical blogs. | Contextual Corroboration | `MANUAL`, `OPENALEX` |
| **Synthetic** | **$0.0$** | AI-generated literature summaries, unverified LLM extractions, simulated scenarios, synthetic data augmentations. | **NON-EVIDENTIARY** (Zero Epistemic Weight) | `CIIA_SYNTHESIS` |

> [!IMPORTANT]
> **Synthetic Non-Evidentiary Invariant**: Material generated by AI or synthetic simulation carries **zero ($0.0$) evidentiary weight**. Synthetic outputs provide cognitive scaffolding and exploration assistance, but cannot corroborate a claim in the Net Epistemic Balance.

---

## 5. Provenance Verification State Machine

The platform maintains strict conceptual and physical separation of verification states:

### 5.1 Conceptual Verification States (`EVIDENCE_MODEL.md`)

* **`UNVERIFIED`**: Default state upon ingestion and AI extraction. Indicates lineage is recorded but substantive factual accuracy has not been validated by a human researcher.
* **`VERIFIED_BY_RESEARCHER`**: A human researcher or mentor has audited the extraction against the primary source container and attested to its accuracy.
* **`DISPUTED`**: A human reviewer has flagged the extracted proposition as inaccurate, hallucinated, out of context, or retracted.

*(Note: Epistemic conflict between opposing verified claims is modeled as `claim_contradictions.status = 'CONTESTED'` in Table T18, not as a provenance state).*

### 5.2 Physical Storage Representation (`DATABASE_SCHEMA.md`)

In SQLite Table `T17: evidence_provenance`, the column `human_verification_state TEXT DEFAULT 'UNVERIFIED'` stores the active verification status (`UNVERIFIED`, `VERIFIED_BY_RESEARCHER`, or `DISPUTED`).

---

## 6. Implementation Architecture & Contracts

### 6.1 Provenance Engine Core (`backend/engines/provenance_engine.py`)

```python
class ProvenanceEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def record_evidence_provenance(
        self,
        source_id: str,
        connector: str,
        original_identifier: Optional[str] = None,
        extraction_model: Optional[str] = None,
        extraction_prompt: Optional[str] = None,
        human_verified: bool = False
    ) -> Dict[str, Any]:
        """
        Records traceable provenance item with SHA-256 prompt fingerprint.
        """
        prompt_hash = (
            hashlib.sha256(extraction_prompt.encode("utf-8")).hexdigest()[:16]
            if extraction_prompt else None
        )
        record = {
            "source_id": source_id,
            "connector": connector,
            "original_identifier": original_identifier,
            "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
            "extraction_model": extraction_model,
            "extraction_prompt_hash": prompt_hash,
            "human_verification_state": "VERIFIED_BY_RESEARCHER" if human_verified else "UNVERIFIED"
        }
        return self.storage.record_provenance(record)

    def verify_provenance(
        self, 
        source_id: str, 
        is_valid: bool = True, 
        notes: str = ""
    ) -> Dict[str, Any]:
        """
        Applies human gatekeeper verification or dispute mutation.
        """
        existing = self.storage.get_provenance(source_id)
        if not existing:
            existing = {
                "source_id": source_id,
                "connector": "manual_review",
                "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
            }
        existing["human_verification_state"] = (
            "VERIFIED_BY_RESEARCHER" if is_valid else "DISPUTED"
        )
        existing["verification_notes"] = notes
        return self.storage.record_provenance(existing)
```

### 6.2 Lineage Tracking via `superseded_by_id`

When an evidence item is retracted or re-extracted with an updated model:
1. A new provenance record is inserted with a fresh UUID (`prov_new`).
2. The superseded record's `superseded_by_id` field is updated to reference `prov_new`.
3. Historical queries can traverse the lineage chain backward or forward without data loss.

---

## 7. Verification and Audit Traceability Matrix

| Requirement | Specification | Implementation Mechanism | Compliance Status |
| :--- | :--- | :--- | :--- |
| **Lineage Recording** | Connector, ID, Timestamp | `ProvenanceEngine.record_evidence_provenance` | 🟢 `[IMPLEMENTED]` |
| **AI Fingerprinting** | SHA-256 16-hex prefix | `hashlib.sha256().hexdigest()[:16]` | 🟢 `[IMPLEMENTED]` |
| **Epistemic Weights** | A=3.0, B=2.0, C=1.0, Syn=0.0 | Deferral to `EVIDENCE_MODEL.md` | 🟢 `[NORMATIVE]` |
| **Synthetic Boundary** | Non-evidentiary ($0.0$) | Enforced in `knowledge_lifecycle.py` | 🟢 `[IMPLEMENTED]` |
| **Verification Gate** | Human state transition | `ProvenanceEngine.verify_provenance` | 🟢 `[IMPLEMENTED]` |
| **Supersession Pointer** | `superseded_by_id` lineage | Physical column in `evidence_provenance` | 🟢 `[IMPLEMENTED]` |
