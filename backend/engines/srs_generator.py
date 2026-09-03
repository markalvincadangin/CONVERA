"""
Software Requirements Specification (SRS) & MVP Architecture Generator for RatchetAI (Step 3 Foundation)
Translates validated problem dossiers, Mom Test interview proof, and Phase 4 mechanisms into:
1. Executive Scope (In-Scope vs. Out-of-Scope)
2. Primary Persona & User Journeys
3. Functional Requirements (FR-001 ... FR-008 with Acceptance Criteria)
4. Non-Functional Constraints (Performance, Security, Low-Bandwidth/Offline)
5. Lean System Architecture Blueprint
6. MVP Success Metrics & Validation Rubric
"""

import re
import json
from typing import Any, Dict, List, Optional
from llm_gateway import generate_response_with_fallback


async def generate_project_srs(
    session_data: Dict[str, Any],
    mode: str = "CAPSTONE"
) -> Dict[str, Any]:
    """
    Generate an engineering-grade Software Requirements Specification (SRS).
    """
    problem_stmt = session_data.get("phase3_problem") or session_data.get("problem_statement") or "Validated Technopreneurship Problem"
    p1_resp = session_data.get("phase1_response") or ""
    p4_resp = session_data.get("phase4_response") or ""
    p5_resp = session_data.get("phase5_response") or ""
    project_name = session_data.get("project_name") or "RatchetAI Capstone Project"

    prompt = f"""You are a Senior Principal Software Architect and Academic Capstone Director (aligned with IEEE 830 / CHED CICT Standards).
Translate the following validated problem, Mom Test proof, and solution mechanism into an engineering-grade Software Requirements Specification (SRS) for a lean MVP.

PROJECT NAME: {project_name}
MODE: {mode} (Academic Capstone & Startup MVP)

INPUT CONTEXT:
- Validated Problem Statement: {problem_stmt}
- Phase 1 Discovery & Field Context: {p1_resp[:600]}
- Phase 4 Solution Mechanism & Architecture: {p4_resp[:800]}
- Phase 5 Business Model & Constraints: {p5_resp[:600]}

OUTPUT FORMAT (STRICT JSON ONLY without markdown ticks):
{{
  "project_title": "Clean, descriptive system name (e.g. AgriCool: Decentralized Cold-Chain IoT Monitor)",
  "executive_summary": "3-4 crisp sentences defining what the system does, who it serves, and the core friction it solves.",
  "scope": {{
    "in_scope": [
      "Core MVP Feature 1 (e.g. Real-time temperature & humidity telemetry)",
      "Core MVP Feature 2 (e.g. SMS alert broadcast for threshold breaches)",
      "Core MVP Feature 3 (e.g. Offline-first local data caching)"
    ],
    "out_of_scope": [
      "Explicitly deferred complex feature 1 (e.g. Automated drone dispatch)",
      "Explicitly deferred complex feature 2 (e.g. Multi-currency international payment gateway)"
    ]
  }},
  "primary_persona": {{
    "name": "Specific Sufferer Role (e.g. Mang Danilo, Smallholder Onion Grower)",
    "context": "Location & working environment",
    "primary_goal": "What they need to achieve without friction",
    "core_frustration": "What currently breaks in their daily workflow"
  }},
  "functional_requirements": [
    {{
      "id": "FR-001",
      "title": "Short title",
      "user_story": "As a [user], I want to [action] so that [benefit].",
      "acceptance_criteria": [
        "Given [precondition], when [action], then [expected result].",
        "Criterion 2"
      ]
    }},
    {{
      "id": "FR-002",
      "title": "Short title",
      "user_story": "As a [user], I want to [action] so that [benefit].",
      "acceptance_criteria": [
        "Given [precondition], when [action], then [expected result]."
      ]
    }},
    {{
      "id": "FR-003",
      "title": "Short title",
      "user_story": "As a [user], I want to [action] so that [benefit].",
      "acceptance_criteria": [
        "Given [precondition], when [action], then [expected result]."
      ]
    }},
    {{
      "id": "FR-004",
      "title": "Short title",
      "user_story": "As a [user], I want to [action] so that [benefit].",
      "acceptance_criteria": [
        "Given [precondition], when [action], then [expected result]."
      ]
    }}
  ],
  "non_functional_requirements": [
    {{
      "id": "NFR-001",
      "category": "Performance / Latency",
      "requirement": "System shall respond to user inputs within 200ms.",
      "metric": "< 200ms P95"
    }},
    {{
      "id": "NFR-002",
      "category": "Offline & Low-Bandwidth Resilience",
      "requirement": "System shall support local caching and sync queued transactions when 3G/4G connectivity resumes.",
      "metric": "100% data retention during brownouts"
    }},
    {{
      "id": "NFR-003",
      "category": "Security & Data Privacy",
      "requirement": "All user identifiers and financial records must be encrypted at rest and in transit.",
      "metric": "AES-256 / TLS 1.3"
    }}
  ],
  "architecture_blueprint": {{
    "frontend": "e.g. Next.js 16 (App Router) + TailwindCSS + PWA Offline Worker",
    "backend": "e.g. FastAPI / Python or Spring Boot 3.5 with REST endpoints",
    "database": "e.g. PostgreSQL / SQLite WAL with local client storage",
    "offline_sync_strategy": "e.g. IndexedDB client queue with timestamped conflict resolution"
  }},
  "mvp_validation_metrics": [
    {{
      "metric_name": "Core Friction Reduction",
      "target_threshold": "e.g. > 50% reduction in reporting time",
      "verification_method": "Pre/post time-motion observation in field"
    }},
    {{
      "metric_name": "User Task Completion Rate",
      "target_threshold": "> 90% unassisted task completion",
      "verification_method": "Usability testing with 10 actual sufferers"
    }}
  ]
}}
"""

    try:
        resp = await generate_response_with_fallback(
            system_instruction="You are an expert capstone software architect. Return strict JSON only without markdown ticks.",
            prompt=prompt,
        )
        cleaned_json = re.sub(r"^```[a-z]*\s*", "", resp.strip(), flags=re.IGNORECASE)
        cleaned_json = re.sub(r"\s*```$", "", cleaned_json).strip()
        data = json.loads(cleaned_json)

        # Generate markdown export document
        data["markdown_document"] = format_srs_markdown(data)
        return data
    except Exception as err:
        print(f"[!] SRS generator fallback: {err}")
        fallback_data = {
            "project_title": f"{project_name} - MVP Software Requirements Specification",
            "executive_summary": f"System engineered to solve: {problem_stmt}.",
            "scope": {
                "in_scope": [
                    "Core telemetry and field data capture",
                    "Offline-first mobile logging for target sufferers",
                    "Automated alert broadcasting and reporting dashboard",
                ],
                "out_of_scope": [
                    "Third-party enterprise ERP integration",
                    "Automated international financial clearing",
                ],
            },
            "primary_persona": {
                "name": "Target Community Sufferer",
                "context": "Western Visayas / Iloilo local environment",
                "primary_goal": "Eliminate manual friction and recurring financial loss",
                "core_frustration": "Lack of real-time visibility and reliance on manual workarounds",
            },
            "functional_requirements": [
                {
                    "id": "FR-001",
                    "title": "Incident & Status Capture",
                    "user_story": "As a field operator, I want to record telemetry offline so that data is preserved without cellular signal.",
                    "acceptance_criteria": [
                        "Given offline status, when user logs an entry, it is stored in local IndexedDB.",
                        "Given network reconnection, data is synchronized automatically to central server.",
                    ],
                },
                {
                    "id": "FR-002",
                    "title": "Real-Time Threshold Alerts",
                    "user_story": "As a user, I want instant notifications when risk limits are breached so that I can take corrective action.",
                    "acceptance_criteria": [
                        "Given a critical metric breach, an SMS/push notification is dispatched within 5 seconds.",
                    ],
                },
            ],
            "non_functional_requirements": [
                {
                    "id": "NFR-001",
                    "category": "Offline Resilience",
                    "requirement": "System shall cache at least 7 days of operational data locally.",
                    "metric": "100% offline persistence",
                },
                {
                    "id": "NFR-002",
                    "category": "Accessibility & Touch Targets",
                    "requirement": "All touch targets must satisfy minimum 44x44px for field mobile usage.",
                    "metric": "WCAG 2.2 AA compliant",
                },
            ],
            "architecture_blueprint": {
                "frontend": "Next.js 16 + PWA Service Worker + TailwindCSS",
                "backend": "Python FastAPI + SQLite WAL Database",
                "database": "SQLite 3 with WAL Journaling",
                "offline_sync_strategy": "Background Sync API + IndexedDB queue",
            },
            "mvp_validation_metrics": [
                {
                    "metric_name": "Task Completion Rate",
                    "target_threshold": "> 90% unassisted completion",
                    "verification_method": "Mom Test usability trials with 10 target users",
                }
            ],
        }
        fallback_data["markdown_document"] = format_srs_markdown(fallback_data)
        return fallback_data


