"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`markdown-content space-y-4 text-slate-200 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-4 pb-2 border-b border-slate-800 flex items-center gap-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg sm:text-xl font-bold text-cyan-400 tracking-tight pt-3 pb-1 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-bold text-slate-100 pt-2 pb-1" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-sm font-semibold text-slate-300 pt-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm text-slate-300 leading-relaxed my-2" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-sm text-slate-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-sm text-slate-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-sm text-slate-300 leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="p-3.5 my-3 rounded-xl bg-cyan-950/30 border-l-4 border-cyan-500 text-xs text-cyan-200 font-medium italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="w-full my-6 overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/70 shadow-2xl backdrop-blur-md">
              <table className="w-full text-left border-collapse text-xs" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border-b border-slate-700/80 text-[11px] font-bold uppercase tracking-wider text-cyan-300" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="py-3 px-4 font-bold text-cyan-300 border-r border-slate-800/50 last:border-r-0 whitespace-nowrap" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-slate-800/60" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-cyan-950/20 transition-colors group" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="py-3.5 px-4 text-slate-300 align-top border-r border-slate-800/30 last:border-r-0 leading-relaxed font-normal" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-slate-800/80 text-cyan-300 font-mono text-[11px] border border-slate-700/60" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto my-3 text-xs font-mono text-cyan-300 shadow-inner" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white tracking-tight" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-slate-800/80" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
