"""
CONVERA Similarity & Duplicate Detection Engine
===============================================
Analyzes candidate problems/ideas against the persistent Knowledge Graph
to detect overlapping friction statements, duplicate root causes, and related clusters.
Core Principle: AI detects and explains similarity; human founders confirm Merge / Link / Separate.
"""

from __future__ import annotations
import re
import math
from typing import Dict, List, Any, Optional, Tuple


def _tokenize(text: str) -> List[str]:
    """Tokenize and filter stop words."""
    if not text:
        return []
    words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
    stops = {
        "and", "the", "for", "with", "due", "causes", "lack", "from", "into",
        "their", "that", "this", "during", "requiring", "leads", "across",
        "severe", "high", "many", "problem", "issues", "result", "because"
    }
    return [w for w in words if w not in stops]


def _term_frequencies(tokens: List[str]) -> Dict[str, int]:
    tf: Dict[str, int] = {}
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    return tf


def _cosine_similarity(tokens_a: List[str], tokens_b: List[str]) -> float:
    """Compute cosine similarity between two token frequency vectors."""
    if not tokens_a or not tokens_b:
        return 0.0
    
    tf_a = _term_frequencies(tokens_a)
    tf_b = _term_frequencies(tokens_b)
    
    all_keys = set(tf_a.keys()).union(set(tf_b.keys()))
    
    dot_product = sum(tf_a.get(k, 0) * tf_b.get(k, 0) for k in all_keys)
    norm_a = math.sqrt(sum(v ** 2 for v in tf_a.values()))
    norm_b = math.sqrt(sum(v ** 2 for v in tf_b.values()))
    
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)


def _jaccard_similarity(tokens_a: List[str], tokens_b: List[str]) -> float:
    """Compute Jaccard similarity index."""
    set_a = set(tokens_a)
    set_b = set(tokens_b)
    if not set_a or not set_b:
        return 0.0
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(intersection) / len(union) if union else 0.0


def calculate_similarity(
    candidate_text: str,
    target_text: str,
    candidate_sector: Optional[str] = None,
    target_sector: Optional[str] = None
) -> float:
    """
    Calculate composite similarity score combining Cosine, Jaccard, and Sector weighting.
    Returns score between 0.0 and 1.0.
    """
    tokens_cand = _tokenize(candidate_text)
    tokens_target = _tokenize(target_text)
    
    cosine = _cosine_similarity(tokens_cand, tokens_target)
    jaccard = _jaccard_similarity(tokens_cand, tokens_target)
    
    # Composite text score
    text_score = (cosine * 0.65) + (jaccard * 0.35)
    
    # Sector boost / dampener
    sector_boost = 0.05 if (candidate_sector and target_sector and candidate_sector.lower() == target_sector.lower()) else 0.0
    
    final_score = min(1.0, text_score + sector_boost)
    return round(final_score, 3)


def check_portfolio_similarity(
    candidate: Dict[str, Any],
    existing_problems: List[Dict[str, Any]],
    threshold_similar: float = 0.45,
    threshold_duplicate: float = 0.75
) -> Dict[str, Any]:
    """
    Evaluate a candidate problem statement against all existing problems in the portfolio.
    Returns similarity analysis, matched candidates, and human decision recommendations.
    """
    cand_stmt = candidate.get("problem_statement", candidate.get("title", ""))
    cand_sector = candidate.get("sector", "")
    cand_id = candidate.get("id", "CANDIDATE")
    
    matches = []
    
    for prob in existing_problems:
        prob_id = prob.get("id", "")
        # Don't compare against itself
        if prob_id and prob_id == cand_id:
            continue
            
        prob_stmt = prob.get("problem_statement", prob.get("title", ""))
        prob_sector = prob.get("sector", "")
        
        score = calculate_similarity(
            candidate_text=cand_stmt,
            target_text=prob_stmt,
            candidate_sector=cand_sector,
            target_sector=prob_sector
        )
        
        if score >= threshold_similar:
            verdict = "DUPLICATE" if score >= threshold_duplicate else "POTENTIALLY_SIMILAR"
            
            # Shared keywords for human explanation
            shared_words = list(set(_tokenize(cand_stmt)).intersection(set(_tokenize(prob_stmt))))
            explanation = (
                f"Significant overlap detected ({int(score * 100)}% match). "
                f"Shared concepts: {', '.join(shared_words[:4]) if shared_words else 'Direct semantic overlap'}."
            )
            
            matches.append({
                "problem_id": prob_id,
                "problem_statement": prob_stmt,
                "sector": prob_sector,
                "similarity_score": score,
                "verdict": verdict,
                "shared_keywords": shared_words,
                "explanation": explanation,
                "suggested_action": "MERGE" if verdict == "DUPLICATE" else "LINK_AS_RELATED"
            })
            
    # Sort matches by similarity descending
    matches.sort(key=lambda m: m["similarity_score"], reverse=True)
    
    top_match = matches[0] if matches else None
    overall_verdict = top_match["verdict"] if top_match else "UNIQUE"
    
    return {
        "candidate_id": cand_id,
        "candidate_statement": cand_stmt,
        "overall_verdict": overall_verdict,
        "is_unique": len(matches) == 0,
        "top_similarity_score": top_match["similarity_score"] if top_match else 0.0,
        "matches": matches,
        "recommendation": (
            f"Review potential duplicate ({top_match['problem_id']}) before adding to Problem Bank."
            if top_match and top_match["similarity_score"] >= threshold_duplicate
            else "Candidate statement is distinct and ready for grounding."
        )
    }
