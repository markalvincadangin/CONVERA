"use client";

import React, { useState, useEffect } from "react";
import { ImpactAlert, knowledgeService } from "@/services/knowledgeService";
import { Button } from "@/components/common/Button";
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Flame,
} from "lucide-react";

interface ImpactAlertBannerProps {
  sessionId?: string;
  projectId?: string;
  onRefreshNeeded?: () => void;
}

export const ImpactAlertBanner: React.FC<ImpactAlertBannerProps> = ({
  sessionId,
  projectId,
  onRefreshNeeded,
}) => {
  const [alerts, setAlerts] = useState<ImpactAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await knowledgeService.getActiveImpactAlerts({
        session_id: sessionId,
        project_id: projectId,
      });
      setAlerts(res.alerts || []);
    } catch (err) {
      console.error("Failed to fetch impact alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [sessionId, projectId]);

  if (alerts.length === 0) return null;

  const topAlert = alerts[0];
  const isCritical = alerts.some((a) => a.severity === "CRITICAL");

  const handleAcknowledge = async (alertId: string) => {
    try {
      setResolvingId(alertId);
      await knowledgeService.acknowledgeImpactAlert(alertId, "ACKNOWLEDGED");
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isCritical
          ? "bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-amber-950/70 border-rose-500/50 shadow-rose-950/40"
          : "bg-slate-900/90 border-amber-500/40 shadow-amber-950/20"
      }`}
    >
      {/* Main Banner Header */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isCritical ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {isCritical ? <Flame className="w-5 h-5 animate-pulse" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                Epistemic Invalidation Alert ({alerts.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-bold">
                Impact Propagation Active
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              <strong>Trigger:</strong> {topAlert.trigger_action} on {topAlert.trigger_entity_type} #{topAlert.trigger_entity_id}. Downstream candidate assumptions or decisions compromised.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            rightIcon={isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          >
            {isExpanded ? "Hide Impact Details" : "View Blast Radius"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleAcknowledge(topAlert.id)}
            disabled={resolvingId === topAlert.id}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {resolvingId === topAlert.id ? "Acknowledging..." : "Acknowledge Alert"}
          </Button>
        </div>
      </div>

      {/* Expandable Blast Radius Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/60 space-y-3 animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Downstream Blast Radius (Affected Entities)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {topAlert.affected_entities.map((entity, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 rounded-xl border border-rose-500/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                    [{entity.type}] #{entity.id}
                  </span>
                  <span className="text-[10px] text-slate-500">Status: Compromised</span>
                </div>
                <p className="font-medium text-slate-200">{entity.name}</p>
                <p className="text-[11px] text-rose-300/80 italic">{entity.reason}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <ArrowRight className="w-3.5 h-3.5" /> Recommended: Re-evaluate selection in Decision Room or conduct Socratic Interrogation.
            </span>
            <button
              onClick={fetchAlerts}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} /> Refresh Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
