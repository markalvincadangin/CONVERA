# CONVERA Intelligence & Integration Architecture (CIIA)

**Product:** CONVERA  
**Parent Brand:** EMAERX  
**Standard Alignment:** CONVERA Concept Development Standard (CCDS) • Model Context Protocol (MCP) • IEEE 830 / ISO 29148  
**Document Type:** Technical Systems & Architectural Integration Contract  
**Status:** Approved / Implementation Baseline  
**Version:** 1.0  

---

## 1. Executive Summary & Core Doctrine

The **CONVERA Intelligence & Integration Architecture (CIIA)** defines the formal architectural contract between the **CONVERA Core System** (Knowledge, Evidence, Framework, and Decision Engines) and the external intelligence ecosystem (Large Language Models, Academic APIs, Web Search, Document Parsers, and MCP Tooling).

CIIA is governed by one non-negotiable architectural doctrine:

> ### **"External systems provide information and capabilities; CONVERA provides the persistent context, evidence structure, governance, and decision intelligence."**

Under this doctrine:
1. **AI models are reasoning engines, not authorities.** Consequential venture, research, and technical decisions are made by human founders and researchers.
2. **Search and API results are evidence candidates, not automatic facts.** All ingested signals undergo provenance tracking and quality scoring before becoming validated evidence.
3. **Connectors are decoupled from methodologies.** A scholarly paper, a competitor URL, a user interview, or a GitHub repository is represented within a uniform knowledge graph regardless of whether the active framework is *Research*, *Innovation*, *Product*, or *Capstone*.

---

## 2. System Architecture & Boundaries

```mermaid
graph TD
    subgraph ClientTier["CONVERA Application Tier"]
        UI["Multi-Device Workspace & Stepper"]
        ST["Deliverables Studio & Decision Room"]
    end

    subgraph CoreTier["CONVERA Core Engines"]
        FE["<b>Framework Engine</b><br/>Orchestrates Stages & Ratchet Gates"]
        KE["<b>Knowledge Engine</b><br/>Maintains Problem-Claim Ontology"]
        EE["<b>Evidence Engine</b><br/>Enforces Ledgers & Provenance"]
        DE["<b>Decision Engine</b><br/>Evaluates Trade-offs & Pivots"]
    end

    subgraph CIIALayer["CONVERA Intelligence & Integration Layer (CIIA)"]
        GW["<b>Task-Routed AI Gateway</b><br/>Model Router • Cost Optimization • Failover Cascade"]
        HUB["<b>Universal Connector Hub</b><br/>Auth • Rate Limits • Normalization • Cache"]
        MCP_SUB["<b>MCP Subsystem (Client & Server)</b><br/>GitHub (Read-Only) • Files • CONVERA MCP Tools"]
    end

    subgraph ExternalEcosystem["External Ecosystem"]
        LLMS["LLM Providers<br/>(Gemini, Groq, OpenRouter, Ollama, Anthropic)"]
        RES["Research APIs<br/>(OpenAlex, Semantic Scholar, Crossref, PubMed)"]
        DOCS["Document Intelligence<br/>(PDFs, Transcripts, Markdown, CSV)"]
        TOOLS["External Tools & Repos<br/>(GitHub MCP, Web Search, Playwright)"]
    end

    ClientTier --> CoreTier
    CoreTier <--> CIIALayer
    
    GW <--> LLMS
    HUB <--> RES
    HUB <--> DOCS
    MCP_SUB <--> TOOLS
    
    CoreTier --> KG[("<b>Persistent Relational Knowledge Graph</b><br/>(Zero-Ops SQLite WAL / PostgreSQL)")]

    style CIIALayer fill:#0b0f14,stroke:#0066ff,stroke-width:2px,color:#ffffff
    style CoreTier fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc
    style ExternalEcosystem fill:#1e1b4b,stroke:#818cf8,stroke-width:1.5px,color:#f8fafc
    style KG fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff
```

---

## 3. Universal Connector Contract (`BaseConnector`)

