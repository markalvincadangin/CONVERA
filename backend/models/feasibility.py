"""
CONVERA Research Stage F Feasibility & Proposal Models (SDD-018)
================================================================
Pydantic v2 schemas for ethics compliance (RA 10173, IRB), roadmap alignment (SDGs, DOST-PCIEERD),
resource budgeting, feasibility evaluation, and proposal compilation.
"""

from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class IRBStatus(str, Enum):
    EXEMPT = "EXEMPT"
    EXPEDITED = "EXPEDITED"
    FULL_REVIEW = "FULL_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class EthicsChecklist(BaseModel):
    ra_10173_compliant: bool = Field(True, description="Complies with Data Privacy Act of 2012 (anonymization & consent)")
    consent_protocol_defined: bool = Field(True, description="Informed consent protocol established for human participants")
    irb_status: IRBStatus = Field(IRBStatus.EXEMPT, description="Institutional review committee clearance status")
    data_minimization_enforced: bool = Field(True, description="Only necessary research telemetry collected")
    safety_risks_identified: List[str] = Field(default_factory=list, description="Observed computational safety or dual-use risks")


class SDGMapping(BaseModel):
    sdg_number: int = Field(..., ge=1, le=17, description="UN SDG number (1 to 17)")
    sdg_name: str = Field(..., description="Official SDG title")
    rationale: str = Field(..., description="Direct operational connection to thesis artifact")
    target_indicator: Optional[str] = Field(None, description="Specific target indicator (e.g. 2.4, 9.5)")


class DOSTPriorityMapping(BaseModel):
    sector: str = Field(..., description="DOST-PCIEERD / NICER Priority Sector")
    roadmap_name: str = Field(..., description="e.g. National AI Roadmap (NAIR), Smart Cities, Regional Innovation")
    priority_area: str = Field(..., description="Specific thematic area")
    alignment_notes: str = Field(..., description="How the thesis addresses national priorities")


class BudgetBreakdown(BaseModel):
    hardware_cost: float = Field(0.0, ge=0.0, description="Cost for microcontrollers, sensors, GPUs")
    cloud_cost: float = Field(0.0, ge=0.0, description="Cloud API and hosting credits")
    travel_pilot_cost: float = Field(0.0, ge=0.0, description="Field deployment & travel budget")
    dataset_acquisition_cost: float = Field(0.0, ge=0.0, description="Licensing or access fees")
    currency: str = Field("PHP", description="Currency denomination")
    total: float = Field(0.0, ge=0.0, description="Total budget requirement")


class FeasibilityEvaluationRequest(BaseModel):
    session_id: str
    project_id: str = "default_proj"
    ethics_checklist: EthicsChecklist
    sdg_alignments: List[SDGMapping] = Field(default_factory=list)
    dost_alignments: List[DOSTPriorityMapping] = Field(default_factory=list)
    budget: BudgetBreakdown
    timeline_weeks: int = Field(16, ge=1, le=52)
    include_ai_advisory: bool = True


class FeasibilityRecord(BaseModel):
    id: str
    session_id: str
    project_id: str
    ethics_checklist: EthicsChecklist
    sdg_alignments: List[SDGMapping]
    dost_alignments: List[DOSTPriorityMapping]
    budget: BudgetBreakdown
    timeline_weeks: int
    feasibility_score: float
    compliance_passed: bool
    is_cleared: bool
    advisory_notes: Optional[str] = None
    is_degraded: bool = False
    created_at: str
    updated_at: str


class MentorSignoffRequest(BaseModel):
    project_id: str
    phase_number: int = 6  # Stage F is Phase 6 in numerical mapping
    mentor_name: str
    notes: Optional[str] = ""
    gate_verdict: str = "PASS"


class ProposalCompilationRequest(BaseModel):
    project_id: str = "default_proj"
    session_id: Optional[str] = None
