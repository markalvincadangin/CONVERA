# CONVERA Intelligence & Integration Architecture (CIIA)

**Product:** CONVERA  
**Parent Brand:** EMAERX  
**Standard Alignment:** CONVERA Concept Development Standard (CCDS) • Model Context Protocol (MCP) • IEEE 830 / ISO 29148  
**Document Type:** Technical Systems, Integration Contract & Experimental Cloud R&D Specification  
**Status:** Approved / Implementation Baseline  
**Version:** 1.0  

---

## 1. Executive Summary & Core Doctrine

The **CONVERA Intelligence & Integration Architecture (CIIA)** defines the formal architectural contract between the **CONVERA Core System** (Knowledge, Evidence, Framework, and Decision Engines) and the external intelligence ecosystem (Large Language Models, Academic APIs, Web Search, Document Parsers, MCP Tooling, and Cloud Accelerators).

CIIA is governed by two foundational doctrines:

> ### **Doctrine I: "External systems provide information and capabilities; CONVERA provides the persistent context, evidence structure, governance, and decision intelligence."**

> ### **Doctrine II: Free-First Sovereign Core + Controlled Cloud Acceleration.**  
> *Build CONVERA's core as a ₱0, provider-independent sovereign platform, while using experimental cloud credits ($20 Google Cloud credits) as a strictly bounded R&D laboratory to determine which cloud-managed capabilities provide empirical value over local baselines.*

```text
CONVERA CORE (₱0 Required Baseline)
       │
┌──────┴─────────────────────────────────┐
│ LOCAL FREE FIRST                       │  GOOGLE CLOUD R&D ($20 Credits)
│ • Ollama (100% Local / Private)        │  • Agent Platform Benchmark
│ • Gemini Developer API (Free Tier)     │  • Agent Garden Pattern Mining
│ • SQLite WAL / PostgreSQL + pgvector   │  • Cloud Vertex RAG vs pgvector
│ • OpenAlex, S2, Crossref (Free Public) │  • Comparative Latency / Cost Benchmark
└────────────────────────────────────────┘
```

---

## 2. System Architecture & Boundaries

```mermaid
graph TD
    subgraph ClientTier["CONVERA Application Tier"]
        UI["Multi-Device Workspace & Stepper"]
        ST["Deliverables Studio & Decision Room"]
        INBOX_UI["AI Research Inbox Drawer"]
    end

    subgraph CoreTier["CONVERA Core Engines"]
        FE["<b>Framework Engine</b><br/>Orchestrates Stages, Activities & Ratchet Gates"]
        KE["<b>Knowledge Engine</b><br/>Maintains Problem-Claim-Assumption Ontology"]
        EE["<b>Evidence Engine</b><br/>Enforces Ledgers, Tiers & Provenance Records"]
        DE["<b>Decision Engine</b><br/>Evaluates Trade-offs & Pivot Learning Loops"]
    end

    subgraph CIIALayer["CONVERA Intelligence & Integration Layer (CIIA)"]
        GW["<b>Task-Routed AI Gateway</b><br/>Model Router • Cost Governance • Failover Cascade"]
        HUB["<b>Universal Connector Hub</b><br/>Auth • Rate Limits • Normalization • Cache"]
        DOC["<b>Document Intelligence Engine</b><br/>Semantic Chunking • Claim & Quote Extraction"]
        MCP_SUB["<b>MCP Subsystem (Client & Server)</b><br/>GitHub (Read-Only) • Files • CONVERA MCP Tools"]
    end

    subgraph ExternalEcosystem["External Ecosystem & Providers"]
        LLMS["LLM Providers<br/>(Gemini Free Tier, Groq Llama 3.3, Ollama Local, OpenRouter)"]
        RES["Academic APIs<br/>(OpenAlex, Semantic Scholar, Crossref, PubMed)"]
        TOOLS["External Tools<br/>(GitHub MCP Read-Only, Web Search)"]
        CLOUD_EXP["Google Cloud R&D Lab<br/>($20 Credit Controlled Experiments)"]
    end

    ClientTier --> CoreTier
    CoreTier <--> CIIALayer
    
    GW <--> LLMS
    HUB <--> RES
    HUB <--> DOC
    MCP_SUB <--> TOOLS
    GW -.-> CLOUD_EXP
    
    CoreTier --> KG[("<b>Persistent Relational Knowledge Graph</b><br/>(Zero-Ops SQLite WAL / PostgreSQL + pgvector)")]

    style CIIALayer fill:#0b0f14,stroke:#0066ff,stroke-width:2px,color:#ffffff
    style CoreTier fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc
    style ExternalEcosystem fill:#1e1b4b,stroke:#818cf8,stroke-width:1.5px,color:#f8fafc
    style KG fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff
    style CLOUD_EXP fill:#451a03,stroke:#f59e0b,stroke-width:1.5px,stroke-dasharray: 5 5,color:#fef3c7
```

