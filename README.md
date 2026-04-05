# Access to Mediation

**An open-source, standards-compliant practice assistant for family mediators.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standards: 2025 AFCC/ABA](https://img.shields.io/badge/Standards-2025%20AFCC%2FABA-green.svg)](https://www.afccnet.org)
[![Standards: 2005 ABA/AAA/ACR](https://img.shields.io/badge/Standards-2005%20ABA%2FAAA%2FACR-green.svg)](https://acrnet.org)

---

## What Is This?

Access to Mediation is a free, open-source repository of practice resources for family mediators. It is grounded in the two authoritative sets of model standards that govern family mediation practice in the United States:

1. **2025 Model Standards for Family and Divorce Mediation** — developed by AFCC, ABA, ACR, and APFM (approved May 2025)
2. **2005 Model Standards of Conduct for Mediators** — developed by ABA, AAA, and ACR (approved August–September 2005)

The repo provides reference guides, checklists, and customizable templates that help mediators comply with these standards across every phase of practice — from intake screening through agreement drafting and practice management.

> **Disclaimer**: This project provides educational information and practice support templates. It does not constitute legal advice, therapy, or a substitute for professional judgment. Mediators must comply with applicable state law, court rules, and professional licensing requirements.

---

## Who Is This For?

- **Family mediators** (private practice and court-connected)
- **Mediation training programs** (as a teaching resource)
- **Court ADR administrators** (as a program compliance framework)
- **Legal aid organizations** (as a resource for pro bono mediators)
- **Law students and mediation students** (as a study reference)

---

## Repository Structure

```
access-to-mediation/
├── SKILL.md                          # Main routing hub and quick reference
├── README.md                         # This file
├── LICENSE                           # MIT License
├── CONTRIBUTING.md                   # Contribution guidelines
│
├── references/                       # Standards-based reference guides (19 files)
│   ├── 01-intake-screening.md
│   ├── 02-domestic-abuse-screening.md
│   ├── 03-child-maltreatment.md
│   ├── 04-impartiality-conflicts.md
│   ├── 05-agreement-to-mediate.md
│   ├── 06-technology-odr.md
│   ├── 07-session-facilitation.md
│   ├── 08-voice-of-child.md
│   ├── 09-parenting-plans.md
│   ├── 10-barriers-modifications.md
│   ├── 11-confidentiality.md
│   ├── 12-agreement-drafting.md
│   ├── 13-suspension-termination.md
│   ├── 14-fees.md
│   ├── 15-qualifications-training.md
│   ├── 16-advertising.md
│   ├── 17-ethics-compliance.md
│   ├── workflow-diagrams.md          # 6 Mermaid decision-flow diagrams
│   └── related-guidelines.md        # Cross-references to AFCC, ABA, international standards
│
├── templates/                        # Ready-to-customize practice documents (10 files)
│   ├── intake-questionnaire.md
│   ├── domestic-abuse-screening-checklist.md
│   ├── agreement-to-mediate.md
│   ├── conflict-of-interest-disclosure.md
│   ├── parenting-plan-worksheet.md
│   ├── mediation-summary.md
│   ├── termination-notice.md
│   ├── mediator-training-log.md
│   ├── technology-consent.md
│   └── fee-disclosure.md
│
├── scenarios/                        # Practice scenario library
│   └── scenario-library.md          # 20 "What do I do when..." scenarios
│
├── app/                              # Interactive React tools
│   ├── parenting-plan-builder.jsx   # 50+ provision categories with notes & export
│   ├── compliance-dashboard.jsx     # Ethics self-audit with scoring & gap analysis
│   └── ce-tracker.jsx              # CE hours tracker against 2025 requirements
│
├── docs/                             # Professional deliverables
│   ├── intake-questionnaire.docx    # Word template — intake form
│   ├── agreement-to-mediate.docx   # Word template — agreement to mediate
│   ├── 2025-model-standards-cle-presentation.pptx  # 10-slide CLE/CEU deck
│   └── index.html                   # GitHub Pages site
│
├── jurisdictions/                    # State-specific modules
│   ├── TEMPLATE.md                  # Contributor template for new states
│   └── missouri/
│       └── jurisdiction.md          # Missouri statutes, reporting, qualifications
│
└── scripts/                          # Data schemas & automation
    └── airtable-schema.md           # Case management CSV/Airtable schema
```

---

## Standards Coverage

| Standard Area | 2025 Family (AFCC/ABA) | 2005 General (ABA/AAA/ACR) | Reference File |
|---|---|---|---|
| Self-Determination | I | I | 01, 07, 12 |
| Informed Decision-Making | II | — | 01, 07, 12 |
| Education of Parties | III | — | 01, 05 |
| Barriers & Modifications | IV | VI | 01, 10 |
| Domestic Abuse | V | — | 02 |
| Child Maltreatment | VI | — | 03 |
| Impartiality & Conflicts | VII | II, III | 04 |
| Confidentiality | VIII | V | 11 |
| Technology / ODR | IX | IV | 06 |
| Voice of the Child | X | — | 08 |
| Qualifications & Training | XI | IV | 15 |
| Suspension & Termination | XII | — | 13 |
| Fees | XIII | VIII | 14 |
| Advertising | XIV | VII | 16 |
| Advancement of Practice | — | IX | 17 |

---

## Quick Start

1. **Browse** the `references/` directory for standards-based guidance on any mediation task
2. **Copy and customize** templates from `templates/` (Markdown) or `docs/` (Word) for your practice
3. **Read the scenarios** in `scenarios/scenario-library.md` for real-world situation guidance
4. **Use the interactive tools** in `app/` — Parenting Plan Builder, Compliance Dashboard, CE Tracker
5. **Check your jurisdiction** in `jurisdictions/` for state-specific rules
6. **Run the ethics self-audit** (`references/17-ethics-compliance.md`) quarterly
7. **Deliver the CLE presentation** (`docs/2025-model-standards-cle-presentation.pptx`) at conferences

---

## What's New vs. v1

| Feature | v1 | v2 |
|---|---|---|
| Reference guides | 17 | 19 (+ workflow diagrams, related guidelines) |
| Templates (Markdown) | 10 | 10 |
| Templates (DOCX) | 0 | 2 (intake form, agreement to mediate) |
| Scenario library | 0 | 20 real-world scenarios |
| Interactive tools | 0 | 3 React apps (plan builder, compliance, CE tracker) |
| Mermaid diagrams | 0 | 6 decision-flow diagrams |
| CLE presentation | 0 | 10-slide PowerPoint deck |
| Jurisdiction modules | 0 | 1 (Missouri) + contributor template |
| Case management schema | 0 | Airtable/CSV schema (4 tables) |
| GitHub Pages site | 0 | 1 (docs/index.html) |

---

## Using as a Claude Skill

This repo is also structured as a Claude AI skill. If you use Claude, you can install it as a skill and Claude will automatically route your mediation questions to the appropriate reference file.

Copy the `SKILL.md` and the `references/` and `templates/` directories into your Claude skills folder.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

We welcome contributions from mediators, attorneys, researchers, and technologists. Priority areas:
- State-specific jurisdiction guides
- Translations to other languages
- Additional templates and checklists
- Research citations and evidence-based practice updates
- Accessibility improvements

---

## Standards Sources

- **2025 Model Standards for Family and Divorce Mediation**: [AFCC](https://www.afccnet.org) | [ACR](https://acrnet.org) | [Mediate.com](https://mediate.com/model-standards-for-family-and-divorce-mediation-2025-update/)
- **2005 Model Standards of Conduct for Mediators**: [ACR](https://acrnet.org/page/ModelS) | [ICDR/AAA](https://icdr.org) | [Mediate.com](https://mediate.com/model-standards-of-conduct/)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Part of the Access To Initiative

This repo is part of the **Access To** open-source civic technology initiative by [CoTrackPro](https://cotrackpro.com), which builds free tools for justice, education, housing, health, safety, and services.

- [Access to Justice](https://github.com/cotrackpro/access-to-justice)
- [Access to Education](https://github.com/cotrackpro/access-to-education)
- [Access to Housing](https://github.com/cotrackpro/access-to-housing)
- [Access to Health](https://github.com/cotrackpro/access-to-health)
- [Access to Safety](https://github.com/cotrackpro/access-to-safety)
- [Access to Services](https://github.com/cotrackpro/access-to-services)
- **Access to Mediation** ← You are here
