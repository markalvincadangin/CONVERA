"use client";

import React, { useState, useEffect } from "react";
import { unknownsApi, UnknownsMapReport, UnknownItem } from "@/services/knowledgeService";

interface UnknownsMapProps {
  projectId?: string;
  sessionId?: string;
}

export const UnknownsMap: React.FC<UnknownsMapProps> = ({ projectId = "default_proj", sessionId }) => {
  const [data, setData] = useState<UnknownsMapReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newStatement, setNewStatement] = useState<string>("");
  const [newCategory, setNewCategory] = useState<"WHAT_WE_KNOW" | "WHAT_WE_THINK" | "WHAT_WE_DONT_KNOW">("WHAT_WE_THINK");
  const [newRisk, setNewRisk] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");

  const loadMap = async () => {
    try {
      setLoading(true);
      const res = await unknownsApi.getMap(projectId);
      setData(res);
    } catch (err) {
      console.error("Failed to load unknowns map:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMap();
  }, [projectId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim()) return;
    try {
      await unknownsApi.add({
        project_id: projectId,
        session_id: sessionId,
        category: newCategory,
        statement: newStatement.trim(),
        risk_level: newRisk,
      });
      setNewStatement("");
      setShowAddModal(false);
      loadMap();
    } catch (err) {
      console.error("Failed to add unknown item:", err);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse";
      case "HIGH":
        return "bg-amber-950/80 text-amber-300 border-amber-800";
      case "MEDIUM":
        return "bg-sky-950/80 text-sky-300 border-sky-800";
      default:
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-6 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-lg font-bold text-slate-100 tracking-wide">
              CONVERA Dynamic Unknowns Map
            </h3>
            <span className="rounded-full bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              Epistemic Triangulation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Separating verified facts, active working hypotheses, and critical unmeasured risks to turn uncertainty into justified direction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-900/40 transition-all active:scale-95"
          >
            + Add Unknown / Hypothesis
          </button>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">What We Know</div>
          <div className="text-2xl font-black text-emerald-200 mt-1">{data?.summary.what_we_know_count || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified evidence & facts</div>
        </div>
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3">
          <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">What We Think</div>
          <div className="text-2xl font-black text-amber-200 mt-1">{data?.summary.what_we_think_count || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hypotheses & assumptions</div>
        </div>
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3">
          <div className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider">What We Don't Know</div>
          <div className="text-2xl font-black text-cyan-200 mt-1">{data?.summary.what_we_dont_know_count || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Unexplored variables</div>
        </div>
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3">
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">Critical Unknowns</div>
          <div className="text-2xl font-black text-rose-200 mt-1">{data?.summary.critical_unknowns_count || 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">High-impact project risks</div>
        </div>
      </div>

      {/* 3 Column Knowledge Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: WHAT WE KNOW */}
        <div className="rounded-xl border border-emerald-900/30 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              1. WHAT WE KNOW ({data?.what_we_know.length || 0})
            </span>
          </div>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {data?.what_we_know.map((item) => (
              <div key={item.id} className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-3 hover:border-emerald-700/60 transition-colors">
                <div className="text-xs text-slate-200 leading-relaxed font-medium">{item.statement}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-900/30">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(item.risk_level)}`}>
                    {item.risk_level} RISK
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">✓ Verified</span>
                </div>
              </div>
            ))}
            {(!data?.what_we_know || data.what_we_know.length === 0) && (
              <div className="text-center py-8 text-xs text-slate-500 italic">No verified facts recorded yet.</div>
            )}
          </div>
        </div>

        {/* Column 2: WHAT WE THINK */}
        <div className="rounded-xl border border-amber-900/30 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              2. WHAT WE THINK ({data?.what_we_think.length || 0})
            </span>
          </div>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {data?.what_we_think.map((item) => (
              <div key={item.id} className="rounded-lg border border-amber-900/40 bg-amber-950/10 p-3 hover:border-amber-700/60 transition-colors">
                <div className="text-xs text-slate-200 leading-relaxed font-medium">{item.statement}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-900/30">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(item.risk_level)}`}>
                    {item.risk_level} RISK
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono">? Needs Test</span>
                </div>
              </div>
            ))}
            {(!data?.what_we_think || data.what_we_think.length === 0) && (
              <div className="text-center py-8 text-xs text-slate-500 italic">No working hypotheses mapped.</div>
            )}
          </div>
        </div>

        {/* Column 3: WHAT WE DON'T KNOW */}
        <div className="rounded-xl border border-rose-900/30 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="flex items-center gap-2 text-xs font-bold text-rose-400 tracking-wider">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              3. WHAT WE DON'T KNOW ({data?.what_we_dont_know.length || 0})
            </span>
          </div>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {data?.what_we_dont_know.map((item) => (
              <div key={item.id} className="rounded-lg border border-rose-900/40 bg-rose-950/10 p-3 hover:border-rose-700/60 transition-colors">
                <div className="text-xs text-slate-200 leading-relaxed font-medium">{item.statement}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-900/30">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(item.risk_level)}`}>
                    {item.risk_level} RISK
                  </span>
                  <span className="text-[10px] text-rose-400/80 font-mono">⚠ Blind Spot</span>
                </div>
              </div>
            ))}
            {(!data?.what_we_dont_know || data.what_we_dont_know.length === 0) && (
              <div className="text-center py-8 text-xs text-slate-500 italic">No critical unknowns identified.</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-4">Add Item to Unknowns Map</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Statement</label>
                <textarea
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="e.g. Farmers will pay a monthly subscription fee for solar refrigeration..."
                  className="w-full h-24 rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Knowledge Bucket</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="WHAT_WE_THINK">What We Think (Hypothesis)</option>
                    <option value="WHAT_WE_DONT_KNOW">What We Don't Know (Risk)</option>
                    <option value="WHAT_WE_KNOW">What We Know (Fact)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Risk Level</label>
                  <select
                    value={newRisk}
                    onChange={(e: any) => setNewRisk(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                    <option value="CRITICAL">Critical Risk</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-900/40"
                >
                  Save to Unknowns Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
