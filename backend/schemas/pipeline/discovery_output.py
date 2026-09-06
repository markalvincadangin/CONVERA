from __future__ import annotations

from pydantic import BaseModel

try:
    from schemas.domain.problem import (
        SECTORS,
        DiscoveredProblem,
    )
except ImportError:
    from backend.schemas.domain.problem import (
        SECTORS,
        DiscoveredProblem,
    )


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
        ]
        if self.strongly_documented or self.documented:
            lines.append("")
            lines.append("## Documented Problems (🟢 and 🔵)")
            for p in self.strongly_documented + self.documented:
                lines.append(f"- {p.problem_id}: {p.problem_statement[:80]}...")
        if self.signals:
            lines.append("")
            lines.append("## 🟡 Signals — not eligible without further corroboration")
            for p in self.signals:
                lines.append(f"- {p.problem_id}: {p.problem_statement[:80]}...")
        return "\n".join(lines)


__all__ = ["Phase1Output"]