Every external data source, API, or discovery tool must implement the `BaseConnector` interface. No engine may make raw, unmediated HTTP requests.

```mermaid
graph LR
    API["External API / Tool"] --> BC["BaseConnector Adapter"]
    BC --> AUTH["1. Auth & Credentials"]
    BC --> RL["2. Rate Limit Policy"]
    BC --> RET["3. Retry & Circuit Breaker"]
    BC --> CACHE["4. Cache Layer (TTL)"]
    BC --> NORM["5. Schema Normalization"]
    BC --> PROV["6. Provenance Tagging"]
    PROV --> HUB["Connector Hub Output"]
```

### 3.1 Connector Specification
Each connector must declare:
- **`connector_id`**: Unique string identifier (e.g. `openalex`, `semantic_scholar`, `github_mcp`).
- **`capabilities`**: Declared feature list (`SEARCH`, `FETCH_BY_ID`, `CITATIONS`, `AUTHOR_GRAPH`, `FULL_TEXT`).
- **`auth_type`**: `NONE`, `API_KEY`, `BEARER_TOKEN`, or `OAUTH2`.
- **`rate_limit_policy`**: Maximum requests per second, concurrency limit, and exponential backoff envelope.
- **`cache_ttl_seconds`**: Time-to-live for caching static metadata.
- **`health_check()`**: Returns ping latency, quota remaining, and service availability.

---

## 4. Evidence Ingestion & Epistemic Tiers

CIIA enforces the **CCDS Epistemic Taxonomy**, preventing unverified claims from masquerading as empirical facts.

```mermaid
graph TD
    RAW["Raw External Data (Paper, Web URL, Transcript, Note)"] --> CAND["Evidence Candidate"]
    
    CAND --> T1["<b>1. DISCOVERY SIGNAL</b><br/>Unverified initial observation, trend report, or news snippet."]
    CAND --> T2["<b>2. CONTEXTUAL EVIDENCE</b><br/>Domain context, macro statistics, TAM sizing, or literature background."]
    CAND --> T3["<b>3. VALIDATION EVIDENCE</b><br/>Direct empirical verification (Mom Test interview, peer-reviewed paper, baseline benchmark)."]
    
    T1 --> LEDG["<b>CONVERA Evidence Ledger</b>"]
    T2 --> LEDG
    T3 --> LEDG
    
    LEDG --> SCR["Evidence Quality Scorer<br/>(Authority • Methodology • Recency • Directness)"]
    SCR --> GATE{"Ratchet Gate Evaluation"}
    GATE -->|Pass| VAL["Validated Grounding"]
    GATE -->|Refute| REV["Pivot / Re-evaluate Loop"]

    style RAW fill:#0f172a,stroke:#334155,color:#94a3b8
    style T1 fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style T2 fill:#0c4a6e,stroke:#0284c7,color:#e0f2fe
    style T3 fill:#064e3b,stroke:#10b981,stroke-width:1.5px,color:#d1fae5
```

### 4.1 Invariant: AI Confidence $
eq$ Empirical Evidence Strength
- **AI Claim Confidence (0.00 – 1.00):** The model's statistical certainty that it extracted the text correctly.
- **Empirical Evidence Strength (`WEAK` | `MODERATE` | `STRONG` | `CONTRADICTED`):** The real-world evidentiary rigor based on primary source authority, sample size, methodology, and directness.

---

## 5. Task-Based AI Gateway & Cost Optimization

Rather than hardcoding calls to a single expensive model, the **CONVERA AI Gateway** dynamically routes tasks based on cognitive complexity and risk:

