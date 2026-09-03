"""
CONVERA Document Intelligence & Research Inbox Parser
=====================================================
Parses unstructured notes, interview transcripts, research summaries, and CSV dumps into
grounded Problem Claims, Evidence Candidates, and Provenance records under CIIA v1.0.
"""

import json
import re
import uuid
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from connectors.base import EvidenceCandidate, ProvenanceMetadata
from llm_gateway import generate_response_with_fallback, TaskCategory


class IngestedDocumentResult(BaseModel):
    document_id: str
    inferred_title: str
    inferred_sector: str
    problem_statement: str
    evidence_candidates: List[EvidenceCandidate] = Field(default_factory=list)
    identified_assumptions: List[Dict[str, Any]] = Field(default_factory=list)
    raw_chunk_count: int = 0
    provenance: ProvenanceMetadata


def chunk_text(text: str, max_chunk_chars: int = 2000) -> List[str]:
    """Split raw text into semantic paragraphs."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks = []
    current_chunk = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) > max_chunk_chars and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [p]
            current_len = len(p)
        else:
            current_chunk.append(p)
            current_len += len(p)

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks if chunks else [text]


async def parse_and_extract_document(
    raw_content: str,
    source_name: str = "Research Inbox Ingestion",
    source_url: Optional[str] = None,
    doi: Optional[str] = None,
    authority_tier: str = "FIELD_INTERVIEW"
) -> IngestedDocumentResult:
    """Extract grounded claims and evidence candidates from raw document text."""
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    chunks = chunk_text(raw_content)

    system_prompt = """You are the CONVERA Epistemic Document Intelligence Engine.
Your task is to analyze unstructured notes, interview transcripts, research snippets, or field observations.
You must extract the core problem, empirical claims, supporting quotes, and testable assumptions.

Output MUST be a strict JSON object with this exact structure:
{
  "inferred_title": "Short, descriptive 4-7 word problem or project title",
  "inferred_sector": "Primary industry or domain sector",
  "problem_statement": "Clear 1-3 sentence core problem statement rooted in friction",
  "claims": [
    {
      "claim_text": "Specific, falsifiable claim made in the text",
      "claim_type": "FRICTION_REALITY" | "FREQUENCY_CONSEQUENCE" | "WORKAROUND_DISSATISFACTION" | "ADOPTION_COMMITMENT",
      "evidence_tier": "DISCOVERY_SIGNAL" | "CONTEXTUAL_EVIDENCE" | "VALIDATION_EVIDENCE",
      "evidence_strength": "WEAK" | "MODERATE" | "STRONG",
      "ai_confidence": 0.85,
      "supporting_quote": "Exact or paraphrased excerpt from the text"
    }
  ],
  "assumptions": [
    {
      "assumption": "Underlying unverified belief or hypothesis required for this problem/solution to hold",
      "risk_level": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}

Only return valid JSON without markdown wrapping or code fences."""

    user_prompt = f"""Analyze the following raw input material:

---
{raw_content[:4000]}
---

Extract the structured claims, evidence candidates, and problem statement."""

    try:
        response_text = await generate_response_with_fallback(
            system_instruction=system_prompt,
            prompt=user_prompt,
            task_category=TaskCategory.FAST_EXTRACTION
        )
        
        # Clean JSON fences if present
        clean_json = response_text.strip()
        if clean_json.startswith("```"):
            clean_json = re.sub(r"^```(?:json)?", "", clean_json)
            clean_json = re.sub(r"```$", "", clean_json).strip()
            
        data = json.loads(clean_json)
    except Exception:
        # Robust fallback extraction if LLM formatting fails
        lines = [line.strip() for line in raw_content.splitlines() if line.strip()]
        first_line = lines[0] if lines else "Raw Ingested Note"
        data = {
            "inferred_title": first_line[:50],
            "inferred_sector": "General Discovery",
            "problem_statement": raw_content[:200] + "...",
            "claims": [
                {
                    "claim_text": line,
                    "claim_type": "FRICTION_REALITY",
                    "evidence_tier": "DISCOVERY_SIGNAL",
                    "evidence_strength": "WEAK",
                    "ai_confidence": 0.70,
                    "supporting_quote": line
                }
                for line in lines[:4]
            ],
            "assumptions": []
        }

    prov = ProvenanceMetadata(
        source_name=source_name,
        source_url=source_url,
        doi=doi,
        authority_tier=authority_tier,
        methodology_notes=f"Parsed via CONVERA Document Intelligence ({len(chunks)} chunks analyzed)."
    )

    evidence_candidates = []
    for idx, c in enumerate(data.get("claims", [])):
        cand = EvidenceCandidate(
            id=f"cand_{doc_id}_{idx+1}",
            claim_text=c.get("claim_text") or "Unspecified claim",
            claim_type=c.get("claim_type") or "FRICTION_REALITY",
            evidence_tier=c.get("evidence_tier") or "DISCOVERY_SIGNAL",
            evidence_strength=c.get("evidence_strength") or "MODERATE",
            ai_confidence=float(c.get("ai_confidence") or 0.85),
            supporting_quote=c.get("supporting_quote"),
            extracted_from=source_name,
            provenance=prov,
            status="PENDING_REVIEW"
        )
        evidence_candidates.append(cand)

    return IngestedDocumentResult(
        document_id=doc_id,
        inferred_title=data.get("inferred_title") or "Ingested Problem Candidate",
        inferred_sector=data.get("inferred_sector") or "General",
        problem_statement=data.get("problem_statement") or raw_content[:250],
        evidence_candidates=evidence_candidates,
        identified_assumptions=data.get("assumptions", []),
        raw_chunk_count=len(chunks),
        provenance=prov
    )
