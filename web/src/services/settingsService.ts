import { fetchApi } from "@/lib/api-client";
import { AIProviderConfig, AIProviderUpsertPayload, ConnectivityTestResult } from "@/lib/types";

export const settingsService = {
  /**
   * List all configured AI providers ordered by priority cascade.
   */
  async listAIProviders(workspaceId?: string): Promise<{ providers: AIProviderConfig[] }> {
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchApi(`/api/settings/ai-providers${query}`);
  },

  /**
   * Retrieve configuration for a specific provider.
   */
  async getAIProvider(providerName: string, workspaceId?: string): Promise<{ provider: AIProviderConfig }> {
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchApi(`/api/settings/ai-providers/${encodeURIComponent(providerName)}${query}`);
  },

  /**
   * Save or update an AI provider with encrypted API key and cascade priority.
   */
  async upsertAIProvider(payload: AIProviderUpsertPayload): Promise<{ status: string; provider: AIProviderConfig }> {
    return fetchApi("/api/settings/ai-providers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete or deactivate an AI provider.
   */
  async deleteAIProvider(providerName: string, workspaceId?: string): Promise<{ status: string }> {
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return fetchApi(`/api/settings/ai-providers/${encodeURIComponent(providerName)}${query}`, {
      method: "DELETE",
    });
  },

  /**
   * Execute real-time connectivity probe against the provider endpoint.
   */
  async testConnectivity(
    providerName: string,
    override?: { api_key?: string; base_url?: string; model_name?: string }
  ): Promise<{ status: string; test_result: ConnectivityTestResult }> {
    return fetchApi(`/api/settings/ai-providers/${encodeURIComponent(providerName)}/test`, {
      method: "POST",
      body: JSON.stringify(override || {}),
    });
  },

  /**
   * Update the priority order of providers in the cascade.
   */
  async reorderCascade(priorityOrder: string[], workspaceId?: string): Promise<{ status: string; providers: AIProviderConfig[] }> {
    return fetchApi("/api/settings/ai-providers/cascade/reorder", {
      method: "POST",
      body: JSON.stringify({ priority_order: priorityOrder, workspace_id: workspaceId }),
    });
  },
};
