# CONNECTOR ARCHITECTURE & SCHOLARLY RETRIEVAL SPECIFICATION

**Document ID**: `CONVERA-AI-004`  
**Classification**: External Integration Architecture & Scholarly Connector Specification  
**Authority Tier**: Tier 2 Descriptive / Tier 3 Procedural  
**Status**: 🟢 RATIFICATION-READY  
**Canonical Path**: `docs/04-ai/CONNECTOR_ARCHITECTURE.md`  
**Upstream Dependencies**: `CONSTITUTION.md` (Articles I, II, VI, VII), `SYSTEM_ARCHITECTURE.md` (Area 5), `DOMAIN_MODEL.md`, `KNOWLEDGE_MODEL.md`, `EVIDENCE_MODEL.md`, `ENGINEERING_PRINCIPLES.md`, `SECURITY.md`, `CIIA.md`, `AI_GOVERNANCE.md`  
**Downstream Dependents**: `docs/04-ai/MCP.md`, `docs/05-data/*`, `backend/connectors/*`  

---

## 1. Executive Summary & Architectural Scope

The **Scholarly Connector Hub** is the external research retrieval subsystem of Area 5 (CIIA). It coordinates federated search, metadata harvesting, and candidate signal extraction across five integrated scholarly discovery and metadata services: **OpenAlex**, **Crossref**, **PubMed**, **Europe PMC**, and **Semantic Scholar**.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONNECTOR ARCHITECTURAL CORE                         │
├─────────────────────────────────────────────────────────────────────────┤
│  1. FEDERATED SCHOLARLY RETRIEVAL                                       │
│     Unified search interface aggregating heterogeneous academic APIs.   │
│                                                                         │
│  2. NORMALIZED SCHOLARLY RECORDS                                        │
│     Transforms raw provider JSON into typed NormalizedScholarlyRecords. │
│                                                                         │
│  3. MINIMAL OUTBOUND EGRESS & PRIVACY                                   │
│     Transmits only sanitized queries; zero project state or leaks.      │
│                                                                         │
│  4. RESILIENT RATE LIMITING & BOUNDED TIMEOUTS                          │
│     Polite client headers, backoff handling, and offline mock support.  │
│                                                                         │
│  5. STRICT EVIDENTIARY BOUNDARY                                         │
│     Connectors retrieve candidate signals; Evidence Model evaluates.    │
└─────────────────────────────────────────────────────────────────────────┘
```

The fundamental architectural boundary governing the connector subsystem is:

```text
Scholarly Connectors
  ├── Executes external academic searches
  ├── Normalizes raw bibliographic metadata
  └── Generates candidate NormalizedScholarlyRecords
           │
           X  (Non-Authority Boundary)
           │
           ├── Does NOT assign Evaluated Evidence status (owned by Evidence Model)
           ├── Does NOT calculate Net Balance (owned by Knowledge Model)
           └── Does NOT mutate persistence directly (must cross Domain Engine)
```

---

## 2. Statement Classification Framework

Following the governance standards established across Phases 1–3, all specifications in this document adhere to four explicit classification markers:

| Class | Definition | Normative Authority |
| :--- | :--- | :--- |
| **`[NORMATIVE]`** | Inviolable architectural law that connector implementations **MUST** satisfy. | Mandatory baseline constraint. |
| **`[IMPLEMENTED]`** | Architecture verified against the active codebase in `backend/connectors/`. | Active code in `backend/`. |
| **`[TARGET]`** | Planned architectural capabilities scheduled for progressive development. | Governed implementation target. |
| **`[VERIFICATION]`** | The explicit test suite or inspection establishing architectural compliance. | Verification contract (`TESTING_STRATEGY.md`). |

---

## 3. Connector Hub Architecture & Class Hierarchy

The subsystem enforces Inversion-of-Control (IoC) where high-level domain services interact exclusively with the `ConnectorHub` and the abstract `BaseScholarlyConnector` contract:

```text
                              ┌───────────────────────────┐
                              │       ConnectorHub        │
                              │  (Federation Orchestrator)│
                              └─────────────┬─────────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │   BaseScholarlyConnector  │
                              │  (Abstract Base Contract) │
                              └─────────────┬─────────────┘
                                            │
        ┌───────────────┬───────────────────┼───────────────────┬───────────────┐
        │               │                   │                   │               │
┌───────▼───────┐┌──────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐┌──────▼───────┐
│OpenAlexAdapter││CrossrefAdapter│  │ PubMedAdapter │   │EuropePMCAdapter││SemanticSchol.│
└───────────────┘└──────────────┘   └───────────────┘   └───────────────┘└──────────────┘
```

### 3.1 Interface Contract (`BaseScholarlyConnector`)
* **`[NORMATIVE]` Abstract Interface**: Every connector adapter must implement common asynchronous search and lookup signatures:
  * `search(query: str, limit: int = 10, offset: int = 0) -> List[NormalizedScholarlyRecord]`
  * `fetch_by_identifier(identifier: str) -> Optional[NormalizedScholarlyRecord]`
  * `is_available() -> bool`

### 3.2 Distinction Between Bibliographic Records and Provenance Records
To maintain the architectural integrity of `EVIDENCE_MODEL.md`, the platform explicitly distinguishes between **bibliographic metadata** and **provenance lineage metadata**:

```text
Raw Provider JSON Payload
        │
        ▼ (Connector Normalization)
