from __future__ import annotations

"""
RatchetAI Universal Multi-Provider LLM Gateway
Supports Google Gemini (3.5 Flash-Lite / 3.6 Flash / 3.5 Flash), Groq Cloud (GPT-OSS 120B / Qwen 27B), OpenRouter, and Local Ollama.
Includes Real-Time Environment Reloading, Intelligent Multi-Provider Failover Cascade, Fast Timeout Protection,
Response Sanitization (with aggressive chain-of-thought stripping), Model Attribution Telemetry, and Anti-Truncation Token Allocation.
"""

import os
import re
import time
import asyncio
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
from enum import Enum

from enum import Enum

class TaskCategory(str, Enum):
    FAST_EXTRACTION = "FAST_EXTRACTION"
    STRUCTURED_EXTRACTION = "FAST_EXTRACTION"
    CRITICAL_REASONING = "BALANCED_SYNTHESIS"
    CLASSIFICATION = "CLASSIFICATION"
    BALANCED_SYNTHESIS = "BALANCED_SYNTHESIS"
    SOCRATIC_CLINIC = "SOCRATIC_CLINIC"
    DEVILS_ADVOCATE = "DEVILS_ADVOCATE"
    DECISION_JUDGE = "DECISION_JUDGE"
    SRS_SPECIFICATION = "SRS_SPECIFICATION"

import httpx
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent


# ---------------------------------------------------------------------------
# Response Sanitization — strips ALL reasoning leaks from any model
# ---------------------------------------------------------------------------

# Patterns that indicate chain-of-thought reasoning leaked into output.
# These appear as plaintext (no <think> wrapper) from Qwen, DeepSeek, etc.
_COT_PREAMBLE_PATTERNS = [
    # Qwen-style meta-planning lines
    r"^.*(?:Let(?:'s| me|us) (?:draft|check|think|plan|verify|ensure|review|structure|map|adjust|count|trim|analyze|start|begin))\b.*$",
    r"^.*(?:I(?:'ll| will| need to| should| must) (?:draft|check|think|plan|verify|ensure|review|structure|map|adjust|count|trim|analyze|use|generate|rely|create|make|double[\s-]?check))\b.*$",
    r"^.*(?:Wait,|Also,|Hmm,|OK,|Okay,|Now,|First,|Next,|Actually,|So,) (?:I |let |the ).*$",
    # Numbered meta-reasoning steps ("1. Deconstruct Requirements", "2. Research & Data Generation")
    r"^\d+\.\s*(?:Deconstruct|Parse|Analyze|Identify|Research|Generate|Mental|Plan|Review|Check|Map|Verify|Draft|Ensure|Understand)\b.*$",
    # Bullet-point constraint echoing
    r"^[-\u2022]\s*(?:Table|Cell|Source|Column|Section|Evidence|Generate|Follow|Eliminate|Ensure|Must|All cells|Exactly|Sections|Tiers?|Hyperlinks?|Problems?)\b.*(?:columns?|rows?|words?|links?|sections?|tiers?|constraints?|format|concise|provided|required|complete).*$",
    # Self-narration
    r"^.*(?:All constraints met|constraints? (?:are |have been )?(?:met|satisfied|checked)).*$",
    r"^.*(?:Table columns?:|Cell length:|Sources:|Sections:).*$",
]

_COT_COMPILED = [re.compile(p, re.IGNORECASE | re.MULTILINE) for p in _COT_PREAMBLE_PATTERNS]


def clean_llm_response(text: str) -> str:
    """
    Sanitize LLM outputs by removing reasoning preambles, <think> tags,
    chain-of-thought leaks, and meta commentary.  Handles Qwen, DeepSeek,
    GPT-OSS and Gemini output quirks.
    """
    if not text:
        return ""

    # Stage 1: Remove <think>...</think> blocks
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.IGNORECASE)
    cleaned = re.sub(r"</?think>", "", cleaned, flags=re.IGNORECASE)

    # Stage 2: Find the real content start
    # All RatchetAI phase outputs begin with a markdown heading.
    # If there's a `# Phase` or `## ` heading, everything before it is reasoning preamble.
    heading_match = re.search(r"^(#{1,2}\s+(?:Phase\s+\d|[A-Z]))", cleaned, re.MULTILINE)
    if heading_match:
        preamble = cleaned[:heading_match.start()]
        # Only strip if preamble looks like reasoning (not just a blank line)
        if preamble.strip() and _looks_like_reasoning(preamble):
            cleaned = cleaned[heading_match.start():]

    # Stage 3: Remove interstitial reasoning lines that survive
    # These are lines between sections like "Wait, I need to ensure..."
    lines = cleaned.split("\n")
    filtered_lines = []

    for line in lines:
        stripped = line.strip()

        # Skip reasoning lines that appear mid-content (but never strip table rows or headings)
        if stripped and not stripped.startswith("|") and not stripped.startswith("#") and _is_reasoning_line(stripped):
            continue

        filtered_lines.append(line)

    cleaned = "\n".join(filtered_lines)

    # Stage 4: Collapse excessive blank lines
    cleaned = re.sub(r"\n{4,}", "\n\n\n", cleaned)

    return cleaned.strip()


