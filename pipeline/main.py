from __future__ import annotations

"""
Technopreneurship Multi-Agent Pipeline CLI v1.1
Evidence-Ratcheted Problem-to-Solution Multi-Agent System
Iloilo Technopreneurship Program

Phases:
  Phase 1 - Discovery (Automated Iloilo landscape research)
  Phase 2 - Screening & Shortlisting (Batch 10-column scorecard)
  Phase 3 - Problem Validation (Strict 6-level Mom Test clinic)
  Phase 4 - Solution Ideation (15 mechanism families & SVB canvas)
  Phase 5 - Solution Validation & MVP Testing (Build-Measure-Learn audit)
"""

import os
import sys
import io
import time
import json
import warnings
from pathlib import Path
from datetime import datetime

# Filter harmless AFC recommendation notices and internal logs
warnings.filterwarnings("ignore")
import logging
logging.getLogger("google.genai").setLevel(logging.ERROR)
logging.getLogger("google.adk").setLevel(logging.ERROR)


os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

if sys.platform == "win32":
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "buffer"):
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from rich.prompt import Prompt, Confirm
from rich.align import Align
from rich import box

load_dotenv()

console = Console(safe_box=True)


# ─────────────────────────────────────────────────────────
# Session State Management
# ─────────────────────────────────────────────────────────

SESSIONS_DIR = Path(__file__).parent / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)


def load_session(session_id: str) -> dict:
    path = SESSIONS_DIR / f"{session_id}.json"
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"session_id": session_id, "created_at": datetime.now().isoformat()}


def save_session(session_id: str, state: dict) -> None:
    path = SESSIONS_DIR / f"{session_id}.json"
    state["updated_at"] = datetime.now().isoformat()
    path.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def list_sessions() -> list[str]:
    return [p.stem for p in SESSIONS_DIR.glob("*.json")]


# ─────────────────────────────────────────────────────────
# ADK Agent Setup
# ─────────────────────────────────────────────────────────

def create_agents():
    """Create and return all 5 pipeline agents."""
    try:
        from google.adk.agents import LlmAgent
    except ImportError:
        console.print("[bold red]ERROR: google-adk is not installed. Run: pip install -r requirements.txt[/bold red]")
        sys.exit(1)

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        console.print("[bold red]ERROR: GOOGLE_API_KEY not found in .env file.[/bold red]")
        console.print("[yellow]Please copy .env.example to .env and set your free Google AI Studio key.[/yellow]")
        sys.exit(1)

    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    enable_search = os.getenv("ENABLE_GOOGLE_SEARCH", "false").lower() in ("true", "1", "yes")

    from prompts.phase1_system import PHASE1_SYSTEM
    from prompts.phase2_system import PHASE2_SYSTEM
    from prompts.phase3_system import PHASE3_SYSTEM
    from prompts.phase4_system import PHASE4_SYSTEM
    from prompts.phase5_system import PHASE5_SYSTEM

    # Phase 1: Research agent (optional search tool if configured)
    tools = []
    if enable_search:
        try:
            from google.adk.tools import google_search
            tools = [google_search]
        except Exception:
            pass

    phase1_agent = LlmAgent(
        name="phase1_researcher",
        model=model,
        instruction=PHASE1_SYSTEM,
        description="Phase 1: Iloilo problem discovery research",
        tools=tools,
    )

    phase2_agent = LlmAgent(
        name="phase2_screener",
        model=model,
        instruction=PHASE2_SYSTEM,
        description="Phase 2: Batch problem screener",
    )

    phase3_agent = LlmAgent(
        name="phase3_validator",
        model=model,
        instruction=PHASE3_SYSTEM,
        description="Phase 3: Problem validation clinic",
    )

    phase4_agent = LlmAgent(
        name="phase4_ideator",
        model=model,
        instruction=PHASE4_SYSTEM,
        description="Phase 4: Solution ideation & hypothesis formation",
    )

    phase5_agent = LlmAgent(
        name="phase5_validator",
        model=model,
        instruction=PHASE5_SYSTEM,
        description="Phase 5: Solution validation & MVP experimentation",
    )

    return phase1_agent, phase2_agent, phase3_agent, phase4_agent, phase5_agent


# ─────────────────────────────────────────────────────────
# Agent Turn Runner with Live Spinner & Auto-Retry
# ─────────────────────────────────────────────────────────

def run_agent_turn(agent, message: str, history: list[dict], status_text: str = "Synthesizing insights with AI agent...") -> str:
    """
    Run a single turn with an ADK LlmAgent.
    Includes animated spinner and exponential backoff retry for transient API errors (503/429).
    """
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.genai import types as genai_types
    import asyncio

    session_service = InMemorySessionService()

    runner = Runner(
        agent=agent,
        app_name="technopreneurship_pipeline",
        session_service=session_service,
    )

    async def _execute_call():
        session = await session_service.create_session(
            app_name="technopreneurship_pipeline",
            user_id="student",
        )

        parts = []
        for turn in history:
            role = "user" if turn["role"] == "user" else "model"
            parts.append(genai_types.Content(
                role=role,
                parts=[genai_types.Part(text=turn["content"])]
            ))

        new_message = genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=message)]
        )

        response_text = ""
        async for event in runner.run_async(
            user_id="student",
            session_id=session.id,
            new_message=new_message,
        ):
            if event.is_final_response() and event.content:
                for part in event.content.parts:
                    if part.text:
                        response_text += part.text

        return response_text

    max_retries = 3
    delay = 2.0

    with console.status(f"[bold cyan]🤖 {status_text}[/bold cyan]", spinner="dots"):
        for attempt in range(1, max_retries + 1):
            try:
                return asyncio.run(_execute_call())
            except Exception as e:
                err_str = str(e)
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    if attempt < max_retries:
                        time.sleep(delay)
                        delay *= 2
                        continue
                    else:
                        console.print("\n[bold yellow]⚠️ High demand on the model. Please wait a few seconds and try again.[/bold yellow]")
                        raise e
                elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    console.print("\n[bold yellow]⚠️ Free tier rate limit reached. Waiting 5 seconds before retry...[/bold yellow]")
                    time.sleep(5)
                    if attempt < max_retries:
                        continue
                    raise e
                else:
                    console.print(f"\n[bold red]API Error:[/bold red] {e}")
                    raise e


