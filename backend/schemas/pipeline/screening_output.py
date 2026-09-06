from __future__ import annotations

from pydantic import BaseModel

try:
    from schemas.domain.screening import ScreeningResult
except ImportError:
    from backend.schemas.domain.screening import ScreeningResult


class Phase2Output(BaseModel):
    total_input: int
    solution_in_disguise_count: int
    scored_count: int
    advance_count: int
    second_look_count: int
    park_count: int
    results: list[ScreeningResult]

    @property
    def advance_problems(self) -> list[ScreeningResult]:
        return [r for r in self.results if r.verdict == "ADVANCE"]

    @property
    def second_look_problems(self) -> list[ScreeningResult]:
        return [r for r in self.results if r.verdict == "SECOND_LOOK"]


__all__ = ["Phase2Output"]
