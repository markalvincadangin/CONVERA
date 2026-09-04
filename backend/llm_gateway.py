from __future__ import annotations

"""
CONVERA AI Runtime Provider Resilience Gateway (CONVERA-SDD-003 v2.0.0)
Governed multi-provider execution engine with polymorphic adapters, two-dimensional
error taxonomy, deterministic cooldown management, epistemic degraded-mode scaffolding,
and runtime provenance tracking.

Constitutional Invariants:
- External Boundary Principle (Constitution Art. V)
- Tri-Part Confidence Decoupling: C_AI != S_EVID != C_DEC (Constitution Art. II)
- Free-First Posture & Zero Mandatory Cost (Constitution Art. VI)
- Epistemic Provenance Integrity: Synthetic Fallback != Empirical Evidence (Constitution Art. III)
"""

import os
import re
import time
import uuid
import asyncio
import logging
import threading
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List, Type
from enum import Enum

import httpx
from dotenv import load_dotenv
from pydantic import BaseModel

logger = logging.getLogger("convera.llm_gateway")

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent


# ---------------------------------------------------------------------------
# Task Categories
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Canonical Contracts: ProviderCapabilities, RuntimeProvenance, EpistemicStatus, GatewayResult
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ProviderCapabilities:
    """Minimal capability contract reported by each provider adapter."""
    text_generation: bool = True
    structured_output: bool = True
    tool_calling: bool = False
    vision: bool = False
    streaming: bool = False
    long_context: bool = False
    research_suitable: bool = True


@dataclass(frozen=True)
class RuntimeProvenance:
    """Runtime execution provenance tracking provider, model, latency, and attempts."""
    provider: str
    model: str
    primary_provider: str
    attempted_providers: List[str] = field(default_factory=list)
    fallback_used: bool = False
    fallback_reason: Optional[str] = None
    latency_seconds: float = 0.0
    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    tokens_used: Dict[str, int] = field(default_factory=dict)


@dataclass(frozen=True)
class EpistemicStatus:
    """
    Epistemic standing of the generated content.
    Strictly decoupled from runtime confidence and provider prestige.
    """
    is_evidentiary: bool = False
    evidence_tier: Optional[str] = "SIGNAL"
    evidence_weight: float = 0.0
    provenance_lineage: Optional[str] = None


@dataclass(frozen=True)
class GatewayResult:
    """Canonical return envelope for all CONVERA AI Gateway dispatches."""
    content: str
    is_degraded: bool
    runtime_provenance: RuntimeProvenance
    epistemic_status: EpistemicStatus
    error: Optional[str] = None

    def __iter__(self):
        """
        Support backwards-compatible tuple unpacking:
        content, meta = await generate_with_meta(...)
        """
        yield self.content
        yield {
            "provider": self.runtime_provenance.provider,
            "model": self.runtime_provenance.model,
            "display_name": format_model_display_name(self.runtime_provenance.provider, self.runtime_provenance.model),
            "latency_seconds": self.runtime_provenance.latency_seconds,
            "is_degraded": self.is_degraded,
            "fallback_used": self.runtime_provenance.fallback_used,
            "fallback_reason": self.runtime_provenance.fallback_reason,
            "attempted_providers": list(self.runtime_provenance.attempted_providers),
        }


# ---------------------------------------------------------------------------
# Two-Dimensional Error Taxonomy: Provider-Level vs. Request-Level
# ---------------------------------------------------------------------------