# ─────────────────────────────────────────────────────────
# UI Headers, HUD & Visual Elements
# ─────────────────────────────────────────────────────────

def print_banner():
    banner_text = (
        "[bold cyan]╔═══════════════════════════════════════════════════════════════════════════════════════╗[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]   [bold white]████████╗███████╗ ██████╗██╗  ██╗███╗   ██╗ ██████╗      █████╗ ██╗[/bold white]                 [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]   [bold white]╚══██╔══╝██╔════╝██╔════╝██║  ██║████╗  ██║██╔═══██╗    ██╔══██╗██║[/bold white]                 [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]      [bold white]██║   █████╗  ██║     ███████║██╔██╗ ██║██║   ██║    ███████║██║[/bold white]                 [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]      [bold white]██║   ██╔══╝  ██║     ██╔══██║██║╚██╗██║██║   ██║    ██╔══██║██║[/bold white]                 [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]      [bold white]██║   ███████╗╚██████╗██║  ██║██║ ╚████║╚██████╔╝    ██║  ██║██║[/bold white]                 [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]      [bold white]╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═╝╚═╝[/bold white]                 [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]               [bold green]EVIDENCE-RATCHETED PROBLEM-TO-SOLUTION PIPELINE v1.1[/bold green]                    [bold cyan]║[/bold cyan]\n"
        "[bold cyan]║[/bold cyan]                         [dim]Iloilo Technopreneurship Program[/dim]                              [bold cyan]║[/bold cyan]\n"
        "[bold cyan]╚═══════════════════════════════════════════════════════════════════════════════════════╝[/bold cyan]"
    )
    console.print(banner_text)


def render_session_hud(state: dict):
    """Render a clean status dashboard showing progress across all 5 phases."""
    p1 = "[bold green]🟢 Phase 1: Discovered[/bold green]" if state.get("phase1_complete") else "[dim]⚪ Phase 1: Discovery[/dim]"
    p2 = "[bold green]🟢 Phase 2: Screened[/bold green]" if state.get("phase2_complete") else "[dim]⚪ Phase 2: Screening[/dim]"
    
    # Phase 3 sub-progress
    completed_lvl_count = len(state.get("completed_levels", []))
    if state.get("phase3_complete"):
        p3 = "[bold green]🟢 Phase 3: Validated[/bold green]"
    elif completed_lvl_count > 0:
        p3 = f"[bold yellow]🟡 Phase 3: Level {completed_lvl_count}/6[/bold yellow]"
    else:
        p3 = "[dim]⚪ Phase 3: Validation[/dim]"

    p4 = "[bold green]🟢 Phase 4: Ideated (SVB)[/bold green]" if state.get("phase4_complete") else "[dim]⚪ Phase 4: Ideation[/dim]"
    p5 = "[bold green]🟢 Phase 5: MVP Tested[/bold green]" if state.get("phase5_complete") else "[dim]⚪ Phase 5: MVP Test[/dim]"

    timeline = f"{p1} ➔ {p2} ➔ {p3} ➔ {p4} ➔ {p5}"

    hud_table = Table(show_header=False, box=box.SIMPLE, expand=True)
    hud_table.add_column("Key", style="bold cyan", width=18)
    hud_table.add_column("Value", style="white")

    hud_table.add_row("Session ID", f"[bold yellow]{state.get('session_id')}[/bold yellow]")
    hud_table.add_row("Pipeline Progress", timeline)

    if state.get("phase1_sectors"):
        hud_table.add_row("Target Sectors", ", ".join(state["phase1_sectors"]))
    if state.get("phase4_concepts"):
        hud_table.add_row("Phase 4 Concepts", f"{len(state['phase4_concepts'])} solution concepts generated")

    console.print(Panel(hud_table, title="[bold cyan]Session Dashboard[/bold cyan]", border_style="cyan", box=box.ROUNDED))


