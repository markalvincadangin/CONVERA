"""
Phase 1 Markdown to Structured Problem Bank Parser
Extracts structured problem records, source links, and deep-dive analyses
from Phase 1 Discovery Advisor markdown reports with full text sanitization.
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

def clean_text(val: Optional[str]) -> str:
    """Strip markdown bold/italics, HTML linebreaks, and extraneous whitespace."""
    if not val:
        return ""
    # Strip HTML tags like <br>, <br/>, </p>
    s = re.sub(r"<br\s*/?>", " ", val, flags=re.IGNORECASE)
    s = re.sub(r"<[^>]+>", " ", s)
    # Strip markdown bold/italic asterisks & underscores
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    s = re.sub(r"__([^_]+)__", r"\1", s)
    s = re.sub(r"_([^_]+)_", r"\1", s)
    # Strip stray asterisks, hashes, or backticks
    s = s.replace("**", "").replace("*", "").replace("`", "").replace("##", "").replace("#", "")
    # Normalize whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s

def clean_problem_id(val: str) -> str:
    """Sanitize problem ID to clean standard like AGR-001."""
    s = clean_text(val)
    s = re.sub(r"[^A-Za-z0-9\-]", "", s).upper()
    return s

SECTOR_TO_CANONICAL_PREFIX = {
    "Agriculture & Fisheries": "AGR",
    "Health & Wellness": "HLT",
    "MSMEs & Retail": "RET",
    "Education & Youth": "EDU",
    "Transport & Logistics": "LOG",
    "Housing & Utilities": "UTL",
    "Government Services & Compliance": "GOV",
    "Finance & Credit": "FIN",
}

LEGACY_PREFIX_MAP = {
    "HW": "HLT",
    "MSME": "RET",
    "TRN": "LOG",
    "HOU": "UTL",
    "CRE": "FIN",
    "ED": "EDU",
}

def canonicalize_problem_id(raw_id: str, sector: str, index: int = 1) -> str:
    """Converts any raw ID into strict 3-letter prefix + 3-digit number (e.g. AGR-001, HLT-002)."""
    s = clean_problem_id(raw_id)
    
    # Check if starts with a known prefix
    match = re.match(r"^([A-Za-z]+)[-_]?(\d+)?", s)
    if match:
        pfx = match.group(1).upper()
        num_str = match.group(2)
        
        # Normalize legacy prefixes (HW -> HLT, MSME -> RET, etc.)
        canon_pfx = LEGACY_PREFIX_MAP.get(pfx, pfx)
        if canon_pfx not in SECTOR_TO_CANONICAL_PREFIX.values():
            canon_pfx = SECTOR_TO_CANONICAL_PREFIX.get(sector, "PRB")
            
        num = int(num_str) if num_str else index
        return f"{canon_pfx}-{num:03d}"
    
    # Fallback to sector canonical prefix
    canon_pfx = SECTOR_TO_CANONICAL_PREFIX.get(sector, "PRB")
    return f"{canon_pfx}-{index:03d}"


def infer_sector(problem_id: str, title: str) -> str:
    """Infer industry sector from ID prefix or report title."""
    clean_id = clean_problem_id(problem_id)
    for prefix, sector in SECTOR_PREFIX_MAP.items():
        if clean_id.startswith(prefix):
            return sector

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
            doc_title = clean_text(line.replace("#", ""))
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
            clean_id = clean_problem_id(raw_id)
            if not clean_id or clean_id.lower() == "problemid":
                continue

            sufferer_raw = clean_text(cells[1]) if len(cells) > 1 else ""
            problem_stmt = clean_text(cells[2]) if len(cells) > 2 else ""
            tier_raw = cells[3] if len(cells) > 3 else "SIGNAL"
            workaround = clean_text(cells[4]) if len(cells) > 4 else ""
            impact = clean_text(cells[5]) if len(cells) > 5 else ""
            evidence_types_raw = clean_text(cells[6]) if len(cells) > 6 else ""
            sources_raw = cells[7].strip() if len(cells) > 7 else ""

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
                sufferer_occ = clean_text(parts[0])
                sufferer_loc = clean_text(parts[1])

            # Split evidence types
            evidence_types = [
                clean_text(t) for t in re.split(r"[,;\n]+", evidence_types_raw) if clean_text(t)
            ]
            if not evidence_types:
                evidence_types = ["Opportunistic Observation"]

            # Parse sources (handle markdown links like [PSA](https://...) or raw text)
            sources = []
            if sources_raw:
                link_matches = re.findall(r"\[([^\]]+)\]\(([^)]+)\)", sources_raw)
                if link_matches:
                    for name, url in link_matches:
                        c_name = clean_text(name)
                        tier = "Tier B"
                        if any(k in c_name.lower() for k in ["psa", "dti", "da", "dost", "doh", "lgu", "bfar", "nia"]):
                            tier = "Tier A"
                        elif any(k in c_name.lower() for k in ["reddit", "facebook", "community", "forum"]):
                            tier = "Tier C"
                        sources.append({
                            "source_name": c_name,
                            "source_url": url.strip(),
                            "source_tier": tier,
                            "citation": c_name
                        })
                else:
                    for s in re.split(r"[\n;]+", sources_raw):
                        cs = clean_text(s)
                        if cs:
                            tier = "Tier B"
                            if "tier a" in cs.lower() or any(k in cs.lower() for k in ["psa", "dti", "da", "dost", "bfar"]):
                                tier = "Tier A"
                            elif "tier c" in cs.lower():
                                tier = "Tier C"
                            elif "tier d" in cs.lower():
                                tier = "Tier D"
                            sources.append({
                                "source_name": cs,
                                "source_url": None,
                                "source_tier": tier,
                                "citation": cs
                            })

            sector = infer_sector(clean_id, doc_title)

            problems[clean_id] = {
                "id": clean_id,
                "project_id": project_id,
                "session_id": session_id,
                "sector": sector,
                "sufferer_occupation": sufferer_occ or "Target User",
                "sufferer_location": sufferer_loc or "Iloilo, Philippines",
                "problem_statement": problem_stmt or "Unspecified friction.",
                "evidence_tier": clean_tier,
                "workaround": workaround or "Informal manual workarounds",
                "quantified_impact": impact or "Unquantified friction",
                "evidence_types": evidence_types,
                "source": "llm_phase1",
                "source_detail": doc_title or "Phase 1 Discovery",
                "tags": [sector, "Phase 1 Discovered"],
                "status": "DISCOVERED",
                "sources": sources,
                "notes": "",
            }

    # ------------------------------------------------------------------
    # Step 2: Parse Deep-Dive Sections (Section 2)
    # ------------------------------------------------------------------
    current_pid = None
    deep_dive_text = []

    for line in lines:
        match = re.search(r"###?\s*(?:2\.\d+\s+)?(?:Problem\s+)?\[?([A-Z]+-\d+)\]?", line)
        if match:
            if current_pid and current_pid in problems and deep_dive_text:
                problems[current_pid]["notes"] = clean_text("\n".join(deep_dive_text))
            current_pid = clean_problem_id(match.group(1))
            deep_dive_text = [clean_text(line)]
            continue

        if current_pid:
            if line.startswith("## ") and not line.startswith("### "):
                if current_pid in problems and deep_dive_text:
                    problems[current_pid]["notes"] = clean_text("\n".join(deep_dive_text))
                current_pid = None
                deep_dive_text = []
            else:
                deep_dive_text.append(clean_text(line))

    if current_pid and current_pid in problems and deep_dive_text:
        problems[current_pid]["notes"] = clean_text("\n".join(deep_dive_text))

    return list(problems.values())
