"use client";

import React, { useState } from "react";
import {
  Server,
  Cloud,
  Cpu,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AIProviderConfig, AIProviderType } from "@/lib/types";
import { settingsService } from "@/services/settingsService";

interface OnboardingWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

type OnboardingStep = "CHOOSE_MODE" | "CONFIGURE" | "VERIFY" | "COMPLETED";

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<OnboardingStep>("CHOOSE_MODE");
  const [selectedProvider, setSelectedProvider] = useState<string>("ollama");
  const [providerType, setProviderType] = useState<AIProviderType>("LOCAL");
  const [displayName, setDisplayName] = useState<string>("Local Ollama");
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:11434");
  const [modelName, setModelName] = useState<string>("llama3.2");
  const [apiKey, setApiKey] = useState<string>("");

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectPreset = (provider: string) => {
    setSelectedProvider(provider);
    if (provider === "ollama") {
      setProviderType("LOCAL");
      setDisplayName("Local Ollama Sovereign Engine");
      setBaseUrl("http://localhost:11434");
      setModelName("llama3.2");
    } else if (provider === "groq") {
      setProviderType("CLOUD_FREE");
      setDisplayName("Groq High-Speed Llama");
      setBaseUrl("https://api.groq.com/openai/v1");
      setModelName("llama-3.3-70b-versatile");
    } else if (provider === "openrouter") {
      setProviderType("CLOUD_FREE");
      setDisplayName("OpenRouter Gateway (Free Models)");
      setBaseUrl("https://openrouter.ai/api/v1");
      setModelName("deepseek/deepseek-r1:free");
    } else if (provider === "gemini") {
      setProviderType("CLOUD_FREE");
      setDisplayName("Google Gemini API");
      setBaseUrl("https://generativelanguage.googleapis.com/v1beta");
      setModelName("gemini-2.0-flash");
    }
  };

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      // 1. Probe connectivity
      const override: { api_key?: string; base_url?: string; model_name?: string } = {
        base_url: baseUrl,
        model_name: modelName,
      };
      if (apiKey.trim()) override.api_key = apiKey.trim();

      const probeRes = await settingsService.testConnectivity(selectedProvider, override);
      setTestResult(probeRes.test_result);

      if (probeRes.test_result.success) {
        // 2. Persist
        setSaving(true);
        await settingsService.upsertAIProvider({
          provider_name: selectedProvider,
          display_name: displayName,
          provider_type: providerType,
          base_url: baseUrl,
          model_name: modelName,
          api_key: apiKey.trim() || undefined,
          priority: 1,
          is_enabled: true,
        });
        setStep("COMPLETED");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach AI provider.");
      setTestResult({
        success: false,
        message: err.message || "Connectivity test failed.",
      });
    } finally {
      setTesting(false);
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-indigo-950/20 max-w-2xl mx-auto">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">AI Engine Setup Wizard</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure your offline-first synthesis engine or connect zero-cost cloud providers.
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {step === "CHOOSE_MODE" && "Step 1 of 3"}
          {step === "CONFIGURE" && "Step 2 of 3"}
          {step === "VERIFY" && "Step 3 of 3"}
          {step === "COMPLETED" && "Done"}
        </span>
      </div>

      {/* Step 1: Mode Selection */}
      {step === "CHOOSE_MODE" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-300 font-medium">Select your preferred default intelligence provider:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Ollama */}
            <div
              onClick={() => selectPreset("ollama")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedProvider === "ollama"
                  ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  100% Offline
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mt-3">Local Ollama</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero data leaves your machine. Perfect for classified or sovereign research.
              </p>
            </div>

            {/* Groq Cloud Free */}
            <div
              onClick={() => selectPreset("groq")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedProvider === "groq"
                  ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
                  Free Tier
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mt-3">Groq Llama 3.3</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sub-second response speeds with generous zero-cost rate limits.
              </p>
            </div>

            {/* OpenRouter */}
            <div
              onClick={() => selectPreset("openrouter")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedProvider === "openrouter"
                  ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                  Multi-Model
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mt-3">OpenRouter Gateway</h4>
              <p className="text-xs text-slate-400 mt-1">
                Access DeepSeek R1, Mistral, and Claude via unified OpenRouter endpoint.
              </p>
            </div>

            {/* Google Gemini */}
            <div
              onClick={() => selectPreset("gemini")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedProvider === "gemini"
                  ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/40"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                  Fast Synthesis
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mt-3">Google Gemini</h4>
              <p className="text-xs text-slate-400 mt-1">
                High-context window with 15 RPM free tier via Google AI Studio API.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Skip for now
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={() => setStep("CONFIGURE")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              Continue Configuration
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configuration & Credentials */}
      {step === "CONFIGURE" && (
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Provider Display Label</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Base Endpoint URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Model Name</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
              />
            </div>

            {providerType !== "LOCAL" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  API Secret Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your secret key here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Encrypted at rest with AES-128-CBC inside CONVERA's local Credential Vault.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl border bg-rose-950/30 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep("CHOOSE_MODE")}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              disabled={testing || saving}
              onClick={handleTestAndSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {testing || saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Probing Connection...
                </>
              ) : (
                <>
                  Test & Activate Engine
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Completed */}
      {step === "COMPLETED" && (
        <div className="mt-6 text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{displayName} Activated</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your AI provider is verified, encrypted, and registered at Priority #1 in the runtime cascade.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              Return to Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
