"""
CONVERA Structured Ideation & 4 DSR Artifact Formulation Engine
==============================================================
Implements March & Smith (1995) 4-artifact taxonomy (Construct, Model, Method, Instantiation),
grounded in Gregor & Jones (2007) Kernel Theories and Vaishnavi & Kuechler (2015) DSR methodology.
Adheres strictly to Epistemic Rules 5 (Simpler Baseline Alternative) and 6 (No Buzzword Novelty).
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from storage.factory import get_storage
from storage.base import BaseStorageAdapter
from llm_gateway import generate_response_with_fallback, TaskCategory

logger = logging.getLogger(__name__)

DSR_SYSTEM_INSTRUCTION = """
You are the CONVERA Design Science Research (DSR) Artifact Ideation Engine.
Your mission is to formulate rigorous, publishable computational artifact candidates across the 4 canonical DSR classes:
1. CONSTRUCT: Specialized vocabulary, ontology, state representations, or semantic feature taxonomies.
2. MODEL: Mathematical propositions, formal equations, state-transition graphs, or causal system dynamics.
3. METHOD: Algorithmic workflows, heuristic optimization pipelines, deterministic protocols, or operational steps.
4. INSTANTIATION: Concrete physical testbed, embedded firmware runtime, edge prototype, or production software implementation.

CONSTITUTIONAL & METHODOLOGICAL INVARIANTS:
1. GREGOR & JONES (2007) KERNEL THEORY: Every artifact MUST be explicitly justified by an underlying kernel theory from computer science, mathematics, operations research, or natural sciences (e.g., Graph Theory, Control Theory, Distributed Consensus, Information Theory, Shannon Entropy).
2. EPISTEMIC RULE 5 (SIMPLER BASELINE ALTERNATIVE): You MUST explicitly identify the simpler, established baseline approach (e.g., simple heuristic, linear regression, static thresholding) and explain why the advanced artifact is strictly necessary.
3. EPISTEMIC RULE 6 (NO BUZZWORD NOVELTY): Do NOT claim novelty because "it uses AI" or "uses Blockchain". Novelty must reside in the structural mechanism, formal state formulation, or algorithmic complexity reduction.
4. CONTEXTUAL CONSTRAINTS: Tailor constraints to localized deployment reality (e.g., intermittent connectivity, low-cost edge compute, sub-second latency, uncurated sensor noise).
5. SCORE DECOUPLING: Feasibility score (0.00-1.00) reflects real-world engineering tractability; Novelty score (0.00-1.00) reflects genuine architectural or algorithmic innovation against known literature.

