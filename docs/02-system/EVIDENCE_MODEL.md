# CONVERA - Evidence Model Specification

**Document ID**: `CONVERA-SYS-004`  
**Classification**: Evidentiary Hierarchy & Tri-Part Confidence  
**Authority Tier**: Tier 2 System Specification  
**Document Status**: 🟢 RATIFIED  
**Implementation Status**: 🟢 IMPLEMENTED  
**Canonical Path**: `docs/02-system/EVIDENCE_MODEL.md`  
**Upstream Dependencies**: `00-foundation/CONSTITUTION.md (Article IV), 02-system/KNOWLEDGE_MODEL.md`  
**Downstream Dependents**: `02-system/DECISION_MODEL.md, 04-ai/AI_GOVERNANCE.md`  

---

> **Evidence Ingestion, Provenance Standards, Source Taxonomy & Epistemic Boundaries.**  
> This document authoritatively specifies what qualifies as evidence within CONVERA, how evidence is ingested, evaluated, weighted, and invalidated, and how source provenance is preserved, operating strictly upon the entities established in DOMAIN_MODEL.md.

---

## 1. Evidence Model Scope & Epistemic Boundaries

The Evidence Model defines the lifecycle of empirical citations, observations, and experimental data. It enforces four evidence invariants:
1. **Signal vs. Evidence Separation:** An external AI response, search result, or web text is an untrusted raw signal; it becomes an EvidenceItem only upon attaching a provenance-bearing ProvenanceRecord whose historical origin and extraction lineage are preserved.
2. **First-Class Provenance & Mutability Separation:** Historical extraction lineage is preserved and immutable, while governed verification status is revisable by authorized researchers.
3. **Evidence != Truth:** Evidence tiers (A, B, C) measure source container rigor, not infallible truth; all evidence remains subject to contradiction, re-evaluation, and invalidation.
4. **Epistemic Distinctions:** CONVERA maintains strict conceptual separation across verification and validity:
   - Traceable != Verified
   - Verified != True
   - Evaluated != Infallible

---

## 2. The Three-Stage Evidence Lifecycle

`	ext
  +------------------------+
  | 1. RAW SIGNAL          |  Untrusted output from web scraper, external LLM,
  |    (Ephemeral)         |  or unparsed document text. Zero epistemic standing.
  +-----------+------------+
              | Ingestion & Lineage Stamping (Connector ID, Source ID, UTC Timestamp)
              v
  +------------------------+
  | 2. TRACEABLE           |  Traceable item bound to a preserved ProvenanceRecord.
  |    PROVENANCE ITEM     |  Stored in database; verification_status = UNVERIFIED.
  |    (Not yet evaluated) |  Traceable != Verified; Verified != True.
  +-----------+------------+
              | Typed Linking to Claim (SUPPORTS / CONTRADICTS / CONTEXTUALIZES / FALSIFIES)
              v
  +------------------------+
  | 3. EVALUATED EVIDENCE  |  Evidence contributes weighted score to Net Epistemic Balance;
  |    (Weighted & Linked) |  Subject to Freshness Decay and Contradiction Detection.
  +------------------------+
`

---

## 3. Evidence Source Taxonomy & Tier Classification

CONVERA categorizes evidence into three rigorous quality heuristics and one degraded non-evidentiary tier:

`	ext
+-----------------------------------------------------------------------------+
|                          EVIDENCE SOURCE TAXONOMY                           |
+-------+--------+----------------------------------+-------------------------+
| Tier  | Weight | Primary Source Types             | Ingestion Criteria      |
+-------+--------+----------------------------------+-------------------------+
| TIER A|  3.0   | * Peer-reviewed journal papers   | Must have a verifiable  |
|       |        | * Systematic reviews & meta-anal.| authoritative source id |
|       |        | * Official institutional datasets| (DOI, PMID, registry id,|
|       |        | * Clinical trial registries      | or persistent dataset). |
+-------+--------+----------------------------------+-------------------------+
| TIER B|  2.0   | * Conference proceedings (peer)  | Must have conference    |
|       |        | * Academic preprints             | record, URL, or verified|
|       |        | * Technical whitepapers & stds.  | researcher interview log|
|       |        | * Structured interview logs      | with metadata.          |
+-------+--------+----------------------------------+-------------------------+
| TIER C|  1.0   | * Industry & news articles       | Must have source URL,   |
|       |        | * Secondary market research      | publication date, and   |
|       |        | * Field observation notes & blogs| author attribution.     |
+-------+--------+----------------------------------+-------------------------+
| SYNTH.|  0.0   | * Synthetic mock generator fallbk| source='synthetic_fb';  |
| (Degr)|        | * AI hallucinations / ungrounded | NON-EVIDENTIARY.        |
+-------+--------+----------------------------------+-------------------------+
`