```mermaid
graph TD
    REQ["Incoming Reasoning Task"] --> ROUTE{"Task Classifier & Risk Assessor"}
    
    ROUTE -->|Fast / Low Risk| M_FAST["<b>Tier 1: Ultra-Fast Models</b><br/>(Groq Llama 3.3 70B @ 500t/s • Gemini Flash)<br/>• Keyword Extraction<br/>• Entity Classification<br/>• Title & Topic Parsing"]
    ROUTE -->|Medium Complexity| M_MED["<b>Tier 2: Balanced Reasoning Models</b><br/>(Llama 3.3 70B Instruct • Gemini Pro)<br/>• Research Synthesis<br/>• Blind Spot Detection<br/>• Problem Statement Enrichment"]
    ROUTE -->|High Risk / Deep Rigor| M_HIGH["<b>Tier 3: Frontier Reasoning Models</b><br/>(Gemini 3.8 Flash • DeepSeek R1 • Claude 3.5 Sonnet)<br/>• Socratic Mom Test Clinic<br/>• Devil's Advocate Interrogation<br/>• IEEE 830 Technical SRS Generation<br/>• Decision Room Triage & Trade-off Ranking"]
    
    M_FAST --> OUT["Structured Pydantic Output"]
    M_MED --> OUT
    M_HIGH --> OUT
    
    OUT --> AUDIT["Audit Trail & Provenance Logging"]
```

### 5.1 Routing Matrix

| Task Category | Minimum Reasoning | Default Provider | Fallback Provider | Max Latency |
|---|---|---|---|---|
| Keyword Extraction | Fast | Groq (Llama 3.3) | Gemini Flash | < 300ms |
| Entity & Claim Parsing | Fast | Gemini Flash | Groq (Llama 3.3) | < 500ms |
| Literature Relevance Gate | Medium | Gemini Flash | OpenRouter | < 1.0s |
| Socratic Mom Test | High Reasoning | Gemini 3.8 Flash | Groq (Llama 3.3) | < 2.0s |
| Devil's Advocate Challenge | High Reasoning | Gemini 3.8 Flash | OpenRouter | < 2.5s |
| Decision Room AI Judge | Highest Rigor | Gemini 3.8 Flash | OpenRouter | < 3.0s |
| IEEE 830 SRS Generation | Highest Rigor | Gemini 3.8 Flash | Local Ollama | < 4.0s |

---

## 6. Document Intelligence & Research Inbox Pipeline

To fulfill the core philosophy (*"Don't make the user organize the information for the system"*), the Research Inbox converts raw multi-modal dumps into structured knowledge:

```mermaid
graph TD
    IN["Raw Input:<br/>PDFs • DOCX • Transcripts • URLs • AI Chats • Notes"] --> PARSE["1. Multi-Format Text & Layout Parser"]
    PARSE --> CHUNK["2. Semantic Paragraph Chunking"]
    CHUNK --> EXT["3. Entity & Claim Extraction Engine"]
    EXT --> MAP["4. Entity Categorization:<br/>• Problem Frictions<br/>• Empirical Claims<br/>• Existing Workarounds<br/>• Assumptions & Uncertainties"]
    MAP --> PROV2["5. Source Provenance Tagging (DOI / URL / Timestamp)"]
    PROV2 --> REVIEW["6. Human Review & Verification Workspace"]
    REVIEW --> GRAPH[("Persistent Project Knowledge Graph")]

    style IN fill:#0f172a,stroke:#334155,color:#94a3b8
    style EXT fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style REVIEW fill:#064e3b,stroke:#10b981,color:#d1fae5
```

---

## 7. Research Connector Subsystem

CIIA integrates academic and scholarly knowledge providers under a unified schema:

```mermaid
graph TD
    subgraph Connectors["Academic Research Connectors"]
        OA["<b>OpenAlex Connector</b><br/>Scholarly works • Authors • Citations • Topics • Open-access PDFs"]
        SS["<b>Semantic Scholar Connector</b><br/>Academic Graph • Influential Citations • Related Work Clusters"]
        CR["<b>Crossref Connector</b><br/>DOI Resolution • Official Publisher Metadata • Bibliographies"]
        PM["<b>PubMed Connector</b><br/>Biomedical & Healthcare Research • MeSH Indexing"]
    end

    Connectors --> NORM_SCHOLAR["Unified Scholarly Work Schema<br/>(DOI • Title • Authors • Year • Journal • Citation Count • Abstract • Venue)"]
    NORM_SCHOLAR --> REL_GATE{"AI Relevance Filter & Sizing Gate"}
    REL_GATE -->|Relevant| LEDGER["Evidence Ledger Card"]
    REL_GATE -->|Irrelevant| DISCARD["Discarded / Low-Relevance Log"]
```

