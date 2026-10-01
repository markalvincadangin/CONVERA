/**
 * CONVERA Ecosystem Integrations & Research Dissemination Types (SDD-023)
 * =======================================================================
 * TypeScript definitions for Notion, Zotero, and GitHub dissemination bridges.
 * Governed by: CONSTITUTION.md Articles I, II, IV, VII, VIII
 */

export type EcosystemProvider = "notion" | "zotero" | "github";

export type SyncActionType =
  | "export_proposal"
  | "import_notes"
  | "export_citations"
  | "export_issues";

export type SyncStatus = "success" | "failed" | "dry_run" | "pending";

export interface NotionExportRequest {
  session_id: string;
  target_page_id?: string | null;
  include_literature_matrix?: boolean;
  dry_run?: boolean;
}

export interface NotionImportRequest {
  session_id: string;
  source_database_id?: string | null;
  sector?: string;
  limit?: number;
}

export interface ZoteroExportRequest {
  session_id: string;
  collection_name?: string | null;
  format?: "bibtex" | "csl_json";
  dry_run?: boolean;
}

export interface GitHubExportRequest {
  session_id: string;
  repository?: string | null;
  milestone_title?: string | null;
  include_srs?: boolean;
  dry_run?: boolean;
}

export interface EcosystemSyncResult {
  sync_id: string;
  session_id: string;
  provider: EcosystemProvider;
  action_type: SyncActionType;
  status: SyncStatus;
  items_count: number;
  state_hash: string;
  preview_content: string;
  external_url?: string | null;
  error_message?: string | null;
  synced_at: string;
}

export interface EcosystemAuditRecord {
  id: string;
  session_id: string;
  provider: string;
  action_type: string;
  status: string;
  target_identifier?: string | null;
  items_count: number;
  state_hash: string;
  external_url?: string | null;
  error_message?: string | null;
  metadata: Record<string, any>;
  synced_at: string;
}

export interface NotionImportResponse {
  sync_id: string;
  session_id: string;
  imported_count: number;
  state_hash: string;
  problems: Array<{
    id: string;
    title: string;
    statement: string;
    url?: string | null;
  }>;
  synced_at: string;
}
