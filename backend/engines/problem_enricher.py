"""
Problem Enricher Module
Transforms unstructured user notes, observations, and raw field findings
into structured, rubric-validated Problem Bank records using LLM intelligence.
"""

import json
import re
from typing import Any, Dict, Optional
from llm_gateway import generate_response_with_fallback

PROBLEM_ENRICHER_SYSTEM = """
You are the RatchetAI Clinical Problem Architect.
Your task is to take raw, messy, or unstructured field notes from a human researcher/founder
and structure them into a high-fidelity problem record conforming to the Evidence-Ratcheted Problem Discovery Protocol (Iloilo / Panay context).

CANONICAL SECTORS (Choose exactly one):
1. Agriculture & Fisheries
2. Health & Wellness
3. MSMEs & Retail
4. Education & Youth
5. Transport & Logistics
6. Housing & Utilities
7. Government Services & Compliance
8. Finance & Credit

CLINICAL RULES:
1. PURE PROBLEM STATEMENT: Strip away all solution pitches, tech ideas, mobile apps, or device ideas. If the user note says "We need an app to connect farmers", convert it to the pure root friction (e.g., "Lack of transparent spot market pricing forces farmers to sell produce to predatory middlemen at 40% below retail").
2. CONCRETE SUFFERER: Identify the specific occupation and specific barangay / municipality in Iloilo or Western Visayas.
3. REVEALED WORKAROUND: Identify what they currently do, pay, or endure to cope.
4. QUANTIFIED IMPACT: Extract or plausibly bound economic loss in PHP, % loss, or wasted hours.
5. STRICT JSON OUTPUT ONLY: Output NOTHING except a single valid JSON object. No Markdown code blocks, no preambles.

JSON Schema:
{
  "sector": "string (One of the 8 canonical sectors)",
  "sufferer_occupation": "string (Specific target actor)",
  "sufferer_location": "string (Named Iloilo municipality or barangay)",
  "problem_statement": "string (Pure operational/economic friction without solutions)",
  "evidence_tier": "SIGNAL",
  "workaround": "string (Current coping mechanism or makeshift expense)",
  "quantified_impact": "string (Estimated PHP loss, %, or hours wasted)",
  "evidence_types": ["Field Observation"],
  "tags": ["tag1", "tag2"],
  "field_research_gap": "string (What primary interview/evidence is needed to validate)",
  "sources": [
    {
      "source_name": "string (Name of source or Field Observation)",
      "source_url": null,
      "source_tier": "C",
      "evidence_type": "Field Observation / Note",
      "quote_or_summary": "string"
    }
  ]
}
"""

async def enrich_manual_problem_input(
    raw_note: str,
    project_id: Optional[str] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Takes unstructured human notes and runs LLM extraction to return a structured problem dictionary.
    """
    prompt = f"RAW RESEARCHER FIELD NOTE:\n\"\"\"\n{raw_note.strip()}\n\"\"\"\n\nStructure this into the JSON problem record."

    response = await generate_response_with_fallback(
        system_instruction=PROBLEM_ENRICHER_SYSTEM,
        prompt=prompt,
        
    )

    # Clean potential markdown fences
    cleaned = response.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
        cleaned = re.sub(r"\n```$", "", cleaned)

    try:
        data = json.loads(cleaned)
    except Exception:
        # Fallback regex extraction
        json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
        else:
            # Safe default fallback
            data = {
                "sector": "MSMEs & Retail",
                "sufferer_occupation": "Local business operators",
                "sufferer_location": "Iloilo City",
                "problem_statement": raw_note.strip()[:150],
                "evidence_tier": "SIGNAL",
                "workaround": "Manual workarounds",
                "quantified_impact": "Unquantified friction",
                "evidence_types": ["Field Observation"],
                "tags": ["manual-entry"],
                "sources": [{
                    "source_name": "Manual Observation",
                    "source_url": None,
                    "source_tier": "C",
                    "evidence_type": "Field Observation",
                    "quote_or_summary": raw_note.strip()
                }]
            }

    data["source"] = "manual"
    data["source_detail"] = "User Manual Observation (AI Enriched)"
    if project_id:
        data["project_id"] = project_id
    if session_id:
        data["session_id"] = session_id

    return data