NormalizedScholarlyRecord (Bibliographic & Registry Metadata)
├── external_id: str
├── source_registry: ScholarlyRegistryEnum
├── title: str
├── authors: List[str]
├── year: Optional[int]
├── venue: Optional[str]
├── abstract: Optional[str]
├── citation_count: Optional[int]
├── canonical_url: Optional[str]
└── registry_specific_metadata: Optional[RegistryMetadata]
        │
        ▼ (Evidence Ingestion & Provenance Mapping)
ProvenanceRecord (Lineage & Epistemic Audit Metadata)
├── connector_id: str
├── source_identifier: str (DOI / PMID / URL / Registry ID)
├── extraction_timestamp: datetime (UTC)
├── extracting_model: Optional[str]
└── verification_status: ProvenanceVerificationStatus
```

* **`[NORMATIVE]` Schema Separation**: Connectors output `NormalizedScholarlyRecord`. The domain engine maps these records into canonical `ProvenanceRecord` and `EvidenceItem` instances during structured evaluation.

---

## 4. The Five Integrated Scholarly Information Services

CONVERA integrates with five scholarly discovery and metadata services, each serving a specialized role in venture and research discovery:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     SCHOLARLY INFORMATION SERVICE PROFILES                             │
├───────────────────┬───────────────────────────────────┬────────────────────────────────┤
│ Service           │ Specialized Domain Role           │ Primary Source Identifiers     │
├───────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ 1. OpenAlex       │ Multidisciplinary discovery,      │ OpenAlex ID, DOI, MAG ID       │
│                   │ open citation graph, concepts     │                                │
├───────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ 2. Crossref       │ Authoritative DOI registration    │ Digital Object Identifier (DOI)│
│                   │ and publisher metadata agency     │                                │
├───────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ 3. PubMed         │ Biomedical & life sciences index, │ PubMed ID (PMID), PMCID, DOI   │
│                   │ clinical research, NCBI Entrez    │                                │
├───────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ 4. Europe PMC     │ Open access biomedical database,  │ Europe PMC ID, PMID, PMCID,    │
│                   │ preprints, patent links, full-text│ Patent IDs                     │
├───────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ 5. Semantic       │ Computer science & AI discovery,  │ Semantic Scholar Corpus ID,    │
│    Scholar        │ citation velocity, TLDR summaries │ DOI, ArXiv ID                  │
└───────────────────┴───────────────────────────────────┴────────────────────────────────┘
```

### 4.1 Service Profiles
1. **OpenAlex Connector**:
   * *Role*: Broad multidisciplinary discovery engine providing concept hierarchies, institutional affiliations, and open-access licensing metadata.
2. **Crossref Connector**:
   * *Role*: Authoritative DOI verification agency validating publication metadata directly against publisher registration deposits.
3. **PubMed Connector**:
   * *Role*: Biomedical and clinical trial literature index via NCBI Entrez E-utilities (`esearch`, `esummary`, `efetch`).
4. **Europe PMC Connector**:
   * *Role*: European life sciences literature infrastructure indexing open-access articles, preprints (bioRxiv, medRxiv), and patent cross-references.
5. **Semantic Scholar Connector**:
   * *Role*: Academic graph analysis offering influential citation metrics, citation velocity, and computational paper summaries.

---

## 5. Federated Search & Deduplication Pipeline

When a multi-source literature query is executed, the `ConnectorHub` coordinates federated dispatch, normalization, and candidate deduplication:

```text
                   [User / CIIA Search Query]
                                │
                                ▼
                   ┌─────────────────────────┐
                   │ Dispatch in Parallel    │
                   │ (OpenAlex, Crossref,    │
                   │ PubMed, PMC, Semantic)  │
                   └────────────┬────────────┘
                                │ Raw JSON Payloads
                                ▼
                   ┌─────────────────────────┐
                   │ Normalize to            │
                   │ NormalizedScholarlyRec  │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │ Deduplication Engine    │
                   │ 1. Exact Canonical ID   │
                   │    (DOI / PMID match)   │
                   │ 2. Title+Year Candidate │
                   │    (Fuzzy match check)  │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │ Structured Merge        │
                   │ (Combine registry info  │
                   │ without losing lineage) │
                   └────────────┬────────────┘
                                │
                                ▼
                   [Unified Candidate Record List]
```

