# CONVERA Backend Pipeline Architecture

**Product:** CONVERA — Evidence-Driven Project Intelligence and Opportunity Validation System  
**Parent Brand:** EMAERX  
**Version:** 3.0.0  
**Stack:** Python 3.12 • FastAPI • Pydantic v2 • SQLite WAL • Asyncio  

---

## 🏛️ Directory Structure

```
pipeline/
├── engines/                         # Specialized Intelligence & Research Engines
│   ├── __init__.py                  # Unified package exports
│   ├── assumption_engine.py         # Step 1: 4-Claim Ledger & Mom Test Generator
│   ├── decision_engine.py           # Step 2: Decision Room AI Synthesis & Pivot Loops
│   ├── srs_generator.py             # Step 3: IEEE 830 / CHED Capstone SRS Generator
│   ├── deliverables_generator.py    # Lean Canvas, SWOT & 10-Slide Pitch Deck Engine
│   ├── research_client.py           # Academic DOI Client (OpenAlex, Crossref, Europe PMC)
│   ├── evidence_scorer.py           # Multi-Factor Evidence Scoring Engine
│   ├── devils_advocate.py           # Adversarial Stress-Testing & Critique
│   ├── blind_spot_detector.py       # Customer Assumption Blind Spot Extraction
│   ├── problem_enricher.py          # Problem Bank AI Enrichment
│   └── problem_parser.py            # Multi-AI Raw Brainstorm Ingestion Parser
├── storage/                         # Database & Persistence Subsystem
│   ├── __init__.py
│   ├── base.py                      # Abstract Storage Engine Interface
│   ├── factory.py                   # Pluggable Storage Factory (SQLite WAL / Postgres)
│   └── sqlite_adapter.py            # Zero-Ops SQLite WAL Relational Knowledge Graph
├── schemas/                         # Pydantic Input/Output Validation Models
│   ├── __init__.py
│   ├── phase1_output.py ... phase5_output.py
│   └── (Request & Response schemas)
├── prompts/                         # System Prompts & Socratic Interrogator Clinical Directives
│   ├── __init__.py
│   └── phase1_system.py ... phase5_system.py
├── gates/                           # Strict Mechanical Ratchet Gates
│   └── __init__.py
├── scripts/                         # Maintenance & Ingestion Utilities
│   ├── __init__.py
│   └── clean_and_ground_problem_bank.py
├── tests/                           # Complete Pytest Test Suite
│   └── test_*.py
├── config.py                        # Centralized Settings & Environment Config
├── llm_gateway.py                   # Multi-Provider Failover LLM Client (Gemini / Groq / OpenRouter / Ollama)
├── server.py                        # FastAPI Application & REST Route Controllers
└── main.py                          # CLI Orchestrator & Standalone Entry Point
```

---

## 🚀 Running the Pipeline

### Development Server
```powershell
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Running Tests
```powershell
python -m pytest tests/
```
