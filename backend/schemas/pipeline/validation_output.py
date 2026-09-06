from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, model_validator

try:
    from schemas.domain.validation import (
        EvidenceConfidence,
        ProblemAttractiveness,
    )
except ImportError:
    from backend.schemas.domain.validation import (
        EvidenceConfidence,
        ProblemAttractiveness,
    )


class Phase3Output(BaseModel):
    # Evidence (frozen from Level answers — no new assumptions)
    validated_problem_statement: str
    target_actor: str                   # from Level 1
    iloilo_location: str                # from Level 1
    workaround: str                     # from Level 2
    frequency: str                      # from Level 3 (how often, concrete unit)
    severity: str                       # from Level 3 (how bad per occurrence, concrete unit)
    local_market_size_estimate: str     # from Level 4
    population_estimate: str           # from Level 5 (bottom-up or enumeration)
    economic_consequence: str          # from Level 6 (MUST be from same population as Level 5)
    economic_consequence_population_anchored: bool  # True = consequence evidence is from same segment as Level 5

    # Scorecard (two-dimension — keep separate, never collapse)
    evidence_confidence: EvidenceConfidence
    problem_attractiveness: ProblemAttractiveness

    # Verdict
    verdict: Literal["VALIDATED", "REVALIDATE", "REJECT"]
    revalidate_gaps: list[str] = []     # named sub-criteria + what evidence would resolve them
    reject_reason: str | None = None

    # Origin pattern tag (informational only — does not affect verdict)
    origin_tags: list[str] = []

    @model_validator(mode="after")
    def check_population_anchoring(self) -> "Phase3Output":
        if not self.economic_consequence_population_anchored:
            raise ValueError(
                "Level 6 economic consequence evidence must be anchored to the same "
                "segment established in Level 5. Set economic_consequence_population_anchored=True "
                "only after confirming the evidence comes from the same specific population."
            )
        return self

    @model_validator(mode="after")
    def check_revalidate_has_gaps(self) -> "Phase3Output":
        if self.verdict == "REVALIDATE" and not self.revalidate_gaps:
            raise ValueError(
                "A REVALIDATE verdict requires at least one named gap in revalidate_gaps. "
                "State which sub-criterion is weak and what evidence would resolve it."
            )
        return self


__all__ = ["Phase3Output"]
