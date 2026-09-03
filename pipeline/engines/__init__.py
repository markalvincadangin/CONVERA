"""
CONVERA Specialized Intelligence Engines Package
"""

from .assumption_engine import extract_claims_and_assumptions
from .decision_engine import synthesize_decision_room, execute_pivot_loop
from .srs_generator import generate_project_srs, format_srs_markdown
from .deliverables_generator import generate_lean_canvas, generate_swot_analysis, generate_pitch_deck
from .research_client import search_academic_papers, search_openalex, search_europe_pmc, search_crossref, ground_problem_with_research
from .evidence_scorer import score_problem_statement
from .devils_advocate import generate_devils_advocate_critique
from .blind_spot_detector import detect_blind_spots
from .problem_enricher import enrich_problem_statement
from .problem_parser import parse_unstructured_problems

__all__ = [
    "extract_claims_and_assumptions",
    "synthesize_decision_room",
    "execute_pivot_loop",
    "generate_project_srs",
    "format_srs_markdown",
    "generate_lean_canvas",
    "generate_swot_analysis",
    "generate_pitch_deck",
    "search_academic_papers",
    "search_openalex",
    "search_europe_pmc",
    "search_crossref",
    "ground_problem_with_research",
    "score_problem_statement",
    "generate_devils_advocate_critique",
    "detect_blind_spots",
    "enrich_problem_statement",
    "parse_unstructured_problems",
]