def render_phase_menu(state: dict) -> str:
    """Render the interactive selection menu with status badges and descriptions."""
    menu_table = Table(title="Select Pipeline Action", box=box.ROUNDED, expand=True)
    menu_table.add_column("Key", justify="center", style="bold cyan", width=6)
    menu_table.add_column("Phase / Action", style="bold white", width=26)
    menu_table.add_column("Status", width=18)
    menu_table.add_column("Evidence Ratchet / Deliverable", style="dim")

    # Phase 1
    p1_status = "[green]✅ Completed[/green]" if state.get("phase1_complete") else "[cyan]▶ Ready[/cyan]"
    menu_table.add_row("[1]", "Phase 1: Discovery", p1_status, "Landscape signals & Iloilo secondary evidence")

    # Phase 2
    p2_status = "[green]✅ Completed[/green]" if state.get("phase2_complete") else ("[cyan]▶ Ready[/cyan]" if state.get("phase1_complete") else "[dim]⚪ Available (Manual)[/dim]")
    menu_table.add_row("[2]", "Phase 2: Screening", p2_status, "Batch 10-column scorecard + ADVANCE shortlist")

    # Phase 3
    p3_status = "[green]✅ Completed[/green]" if state.get("phase3_complete") else ("[yellow]🟡 In Progress[/yellow]" if state.get("completed_levels") else "[dim]⚪ Ready (Needs P2)[/dim]")
    menu_table.add_row("[3]", "Phase 3: Validation", p3_status, "6-Level Mom Test clinic + Evidence Scorecard")

    # Phase 4
    p4_status = "[green]✅ Completed[/green]" if state.get("phase4_complete") else ("[cyan]▶ Ready[/cyan]" if state.get("phase3_complete") else "[dim]🔒 Locked (Needs P3)[/dim]")
    menu_table.add_row("[4]", "Phase 4: Ideation", p4_status, "15 Mechanism Families, SVB Canvas & Experiment Cards")

    # Phase 5
    p5_status = "[green]✅ Completed[/green]" if state.get("phase5_complete") else ("[cyan]▶ Ready[/cyan]" if state.get("phase4_complete") else "[dim]🔒 Locked (Needs P4)[/dim]")
    menu_table.add_row("[5]", "Phase 5: MVP Testing", p5_status, "Build-Measure-Learn Audit & Pivot Analysis")

    # Utilities
    menu_table.add_section()
    menu_table.add_row("[E]", "Export Dossier", "[bold magenta]Markdown[/bold magenta]", "Generate comprehensive submission Markdown report")
    menu_table.add_row("[H]", "Pipeline Cheatsheet", "[bold blue]Guide[/bold blue]", "View Golden Rule, Mom Test & 15 Mechanism families")
    menu_table.add_row("[S]", "Switch Session", "[dim]Manage[/dim]", "Resume a different session or start a new project")
    menu_table.add_row("[Q]", "Quit", "[dim]Exit[/dim]", "Save state and exit cleanly")

    console.print(menu_table)

    default_choice = (
        "1" if not state.get("phase1_complete") else
        "2" if not state.get("phase2_complete") else
        "3" if not state.get("phase3_complete") else
        "4" if not state.get("phase4_complete") else
        "5" if not state.get("phase5_complete") else "E"
    )

    return Prompt.ask(
        "\n[bold green]Enter your choice[/bold green]",
        choices=["1", "2", "3", "4", "5", "e", "E", "h", "H", "s", "S", "q", "Q", "quit"],
        default=default_choice
    ).upper()


def show_cheatsheet():
    """Display the quick reference cheatsheet of core pipeline principles."""
    cheatsheet_text = """
### 🎯 The Golden Rule of Discovery
> *"Effective ideation searches for problems, each with a concrete, field-ready sufferer definition so you can go out and find people who are already bleeding cash and already spending to cope—no hypotheticals, no solution talk."*

---

### 🛡️ The Mom Test Defense Rules
1. **Talk about their life, not your idea.** (No pitching, no feature explanations).
2. **Ask about specifics in the past, not opinions about the future.** (Past behavior > hypothetical claims).
3. **Talk less and listen more.** (Beware of polite nods: *"That's interesting"* is polite rejection).

---

### ⚙️ 15 Mechanism Families (Phase 4)
1. Prevention | 2. Prediction & Early Warning | 3. Coordination | 4. Information Access | 5. Automation
6. Risk Reduction | 7. Resource Pooling | 8. Economic Restructuring | 9. Matching | 10. Scheduling & Timing
11. Verification & Trust | 12. Behavioral Nudge | 13. Workflow Redesign | 14. Physical & Material | 15. Institutional

---

### 🏆 Behavioral Commitment Hierarchy (Phase 5)
- **Tier 1 (Gold Standard):** Upfront cash deposits, pre-orders, signed purchase contracts, paid pilots.
- **Tier 2 (High):** Replacing daily tools, 2+ hours data entry, rearranging personal workflow.
- **Tier 3 (Medium-High):** Introductions to senior decision-makers, public co-design endorsements.
- **Tier 4 (Medium):** Private contact info, attending 3+ scheduled sessions, sharing internal spreadsheets.
- **Tier 5 (ZERO Weight):** Verbal praise (*"That sounds great, let me know when you launch"*).
"""
    console.print(Panel(Markdown(cheatsheet_text), title="[bold cyan]Pipeline Framework Cheatsheet[/bold cyan]", box=box.DOUBLE, border_style="cyan"))
    Prompt.ask("\nPress [bold green]Enter[/bold green] to return to the menu")


def export_session_dossier(state: dict):
    """Compile and export the entire session history into a presentation-ready Markdown dossier."""
    session_id = state.get("session_id", "session")
    filename = f"{session_id}_dossier.md"
    file_path = SESSIONS_DIR / filename

    content = [
        f"# Technopreneurship Pipeline Dossier: Session {session_id}",
        f"*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*",
        f"*Framework: Evidence-Ratcheted Problem-to-Solution Pipeline v1.1*\n",
        "---",
        "## Executive Summary",
        f"- **Session ID:** `{session_id}`",
        f"- **Phases Completed:** {', '.join([p for p in ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'] if state.get(p.lower().replace(' ', '') + '_complete')])}",
        "\n---",
    ]

    if state.get("phase1_response"):
        content.extend([
            "## Phase 1 — Problem Discovery Landscape",
            state["phase1_response"],
            "\n---"
        ])

    if state.get("phase2_response"):
        content.extend([
            "## Phase 2 — Problem Screening Scorecard",
            state["phase2_response"],
            "\n---"
        ])

    if state.get("phase3_response"):
        content.extend([
            "## Phase 3 — Problem Validation Scorecard & Evidence Funnel",
            state["phase3_response"],
            "\n---"
        ])

    if state.get("phase4_response"):
        content.extend([
            "## Phase 4 — Solution Ideation, SVB Canvas & Experiment Cards",
            state["phase4_response"],
            "\n---"
        ])

    if state.get("phase5_response"):
        content.extend([
            "## Phase 5 — Solution Validation & MVP Test Audit",
            state["phase5_response"],
            "\n---"
        ])

    file_path.write_text("\n\n".join(content), encoding="utf-8")

    console.print(Panel.fit(
        f"[bold green]✅ Full Markdown Dossier exported successfully![/bold green]\n\n"
        f"[white]File saved to:[/white] [bold yellow]{file_path}[/bold yellow]",
        box=box.ROUNDED,
        border_style="green"
    ))
    Prompt.ask("\nPress [bold green]Enter[/bold green] to continue")


