"""
CONVERA Research Intelligence Agent (Phase 5)
==============================================
Governed by: CIIA v1.0 & CCDS Epistemic Taxonomy.
Orchestrates federated scholarly discovery across OpenAlex, Semantic Scholar,
Crossref, and PubMed. Extracts empirical claims, quotes, and macro statistics
with complete provenance metadata.
"""

from __future__ import annotations
import json
import re
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

from connectors.hub import connector_hub
from connectors.base import NormalizedScholarlyWork, EvidenceCandidate, ProvenanceMetadata
from llm_gateway import generate_response_with_fallback, TaskCategory


class ResearchIntelligenceReport(BaseModel):
    query: str
    sector: Optional[str] = None
    sources_discovered: int = 0
    top_papers: List[Dict[str, Any]] = Field(default_factory=list)
    synthesized_summary: str
    macro_statistics: List[str] = Field(default_factory=list)
    evidence_candidates: List[EvidenceCandidate] = Field(default_factory=list)
    contradictions_found: List[str] = Field(default_factory=list)
    recommended_next_queries: List[str] = Field(default_factory=list)


async def execute_research_agent(
    query: str,
    sector: Optional[str] = None,
    location: Optional[str] = None,
    limit_per_source: int = 3,
    connector_ids: Optional[List[str]] = None
) -> ResearchIntelligenceReport:
    """
    Autonomous Research Intelligence Agent.
    1. Performs federated discovery across academic connectors.
    2. Uses Task-Routed LLM to extract grounded claims and metrics.
    3. Returns a structured ResearchIntelligenceReport with EvidenceCandidates.
    """
    # 1. Federated Discovery
    search_query = f"{query} {location or ''}".strip()
    works: List[NormalizedScholarlyWork] = await connector_hub.federated_search(
        query=search_query,
        limit_per_source=limit_per_source,
        connector_ids=connector_ids
    )

    if not works:
        return ResearchIntelligenceReport(
            query=query,
            sector=sector,
            sources_discovered=0,
            synthesized_summary="No academic literature or empirical datasets found for the query.",
            recommended_next_queries=[f"{query} post harvest", f"{query} Philippines statistics"]
        )

    # 2. Build Context Dossier
    dossier_lines = []
    top_papers = []
    for idx, w in enumerate(works[:8], 1):
        top_papers.append({
            "title": w.title,
            "doi": w.doi,
            "year": w.year,
            "venue": w.venue,
            "authors": w.authors[:3],
            "citations": w.citation_count,
            "source": w.provenance.source_name
        })
        dossier_lines.append(
            f"Paper #{idx}:\n"
            f"Work ID: {w.id or 'N/A'}\n"
            f"Title: {w.title}\n"
            f"DOI: {w.doi or 'N/A'}\n"
            f"Year: {w.year or 'N/A'}\n"
            f"Venue: {w.venue or 'N/A'}\n"
            f"Abstract: {w.abstract[:2000] if w.abstract else 'No abstract provided.'}\n"
            f"Source: {w.provenance.source_name}\n"
        )

    dossier_text = "\n".join(dossier_lines)

    # 3. LLM Claim & Metric Extraction
    system_prompt = (
        "You are the CONVERA Research Intelligence Agent operating under the CIIA v1.0 standard.\n"
        "Analyze the provided academic papers and extract objective empirical evidence, quantifiable metrics,\n"
        "and structured claims.\n"
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "synthesized_summary": "2-3 sentence overview of academic consensus",\n'
        '  "macro_statistics": ["35% post-harvest loss reported in Western Visayas", "2.4h average transport delay"],\n'
        '  "extracted_claims": [\n'
        "    {\n"
        '      "claim_text": "Specific empirical finding or friction statement",\n'
        '      "claim_type": "FRICTION_REALITY" | "FREQUENCY_CONSEQUENCE" | "WORKAROUND_DISSATISFACTION" | "ADOPTION_COMMITMENT",\n'
        '      "evidence_tier": "VALIDATION_EVIDENCE" | "CONTEXTUAL_EVIDENCE" | "DISCOVERY_SIGNAL",\n'
        '      "evidence_strength": "STRONG" | "MODERATE" | "WEAK",\n'
        '      "ai_confidence": 0.90,\n'
        '      "supporting_quote": "Exact quote from title/abstract if applicable",\n'
        '      "doi": "10.1016/..."\n'
        "    }\n"
        "  ],\n"
        '  "contradictions_found": ["Any conflicting data or methodology gaps"],\n'
        '  "recommended_next_queries": ["2-3 focused follow-up queries"]\n'
        "}"
    )

    user_prompt = f"Query: {query}\nSector: {sector or 'General'}\nLocation: {location or 'General'}\n\nAcademic Papers Dossier:\n{dossier_text}"

    ai_resp_str = await generate_response_with_fallback(
        system_instruction=system_prompt,
        prompt=user_prompt,
        task_category=TaskCategory.BALANCED_SYNTHESIS
    )

    # Clean JSON
    match = re.search(r"\{[\s\S]*\}", ai_resp_str)
    raw_json = match.group(0) if match else "{}"
    
    try:
        data = json.loads(raw_json)
    except Exception:
        data = {
            "synthesized_summary": "Synthesized academic review based on discovered literature.",
            "macro_statistics": [],
            "extracted_claims": [],
            "contradictions_found": [],
            "recommended_next_queries": [f"{query} empirical study"]
        }

    # Map to EvidenceCandidate objects
    evidence_candidates = []
    for idx, c in enumerate(data.get("extracted_claims", []), 1):
        claim_doi = c.get("doi")
        cand = EvidenceCandidate(
            id=f"EV-CAND-{idx:03d}",
            claim_text=c.get("claim_text", "Empirical finding"),
            claim_type=c.get("claim_type", "FRICTION_REALITY"),
            evidence_tier=c.get("evidence_tier", "CONTEXTUAL_EVIDENCE"),
            evidence_strength=c.get("evidence_strength", "MODERATE"),
            ai_confidence=float(c.get("ai_confidence", 0.85)),
            supporting_quote=c.get("supporting_quote"),
            extracted_from=claim_doi or query,
            provenance=ProvenanceMetadata(
                source_name=c.get("source_name", "Academic Scholarly Discovery"),
                doi=claim_doi,
                source_url=f"https://doi.org/{claim_doi}" if claim_doi else None
            )
        )
        evidence_candidates.append(cand)

    return ResearchIntelligenceReport(
        query=query,
        sector=sector,
        sources_discovered=len(works),
        top_papers=top_papers,
        synthesized_summary=data.get("synthesized_summary", "Academic literature synthesized."),
        macro_statistics=data.get("macro_statistics", []),
        evidence_candidates=evidence_candidates,
        contradictions_found=data.get("contradictions_found", []),
        recommended_next_queries=data.get("recommended_next_queries", [])
    )