---

## 8. Web & Existing Solution Intelligence

To prevent student and research teams from reinventing existing systems, the **Existing Solution Agent** benchmarks external alternatives:

```mermaid
graph TD
    INPUT["Problem Statement / Venture Friction"] --> AGENT["Existing Solution Discovery Agent"]
    
    AGENT --> W1["Web & Commercial Search (Products, Startups, SaaS)"]
    AGENT --> W2["App Store & Product Discovery (Existing Workarounds)"]
    AGENT --> W3["Open-Source Repositories (GitHub, HuggingFace)"]
    AGENT --> W4["Government & NGO Registries"]
    
    W1 --> DEDUP["Similarity & Deduplication Engine"]
    W2 --> DEDUP
    W3 --> DEDUP
    W4 --> DEDUP
    
    DEDUP --> MATRIX["<b>Existing Solutions Matrix</b><br/>• Alternative Name<br/>• Target Audience<br/>• Core Mechanism<br/>• Unresolved Friction / Gap"]
    MATRIX --> GRAPH2[("Knowledge Graph (problem_alternatives)")]
```

---

## 9. Model Context Protocol (MCP) Architecture

CONVERA implements a **Bidirectional MCP Subsystem** operating as both an **MCP Client** and an **MCP Server**:

```mermaid
graph TD
    subgraph MCPClient["1. CONVERA as MCP Client (Consuming Tools)"]
        C_IN["AI Reasoning Agent"] --> MCP_ROUTER["MCP Tool Router"]
        MCP_ROUTER --> GITHUB_MCP["GitHub MCP Server (Read-Only Mode)<br/>• Inspect Repo Architecture<br/>• Read Requirements & Commits<br/>• Detect Traceability Gaps"]
        MCP_ROUTER --> FILES_MCP["Local Files MCP Server<br/>• Ingest Local Research PDFs<br/>• Read Transcripts & Notes"]
        MCP_ROUTER --> SEARCH_MCP["Web Search MCP Server<br/>• Live Query & Grounding"]
    end

    subgraph MCPServer["2. CONVERA as MCP Server (Exposing Knowledge)"]
        EXTERNAL_AI["External AI Clients (Claude, Cursor, Antigravity IDE)"] --> CONV_MCP["CONVERA MCP Server Endpoint"]
        CONV_MCP --> T_GET_CLAIMS["tools/get_claims"]
        CONV_MCP --> T_GET_EVIDENCE["tools/get_evidence"]
        CONV_MCP --> T_GET_ASSUMPTIONS["tools/get_assumptions"]
        CONV_MCP --> T_GET_DECISIONS["tools/get_decision_records"]
        CONV_MCP --> T_GET_STATE["tools/get_project_state"]
    end
```

---

## 10. Security, Isolation & Secret Governance

1. **Read-Only by Default:** All tool connectors (GitHub, Filesystem) operate under strict read-only execution. No arbitrary external code modifications or file deletions are permitted.
2. **Explicit Capability Grants:** External tools must be explicitly allowlisted per project room.
3. **Secret Isolation:** API keys (Gemini, Groq, OpenRouter, GitHub Tokens) are isolated in backend environment variables and never exposed to client-side code.
4. **Audit Logging:** Every AI execution, tool call, and connector request is logged in the `ai_runs` and `audit_events` tables.

---

## 11. Data Provenance & Traceability Model

Every output in CONVERA maintains an unbroken chain of custody:

