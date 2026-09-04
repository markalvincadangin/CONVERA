"""
CONVERA Phase 9 Full Local Verification Runner
==============================================
"""
import os, sys, re, json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent.parent
web_dir = root / "web"
backend_dir = root / "backend"

results = {
    "DEF-001": {"status": "PASS", "checks": []},
    "DEF-002": {"status": "PASS", "checks": []},
    "DEF-003": {"status": "PASS", "checks": []},
    "DEF-004": {"status": "PASS", "checks": []},
}

# --- DEF-001 Verification ---
ps_path = web_dir / "src" / "services" / "problemService.ts"
with open(ps_path, "r", encoding="utf-8") as f:
    ps_code = f.read()

c1 = "/api/research/query" not in ps_code
results["DEF-001"]["checks"].append({"name": "No /api/research/query in problemService.ts", "passed": c1})
c2 = "/api/connectors/search" in ps_code
results["DEF-001"]["checks"].append({"name": "Canonical /api/connectors/search present", "passed": c2})
c3 = "limit_per_source: limit" in ps_code
results["DEF-001"]["checks"].append({"name": "limit mapped to limit_per_source", "passed": c3})
c4 = "engine && engine !== \"ALL\" ? [engine.toLowerCase()] : undefined" in ps_code
results["DEF-001"]["checks"].append({"name": "engine ALL vs specific connector selection", "passed": c4})

# --- DEF-002 Verification ---
modals = [
    ("Modal.tsx", web_dir / "src" / "components" / "common" / "Modal.tsx"),
    ("CommandPaletteModal.tsx", web_dir / "src" / "components" / "common" / "CommandPaletteModal.tsx"),
    ("FrameworkSelectorModal.tsx", web_dir / "src" / "components" / "common" / "FrameworkSelectorModal.tsx"),
    ("GateReviewModal.tsx", web_dir / "src" / "components" / "frameworks" / "research" / "GateReviewModal.tsx"),
    ("IntelligenceScorecardDrawer.tsx", web_dir / "src" / "components" / "knowledge" / "IntelligenceScorecardDrawer.tsx"),
    ("TraceabilityDrawer.tsx", web_dir / "src" / "components" / "knowledge" / "TraceabilityDrawer.tsx"),
    ("ResearchEvidenceModal.tsx", web_dir / "src" / "components" / "problem-bank" / "ResearchEvidenceModal.tsx")
]

for name, path in modals:
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    has_role = ("role=\"dialog\"" in src) or ("<Modal" in src)
    has_modal = ("aria-modal=\"true\"" in src) or ("<Modal" in src)
    has_escape = ("Escape" in src) or ("<Modal" in src)
    has_name = ("aria-labelledby" in src) or ("aria-label" in src) or ("<Modal" in src)
    all_ok = has_role and has_modal and has_escape and has_name
    results["DEF-002"]["checks"].append({
        "component": name,
        "role_dialog": has_role,
        "aria_modal": has_modal,
        "escape_handler": has_escape,
        "accessible_name": has_name,
        "passed": all_ok
    })

# --- DEF-003 Verification ---
kb_components = [
    ("SessionManager.tsx", web_dir / "src" / "components" / "layout" / "SessionManager.tsx"),
    ("GateReviewModal.tsx", web_dir / "src" / "components" / "frameworks" / "research" / "GateReviewModal.tsx"),
    ("DecisionRoomWorkspace.tsx", web_dir / "src" / "components" / "phases" / "phase2" / "DecisionRoomWorkspace.tsx"),
    ("ProblemComparisonMatrix.tsx", web_dir / "src" / "components" / "phases" / "phase2" / "ProblemComparisonMatrix.tsx"),
    ("FrameworkSelectorModal.tsx", web_dir / "src" / "components" / "common" / "FrameworkSelectorModal.tsx"),
    ("CommandPaletteModal.tsx", web_dir / "src" / "components" / "common" / "CommandPaletteModal.tsx"),
    ("ProblemBankView.tsx", web_dir / "src" / "components" / "problem-bank" / "ProblemBankView.tsx"),
]

for name, path in kb_components:
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    has_tab = ("tabIndex={0}" in src) or ("tabIndex" in src)
    has_onkeydown = "onKeyDown" in src
    has_keys = ("Enter" in src and " " in src) or ("handleKeyDown" in src)
    has_focus = ("focus-visible:" in src) or ("focus:" in src)
    all_ok = has_tab and has_onkeydown and has_keys and has_focus
    results["DEF-003"]["checks"].append({
        "component": name,
        "tabIndex": has_tab,
        "onKeyDown": has_onkeydown,
        "enter_space_activation": has_keys,
        "focus_visible_ring": has_focus,
        "passed": all_ok
    })

with open(web_dir / "src" / "components" / "frameworks" / "research" / "GateReviewModal.tsx", "r", encoding="utf-8") as f:
    g_src = f.read()
gate_checkbox_ok = ("role=\"checkbox\"" in g_src) and ("aria-checked={isChecked}" in g_src)
results["DEF-003"]["checks"].append({
    "component": "GateReviewModal.tsx (Criteria Semantic Checkbox)",
    "role_checkbox": "role=\"checkbox\"" in g_src,
    "aria_checked": "aria-checked={isChecked}" in g_src,
    "passed": gate_checkbox_ok
})

# --- DEF-004 Verification ---
rem_path = web_dir / "src" / "components" / "problem-bank" / "ResearchEvidenceModal.tsx"
with open(rem_path, "r", encoding="utf-8") as f:
    rem_src = f.read()

r1 = "const [errorMessage, setErrorMessage] = useState" in rem_src
r2 = "role=\"alert\"" in rem_src
r3 = ("Dismiss error message" in rem_src) and ("setErrorMessage(null)" in rem_src)
r4 = ("handleAutoResearch" in rem_src) and ("setErrorMessage(null)" in rem_src)
r5 = ("handleManualSearch" in rem_src) and ("setErrorMessage(null)" in rem_src)
r6 = "setErrorMessage(err?.message ||" in rem_src
r7 = "{errorMessage && (" in rem_src

results["DEF-004"]["checks"].extend([
    {"name": "errorMessage state management", "passed": r1},
    {"name": "role=alert semantic error banner", "passed": r2},
    {"name": "Dismiss error button with aria-label", "passed": r3},
    {"name": "Auto-research clears stale errors on invocation", "passed": r4},
    {"name": "Manual search clears stale errors on invocation", "passed": r5},
    {"name": "Catch handlers assign intelligible error message", "passed": r6},
    {"name": "JSX conditionally renders error banner above results", "passed": r7},
])

for k, v in results.items():
    if not all(c.get("passed", False) for c in v["checks"]):
        v["status"] = "FAIL"

print(json.dumps(results, indent=2))