### Deduplication Invariants
* **`[NORMATIVE]` Canonical Identifier Merge**: Records sharing an identical, verified DOI or PMID are merged into a single `NormalizedScholarlyRecord`. Supplementary data (e.g., Semantic Scholar citation velocity, OpenAlex concept tags) is merged into the record's typed `registry_specific_metadata`.
* **`[NORMATIVE]` Title + Year Candidate Matching**: Records lacking formal identifiers that match on normalized title strings and publication years are flagged as **candidate duplicates** (`is_candidate_duplicate = True`). They MUST NOT be automatically merged without secondary metadata confirmation or human review, preventing accidental erasure of distinct publications, editions, or preprints.

---

## 6. Privacy, Egress Minimization & Security Invariants

In strict alignment with Invariant S3 in `SECURITY.md`, the connector subsystem enforces rigorous outbound privacy controls:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    OUTBOUND EGRESS BOUNDARIES                           │
├─────────────────────────────────────────────────────────────────────────┤
│  • Permitted Outbound Payloads:                                         │
│    - Plaintext academic search keywords (e.g., "solid-state batteries") │
│    - Legitimate query entities (e.g., author names, institutions)       │
│    - Canonical identifiers (e.g., "10.1016/j.jpowsour.2023.233001")     │
│    - Pagination and limit parameters                                    │
│                                                                         │
│  • Strictly Prohibited Outbound Payloads:                               │
│    - User venture hypotheses or proprietary business logic              │
│    - Project session graphs or internal entity IDs                      │
│    - Database dumps or local SQLite contents                            │
│    - Unredacted credentials or internal configuration states            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Security & Privacy Rules
1. **`[NORMATIVE]` Query Sanitization**: Outbound search queries must be sanitized to strip internal session metadata, credentials, private project context, database identifiers, and non-query state. Legitimate scholarly search terms (including author names, technologies, diseases, and institutions) remain fully permitted.
2. **`[NORMATIVE]` Credential Protection**: Optional connector API keys (e.g., `SEMANTIC_SCHOLAR_API_KEY`, Crossref Plus tokens) are managed exclusively in backend `.env` files, used strictly in outbound authorization headers, and never exposed in client payloads or public logs.

---

## 7. Transport Resilience & Offline Mock Mechanics

To guarantee operational stability, network politeness, and test isolation, all connector network interactions enforce transport policies:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                   TRANSPORT & RESILIENCE SPECIFICATIONS                 │
├─────────────────────────────────────────────────────────────────────────┤
│  1. BOUNDED TIMEOUTS                                                    │
│     All HTTP requests enforce configured connection and read timeouts   │
│     to prevent hung worker threads.                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  2. RATE LIMITING & POLITE CLIENT HEADERS                               │
│     Requests include User-Agent and Contact headers per API guidelines. │
│     HTTP 429 triggers bounded backoff handling.                         │
├─────────────────────────────────────────────────────────────────────────┤
│  3. DETERMINISTIC OFFLINE MOCK SUPPORT                                  │
│     Mock connector adapters simulate API responses for hermetic testing │
│     without internet access ($0-Posture Baseline).                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Transport Invariants
1. **`[NORMATIVE]` Bounded Network Calls**: Connectors MUST NOT initiate unbounded HTTP requests. Every call must specify explicit connection and read timeouts.
2. **`[NORMATIVE]` Non-Blocking Degradation**: If an individual connector service fails or times out, the `ConnectorHub` must return results from surviving services, logging a warning rather than failing the entire research operation.
3. **`[TARGET]` Polite Pool Optimization**: Implementation of configured `mailto` identification headers and exponential backoff retry algorithms per scholarly service guidelines.

---

## 8. Verification & Compliance Checklist

Before any code modification affecting the scholarly connectors is accepted, it must satisfy the following verification criteria:

| Check ID | Architectural Requirement | Verification Method | Acceptance Standard |
| :--- | :--- | :--- | :--- |
| **CONN-01** | Connector interface conformance. | Interface compliance unit test. | All 5 adapters implement `BaseScholarlyConnector`. |
| **CONN-02** | Bibliographic normalization. | Schema validation test across registries. | Normalized into valid `NormalizedScholarlyRecord` instances. |
| **CONN-03** | Deduplication integrity. | Multi-source mock search test. | Identical DOIs merge; title+year collisions marked as candidates. |
| **CONN-04** | Egress payload minimization. | Outbound payload inspection test (`SEC-03`). | Zero internal session context or database IDs in queries. |
| **CONN-05** | Bounded timeouts & resilience. | Network failure & timeout mock tests. | Gateway survives simulated timeouts and HTTP 500 errors. |
| **CONN-06** | Hermetic test isolation. | Offline mock test execution. | Full connector test suite passes with zero live internet calls. |
| **CONN-07** | Unit and integration test pass rate. | Execution of `tests/connectors/`. | 100% applicable tests pass. |

---

## 9. Ratification & Version History

| Version | Date | Author / Governance | Key Changes & Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | `2026-09-04` | Antigravity AI Engine & Architectural Governance | Initial formal specification establishing scholarly connector hub, 5 service profiles, bibliographic normalization, candidate deduplication, and outbound egress boundaries. | 🟢 RATIFICATION-READY |
