"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  X,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  orchestratorService,
  OrchestrationEventRecord,
} from "@/services/orchestratorService";
import { Button } from "@/components/common/Button";

interface OrchestrationEventsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const OrchestrationEventsDrawer: React.FC<OrchestrationEventsDrawerProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const [events, setEvents] = useState<OrchestrationEventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await orchestratorService.listEvents(sessionId, 50);
      setEvents(res.events || []);
    } catch (err) {
      console.warn("Could not fetch orchestration events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      fetchEvents();
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Orchestration Audit Log"
        tabIndex={-1}
        className="w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 focus-visible:outline-none"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span className="text-neutral-100 font-mono text-sm font-bold">
                  ORCHESTRATION AUDIT LOG
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-700">
                  {events.length} Events
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Immutable chronological log of research operations dispatched under session {sessionId}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchEvents}
                disabled={loading}
                className="p-1.5 text-neutral-400 hover:text-white"
                title="Refresh log"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {loading && events.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs animate-pulse">
                Loading orchestration history...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs italic">
                No orchestration events recorded yet. Actions dispatched from the Cockpit will appear here.
              </div>
            ) : (
              events.map((evt) => {
                const isExpanded = expandedEventId === evt.id;
                const status = evt.payload?.status || "SUCCESS";
                const summary = evt.payload?.execution_summary || "Action executed.";
                const actionType = evt.payload?.action_type || evt.event_type;
                const targetEngine = evt.payload?.target_engine;

                return (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-2 backdrop-blur-sm transition-colors hover:border-neutral-700/80"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                            status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : status === "DEGRADED"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {status === "SUCCESS" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {status}
                        </span>

                        <span className="font-mono text-neutral-200 font-semibold text-[11px]">
                          {actionType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[10px]">
                        <Clock className="w-3 h-3" />
                        {new Date(evt.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {summary}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/40 text-[10px] text-neutral-500 font-mono">
                      <div className="flex items-center gap-2">
                        <span>Stage: {evt.stage_id}</span>
                        {targetEngine && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Cpu className="w-2.5 h-2.5" />
                            {targetEngine}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setExpandedEventId(isExpanded ? null : evt.id)
                        }
                        className="text-neutral-400 hover:text-neutral-200 flex items-center gap-0.5"
                      >
                        <span>Payload</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 rounded bg-neutral-950 font-mono text-[10px] text-neutral-400 overflow-x-auto border border-neutral-800/80">
                        <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-neutral-400"
          >
            Close Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
};
