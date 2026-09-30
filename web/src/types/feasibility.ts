/**
 * CONVERA Research Stage F Feasibility & Proposal Canvas Types (SDD-018)
 * =======================================================================
 * TypeScript type definitions for ethics compliance, SDG/DOST alignment,
 * resource budgeting, and living proposal canvas compilation.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

export type IRBStatus =
  | "EXEMPT"
  | "EXPEDITED"
  | "FULL_REVIEW"
  | "NOT_APPLICABLE";

export interface EthicsChecklist {
  ra_10173_compliant: boolean;
  consent_protocol_defined: boolean;
  irb_status: IRBStatus;
  data_minimization_enforced: boolean;
  safety_risks_identified: string[];
}

export interface SDGMapping {
  sdg_number: number;
  sdg_name: string;
  rationale: string;
  target_indicator?: string | null;
}

export interface DOSTPriorityMapping {
  sector: string;
  roadmap_name: string;
  priority_area: string;
  alignment_notes: string;
}

export interface BudgetBreakdown {
  hardware_cost: number;
  cloud_cost: number;
  travel_pilot_cost: number;
  dataset_acquisition_cost: number;
  currency: string;
  total: number;
}

export interface FeasibilityEvaluationRequest {
  session_id: string;
  project_id?: string;
  ethics_checklist: EthicsChecklist;
  sdg_alignments: SDGMapping[];
  dost_alignments: DOSTPriorityMapping[];
  budget: BudgetBreakdown;
  timeline_weeks: number;
  include_ai_advisory?: boolean;
}

export interface FeasibilityRecord {
  id: string;
  session_id: string;
  project_id: string;
  ethics_checklist: EthicsChecklist;
  sdg_alignments: SDGMapping[];
  dost_alignments: DOSTPriorityMapping[];
  budget: BudgetBreakdown;
  timeline_weeks: number;
  feasibility_score: number;
  compliance_passed: boolean;
  is_cleared: boolean;
  advisory_notes?: string | null;
  is_degraded: boolean;
  created_at: string;
  updated_at: string;
}

export interface MentorSignoffRequest {
  project_id: string;
  phase_number?: number;
  mentor_name: string;
  notes?: string;
  gate_verdict?: string;
}

export interface MentorSignoffRecord {
  id?: string | number;
  project_id: string;
  phase_number: number;
  mentor_name: string;
  notes: string;
  created_at: string;
}

export interface ProposalCompilationRequest {
  project_id: string;
  session_id?: string | null;
}

export interface DSRProposalMonograph {
  project_id: string;
  session_id?: string | null;
  document_type: string;
  markdown_content: string;
  section_data: Record<string, any>;
  generated_at: string;
}