# ─────────────────────────────────────────────────────────
# Phase Runners
# ─────────────────────────────────────────────────────────

ALL_SECTORS = [
    "Agriculture & Fisheries",
    "Health & Wellness",
    "MSMEs & Retail",
    "Education & Youth",
    "Transport & Logistics",
    "Housing & Utilities",
    "Government Services & Compliance",
    "Finance & Credit",
]


def run_phase1(state: dict, phase1_agent) -> dict:
    console.print(Panel.fit(
        "[bold cyan]PHASE 1 — STARTUP PROBLEM DISCOVERY[/bold cyan]\n"
        "[dim]Automated landscape research discovering concrete, field-ready sufferers in Iloilo.[/dim]",
        box=box.ROUNDED
    ))

    # Sector table display
    sector_table = Table(title="Available Focus Sectors", box=box.SIMPLE)
    sector_table.add_column("No.", style="cyan", width=4)
    sector_table.add_column("Sector Name", style="white")

    for i, s in enumerate(ALL_SECTORS, 1):
        sector_table.add_row(str(i), s)

    console.print(sector_table)

    sector_input = Prompt.ask(
        "\nEnter sector numbers to research (e.g. 1, 3, 5), or press Enter for ALL",
        default="all"
    )

    if sector_input.strip().lower() == "all":
        sectors = ALL_SECTORS
    else:
        try:
            indices = [int(x.strip()) - 1 for x in sector_input.split(",")]
            sectors = [ALL_SECTORS[i] for i in indices if 0 <= i < len(ALL_SECTORS)]
        except (ValueError, IndexError):
            console.print("[yellow]Invalid input — researching all sectors.[/yellow]")
            sectors = ALL_SECTORS

    has_field = Confirm.ask(
        "\nDo you have primary field observations from Iloilo to include in this run?",
        default=False
    )

    field_observations = ""
    if has_field:
        console.print(
            "[dim]Describe your field observations below.\n"
            "Format: [Sector] | [Who you spoke to & named location] | [Observed coping behavior]\n"
            "Type END on a new line when done.[/dim]\n"
        )
        lines = []
        while True:
            line = input()
            if line.strip().upper() == "END":
                break
            lines.append(line)
        field_observations = "\n".join(lines)

    sectors_list = "\n".join(f"- {s}" for s in sectors)
    field_section = (
        f"\n\nField observations from the team:\n{field_observations}"
        if field_observations else ""
    )

    research_prompt = (
        f"Please conduct Phase 1 Discovery research for the following sectors in Iloilo:\n{sectors_list}"
        f"{field_section}\n\n"
        "For each sector:\n"
        "1. Identify real, documented problems in Iloilo City and Province.\n"
        "2. Reference local sources: Panay News, Visayan Daily Star, PSA Iloilo, DTI Iloilo, DA Iloilo, LGU records.\n"
        "3. Classify each problem found by evidence tier (SIGNAL / DOCUMENTED / STRONGLY_DOCUMENTED).\n"
        "4. For each problem, note: sufferer occupation + named Iloilo location, current coping workaround, and field research gap.\n"
        "5. Label every source with its tier (A/B/C/D).\n"
        "6. Produce the full problem landscape table and Phase 2 Readiness summary."
    )

    response = run_agent_turn(phase1_agent, research_prompt, [], status_text="Conducting Iloilo problem landscape research...")

    console.print(Panel(
        Markdown(response),
        title="[bold cyan]Phase 1 — Problem Discovery Landscape[/bold cyan]",
        box=box.ROUNDED,
        border_style="cyan"
    ))

    additions = Prompt.ask(
        "\nAny corrections or additional problems to add to the landscape? (or press Enter to continue)",
        default=""
    )

    history = [
        {"role": "user", "content": research_prompt},
        {"role": "assistant", "content": response},
    ]

    final_output = response

    if additions.strip():
        addition_prompt = (
            f"The team has the following additions or corrections:\n\n{additions}\n\n"
            "Please incorporate these additions into the appropriate sector tables, "
            "assign evidence tiers, and re-output the updated Phase 2 Readiness list."
        )
        final_output = run_agent_turn(phase1_agent, addition_prompt, history, status_text="Updating problem landscape with additions...")
        console.print(Panel(
            Markdown(final_output),
            title="[bold cyan]Phase 1 — Updated Landscape[/bold cyan]",
            box=box.ROUNDED,
            border_style="cyan"
        ))

    state["phase1_response"] = final_output
    state["phase1_sectors"] = sectors
    state["phase1_complete"] = True
    save_session(state["session_id"], state)

    console.print(Panel.fit(
        "[bold green]✅ Phase 1 complete.[/bold green]\n"
        "Problems labeled Documented (BLUE) and Strongly Documented (GREEN) are eligible for Phase 2 screening.",
        box=box.ROUNDED,
        border_style="green"
    ))
    Prompt.ask("\nPress [bold green]Enter[/bold green] to continue")
    return state


