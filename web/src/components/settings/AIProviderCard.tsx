"use client";

import React, { useState } from "react";
import {
  Server,
  Cloud,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Check,
} from "lucide-react";
import { AIProviderConfig, AIProviderUpsertPayload, ConnectivityTestResult } from "@/lib/types";
import { settingsService } from "@/services/settingsService";

interface AIProviderCardProps {
  provider: AIProviderConfig;
  onUpdate: () => void;
  onDelete?: (providerName: string) => void;
  isDraggable?: boolean;
}

export const AIProviderCard: React.FC<AIProviderCardProps> = ({
  provider,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [modelName, setModelName] = useState(provider.model_name || "");
  const [baseUrl, setBaseUrl] = useState(provider.base_url || "");
  const [priority, setPriority] = useState<number>(provider.priority || 10);
  const [isEnabled, setIsEnabled] = useState<boolean>(Boolean(provider.is_enabled));

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectivityTestResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocal = provider.provider_type === "LOCAL";
  const isCloudFree = provider.provider_type === "CLOUD_FREE";

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    try {
      const override: { api_key?: string; base_url?: string; model_name?: string } = {};
      if (apiKey) override.api_key = apiKey;
      if (baseUrl) override.base_url = baseUrl;
      if (modelName) override.model_name = modelName;

      const res = await settingsService.testConnectivity(provider.provider_name, override);
      setTestResult(res.test_result);
    } catch (err: any) {
      setTestResult({
        provider: provider.provider_name,
        success: false,
        message: err.message || "Failed to reach provider endpoint.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload: AIProviderUpsertPayload = {
        provider_name: provider.provider_name,
        display_name: provider.display_name,
        provider_type: provider.provider_type,
        model_name: modelName,
        base_url: baseUrl,
        priority: priority,
        is_enabled: isEnabled,
      };

      if (apiKey.trim()) {
        payload.api_key = apiKey.trim();
      }

      await settingsService.upsertAIProvider(payload);
      setSaveSuccess(true);
      setIsEditing(false);
      setApiKey("");
      onUpdate();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update provider settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isEnabled
          ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20"
          : "bg-slate-950/60 border-slate-800/60 opacity-70"
      } p-5 backdrop-blur-xl relative overflow-hidden`}
    >
      {/* Top Banner & Health Indicator */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isLocal
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isCloudFree
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-purple-500/10 border-purple-500/30 text-purple-400"
            }`}
          >
            {isLocal ? <Server className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-base">{provider.display_name}</h3>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isLocal
                    ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-300"
                    : isCloudFree
                    ? "bg-indigo-950/60 border-indigo-700/50 text-indigo-300"
                    : "bg-purple-950/60 border-purple-700/50 text-purple-300"
                }`}
              >
                {provider.provider_type.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{provider.model_name || "No model configured"}</p>
          </div>
        </div>

        {/* Priority Badge & Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className="text-slate-400">Cascade Priority:</span>
            <span className="font-bold text-indigo-400">#{provider.priority}</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              onChange={(e) => {
                setIsEnabled(e.target.checked);
                settingsService
                  .upsertAIProvider({
                    provider_name: provider.provider_name,
                    is_enabled: e.target.checked,
                  })
                  .then(() => onUpdate());
              }}
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Status & Credential Info Pill */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          {/* Health status */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                testResult?.success || provider.last_health_status === "HEALTHY"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : testResult && !testResult.success
                  ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-slate-400">
              {testResult?.success
                ? `Operational (${testResult.latency_ms || 120}ms)`
                : testResult && !testResult.success
                ? "Connectivity Failure"
                : provider.last_health_status || "Untested"}
            </span>
          </div>

          {/* Key status */}
          {!isLocal && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {provider.has_api_key ? (
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Vault Encrypted
                  </span>
                ) : (
                  <span className="text-amber-400">No Key Provided</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition text-xs font-medium"
          >
            {testing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            )}
            Test Probe
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition text-xs font-medium"
          >
            {isEditing ? "Close" : "Configure"}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(provider.provider_name)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete Provider"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Test result message if available */}
      {testResult && (
        <div
          className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            testResult.success
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/30 text-rose-300"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{testResult.success ? "Probe Successful" : "Probe Failed"}</p>
            <p className="mt-0.5 text-slate-300">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Save Success Flash */}
      {saveSuccess && (
        <div className="mt-3 p-2.5 rounded-xl border bg-emerald-950/40 border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Provider configuration successfully encrypted and stored.</span>
        </div>
      )}

      {/* Configuration Drawer */}
      {isEditing && (
        <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-slate-800 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl border bg-rose-950/30 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Model Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Model Identifier</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={isLocal ? "llama3.2" : "llama-3.3-70b-versatile"}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cascade Priority <span className="text-slate-500">(1 = highest)</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
              />
            </div>

            {/* Base URL (useful for Ollama or custom local server) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={isLocal ? "http://localhost:11434" : "https://api.groq.com/openai/v1"}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
              />
            </div>

            {/* API Key */}
            {!isLocal && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    API Secret Key
                  </label>
                  {provider.has_api_key && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Vault Stored: {provider.masked_key || "••••••••"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      provider.has_api_key
                        ? "Enter new key to replace existing secret"
                        : "Paste secret API key (e.g. gsk_... or sk-or-...)"
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Credentials are encrypted using AES-128-CBC before committing to SQLite.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800/80 text-slate-400 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
