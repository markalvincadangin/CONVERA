from typing import Sequence

try:
    from schemas.domain.problem import DiscoveredProblem
except ImportError:
    from backend.schemas.domain.problem import DiscoveredProblem

ELIGIBLE_TIERS: set[str] = {
    "DOCUMENTED",
    "STRONGLY_DOCUMENTED",
    "DOCUMENTED_PRIMARY_ONLY",
}


class ProblemEligibilityService:
    """
    Application policy service determining whether a DiscoveredProblem
    is eligible to transition from Phase 1 to Phase 2.

    Governing rule (CCDS v2.0):
    Only problems with documented evidence (DOCUMENTED, STRONGLY_DOCUMENTED,
    or DOCUMENTED_PRIMARY_ONLY) are eligible for Phase 2 screening.
    SIGNAL problems require further corroboration before advancing.
    """

    ELIGIBLE_TIERS = ELIGIBLE_TIERS

    @classmethod
    def is_eligible_for_phase2(cls, problem: DiscoveredProblem) -> bool:
        """Evaluate if a single problem meets Phase 2 eligibility criteria."""
        return problem.evidence_tier in cls.ELIGIBLE_TIERS

    @classmethod
    def filter_phase2_eligible(cls, problems: Sequence[DiscoveredProblem]) -> list[DiscoveredProblem]:
        """Filter a collection of problems to only those eligible for Phase 2."""
        return [p for p in problems if cls.is_eligible_for_phase2(p)]
