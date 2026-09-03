"""
Provenance Engine for CONVERA.
Tracks source origin, connector type, extraction model, prompt hash, and human verification status.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import hashlib
from storage.factory import get_storage

class ProvenanceEngine:
    def __init__(self, storage=None):
        self.storage = storage or get_storage()

    def record_evidence_provenance(
        self,
        source_id: str,
        connector: str,
        original_identifier: Optional[str] = None,
        extraction_model: Optional[str] = None,
        extraction_prompt: Optional[str] = None,
        human_verified: bool = False
    ) -> Dict[str, Any]:
        prompt_hash = hashlib.sha256(extraction_prompt.encode("utf-8")).hexdigest()[:16] if extraction_prompt else None
        record = {
            "source_id": source_id,
            "connector": connector,
            "original_identifier": original_identifier,
            "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
            "extraction_model": extraction_model,
            "extraction_prompt_hash": prompt_hash,
            "human_verification_state": "VERIFIED_BY_RESEARCHER" if human_verified else "UNVERIFIED"
        }
        return self.storage.record_provenance(record)

    def verify_provenance(self, source_id: str, is_valid: bool = True, notes: str = "") -> Dict[str, Any]:
        existing = self.storage.get_provenance(source_id)
        if not existing:
            existing = {
                "source_id": source_id,
                "connector": "manual_review",
                "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
            }
        existing["human_verification_state"] = "VERIFIED_BY_RESEARCHER" if is_valid else "DISPUTED"
        existing["verification_notes"] = notes
        return self.storage.record_provenance(existing)

    def get_provenance_dossier(self, source_id: str) -> Optional[Dict[str, Any]]:
        return self.storage.get_provenance(source_id)
