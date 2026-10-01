/**
 * CONVERA Ecosystem Integrations Service (SDD-023)
 * =================================================
 * Client service for Notion, Zotero, and GitHub bi-directional dissemination.
 * Governed by: CONSTITUTION.md (Articles I, II, IV, VII, VIII)
 */

import { fetchApi } from "@/lib/api-client";
import type {
  NotionExportRequest,
  NotionImportRequest,
  NotionImportResponse,
  ZoteroExportRequest,
  GitHubExportRequest,
  EcosystemSyncResult,
  EcosystemAuditRecord,
} from "@/types/ecosystem";

export * from "@/types/ecosystem";

export const ecosystemService = {
  /**
   * Exports DSR Gate 4 proposal canvas and literature matrix to Notion.
   */
  exportNotion: async (
    request: NotionExportRequest
  ): Promise<EcosystemSyncResult> => {
    return await fetchApi<EcosystemSyncResult>("/api/ecosystem/notion/export", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Ingests notes from Notion workspace/database into CONVERA Problem Bank.
   */
  importNotion: async (
    request: NotionImportRequest
  ): Promise<NotionImportResponse> => {
    return await fetchApi<NotionImportResponse>("/api/ecosystem/notion/import", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Exports session literature as formatted BibTeX or CSL-JSON reference bundle.
   */
  exportZotero: async (
    request: ZoteroExportRequest
  ): Promise<EcosystemSyncResult> => {
    return await fetchApi<EcosystemSyncResult>("/api/ecosystem/zotero/export", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Translates DSR artifacts and SRS specifications into GitHub Issue batch manifests.
   */
  exportGitHub: async (
    request: GitHubExportRequest
  ): Promise<EcosystemSyncResult> => {
    return await fetchApi<EcosystemSyncResult>("/api/ecosystem/github/export", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Retrieves chronological ecosystem sync audit trail with SHA-256 state hashes.
   */
  getAuditTrail: async (
    sessionId: string
  ): Promise<EcosystemAuditRecord[]> => {
    return await fetchApi<EcosystemAuditRecord[]>(
      `/api/ecosystem/audit-trail/${sessionId}`
    );
  },

  /**
   * Utility for local client-side file download of raw preview content (Article VIII).
   */
  downloadPayload: (filename: string, content: string, mimeType: string = "text/plain") => {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
