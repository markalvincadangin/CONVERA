"""
CONVERA Standardized System Prompts Registry
============================================
Supports Multi-Framework Execution:
1. Innovation Track (Venture Ratchet Pipeline v1.1 - Phases 1 to 5)
2. Research Track (DSR Computing Research Framework - Phases A to F)
"""
from typing import Optional, Dict

# Innovation Track Prompts
from prompts.phase1_system import PHASE1_SYSTEM as INNOVATION_PHASE1_SYSTEM
from prompts.phase2_system import PHASE2_SYSTEM as INNOVATION_PHASE2_SYSTEM
from prompts.phase3_system import PHASE3_SYSTEM as INNOVATION_PHASE3_SYSTEM
from prompts.phase4_system import PHASE4_SYSTEM as INNOVATION_PHASE4_SYSTEM
from prompts.phase5_system import PHASE5_SYSTEM as INNOVATION_PHASE5_SYSTEM

# Research / Thesis Track Prompts
from prompts.research_phase_a_system import RESEARCH_PHASE_A_SYSTEM
from prompts.research_phase_b_system import RESEARCH_PHASE_B_SYSTEM
from prompts.research_phase_c_system import RESEARCH_PHASE_C_SYSTEM
from prompts.research_phase_d_system import RESEARCH_PHASE_D_SYSTEM
from prompts.research_phase_e_system import RESEARCH_PHASE_E_SYSTEM
from prompts.research_phase_f_system import RESEARCH_PHASE_F_SYSTEM

# Backward-Compatible Aliases
PHASE1_SYSTEM = INNOVATION_PHASE1_SYSTEM
PHASE2_SYSTEM = INNOVATION_PHASE2_SYSTEM
PHASE3_SYSTEM = INNOVATION_PHASE3_SYSTEM
PHASE4_SYSTEM = INNOVATION_PHASE4_SYSTEM
PHASE5_SYSTEM = INNOVATION_PHASE5_SYSTEM

THESIS_PHASE_A_SYSTEM = RESEARCH_PHASE_A_SYSTEM
THESIS_PHASE_B_SYSTEM = RESEARCH_PHASE_B_SYSTEM
THESIS_PHASE_C_SYSTEM = RESEARCH_PHASE_C_SYSTEM
THESIS_PHASE_D_SYSTEM = RESEARCH_PHASE_D_SYSTEM
THESIS_PHASE_E_SYSTEM = RESEARCH_PHASE_E_SYSTEM
THESIS_PHASE_F_SYSTEM = RESEARCH_PHASE_F_SYSTEM

# Standardized Registry
FRAMEWORK_PROMPT_REGISTRY: Dict[str, Dict[str, str]] = {
    "INNOVATION_RATCHET": {
        "1": INNOVATION_PHASE1_SYSTEM,
        "2": INNOVATION_PHASE2_SYSTEM,
        "3": INNOVATION_PHASE3_SYSTEM,
        "4": INNOVATION_PHASE4_SYSTEM,
        "5": INNOVATION_PHASE5_SYSTEM,
    },
    "RESEARCH_CRCDP": {
        "A": RESEARCH_PHASE_A_SYSTEM,
        "B": RESEARCH_PHASE_B_SYSTEM,
        "C": RESEARCH_PHASE_C_SYSTEM,
        "D": RESEARCH_PHASE_D_SYSTEM,
        "E": RESEARCH_PHASE_E_SYSTEM,
        "F": RESEARCH_PHASE_F_SYSTEM,
    },
}

def get_framework_prompt(framework_id: str, phase_key: str) -> Optional[str]:
    """Retrieve the standardized system prompt for a framework and phase key."""
    fw_key = framework_id.upper()
    # Normalize aliases
    if "INNOVATION" in fw_key or "VENTURE" in fw_key:
        fw_key = "INNOVATION_RATCHET"
    elif "RESEARCH" in fw_key or "THESIS" in fw_key or "CAPSTONE" in fw_key or "CRCDP" in fw_key:
        fw_key = "RESEARCH_CRCDP"
    
    fw_dict = FRAMEWORK_PROMPT_REGISTRY.get(fw_key, {})
    return fw_dict.get(str(phase_key).upper()) or fw_dict.get(str(phase_key))

__all__ = [
    # Innovation
    "INNOVATION_PHASE1_SYSTEM", "INNOVATION_PHASE2_SYSTEM", "INNOVATION_PHASE3_SYSTEM",
    "INNOVATION_PHASE4_SYSTEM", "INNOVATION_PHASE5_SYSTEM",
    # Research
    "RESEARCH_PHASE_A_SYSTEM", "RESEARCH_PHASE_B_SYSTEM", "RESEARCH_PHASE_C_SYSTEM",
    "RESEARCH_PHASE_D_SYSTEM", "RESEARCH_PHASE_E_SYSTEM", "RESEARCH_PHASE_F_SYSTEM",
    # Aliases
    "PHASE1_SYSTEM", "PHASE2_SYSTEM", "PHASE3_SYSTEM", "PHASE4_SYSTEM", "PHASE5_SYSTEM",
    "THESIS_PHASE_A_SYSTEM", "THESIS_PHASE_B_SYSTEM", "THESIS_PHASE_C_SYSTEM",
    "THESIS_PHASE_D_SYSTEM", "THESIS_PHASE_E_SYSTEM", "THESIS_PHASE_F_SYSTEM",
    # Registry Helper
    "get_framework_prompt", "FRAMEWORK_PROMPT_REGISTRY"
]