---

## 3. Universal Connector Contract (`BaseConnector`)

Every external data source, academic index, or search engine implements the `BaseConnector` interface:

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
- **`connector_id`**: Unique string identifier (`openalex`, `semantic_scholar`, `crossref`, `pubmed`).
- **`capabilities`**: Declared feature list (`SEARCH`, `FETCH_BY_ID`, `CITATIONS`, `TOPICS`, `PROVENANCE`).
- **`auth_type`**: `NONE`, `API_KEY`, `BEARER_TOKEN`, or `OAUTH2`.
- **`rate_limit_policy`**: Maximum requests per second, concurrency limit, and exponential backoff envelope.
- **`cache_ttl_seconds`**: Time-to-live for caching static metadata (default: 3600s).
- **`health_check()`**: Returns ping latency, status code, and operational availability.

---

## 4. Evidence Ingestion & Epistemic Taxonomy

CIIA strictly isolates **AI generation** from **Empirical evidence**:

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
- **AI Claim Confidence (0.00 – 1.00):** The model's statistical extraction certainty.
- **Empirical Evidence Strength (`WEAK` | `MODERATE` | `STRONG` | `CONTRADICTED`):** The real-world evidentiary rigor based on primary source authority, sample size, methodology, and directness.

---

## 5. Task-Based AI Gateway & Cost Governance

```mermaid
graph TD
    TASK["Incoming Reasoning Task"] --> ROUTER{"Task Category & Risk Classifier"}
    
    ROUTER -->|FAST_EXTRACTION| M1["<b>Ollama Local / Groq Llama 3.3</b><br/>(0 cost • 500 tok/s)<br/>• Keyword Extraction<br/>• Entity Tagging"]
    ROUTER -->|BALANCED_SYNTHESIS| M2["<b>Gemini Flash / Ollama</b><br/>(Free Tier)<br/>• Problem Enrichment<br/>• Blind Spot Detection"]
    ROUTER -->|SOCRATIC_CLINIC / DEEP_REASONING| M3["<b>Gemini 3.8 Flash / DeepSeek R1</b><br/>• Mom Test Socratic Interrogation<br/>• Devil's Advocate Attacks<br/>• Decision Room Triage"]
    ROUTER -->|SRS_SPECIFICATION| M4["<b>Gemini 3.8 Flash / Local Llama</b><br/>• IEEE 830 Specification<br/>• Lean Canvas & Pitch Deck"]
    
    M1 --> OUT["Structured Pydantic Output"]
    M2 --> OUT
    M3 --> OUT
    M4 --> OUT
    
    OUT --> LOG["<b>AI_RUN Cost & Audit Logging</b><br/>(Provider • Tokens • Latency • Estimated Cost • Cache Hit)"]
```

---

## 6. Document Intelligence & Research Inbox Pipeline

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

## 7. Model Context Protocol (MCP) Architecture

CONVERA operates as both an **MCP Client** and an **MCP Server**:

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

## 8. Google Cloud Experimental Integration & Credit Governance

To balance **zero-cost sovereign independence** with **rapid technological acceleration**, CONVERA establishes a controlled Google Cloud R&D protocol governed by the **$20 Experimental Credit Budget**.

```text
                       CONVERA R&D STRATEGY
                       
        FREE BASELINE (₱0)                   CLOUD EXPERIMENTS ($20)
     ┌───────────────────────┐            ┌───────────────────────────┐
     │ Ollama Local          │            │ Google Agent Platform     │
     │ Gemini Free API Tier  │ vs. Target │ Vertex AI Search / RAG    │
     │ SQLite WAL / pgvector │            │ Agent Garden Patterns     │
     └───────────────────────┘            └───────────────────────────┘
                 │                                      │
                 └──────────────────┬───────────────────┘
                                    ▼
                     EVIDENCE-BASED EVALUATION GATE
               (Precision • Recall • Latency • Cost ROI)
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          EMPIRICALLY SUPERIOR?               MARGINAL / OVERPRICED?
         (Adopt as optional adapter)        (Keep ₱0 Free Core baseline)
```

### 8.1 $20 Credit Safety Allocation Matrix

