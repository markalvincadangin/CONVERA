"""
Contradiction Detection & Contested Claim Engine for CONVERA.
Detects divergent and conflicting evidence across literature/interviews,
transitions claims to CONTESTED, and advises empirical resolution paths.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from storage.factory import get_storage

class ContradictionEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def register_contradiction(
        self,
        claim_id: str,
        supporting_evidence_id: str,
        contradicting_evidence_id: str,
        investigation_notes: str = ""
    ) -> Dict[str, Any]:
        record = {
            "claim_id": claim_id,
            "supporting_evidence_id": supporting_evidence_id,
            "contradicting_evidence_id": contradicting_evidence_id,
            "status": "CONTESTED",
            "investigation_notes": investigation_notes or "Opposing findings identified between supporting and contradicting literature/field data."
        }
        return self.storage.record_contradiction(record)

    def analyze_claim_epistemic_conflict(
        self,
        claim_id: str,
        claim_statement: str,
        supporting_sources: List[Dict[str, Any]],
        contradicting_sources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        support_count = len(supporting_sources)
        contra_count = len(contradicting_sources)

        if contra_count == 0 and support_count > 0:
            status = "SUPPORTED"
            confidence = "HIGH" if support_count >= 2 else "MODERATE"
            action = "Claim is consistently supported by current evidence."
        elif support_count == 0 and contra_count > 0:
            status = "CONTRADICTED"
            confidence = "HIGH" if contra_count >= 2 else "MODERATE"
            action = "Claim is refuted by current evidence. Consider abandoning or reframing."
        elif support_count > 0 and contra_count > 0:
            status = "CONTESTED"
            confidence = "NOT_DETERMINED"
            action = f"CONTESTED EPISTEMIC STATE: {support_count} supporting vs {contra_count} contradicting sources. Immediate primary fieldwork or controlled benchmark required to resolve conflict."
            # Automatically record contradiction if not existing
            for s in supporting_sources:
                for c in contradicting_sources:
                    s_id = s.get("id") or s.get("url") or "sup_src"
                    c_id = c.get("id") or c.get("url") or "contra_src"
                    self.register_contradiction(
                        claim_id=claim_id,
                        supporting_evidence_id=s_id,
                        contradicting_evidence_id=c_id,
                        investigation_notes=f"Conflict on '{claim_statement}': '{s.get('title')}' vs '{c.get('title')}'"
                    )
        else:
            status = "UNKNOWN"
            confidence = "ZERO"
            action = "No empirical evidence attached. Treat strictly as an unvalidated hypothesis."

        return {
            "claim_id": claim_id,
            "claim_statement": claim_statement,
            "status": status,
            "confidence": confidence,
            "support_evidence_count": support_count,
            "contradicting_evidence_count": contra_count,
            "supporting_sources": supporting_sources,
            "contradicting_sources": contradicting_sources,
            "advisory_action": action
        }

    def list_project_contradictions(self, claim_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.storage.list_contradictions(claim_id=claim_id)
