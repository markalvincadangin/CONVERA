"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Copy, Check, Trash2, Clock, Users, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { workspaceService, CreateInvitePayload } from "@/services/workspaceService";
import { WorkspaceInvite, WorkspaceRole } from "@/lib/types";

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
  userRole?: WorkspaceRole | string;
}

const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  ADMIN: "Full operational control, invite authority, and member role management.",
  MEMBER: "Can create problems, add evidence, circumscribe, and advance through stages.",
  ADVISOR: "Read access + authoritative Mentor / Advisor Gate sign-off privileges.",
  VIEWER: "Read-only access to problems, evidence, dossiers, and audit trail.",
  OWNER: "Primary custodian of the workspace and billing settings.",
};

export const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  userRole = "MEMBER",
}) => {
  const [role, setRole] = useState<WorkspaceRole>("MEMBER");
  const [expiresInHours, setExpiresInHours] = useState<number>(48);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedInvite, setGeneratedInvite] = useState<WorkspaceInvite | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeInvites, setActiveInvites] = useState<WorkspaceInvite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canInvite = userRole === "OWNER" || userRole === "ADMIN" || userRole === "SUPERADMIN";

  useEffect(() => {
    if (isOpen && workspaceId && canInvite) {
      loadInvites();
    }
  }, [isOpen, workspaceId, canInvite]);

  const loadInvites = async () => {
    try {
      const res = await workspaceService.listInvites(workspaceId);
      setActiveInvites(res.invites || []);
    } catch (e: any) {
      // Non-critical, ignore if user lacks permission
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await workspaceService.createInvite(workspaceId, {
        role,
        expires_in_hours: expiresInHours,
        max_uses: maxUses,
      });
      setGeneratedInvite(res.invite);
      loadInvites();
    } catch (err: any) {
      setError(err?.message || "Failed to generate invite token");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      await workspaceService.revokeInvite(workspaceId, inviteId);
      loadInvites();
      if (generatedInvite?.id === inviteId) {
        setGeneratedInvite(null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to revoke invite");
    }
  };

  const copyToClipboard = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Invite Collaborator or Advisor</h2>
            <p className="text-xs text-slate-400 truncate max-w-sm">
              Workspace: <span className="font-semibold text-slate-200">{workspaceName || workspaceId}</span>
            </p>
          </div>
        </div>

        {!canInvite ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Only workspace Owners and Admins have permission to generate invite tokens.</span>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generated Invite Card */}
            {generatedInvite && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Invite Link Created ({generatedInvite.role})
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500/80">
                    Expires in {expiresInHours}h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${generatedInvite.token}`}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950/80 border border-emerald-500/30 rounded-xl text-slate-200 focus:outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedInvite.token)}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Share this secure link with your collaborator. They will be granted the {generatedInvite.role} role upon redemption.
                </p>
              </div>
            )}

            {/* Create Form */}
            <form onSubmit={handleCreateInvite} className="space-y-4">
              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Role to Assign
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["MEMBER", "ADVISOR", "VIEWER", "ADMIN"] as WorkspaceRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        role === r
                          ? "bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{r}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {r === "ADVISOR" ? "Gate sign-off authority" : r === "MEMBER" ? "Standard contributor" : r === "ADMIN" ? "Manager" : "Read-only"}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="font-semibold text-slate-300">{role}:</span> {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>

              {/* Expiration & Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiration (TTL)
                  </label>
                  <select
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours (Standard)</option>
                    <option value={168}>7 Days</option>
                    <option value={720}>30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Redemption Limit
                  </label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>1 Use (Single-Use, Secure)</option>
                    <option value={5}>5 Uses</option>
                    <option value={10}>10 Uses</option>
                    <option value={100}>100 Uses (Team cohort)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Generating Cryptographic Token..." : "Generate Invite Link"}
              </button>
            </form>

            {/* Existing Active Invites */}
            {activeInvites.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Active Invites ({activeInvites.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400">{inv.role}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Uses: {inv.use_count}/{inv.max_uses}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-mono">
                          token: {inv.token.slice(0, 16)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(inv.token)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Revoke Token"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
