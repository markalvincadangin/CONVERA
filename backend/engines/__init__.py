"""
CONVERA Pipeline Specialized Engines Package
============================================
Exposes all specialized intelligence and reasoning engines under a clean module namespace.
"""

from .assumption_engine import extract_claims_and_assumptions
from .blind_spot_detector import detect_portfolio_blind_spots
from .decision_engine import synthesize_decision_room, execute_pivot_loop
from .deliverables_generator import extract_session_dossier_text, generate_lean_canvas, generate_swot_analysis, generate_pitch_deck
from .devils_advocate import challenge_problem_with_agent
from .evidence_scorer import calculate_score_breakdown
from .framework_engine import (
    FrameworkCategory,
    GateAction,
    Activity,
    Criteria,
    Gate,
    Stage,
    Framework,
    list_frameworks,
    get_framework,
    FRAMEWORK_REGISTRY
)
from .problem_enricher import enrich_manual_problem_input
from .problem_parser import clean_text, clean_problem_id, canonicalize_problem_id, infer_sector, parse_phase1_markdown
from .document_parser import parse_and_extract_document, IngestedDocumentResult, chunk_text
from .research_client import extract_core_topic, extract_keywords, extract_clean_location, FreeResearchClient
from .srs_generator import generate_project_srs, format_srs_markdown

__all__ = [
    "extract_claims_and_assumptions",
    "detect_portfolio_blind_spots",
    "synthesize_decision_room",
    "execute_pivot_loop",
    "extract_session_dossier_text",
    "generate_lean_canvas",
    "generate_swot_analysis",
    "generate_pitch_deck",
    "challenge_problem_with_agent",
    "calculate_score_breakdown",
    "FrameworkCategory",
    "GateAction",
    "Activity",
    "Criteria",
    "Gate",
    "Stage",
    "Framework",
    "list_frameworks",
    "get_framework",
    "FRAMEWORK_REGISTRY",
    "enrich_manual_problem_input",
    "clean_text",
    "clean_problem_id",
    "canonicalize_problem_id",
    "infer_sector",
    "parse_phase1_markdown",
    "parse_and_extract_document",
    "IngestedDocumentResult",
    "chunk_text",
    "extract_core_topic",
    "extract_keywords",
    "extract_clean_location",
    "FreeResearchClient",
    "generate_project_srs",
    "format_srs_markdown",
]
