"""
CONVERA Cross-Stage Research Critique & Blind-Spot Engine (SDD-019)
===================================================================
Adversarial critique engine that cross-examines research claims across
DSR Stages A, C, D, E, and F. Detects epistemic contradictions, architectural
blind spots, empirical failure loops, and computes deterministic consistency scores.
"""

import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from storage.factory import get_storage
from models.critique import (
    CritiqueType,
    CritiqueSeverity,
    CritiqueStatus,
    CrossStageClaimExcerpt,
    CrossStageCritiqueRecord,
    CritiqueEvaluationRequest,
    CritiqueEvaluationResponse,
    ResolveCritiqueRequest,
)
from llm_gateway import generate_with_meta, TaskCategory

logger = logging.getLogger(__name__)


class CrossStageCritiqueEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def calculate_consistency_score(
        self,
        critiques: List[CrossStageCritiqueRecord]
    ) -> Dict[str, Any]:
        """
        Pure deterministic cross-stage epistemic consistency score calculation.
        Formula: max(0.0, 100.0 - (25.0 * N_fatal + 15.0 * N_critical + 8.0 * N_warning + 3.0 * N_advisory))
        Only OPEN critiques reduce the score; RESOLVED and DISMISSED critiques do not penalize.
        """
        open_critiques = [c for c in critiques if c.status == CritiqueStatus.OPEN]
        
        fatal_count = sum(1 for c in open_critiques if c.severity == CritiqueSeverity.FATAL)
        critical_count = sum(1 for c in open_critiques if c.severity == CritiqueSeverity.CRITICAL)
        warning_count = sum(1 for c in open_critiques if c.severity == CritiqueSeverity.WARNING)
        advisory_count = sum(1 for c in open_critiques if c.severity == CritiqueSeverity.ADVISORY)

        penalty = (
            (25.0 * fatal_count)
            + (15.0 * critical_count)
            + (8.0 * warning_count)
            + (3.0 * advisory_count)
        )
        score = max(0.0, min(100.0, 100.0 - penalty))

        return {
            "consistency_score": round(score, 1),
            "total_critiques": len(critiques),
            "open_critiques": len(open_critiques),
            "fatal_count": fatal_count,
            "critical_count": critical_count,
            "warning_count": warning_count,
            "advisory_count": advisory_count,
        }

    def _collect_stage_telemetry(
        self, session_id: str, project_id: Optional[str] = None, problem_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Collects relational state across DSR Stages A, C, D, E, F."""
        session = self.storage.get_session(session_id) or {}
        proj_id = project_id or session.get("project_id", "default_proj")
        
        # If problem_id is not specified, resolve from session
        active_problem_id = problem_id or session.get("active_problem_id") or session.get("selected_problem_id")
        problem = self.storage.get_problem(active_problem_id) if active_problem_id else None

        # Stage A: Problem statement, claims, assumptions
        claims = problem.get("claims", []) if problem else []
        if not claims and hasattr(self.storage, "list_claims") and active_problem_id:
            claims = self.storage.list_claims(active_problem_id)

        assumptions = problem.get("assumptions", []) if problem else []
        if not assumptions and hasattr(self.storage, "list_assumptions") and active_problem_id:
            assumptions = self.storage.list_assumptions(active_problem_id)

        # Stage C: Sources, scholarly links, contradictions
        sources = problem.get("sources", []) if problem else []
        if not sources and hasattr(self.storage, "get_problem_sources_with_links") and active_problem_id:
            sources = self.storage.get_problem_sources_with_links(active_problem_id)

        evidence_links = self.storage.list_claim_evidence_links(problem_id=active_problem_id) if (active_problem_id and hasattr(self.storage, "list_claim_evidence_links")) else []
        contradictions = self.storage.list_contradictions() if hasattr(self.storage, "list_contradictions") else []

        # Stage D: Artifacts
        artifacts = self.storage.list_dsr_artifacts(active_problem_id) if (active_problem_id and hasattr(self.storage, "list_dsr_artifacts")) else []

        # Stage E: Circumscription iterations & Gate reviews
        circumscriptions = self.storage.list_circumscription_iterations(proj_id) if hasattr(self.storage, "list_circumscription_iterations") else []
        gate_reviews = self.storage.list_gate_reviews(proj_id) if hasattr(self.storage, "list_gate_reviews") else []
        assumption_tests = []
        if assumptions and hasattr(self.storage, "list_assumption_tests"):
            for a in assumptions:
                assumption_tests.extend(self.storage.list_assumption_tests(a.get("id")))

        # Stage F: Feasibility record
        feasibility = self.storage.get_feasibility_record(session_id)

        return {
            "session": session,
            "problem": problem,
            "active_problem_id": active_problem_id,
            "claims": claims,
            "assumptions": assumptions,
            "sources": sources,
            "evidence_links": evidence_links,
            "contradictions": contradictions,
            "artifacts": artifacts,
            "circumscriptions": circumscriptions,
            "gate_reviews": gate_reviews,
            "assumption_tests": assumption_tests,
            "feasibility": feasibility,
            "project_id": proj_id,
        }

    def _generate_heuristic_critiques(
        self, session_id: str, telemetry: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Rule-based deterministic detection of cross-stage tensions and blind spots.
        Runs fully offline without API keys.
        """
        critiques: List[Dict[str, Any]] = []
        proj_id = telemetry.get("project_id")

        # -------------------------------------------------------------
        # Rule 1: CIRCUMSCRIPTION_TENSION (Stage E vs Stage D / Stage A)
        # -------------------------------------------------------------
        circumscriptions = telemetry.get("circumscriptions", [])
        for c in circumscriptions:
            status = str(c.get("status", "")).upper()
            if "FAIL" in status or status == "FAILED_LOOPBACK":
                obs = c.get("observed_value")
                tgt = c.get("target_value")
                metric = c.get("metric_name", "Primary Metric")
                failure_mode = c.get("failure_mode") or "Empirical threshold violation"
                constraint = c.get("constraint_extracted") or "Unspecified architectural constraint"
                loopback = c.get("target_phase_loopback", "PHASE_D")

                critiques.append({
                    "session_id": session_id,
                    "project_id": proj_id,
                    "critique_type": CritiqueType.CIRCUMSCRIPTION_TENSION,
                    "severity": CritiqueSeverity.CRITICAL,
                    "target_stages": ["STAGE_E", "STAGE_D"],
                    "cross_stage_claims": [
                        CrossStageClaimExcerpt(
                            stage="STAGE_E",
                            claim_title=f"Circumscription Iteration #{c.get('iteration_number', 1)} Failure",
                            excerpt=f"Observed {metric} = {obs} vs Target = {tgt}. Failure Mode: {failure_mode}"
                        ),
                        CrossStageClaimExcerpt(
                            stage="STAGE_D",
                            claim_title="Design Science Artifact Specification",
                            excerpt=f"Target loopback constraint extracted: '{constraint}' targeting {loopback}"
                        ),
                    ],
                    "fatal_flaw_summary": f"Unreconciled empirical failure in circumscription loop #{c.get('iteration_number', 1)}: {failure_mode}.",
                    "kill_question": f"Given that iteration #{c.get('iteration_number', 1)} failed with {metric}={obs} (target {tgt}) due to '{failure_mode}', what concrete architectural changes in Stage D guarantee this constraint will be satisfied?",
                    "mitigation_recommendation": f"Incorporate the extracted constraint '{constraint}' into the Stage D design specification and schedule a re-test in Stage E.",
                    "plausibility_score": 88.0,
                    "status": CritiqueStatus.OPEN,
                    "is_degraded": True,
                })

        # -------------------------------------------------------------
        # Rule 2: ETHICS_FEASIBILITY_DISCORD (Stage F vs Stage A / Stage D)
        # -------------------------------------------------------------
        feasibility = telemetry.get("feasibility")
        if feasibility:
            if not feasibility.get("compliance_passed", False):
                critiques.append({
                    "session_id": session_id,
                    "project_id": proj_id,
                    "critique_type": CritiqueType.ETHICS_FEASIBILITY_DISCORD,
                    "severity": CritiqueSeverity.FATAL,
                    "target_stages": ["STAGE_F", "STAGE_A"],
                    "cross_stage_claims": [
                        CrossStageClaimExcerpt(
                            stage="STAGE_F",
                            claim_title="Regulatory & Ethics Compliance Verification",
                            excerpt="Non-compliant with Republic Act 10173 (Data Privacy Act) or absent participant consent protocol."
                        )
                    ],
                    "fatal_flaw_summary": "Fatal regulatory non-compliance with Republic Act 10173 / Institutional Review clearance.",
                    "kill_question": "How can the thesis committee authorize field deployment or user telemetry ingestion when regulatory consent protocols under RA 10173 are unfulfilled?",
                    "mitigation_recommendation": "Establish a formal participant consent protocol and data minimization policy in the Stage F Proposal Canvas before requesting defense clearance.",
                    "plausibility_score": 95.0,
                    "status": CritiqueStatus.OPEN,
                    "is_degraded": True,
                })

            if feasibility.get("feasibility_score", 0.0) < 70.0:
                critiques.append({
                    "session_id": session_id,
                    "project_id": proj_id,
                    "critique_type": CritiqueType.ETHICS_FEASIBILITY_DISCORD,
                    "severity": CritiqueSeverity.WARNING,
                    "target_stages": ["STAGE_F"],
                    "cross_stage_claims": [
                        CrossStageClaimExcerpt(
                            stage="STAGE_F",
                            claim_title="Feasibility Composite Index",
                            excerpt=f"Feasibility score is {feasibility.get('feasibility_score')}% (Threshold for Gate 4 is 80.0%)."
                        )
                    ],
                    "fatal_flaw_summary": "Stage F feasibility score is below the clearance threshold (80.0%).",
                    "kill_question": "Why should this research proposal proceed when budgetary or timeline allocations exhibit high execution risk?",
                    "mitigation_recommendation": "Refactor timeline allocations and clarify resource line items in the Stage F Proposal Canvas.",
                    "plausibility_score": 75.0,
                    "status": CritiqueStatus.OPEN,
                    "is_degraded": True,
                })

        # -------------------------------------------------------------
        # Rule 3: EVIDENCE_VULNERABILITY (Stage A vs Stage C)
        # -------------------------------------------------------------
        assumptions = telemetry.get("assumptions", [])
        for a in assumptions:
            status = str(a.get("status", "")).upper()
            risk = str(a.get("risk_level", "")).upper()
            stmt = a.get("assumption_text") or a.get("statement") or "Unnamed Assumption"
            if status == "FALSIFIED" or risk == "CRITICAL":
                critiques.append({
                    "session_id": session_id,
                    "project_id": proj_id,
                    "critique_type": CritiqueType.EVIDENCE_VULNERABILITY,
                    "severity": CritiqueSeverity.CRITICAL if status == "FALSIFIED" else CritiqueSeverity.WARNING,
                    "target_stages": ["STAGE_A", "STAGE_C"],
                    "cross_stage_claims": [
                        CrossStageClaimExcerpt(
                            stage="STAGE_A",
                            claim_title=f"Core Assumption: {stmt[:40]}...",
                            excerpt=f"Status: {status}, Risk Level: {risk}"
                        )
                    ],
                    "fatal_flaw_summary": f"Unmitigated high-risk assumption in problem thesis: '{stmt}' is {status}.",
                    "kill_question": f"If the premise '{stmt}' is falsified or unverified, what core value proposition of the system remains defensible?",
                    "mitigation_recommendation": "Design an empirical validation experiment or re-frame the Stage A problem boundary to remove reliance on this falsified assumption.",
                    "plausibility_score": 82.0,
                    "status": CritiqueStatus.OPEN,
                    "is_degraded": True,
                })

        # -------------------------------------------------------------
        # Rule 4: CROSS_STAGE_BLIND_SPOT (Stage D vs Stage E)
        # -------------------------------------------------------------
        artifacts = telemetry.get("artifacts", [])
        circumscriptions = telemetry.get("circumscriptions", [])
        gate_reviews = telemetry.get("gate_reviews", [])
        if artifacts and len(circumscriptions) == 0 and len(gate_reviews) == 0:
            art_names = [art.get("name", "Artifact") for art in artifacts[:2]]
            critiques.append({
                "session_id": session_id,
                "project_id": proj_id,
                "critique_type": CritiqueType.CROSS_STAGE_BLIND_SPOT,
                "severity": CritiqueSeverity.WARNING,
                "target_stages": ["STAGE_D", "STAGE_E"],
                "cross_stage_claims": [
                    CrossStageClaimExcerpt(
                        stage="STAGE_D",
                        claim_title="DSR Artifact Proposed",
                        excerpt=f"Artifact(s) specified: {', '.join(art_names)}"
                    ),
                    CrossStageClaimExcerpt(
                        stage="STAGE_E",
                        claim_title="Stage E Empirical Testing",
                        excerpt="Zero circumscription iterations or gate review evaluations recorded."
                    )
                ],
                "fatal_flaw_summary": "DSR Artifact is conceptualized in Stage D without empirical testing or circumscription in Stage E.",
                "kill_question": "What empirical measurements confirm this architectural design functions under real-world constraints prior to proposal defense?",
                "mitigation_recommendation": "Execute at least one circumscription benchmark run in Stage E to gather quantitative performance telemetry.",
                "plausibility_score": 80.0,
                "status": CritiqueStatus.OPEN,
                "is_degraded": True,
            })

        return critiques

    async def evaluate_critique(
        self, request: CritiqueEvaluationRequest
    ) -> CritiqueEvaluationResponse:
        """
        Executes cross-stage critique evaluation:
        1. Gathers relational data across Stages A, C, D, E, F.
        2. Generates heuristic rule-based critiques.
        3. Invokes adversarial AI critique if requested (with fallback to heuristic).
        4. Calculates deterministic consistency score.
        5. Persists critiques in Table 36 (`research_critiques`).
        """
        telemetry = self._collect_stage_telemetry(
            session_id=request.session_id,
            project_id=request.project_id,
            problem_id=request.problem_id
        )

        heuristic_critiques = self._generate_heuristic_critiques(request.session_id, telemetry)
        ai_critiques: List[Dict[str, Any]] = []
        is_degraded = not request.include_ai_advisory

        if request.include_ai_advisory:
            try:
                system_instruction = (
                    "You are the CONVERA Lead Research Critique & Devil's Advocate Engine. "
                    "Your role is to conduct a ruthless, adversarial examination of a Design Science Research (DSR) thesis across all 6 stages. "
                    "Look for cross-stage tensions, hidden assumptions, unsupported claims, failure mode neglect, and compliance discord. "
                    "DO NOT BE AGREEABLE OR SYCOPHANTIC. Uncover fatal blind spots that would humiliate the researcher during oral committee defense.\n\n"
                    "Output a strict JSON array of critique objects with format:\n"
                    "[\n"
                    "  {\n"
                    "    \"critique_type\": \"CROSS_STAGE_BLIND_SPOT | EVIDENCE_VULNERABILITY | CIRCUMSCRIPTION_TENSION | ETHICS_FEASIBILITY_DISCORD\",\n"
                    "    \"severity\": \"FATAL | CRITICAL | WARNING | ADVISORY\",\n"
                    "    \"target_stages\": [\"STAGE_C\", \"STAGE_D\"],\n"
                    "    \"cross_stage_claims\": [\n"
                    "      {\"stage\": \"STAGE_C\", \"claim_title\": \"Literature limitation\", \"excerpt\": \"Verbatim finding\"},\n"
                    "      {\"stage\": \"STAGE_D\", \"claim_title\": \"Artifact architecture\", \"excerpt\": \"Proposed design\"}\n"
                    "    ],\n"
                    "    \"fatal_flaw_summary\": \"Short punchy summary of why this is a fatal vulnerability\",\n"
                    "    \"kill_question\": \"Lethal defense question targeting the blind spot\",\n"
                    "    \"mitigation_recommendation\": \"Specific operational action to resolve tension\",\n"
                    "    \"plausibility_score\": 85.0\n"
                    "  }\n"
                    "]"
                )

                prob = telemetry.get("problem") or {}
                prob_summary = f"Title: {prob.get('title') or prob.get('problem_statement', 'N/A')}\nSector: {prob.get('sector', 'N/A')}"
                claims_summary = "\n".join([f"- Claim: {c.get('claim_text')} (Type: {c.get('claim_type')})" for c in telemetry.get("claims", [])[:5]]) or "No claims"
                assumptions_summary = "\n".join([f"- Assumption: {a.get('statement')} (Risk: {a.get('risk_level')}, Status: {a.get('status')})" for a in telemetry.get("assumptions", [])[:5]]) or "No assumptions"
                artifacts_summary = "\n".join([f"- Artifact: {art.get('name')} (Class: {art.get('dsr_class')}): {art.get('description', '')[:100]}" for art in telemetry.get("artifacts", [])[:3]]) or "No artifacts"
                circum_summary = "\n".join([f"- Circumscription Iteration #{c.get('iteration_number')}: {c.get('failure_mode')} (Obs: {c.get('observed_value')}, Tgt: {c.get('target_value')})" for c in telemetry.get("circumscriptions", [])[:3]]) or "No circumscription loops"
                feas = telemetry.get("feasibility") or {}
                feas_summary = f"Feasibility Score: {feas.get('feasibility_score', 'N/A')}%, Compliance Passed: {feas.get('compliance_passed', False)}"

                prompt = (
                    f"CONDUCT CROSS-STAGE ADVERSARIAL CRITIQUE ON THIS DSR THESIS:\n\n"
                    f"STAGE A (Problem Anchor):\n{prob_summary}\nClaims:\n{claims_summary}\nAssumptions:\n{assumptions_summary}\n\n"
                    f"STAGE D (Design Science Artifact):\n{artifacts_summary}\n\n"
                    f"STAGE E (Circumscription & Empirical Evaluation):\n{circum_summary}\n\n"
                    f"STAGE F (Feasibility & Ethics Canvas):\n{feas_summary}\n\n"
                    f"Output strict JSON array only."
                )

                gateway_resp = await generate_with_meta(
                    system_instruction=system_instruction,
                    prompt=prompt,
                    task_category=TaskCategory.ADVERSARIAL_CRITIQUE,
                )

                if gateway_resp and gateway_resp.content:
                    cleaned = gateway_resp.content.strip()
                    if cleaned.startswith("```"):
                        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
                        cleaned = re.sub(r"\n```$", "", cleaned)
                    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
                    if match:
                        raw_json = json.loads(match.group(0))
                        if isinstance(raw_json, list):
                            for item in raw_json:
                                claims_list = []
                                for csc in item.get("cross_stage_claims", []):
                                    if isinstance(csc, dict):
                                        claims_list.append(CrossStageClaimExcerpt(
                                            stage=csc.get("stage", "STAGE_D"),
                                            claim_title=csc.get("claim_title", "Claim"),
                                            excerpt=csc.get("excerpt", "")
                                        ))
                                ai_critiques.append({
                                    "session_id": request.session_id,
                                    "project_id": telemetry.get("project_id"),
                                    "critique_type": item.get("critique_type", CritiqueType.CROSS_STAGE_BLIND_SPOT),
                                    "severity": item.get("severity", CritiqueSeverity.WARNING),
                                    "target_stages": item.get("target_stages", ["STAGE_D"]),
                                    "cross_stage_claims": claims_list,
                                    "fatal_flaw_summary": item.get("fatal_flaw_summary", "Unreconciled cross-stage tension."),
                                    "kill_question": item.get("kill_question", "How can this design be defended without empirical justification?"),
                                    "mitigation_recommendation": item.get("mitigation_recommendation", "Refactor the design and provide validation telemetry."),
                                    "plausibility_score": float(item.get("plausibility_score", 70.0)),
                                    "status": CritiqueStatus.OPEN,
                                    "is_degraded": gateway_resp.is_degraded,
                                })
                            is_degraded = gateway_resp.is_degraded
                else:
                    is_degraded = True
            except Exception as e:
                logger.warning(f"AI adversarial critique failed; utilizing heuristic fallback: {e}")
                is_degraded = True

        # Combine heuristic and AI critiques, avoiding near-duplicate flaw summaries
        combined_raw: List[Dict[str, Any]] = list(heuristic_critiques)
        seen_flaws = {c["fatal_flaw_summary"].lower()[:40] for c in combined_raw}
        for ac in ai_critiques:
            flaw_key = ac["fatal_flaw_summary"].lower()[:40]
            if flaw_key not in seen_flaws:
                combined_raw.append(ac)
                seen_flaws.add(flaw_key)

        # Query existing critiques in storage to preserve resolved / dismissed status and IDs
        existing_critiques = self.storage.list_critique_records(session_id=request.session_id)
        existing_by_flaw = {c["fatal_flaw_summary"].lower()[:40]: c for c in existing_critiques}

        persisted_critiques: List[CrossStageCritiqueRecord] = []
        now_str = datetime.now(timezone.utc).isoformat()

        for c_dict in combined_raw:
            flaw_key = c_dict["fatal_flaw_summary"].lower()[:40]
            if flaw_key in existing_by_flaw:
                # Retain existing ID, status, and resolution_notes
                prev = existing_by_flaw[flaw_key]
                c_dict["id"] = prev["id"]
                c_dict["status"] = prev["status"]
                c_dict["resolution_notes"] = prev.get("resolution_notes")
                c_dict["created_at"] = prev.get("created_at") or now_str
                c_dict["resolved_at"] = prev.get("resolved_at")
            else:
                c_dict["id"] = f"CRIT-{uuid.uuid4().hex[:12].upper()}"
                c_dict["created_at"] = now_str
                c_dict["status"] = CritiqueStatus.OPEN

            # Convert claims to dict if Pydantic model
            serializable_claims = [
                c.model_dump() if hasattr(c, "model_dump") else c
                for c in c_dict.get("cross_stage_claims", [])
            ]
            c_dict["cross_stage_claims"] = serializable_claims

            saved = self.storage.save_critique_record(c_dict)
            persisted_critiques.append(CrossStageCritiqueRecord(**saved))

        # Include any existing resolved/dismissed records that might not have been re-triggered
        for prev in existing_critiques:
            if prev["id"] not in {pc.id for pc in persisted_critiques}:
                persisted_critiques.append(CrossStageCritiqueRecord(**prev))

        scores = self.calculate_consistency_score(persisted_critiques)

        return CritiqueEvaluationResponse(
            session_id=request.session_id,
            project_id=telemetry.get("project_id"),
            consistency_score=scores["consistency_score"],
            total_critiques=scores["total_critiques"],
            open_critiques=scores["open_critiques"],
            fatal_count=scores["fatal_count"],
            critical_count=scores["critical_count"],
            warning_count=scores["warning_count"],
            advisory_count=scores["advisory_count"],
            critiques=persisted_critiques,
            evaluated_at=now_str,
            is_degraded=is_degraded,
        )

    def resolve_critique(self, request: ResolveCritiqueRequest) -> CrossStageCritiqueRecord:
        """
        Updates critique status with mandatory human rationale (INV-019-03).
        """
        updated = self.storage.update_critique_status(
            critique_id=request.critique_id,
            status=request.status.value,
            resolution_notes=request.resolution_notes
        )
        if not updated:
            raise ValueError(f"Critique record {request.critique_id} not found.")
        return CrossStageCritiqueRecord(**updated)
