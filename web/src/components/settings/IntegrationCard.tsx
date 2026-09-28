"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Highlighter,
  Award,
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
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IntegrationCredentialConfig } from "@/lib/types";
import { integrationService, SyncLogItem } from "@/services/integrationService";

interface IntegrationCardProps {
  integration: IntegrationCredentialConfig;
  onUpdate: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState(integration.user_identifier || "");
  const [extraConfig, setExtraConfig] = useState<string>(
    JSON.stringify(integration.metadata || {}, null, 2)
  );

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; connected: boolean; latency_ms: number; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced_count: number; message?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SyncLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const type = integration.integration_type.toLowerCase();

  const getIcon = () => {
    switch (type) {
      case "zotero":
        return <BookOpen className="w-5 h-5 text-rose-400" />;
      case "notion":
        return <FileText className="w-5 h-5 text-slate-300" />;
      case "hypothesis":
        return <Highlighter className="w-5 h-5 text-amber-400" />;
      case "orcid":
        return <Award className="w-5 h-5 text-emerald-400" />;
      default:
        return <Zap className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "zotero":
        return "bg-rose-500/10 border-rose-500/20 text-rose-300";
      case "notion":
        return "bg-slate-500/10 border-slate-500/20 text-slate-300";
      case "hypothesis":
        return "bg-amber-500/10 border-amber-500/20 text-amber-300";
      case "orcid":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
      default:
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-300";
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    try {
      const override: { api_key?: string; user_identifier?: string } = {};
      if (apiKey) override.api_key = apiKey;
      if (userIdentifier) override.user_identifier = userIdentifier;

      const res = await integrationService.testConnectivity(integration.integration_type, override);
      setTestResult(res.test_result);
    } catch (err: any) {
      setTestResult({
        status: "error",
        connected: false,
        latency_ms: 0,
        message: err.message || "Failed to reach tool endpoint",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const res = await integrationService.triggerSync(integration.integration_type);
      setSyncResult({ synced_count: res.synced_count });
      onUpdate();
      setTimeout(() => setSyncResult(null), 4000);
    } catch (err: any) {
      setError(err.message || "Sync operation failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(extraConfig || "{}");
      } catch (e) {
        // Fallback to empty if invalid JSON
      }

      await integrationService.upsertIntegration({
        integration_type: integration.integration_type,
        display_name: integration.display_name,
        api_key: apiKey.trim() || undefined,
        user_identifier: userIdentifier.trim() || undefined,
        is_enabled: true,
        config: parsedConfig,
      });

      setSaveSuccess(true);
      setIsEditing(false);
      setApiKey("");
      onUpdate();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update integration");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to disconnect ${integration.display_name}?`)) return;
    try {
      await integrationService.deleteIntegration(integration.integration_type);
      onUpdate();
    } catch (err: any) {
      alert(err.message || "Failed to disconnect integration");
    }
  };

  const toggleLogs = async () => {
    if (!showLogs) {
      setLoadingLogs(true);
      try {
        const res = await integrationService.getSyncLogs(integration.integration_type);
        setLogs(res.logs || []);
      } catch (e) {
        // Ignore
      } finally {
        setLoadingLogs(false);
      }
    }
    setShowLogs(!showLogs);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur-xl shadow-lg transition-all">
      {/* Top Row: Icon, Name, Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getBadgeColor()}`}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-base">{integration.display_name}</h3>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  integration.is_configured
                    ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {integration.is_configured ? "Connected" : "Not Configured"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {type === "zotero" && "Synchronize reference libraries, BibTeX citations, and collection tags."}
              {type === "notion" && "Import literature notes and empirical field databases from Notion."}
              {type === "hypothesis" && "Ingest web margin notes, highlight quotes, and PDF marginalia."}
              {type === "orcid" && "Sync validated author records, researcher IDs, and publications."}
            </p>
          </div>
        </div>

        {/* Sync Button & Edit */}
        <div className="flex items-center gap-2">
          {integration.is_configured && (
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-indigo-400" : ""}`} />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
          >
            {isEditing ? "Close" : "Configure"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          {integration.is_configured && (
            <>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {integration.secret_source === "env" ? "Environment Seeded (.env)" : "AES-128-CBC Encrypted"}
                </span>
              </div>

              {integration.last_synced_at && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last synced: {new Date(integration.last_synced_at).toLocaleTimeString()}</span>
                </div>
              )}
            </>
          )}

          {integration.user_identifier && (
            <span className="text-slate-400 font-mono text-[11px]">
              ID: <span className="text-slate-200">{integration.user_identifier}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs transition"
          >
            {testing ? <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" /> : <Zap className="w-3 h-3 text-amber-400" />}
            Test Endpoint
          </button>

          {integration.is_configured && (
            <button
              type="button"
              onClick={toggleLogs}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition"
            >
              Logs {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {integration.is_configured && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Disconnect"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sync Flash Message */}
      {syncResult && (
        <div className="mt-3 p-2.5 rounded-xl border bg-emerald-950/40 border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Synchronized {syncResult.synced_count} items from {integration.display_name}.</span>
        </div>
      )}

      {/* Test Result Message */}
      {testResult && (
        <div
          className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            testResult.connected
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/30 text-rose-300"
          }`}
        >
          {testResult.connected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{testResult.connected ? "Endpoint Accessible" : "Connection Failed"}</p>
            <p className="mt-0.5 text-slate-300">{testResult.message} ({testResult.latency_ms}ms)</p>
          </div>
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
            {/* User Identifier */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {type === "zotero" && "Zotero User / Library ID"}
                {type === "notion" && "Default Database ID (Optional)"}
                {type === "hypothesis" && "Hypothesis Username"}
                {type === "orcid" && "Researcher ORCID (e.g. 0000-0002-1825-0097)"}
              </label>
              <input
                type="text"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                placeholder={
                  type === "zotero"
                    ? "e.g. 1234567"
                    : type === "orcid"
                    ? "0000-0002-1825-0097"
                    : "Identifier..."
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
              />
            </div>

            {/* Secret Token / Key */}
            {type !== "orcid" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    API Secret Key / Token
                  </label>
                  {integration.has_secret && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Stored: {integration.masked_secret || "••••••••"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      integration.has_secret
                        ? "Enter new token to replace existing secret"
                        : "Paste secret API token..."
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Credentials
            </button>
          </div>
        </form>
      )}

      {/* Logs Drawer */}
      {showLogs && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-300">Synchronization History</h4>
          {loadingLogs ? (
            <p className="text-xs text-slate-500">Loading sync events...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-500">No sync events logged yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">{log.sync_type}</span>
                    <span className="text-slate-400">Processed: {log.items_processed}</span>
                    <span className="text-slate-500">({log.duration_ms}ms)</span>
                  </div>
                  <span className="text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
