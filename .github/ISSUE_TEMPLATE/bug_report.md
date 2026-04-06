---
name: Bug report
about: Create a bug report in CoTrackPro to help us improve
title: ''
labels: ''
assignees: ''

---

name: Bug Report
description: Report a bug in CoTrackPro
labels: ["bug", "needs-triage"]
body:
  - type: dropdown
    id: area
    attributes:
      label: Platform Area
      options: [Documentation, Safety Plan, Evidence Timeline, Message Rewriter, Court Export, Auth/Auth, API, Infrastructure, Other]
  - type: textarea
    id: description
    attributes:
      label: What happened?
      placeholder: Describe the bug clearly and factually.
  - type: textarea
    id: expected
    attributes:
      label: What was expected?
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options: [Critical (data loss/safety), High (feature broken), Medium (degraded), Low (cosmetic)]
  - type: checkboxes
    id: pii
    attributes:
      label: Does this involve PII or child safety data?
      options:
        - label: Yes — I have NOT included any real user data in this report
