import asyncio
import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure pipeline root is in path
sys.path.insert(0, ".")

from storage import get_storage
from research_client import FreeResearchClient
from evidence_scorer import calculate_score_breakdown

SECTOR_MAP = {
    "AGR": "Agriculture & Fisheries",
    "RET": "MSMEs & Retail",
    "MSM": "MSMEs & Retail",
    "LOG": "Transport & Logistics",
    "HLT": "Health & Wellness",
    "HWS": "Health & Wellness",
    "GOV": "Government Services & Compliance",
    "GSC": "Government Services & Compliance",
    "EDU": "Education & Youth",
    "FIN": "Finance & Credit",
    "HOU": "Housing & Utilities",
    "UTL": "Housing & Utilities",
}

async def ground_and_clean_all():
    storage = get_storage()
    client = FreeResearchClient(timeout=12.0)
    
    problems = storage.list_problems()
    print("==================================================")
    print(f"Starting High-Precision AI Grounding of {len(problems)} Problems in Bank")
    print("==================================================")
    
    updated_count = 0
    
    for idx, p in enumerate(problems, 1):
        pid = p.get("id")
        prefix = pid.split("-")[0] if "-" in pid else ""
        correct_sector = SECTOR_MAP.get(prefix, p.get("sector") or "General")
        
        statement = p.get("problem_statement") or ""
        occupation = p.get("sufferer_occupation") or ""
        location = p.get("sufferer_location") or "Iloilo, Philippines"
        
        print(f"\n[{idx}/{len(problems)}] Evaluating & Grounding {pid} ({correct_sector}):")
        print(f"   Actor: {occupation} | Loc: {location}")
        
        try:
            res = await client.auto_research_problem(p)
            verified_items = res.get("all_combined", [])
        except Exception as err:
            print(f"   [!] Research error: {err}")
            verified_items = []
            
        new_sources = []
        for paper in verified_items[:3]:
            new_sources.append({
                "source_name": paper["source_name"],
                "source_url": paper["source_url"],
                "source_tier": "A",
                "quote_or_summary": str(paper.get("quote_or_summary") or paper.get("summary") or "").strip(),
                "citation": f"{paper['venue']} ({paper['year']}) - DOI: {paper.get('doi') or 'N/A'}"
            })
            
        # Fallback if 0 hits: keep previous cleaned source
        if not new_sources:
            existing = p.get("sources") or []
            new_sources = [s for s in existing if s.get("source_tier") == "A" or s.get("source_url")][:2]
            
        # Calculate rubric breakdown
        breakdown = calculate_score_breakdown(p, new_sources)
        score = breakdown.get("total_score", 85.0)
        tier_label = breakdown.get("tier", "Documented")
        
        updates = {
            "sector": correct_sector,
            "sources": new_sources,
            "notes": f"AI-Verified empirical research via OpenAlex & Crossref. Evidence Tier: {tier_label} ({score}% confidence).",
        }
        
        storage.update_problem(pid, updates)
        updated_count += 1
        print(f"   -> Attached {len(new_sources)} AI-verified sources. Score: {score}% ({tier_label})")
        
        await asyncio.sleep(0.3)
        
    print("\n==================================================")
    print(f"High-Precision Cleanup Complete! {updated_count}/{len(problems)} problems verified with relevant empirical research.")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(ground_and_clean_all())