OUTPUT FORMAT: STRICT JSON ONLY with the following schema:
{
  "artifacts": [
    {
      "title": "Clear, Academic Artifact Title",
      "dsr_class": "CONSTRUCT | MODEL | METHOD | INSTANTIATION",
      "description": "Comprehensive explanation of what the artifact is and its functional mechanics.",
      "kernel_theory": "Name and brief derivation of underlying scientific/mathematical kernel theory.",
      "targeted_gap_ids": ["GAP-01"],
      "linked_claim_ids": ["CLM-01"],
      "formal_specification": "Formal notation, mathematical definition, state tuple (e.g. S, A, T, R, gamma), or data structure specification.",
      "simpler_baseline_alternative": "Simpler conventional method and why it fails or falls short under target operational constraints.",
      "contextual_constraints": ["Constraint 1 (e.g., <500ms inference on Raspberry Pi 4)", "Constraint 2"],
      "feasibility_score": 0.85,
      "novelty_score": 0.80
    }
  ]
}
"""


class IdeationEngine:
    """Domain engine for DSR artifact formulation and structured ideation."""

    def __init__(self, storage: Optional[BaseStorageAdapter] = None):
        self.storage = storage or get_storage()

    async def generate_dsr_candidates(
        self,
        problem_id: str,
        session_id: Optional[str] = None,
        classes: Optional[List[str]] = None,
        prompt_guidance: Optional[str] = None,
        max_candidates_per_class: int = 1,
    ) -> Dict[str, Any]:
        """
        Generate candidate DSR artifacts across requested classes for a problem.
        Persists generated candidates to storage as 'PROPOSED'.
        """
        target_classes = classes or ["CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"]
        valid_classes = {"CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"}
        target_classes = [c.upper() for c in target_classes if c.upper() in valid_classes]
        if not target_classes:
            target_classes = ["CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"]

        # 1. Gather rich context from storage
        problem = self.storage.get_problem(problem_id)
        if not problem:
            raise ValueError(f"Problem '{problem_id}' does not exist.")

        # Attempt to retrieve knowledge graph context
        kg_context: Dict[str, Any] = {}
        try:
            if hasattr(self.storage, "get_problem_knowledge_graph"):
                kg_context = self.storage.get_problem_knowledge_graph(problem_id) or {}
        except Exception as e:
            logger.warning(f"Could not load knowledge graph for {problem_id}: {e}")

        claims = kg_context.get("claims", [])
        assumptions = kg_context.get("assumptions", [])
        sources = kg_context.get("sources", problem.get("sources", []))

        # 2. Build prompt
        prompt = self._build_generation_prompt(
            problem=problem,
            claims=claims,
            assumptions=assumptions,
            sources=sources,
            target_classes=target_classes,
            prompt_guidance=prompt_guidance,
            max_candidates_per_class=max_candidates_per_class,
        )

        # 3. Call LLM gateway with fallback
        generated_raw: List[Dict[str, Any]] = []
        try:
            raw_response = await generate_response_with_fallback(
                system_instruction=DSR_SYSTEM_INSTRUCTION,
                prompt=prompt,
                task_category=TaskCategory.CRITICAL_REASONING,
            )
            generated_raw = self._parse_llm_response(raw_response)
        except Exception as e:
            logger.warning(f"LLM ideation generation encountered error: {e}. Executing offline fallback.")
            generated_raw = []

        # 4. If LLM produced empty or insufficient results, generate deterministic offline fallback
        if not generated_raw:
            generated_raw = self._generate_offline_fallback_artifacts(
                problem=problem,
                target_classes=target_classes,
                max_candidates=max_candidates_per_class,
            )

        # 5. Filter to target classes and sanitize
        persisted_artifacts: List[Dict[str, Any]] = []
        kernel_theories: set = set()
        baseline_alternatives: set = set()

        for item in generated_raw:
            item_class = str(item.get("dsr_class", "")).upper()
            if item_class not in target_classes:
                continue

            kt = item.get("kernel_theory") or "General Systems Theory"
            base_alt = item.get("simpler_baseline_alternative") or "Manual heuristic workaround"
            kernel_theories.add(kt)
            baseline_alternatives.add(base_alt)

            record_payload = {
                "problem_id": problem_id,
                "session_id": session_id,
                "title": item.get("title") or f"{item_class.capitalize()} for {problem.get('id', 'Problem')}",
                "dsr_class": item_class,
                "description": item.get("description") or "Automated DSR artifact candidate formulation.",
                "kernel_theory": kt,
                "targeted_gap_ids": item.get("targeted_gap_ids") or ["GAP-01"],
                "linked_claim_ids": item.get("linked_claim_ids") or [c.get("id") for c in claims[:2] if c.get("id")],
                "formal_specification": item.get("formal_specification") or "",
                "simpler_baseline_alternative": base_alt,
                "contextual_constraints": item.get("contextual_constraints") or ["Low bandwidth edge compute"],
                "feasibility_score": float(item.get("feasibility_score", 0.70)),
                "novelty_score": float(item.get("novelty_score", 0.65)),
                "status": "PROPOSED",
                "provenance": {
                    "generator": "IdeationEngine_v1",
                    "mode": "llm" if raw_response else "offline_synthesis",
                    "timestamp": problem.get("updated_at"),
                }
            }

            created = self.storage.create_dsr_artifact(record_payload)
            persisted_artifacts.append(created)

        return {
            "problem_id": problem_id,
            "generated_artifacts": persisted_artifacts,
            "total_generated": len(persisted_artifacts),
            "kernel_theories_explored": sorted(list(kernel_theories)),
            "baseline_alternatives_considered": sorted(list(baseline_alternatives)),
        }

    def _build_generation_prompt(
        self,
        problem: Dict[str, Any],
        claims: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
        target_classes: List[str],
        prompt_guidance: Optional[str],
        max_candidates_per_class: int,
    ) -> str:
        claims_summary = "\n".join([
            f"- [{c.get('id', 'CLM')}] ({c.get('claim_type', 'FACT')}): {c.get('claim_text', '')}"
            for c in claims[:5]
        ]) or "None articulated yet."

        assumptions_summary = "\n".join([
            f"- [{a.get('id', 'ASM')}] (Risk {a.get('risk_level', 'HIGH')}): {a.get('assumption_text', '')}"
            for a in assumptions[:3]
        ]) or "None articulated yet."

        guidance_section = f"\nSPECIAL RESEARCHER GUIDANCE / FOCUS:\n{prompt_guidance}\n" if prompt_guidance else ""

        return f"""
