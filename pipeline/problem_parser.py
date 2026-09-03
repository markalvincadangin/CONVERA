"""
Phase 1 Markdown to Structured Problem Bank Parser
Extracts structured problem records, source links, and deep-dive analyses
from Phase 1 Discovery Advisor markdown reports.
"""

import re
from typing import Any, Dict, List, Optional

SECTOR_PREFIX_MAP = {
    "AGR": "Agriculture & Fisheries",
    "HW": "Health & Wellness",
    "HLT": "Health & Wellness",
    "MSME": "MSMEs & Retail",
    "RET": "MSMEs & Retail",
    "EDU": "Education & Youth",
    "ED": "Education & Youth",
    "TRN": "Transport & Logistics",
    "LOG": "Transport & Logistics",
    "HOU": "Housing & Utilities",
    "UTL": "Housing & Utilities",
    "GOV": "Government Services & Compliance",
    "FIN": "Finance & Credit",
    "CRE": "Finance & Credit",
}

def infer_sector(problem_id: str, title: str) -> str:
    """Infer sector from problem ID prefix or document title."""
    clean_id = re.sub(r"[\[\]\s]", "", problem_id).upper()
    for prefix, sector in SECTOR_PREFIX_MAP.items():
        if clean_id.startswith(prefix):
            return sector

    # Fallback to title
    for sector in SECTOR_PREFIX_MAP.values():
        if sector.lower() in title.lower():
            return sector

    return "General"

def parse_phase1_markdown(
    markdown: str,
    session_id: Optional[str] = None,
    project_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Parse a complete Phase 1 Markdown report into a list of structured problem records.
    """
    if not markdown or not markdown.strip():
        return []

    lines = markdown.splitlines()
    doc_title = ""
    for line in lines[:10]:
        if line.startswith("# "):
            doc_title = line.replace("#", "").strip()
            break

    problems: Dict[str, Dict[str, Any]] = {}

    # ------------------------------------------------------------------
    # Step 1: Parse the Markdown Table (Section 1)
    # ------------------------------------------------------------------
    in_table = False
    headers = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and "Problem ID" in stripped:
            in_table = True
            headers = [c.strip().lower() for c in stripped.split("|")[1:-1]]
            continue

        if in_table:
            if not stripped.startswith("|") or stripped.startswith("|---"):
                if not stripped.startswith("|---") and not stripped.startswith("|"):
                    in_table = False
                continue

            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if len(cells) < 6:
                continue

            raw_id = cells[0]
            clean_id = re.sub(r"[\[\]\s]", "", raw_id)
            if not clean_id or clean_id.lower() == "problem id":
                continue

            sufferer_raw = cells[1] if len(cells) > 1 else ""
            problem_stmt = cells[2] if len(cells) > 2 else ""
            tier_raw = cells[3] if len(cells) > 3 else "SIGNAL"
            workaround = cells[4] if len(cells) > 4 else ""
            impact = cells[5] if len(cells) > 5 else ""
            evidence_types_raw = cells[6] if len(cells) > 6 else ""
            sources_raw = cells[7] if len(cells) > 7 else ""

            # Normalize evidence tier
            clean_tier = "SIGNAL"
            tier_upper = tier_raw.upper()
            if "STRONGLY" in tier_upper:
                clean_tier = "STRONGLY_DOCUMENTED"
            elif "DOCUMENTED" in tier_upper:
                clean_tier = "DOCUMENTED"

            # Parse location vs occupation from sufferer
            sufferer_occ = sufferer_raw
            sufferer_loc = "Iloilo, Philippines"
            if " in " in sufferer_raw:
                parts = sufferer_raw.split(" in ", 1)
                sufferer_occ = parts[0].strip()
                sufferer_loc = parts[1].strip()
            elif "," in sufferer_raw:
                parts = sufferer_raw.split(",", 1)
                sufferer_occ = parts[0].strip()
                sufferer_loc = parts[1].strip()

            # Parse evidence types
            ev_types = [t.strip() for t in re.split(r"[,;+/]", evidence_types_raw) if t.strip()]

            # Parse sources hyperlinks: [Label](url)
            sources = []
            link_matches = re.findall(r"\[([^\]]+)\]\((https?://[^\)]+)\)", sources_raw)
            if link_matches:
                for label, url in link_matches:
                    source_tier = "A" if any(k in url.lower() for k in ["psa", "doh", "dti", "da.", "bfar", "denr", "dost", "dswd", "deped", "iloilo.gov"]) else "B"
                    sources.append({
                        "source_name": label,
                        "source_url": url,
                        "source_tier": source_tier,
                        "evidence_type": "Official / News Registry",
                        "quote_or_summary": f"Referenced in Phase 1 discovery landscape: {label}"
                    })
            else:
                # Plain text sources
                raw_source_names = [s.strip() for s in re.split(r"[,;]", sources_raw) if s.strip()]
                for sname in raw_source_names:
                    sources.append({
                        "source_name": sname,
                        "source_url": None,
                        "source_tier": "C",
                        "evidence_type": "Observation / Report",
                        "quote_or_summary": sname
                    })

            sector = infer_sector(clean_id, doc_title)

            problems[clean_id] = {
                "id": clean_id,
                "project_id": project_id,
                "session_id": session_id,
                "sector": sector,
                "sufferer_occupation": sufferer_occ,
                "sufferer_location": sufferer_loc,
                "problem_statement": problem_stmt,
                "evidence_tier": clean_tier,
                "workaround": workaround,
                "quantified_impact": impact,
                "evidence_types": ev_types,
                "sources": sources,
                "source": "llm_phase1",
                "source_detail": doc_title or "Phase 1 Automated Discovery",
                "tags": [sector.split("&")[0].strip().lower()],
                "status": "discovered",
                "notes": ""
            }

    # ------------------------------------------------------------------
    # Step 2: Parse Deep-Dive Section 2 (enrich notes & fields)
    # ------------------------------------------------------------------
    deep_dive_blocks = re.split(r"\n###\s+", markdown)
    for block in deep_dive_blocks[1:]:
        header_line = block.splitlines()[0]
        id_match = re.search(r"\[?([A-Za-z0-9_-]+)\]?:?\s*(.*)", header_line)
        if not id_match:
            continue

        p_id = id_match.group(1).replace("[", "").replace("]", "").strip()
        p_title = id_match.group(2).strip()

        if p_id in problems:
            # Extract notes from bullet points
            notes_lines = []
            for bline in block.splitlines()[1:]:
                if bline.strip().startswith("* ") or bline.strip().startswith("- "):
                    notes_lines.append(bline.strip())
            if notes_lines:
                problems[p_id]["notes"] = (
                    f"**Deep Dive Analysis: {p_title}**\n" + "\n".join(notes_lines)
                )

    return list(problems.values())
