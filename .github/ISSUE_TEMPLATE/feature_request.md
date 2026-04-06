---
name: Feature request
about: Propose a new feature, enhancement, or an idea for this project
title: ''
labels: ''
assignees: ''

---

name: Feature Request
description: Propose a new feature or enhancement
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem this solves
      placeholder: What pain point or user need does this address?
  - type: textarea
    id: solution
    attributes:
      label: Proposed solution
  - type: dropdown
    id: role
    attributes:
      label: Primary user role
      options: [Co-Parent, Attorney, GAL, Therapist, Judge, School Counselor, Advocate, Admin, All]
  - type: dropdown
    id: priority
    attributes:
      label: Priority estimate
      options: [P0 - Critical, P1 - High, P2 - Medium, P3 - Low]
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria (optional)
