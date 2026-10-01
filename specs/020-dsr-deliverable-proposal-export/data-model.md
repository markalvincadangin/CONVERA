# CONVERA SDD-020: Data Model & Schema Specification
# DSR Deliverable & Comprehensive Proposal Export Engine (Phase D1)

**Specification ID**: CONVERA-SDD-020  
**Feature Title**: DSR Deliverable & Comprehensive Proposal Export Engine  
**Authority Tier**: Tier 2 (Data Model & Schema Contract)  
**Governing Standard**: CCDS v2.0, Constitution Articles I, II, IV, VII, VIII  

---

## 1. Domain Enumerations & Pydantic Schemas

### 1.1 Export Format & Proposal Sections (`backend/models/export.py`)

```python
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class ExportFormat(str, Enum):
    MARKDOWN = "MARKDOWN"
    LATEX = "LATEX"
    BIBTEX = "BIBTEX"
    HTML = "HTML"
    JSON = "JSON"
    BUNDLE = "BUNDLE"

class ProposalSection(str, Enum):
    COVER_METADATA = "COVER_METADATA"
    PROBLEM_SCOUTING = "PROBLEM_SCOUTING"                  # Stage A
    THEORETICAL_GROUNDING = "THEORETICAL_GROUNDING"        # Stage B & D
    LITERATURE_MATRIX = "LITERATURE_MATRIX"                # Stage C
    EVALUATION_CIRCUMSCRIPTION = "EVALUATION_CIRCUMSCRIPTION" # Stage E
    ETHICS_FEASIBILITY = "ETHICS_FEASIBILITY"              # Stage F
    GATE_REVIEWS = "GATE_REVIEWS"                          # Governance
    CRITIQUE_AUDIT = "CRITIQUE_AUDIT"                      # Phase C3 SDD-019
    BIBLIOGRAPHY = "BIBLIOGRAPHY"                          # BibTeX

class DSRProposalCompilationRequest(BaseModel):
    project_id: str = "default_proj"
    session_id: Optional[str] = None
    problem_id: Optional[str] = None
    format: ExportFormat = ExportFormat.MARKDOWN
    include_sections: Optional[List[ProposalSection]] = None
    target_document_class: str = "article"  # 'article', 'report', 'ieeeconf'
    custom_title: Optional[str] = None
    author_name: Optional[str] = "CONVERA Research Fellow"
    institution: Optional[str] = "Department of Computer Science / Computing Research Track"

class DSRProposalCompilationResponse(BaseModel):
    project_id: str
    session_id: Optional[str] = None
    format: ExportFormat
    document_title: str
    content: str
    auxiliary_files: Dict[str, str] = Field(default_factory=dict) # e.g. {"references.bib": "..."}
    provenance_hash: str
    section_count: int
    compiled_at: str
    is_degraded: bool = False
```

---

## 2. LaTeX Document Structure & Styling Specification

### 2.1 Preamble & Required Standard Packages
The LaTeX generator must emit standard LaTeX 2e markup compatible with `pdflatex`, `xelatex`, and Overleaf:
```latex
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[margin=1in]{geometry}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{booktabs}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{fancyhdr}
\usepackage{tcolorbox}

\hypersetup{
    colorlinks=true,
    linkcolor=teal,
    citecolor=blue,
    urlcolor=cyan
}
```

### 2.2 BibTeX Citation Keys & Format
BibTeX entries are generated from `scholarly_works` and inlined into `references.bib`:
```bibtex
@article{santos2024tropical,
  author = {Santos, Maria and Dela Cruz, Juan},
  title = {Decentralized Cold Chain Thermal Regulation in Tropical Agrarian Hubs},
  journal = {Journal of Agricultural Computing and Sensing Systems},
  year = {2024},
  volume = {12},
  number = {3},
  pages = {145--158},
  doi = {10.1016/j.agcomp.2024.101234}
}
```

---

## 3. Printable HTML Document Specification

The standalone HTML document (`_compile_html`) must include:
1. Self-contained CSS with modern academic typesetting (Serif/Sans pairings, high legibility).
2. Clean grid/card layouts for metrics, SDG alignments, and gate reviews.
3. `@media print` directives:
   - Suppresses background tinting if requested or enables exact color reproduction (`-webkit-print-color-adjust: exact`).
   - Inserts page breaks before sections: `page-break-before: always; break-before: page;`.
   - Formats headers and footers with pagination.

---

## 4. Cryptographic Provenance Hash Computation

To guarantee `INV-020-02`, the provenance hash is computed as:
```python
import hashlib
import json

canonical_payload = json.dumps({
    "project_id": project_id,
    "session_id": session_id,
    "problem": section_data.get("problem"),
    "artifacts": section_data.get("artifact"),
    "evaluations": section_data.get("evaluation"),
    "circumscriptions": section_data.get("circumscription"),
    "feasibility": section_data.get("feasibility"),
    "critiques": section_data.get("critiques"),
    "gate_reviews": section_data.get("gate_reviews"),
}, sort_keys=True, default=str)

provenance_hash = hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()
```
This SHA-256 digest is embedded in all formats:
- LaTeX: `\rfoot{\footnotesize Provenance: \texttt{SHA256:...}}`
- Markdown: `<!-- CONVERA-PROVENANCE-SHA256: ... -->`
- HTML: `<meta name="convera-provenance-sha256" content="..." />`
- JSON: `"provenance_hash": "..."`
