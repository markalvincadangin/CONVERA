"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogIn,
  UserPlus,
} from "lucide-react";
import { workspaceService, InviteInspection } from "@/services/workspaceService";
import { useAuth } from "@/lib/auth-context";

export default function InviteRedemptionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [inviteData, setInviteData] = useState<InviteInspection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      inspectToken();
    }
  }, [token]);

  const inspectToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workspaceService.inspectInvite(token);
      setInviteData(res);
      if (!res.valid) {
        setError(res.error || "This invite link is invalid, expired, or has reached maximum uses.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to inspect invite token.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!token) return;
    setRedeeming(true);
    setError(null);
    try {
      await workspaceService.redeemInvite(token);
      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to redeem invite.");
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONVERA Research Workspace Invitation</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Join Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Collaborative, evidence-backed venture problem formulation
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 p-7 shadow-2xl backdrop-blur-xl">
          {loading || authLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Verifying cryptographic invite token...
            </div>
          ) : error || !inviteData?.valid ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Invalid or Expired Invite</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {error || "This invite link is no longer valid. It may have expired, reached its redemption limit, or been revoked by the workspace owner."}
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Return to CONVERA
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Welcome to the Workspace!</h2>
              <p className="text-xs text-slate-400">
                You have joined as an active <span className="font-mono font-bold text-cyan-400">{inviteData.role}</span>. Redirecting to workspace...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Workspace info summary */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {inviteData.workspace_name || "Venture Project"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Invited by: <span className="text-slate-300 font-medium">{inviteData.inviter_name || "Workspace Admin"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">Assigned Role:</span>
                  <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {inviteData.role}
                  </span>
                </div>
              </div>

              {/* Conditional Action based on Authentication state */}
              {user ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 text-center">
                    Accepting invite as <span className="font-semibold text-slate-200">{user.email}</span>
                  </div>
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{redeeming ? "Accepting Invite..." : `Accept Invite as ${inviteData.role}`}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center">
                    Please sign in or create an account to accept this invitation.
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/login?redirect=/invite/${token}`}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Log In</span>
                    </Link>
                    <Link
                      href={`/register?redirect=/invite/${token}`}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
