import { fetchApi } from "@/lib/api-client";
import { IntegrationCredentialConfig } from "@/lib/types";

export interface IntegrationUpsertPayload {
  integration_type: string;
  display_name?: string;
  api_key?: string;
  user_identifier?: string;
  workspace_id?: string;
  is_enabled?: boolean;
  config?: Record<string, any>;
}

export interface SyncResult {
  status: string;
  synced_count: number;
  duration_ms: number;
  last_sync_at: string;
  items: any[];
}

export interface SyncLogItem {
  id: number;
  integration_id: string;
  sync_type: string;
  direction: string;
  items_processed: number;
  items_created: number;
  items_updated: number;
  items_failed: number;
  duration_ms: number;
  error_message?: string;
  created_at: string;
}

export const integrationService = {
  /**
   * List all available and configured scholarly integrations for the workspace.
   */
  async listIntegrations(workspaceId?: string): Promise<{ integrations: IntegrationCredentialConfig[]; workspace_id: string }> {
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchApi(`/api/settings/integrations${query}`);
  },

  /**
   * Save or update integration configuration with encrypted credentials.
   */
  async upsertIntegration(payload: IntegrationUpsertPayload): Promise<{ status: string; integration: IntegrationCredentialConfig }> {
    return fetchApi("/api/settings/integrations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete integration credentials and configuration.
   */
  async deleteIntegration(integrationType: string): Promise<{ status: string; deleted: boolean }> {
    return fetchApi(`/api/settings/integrations/${encodeURIComponent(integrationType)}`, {
      method: "DELETE",
    });
  },

  /**
   * Test live connectivity to the external service.
   */
  async testConnectivity(
    integrationType: string,
    override?: { api_key?: string; user_identifier?: string; config?: Record<string, any> }
  ): Promise<{ status: string; test_result: { status: string; connected: boolean; latency_ms: number; message: string } }> {
    return fetchApi(`/api/settings/integrations/${encodeURIComponent(integrationType)}/test`, {
      method: "POST",
      body: JSON.stringify(override || {}),
    });
  },

  /**
   * Trigger immediate inbound synchronization.
   */
  async triggerSync(integrationType: string, workspaceId?: string): Promise<SyncResult> {
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchApi(`/api/settings/integrations/${encodeURIComponent(integrationType)}/sync${query}`, {
      method: "POST",
    });
  },

  /**
   * Retrieve historical synchronization logs.
   */
  async getSyncLogs(integrationType: string): Promise<{ logs: SyncLogItem[] }> {
    return fetchApi(`/api/settings/integrations/${encodeURIComponent(integrationType)}/logs`);
  },
};