def format_srs_markdown(srs: Dict[str, Any]) -> str:
    """Format the structured SRS into a standard markdown document."""
    lines = [
        f"# Software Requirements Specification (SRS)",
        f"## {srs.get('project_title', 'Capstone Project Specification')}",
        f"",
        f"### 1. Executive Summary",
        f"{srs.get('executive_summary', '')}",
        f"",
        f"### 2. Project Scope",
        f"#### 2.1 In-Scope (MVP Deliverables):",
    ]
    for item in srs.get("scope", {}).get("in_scope", []):
        lines.append(f"- **[IN]** {item}")

    lines.append(f"\n#### 2.2 Out-of-Scope (Deferred):")
    for item in srs.get("scope", {}).get("out_of_scope", []):
        lines.append(f"- **[OUT]** {item}")

    persona = srs.get("primary_persona", {})
    lines.extend([
        f"",
        f"### 3. Target User Persona",
        f"- **Persona Name / Role**: {persona.get('name', '')}",
        f"- **Operating Context**: {persona.get('context', '')}",
        f"- **Primary Goal**: {persona.get('primary_goal', '')}",
        f"- **Core Frustration**: {persona.get('core_frustration', '')}",
        f"",
        f"### 4. Functional Requirements (IEEE 830 Matrix)",
    ])

    for fr in srs.get("functional_requirements", []):
        lines.append(f"#### {fr.get('id')}: {fr.get('title')}")
        lines.append(f"- **User Story**: {fr.get('user_story')}")
        lines.append(f"- **Acceptance Criteria**:")
        for ac in fr.get("acceptance_criteria", []):
            lines.append(f"  - {ac}")
        lines.append("")

    lines.extend([
        f"### 5. Non-Functional Requirements (Constraints)",
    ])
    for nfr in srs.get("non_functional_requirements", []):
        lines.append(f"- **[{nfr.get('id')}] {nfr.get('category')}**: {nfr.get('requirement')} (*Target: {nfr.get('metric')}*)")

    arch = srs.get("architecture_blueprint", {})
    lines.extend([
        f"",
        f"### 6. System Architecture Blueprint",
        f"- **Frontend**: {arch.get('frontend')}",
        f"- **Backend**: {arch.get('backend')}",
        f"- **Database**: {arch.get('database')}",
        f"- **Offline / Sync Strategy**: {arch.get('offline_sync_strategy')}",
        f"",
        f"### 7. MVP Validation & Success Rubric",
    ])
    for m in srs.get("mvp_validation_metrics", []):
        lines.append(f"- **{m.get('metric_name')}**: Target {m.get('target_threshold')} (*Verification: {m.get('verification_method')}*)")

    return "\n".join(lines)
