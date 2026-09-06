from __future__ import annotations
from typing import Literal
from pydantic import BaseModel


EvidenceTier = Literal["SIGNAL", "DOCUMENTED", "STRONGLY_DOCUMENTED", "DOCUMENTED_PRIMARY_ONLY"]
SourceTier = Literal["A", "B", "C", "D"]

SECTORS = [
    "Agriculture & Fisheries",
    "Health & Wellness",
    "MSMEs & Retail",
    "Education & Youth",
    "Transport & Logistics",
    "Housing & Utilities",
    "Government Services & Compliance",
    "Finance & Credit",
]


class EvidenceSource(BaseModel):
    description: str                    # what this source is
    url: str | None = None              # URL if found in search
    source_tier: SourceTier             # A / B / C / D
    evidence_type: str                  # "news report" / "community post" / "PSA statistic" etc.
    quote_or_summary: str               # what the source actually says


class DiscoveredProblem(BaseModel):
    problem_id: str                     # e.g. AGR-001
    sector: str
    sufferer_occupation: str
    sufferer_location: str              # named Iloilo City barangay or municipality
    problem_statement: str
    evidence_tier: EvidenceTier
    evidence_type_list: list[str]       # types of evidence (not just source tiers)
    sources: list[EvidenceSource]
    workaround_found: str | None = None # coping behavior observed in evidence (if any)
    field_research_gap: str             # what primary evidence is still missing
    field_research_exception: bool = False  # True if primary evidence warrants tier upgrade
