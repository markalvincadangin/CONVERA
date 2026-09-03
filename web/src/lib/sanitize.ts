"use client";

/**
 * Utility to sanitize strings by stripping stray markdown bold/italics,
 * HTML linebreaks, raw asterisks, and backticks.
 */
export function sanitizeText(val?: string | null): string {
  if (!val) return "";
  let s = String(val);
  // Replace HTML linebreaks
  s = s.replace(/<br\s*\/?>/gi, " ");
  s = s.replace(/<[^>]+>/g, " ");
  // Strip bold/italics markdown
  s = s.replace(/\*\*([^\*]+)\*\*/g, "$1");
  s = s.replace(/\*([^\*]+)\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/_([^_]+)_/g, "$1");
  // Strip remaining stray asterisks, backticks, or hashes
  s = s.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/##/g, "").replace(/#/g, "");
  // Normalize whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function sanitizeProblemId(id?: string | null): string {
  if (!id) return "";
  const s = sanitizeText(id);
  return s.replace(/[^A-Za-z0-9\-]/g, "").toUpperCase();
}
