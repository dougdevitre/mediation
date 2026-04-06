---
name: Compliance / Privacy / Safety Flag
about: Flag a potential compliance, HIPAA, FERPA, VAWA, or child safety concern
title: ''
labels: ''
assignees: ''

---

name: Compliance / Privacy / Safety Flag
description: Flag a potential compliance, HIPAA, FERPA, VAWA, or child safety concern
labels: ["compliance", "priority-review"]
body:
  - type: dropdown
    id: type
    attributes:
      label: Concern type
      options: [HIPAA, FERPA, VAWA, Child Safety, Data Retention, Court Neutrality, Trauma-Informed Language, Other]
  - type: textarea
    id: description
    attributes:
      label: Describe the concern (no real user data)
  - type: textarea
    id: location
    attributes:
      label: Where in the codebase or product?