---

## 4. Provenance Standards & Lineage Preservation

Every EvidenceItem is associated with a ProvenanceRecord (DOMAIN_MODEL.md Entity 5) enforcing the following structure:

`	ext
+-----------------------------------------------------------------------------+
|                            PROVENANCE SCHEMA SPECIFICATION                  |
+-----------------------+-----------------------------------------------------+
| Field                 | Specification & Semantic Role                       |
+-----------------------+-----------------------------------------------------+
| connector_id          | Ingesting connector (e.g., 'openalex', 'crossref',  |
|                       | 'pubmed', 'semantic_scholar', 'manual_entry').      |
+-----------------------+-----------------------------------------------------+
| source_identifier     | Identifier or reference used to locate or uniquely  |
|                       | identify the source, such as DOI, PMID, URL,        |
|                       | registry ID, institutional dataset ID, or, where no |
|                       | authoritative persistent identifier exists, a       |
|                       | SHA-256 content hash or equivalent reference.       |
+-----------------------+-----------------------------------------------------+
| extraction_timestamp  | ISO 8601 UTC timestamp of retrieval. Never mutated. |
+-----------------------+-----------------------------------------------------+
| extracting_model      | Model/version used for parsing (or human user ID).  |
+-----------------------+-----------------------------------------------------+
| verification_status   | Governed verification state (revisable):            |
|                       |   UNVERIFIED: Ingested via API, pending human check.|
|                       |   VERIFIED_BY_RESEARCHER: Human ratified source.    |
|                       |   DISPUTED: Flagged for citation defect/retraction. |
+-----------------------+-----------------------------------------------------+
`

> **Lineage Invariant:**  
> The historical extraction lineage of a provenance record cannot be silently overwritten or deleted. Re-evaluation of a source's credibility updates its governed verification status, while preserving the full audit trail of who extracted and verified it.

---

## 5. Typed Evidence Relationships & Edge Semantics

Evidence items link to ProblemClaim entities through four explicit, typed relationships:

`	ext
                     +--------------+
                     | ProblemClaim |
                     +------+-------+
                            |
       +--------------+-----+--------+--------------+
       |              |              |              |
       v              v              v              v
   [SUPPORTS]   [CONTRADICTS]  [FALSIFIES]  [CONTEXTUALIZES]
   (Positive)    (Negative)    (Critical -)    (Neutral 0.0)
`

1. **SUPPORTS (Positive Contribution):**  
   The evidence directly corroborates the factual proposition of the claim.
2. **CONTRADICTS (Negative Contribution & Tension Trigger):**  
   The evidence presents conflicting empirical findings or incompatible conclusions, triggering an immediate transition of the claim to CONTESTED.
3. **FALSIFIES (Critical Refutation):**  
   The evidence definitively disproves a foundational premise of the claim (multiplier  = 1.50$), leading toward FALSIFIED status.
4. **CONTEXTUALIZES (Neutral Framing - .0$ Score Impact):**  
   The evidence provides historical background, domain definitions, or scope boundaries without asserting factual support or refutation.

---

## 6. Evidence Independence & Correlation Limits

> **Independence Assessment:**  
> CONVERA recognizes evidence correlation as an epistemic limitation. Evidence items sharing a common dataset, population, experiment, source document, or citation lineage must not automatically be interpreted as independent replications. Where automated lineage detection is unavailable or insufficient, independence assessment remains a governed researcher verification activity.

When multiple publications or field reports draw upon the same underlying data cohort, their contributions represent shared evidentiary lineage rather than independent corroborations. Researchers must evaluate and document source independence during gate reviews and synthesis milestones.

---

## 7. Contradiction Pairing & Invalidation Mechanics

### A. The Contradiction Protocol
When an evidence item with CONTRADICTS or FALSIFIES is linked to a claim:
1. The engine registers a ClaimContradiction entity pairing the supporting and opposing evidence items.
2. The claim state is set to CONTESTED, enforcing **Contradiction Precedence**.
3. The contradiction is surfaced for researcher adjudication and triangulation.

### B. Reactive Evidence Invalidation
When an evidence source is retracted, invalidated, or otherwise determined to be unusable:
1. Its contribution is **removed (.0$)** from the active Net Balance calculation.
2. Retraction or invalidation does not itself make the evidence a negative contribution; negative contribution requires an explicit CONTRADICTS or FALSIFIES relationship from valid evidence.
3. The Net Epistemic Balance is recomputed across all dependent claims.
4. If a claim's epistemic status changes, dependent downstream entities are flagged for verification review.
