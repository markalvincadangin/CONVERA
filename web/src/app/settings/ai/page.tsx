"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Server,
  Cloud,
  ShieldCheck,
  Plus,
  RefreshCw,
  Sliders,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import { AIProviderConfig, AIProviderType } from "@/lib/types";
import { settingsService } from "@/services/settingsService";
import { AIProviderCard } from "@/components/settings/AIProviderCard";
import { OnboardingWizard } from "@/components/settings/OnboardingWizard";

export default function AISettingsPage() {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Custom Provider Form State
  const [newProviderName, setNewProviderName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newProviderType, setNewProviderType] = useState<AIProviderType>("CLOUD_FREE");
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newPriority, setNewPriority] = useState(10);
  const [adding, setAdding] = useState(false);

  const loadProviders = async () => {
    try {
      const res = await settingsService.listAIProviders();
      setProviders(res.providers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load AI providers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProviders();
  };

  const handleDeleteProvider = async (providerName: string) => {
    if (!confirm(`Are you sure you want to remove ${providerName}?`)) return;
    try {
      await settingsService.deleteAIProvider(providerName);
      loadProviders();
    } catch (err: any) {
      alert(err.message || "Failed to delete provider");
    }
  };

  const handleAddCustomProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProviderName.trim() || !newModelName.trim()) {
      alert("Provider identifier and model name are required.");
      return;
    }
    setAdding(true);
    try {
      await settingsService.upsertAIProvider({
        provider_name: newProviderName.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
        display_name: newDisplayName.trim() || newProviderName.trim(),
        provider_type: newProviderType,
        base_url: newBaseUrl.trim() || undefined,
        model_name: newModelName.trim(),
        api_key: newApiKey.trim() || undefined,
        priority: newPriority,
        is_enabled: true,
      });
      setShowAddModal(false);
      // Reset form
      setNewProviderName("");
      setNewDisplayName("");
      setNewBaseUrl("");
      setNewModelName("");
      setNewApiKey("");
      setNewPriority(10);
      loadProviders();
    } catch (err: any) {
      alert(err.message || "Failed to register custom AI provider");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Return to Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-tight">CONVERA Settings</span>
              <span className="text-slate-600">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                AI Cascade
              </div>
            </div>
          </div>

          {/* Tab Navigation between AI and Tool Integrations */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings/ai"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition"
            >
              AI Providers
            </Link>
            <Link
              href="/settings/integrations"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
            >
              Scholarly Integrations
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              AI Intelligence & Provider Cascade
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              CONVERA routes synthesis and circumscription tasks across configured providers in cascade order.
              All credentials are encrypted with AES-128-CBC inside the local SQLite Credential Vault.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white transition text-xs"
              title="Refresh Providers"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Setup Wizard
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Provider
            </button>
          </div>
        </div>

        {/* Cascade Visual Pipeline Banner */}
        <div className="my-6 p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Layers className="w-4 h-4 text-indigo-400" />
              Active Cascade Pipeline (Lowest Priority Number Executes First)
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Downtime Fallback Active
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {providers.length === 0 ? (
              <span className="text-xs text-slate-500">No active providers configured.</span>
            ) : (
              providers
                .filter((p) => p.is_enabled)
                .sort((a, b) => a.priority - b.priority)
                .map((p, idx) => (
                  <React.Fragment key={p.provider_name}>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 font-semibold">{p.display_name}</span>
                      <span className="text-slate-500">({p.model_name})</span>
                    </div>
                    {idx < providers.filter((x) => x.is_enabled).length - 1 && (
                      <span className="text-slate-600 text-xs font-bold">➔</span>
                    )}
                  </React.Fragment>
                ))
            )}
          </div>
        </div>

        {/* Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <OnboardingWizard
                onComplete={() => {
                  setShowWizard(false);
                  loadProviders();
                }}
                onCancel={() => setShowWizard(false)}
              />
            </div>
          </div>
        )}

        {/* Add Provider Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Custom AI Provider
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Register an OpenAI-compatible endpoint or custom cloud model.
              </p>

              <form onSubmit={handleAddCustomProvider} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Provider ID</label>
                  <input
                    type="text"
                    required
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                    placeholder="e.g. mistral, deepseek, or custom_llm"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="e.g. Mistral Large AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                    <select
                      value={newProviderType}
                      onChange={(e) => setNewProviderType(e.target.value as AIProviderType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    >
                      <option value="CLOUD_FREE">Cloud Free</option>
                      <option value="LOCAL">Local / Self-Hosted</option>
                      <option value="CLOUD_PAID">Cloud Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPriority}
                      onChange={(e) => setNewPriority(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Base Endpoint URL</label>
                  <input
                    type="text"
                    value={newBaseUrl}
                    onChange={(e) => setNewBaseUrl(e.target.value)}
                    placeholder="https://api.mistral.ai/v1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="mistral-large-latest"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">API Key</label>
                  <input
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Paste secret key..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition"
                  >
                    {adding ? "Saving..." : "Add Provider"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Provider Cards List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading AI provider configuration...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-3xl p-8 bg-slate-900/30">
            <Server className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No Providers Configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              Get started by launching the setup wizard to connect Ollama or configure a free cloud API key.
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              Launch Setup Wizard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {providers.map((p) => (
              <AIProviderCard
                key={p.provider_name}
                provider={p}
                onUpdate={loadProviders}
                onDelete={handleDeleteProvider}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
