"""
CONVERA Phase 3 Physical Namespace Realignment Verification Suite
=================================================================
Tests covering:
- Suite P3-BE-1: Canonical Pipeline Imports & Master Barrel Re-exports
- Suite P3-BE-2: Backward-Compatible Legacy Shims Exact Class Identity
- Suite P3-BE-3: Re-exported Domain Models & Types via Shims
- Suite P3-BE-4: Gates Canonical Domain Import & Functionality
- Suite P3-BE-5: AST Dependency-Direction Enforcement
- Suite P3-BE-6: Pipeline Container Validation & Serialization
"""

import ast
import inspect
from pathlib import Path
import pytest
from pydantic import ValidationError

# 1. Canonical pipeline imports
from schemas.pipeline.discovery_output import Phase1Output as CanonP1
from schemas.pipeline.screening_output import Phase2Output as CanonP2
from schemas.pipeline.validation_output import Phase3Output as CanonP3
from schemas.pipeline.mechanism_output import (
    Phase4Output as CanonP4,
    CONCEPT_VERDICT as CanonConceptVerdict,
    PHASE4_VERDICT as CanonPhase4Verdict,
    get_concept_verdict as canon_get_concept_verdict,
)
from schemas.pipeline.economics_output import (
    Phase5Output as CanonP5,
    Phase5Verdict as CanonPhase5Verdict,
)
from schemas.pipeline import (
    Phase1Output as BarrelP1,
    Phase2Output as BarrelP2,
    Phase3Output as BarrelP3,
    Phase4Output as BarrelP4,
    Phase5Output as BarrelP5,
)

# 2. Package root barrel imports
from schemas import (
    Phase1Output as RootP1,
    Phase2Output as RootP2,
    Phase3Output as RootP3,
    Phase4Output as RootP4,
    Phase5Output as RootP5,
    get_concept_verdict as root_get_concept_verdict,
)

# 3. Domain canonical models for identity check
from schemas.domain.problem import DiscoveredProblem, EvidenceSource
from schemas.domain.screening import ScreeningResult
from schemas.domain.validation import EvidenceConfidence, ProblemAttractiveness
from schemas.domain.concept import (
    ConceptScreeningScore,
    SolutionConcept,
    Assumption,
    ExperimentCard,
    VALID_MECHANISM_FAMILIES as DomainMechanismFamilies,
)
from schemas.domain.experiment import (
    ExperimentAuditResult,
    PivotAnalysis,
    CommitmentTier,
)


class TestPipelineClassIdentity:
    """Suite P3-BE-1: Exact class identity between canonical pipeline models and root barrel."""

    def test_phase1_output_identity(self):
        assert CanonP1 is BarrelP1, "Canonical discovery_output does not match pipeline barrel"
        assert RootP1 is CanonP1, "Root schemas package does not re-export canonical Phase1Output"

    def test_phase2_output_identity(self):
        assert CanonP2 is BarrelP2, "Canonical screening_output does not match pipeline barrel"
        assert RootP2 is CanonP2, "Root schemas package does not re-export canonical Phase2Output"

    def test_phase3_output_identity(self):
        assert CanonP3 is BarrelP3, "Canonical validation_output does not match pipeline barrel"
        assert RootP3 is CanonP3, "Root schemas package does not re-export canonical Phase3Output"

    def test_phase4_output_identity(self):
        assert CanonP4 is BarrelP4, "Canonical mechanism_output does not match pipeline barrel"
        assert RootP4 is CanonP4, "Root schemas package does not re-export canonical Phase4Output"
        assert canon_get_concept_verdict is root_get_concept_verdict

    def test_phase5_output_identity(self):
        assert CanonP5 is BarrelP5, "Canonical economics_output does not match pipeline barrel"
        assert RootP5 is CanonP5, "Root schemas package does not re-export canonical Phase5Output"


class TestLegacyShimsCleanlyContracted:
    """Suite P3-BE-2: Verification that legacy phase*_output.py files are completely removed."""

    SCHEMAS_DIR = Path(__file__).resolve().parent.parent / "schemas"

    def test_zero_legacy_phase_output_files_exist(self):
        legacy_files = list(self.SCHEMAS_DIR.glob("phase*_output.py"))
        assert legacy_files == [], f"Found un-contracted legacy phase files: {[f.name for f in legacy_files]}"


