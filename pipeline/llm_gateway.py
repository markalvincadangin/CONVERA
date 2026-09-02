from __future__ import annotations

"""
RatchetAI Universal Multi-Provider LLM Gateway
Supports Google Gemini 3.6 Flash, Groq Cloud (GPT-OSS 120B / Qwen 27B), OpenRouter, and Local Ollama.
Includes Real-Time Environment Reloading, Intelligent Multi-Provider Failover Cascade, and Fast Timeout Protection.
"""

import os
import sys
import json
import time
import random
import asyncio
from pathlib import Path
from typing import Optional, List, Dict, Any
import httpx
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent


def reload_config():
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(ROOT_DIR / ".env", override=True)
    return {
        "provider": os.getenv("LLM_PROVIDER", "gemini").lower(),
        "gemini_model": os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
        "gemini_key": os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")),
        "groq_key": os.getenv("GROQ_API_KEY", ""),
        "groq_model": os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
        "openrouter_key": os.getenv("OPENROUTER_API_KEY", ""),
        "openrouter_model": os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"),
        "ollama_base": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
        "ollama_model": os.getenv("OLLAMA_MODEL", "llama3.2"),
    }


async def call_gemini_native(
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
    model: str = "gemini-3.6-flash",
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
        system_instruction=system_instruction,
        temperature=0.3,
    )

    # 10s maximum timeout for Gemini so we cascade instantly if there is demand spike
    response = await asyncio.wait_for(
        client.aio.models.generate_content(
            model=model,
            contents=contents,
            config=config,
        ),
        timeout=10.0,
    )

    if hasattr(response, "text") and response.text and response.text.strip():
        return response.text.strip()

    if getattr(response, "candidates", None):
        parts_text = []
        for cand in response.candidates:
            if cand.content and cand.content.parts:
                for p in cand.content.parts:
                    if getattr(p, "text", None):
                        parts_text.append(p.text)
        combined = "".join(parts_text).strip()
        if combined:
            return combined

    raise RuntimeError("Gemini returned empty text response.")


async def call_openai_compatible_api(
    base_url: str,
    api_key: str,
    model: str,
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
) -> str:
    messages = [{"role": "system", "content": system_instruction}]
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
    }

    url = f"{base_url.rstrip('/')}/chat/completions"

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"API ({base_url} - {model}) returned HTTP {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def generate_response_with_fallback(
    system_instruction: str,
    prompt: str,
    history: list[dict] = None,
) -> str:
    """
    Universal Generation Gateway with Fast Multi-Provider Fallback Cascade.
    Dynamically re-reads .env on every invocation.
    """
    cfg = reload_config()
    provider = cfg["provider"]
    last_error = None

    cascade = []

    # Priority 1: User's explicitly chosen provider
    if provider == "groq" and cfg["groq_key"]:
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], cfg["groq_model"]))
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "qwen/qwen3.6-27b"))
    elif provider == "openrouter" and cfg["openrouter_key"]:
        cascade.append(("openrouter", "https://openrouter.ai/api/v1", cfg["openrouter_key"], cfg["openrouter_model"]))
    elif provider == "ollama":
        cascade.append(("ollama", cfg["ollama_base"], "ollama", cfg["ollama_model"]))
    elif provider == "gemini" and cfg["gemini_key"]:
        cascade.append(("gemini", "gemini-3.6-flash"))

    # Priority 2: Ultra-Fast Secondary Providers (Groq is 500+ tok/s)
    if cfg["groq_key"] and ("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "openai/gpt-oss-120b") not in cascade:
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "openai/gpt-oss-120b"))
    if cfg["groq_key"] and ("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "qwen/qwen3.6-27b") not in cascade:
        cascade.append(("groq", "https://api.groq.com/openai/v1", cfg["groq_key"], "qwen/qwen3.6-27b"))
    if cfg["gemini_key"] and ("gemini", "gemini-3.6-flash") not in cascade:
        cascade.append(("gemini", "gemini-3.6-flash"))
    if cfg["openrouter_key"] and ("openrouter", "https://openrouter.ai/api/v1", cfg["openrouter_key"], cfg["openrouter_model"]) not in cascade:
        cascade.append(("openrouter", "https://openrouter.ai/api/v1", cfg["openrouter_key"], cfg["openrouter_model"]))

    # Execute cascade
    for item in cascade:
        prov_type = item[0]
        try:
            if prov_type == "gemini":
                model_name = item[1]
                return await call_gemini_native(system_instruction, prompt, history, model=model_name)
            else:
                _, base_url, api_key, model_name = item
                return await call_openai_compatible_api(base_url, api_key, model_name, system_instruction, prompt, history)
        except Exception as e:
            last_error = e
            print(f"[!] Provider {prov_type} ({item[1]}) failed: {e}. Cascading to next provider...")
            await asyncio.sleep(0.1)

    raise RuntimeError(f"All LLM providers in cascade failed. Last error: {last_error}")
