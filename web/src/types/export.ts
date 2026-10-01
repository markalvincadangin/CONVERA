/**
 * CONVERA DSR Deliverable & Comprehensive Proposal Export Types (SDD-020)
 * =======================================================================
 * TypeScript type definitions for multi-format proposal compilation:
 * Markdown, LaTeX, BibTeX, Printable HTML, and Provenance JSON.
 */

export type ExportFormat =
  | "MARKDOWN"
  | "LATEX"
  | "BIBTEX"
  | "HTML"
  | "JSON"
  | "BUNDLE";

export type ProposalSection =
  | "COVER_METADATA"
  | "PROBLEM_SCOUTING"
  | "THEORETICAL_GROUNDING"
  | "LITERATURE_MATRIX"
  | "EVALUATION_CIRCUMSCRIPTION"
  | "ETHICS_FEASIBILITY"
  | "GATE_REVIEWS"
  | "CRITIQUE_AUDIT"
  | "BIBLIOGRAPHY";

export interface DSRProposalCompilationRequest {
  project_id?: string;
  session_id?: string | null;
  problem_id?: string | null;
  format?: ExportFormat;
  include_sections?: ProposalSection[];
  target_document_class?: string;
  custom_title?: string;
  author_name?: string;
  institution?: string;
}

export interface DSRProposalCompilationResponse {
  project_id: string;
  session_id?: string | null;
  format: ExportFormat;
  document_title: string;
  content: string;
  auxiliary_files?: Record<string, string>;
  provenance_hash: string;
  section_count: number;
  compiled_at: string;
  is_degraded: boolean;
  markdown_content?: string;
  section_data?: Record<string, any>;
}
