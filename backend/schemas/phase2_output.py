from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, model_validator


class ScreeningResult(BaseModel):
    problem_label: str
    pain_score: int                     # 1-5
    pain_label: Literal["Assumed", "Demonstrated"]
    frequency_score: int                # 1-5
    frequency_label: Literal["Assumed", "Demonstrated"]
    market_size_score: int              # 1-5
    market_size_label: Literal["Assumed", "Demonstrated"]
    existing_sacrifice_score: int       # 1-5
    existing_sacrifice_label: Literal["Assumed", "Demonstrated"]
    access_score: int                   # 1-5
    access_label: Literal["Assumed", "Demonstrated"]
    origin_tags: list[str]
    red_flags: list[str]
    verdict: Literal["ADVANCE", "SECOND_LOOK", "PARK"]
    kill_reason: str | None = None                          # populated if PARK
    second_look_gap: str | None = None                      # populated if SECOND_LOOK
    second_look_exit_condition: str | None = None           # MANDATORY if SECOND_LOOK

    @model_validator(mode="after")
    def check_second_look_exit_condition(self) -> "ScreeningResult":
        if self.verdict == "SECOND_LOOK" and not self.second_look_exit_condition:
            raise ValueError(
                "A SECOND_LOOK verdict requires a second_look_exit_condition. "
                "A SECOND LOOK without an exit condition is a parking lot with no exit."
            )
        return self


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
