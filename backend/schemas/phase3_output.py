from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, computed_field, model_validator


class EvidenceConfidence(BaseModel):
    direct_user_evidence: int           # 0-4: firsthand accounts, observed behavior, interviews
    workaround_evidence: int            # 0-4: documented coping behavior from Levels 2 & 3
    quantified_consequence: int         # 0-4: concrete numbers (pesos, hours, units)
    recurrence_evidence: int            # 0-4: frequency established from Level 3
    population_evidence: int            # 0-4: scope from Level 5
    source_triangulation: int           # 0-4: multiple independent source types

    @computed_field
    @property
    def total(self) -> int:
        return (
            self.direct_user_evidence + self.workaround_evidence +
            self.quantified_consequence + self.recurrence_evidence +
            self.population_evidence + self.source_triangulation
        )  # max 24


class ProblemAttractiveness(BaseModel):
    severity: int                       # 0-4: how much it hurts per occurrence
    frequency_urgency: int              # 0-4: how often or pressingly it recurs
    existing_sacrifice: int             # 0-4: economic/behavioral cost from Level 6
    number_affected: int                # 0-4: population scope from Level 5
    persistence: int                    # 0-4: continues despite existing workarounds

    @computed_field
    @property
    def total(self) -> int:
        return (
            self.severity + self.frequency_urgency +
            self.existing_sacrifice + self.number_affected + self.persistence
        )  # max 20


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