class ProviderError(Exception):
    """Base exception for all provider and gateway errors."""
    def __init__(self, message: str, provider: Optional[str] = None, status_code: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code


# --- Provider-Level Consequence: Recoverable Failures (Trigger Cascade) ---

class RecoverableProviderError(ProviderError):
    """Errors attributable to provider infrastructure that trigger cascade."""
    pass


class ConnectivityError(RecoverableProviderError):
    """Network connection drop, DNS failure, or socket timeout."""
    pass


class TimeoutError(RecoverableProviderError):
    """Per-provider execution timeout expired."""
    pass


class RateLimitError(RecoverableProviderError):
    """HTTP 429 Quota or rate limit exceeded. Enters 30s timed cooldown."""
    def __init__(self, message: str, provider: Optional[str] = None, retry_after: float = 30.0):
        super().__init__(message, provider=provider, status_code=429)
        self.retry_after = retry_after


class BillingExhaustionError(RecoverableProviderError):
    """HTTP 402 Payment required or credits exhausted. Suppressed until config reload."""
    def __init__(self, message: str, provider: Optional[str] = None):
        super().__init__(message, provider=provider, status_code=402)


class ServiceUnavailableError(RecoverableProviderError):
    """HTTP 502/503/504 Upstream cloud capacity spike or temporary outage. Enters 15s cooldown."""
    def __init__(self, message: str, provider: Optional[str] = None, retry_after: float = 15.0):
        super().__init__(message, provider=provider, status_code=503)
        self.retry_after = retry_after


class AuthenticationError(RecoverableProviderError):
    """HTTP 401/403 Invalid or missing API credentials. Suppressed until config reload."""
    def __init__(self, message: str, provider: Optional[str] = None):
        super().__init__(message, provider=provider, status_code=401)


class EndpointRetiredError(RecoverableProviderError):
    """HTTP 410 Endpoint or model version retired / gone. Suppressed until config reload."""
    def __init__(self, message: str, provider: Optional[str] = None):
        super().__init__(message, provider=provider, status_code=410)


class ResponseFormatError(RecoverableProviderError):
    """Malformed or non-conforming JSON / text response from model. Bounded 1x retry on same provider."""
    pass


# --- Request-Level Consequence: Terminal Failures (Zero Cascade) ---

class TerminalRequestError(ProviderError):
    """Errors attributable to the request itself; must NOT cascade."""
    pass


class InvalidInputError(TerminalRequestError):
    """HTTP 422 Invalid parameters, malformed prompt, or schema mismatch."""
    def __init__(self, message: str, provider: Optional[str] = None):
        super().__init__(message, provider=provider, status_code=422)


class SecurityBoundaryError(TerminalRequestError):
    """HTTP 400 Prompt injection, jailbreak attempt, or safety boundary breach."""
    def __init__(self, message: str, provider: Optional[str] = None):
        super().__init__(message, provider=provider, status_code=400)


# ---------------------------------------------------------------------------
# Deterministic Cooldown & Health Management
# ---------------------------------------------------------------------------

class ProviderCooldownTracker:
    """
    Thread-safe in-memory cooldown and suppression manager:
    - 429 RateLimit: 30s timed cooldown
    - 503 ServiceUnavailable: 15s timed cooldown
    - 402/410/401: Suppressed until reload_config() or server restart
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._cooldowns: Dict[str, float] = {}  # provider_id -> expiry_timestamp
        self._suppressed: Dict[str, str] = {}  # provider_id -> suppression reason

    def mark_cooldown(self, provider: str, error: ProviderError) -> None:
        now = time.time()
        with self._lock:
            if isinstance(error, RateLimitError):
                expiry = now + getattr(error, "retry_after", 30.0)
                self._cooldowns[provider] = expiry
                logger.warning(f"[Cooldown] Provider '{provider}' rate-limited. Cooling down for {getattr(error, 'retry_after', 30.0)}s.")
            elif isinstance(error, ServiceUnavailableError):
                expiry = now + getattr(error, "retry_after", 15.0)
                self._cooldowns[provider] = expiry
                logger.warning(f"[Cooldown] Provider '{provider}' unavailable. Cooling down for {getattr(error, 'retry_after', 15.0)}s.")
            elif isinstance(error, (BillingExhaustionError, EndpointRetiredError, AuthenticationError)):
                self._suppressed[provider] = f"{type(error).__name__}: {str(error)}"
                logger.warning(f"[Suppression] Provider '{provider}' suppressed until config reload: {self._suppressed[provider]}")

    def is_available(self, provider: str) -> bool:
        now = time.time()
        with self._lock:
            if provider in self._suppressed:
                return False
            expiry = self._cooldowns.get(provider, 0.0)
            if now < expiry:
                return False
            return True

    def get_status(self, provider: str) -> Dict[str, Any]:
        now = time.time()
        with self._lock:
            if provider in self._suppressed:
                return {"status": "suppressed", "reason": self._suppressed[provider]}
            expiry = self._cooldowns.get(provider, 0.0)
            if now < expiry:
                return {"status": "cooldown", "remaining_seconds": round(expiry - now, 1)}
            return {"status": "available"}

    def reset(self) -> None:
        with self._lock:
            self._cooldowns.clear()
            self._suppressed.clear()


GLOBAL_COOLDOWN_TRACKER = ProviderCooldownTracker()


# ---------------------------------------------------------------------------
# Prompt Injection & Security Boundary Detection
# ---------------------------------------------------------------------------

_SECURITY_INJECTION_PATTERNS = [
    r"(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|prior|above)\s+instructions",
    r"you\s+are\s+now\s+in\s+dan\s+mode",
    r"jailbreak",
    r"system\s+override\s*:\s*disable\s+safety",
    r"<script\b[^>]*>",
]

_SECURITY_COMPILED = [re.compile(p, re.IGNORECASE) for p in _SECURITY_INJECTION_PATTERNS]


def check_security_boundary(prompt: str, system_instruction: str = "") -> None:
    """Inspect input payload for adversarial injection patterns."""
    if not prompt or not isinstance(prompt, str) or not prompt.strip():
        raise InvalidInputError("Prompt cannot be empty or non-string.")

    combined = f"{prompt} {system_instruction}"
    for pattern in _SECURITY_COMPILED:
        if pattern.search(combined):
            raise SecurityBoundaryError(f"Security boundary violation: input matches forbidden injection pattern.")


# ---------------------------------------------------------------------------
# Response Sanitization — strips reasoning leaks from any model
# ---------------------------------------------------------------------------

_COT_PREAMBLE_PATTERNS = [
    r"^.*(?:Let(?:'s| me|us) (?:draft|check|think|plan|verify|ensure|review|structure|map|adjust|count|trim|analyze|start|begin))\b.*$",
    r"^.*(?:I(?:'ll| will| need to| should| must) (?:draft|check|think|plan|verify|ensure|review|structure|map|adjust|count|trim|analyze|use|generate|rely|create|make|double[\s-]?check))\b.*$",
    r"^.*(?:Wait,|Also,|Hmm,|OK,|Okay,|Now,|First,|Next,|Actually,|So,) (?:I |let |the ).*$",
    r"^\d+\.\s*(?:Deconstruct|Parse|Analyze|Identify|Research|Generate|Mental|Plan|Review|Check|Map|Verify|Draft|Ensure|Understand)\b.*$",
    r"^[-\u2022]\s*(?:Table|Cell|Source|Column|Section|Evidence|Generate|Follow|Eliminate|Ensure|Must|All cells|Exactly|Sections|Tiers?|Hyperlinks?|Problems?)\b.*(?:columns?|rows?|words?|links?|sections?|tiers?|constraints?|format|concise|provided|required|complete).*$",
    r"^.*(?:All constraints met|constraints? (?:are |have been )?(?:met|satisfied|checked)).*$",
    r"^.*(?:Table columns?:|Cell length:|Sources:|Sections:).*$",
]

_COT_COMPILED = [re.compile(p, re.IGNORECASE | re.MULTILINE) for p in _COT_PREAMBLE_PATTERNS]


def clean_llm_response(text: str) -> str:
    """
    Sanitize LLM outputs by removing reasoning preambles, <think> tags,
    chain-of-thought leaks, and meta commentary.
    """
    if not text:
        return ""

    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.IGNORECASE)
    cleaned = re.sub(r"</?think>", "", cleaned, flags=re.IGNORECASE)

    heading_match = re.search(r"^(#{1,2}\s+(?:Phase\s+\d|[A-Z]))", cleaned, re.MULTILINE)
    if heading_match:
        preamble = cleaned[:heading_match.start()]
        if preamble.strip() and _looks_like_reasoning(preamble):
            cleaned = cleaned[heading_match.start():]

    lines = cleaned.split("\n")
    filtered_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("|") and not stripped.startswith("#") and _is_reasoning_line(stripped):
            continue
        filtered_lines.append(line)

    cleaned = "\n".join(filtered_lines)
    cleaned = re.sub(r"\n{4,}", "\n\n\n", cleaned)
    return cleaned.strip()


def _looks_like_reasoning(text: str) -> bool:
    indicators = [
        r"(?:let(?:'s| me)|I(?:'ll| will| need| should| must))",
        r"(?:constraints?|requirements?|deconstruct|mental simulation)",
        r"(?:draft|check|verify|ensure|trim|adjust|structure|map)",
        r"(?:wait,|also,|hmm,|okay,|now,|first,|actually,)",
    ]
    text_lower = text.lower()
    return sum(1 for p in indicators if re.search(p, text_lower)) >= 1


def _is_reasoning_line(line: str) -> bool:
    for pattern in _COT_COMPILED:
        if pattern.search(line):
            return True
    return False


def format_model_display_name(provider: str, model: str) -> str:
    """Format model name into clean, human-readable display string."""
    p_lower = provider.lower()
    if p_lower == "gemini":
        if "3.8-flash" in model:
            return "Google Gemini 3.8 Flash"
        elif "3.5-flash-lite" in model:
            return "Google Gemini 3.5 Flash-Lite"
        elif "3.6" in model:
            return "Google Gemini 3.6 Flash"
        elif "3.5" in model:
            return "Google Gemini 3.5 Flash"
        return f"Google Gemini ({model})"
    elif p_lower == "groq":
        if "gpt-oss-120b" in model:
            return "Groq \u00b7 GPT-OSS 120B"
        elif "qwen" in model:
            return "Groq \u00b7 Qwen 3.6 27B"
        return f"Groq \u00b7 {model.split('/')[-1]}"
    elif p_lower == "cerebras":
        clean_name = model.split("/")[-1]
        if "70b" in clean_name.lower():
            return "Cerebras · Llama 3.3 70B"
        elif "8b" in clean_name.lower():
            return "Cerebras · Llama 3.1 8B"
        return f"Cerebras · {clean_name}"
    elif p_lower == "github":
        clean_name = model.split("/")[-1]
        if "gpt-4o-mini" in clean_name.lower():
            return "GitHub · GPT-4o-mini"
        elif "70b" in clean_name.lower():
            return "GitHub · Llama 3.3 70B"
        return f"GitHub · {clean_name}"
    elif p_lower == "openrouter":
        return f"OpenRouter \u00b7 {model.split('/')[-1].replace(':free', '')}"
    elif p_lower == "ollama":
        return f"Local Ollama \u00b7 {model}"
    elif p_lower == "synthetic_fallback":
        return "Deterministic Degradation Scaffolding"
    return f"{provider.capitalize()} \u00b7 {model}"


# ---------------------------------------------------------------------------
# Configuration Management
# ---------------------------------------------------------------------------

def reload_config() -> Dict[str, Any]:
    """Reload environment variables from .env and return active configuration."""
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(ROOT_DIR / ".env", override=True)
    return {
        "provider": os.getenv("LLM_PROVIDER", "gemini").lower(),
        "gemini_model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        "gemini_key": os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")),
        "groq_key": os.getenv("GROQ_API_KEY", ""),
        "groq_model": os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
        "cerebras_key": os.getenv("CEREBRAS_API_KEY", ""),
        "cerebras_model": os.getenv("CEREBRAS_MODEL", "llama-3.3-70b"),
        "github_token": os.getenv("GITHUB_TOKEN", os.getenv("GITHUB_PAT", "")),
        "github_model": os.getenv("GITHUB_MODEL", "gpt-4o-mini"),
        "openrouter_key": os.getenv("OPENROUTER_API_KEY", ""),
        "openrouter_model": os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3.5-lightning:free"),
        "ollama_base": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
        "ollama_model": os.getenv("OLLAMA_MODEL", "llama3.2"),
    }


# ---------------------------------------------------------------------------
# Provider Abstraction: BaseLLMProvider & Concrete Adapters
# ---------------------------------------------------------------------------

class BaseLLMProvider(ABC):
    """Abstract polymorphic contract for all CONVERA LLM providers."""

    @property
    @abstractmethod
    def identity(self) -> str:
        """Provider identifier string (e.g. 'gemini', 'groq', 'ollama')."""
        ...

    @property
    @abstractmethod
    def capabilities(self) -> ProviderCapabilities:
        """Declared provider capabilities."""
        ...

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if provider credentials or endpoint configurations are present."""
        ...

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Perform lightweight health/connectivity check."""
        ...

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_instruction: str,
        schema: Optional[Type[BaseModel]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        """Execute text or structured generation, mapping provider errors into ProviderError hierarchy."""
        ...


class GeminiProvider(BaseLLMProvider):
    """Google Gemini Provider using Google GenAI SDK."""

    @property
    def identity(self) -> str:
        return "gemini"

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            text_generation=True,
            structured_output=True,
            tool_calling=True,
            vision=True,
            streaming=True,
            long_context=True,
            research_suitable=True,
        )

    def is_configured(self) -> bool:
        cfg = reload_config()
        return bool(cfg.get("gemini_key"))

    async def check_health(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "unconfigured", "provider": self.identity}
        cfg = reload_config()
        try:
            from google import genai
            client = genai.Client(api_key=cfg["gemini_key"])
            # Lightweight health ping
            return {"status": "healthy", "provider": self.identity, "model": cfg.get("gemini_model")}
        except Exception as e:
            return {"status": "unhealthy", "provider": self.identity, "error": str(e)}

    async def generate(
        self,
        prompt: str,
        system_instruction: str,
        schema: Optional[Type[BaseModel]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        cfg = reload_config()
        api_key = cfg.get("gemini_key")
        if not api_key:
            raise AuthenticationError("GEMINI_API_KEY not found in configuration.", provider=self.identity)

        selected_model = model or cfg.get("gemini_model") or "gemini-3.5-flash-lite"

        try:
            from google import genai
            from google.genai import types as genai_types
        except ImportError as e:
            raise ConnectivityError(f"google-genai SDK not installed: {e}", provider=self.identity)

        try:
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
                    model=selected_model,
                    contents=contents,
                    config=config,
                ),
                timeout=20.0,
            )

            res_text = ""
            if hasattr(response, "text") and response.text and response.text.strip():
                res_text = response.text.strip()
            elif getattr(response, "candidates", None):
                parts_text = []
                for cand in response.candidates:
                    if cand.content and cand.content.parts:
                        for p in cand.content.parts:
                            if getattr(p, "text", None):
                                parts_text.append(p.text)
                res_text = "".join(parts_text).strip()

            if not res_text:
                raise ResponseFormatError(f"Gemini ({selected_model}) returned empty text response.", provider=self.identity)

            return clean_llm_response(res_text)

        except asyncio.TimeoutError:
            raise TimeoutError(f"Gemini ({selected_model}) timed out after 20.0s.", provider=self.identity)
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "resource_exhausted" in err_str or "quota exceeded" in err_str:
                raise RateLimitError(f"Gemini ({selected_model}) quota exhausted: {e}", provider=self.identity)
            elif "503" in err_str or "unavailable" in err_str or "high demand" in err_str:
                raise ServiceUnavailableError(f"Gemini ({selected_model}) unavailable: {e}", provider=self.identity)
            elif "401" in err_str or "403" in err_str or "api_key_invalid" in err_str or "permission_denied" in err_str:
                raise AuthenticationError(f"Gemini ({selected_model}) authentication failed: {e}", provider=self.identity)
            elif "402" in err_str or "billing" in err_str:
                raise BillingExhaustionError(f"Gemini ({selected_model}) billing error: {e}", provider=self.identity)
            elif "404" in err_str or "not found" in err_str or "retired" in err_str or "410" in err_str:
                raise EndpointRetiredError(f"Gemini ({selected_model}) model not found or retired: {e}", provider=self.identity)
            elif isinstance(e, ProviderError):
                raise e
            else:
                raise ConnectivityError(f"Gemini ({selected_model}) communication error: {e}", provider=self.identity)


class BaseOpenAICompatibleProvider(BaseLLMProvider):
    """Base class for HTTP-based OpenAI-compatible inference endpoints."""

    def __init__(self, provider_id: str, default_url: str, default_model: str, key_env_var: str):
        self._id = provider_id
        self._default_url = default_url
        self._default_model = default_model
        self._key_env_var = key_env_var

    @property
    def identity(self) -> str:
        return self._id

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            text_generation=True,
            structured_output=True,
            tool_calling=False,
            vision=False,
            streaming=True,
            long_context=False,
            research_suitable=True,
        )

    def is_configured(self) -> bool:
        cfg = reload_config()
        if self._id == "ollama":
            return bool(cfg.get("ollama_base"))
        return bool(cfg.get(self._key_env_var))

    async def check_health(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "unconfigured", "provider": self.identity}
        cfg = reload_config()
        base_url = self.get_base_url(cfg)
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(base_url.rstrip("/") + "/models")
                if resp.status_code in (200, 401):  # 401 means endpoint reached
                    return {"status": "healthy", "provider": self.identity}
                return {"status": "unhealthy", "provider": self.identity, "code": resp.status_code}
        except Exception as e:
            return {"status": "unhealthy", "provider": self.identity, "error": str(e)}

    def get_base_url(self, cfg: Dict[str, Any]) -> str:
        if self._id == "ollama":
            return cfg.get("ollama_base", self._default_url)
        return self._default_url

    def get_api_key(self, cfg: Dict[str, Any]) -> str:
        return cfg.get(self._key_env_var, "")

    def get_model(self, cfg: Dict[str, Any]) -> str:
        return cfg.get(f"{self._id}_model", self._default_model)

    async def generate(
        self,
        prompt: str,
        system_instruction: str,
        schema: Optional[Type[BaseModel]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        cfg = reload_config()
        api_key = self.get_api_key(cfg)
        base_url = self.get_base_url(cfg)
        selected_model = model or self.get_model(cfg)

        if not self.is_configured() and self._id != "ollama":
            raise AuthenticationError(f"API key missing for provider '{self.identity}'", provider=self.identity)

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
            "Authorization": f"Bearer {api_key or 'none'}",
            "Content-Type": "application/json",
        }
        if "openrouter.ai" in base_url:
            headers["HTTP-Referer"] = "https://github.com/markalvincadangin/CONVERA"
            headers["X-Title"] = "CONVERA Platform"

        payload: Dict[str, Any] = {
            "model": selected_model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 3500,
        }

        url = f"{base_url.rstrip('/')}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 429:
                    raise RateLimitError(f"{self.identity} returned HTTP 429: {resp.text}", provider=self.identity)
                elif resp.status_code == 402:
                    raise BillingExhaustionError(f"{self.identity} returned HTTP 402: {resp.text}", provider=self.identity)
                elif resp.status_code in (502, 503, 504):
                    raise ServiceUnavailableError(f"{self.identity} returned HTTP {resp.status_code}: {resp.text}", provider=self.identity)
                elif resp.status_code in (401, 403):
                    raise AuthenticationError(f"{self.identity} returned HTTP {resp.status_code}: {resp.text}", provider=self.identity)
                elif resp.status_code == 410:
                    raise EndpointRetiredError(f"{self.identity} returned HTTP 410: {resp.text}", provider=self.identity)
                elif resp.status_code == 422:
                    raise InvalidInputError(f"{self.identity} returned HTTP 422: {resp.text}", provider=self.identity)
                elif resp.status_code != 200:
                    raise RecoverableProviderError(f"{self.identity} returned HTTP {resp.status_code}: {resp.text}", provider=self.identity, status_code=resp.status_code)

                data = resp.json()
                if "choices" not in data or not data["choices"]:
                    raise ResponseFormatError(f"{self.identity} returned invalid structure: missing choices", provider=self.identity)

                raw_text = data["choices"][0]["message"]["content"]
                if not raw_text or not raw_text.strip():
                    raise ResponseFormatError(f"{self.identity} returned empty message content", provider=self.identity)

                return clean_llm_response(raw_text.strip())

        except httpx.TimeoutException:
            raise TimeoutError(f"{self.identity} request timed out after 30.0s", provider=self.identity)
        except httpx.ConnectError as e:
            raise ConnectivityError(f"{self.identity} connection error: {e}", provider=self.identity)
        except (RateLimitError, BillingExhaustionError, ServiceUnavailableError, AuthenticationError, EndpointRetiredError, InvalidInputError, ResponseFormatError):
            raise
        except Exception as e:
            raise ConnectivityError(f"{self.identity} unexpected HTTP client failure: {e}", provider=self.identity)


class GroqProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="groq",
            default_url="https://api.groq.com/openai/v1",
            default_model="openai/gpt-oss-20b",
            key_env_var="groq_key"
        )


class OpenRouterProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="openrouter",
            default_url="https://openrouter.ai/api/v1",
            default_model="nvidia/nemotron-3.5-lightning:free",
            key_env_var="openrouter_key"
        )


class OllamaProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="ollama",
            default_url="http://localhost:11434/v1",
            default_model="llama3.2",
            key_env_var="ollama_base"
        )


class CerebrasProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="cerebras",
            default_url="https://api.cerebras.ai/v1",
            default_model="llama-3.3-70b",
            key_env_var="cerebras_key"
        )


class GitHubProvider(BaseOpenAICompatibleProvider):
    def __init__(self):
        super().__init__(
            provider_id="github",
            default_url="https://models.inference.ai.azure.com",
            default_model="gpt-4o-mini",
            key_env_var="github_token"
        )


# ---------------------------------------------------------------------------
# Synthetic Fallback Provider (Safe Workflow Continuity Scaffolding Only)
# ---------------------------------------------------------------------------

class SyntheticFallbackProvider(BaseLLMProvider):
    """
    Deterministic degraded-mode continuity provider.
    Strictly prohibited from generating fabricated citations, simulated statistics,
    or pseudo-research problems.
    Enforces is_degraded = True, is_evidentiary = False, weight = 0.0, tier = 'SIGNAL'.
    """

    @property
    def identity(self) -> str:
        return "synthetic_fallback"

    @property
    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            text_generation=True,
            structured_output=False,
            tool_calling=False,
            vision=False,
            streaming=False,
            long_context=False,
            research_suitable=False,
        )

    def is_configured(self) -> bool:
        return True

    async def check_health(self) -> Dict[str, Any]:
        return {"status": "ok", "provider": self.identity, "mode": "deterministic_scaffolding"}

    async def generate(
        self,
        prompt: str,
        system_instruction: str,
        schema: Optional[Type[BaseModel]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        return (
            "# Research Discovery Unavailable (Degraded Offline Mode)\n\n"
            "The automated AI provider cascade is currently unavailable.\n"
            "No empirical claims or evidence were generated.\n\n"
            "### Recommended Actions:\n"
            "1. **Manual Entry**: Log your observed problem or pain point manually via the Problem Bank.\n"
            "2. **Literature Verification**: Use external connectors (OpenAlex / Crossref) to search peer-reviewed evidence directly.\n"
            "3. **Check Providers**: Verify your internet connection, API keys, or local Ollama runtime status."
        )


# Global registry of provider instances
PROVIDER_REGISTRY: Dict[str, BaseLLMProvider] = {
    "gemini": GeminiProvider(),
    "groq": GroqProvider(),
    "openrouter": OpenRouterProvider(),
    "ollama": OllamaProvider(),
    "cerebras": CerebrasProvider(),
    "github": GitHubProvider(),
    "synthetic_fallback": SyntheticFallbackProvider(),
}


# ---------------------------------------------------------------------------
# Provider Status & Introspection API
# ---------------------------------------------------------------------------

def get_active_provider_info() -> Dict[str, Any]:
    """Report LLM gateway provider status, cooldown state, and active configuration."""
    cfg = reload_config()
    primary = cfg.get("provider", "gemini")
    providers_info = {}

    for name, provider in PROVIDER_REGISTRY.items():
        is_conf = provider.is_configured()
        cooldown_status = GLOBAL_COOLDOWN_TRACKER.get_status(name)
        caps = provider.capabilities
        providers_info[name] = {
            "identity": name,
            "configured": is_conf,
            "available": GLOBAL_COOLDOWN_TRACKER.is_available(name) if is_conf else False,
            "cooldown_state": cooldown_status,
            "capabilities": {
                "text_generation": caps.text_generation,
                "structured_output": caps.structured_output,
                "research_suitable": caps.research_suitable,
            }
        }

    return {
        "primary_provider": primary,
        "providers": providers_info,
        "total_providers": len(providers_info),
    }


# ---------------------------------------------------------------------------
# Universal Generation Gateway with Multi-Provider Failover Cascade
# ---------------------------------------------------------------------------

async def generate_with_meta(
    system_instruction: str,
    prompt: str,
    history: Optional[List[Dict[str, str]]] = None,
    task_category: Optional[TaskCategory] = None,
    schema: Optional[Type[BaseModel]] = None,
    preferred_provider: Optional[str] = None,
) -> GatewayResult:
    """
    Universal Generation Gateway that returns a canonical GatewayResult.
    Governed cascade order, cooldown bypass, two-dimensional error handling,
    and safe synthetic fallback continuity.
    """
    # 1. Inspect request-level boundaries (Prompt Injection & Invalid Input)
    check_security_boundary(prompt, system_instruction)

    cfg = reload_config()
    primary_provider = (preferred_provider or cfg.get("provider") or "gemini").lower()
    t0 = time.time()
    req_id = str(uuid.uuid4())

    # 2. Build candidate cascade list
    gemini_models = [cfg.get("gemini_model"), "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.6-flash", "gemini-3.5-flash"]
    groq_models = [cfg.get("groq_model"), "openai/gpt-oss-20b", "groq/compound-mini", "openai/gpt-oss-120b"]
    openrouter_models = [cfg.get("openrouter_model"), "nvidia/nemotron-3.5-lightning:free", "inclusionai/ling-3.0-flash-fin:free"]
    cerebras_models = [cfg.get("cerebras_model"), "llama-3.3-70b", "llama3.1-8b"]
    github_models = [cfg.get("github_model"), "gpt-4o-mini", "Meta-Llama-3.3-70B-Instruct"]
    ollama_models = [cfg.get("ollama_model"), "llama3.2"]

    cascade_specs: List[Tuple[str, Optional[str]]] = []

    def add_provider(p_name: str, models: List[Optional[str]]):
        prov = PROVIDER_REGISTRY.get(p_name)
        if prov and prov.is_configured():
            for m in models:
                if m and (p_name, m) not in cascade_specs:
                    cascade_specs.append((p_name, m))

    # Priority ordering according to user preference
    provider_order = [primary_provider]
    for p in ["gemini", "groq", "cerebras", "github", "openrouter", "ollama"]:
        if p not in provider_order:
            provider_order.append(p)

    for p in provider_order:
        if p == "gemini":
            add_provider("gemini", gemini_models)
        elif p == "groq":
            add_provider("groq", groq_models)
        elif p == "cerebras":
            add_provider("cerebras", cerebras_models)
        elif p == "github":
            add_provider("github", github_models)
        elif p == "openrouter":
            add_provider("openrouter", openrouter_models)
        elif p == "ollama":
            add_provider("ollama", ollama_models)

    attempted_providers: List[str] = []
    last_error: Optional[Exception] = None
    fallback_used = False
    fallback_reason: Optional[str] = None

    # 3. Execute cascade
    for prov_name, model_name in cascade_specs:
        prov_adapter = PROVIDER_REGISTRY.get(prov_name)
        if not prov_adapter or not prov_adapter.is_configured():
            continue

        # Cooldown check: bypass if cooling down or suppressed
        if not GLOBAL_COOLDOWN_TRACKER.is_available(prov_name):
            logger.info(f"[Cascade] Skipping {prov_name} (in cooldown or suppressed).")
            continue

        prov_model_id = f"{prov_name}:{model_name}"
        attempted_providers.append(prov_model_id)

        # Attempt generation on provider (with bounded 1x retry on ResponseFormatError)
        for attempt in range(2):
            try:
                content = await prov_adapter.generate(
                    prompt=prompt,
                    system_instruction=system_instruction,
                    schema=schema,
                    history=history,
                    model=model_name,
                )

                latency = round(time.time() - t0, 3)
                provenance = RuntimeProvenance(
                    provider=prov_name,
                    model=model_name or "default",
                    primary_provider=primary_provider,
                    attempted_providers=attempted_providers,
                    fallback_used=fallback_used,
                    fallback_reason=fallback_reason,
                    latency_seconds=latency,
                    request_id=req_id,
                )
                epistemic = EpistemicStatus(
                    is_evidentiary=False,
                    evidence_tier="SIGNAL",
                    evidence_weight=0.0,
                    provenance_lineage=f"{prov_name}:{model_name}",
                )

                return GatewayResult(
                    content=content,
                    is_degraded=False,
                    runtime_provenance=provenance,
                    epistemic_status=epistemic,
                )

            except TerminalRequestError:
                # Terminal request errors (400, 422) MUST NOT cascade
                raise

            except ResponseFormatError as rfe:
                last_error = rfe
                if attempt == 0:
                    logger.warning(f"[Retry] ResponseFormatError on {prov_model_id}. Retrying once with formatting reminder.")
                    continue
                else:
                    logger.warning(f"[Cascade] ResponseFormatError persisted on {prov_model_id}. Cascading to next provider.")
                    fallback_used = True
                    fallback_reason = f"ResponseFormatError on {prov_model_id}"
                    break

            except ProviderError as pe:
                last_error = pe
                GLOBAL_COOLDOWN_TRACKER.mark_cooldown(prov_name, pe)
                fallback_used = True
                fallback_reason = f"{type(pe).__name__}: {str(pe)}"
                logger.warning(f"[Cascade] Provider {prov_model_id} failed: {pe}. Cascading...")
                await asyncio.sleep(0.05)
                break

            except Exception as e:
                last_error = e
                # Wrap untyped exception into RecoverableProviderError
                wrapped_error = ConnectivityError(f"Unhandled provider failure: {e}", provider=prov_name)
                GLOBAL_COOLDOWN_TRACKER.mark_cooldown(prov_name, wrapped_error)
                fallback_used = True
                fallback_reason = f"Unhandled: {str(e)}"
                logger.warning(f"[Cascade] Provider {prov_model_id} unexpected failure: {e}. Cascading...")
                await asyncio.sleep(0.05)
                break

    # 4. Cascade Exhaustion -> Safe Synthetic Fallback Scaffolding
    logger.warning(f"[Cascade Exhausted] All configured providers failed. Last error: {last_error}. Transitioning to Synthetic Fallback.")
    synthetic_adapter = PROVIDER_REGISTRY["synthetic_fallback"]
    fallback_content = await synthetic_adapter.generate(
        prompt=prompt,
        system_instruction=system_instruction,
        schema=schema,
        history=history,
    )

    latency = round(time.time() - t0, 3)
    synthetic_provenance = RuntimeProvenance(
        provider="synthetic_fallback",
        model="deterministic_scaffolding",
        primary_provider=primary_provider,
        attempted_providers=attempted_providers,
        fallback_used=True,
        fallback_reason=f"Cascade exhausted. Last error: {last_error}",
        latency_seconds=latency,
        request_id=req_id,
    )
    synthetic_epistemic = EpistemicStatus(
        is_evidentiary=False,
        evidence_tier="SIGNAL",
        evidence_weight=0.0,
        provenance_lineage="synthetic_fallback:deterministic_scaffolding",
    )

    return GatewayResult(
        content=fallback_content,
        is_degraded=True,
        runtime_provenance=synthetic_provenance,
        epistemic_status=synthetic_epistemic,
        error=str(last_error) if last_error else "Cascade exhausted",
    )


# ---------------------------------------------------------------------------
# Legacy Compatibility Layer
# ---------------------------------------------------------------------------

# [LEGACY COMPATIBILITY API - DO NOT USE FOR NEW COMPONENTS]
async def generate_response_with_fallback(
    system_instruction: str,
    prompt: str,
    history: Optional[List[Dict[str, str]]] = None,
    task_category: Optional[TaskCategory] = None,
) -> str:
    """
    Legacy backward-compatible adapter returning raw text.
    Delegates to generate_with_meta() internally.
    """
    result = await generate_with_meta(
        system_instruction=system_instruction,
        prompt=prompt,
        history=history,
        task_category=task_category,
    )
    return result.content


# Standalone legacy function aliases
async def call_gemini_native(
    system_instruction: str,
    prompt: str,
    history: Optional[List[Dict[str, str]]] = None,
    model: str = "gemini-3.5-flash-lite",
) -> str:
    gemini = PROVIDER_REGISTRY["gemini"]
    return await gemini.generate(
        prompt=prompt,
        system_instruction=system_instruction,
        history=history,
        model=model,
    )


async def call_openai_compatible_api(
    base_url: str,
    api_key: str,
    model: str,
    system_instruction: str,
    prompt: str,
    history: Optional[List[Dict[str, str]]] = None,
) -> str:
    # Generic wrapper for compatibility
    temp_provider = BaseOpenAICompatibleProvider(
        provider_id="generic",
        default_url=base_url,
        default_model=model,
        key_env_var=""
    )
    # inject values directly for standalone call
    temp_provider.get_base_url = lambda cfg: base_url
    temp_provider.get_api_key = lambda cfg: api_key
    temp_provider.get_model = lambda cfg: model
    temp_provider.is_configured = lambda: bool(api_key or "localhost" in base_url)
    return await temp_provider.generate(
        prompt=prompt,
        system_instruction=system_instruction,
        history=history,
        model=model,
    )
