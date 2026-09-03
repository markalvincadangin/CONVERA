"""
Unknowns Map Engine for CONVERA.
Partitions project knowledge into WHAT WE KNOW, WHAT WE THINK, and WHAT WE DON'T KNOW.
Transforms uncertainty into justified empirical direction.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from storage.factory import get_storage

class UnknownsEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def add_unknown_item(
        self,
        project_id: str,
        category: str,
        statement: str,
        risk_level: str = "MEDIUM",
        session_id: Optional[str] = None,
        linked_claim_id: Optional[str] = None,
        linked_assumption_id: Optional[str] = None,
        resolution_test_id: Optional[str] = None
    ) -> Dict[str, Any]:
        valid_cats = {"WHAT_WE_KNOW", "WHAT_WE_THINK", "WHAT_WE_DONT_KNOW"}
        cat = category.upper() if category.upper() in valid_cats else "WHAT_WE_DONT_KNOW"

        record = {
            "project_id": project_id,
            "session_id": session_id,
            "category": cat,
            "statement": statement,
            "risk_level": risk_level.upper(),
            "linked_claim_id": linked_claim_id,
            "linked_assumption_id": linked_assumption_id,
            "resolution_test_id": resolution_test_id,
            "is_resolved": False
        }
        return self.storage.add_unknown(record)

    def generate_project_unknowns_map(self, project_id: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        items = self.storage.list_unknowns(project_id=project_id, session_id=session_id)

        what_we_know = [i for i in items if i["category"] == "WHAT_WE_KNOW"]
        what_we_think = [i for i in items if i["category"] == "WHAT_WE_THINK"]
        what_we_dont_know = [i for i in items if i["category"] == "WHAT_WE_DONT_KNOW"]

        # Also auto-populate from unvalidated assumptions if not already mapped
        # Assumptions without passed validation tests automatically qualify as WHAT_WE_THINK
        assumptions = self.storage.list_assumptions()
        for a in assumptions:
            stmt = a.get("assumption_statement", "")
            if a.get("validation_status") == "FALSIFIED":
                # High risk contradiction
                if not any(i["statement"] == stmt for i in items):
                    what_we_dont_know.append({
                        "id": f"unk_auto_{a.get('id')}",
                        "category": "WHAT_WE_DONT_KNOW",
                        "statement": f"[FALSIFIED ASSUMPTION] {stmt}",
                        "risk_level": "CRITICAL",
                        "linked_assumption_id": a.get("id"),
                        "is_resolved": False
                    })
            elif a.get("validation_status") == "VALIDATED":
                if not any(i["statement"] == stmt for i in items):
                    what_we_know.append({
                        "id": f"unk_auto_{a.get('id')}",
                        "category": "WHAT_WE_KNOW",
                        "statement": f"[VALIDATED] {stmt}",
                        "risk_level": "LOW",
                        "linked_assumption_id": a.get("id"),
                        "is_resolved": True
                    })

        return {
            "project_id": project_id,
            "summary": {
                "what_we_know_count": len(what_we_know),
                "what_we_think_count": len(what_we_think),
                "what_we_dont_know_count": len(what_we_dont_know),
                "critical_unknowns_count": sum(1 for i in what_we_dont_know if i.get("risk_level") in ("HIGH", "CRITICAL"))
            },
            "what_we_know": what_we_know,
            "what_we_think": what_we_think,
            "what_we_dont_know": what_we_dont_know
        }