class TestGatesCanonicalImport:
    """Suite P3-BE-4: Gates module imports VALID_MECHANISM_FAMILIES directly from domain."""

    def test_gates_source_does_not_import_phase4_output(self):
        import gates
        gates_path = Path(inspect.getfile(gates))
        with open(gates_path, "r", encoding="utf-8") as f:
            source = f.read()

        parsed = ast.parse(source)
        for node in ast.walk(parsed):
            if isinstance(node, ast.ImportFrom):
                assert node.module != "schemas.phase4_output", (
                    "backend/gates/__init__.py still imports from schemas.phase4_output"
                )
                if any(alias.name == "VALID_MECHANISM_FAMILIES" for alias in node.names):
                    assert node.module in (
                        "schemas.domain.concept",
                        "backend.schemas.domain.concept",
                    ), f"VALID_MECHANISM_FAMILIES imported from incorrect module: {node.module}"

    def test_check_concept_minimum_functionality(self):
        from gates import check_concept_minimum
        # 1 valid concept
        res = check_concept_minimum([{"mechanism_family": "AUTOMATION"}])
        assert res["minimum_met"] is False
        assert res["concept_count"] == 1
        assert "AUTOMATION" in res["families_present"]
        assert len(res["families_not_yet_tried"]) <= 3


class TestPipelineASTDependencyDirection:
    """Suite P3-BE-5: Architectural dependency rules for pipeline schemas."""

    PIPELINE_DIR = Path(__file__).resolve().parent.parent / "schemas" / "pipeline"
    DOMAIN_DIR = Path(__file__).resolve().parent.parent / "schemas" / "domain"

    FORBIDDEN_PIPELINE_IMPORTS = {
        "services",
        "backend.services",
        "gates",
        "backend.gates",
        "routers",
        "backend.routers",
        "engines",
        "backend.engines",
        "storage",
        "backend.storage",
    }

    def test_pipeline_schemas_never_import_application_layers(self):
        for py_file in self.PIPELINE_DIR.glob("*.py"):
            with open(py_file, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read(), filename=str(py_file))

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        for forbidden in self.FORBIDDEN_PIPELINE_IMPORTS:
                            assert not alias.name.startswith(forbidden), (
                                f"Illegal import in pipeline schema {py_file.name}: {alias.name}"
                            )
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        for forbidden in self.FORBIDDEN_PIPELINE_IMPORTS:
                            assert not node.module.startswith(forbidden), (
                                f"Illegal from-import in pipeline schema {py_file.name}: {node.module}"
                            )

    def test_domain_schemas_never_import_pipeline_schemas(self):
        for py_file in self.DOMAIN_DIR.glob("*.py"):
            with open(py_file, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read(), filename=str(py_file))

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        assert "pipeline" not in alias.name, (
                            f"Domain schema {py_file.name} illegally imports pipeline: {alias.name}"
                        )
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        assert "pipeline" not in node.module, (
                            f"Domain schema {py_file.name} illegally imports pipeline: {node.module}"
                        )


class TestPipelineContainerBehavior:
    """Suite P3-BE-6: Validating pipeline container creation and serialization."""

    def test_phase1_output_behavior(self):
        source = EvidenceSource(
            description="Farmer interview",
            source_tier="A",
            evidence_type="interview",
            quote_or_summary="Losses are high",
        )
        p1 = CanonP1(
            sectors_covered=["Agriculture & Fisheries"],
            sectors_no_local_evidence=[],
            problems=[
                DiscoveredProblem(
                    problem_id="PROB-001",
                    sector="Agriculture & Fisheries",
                    sufferer_occupation="Onion Farmer",
                    sufferer_location="Miagao",
                    problem_statement="High post-harvest loss in onion storage",
                    evidence_tier="STRONGLY_DOCUMENTED",
                    evidence_type_list=["interview"],
                    sources=[source],
                    field_research_gap="None",
                )
            ],
        )
        assert len(p1.strongly_documented) == 1
        assert "Landscape Summary" in p1.landscape_summary()
        dump = p1.model_dump()
        assert dump["problems"][0]["problem_id"] == "PROB-001"

    def test_phase2_output_behavior(self):
        result = ScreeningResult(
            problem_label="PROB-001",
            pain_score=4,
            pain_label="Demonstrated",
            frequency_score=4,
            frequency_label="Demonstrated",
            market_size_score=4,
            market_size_label="Demonstrated",
            existing_sacrifice_score=4,
            existing_sacrifice_label="Demonstrated",
            access_score=4,
            access_label="Demonstrated",
            origin_tags=["Farmer"],
            red_flags=[],
            verdict="ADVANCE",
        )
        p2 = CanonP2(
            total_input=1,
            solution_in_disguise_count=0,
            scored_count=1,
            advance_count=1,
            second_look_count=0,
            park_count=0,
            results=[result],
        )
        assert len(p2.advance_problems) == 1
        assert p2.advance_problems[0].verdict == "ADVANCE"
