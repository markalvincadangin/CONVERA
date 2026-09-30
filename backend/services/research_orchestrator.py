"""
CONVERA Research Orchestrator Service
====================================
Unified research intelligence and workflow orchestration engine (SDD-013).
Operationalizes the 11-step research loop ratified in docs/00-foundation/IDENTITY.md §17.
"""

from datetime import datetime, timezone
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
import uuid

from contracts.methodology import get_methodology_contract, MethodologyContract, StageContract
from models.orchestrator import (
    ActionPriority,
    ActionType,
    RecommendedAction,
    OrchestrationStageStatus,
    EpistemicHealthSummary,
    CritiqueSummary,
    OrchestrationEvaluationResult,
    OrchestrationActionDispatchRequest,
    OrchestrationActionDispatchResult,
)
from storage.base import BaseStorageAdapter

logger = logging.getLogger(__name__)


class ResearchOrchestrator:
    """
    Central orchestration service coordinating Methodology Contracts, Epistemic State,
    Critique Engines, and Decision Support into a unified research loop.
    """

    def __init__(
        self,
        storage: Optional[BaseStorageAdapter] = None,
        storage_adapter: Optional[BaseStorageAdapter] = None,
    ):
        target_storage = storage or storage_adapter
        if target_storage is None:
            try:
                from storage import get_storage
                target_storage = get_storage()
            except Exception:
                from storage.sqlite_adapter import get_storage
                target_storage = get_storage()
        self.storage = target_storage


    def aggregate_context(
        self, session_id: str, problem_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gathers complete research state across session, problem, claims,
        empirical evidence links, and decisions.
        """
        session = self.storage.get_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found in storage.")

        state_data = session.get("state_data")
        if isinstance(state_data, str):
            try:
                state_data = json.loads(state_data)
            except Exception:
                state_data = {}
        elif not isinstance(state_data, dict):
            state_data = {}

        # Resolve Framework & Methodology Contract
        framework_id = (
            session.get("framework_id")
            or state_data.get("framework_id")
            or session.get("framework")
            or "RESEARCH"
        )
        contract = get_methodology_contract(framework_id) or get_methodology_contract("RESEARCH")
        if not contract:
            raise RuntimeError(f"Unable to resolve methodology contract for framework '{framework_id}'")

        # Resolve Current Stage
        stage_progress = session.get("stage_progress") or state_data.get("stage_progress") or {}
        current_stage_id = stage_progress.get("current_stage_id") or session.get("current_stage_id") or state_data.get("current_stage_id")
        if not current_stage_id or not contract.has_stage(current_stage_id):
            non_terminal = [s for s in contract.stage_sequence if s != "studio"]
            current_stage_id = non_terminal[0] if non_terminal else "studio"

        # Resolve Problem Record
        active_problem_id = problem_id or session.get("problem_id") or state_data.get("problem_id")
        if not active_problem_id:
            problems = self.storage.list_problems(session_id=session_id)
            if problems:
                active_problem_id = problems[0].get("id")

        problem: Optional[Dict[str, Any]] = None
        claims: List[Dict[str, Any]] = []
        assumptions: List[Dict[str, Any]] = []
        alternatives: List[Dict[str, Any]] = []
        evidence_links: List[Dict[str, Any]] = []

        if active_problem_id:
            if hasattr(self.storage, "get_problem_knowledge_graph"):
                knowledge = self.storage.get_problem_knowledge_graph(active_problem_id) or {}
            elif hasattr(self.storage, "get_problem_knowledge"):
                knowledge = self.storage.get_problem_knowledge(active_problem_id) or {}
            else:
                knowledge = {}

            problem = knowledge.get("problem") or (self.storage.get_problem(active_problem_id) if hasattr(self.storage, "get_problem") else None)
            claims = knowledge.get("claims") or []
            assumptions = knowledge.get("assumptions") or []
            alternatives = knowledge.get("alternatives") or []
            if hasattr(self.storage, "list_claim_evidence_links"):
                evidence_links = self.storage.list_claim_evidence_links(problem_id=active_problem_id)

        if hasattr(self.storage, "list_decision_records"):
            decisions = self.storage.list_decision_records(session_id=session_id)
        else:
            decisions = []

        return {
            "session": session,
            "state_data": state_data,
            "framework_id": contract.id,
            "contract": contract,
            "current_stage_id": current_stage_id,
            "problem": problem,
            "problem_id": active_problem_id,
            "claims": claims,
            "assumptions": assumptions,
            "alternatives": alternatives,
            "evidence_links": evidence_links,
            "decisions": decisions,
        }

    def evaluate_stage_status(
        self,
        contract: MethodologyContract,
        stage_id: str,
        session: Dict[str, Any],
        problem: Optional[Dict[str, Any]],
        claims: List[Dict[str, Any]],
        evidence_links: List[Dict[str, Any]],
    ) -> OrchestrationStageStatus:
        """
        Deterministically evaluates stage prerequisites, required outputs,
        and gate readiness under the active MethodologyContract.
        """
        # Resolve stage contract definition
        stage_def: Optional[StageContract] = None
        stage_idx = 0
        for i, s in enumerate(contract.stages):
            if s.id == stage_id:
                stage_def = s
                stage_idx = i
                break

        if not stage_def:
            stage_def = contract.stages[0]
            stage_idx = 0

        missing_prereqs: List[str] = []
        required_outputs = list(stage_def.output_artifacts) or ["Stage Summary"]
        missing_outputs: List[str] = []

        # Deterministic Prerequisite Checking across methodology progression
        if stage_idx == 0:
            # Stage 0: Problem Formulation
            if not problem or not problem.get("problem_statement"):
                missing_prereqs.append("Defined problem statement")
            if not problem or not problem.get("sector"):
                missing_prereqs.append("Target research sector or domain")
        elif stage_idx == 1:
            # Stage 1: Evidence Gathering & Literature
            if not problem:
                missing_prereqs.append("Active problem statement from Stage 1")
            has_sources = bool(evidence_links) or bool(problem.get("sources") if problem else False)
            if not has_sources:
                missing_prereqs.append("At least one empirical literature source or citation")
        elif stage_idx == 2:
            # Stage 2: Conceptual Framework & Mechanism
            if not claims:
                missing_prereqs.append("Formulated research claims or testable hypotheses")
        elif stage_idx >= 3:
            # Stage 3+: Methodology, Experimentation, Deliverables
            if not claims:
                missing_prereqs.append("Validated claims from earlier stages")

        prereqs_satisfied = len(missing_prereqs) == 0

        # Deterministic Output Artifact Verification
        for artifact in required_outputs:
            artifact_lower = artifact.lower()
            if "problem" in artifact_lower and (not problem or not problem.get("problem_statement")):
                missing_outputs.append(artifact)
            elif "sufferer" in artifact_lower and (not problem or not problem.get("sufferer_occupation")):
                missing_outputs.append(artifact)
            elif "literature" in artifact_lower and not evidence_links:
                missing_outputs.append(artifact)
            elif "claim" in artifact_lower and not claims:
                missing_outputs.append(artifact)

        gate_ready = prereqs_satisfied and len(missing_outputs) == 0

        return OrchestrationStageStatus(
            stage_id=stage_def.id,
            stage_name=stage_def.label,
            stage_index=stage_idx,
            prerequisites_satisfied=prereqs_satisfied,
            missing_prerequisites=missing_prereqs,
            required_outputs=required_outputs,
            missing_outputs=missing_outputs,
            gate_ready=gate_ready,
        )

    def calculate_epistemic_health(
        self,
        problem: Optional[Dict[str, Any]],
        claims: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]],
        evidence_links: List[Dict[str, Any]],
    ) -> EpistemicHealthSummary:
        """
        Evaluates empirical grounding, verified facts vs assumptions,
        net epistemic balance, and enforces Article II Overconfidence Guardrail.
        """
        facts_count = 0
        assumptions_count = len(assumptions)
        scholarly_works_ids = set()

        for c in claims:
            status = (c.get("status") or "").upper()
            if status in ("VERIFIED", "PROVEN", "EMPIRICAL"):
                facts_count += 1
            elif status in ("ASSUMPTION", "UNTESTED", "HYPOTHESIS"):
                assumptions_count += 1

        net_balance = 0.0
        tier_weights = {
            "A": 1.0,
            "BENCHMARK": 1.0,
            "B": 0.75,
            "PEER_REVIEWED": 0.75,
            "FIELD_STUDY": 0.75,
            "C": 0.5,
            "PREPRINT": 0.5,
            "SIGNAL": 0.25,
            "SYNTHETIC": 0.0,
        }

        for link in evidence_links:
            sw_id = link.get("scholarly_work_id")
            if sw_id:
                scholarly_works_ids.add(sw_id)

            tier = str(link.get("source_tier") or "C").upper()
            weight = tier_weights.get(tier, 0.5)

            relation = (link.get("relation_type") or "SUPPORTS").upper()
            if relation == "SUPPORTS":
                net_balance += weight
            elif relation in ("CONTRADICTS", "REFUTES"):
                net_balance -= weight
            elif relation == "CONTEXTUALIZES":
                net_balance += 0.1 * weight

        # Also account for sources attached directly to the problem
        if problem and problem.get("sources"):
            for s in problem["sources"]:
                sw_id = s.get("scholarly_work_id")
                if sw_id:
                    scholarly_works_ids.add(sw_id)

        # Article II Overconfidence Guardrail Check:
        # High linguistic certainty (>= 0.80) with weak empirical evidence (<= 0.40)
        overconfidence_risk = False
        overconfidence_details = None

        for c in claims:
            conf = float(c.get("confidence_score") or 0.0)
            if conf >= 0.80:
                # Check supporting evidence for this specific claim
                claim_id = c.get("id")
                claim_links = [l for l in evidence_links if l.get("claim_id") == claim_id and (l.get("relation_type") or "").upper() == "SUPPORTS"]
                claim_score = sum(tier_weights.get(str(l.get("source_tier") or "C").upper(), 0.5) for l in claim_links)
                if claim_score <= 0.40:
                    overconfidence_risk = True
                    claim_snippet = (c.get("claim_text") or "Active claim")[:60]
                    overconfidence_details = (
                        f"Claim '{claim_snippet}...' asserts high AI confidence ({conf:.2f}) "
                        f"with inadequate empirical literature evidence (score: {claim_score:.2f} <= 0.40). "
                        "Constitutional Article II mandates active assumption challenge."
                    )
                    break

        return EpistemicHealthSummary(
            facts_count=facts_count,
            assumptions_count=assumptions_count,
            evidence_items_count=len(evidence_links),
            scholarly_works_count=len(scholarly_works_ids),
            net_epistemic_balance=round(net_balance, 2),
            overconfidence_risk=overconfidence_risk,
            overconfidence_details=overconfidence_details,
        )

    def synthesize_critique(
        self,
        problem: Optional[Dict[str, Any]],
        claims: List[Dict[str, Any]],
        assumptions: List[Dict[str, Any]],
        evidence_links: List[Dict[str, Any]],
    ) -> CritiqueSummary:
        """
        Coordinates Socratic interrogation, blind-spot detection,
        and contradictory evidence identification.
        """
        blind_spots: List[Dict[str, Any]] = []
        contradictions: List[Dict[str, Any]] = []
        questions: List[str] = []

        if problem:
            statement = problem.get("problem_statement") or ""
            impact = problem.get("quantified_impact") or ""
            workaround = problem.get("workaround") or ""
            sufferer = problem.get("sufferer_occupation") or ""

            if not impact or len(impact.strip()) < 5:
                blind_spots.append({
                    "category": "IMPACT_QUANTIFICATION",
                    "description": "Problem lacks quantified pain or economic severity metrics.",
                })
            if not workaround or len(workaround.strip()) < 5:
                blind_spots.append({
                    "category": "STATUS_QUO_INERTIA",
                    "description": "Current status-quo workarounds and incumbent behaviors are unmeasured.",
                })
            if not sufferer or len(sufferer.strip()) < 3:
                blind_spots.append({
                    "category": "TARGET_STAKEHOLDER",
                    "description": "Target demographic or practitioner experiencing the pain is ambiguous.",
                })

            # Socratic challenge questions
            questions.append(
                f"What authoritative empirical evidence proves that '{statement[:70]}...' is a systemic breakdown rather than a transient inconvenience?"
            )
            questions.append(
                "Why has the local market or existing institutional mechanisms tolerated this problem without adopting a solution?"
            )
            questions.append(
                "What exact empirical metric or experimental measurement would completely falsify your core thesis?"
            )

        # Check for Contradictory Evidence Pairs
        claim_support_map: Dict[str, bool] = {}
        claim_refute_map: Dict[str, bool] = {}
        for l in evidence_links:
            cid = l.get("claim_id")
            if not cid:
                continue
            rel = (l.get("relation_type") or "").upper()
            if rel == "SUPPORTS":
                claim_support_map[cid] = True
            elif rel in ("CONTRADICTS", "REFUTES"):
                claim_refute_map[cid] = True

        for cid in claim_support_map:
            if claim_refute_map.get(cid):
                claim_text = next((c.get("claim_text") for c in claims if c.get("id") == cid), cid)
                contradictions.append({
                    "claim_id": cid,
                    "claim_text": claim_text,
                    "description": "Contradictory empirical citations detected (both supporting and refuting evidence attached).",
                })

        return CritiqueSummary(
            blind_spots=blind_spots,
            contradictions=contradictions,
            devils_advocate_questions=questions,
        )

    def generate_recommendations(
        self,
        stage_status: OrchestrationStageStatus,
        epistemic_health: EpistemicHealthSummary,
        critique: CritiqueSummary,
        problem: Optional[Dict[str, Any]],
        session_id: Optional[str] = None,
    ) -> List[RecommendedAction]:
        """
        Applies deterministic priority ordering to recommend next actions.
        Priority Order: URGENT -> HIGH -> MEDIUM -> LOW
        """
        recs: List[RecommendedAction] = []

        # -------------------------------------------------------------
        # Priority 1: URGENT
        # -------------------------------------------------------------
        if epistemic_health.overconfidence_risk:
            recs.append(RecommendedAction(
                action_id=f"act-overconf-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.CHALLENGE_ASSUMPTION,
                title="Challenge Overconfident Research Claim",
                description=epistemic_health.overconfidence_details or "High AI confidence detected without empirical grounding.",
                priority=ActionPriority.URGENT,
                blocking_stage_progression=True,
                target_engine="devils_advocate",
                suggested_payload={"trigger": "OVERCONFIDENCE_WARNING"},
            ))

        if not stage_status.prerequisites_satisfied:
            recs.append(RecommendedAction(
                action_id=f"act-prereq-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.ACQUIRE_EVIDENCE,
                title="Satisfy Stage Input Prerequisites",
                description=f"Stage progression is blocked by missing prerequisites: {', '.join(stage_status.missing_prerequisites)}.",
                priority=ActionPriority.URGENT,
                blocking_stage_progression=True,
                target_engine="scholarly_retrieval",
                suggested_payload={"missing_prerequisites": stage_status.missing_prerequisites},
            ))

        # -------------------------------------------------------------
        # Priority 2: HIGH
        # -------------------------------------------------------------
        if critique.contradictions:
            recs.append(RecommendedAction(
                action_id=f"act-contradict-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.RESOLVE_CONTRADICTION,
                title="Resolve Contradictory Evidence Pair",
                description=critique.contradictions[0]["description"],
                priority=ActionPriority.HIGH,
                blocking_stage_progression=True,
                target_engine="contradiction_engine",
                suggested_payload={"contradictions": critique.contradictions},
            ))

        if epistemic_health.scholarly_works_count == 0 and problem:
            recs.append(RecommendedAction(
                action_id=f"act-lit-search-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.SYNTHESIZE_LITERATURE,
                title="Acquire Empirical Scholarly Literature",
                description="Zero academic papers are persisted or linked to your problem claims. Search OpenAlex or local FTS5 index.",
                priority=ActionPriority.HIGH,
                blocking_stage_progression=False,
                target_engine="literature_matrix",
                suggested_payload={"query": problem.get("problem_statement", "")[:100]},
            ))

        if problem and ("formulation" in stage_status.stage_id.lower() or stage_status.stage_id in ("stage_d_formulation", "phase4", "phase_d")):
            try:
                dsr_artifacts = self.storage.list_dsr_artifacts(problem["id"])
                selected_dsr = [a for a in dsr_artifacts if a.get("status") == "SELECTED"]
                if not selected_dsr:
                    recs.append(RecommendedAction(
                        action_id=f"act-dsr-{uuid.uuid4().hex[:8]}",
                        action_type=ActionType.FORMULATE_DSR_ARTIFACT,
                        title="Formulate Candidate DSR Artifacts (4 Classes)",
                        description="Phase D requires at least one selected, grounded DSR artifact (Construct, Model, Method, or Instantiation) anchored to a Kernel Theory and simpler baseline alternative.",
                        priority=ActionPriority.HIGH,
                        blocking_stage_progression=True,
                        target_engine="ideation_engine",
                        suggested_payload={
                            "problem_id": problem["id"],
                            "classes": ["CONSTRUCT", "MODEL", "METHOD", "INSTANTIATION"],
                        },
                    ))
            except Exception as e:
                logger.warning(f"Failed to check DSR artifacts for recommendations: {e}")

        if (
            "evaluation" in stage_status.stage_id.lower()
            or stage_status.stage_id in ("stage_e_evaluation", "phase5", "phase_e")
        ):
            try:
                evals = (
                    self.storage.list_concept_evaluations(session_id=session_id)
                    if (session_id and hasattr(self.storage, "list_concept_evaluations"))
                    else []
                )
                if not evals:
                    dsr_ids = []
                    if problem and hasattr(self.storage, "list_dsr_artifacts"):
                        dsr_artifacts = self.storage.list_dsr_artifacts(problem["id"])
                        dsr_ids = [a["id"] for a in dsr_artifacts]
                    recs.append(RecommendedAction(
                        action_id=f"act-eval-{uuid.uuid4().hex[:8]}",
                        action_type=ActionType.EVALUATE_CONCEPT,
                        title="Evaluate Candidate Concepts (7-Dimension Matrix)",
                        description="Stage E requires multi-criteria evaluation across problem relevance, evidence grounding, gap validity, and feasibility before Gate 3 review.",
                        priority=ActionPriority.HIGH,
                        blocking_stage_progression=True,
                        target_engine="concept_evaluation_engine",
                        suggested_payload={
                            "session_id": session_id,
                            "problem_id": problem["id"] if problem else None,
                            "candidate_ids": dsr_ids,
                        },
                    ))
            except Exception as e:
                logger.warning(f"Failed to check concept evaluations for recommendations: {e}")

        # -------------------------------------------------------------
        # Priority 3: MEDIUM
        # -------------------------------------------------------------
        if critique.blind_spots:
            recs.append(RecommendedAction(
                action_id=f"act-blindspot-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.EXECUTE_CRITIQUE,
                title="Investigate Identified Blind Spots",
                description=critique.blind_spots[0]["description"],
                priority=ActionPriority.MEDIUM,
                blocking_stage_progression=False,
                target_engine="blind_spot_detector",
                suggested_payload={"blind_spots": critique.blind_spots},
            ))

        if stage_status.missing_outputs:
            recs.append(RecommendedAction(
                action_id=f"act-outputs-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.GENERATE_STAGE_DELIVERABLE,
                title="Formulate Stage Required Deliverables",
                description=f"Complete pending stage deliverables: {', '.join(stage_status.missing_outputs)}.",
                priority=ActionPriority.MEDIUM,
                blocking_stage_progression=False,
                target_engine="deliverables_generator",
                suggested_payload={"missing_outputs": stage_status.missing_outputs},
            ))

        # -------------------------------------------------------------
        # Priority 4: LOW
        # -------------------------------------------------------------
        if stage_status.gate_ready:
            recs.append(RecommendedAction(
                action_id=f"act-gate-ready-{uuid.uuid4().hex[:8]}",
                action_type=ActionType.REQUEST_GATE_REVIEW,
                title="Request Stage Quality Gate Review",
                description="All stage prerequisites and outputs are satisfied. Request formal human sign-off to advance the session.",
                priority=ActionPriority.LOW,
                blocking_stage_progression=False,
                target_engine="gate_engine",
                suggested_payload={"gate_id": stage_status.stage_id},
            ))

        return recs

    async def evaluate(
        self,
        session_id: str,
        problem_id: Optional[str] = None,
        include_llm_guidance: bool = False,
    ) -> OrchestrationEvaluationResult:
        """
        Executes the complete orchestration evaluation loop:
        1. Aggregates Context
        2. Evaluates Methodology Contract
        3. Computes Epistemic Health (with Article II Overconfidence Guardrail)
        4. Synthesizes Critique & Contradictions
        5. Ranks Deterministic Action Recommendations
        6. Logs Auditable Event to SQLite
        """
        ctx = self.aggregate_context(session_id=session_id, problem_id=problem_id)
        contract = ctx["contract"]
        current_stage_id = ctx["current_stage_id"]
        problem = ctx["problem"]
        claims = ctx["claims"]
        assumptions = ctx["assumptions"]
        evidence_links = ctx["evidence_links"]

        stage_status = self.evaluate_stage_status(
            contract=contract,
            stage_id=current_stage_id,
            session=ctx["session"],
            problem=problem,
            claims=claims,
            evidence_links=evidence_links,
        )

        epistemic_health = self.calculate_epistemic_health(
            problem=problem,
            claims=claims,
            assumptions=assumptions,
            evidence_links=evidence_links,
        )

        critique = self.synthesize_critique(
            problem=problem,
            claims=claims,
            assumptions=assumptions,
            evidence_links=evidence_links,
        )

        recommendations = self.generate_recommendations(
            stage_status=stage_status,
            epistemic_health=epistemic_health,
            critique=critique,
            problem=problem,
            session_id=session_id,
        )

        narrative_guidance: Optional[str] = None
        if include_llm_guidance:
            try:
                from llm_gateway import generate_response_with_fallback
                prompt = (
                    f"RESEARCH CONTEXT:\n"
                    f"- Framework: {contract.name} ({current_stage_id})\n"
                    f"- Stage: {stage_status.stage_name} (Prereqs: {stage_status.prerequisites_satisfied}, Gate Ready: {stage_status.gate_ready})\n"
                    f"- Problem: {(problem.get('problem_statement') if problem else 'No problem')[:120]}\n"
                    f"- Facts: {epistemic_health.facts_count}, Assumptions: {epistemic_health.assumptions_count}\n"
                    f"- Overconfidence Risk: {epistemic_health.overconfidence_risk}\n\n"
                    f"Provide exactly 2 concise sentences of strategic research advice for what the team should focus on right now."
                )
                res = await generate_response_with_fallback(
                    prompt=prompt,
                    system_instruction="You are the CONVERA Research Orchestrator. Be clinical, concise, and focused on empirical methodology.",
                    max_tokens=150,
                )
                if res and res.content:
                    narrative_guidance = res.content.strip()
            except Exception as e:
                logger.warning(f"Qualitative narrative synthesis skipped: {e}")

        now_iso = datetime.now(timezone.utc).isoformat()
        result = OrchestrationEvaluationResult(
            session_id=session_id,
            problem_id=ctx["problem_id"],
            framework_id=contract.id,
            stage_id=current_stage_id,
            evaluated_at=now_iso,
            stage_status=stage_status,
            epistemic_health=epistemic_health,
            critique_summary=critique,
            recommended_actions=recommendations,
            narrative_guidance=narrative_guidance,
        )

        # Log event into SQLite
        try:
            self.storage.record_orchestration_event({
                "session_id": session_id,
                "problem_id": ctx["problem_id"],
                "framework_id": contract.id,
                "stage_id": current_stage_id,
                "event_type": "EVALUATION",
                "payload": result.model_dump(),
                "created_at": now_iso,
            })
        except Exception as e:
            logger.error(f"Failed to record orchestration event: {e}")

        return result

    async def dispatch_action(
        self, request: OrchestrationActionDispatchRequest
    ) -> OrchestrationActionDispatchResult:
        """
        Executes a recommended action, coordinates the appropriate engine,
        records provenance in SQLite, and returns execution artifacts.
        """
        session_id = request.session_id
        action_type = request.action_type
        params = request.parameters
        ctx = self.aggregate_context(session_id=session_id, problem_id=request.problem_id)
        problem = ctx["problem"]

        status = "SUCCESS"
        summary = ""
        resulting_artifacts: Dict[str, Any] = {}

        if action_type == ActionType.ACQUIRE_EVIDENCE:
            query = params.get("query") or (problem.get("problem_statement") if problem else "")[:80]
            limit = int(params.get("limit") or 5)
            use_live = params.get("live", True)

            works = []
            if use_live:
                try:
                    from connectors.hub import connector_hub
                    live_works = await connector_hub.federated_search(
                        query=query, limit_per_source=max(2, limit // 2)
                    )
                    works = [w.model_dump() for w in live_works]
                except Exception as e:
                    logger.warning(f"Live connector search failed, falling back to local FTS5: {e}")

            if not works:
                works = self.storage.search_scholarly_works_fts(query=query, limit=limit)
                summary = f"Retrieved {len(works)} scholarly works from local FTS5 index for query '{query}'."
            else:
                summary = f"Acquired {len(works)} scholarly works from academic connectors (OpenAlex, Semantic Scholar) for query '{query}'."

            resulting_artifacts["scholarly_works"] = works
            resulting_artifacts["count"] = len(works)

        elif action_type == ActionType.EXECUTE_CRITIQUE:
            if problem:
                from engines.devils_advocate import challenge_problem_with_agent
                try:
                    critique_res = await challenge_problem_with_agent(problem)
                    resulting_artifacts["critique"] = critique_res
                    summary = f"Executed Devil's Advocate critique. Plausibility score: {critique_res.get('plausibility_score', 'N/A')}."
                except Exception as e:
                    status = "DEGRADED"
                    summary = f"Adversarial critique fell back to deterministic rules: {e}"
            else:
                status = "ERROR"
                summary = "Cannot execute critique without an active problem record."

        elif action_type == ActionType.SYNTHESIZE_LITERATURE:
            query = params.get("query") or (problem.get("problem_statement") if problem else "")[:80]
            works = []
            try:
                from connectors.hub import connector_hub
                live_works = await connector_hub.federated_search(query=query, limit_per_source=3)
                works = [w.model_dump() for w in live_works]
            except Exception:
                pass

            if not works:
                works = self.storage.search_scholarly_works_fts(query=query, limit=5)

            matrix_entries = [
                {
                    "id": w.get("id"),
                    "title": w.get("title"),
                    "year": w.get("year"),
                    "citations": w.get("citation_count"),
                    "venue": w.get("venue"),
                    "doi": w.get("doi"),
                    "is_offline": w.get("is_offline", False),
                }
                for w in works
            ]
            resulting_artifacts["literature_matrix"] = matrix_entries
            summary = f"Synthesized literature comparison matrix with {len(matrix_entries)} candidate papers."

        elif action_type == ActionType.FORMULATE_DSR_ARTIFACT:
            from engines.ideation_engine import IdeationEngine
            prob_id = params.get("problem_id") or (problem.get("id") if problem else None)
            if not prob_id:
                raise ValueError("FORMULATE_DSR_ARTIFACT requires a valid problem_id.")
            engine = IdeationEngine(storage=self.storage)
            gen_res = await engine.generate_dsr_candidates(
                problem_id=prob_id,
                session_id=session_id,
                classes=params.get("classes"),
                prompt_guidance=params.get("prompt_guidance"),
                max_candidates_per_class=int(params.get("max_candidates_per_class", 1)),
            )
            resulting_artifacts = gen_res
            summary = f"Formulated {gen_res.get('total_generated', 0)} DSR artifact candidates across classes for problem '{prob_id}'."

        elif action_type == ActionType.REQUEST_GATE_REVIEW:
            summary = (
                f"Quality gate review requested for session '{session_id}' in stage '{ctx['current_stage_id']}'. "
                "Awaiting human sign-off."
            )
            resulting_artifacts["gate_status"] = "AWAITING_HUMAN_SIGN_OFF"

        elif action_type == ActionType.CHALLENGE_ASSUMPTION:
            from engines.assumption_engine import extract_claims_and_assumptions
            prob = problem
            if not prob:
                claim_text = params.get("claim_text") or params.get("assumption_text") or "Unspecified research friction"
                prob = {
                    "id": ctx.get("problem_id") or "prob_adhoc",
                    "problem_statement": claim_text,
                    "sufferer_occupation": params.get("sufferer_occupation", "Target Users"),
                    "sufferer_location": params.get("sufferer_location", "Field Region"),
                    "workaround": params.get("workaround", "Manual alternative"),
                    "quantified_impact": params.get("quantified_impact", "Unquantified friction"),
                    "devils_advocate_data": params.get("critique") or "",
                }

            mode = params.get("mode") or prob.get("track_mode") or "COMMERCIAL"
            try:
                extracted = await extract_claims_and_assumptions(prob, mode=mode)
                prob_id = prob.get("id")
                if prob_id and hasattr(self.storage, "set_problem_claims"):
                    if extracted.get("claims"):
                        self.storage.set_problem_claims(prob_id, extracted["claims"])
                    if extracted.get("assumptions"):
                        self.storage.set_problem_assumptions(prob_id, extracted["assumptions"])
                    if extracted.get("alternatives"):
                        self.storage.set_problem_alternatives(prob_id, extracted["alternatives"])

                resulting_artifacts["claims"] = extracted.get("claims", [])
                resulting_artifacts["assumptions"] = extracted.get("assumptions", [])
                resulting_artifacts["alternatives"] = extracted.get("alternatives", [])
                summary = (
                    f"Challenged assumptions and extracted {len(extracted.get('claims', []))} claims, "
                    f"{len(extracted.get('assumptions', []))} assumptions, and "
                    f"{len(extracted.get('alternatives', []))} alternatives."
                )
            except Exception as e:
                status = "DEGRADED"
                summary = f"Assumption extraction fell back to degraded state: {e}"
                resulting_artifacts["error"] = str(e)

        elif action_type == ActionType.RESOLVE_CONTRADICTION:
            from engines.contradiction_engine import ContradictionEngine
            engine = ContradictionEngine(storage=self.storage)
            claim_id = params.get("claim_id") or ""
            sup_sources = params.get("supporting_sources") or []
            contra_sources = params.get("contradicting_sources") or []
            claim_stmt = params.get("claim_statement") or (problem.get("problem_statement") if problem else "Unspecified Claim")

            if sup_sources or contra_sources:
                analysis = engine.analyze_claim_epistemic_conflict(
                    claim_id=claim_id or "claim_adhoc",
                    claim_statement=claim_stmt,
                    supporting_sources=sup_sources,
                    contradicting_sources=contra_sources,
                )
                resulting_artifacts["conflict_analysis"] = analysis
                summary = f"Analyzed epistemic conflict for claim '{claim_id}'. Status: {analysis.get('status')}."
            elif params.get("supporting_evidence_id") and params.get("contradicting_evidence_id"):
                rec = engine.register_contradiction(
                    claim_id=claim_id or "claim_adhoc",
                    supporting_evidence_id=params["supporting_evidence_id"],
                    contradicting_evidence_id=params["contradicting_evidence_id"],
                    investigation_notes=params.get("investigation_notes", ""),
                )
                resulting_artifacts["registered_contradiction"] = rec
                summary = f"Registered contradiction between evidence '{params['supporting_evidence_id']}' and '{params['contradicting_evidence_id']}' for claim '{claim_id}'."
            else:
                contradictions = engine.list_project_contradictions(claim_id=claim_id if claim_id else None)
                resulting_artifacts["contradictions"] = contradictions
                resulting_artifacts["count"] = len(contradictions)
                summary = f"Queried existing contradictions for claim '{claim_id or 'all'}'. Found {len(contradictions)} records."

        elif action_type == ActionType.GENERATE_STAGE_DELIVERABLE:
            from engines.deliverables_generator import (
                generate_lean_canvas,
                generate_swot_analysis,
                generate_pitch_deck,
            )
            deliverable_type = (params.get("deliverable_type") or "LEAN_CANVAS").upper()

            session_data = self.storage.get_session(session_id) or {}
            state_payload = {
                "project_name": session_data.get("project_name") or "CONVERA Research Project",
                "session_id": session_id,
                "current_stage": ctx.get("current_stage_id"),
                "problem": problem or {},
                "phase1_response": session_data.get("phase1_response") or (problem.get("problem_statement") if problem else ""),
                "phase2_response": session_data.get("phase2_response") or "",
                "phase3_problem": problem.get("problem_statement") if problem else "",
                "phase3_response": session_data.get("phase3_response") or "",
                "phase4_response": session_data.get("phase4_response") or "",
                "phase5_response": session_data.get("phase5_response") or "",
            }
            if "state" in params and isinstance(params["state"], dict):
                state_payload.update(params["state"])

            try:
                if deliverable_type == "SWOT":
                    res = await generate_swot_analysis(state_payload)
                    resulting_artifacts["swot"] = res
                    summary = f"Generated SWOT & Competitor Differentiation Matrix for session '{session_id}'."
                elif deliverable_type == "PITCH_DECK":
                    res = await generate_pitch_deck(state_payload)
                    resulting_artifacts["pitch_deck"] = res
                    summary = f"Generated 10-slide Pitch Deck narrative for session '{session_id}'."
                elif deliverable_type in ("ALL", "COMPREHENSIVE"):
                    canvas_res = await generate_lean_canvas(state_payload)
                    swot_res = await generate_swot_analysis(state_payload)
                    pitch_res = await generate_pitch_deck(state_payload)
                    resulting_artifacts["lean_canvas"] = canvas_res
                    resulting_artifacts["swot"] = swot_res
                    resulting_artifacts["pitch_deck"] = pitch_res
                    summary = f"Generated complete deliverable suite (Lean Canvas, SWOT, Pitch Deck) for session '{session_id}'."
                else:
                    res = await generate_lean_canvas(state_payload)
                    resulting_artifacts["lean_canvas"] = res
                    summary = f"Generated 9-box Lean Canvas for session '{session_id}'."
            except Exception as e:
                status = "DEGRADED"
                summary = f"Deliverable generation fell back to degraded state: {e}"
                resulting_artifacts["fallback_brief"] = state_payload

        elif action_type == ActionType.FORMULATE_DECISION:
            from dataclasses import asdict
            from engines.decision_engine import (
                synthesize_decision_room,
                rank_candidates_deterministically,
                generate_deterministic_fallback_summary,
            )
            candidate_ids = params.get("candidate_ids") or []
            candidates = []
            if candidate_ids:
                for cid in candidate_ids:
                    cand = self.storage.get_problem(cid)
                    if cand:
                        candidates.append(cand)
            elif problem:
                candidates = [problem]

            if not candidates and hasattr(self.storage, "list_problems"):
                all_problems = self.storage.list_problems()
                if all_problems:
                    candidates = all_problems[:4]

            if not candidates:
                status = "DEGRADED"
                summary = "No candidates available for decision room synthesis."
                resulting_artifacts["decision_room"] = {
                    "recommended_winner_id": None,
                    "recommendation_summary": "No candidates provided or discovered.",
                    "candidate_breakdowns": [],
                    "is_degraded": True,
                }
            else:
                try:
                    decision_res = await synthesize_decision_room(candidates, storage=self.storage)
                    resulting_artifacts["decision_room"] = decision_res
                    winner = decision_res.get("recommended_winner_id")
                    summary = f"Synthesized Decision Room for {len(candidates)} candidates. Recommended: {winner}."
                except Exception as e:
                    status = "DEGRADED"
                    summary = f"Decision synthesis fell back to deterministic ranking: {e}"
                    deterministic_ranks = rank_candidates_deterministically(candidates, storage=self.storage)
                    resulting_artifacts["decision_room"] = {
                        "recommended_winner_id": deterministic_ranks[0].problem_id if deterministic_ranks else None,
                        "recommendation_summary": generate_deterministic_fallback_summary(deterministic_ranks),
                        "candidate_breakdowns": [asdict(b) for b in deterministic_ranks],
                        "is_degraded": True,
                    }

        elif action_type == ActionType.EVALUATE_CONCEPT:
            from engines.concept_evaluation_engine import ConceptEvaluationEngine
            from models.concept_evaluation import (
                ConceptEvaluationRequest,
                ConceptComparisonRequest,
            )
            engine = ConceptEvaluationEngine(storage=self.storage)

            candidate_ids = params.get("candidate_ids") or params.get("concept_ids") or []
            if len(candidate_ids) > 1:
                comp_req = ConceptComparisonRequest(
                    session_id=session_id,
                    concept_ids=candidate_ids,
                    include_llm_critique=params.get("include_llm_critique", True),
                )
                comp_res = await engine.compare_concepts(comp_req)
                resulting_artifacts["comparison"] = comp_res.model_dump()
                summary = f"Evaluated and compared {len(candidate_ids)} candidate concepts. Winner: {comp_res.recommended_winner_id}."
            else:
                concept_id = params.get("concept_id") or (candidate_ids[0] if candidate_ids else None)
                if not concept_id:
                    if problem and hasattr(self.storage, "list_dsr_artifacts"):
                        dsr_list = self.storage.list_dsr_artifacts(problem["id"])
                        if dsr_list:
                            concept_id = dsr_list[0]["id"]
                            if "concept_title" not in params:
                                params["concept_title"] = dsr_list[0].get("title")
                            if "concept_description" not in params:
                                params["concept_description"] = dsr_list[0].get("description")

                if not concept_id:
                    status = "DEGRADED"
                    summary = "No concept_id or DSR artifact available to evaluate."
                else:
                    eval_req = ConceptEvaluationRequest(
                        concept_id=concept_id,
                        session_id=session_id,
                        prompt_guidance=params.get("concept_description") or params.get("prompt_guidance"),
                        weights=params.get("weights"),
                    )
                    eval_res = await engine.evaluate_concept(eval_req)
                    resulting_artifacts["evaluation"] = eval_res.model_dump() if hasattr(eval_res, "model_dump") else eval_res
                    c_title = params.get("concept_title") or f"Concept {concept_id}"
                    c_score = eval_res.get("composite_score", 0.0) if isinstance(eval_res, dict) else getattr(eval_res, "composite_score", 0.0)
                    r_tier = eval_res.get("recommendation", "") if isinstance(eval_res, dict) else getattr(eval_res, "recommendation", "")
                    if hasattr(r_tier, "value"):
                        r_tier = r_tier.value
                    summary = f"Evaluated concept '{c_title}' (Composite Score: {c_score:.2f}, Recommendation: {r_tier})."

        else:
            summary = f"Action '{action_type.value}' acknowledged and queued."
            resulting_artifacts["acknowledged"] = True

        event_id = f"ORCH-EVT-{uuid.uuid4().hex[:16]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Log dispatch event to SQLite
        try:
            self.storage.record_orchestration_event({
                "id": event_id,
                "session_id": session_id,
                "problem_id": ctx["problem_id"],
                "framework_id": ctx["framework_id"],
                "stage_id": ctx["current_stage_id"],
                "event_type": "ACTION_DISPATCHED",
                "payload": {
                    "action_type": action_type.value,
                    "target_engine": request.target_engine,
                    "status": status,
                    "summary": summary,
                    "artifacts_count": len(resulting_artifacts),
                },
                "created_at": now_iso,
            })
        except Exception as e:
            logger.error(f"Failed to record action dispatch event: {e}")

        return OrchestrationActionDispatchResult(
            event_id=event_id,
            session_id=session_id,
            action_type=action_type,
            status=status,
            execution_summary=summary,
            resulting_artifacts=resulting_artifacts,
        )

    def get_loop_history(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves chronological orchestration events for a session."""
        return self.storage.get_orchestration_events(session_id=session_id, limit=limit)
