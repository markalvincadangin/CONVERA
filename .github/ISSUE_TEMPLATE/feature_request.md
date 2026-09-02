name: 💡 Feature Request / Methodology Enhancement
description: Suggest an enhancement or new capability for the venture validation engine.
title: "[FEAT] <concise description>"
labels: ["enhancement", "proposal"]
body:
  - type: markdown
    attributes:
      value: |
        We welcome proposals that strengthen empirical validation rigor or improve founder usability!
  - type: input
    id: phase
    attributes:
      label: Target Phase / Capability
      placeholder: e.g. Phase 4 SVB Ideation, Cloud Database Sync, Classroom Export
    validations:
      required: true
  - type: textarea
    id: problem
    attributes:
      label: Problem / Motivation
      description: What founder pain point or pedagogical friction does this feature address?
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution / Mechanism
      description: Describe your proposed solution and how it adheres to the mechanical ratchet invariant.
    validations:
      required: true
