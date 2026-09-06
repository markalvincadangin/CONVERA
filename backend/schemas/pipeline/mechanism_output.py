from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, computed_field, model_validator

try:
    from schemas.domain.concept import (
        ConceptScreeningScore,
        SolutionConcept,
        Assumption,
        ExperimentCard,
    )
except ImportError:
    from backend.schemas.domain.concept import (
        ConceptScreeningScore,
        SolutionConcept,
        Assumption,
        ExperimentCard,
    )

CONCEPT_VERDICT = Literal["ADVANCE_TO_HYPOTHESIS", "REVISE", "DROP"]
PHASE4_VERDICT = Literal["READY_TO_TEST", "RE_IDEATE", "RETURN_TO_PROBLEM"]


def get_concept_verdict(score: ConceptScreeningScore) -> CONCEPT_VERDICT:
    """Evaluate ConceptScreeningScore against methodology gating criteria."""
    if score.problem_fit == 1:
        return "DROP"
    if score.feasibility == 1 and score.viability == 1:
        return "DROP"
    if score.problem_fit >= 2 and score.evidence_testability >= 2 and score.feasibility >= 2:
        return "ADVANCE_TO_HYPOTHESIS"
    return "REVISE"


class Phase4Output(BaseModel):
    opportunity_question: str
    root_mechanism_decomposition: list[dict]    # [{trigger, mechanism_type, consequence}, ...]
    concepts: list[SolutionConcept]
    assumption_register: list[Assumption]
    experiment_cards: list[ExperimentCard]
    verdict: PHASE4_VERDICT
    re_ideate_reason: str | None = None         # populated if RE_IDEATE
    return_to_problem_gap: str | None = None    # populated if RETURN_TO_PROBLEM

    @computed_field
    @property
    def advance_concepts(self) -> list[SolutionConcept]:
        return [
            c for c in self.concepts
            if c.screening_score and get_concept_verdict(c.screening_score) == "ADVANCE_TO_HYPOTHESIS"
        ]

    @computed_field
    @property
    def mechanism_families_present(self) -> set[str]:
        return {c.mechanism_family for c in self.concepts}

    @computed_field
    @property
    def minimum_concept_set_met(self) -> bool:
        return len(self.concepts) >= 5 and len(self.mechanism_families_present) >= 3

    @computed_field
    @property
    def p1_assumptions(self) -> list[Assumption]:
        return [a for a in self.assumption_register if a.priority == 1]

    @model_validator(mode="after")
    def check_experiment_cards_for_p1(self) -> "Phase4Output":
        if self.verdict == "READY_TO_TEST":
            p1_ids = {a.id for a in self.p1_assumptions}
            covered = {card.assumption_id for card in self.experiment_cards}
            missing = p1_ids - covered
            if missing:
                raise ValueError(
                    f"READY_TO_TEST verdict requires an Experiment Card for every P1 assumption. "
                    f"Missing cards for assumption IDs: {missing}"
                )
        return self


__all__ = [
    "CONCEPT_VERDICT",
    "PHASE4_VERDICT",
    "Phase4Output",
    "get_concept_verdict",
]
