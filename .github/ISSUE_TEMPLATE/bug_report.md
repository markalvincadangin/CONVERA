name: 🐛 Bug Report
description: Report an unexpected error, crash, or UI/UX defect in CONVERA.
title: "[BUG] <concise description>"
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report an issue and keep CONVERA reliable!
  - type: input
    id: phase
    attributes:
      label: Affected Component / Phase
      description: Which phase, stage, or module did the bug occur in?
      placeholder: e.g. Phase 3 Socratic Clinic, Stage C Lit Matrix, SQLite WAL Storage
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps To Reproduce
      description: Step-by-step instructions to reproduce the issue.
      placeholder: |
        1. Open session '...'
        2. Advance to Stage C
        3. Click 'Generate Matrix'
        4. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Terminal / Console Logs
      description: Paste any relevant terminal or browser console error logs.
      render: shell
