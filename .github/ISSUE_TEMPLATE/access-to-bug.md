---
name: Access To Bug
about: Bug in an Access To civic tech module
title: ''
labels: ''
assignees: ''

---

name: Access To Bug
description: Bug in an Access To civic tech module
labels: ["bug", "civic-tech"]
body:
  - type: dropdown
    id: pillar
    attributes:
      label: Access To pillar
      options: [Health, Jobs, Housing, Services, Education, Safety, Justice, Business]
  - type: textarea
    id: description
    attributes:
      label: What is broken?
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
