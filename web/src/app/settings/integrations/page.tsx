"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { IntegrationCredentialConfig } from "@/lib/types";
import { integrationService } from "@/services/integrationService";
import { IntegrationCard } from "@/components/settings/IntegrationCard";

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationCredentialConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIntegrations = async () => {
    try {
      const res = await integrationService.listIntegrations();
      setIntegrations(res.integrations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load integrations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadIntegrations();
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <BookOpen className="w-3 h-3" />
                Scholarly Integrations
              </div>
            </div>
          </div>

          {/* Tab Navigation between AI and Tool Integrations */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings/ai"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
            >
              AI Providers
            </Link>
            <Link
              href="/settings/integrations"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition"
            >
              Scholarly Integrations
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Title & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              Scholarly Tool Integrations & Bibliographic Ingestion
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Connect external research instruments to ingest bibliographic libraries, literature notes, web marginalia,
              and verified author profiles with persistent cryptographic provenance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-white transition text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Free-First Governance Banner */}
        <div className="my-6 p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Free-First & 100% Offline Baseline Architecture</p>
              <p className="text-[11px] text-slate-400">
                All integrations are non-blocking. If credentials expire or network fails, CONVERA continues operating seamlessly from local SQLite evidence ledgers.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] uppercase font-mono font-bold text-slate-400 shrink-0">
            CIIA v1.0
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl border bg-rose-950/30 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Integrations Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading research tool connectors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((item) => (
              <IntegrationCard
                key={item.integration_type}
                integration={item}
                onUpdate={loadIntegrations}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