def run_phase2(state: dict, phase2_agent) -> dict:
    console.print(Panel.fit(
        "[bold cyan]PHASE 2 — SCREENING & SHORTLISTING CLINIC[/bold cyan]\n"
        "[dim]Batch-evaluate problem candidates on 5 screening dimensions + Winnability check.[/dim]",
        box=box.ROUNDED
    ))

    if state.get("phase1_response"):
        use_auto = Confirm.ask(
            "\nFound Phase 1 output in this session. Use it automatically?",
            default=True
        )
        if use_auto:
            phase1_text = state["phase1_response"]
        else:
            console.print("[dim]Paste your Phase 1 output below. Type END on a new line when done.[/dim]")
            lines = []
            while True:
                line = input()
                if line.strip() == "END":
                    break
                lines.append(line)
            phase1_text = "\n".join(lines)
    else:
        console.print("[dim]Paste your Phase 1 output below. Type END on a new line when done.[/dim]")
        lines = []
        while True:
            line = input()
            if line.strip() == "END":
                break
            lines.append(line)
        phase1_text = "\n".join(lines)

    if not phase1_text.strip():
        console.print("[yellow]No Phase 1 input provided. Returning to menu.[/yellow]")
        return state

    prompt = (
        f"Here is the Phase 1 Discovery output from our team:\n\n{phase1_text}\n\n"
        "Please run the full Phase 2 screening workflow on all problem candidates:\n"
        "1. Filter out solution-in-disguise statements and banned buzzwords.\n"
        "2. Score each candidate on the 5 Screening Questions (Pain, Frequency, Market Size, Existing Sacrifice, Access).\n"
        "3. Provide Winnability Advisory.\n"
        "4. Assign ADVANCE / SECOND_LOOK / PARK verdicts with mandatory exit conditions for SECOND_LOOK.\n"
        "5. Output the 10-column scorecard and ADVANCE shortlist."
    )

    response = run_agent_turn(phase2_agent, prompt, [], status_text="Screening & scoring problem candidates...")

    console.print(Panel(Markdown(response), title="[bold cyan]Phase 2 — Screening Results & Scorecard[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

    state["phase2_response"] = response
    state["phase2_complete"] = True
    save_session(state["session_id"], state)

    console.print(Panel.fit(
        "[bold green]✅ Phase 2 complete.[/bold green]\n"
        "Problems labeled [bold green]ADVANCE[/bold green] have earned investigation time in Phase 3.",
        box=box.ROUNDED,
        border_style="green"
    ))
    Prompt.ask("\nPress [bold green]Enter[/bold green] to continue")
    return state


def run_phase3(state: dict, phase3_agent) -> dict:
    from gates import (
        get_current_level, get_level_label, get_level_instruction,
        mark_level_complete, all_levels_complete, levels_progress_string
    )

    console.print(Panel.fit(
        "[bold cyan]PHASE 3 — DEEP PROBLEM VALIDATION CLINIC[/bold cyan]\n"
        "[dim]Strict 6-Level Mom Test clinic. One level per turn. No pitching allowed.[/dim]\n"
        "[dim]Type [bold white]EXIT[/bold white] at any time to save progress and return to menu.[/dim]",
        box=box.ROUNDED
    ))

    problem_input = Prompt.ask(
        "\nEnter the problem statement to validate (or paste from Phase 2 ADVANCE list)"
    )

    if "completed_levels" not in state:
        state["completed_levels"] = []

    history: list[dict] = state.get("phase3_history", [])
    phase2_context = state.get("phase2_response", "")

    initial_context = (
        f"We are validating this problem from Phase 2:\n\n{problem_input}\n\n"
        f"Phase 2 context:\n{phase2_context}\n\n"
        "Please begin the Phase 3 validation clinic."
    )

    if not history:
        history.append({"role": "user", "content": initial_context})

    while not all_levels_complete(state):
        current_level = get_current_level(state)
        level_label = get_level_label(current_level)
        level_instruction = get_level_instruction(current_level)

        # Visual Stepper Bar
        lvl_order = ["specific_sufferer", "demonstrated_pain", "intensity_frequency", "local_market_size", "population_evidence", "economic_consequence"]
        stepper_parts = []
        for l_key in lvl_order:
            if l_key in state["completed_levels"]:
                stepper_parts.append(f"[bold green]● {l_key.replace('_', ' ').title()}[/bold green]")
            elif l_key == current_level:
                stepper_parts.append(f"[bold yellow]◉ {l_key.replace('_', ' ').title()}[/bold yellow]")
            else:
                stepper_parts.append(f"[dim]○ {l_key.replace('_', ' ').title()}[/dim]")

        console.print(Panel(" ➔ ".join(stepper_parts), title="[bold cyan]Validation Funnel Progress[/bold cyan]", box=box.ROUNDED))

        level_prompt = (
            f"[SYSTEM GATE] Current level to ask: {level_label}\n"
            f"Instructions: {level_instruction}\n\n"
            "Ask exactly one question for this level. Do not stack questions or skip ahead."
        )

        if len(history) == 1:
            full_prompt = initial_context + "\n\n" + level_prompt
            agent_response = run_agent_turn(phase3_agent, full_prompt, [], status_text=f"Evaluating {level_label}...")
            history[0]["content"] = full_prompt
        else:
            agent_response = run_agent_turn(phase3_agent, level_prompt, history[:-1] if history else [], status_text=f"Evaluating {level_label}...")

        history.append({"role": "assistant", "content": agent_response})
        console.print(Panel(Markdown(agent_response), title=f"[bold cyan]{level_label}[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

        student_input = Prompt.ask("\n[bold green]Your answer[/bold green] (or 'EXIT')")

        if student_input.strip().upper() == "EXIT":
            state["phase3_history"] = history
            save_session(state["session_id"], state)
            console.print("[yellow]Session saved. You can resume this level anytime.[/yellow]")
            return state

        history.append({"role": "user", "content": student_input})

        critique_prompt = (
            f"[STUDENT ANSWER for {level_label}]\n{student_input}\n\n"
            f"Apply the three-part critique: (1) rigor critique, (2) founder vs evidence mindset, "
            f"(3) reframing directive. Then decide: does this answer satisfy {level_label}? "
            f"If yes, respond with your critique AND end your response with the exact string: "
            f"[LEVEL_COMPLETE:{current_level}]. "
            f"If no, give your critique and re-ask the question — do NOT include [LEVEL_COMPLETE]."
        )

        critique_response = run_agent_turn(phase3_agent, critique_prompt, history, status_text="Critiquing evidence rigor...")
        history.append({"role": "assistant", "content": critique_response})

        console.print(Panel(Markdown(critique_response.replace(f"[LEVEL_COMPLETE:{current_level}]", "").strip()),
                            title="[bold yellow]Socratic Evidence Critique[/bold yellow]", box=box.ROUNDED, border_style="yellow"))

        if f"[LEVEL_COMPLETE:{current_level}]" in critique_response:
            state = mark_level_complete(state, current_level)
            console.print(f"[bold green]✅ {level_label} — Complete & Ratcheted![/bold green]\n")

        state["phase3_history"] = history
        save_session(state["session_id"], state)

    # Scorecard calculation
    console.print(Panel.fit("[bold green]All 6 levels satisfied. Synthesizing 2-dimension validation scorecard...[/bold green]"))

    scorecard_prompt = (
        "All 6 levels are complete. Now produce:\n"
        "1. Step 4: Origin pattern tags\n"
        "2. Step 5: The TWO-DIMENSION scorecard:\n"
        "   A. Evidence Confidence (6 sub-criteria, 0-4 each, max 24)\n"
        "   B. Problem Attractiveness (5 sub-criteria, 0-4 each, max 20)\n"
        "3. Step 6: Final verdict — VALIDATED / REVALIDATE / REJECT\n"
        "   If VALIDATED: state explicitly that this problem has earned the right to Phase 4."
    )

    scorecard_response = run_agent_turn(phase3_agent, scorecard_prompt, history, status_text="Generating validation scorecard & verdict...")
    history.append({"role": "assistant", "content": scorecard_response})

    console.print(Panel(Markdown(scorecard_response), title="[bold cyan]Phase 3 — Validation Scorecard & Verdict[/bold cyan]", box=box.ROUNDED, border_style="green"))

    state["phase3_response"] = scorecard_response
    state["phase3_complete"] = True
    save_session(state["session_id"], state)

    Prompt.ask("\nPress [bold green]Enter[/bold green] to continue")
    return state


def run_phase4(state: dict, phase4_agent) -> dict:
    from gates import check_concept_minimum, format_concept_shortfall

    console.print(Panel.fit(
        "[bold cyan]PHASE 4 — SOLUTION IDEATION & HYPOTHESIS FORMATION[/bold cyan]\n"
        "[dim]Convert validated problem into testable concepts, 15 mechanism families & SVB canvas.[/dim]",
        box=box.ROUNDED
    ))

    phase3_output = state.get("phase3_response", "")
    if not phase3_output:
        console.print("[red]ERROR: No Phase 3 output found. Please complete Phase 3 first.[/red]")
        Prompt.ask("\nPress Enter to return")
        return state

    history: list[dict] = state.get("phase4_history", [])
    concepts: list[dict] = state.get("phase4_concepts", [])

    if not history:
        step1_prompt = (
            f"Phase 3 validated output:\n\n{phase3_output}\n\n"
            "Please begin Phase 4:\n"
            "STEP 1: Assess Phase 3 validation in 2 sentences.\n"
            "STEP 2: Construct the Solution Brief from Phase 3 evidence ONLY.\n"
            "Present the Solution Brief and await confirmation."
        )

        response = run_agent_turn(phase4_agent, step1_prompt, [], status_text="Formulating Solution Brief...")
        history.append({"role": "user", "content": step1_prompt})
        history.append({"role": "assistant", "content": response})
        console.print(Panel(Markdown(response), title="[bold cyan]Steps 1-2: Solution Brief[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

        student_confirm = Prompt.ask("\nConfirm the Solution Brief (or enter corrections)")
        history.append({"role": "user", "content": student_confirm})

        step3_prompt = (
            "STEP 3: Construct the Opportunity Question formula ('How might we enable...').\n"
            "Present the Opportunity Question and await confirmation."
        )
        response3 = run_agent_turn(phase4_agent, step3_prompt, history, status_text="Drafting Opportunity Question...")
        history.append({"role": "user", "content": step3_prompt})
        history.append({"role": "assistant", "content": response3})
        console.print(Panel(Markdown(response3), title="[bold cyan]Step 3: Opportunity Question[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

        oq_confirm = Prompt.ask("\nConfirm Opportunity Question (or refine)")
        history.append({"role": "user", "content": oq_confirm})

        step4_prompt = (
            "STEP 4: Root-Mechanism Decomposition (Causal Chain).\n"
            "Decompose problem into its causal chain and label mechanism types."
        )
        response4 = run_agent_turn(phase4_agent, step4_prompt, history, status_text="Decomposing root mechanisms...")
        history.append({"role": "user", "content": step4_prompt})
        history.append({"role": "assistant", "content": response4})
        console.print(Panel(Markdown(response4), title="[bold cyan]Step 4: Root-Mechanism Decomposition[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

        decomp_confirm = Prompt.ask("\nConfirm root-mechanism decomposition (or add fieldwork corrections)")
        history.append({"role": "user", "content": decomp_confirm})

        save_session(state["session_id"], state)

    # Step 5: Divergent Ideation loop
    while True:
        check = check_concept_minimum(concepts)

        if not check["minimum_met"]:
            shortfall_msg = format_concept_shortfall(check)
            console.print(Panel(shortfall_msg, title="[bold yellow]Concept Minimum Check (Gate Active)[/bold yellow]", box=box.ROUNDED, border_style="yellow"))

            step5_prompt = (
                f"{shortfall_msg}\n\n"
                "STEP 5 — Divergent Ideation:\n"
                f"Suggest new concepts from untried mechanism families: {', '.join(check['families_not_yet_tried'])}\n"
                "For each concept: label, mechanism family, causal link targeted, hypothesized mechanism, delivery vehicle."
            )

            ideation_response = run_agent_turn(phase4_agent, step5_prompt, history, status_text="Brainstorming diverse mechanism concepts...")
            history.append({"role": "user", "content": step5_prompt})
            history.append({"role": "assistant", "content": ideation_response})
            console.print(Panel(Markdown(ideation_response), title="[bold cyan]Step 5: Divergent Ideation Concepts[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

            console.print("\n[dim]Add concepts to your roster. Format: label | mechanism_family | causal_link | mechanism | delivery[/dim]")
            console.print("[dim]Type DONE when finished.[/dim]\n")

            while True:
                concept_input = Prompt.ask("Add Concept (or DONE)")
                if concept_input.strip().upper() == "DONE":
                    break
                parts = [p.strip() for p in concept_input.split("|")]
                if len(parts) >= 5:
                    concepts.append({
                        "label": parts[0],
                        "mechanism_family": parts[1],
                        "causal_link_targeted": parts[2],
                        "hypothesized_mechanism": parts[3],
                        "delivery_vehicle": parts[4],
                    })
                    console.print(f"[bold green]Added: {parts[0]} ({parts[1]})[/bold green]")
                else:
                    console.print("[yellow]Format required: label | family | causal_link | mechanism | delivery[/yellow]")

            state["phase4_concepts"] = concepts
            state["phase4_history"] = history
            save_session(state["session_id"], state)

        else:
            console.print(Panel.fit(
                f"[bold green]✅ Minimum concept set satisfied: {check['concept_count']} concepts across {check['family_count']} mechanism families.[/bold green]",
                box=box.ROUNDED,
                border_style="green"
            ))
            break

    # Step 6: Screening
    concepts_text = "\n".join([
        f"- {c['label']} | {c['mechanism_family']} | {c['causal_link_targeted']} | {c['hypothesized_mechanism']} | {c['delivery_vehicle']}"
        for c in concepts
    ])

    step6_prompt = (
        f"STEP 6 — Concept Screening:\n\nConcepts:\n{concepts_text}\n\n"
        "Score each concept 1-3 on all 6 criteria. Label scores [Hypothesis].\n"
        "Assign verdicts: ADVANCE_TO_HYPOTHESIS / REVISE / DROP."
    )

    step6_response = run_agent_turn(phase4_agent, step6_prompt, history, status_text="Screening concepts & scoring criteria...")
    history.append({"role": "user", "content": step6_prompt})
    history.append({"role": "assistant", "content": step6_response})
    console.print(Panel(Markdown(step6_response), title="[bold cyan]Step 6: Concept Screening Scorecard[/bold cyan]", box=box.ROUNDED, border_style="cyan"))

    # Steps 7-9: Assumption Register & SVB Canvas
    step789_prompt = (
        "STEP 7 — Assumption Register (P1-P4 priority matrix for ADVANCE concepts)\n"
        "STEP 8 — Experiment Cards (one per P1 assumption)\n"
        "STEP 8B — Simplified Validation Board (SVB) Canvas Synthesis\n"
        "STEP 9 — Phase 4 Verdict (READY_TO_TEST / RE_IDEATE / RETURN_TO_PROBLEM)"
    )

    step789_response = run_agent_turn(phase4_agent, step789_prompt, history, status_text="Synthesizing Assumption Register, SVB & Experiment Cards...")
    history.append({"role": "user", "content": step789_prompt})
    history.append({"role": "assistant", "content": step789_response})

    console.print(Panel(Markdown(step789_response), title="[bold cyan]Steps 7-9: Assumptions, SVB Canvas & Experiment Cards[/bold cyan]", box=box.ROUNDED, border_style="green"))

    state["phase4_response"] = step789_response
    state["phase4_concepts"] = concepts
    state["phase4_complete"] = True
    save_session(state["session_id"], state)

    Prompt.ask("\nPress [bold green]Enter[/bold green] to continue")
    return state


def run_phase5(state: dict, phase5_agent) -> dict:
    console.print(Panel.fit(
        "[bold cyan]PHASE 5 — SOLUTION VALIDATION & MVP EXPERIMENTATION[/bold cyan]\n"
        "[dim]Evaluate empirical tests against P1 assumptions (Build-Measure-Learn).[/dim]",
        box=box.ROUNDED
    ))

    phase4_resp = state.get("phase4_response", "")
    if not phase4_resp:
        console.print("[yellow]No Phase 4 session data found. You will enter experiment parameters manually.[/yellow]")

    console.print("\n[bold cyan]Step 1: MVP Experiment Intake[/bold cyan]")
    concept_label = Prompt.ask("Enter the concept label tested", default="Top Concept from Phase 4")
    assumption_tested = Prompt.ask("Enter the specific P1 assumption tested")

    archetype_table = Table(title="MVP Test Archetypes", box=box.SIMPLE)
    archetype_table.add_column("Key", style="cyan")
    archetype_table.add_column("Archetype", style="white")
    archetype_table.add_column("Primary Mechanism Tested", style="dim")

    archetype_table.add_row("1", "Concierge MVP", "Manual high-touch execution directly solving the problem")
    archetype_table.add_row("2", "Wizard of Oz", "Front-end appears automated; back-end executed manually")
    archetype_table.add_row("3", "Smoke / Landing Page Test", "Mock call-to-action measuring conversion intent")
    archetype_table.add_row("4", "Interactive Prototype", "Paper / clickable prototype measuring task completion")
    archetype_table.add_row("5", "LOI / Pre-order Deposit", "Letter of Intent or cash deposit measuring financial commitment")
    archetype_table.add_row("6", "Structured Solution Interview", "Showing mockups to test comprehension and willingness")

    console.print(archetype_table)

    archetype_idx = Prompt.ask("Select Archetype", choices=["1", "2", "3", "4", "5", "6"], default="1")
    archetype_map = {
        "1": "CONCIERGE_MVP",
        "2": "WIZARD_OF_OZ",
        "3": "SMOKE_OR_LANDING_PAGE_TEST",
        "4": "INTERACTIVE_PROTOTYPE_OR_PAPER",
        "5": "LOI_OR_PREORDER_DEPOSIT",
        "6": "STRUCTURED_SOLUTION_INTERVIEW",
    }
    test_archetype = archetype_map[archetype_idx]

    cohort = Prompt.ask("Target participant cohort tested (e.g. 20 market vendors in Jaro Market)")
    sample_size = Prompt.ask("Total qualified sufferers exposed (sample size)", default="20")
    actions_count = Prompt.ask("Count of concrete actions observed (deposits, purchases, signups)", default="6")
    pass_threshold = Prompt.ask("Pre-set PASS threshold from Phase 4", default=">= 50% conversion or >= 5 deposits")
    fail_threshold = Prompt.ask("Pre-set FAIL threshold from Phase 4", default="< 25% conversion")
    evidence_desc = Prompt.ask("Describe specific user behaviors observed (e.g. cash paid, time spent)")

    experiment_payload = f"""
PHASE 5 EXPERIMENT INTAKE:
- Concept Label: {concept_label}
- Tested P1 Assumption: {assumption_tested}
- Test Archetype: {test_archetype}
- Target Cohort: {cohort}
- Sample Size Exposed: {sample_size}
- Concrete Actions Count: {actions_count}
- Pre-set Pass Threshold: {pass_threshold}
- Pre-set Fail Threshold: {fail_threshold}
- Detailed Observed Behaviors:
{evidence_desc}

PHASE 4 CONTEXT:
{phase4_resp[:1500] if phase4_resp else '[Manual input]'}
"""

    audit_prompt = f"""
Audit and evaluate this empirical experiment data strictly according to Phase 5 rules:
1. Calculate conversion rate percentage.
2. Evaluate observed metrics against pre-set PASS and FAIL thresholds.
3. Classify evidence into the Behavioral Commitment Hierarchy (TIER_1_FINANCIAL to TIER_5_POLITE_INTEREST).
4. Conduct Pivot Analysis if threshold is FAIL or INCONCLUSIVE:
   - Identify Failure Locus (Desirability Gap, Behavioral Friction, Usability Mismatch, Economic Viability Gap)
   - Identify Pivot Direction (Mechanism Pivot, Customer Segment Pivot, Return to Problem)
5. Deliver Phase 5 Verdict (PURSUE / PIVOT / RETIRE_CONCEPT).
6. State the exact Next Milestone Directive.

{experiment_payload}
"""

    response = run_agent_turn(phase5_agent, audit_prompt, [], status_text="Auditing MVP metrics & conducting Pivot Analysis...")
    console.print(Panel(Markdown(response), title="[bold green]Phase 5: MVP Validation & Pivot Audit[/bold green]", box=box.ROUNDED, border_style="green"))

    state["phase5_response"] = response
    state["phase5_complete"] = True
    save_session(state["session_id"], state)

    Prompt.ask("\nPress [bold green]Enter[/bold green] to continue")
    return state


# ─────────────────────────────────────────────────────────
# Main CLI Loop
# ─────────────────────────────────────────────────────────

def main():
    print_banner()

    # Session selection
    existing = list_sessions()
    if existing:
        session_table = Table(title="Existing Project Sessions", box=box.SIMPLE)
        session_table.add_column("No.", style="cyan", width=4)
        session_table.add_column("Session ID", style="white")

        for idx, s_id in enumerate(existing, 1):
            session_table.add_row(str(idx), s_id)

        console.print(session_table)
        choice = Prompt.ask(
            "Enter session number, session ID, or type [bold green]'new'[/bold green]",
            default="new"
        )

        if choice.lower() == "new":
            session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
            state = {"session_id": session_id}
        else:
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(existing):
                    session_id = existing[idx]
                else:
                    session_id = choice
            except ValueError:
                session_id = choice

            state = load_session(session_id)
            console.print(f"[bold green]Resumed session: {session_id}[/bold green]")
    else:
        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        state = {"session_id": session_id}

    save_session(session_id, state)

    console.print("\n[dim]Initializing multi-agent pipeline systems...[/dim]")
    phase1_agent, phase2_agent, phase3_agent, phase4_agent, phase5_agent = create_agents()
    console.print("[bold green]Agents initialized and ready.[/bold green]\n")

    while True:
        console.clear()
        print_banner()
        render_session_hud(state)
        action = render_phase_menu(state)

        if action in ("Q", "QUIT"):
            console.print("\n[bold green]Session saved. Goodbye![/bold green]")
            break
        elif action == "1":
            state = run_phase1(state, phase1_agent)
        elif action == "2":
            state = run_phase2(state, phase2_agent)
        elif action == "3":
            if not state.get("phase2_complete"):
                console.print("[yellow]Warning: Running Phase 3 without Phase 2 output. You can paste the problem manually.[/yellow]")
            state = run_phase3(state, phase3_agent)
        elif action == "4":
            if not state.get("phase3_complete"):
                console.print("[bold red]Phase 3 must be completed and VALIDATED before running Phase 4.[/bold red]")
                Prompt.ask("\nPress Enter to return")
            else:
                state = run_phase4(state, phase4_agent)
        elif action == "5":
            if not state.get("phase4_complete"):
                console.print("[yellow]Warning: Running Phase 5 without Phase 4 output. You will enter experiment details manually.[/yellow]")
            state = run_phase5(state, phase5_agent)
        elif action in ("E", "EXPORT"):
            export_session_dossier(state)
        elif action in ("H", "HELP"):
            show_cheatsheet()
        elif action in ("S", "SWITCH"):
            save_session(session_id, state)
            console.print("\n[green]Restarting session selection...[/green]")
            main()
            return

        save_session(session_id, state)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[yellow]Session autosaved. Exiting cleanly.[/yellow]")
        sys.exit(0)