def _looks_like_reasoning(text: str) -> bool:
    """Check if a block of text looks like chain-of-thought reasoning."""
    indicators = [
        r"(?:let(?:'s| me)|I(?:'ll| will| need| should| must))",
        r"(?:constraints?|requirements?|deconstruct|mental simulation)",
        r"(?:draft|check|verify|ensure|trim|adjust|structure|map)",
        r"(?:wait,|also,|hmm,|okay,|now,|first,|actually,)",
    ]
    text_lower = text.lower()
    matches = sum(1 for p in indicators if re.search(p, text_lower))
    return matches >= 1


def _is_reasoning_line(line: str) -> bool:
    """Check if a single line is a reasoning/meta-commentary line."""
    for pattern in _COT_COMPILED:
        if pattern.search(line):
            return True
    return False


def format_model_display_name(provider: str, model: str) -> str:
    """Format model name into clean, human-readable display string."""
    if provider == "gemini":
        if "3.8-flash" in model:
            return "Google Gemini 3.8 Flash"
        elif "3.5-flash-lite" in model:
            return "Google Gemini 3.5 Flash-Lite"
        elif "3.6" in model:
            return "Google Gemini 3.6 Flash"
        elif "3.5" in model:
            return "Google Gemini 3.5 Flash"
        return f"Google Gemini ({model})"
    elif provider == "groq":
        if "gpt-oss-120b" in model:
            return "Groq \u00b7 GPT-OSS 120B"
        elif "qwen" in model:
            return "Groq \u00b7 Qwen 3.6 27B"
        return f"Groq \u00b7 {model.split('/')[-1]}"
    elif provider == "openrouter":
        return f"OpenRouter \u00b7 {model.split('/')[-1].replace(':free', '')}"
    elif provider == "ollama":
        return f"Local Ollama \u00b7 {model}"
    return f"{provider.capitalize()} \u00b7 {model}"


def reload_config():
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(ROOT_DIR / ".env", override=True)
    return {
        "provider": os.getenv("LLM_PROVIDER", "gemini").lower(),
        "gemini_model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        "gemini_key": os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")),
        "groq_key": os.getenv("GROQ_API_KEY", ""),
        "groq_model": os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
        "openrouter_key": os.getenv("OPENROUTER_API_KEY", ""),
        "openrouter_model": os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"),
        "ollama_base": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
        "ollama_model": os.getenv("OLLAMA_MODEL", "llama3.2"),
    }


# ---------------------------------------------------------------------------
# Provider Call Functions
# ---------------------------------------------------------------------------

async def call_gemini_native(
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
    model: str = "gemini-3.5-flash-lite",
) -> str:
    from google import genai
    from google.genai import types as genai_types

    cfg = reload_config()
    api_key = cfg["gemini_key"]
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env")

    client = genai.Client(api_key=api_key)

    contents = []
    if history:
        for turn in history:
            role = "user" if turn.get("role") == "user" else "model"
            txt = turn.get("content", "")
            if txt:
                contents.append(genai_types.Content(
                    role=role,
                    parts=[genai_types.Part.from_text(text=txt)]
                ))

    contents.append(genai_types.Content(
        role="user",
        parts=[genai_types.Part.from_text(text=prompt)]
    ))

    config = genai_types.GenerateContentConfig(
        system_instruction=system_instruction + "\n\nCRITICAL: DO NOT output any conversational preamble or thinking process. Start immediately with markdown content.",
        temperature=0.3,
        max_output_tokens=8192,
    )

    response = await asyncio.wait_for(
        client.aio.models.generate_content(
            model=model,
            contents=contents,
            config=config,
        ),
        timeout=15.0,
    )

    if hasattr(response, "text") and response.text and response.text.strip():
        return clean_llm_response(response.text.strip())

    if getattr(response, "candidates", None):
        parts_text = []
        for cand in response.candidates:
            if cand.content and cand.content.parts:
                for p in cand.content.parts:
                    if getattr(p, "text", None):
                        parts_text.append(p.text)
        combined = "".join(parts_text).strip()
        if combined:
            return clean_llm_response(combined)

    raise RuntimeError("Gemini returned empty text response.")