```text
PRIMARY SOURCE (Paper DOI, Interview Audio, Official Dataset, Web URL)
       v
RAW INGESTION MATERIAL
       v
EXTRACTED CLAIM (Friction, Frequency, Dissatisfaction, Commitment)
       v
EVIDENCE LEDGER CARD (Scored & Grounded)
       v
NAMED ASSUMPTION (Prioritized Risk Tier)
       v
VALIDATION TEST & MOM TEST RESULT
       v
IMMUTABLE DECISION RECORD (Rationale & Rejected Alternatives)
       v
TECHNICAL ARTIFACT (IEEE 830 SRS Spec, Lean Canvas, Pitch Deck)
```

---

## 12. Phased Implementation Roadmap

```mermaid
graph LR
    P0["<b>Phase 1: Foundation</b><br/>• BaseConnector Interface<br/>• Task-Routed AI Gateway<br/>• OpenAlex & Semantic Scholar<br/>• Document Intelligence Parser"]
    
    P1["<b>Phase 2: Deep Intelligence</b><br/>• Contradiction Detection<br/>• Crossref & PubMed<br/>• Existing Solution Agent<br/>• GitHub MCP (Read-Only)"]
    
    P2["<b>Phase 3: Ecosystem Hub</b><br/>• CONVERA MCP Server<br/>• Playwright Testing MCP<br/>• Google Drive / Docs Importer"]

    P0 --> P1 --> P2
    
    style P0 fill:#0066ff,stroke:#60a5fa,stroke-width:2px,color:#ffffff
    style P1 fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc
    style P2 fill:#1e1b4b,stroke:#818cf8,stroke-width:1.5px,color:#f8fafc
```

---

## 13. Formal Implementation Interface Contracts

### 13.1 `BaseConnector` (Python Interface)
```python
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

class ProvenanceMetadata(BaseModel):
    source_name: str
    source_url: Optional[str] = None
    doi: Optional[str] = None
    retrieval_timestamp: str
    authority_tier: str = "PEER_REVIEWED"  # PEER_REVIEWED, OFFICIAL_DATA, FIELD_INTERVIEW, WEB_SIGNAL

class NormalizedScholarlyWork(BaseModel):
    doi: Optional[str]
    title: str
    authors: List[str]
    year: Optional[int]
    venue: Optional[str]
    citation_count: int = 0
    abstract: Optional[str]
    url: Optional[str]
    open_access_pdf_url: Optional[str]
    provenance: ProvenanceMetadata

class BaseConnector(ABC):
    @property
    @abstractmethod
    def connector_id(self) -> str:
        pass

    @abstractmethod
    async def search(self, query: str, limit: int = 10, **kwargs) -> List[NormalizedScholarlyWork]:
        pass

    @abstractmethod
    async def fetch_by_id(self, identifier: str) -> Optional[NormalizedScholarlyWork]:
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        pass
```

### 13.2 `EvidenceCandidate` (Python & TypeScript Schema)
```python
class EvidenceCandidate(BaseModel):
    id: str
    problem_id: str
    claim_text: str
    claim_type: str  # FRICTION_REALITY, FREQUENCY_CONSEQUENCE, WORKAROUND_DISSATISFACTION, ADOPTION_COMMITMENT
    evidence_tier: str  # DISCOVERY_SIGNAL, CONTEXTUAL_EVIDENCE, VALIDATION_EVIDENCE
    evidence_strength: str  # WEAK, MODERATE, STRONG, CONTRADICTED
    ai_confidence: float = Field(ge=0.0, le=1.0)
    supporting_quote: Optional[str]
    provenance: ProvenanceMetadata
    status: str = "PENDING_REVIEW"  # PENDING_REVIEW, VALIDATED, REFUTED
```

---

## 14. Document Governance & Status

- **Status:** Approved Baseline
- **Governing Standard:** CONVERA Concept Development Standard (CCDS v1.0)
- **Primary Authors:** Mark Alvin, Mae Daniella Faith, John Emmanuel (EMAERX)
- **Last Updated:** September 3, 2026
