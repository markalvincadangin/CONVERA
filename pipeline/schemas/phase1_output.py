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
    workaround_found: str | None        # coping behavior observed in evidence (if any)
    field_research_gap: str             # what primary evidence is still missing
    field_research_exception: bool = False  # True if primary evidence warrants tier upgrade

    @property
    def eligible_for_phase2(self) -> bool:
        return self.evidence_tier in ("DOCUMENTED", "STRONGLY_DOCUMENTED", "DOCUMENTED_PRIMARY_ONLY")


class Phase1Output(BaseModel):
    sectors_covered: list[str]
    sectors_no_local_evidence: list[str]
    problems: list[DiscoveredProblem]

    @property
    def signals(self) -> list[DiscoveredProblem]:
        return [p for p in self.problems if p.evidence_tier == "SIGNAL"]

    @property
    def documented(self) -> list[DiscoveredProblem]:
        return [p for p in self.problems
                if p.evidence_tier in ("DOCUMENTED", "DOCUMENTED_PRIMARY_ONLY")]

    @property
    def strongly_documented(self) -> list[DiscoveredProblem]:
        return [p for p in self.problems if p.evidence_tier == "STRONGLY_DOCUMENTED"]

    @property
    def phase2_eligible(self) -> list[DiscoveredProblem]:
        return [p for p in self.problems if p.eligible_for_phase2]

    def landscape_summary(self) -> str:
        lines = [
            "## Phase 1 — Landscape Summary",
            f"- Total problems found: {len(self.problems)}",
            f"- 🟢 Strongly Documented: {len(self.strongly_documented)} "
            f"({', '.join(p.problem_id for p in self.strongly_documented) or 'none'})",
            f"- 🔵 Documented: {len(self.documented)} "
            f"({', '.join(p.problem_id for p in self.documented) or 'none'})",
            f"- 🟡 Signal only: {len(self.signals)} "
            f"({', '.join(p.problem_id for p in self.signals) or 'none'})",
            f"- Sectors covered: {len(self.sectors_covered)} / {len(SECTORS)}",
            "",
            "## Phase 2 Eligible (🔵 and 🟢 only)",
        ]
        for p in self.phase2_eligible:
            lines.append(f"- {p.problem_id}: {p.problem_statement[:80]}...")
        if self.signals:
            lines.append("")
            lines.append("## 🟡 Signals — not eligible without further corroboration")
            for p in self.signals:
                lines.append(f"- {p.problem_id}: {p.problem_statement[:80]}...")
        return "\n".join(lines)