async def call_openai_compatible_api(
    base_url: str,
    api_key: str,
    model: str,
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
) -> str:
    full_instruction = (
        system_instruction
        + "\n\nCRITICAL FORMATTING RULES:"
        + "\n- Output ONLY the final markdown document."
        + "\n- Do NOT include <think> tags, reasoning steps, constraint checking, or self-narration."
        + "\n- Do NOT echo instructions back or plan your response aloud."
        + "\n- Start IMMEDIATELY with the first markdown heading."
        + "\n- Complete all sections through to the end."
    )
    messages = [{"role": "system", "content": full_instruction}]
    if history:
        for turn in history:
            role = "user" if turn.get("role") == "user" else "assistant"
            txt = turn.get("content", "")
            if txt:
                messages.append({"role": role, "content": txt})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if "openrouter.ai" in base_url:
        headers["HTTP-Referer"] = "https://github.com/markalvincadangin/RatchetAI"
        headers["X-Title"] = "RatchetAI Venture Engine"

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 3500,
    }

    url = f"{base_url.rstrip('/')}/chat/completions"

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"API ({base_url} - {model}) returned HTTP {resp.status_code}: {resp.text}")
        data = resp.json()
        raw_text = data["choices"][0]["message"]["content"].strip()
        return clean_llm_response(raw_text)


# ---------------------------------------------------------------------------
# Universal Generation Gateway with Multi-Provider Failover Cascade
# ---------------------------------------------------------------------------

async def generate_with_meta(
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
    task_category: Optional[TaskCategory] = None,
) -> Tuple[str, Dict[str, Any]]:
    """
    Universal Generation Gateway that returns (clean_text, model_metadata).
    Cascade order prioritizes models that don't leak chain-of-thought.
    """
    cfg = reload_config()
    provider = cfg["provider"]
    last_error = None
    t0 = time.time()

    cascade = []

    # Priority 1: User's explicitly chosen provider
    if provider == "gemini" and cfg["gemini_key"]:
        cascade.append(("gemini", "gemini-3.8-flash"))
        cascade.append(("gemini", "gemini-3.5-flash-lite"))
        cascade.append(("gemini", "gemini-3.6-flash"))
        cascade.append(("gemini", "gemini-3.5-flash"))
    elif provider == "groq" and cfg["groq_key"]:
        # GPT-OSS 120B first: it never leaks reasoning. Qwen last: it leaks CoT.
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "openai/gpt-oss-120b"))
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "qwen/qwen3.6-27b"))
    elif provider == "openrouter" and cfg["openrouter_key"]:
        cascade.append(("openrouter", "https://openrouter.ai/api/v1", cfg["openrouter_key"], cfg["openrouter_model"]))
    elif provider == "ollama":
        cascade.append(("ollama", cfg["ollama_base"], "ollama", cfg["ollama_model"]))

    # Priority 2: Fast secondary providers (non-reasoning models first)
    if cfg["gemini_key"] and ("gemini", "gemini-3.8-flash") not in cascade:
        cascade.append(("gemini", "gemini-3.8-flash"))
    if cfg["gemini_key"] and ("gemini", "gemini-3.5-flash-lite") not in cascade:
        cascade.append(("gemini", "gemini-3.5-flash-lite"))
    if cfg["groq_key"] and ("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "openai/gpt-oss-120b") not in cascade:
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "openai/gpt-oss-120b"))
    if cfg["gemini_key"] and ("gemini", "gemini-3.6-flash") not in cascade:
        cascade.append(("gemini", "gemini-3.6-flash"))
    # Qwen is last resort due to its strong reasoning leak tendency
    if cfg["groq_key"] and ("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "qwen/qwen3.6-27b") not in cascade:
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "qwen/qwen3.6-27b"))
    if cfg["openrouter_key"] and ("openrouter", "https://openrouter.ai/api/v1", cfg["openrouter_key"], cfg["openrouter_model"]) not in cascade:
        cascade.append(("openrouter", "https://openrouter.ai/api/v1", cfg["openrouter_key"], cfg["openrouter_model"]))

    # Execute cascade
    for item in cascade:
        prov_type = item[0]
        try:
            if prov_type == "gemini":
                model_name = item[1]
                res = await call_gemini_native(system_instruction, prompt, history, model=model_name)
                latency = round(time.time() - t0, 2)
                meta = {
                    "provider": "gemini",
                    "model": model_name,
                    "display_name": format_model_display_name("gemini", model_name),
                    "latency_seconds": latency,
                }
                return clean_llm_response(res), meta
            else:
                _, base_url, api_key, model_name = item
                res = await call_openai_compatible_api(base_url, api_key, model_name, system_instruction, prompt, history)
                latency = round(time.time() - t0, 2)
                meta = {
                    "provider": prov_type,
                    "model": model_name,
                    "display_name": format_model_display_name(prov_type, model_name),
                    "latency_seconds": latency,
                }
                return clean_llm_response(res), meta
        except Exception as e:
            last_error = e
            print(f"[!] Provider {prov_type} ({item[1]}) failed: {e}. Cascading to next provider...")
            await asyncio.sleep(0.1)

    raise RuntimeError(f"All LLM providers in cascade failed. Last error: {last_error}")


async def generate_response_with_fallback(
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
    task_category: Optional[TaskCategory] = None,
) -> str:
    """Backward-compatible helper returning raw text."""
    content, _ = await generate_with_meta(system_instruction, prompt, history, task_category=task_category)
    return content
