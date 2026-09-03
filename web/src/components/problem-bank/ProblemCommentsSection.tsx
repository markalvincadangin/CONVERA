"use client";

import React, { useState, useEffect } from "react";
import { ProblemComment, UserProfile } from "@/lib/types";
import { authService } from "@/services/authService";
import { UserRoleBadge } from "@/components/auth/UserRoleBadge";
import { IconAvatar } from "@/components/common/IconAvatar";
import { Button } from "@/components/common/Button";
import { MessageSquare, Send, Sparkles, GraduationCap } from "lucide-react";

interface ProblemCommentsSectionProps {
  problemId: string;
  currentUser: UserProfile;
}

export const ProblemCommentsSection: React.FC<ProblemCommentsSectionProps> = ({
  problemId,
  currentUser,
}) => {
  const [comments, setComments] = useState<ProblemComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const list = await authService.listComments(problemId);
      setComments(list);
    } catch (e) {
      console.warn("Failed to load comments:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const saved = await authService.addComment(problemId, newComment.trim(), currentUser);
      if (saved) {
        setComments((prev) => [...prev, saved]);
        setNewComment("");
      }
    } catch (e) {
      console.error("Failed to post comment:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Team Discussion &amp; Mentor Reviews ({comments.length})
        </h4>
      </div>

      {/* Existing Comments List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="text-xs text-slate-500 py-3 text-center font-mono">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <p className="text-xs text-slate-400">No comments or mentor feedback yet.</p>
            <p className="text-[11px] text-slate-600">
              Teammates and mentors can add field insights or challenge assumptions here.
            </p>
          </div>
        ) : (
          comments.map((c) => {
            const isMentor = c.user_role === "MENTOR_PROFESSOR";
            return (
              <div
                key={c.id || Math.random()}
                className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                  isMentor
                    ? "bg-purple-950/20 border-purple-500/30 shadow-sm"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <IconAvatar iconKey={c.user_avatar} size="xs" />
                    <span className="text-xs font-bold text-white">
                      {c.user_name}
                    </span>
                    <UserRoleBadge role={c.user_role} size="sm" />
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-6 whitespace-pre-wrap">
                  {c.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              currentUser.role === "MENTOR_PROFESSOR"
                ? "Leave Socratic review / guidance for this problem..."
                : "Add team field observation or note..."
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          type="submit"
          disabled={!newComment.trim()}
          isLoading={isSubmitting}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Post
        </Button>
      </form>
    </div>
  );
};
