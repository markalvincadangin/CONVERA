from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, computed_field, model_validator


VALID_MECHANISM_FAMILIES = {
    "Prevention",
    "Prediction / early warning",
    "Coordination",
    "Information",
    "Automation",
    "Risk reduction",
    "Resource sharing / pooling",
    "Financing / economic restructuring",
    "Matching",
    "Scheduling / timing",
    "Verification / trust-building",
    "Behavioral nudge",
    "Workflow redesign",
    "Physical / material",
    "Institutional / policy",
}

ASSUMPTION_TYPES = Literal["Desirability", "Feasibility", "Behavioral", "Value", "Viability"]


class ConceptScreeningScore(BaseModel):
    problem_fit: int                    # 1-3
    user_desirability: int              # 1-3
    advantage_over_status_quo: int      # 1-3
    feasibility: int                    # 1-3
    viability: int                      # 1-3
    evidence_testability: int           # 1-3

    @computed_field
    @property
    def total_score(self) -> int:
        return (
            self.problem_fit + self.user_desirability + self.advantage_over_status_quo +
            self.feasibility + self.viability + self.evidence_testability
        )

    @computed_field
    @property
    def has_fatal_flaw(self) -> bool:
        return self.problem_fit == 1 or (self.feasibility == 1 and self.viability == 1)


class SolutionConcept(BaseModel):
    label: str
    mechanism_family: str
    causal_link_targeted: str
    hypothesized_mechanism: str         # one sentence: how it produces improvement
    delivery_vehicle: str               # digital / physical / human / hybrid / process
    screening_score: ConceptScreeningScore | None = None
    revise_note: str | None = None      # populated if REVISE verdict

    @model_validator(mode="after")
    def check_mechanism_family(self) -> "SolutionConcept":
        if self.mechanism_family not in VALID_MECHANISM_FAMILIES:
            raise ValueError(
                f"'{self.mechanism_family}' is not a valid mechanism family. "
                f"Choose from: {sorted(VALID_MECHANISM_FAMILIES)}"
            )
        return self


class Assumption(BaseModel):
    id: str                             # e.g. A-001
    concept_label: str
    assumption_text: str
    type: ASSUMPTION_TYPES
    importance: Literal["H", "M", "L"]
    uncertainty: Literal["H", "M", "L"]

    @computed_field
    @property
    def priority(self) -> int:
        """
        P1: High Importance + High Uncertainty — test first
        P2: High Importance + Low Uncertainty  — verify, don't build on faith
        P3: Low Importance + High Uncertainty  — can wait
        P4: Low Importance + Low Uncertainty   — low risk, proceed
        """
        if self.importance == "H" and self.uncertainty == "H":
            return 1
        if self.importance == "H":
            return 2
        if self.uncertainty == "H":
            return 3
        return 4


class ExperimentCard(BaseModel):
    id: str                             # e.g. E-001
    concept_label: str
    assumption_id: str                  # links to Assumption.id
    assumption_tested: str
    hypothesis: str                     # "If we X, we expect to observe Y in Z% of cases"
    test_method: str                    # cheapest credible test
    target_participant: str             # specific segment + location from Phase 3
    observable_metric: str              # concrete, countable
    pass_threshold: str                 # specific number or condition
    fail_threshold: str                 # specific number or condition
    decision_if_pass: str
    decision_if_fail: str
