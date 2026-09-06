from __future__ import annotations
from pydantic import BaseModel, computed_field


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