| Allocation Category | Budget Cap | Primary Objective | Safety Kill Threshold |
|---|---|---|---|
| **Safety & Setup Validation** | **$2.00** | Test Spend-Cap, Billing API telemetry, and Cloud IAM boundaries | > $1.50 |
| **Agent Platform & ADK Experiment** | **$4.00** | Benchmark Google-managed agent infrastructure vs. CONVERA native routing | > $3.50 |
| **Agent Garden Pattern Mining** | **$4.00** | Inspect architectural patterns for RAG, multi-agent coordination, and MCP | > $3.50 |
| **Vertex RAG vs pgvector Benchmark** | **$4.00** | Evaluate retrieval precision, citation accuracy, and hallucination rate | > $3.50 |
| **Model Quality & Reasoning Evaluation** | **$3.00** | Head-to-head reasoning audit on complex Mom Test & IEEE 830 scenarios | > $2.50 |
| **High-Value Contingency Reserve** | **$3.00** | Reserved for breakthrough experiments or final re-verification | > $2.50 |
| **TOTAL EXPERIMENTAL BUDGET** | **$20.00** | **Strict Hard Spend-Cap Enabled in Google Cloud Billing** | **100% Hard Stop** |

### 8.2 The Four Controlled Cloud Experiments

#### Experiment A: Google Agent Platform vs. Native CIIA Agent Architecture
- **Hypothesis:** Does Google-managed agent orchestration provide superior state management, latency, or tool integration over CONVERA's native asyncio task routing?
- **Metric:** Latency (ms), Execution reliability (%), Development maintenance overhead, and token cost per reasoning cycle.

#### Experiment B: Agent Garden Architectural Pattern Mining
- **Principle:** Agent Garden is a **pattern library and accelerator**, never a vendor lock-in dependency.
- **Process:** Inspect reference architectures in Agent Garden $	o$ Extract reusable prompt/agent patterns $	o$ Port to provider-agnostic CIIA connectors.

#### Experiment C: Google Vertex RAG vs. CONVERA PostgreSQL pgvector
- **Hypothesis:** Does Vertex AI Search justify recurring cloud costs over a local, free PostgreSQL + pgvector cluster?
- **Metrics Evaluated:**
  1. *Retrieval Precision & Recall* on 100 benchmark research papers.
  2. *Citation Accuracy* (zero hallucinated DOIs).
  3. *Query Latency & Financial Cost per 1,000 Queries*.

#### Experiment D: Cloud Frontier Model vs. Local/Free Model Benchmark
- **Hypothesis:** Identify the exact threshold where free models (Groq Llama 3.3, Gemini Free Tier, Ollama) match or underperform frontier paid models in Socratic Mom Test challenging and IEEE 830 requirement generation.

---

## 9. Complete 9-Phase Implementation Sequence

```mermaid
graph TD
    P1["<b>Phase 1: Architecture</b><br/>• Freeze Domain Contracts<br/>• CIIA v1.0 Spec<br/>• Epistemic Ingestion Rules"]
    P2["<b>Phase 2: Core Foundation</b><br/>• SQLite WAL / PostgreSQL<br/>• pgvector Setup<br/>• Knowledge Graph & Evidence Ledger"]
    P3["<b>Phase 3: CIIA Connectors</b><br/>• Task-Routed AI Gateway<br/>• OpenAlex, S2, Crossref<br/>• BaseConnector Contract"]
    P4["<b>Phase 4: Document Intelligence</b><br/>• Document Parser Engine<br/>• AI Research Inbox<br/>• Duplicate Detection"]
    P5["<b>Phase 5: Intelligent Agents</b><br/>• Research Agent<br/>• Socratic Mom Test Critic<br/>• Citation Verifier"]
    P6["<b>Phase 6: Multi-Frameworks</b><br/>• Research Framework (CRCDP)<br/>• Innovation (5-Phase Ratchet)<br/>• Capstone & Product"]
    P7["<b>Phase 7: Decision Room</b><br/>• Decision Room Triage<br/>• Assumption Radar<br/>• SRS & Artifact Studio"]
    P8["<b>Phase 8: Cloud R&D ($20)</b><br/>• Agent Platform Experiment<br/>• Vertex RAG Benchmark<br/>• Model Evaluation"]
    P9["<b>Phase 9: Architectural Decision</b><br/>• Evidence-Based Adapter Decisions<br/>• Freeze Sovereign Production Release"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8 --> P9

    style P1 fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style P2 fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style P3 fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style P4 fill:#0066ff,stroke:#60a5fa,stroke-width:2px,color:#ffffff
    style P5 fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style P6 fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style P7 fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style P8 fill:#451a03,stroke:#f59e0b,color:#fef3c7
    style P9 fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff
```

---

## 10. Document Governance & Status

- **Document Identifier:** `CIIA-SPEC-v1.0`
- **Governing Standard:** CONVERA Concept Development Standard (CCDS v1.0)
- **Primary Authors:** Mark Alvin, Mae Daniella Faith, John Emmanuel (EMAERX)
- **Status:** Active Implementation Baseline
- **Last Updated:** September 3, 2026