FORMULATE DSR ARTIFACT CANDIDATES FOR PROBLEM:
- Problem ID: {problem.get('id')}
- Sector / Domain: {problem.get('sector')}
- Target Sufferer: {problem.get('sufferer_occupation')} in {problem.get('sufferer_location', 'Western Visayas')}
- Problem Statement: {problem.get('problem_statement')}
- Existing Workaround: {problem.get('workaround', 'Manual processes')}
- Quantified Impact: {problem.get('quantified_impact', 'Unquantified')}

GROUNDING CLAIMS:
{claims_summary}

KEY CRITICAL ASSUMPTIONS:
{assumptions_summary}
{guidance_section}
TARGET DSR ARTIFACT CLASSES TO FORMULATE:
{', '.join(target_classes)}

For EACH requested class, generate {max_candidates_per_class} candidate artifact(s).
Ensure strict adherence to Gregor & Jones (2007) Kernel Theories and Epistemic Rules 5 & 6.
Produce STRICT JSON ONLY matching the schema.
"""

    def _parse_llm_response(self, text: str) -> List[Dict[str, Any]]:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
            cleaned = re.sub(r"\n```$", "", cleaned)

        try:
            data = json.loads(cleaned)
            if isinstance(data, dict) and "artifacts" in data:
                return data["artifacts"]
            if isinstance(data, list):
                return data
        except Exception:
            pass

        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
                if isinstance(data, dict) and "artifacts" in data:
                    return data["artifacts"]
            except Exception:
                pass
        return []

    def _generate_offline_fallback_artifacts(
        self,
        problem: Dict[str, Any],
        target_classes: List[str],
        max_candidates: int = 1,
    ) -> List[Dict[str, Any]]:
        """
        Synthesize robust, academically grounded fallback candidates when LLM is offline.
        Uses sector domain and problem statement to ground kernel theories and baseline comparisons.
        """
        sector = problem.get("sector") or "Computing and Information Systems"
        prob_text = problem.get("problem_statement") or "Domain challenge in Western Visayas"
        prob_id = problem.get("id", "PROB-01")

        candidates: List[Dict[str, Any]] = []

        if "CONSTRUCT" in target_classes:
            candidates.append({
                "title": f"Hierarchical State Ontology & Feature Vocabulary for {sector}",
                "dsr_class": "CONSTRUCT",
                "description": f"Formal concept taxonomy and feature state vocabulary defining attributes, relations, and operational invariants for {prob_text[:90]}.",
                "kernel_theory": "Formal Concept Analysis & Description Logics (Baader et al., 2003)",
                "targeted_gap_ids": ["GAP-01"],
                "linked_claim_ids": [f"CLM-{prob_id}-1"],
                "formal_specification": "Ontology O = <C, R, A, H_C, rel, att> where C is the set of concept classes, R is binary relations, and H_C defines subsumption hierarchies.",
                "simpler_baseline_alternative": "Unstructured flat key-value pairs or ad-hoc JSON dictionaries without formal taxonomy or relational schema validation.",
                "contextual_constraints": ["Deployable in memory-constrained embedded databases", "Lossless serializability"],
                "feasibility_score": 0.88,
                "novelty_score": 0.65,
            })

        if "MODEL" in target_classes:
            candidates.append({
                "title": f"Stochastic State-Transition & Predictive Degradation Model",
                "dsr_class": "MODEL",
                "description": f"Dynamic mathematical model formalizing state transitions and failure probabilities under environmental stress for {sector}.",
                "kernel_theory": "Markov Decision Processes & Stochastic Control Theory (Puterman, 1994)",
                "targeted_gap_ids": ["GAP-01", "GAP-02"],
                "linked_claim_ids": [f"CLM-{prob_id}-2"],
                "formal_specification": "M = (S, A, P, R, gamma) where P(s' | s, a) represents the state transition probability matrix over discrete time steps t in T.",
                "simpler_baseline_alternative": "Static rule-based thresholding without probabilistic transition awareness or predictive decay estimation.",
                "contextual_constraints": ["Sub-100ms convergence for parameter re-estimation", "Robust to missing telemetry values"],
                "feasibility_score": 0.82,
                "novelty_score": 0.72,
            })

        if "METHOD" in target_classes:
            candidates.append({
                "title": f"Adaptive Constrained Optimization & Heuristic Inference Method",
                "dsr_class": "METHOD",
                "description": f"Algorithmic decision procedure providing bounded polynomial-time optimization for resource allocation in {prob_text[:80]}.",
                "kernel_theory": "Algorithmic Information Theory & Primal-Dual Approximation (Vazirani, 2001)",
                "targeted_gap_ids": ["GAP-02"],
                "linked_claim_ids": [f"CLM-{prob_id}-1"],
                "formal_specification": "Algorithm A: Computes min f(x) subject to g_i(x) <= b_i via iterative Lagrangian relaxation with guaranteed (1 - 1/e) approximation ratio.",
                "simpler_baseline_alternative": "Greedy first-fit heuristic with unbounded worst-case deviation and lack of theoretical convergence bounds.",
                "contextual_constraints": ["O(N log N) computational complexity", "Zero reliance on continuous cloud uplink"],
                "feasibility_score": 0.85,
                "novelty_score": 0.78,
            })

        if "INSTANTIATION" in target_classes:
            candidates.append({
                "title": f"Edge-Native Telemetry & Field Execution Testbed Prototype",
                "dsr_class": "INSTANTIATION",
                "description": f"Working physical testbed and firmware runtime deploying the method and model on edge microcontrollers in the target Philippine operational environment.",
                "kernel_theory": "Distributed Systems Architecture & Cyber-Physical Systems Theory (Lee & Seshia, 2017)",
                "targeted_gap_ids": ["GAP-01", "GAP-02"],
                "linked_claim_ids": [f"CLM-{prob_id}-1"],
                "formal_specification": "Architecture: Micro-firmware runtime in C/Rust executing on ARM Cortex-M4 with FreeRTOS, LoRaWAN uplink, and local flash buffer ring.",
                "simpler_baseline_alternative": "Monolithic cloud-dependent web application requiring constant 4G/5G connection and unoptimized server hardware.",
                "contextual_constraints": ["Solar/battery powered (<500mW power budget)", "Operational in tropical humidity (>85% RH)"],
                "feasibility_score": 0.75,
                "novelty_score": 0.82,
            })

        return candidates
