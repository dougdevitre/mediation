# Access to Mediation

**Free, open-source practice tools for family mediators and the parties they serve — grounded in published model standards, built for real-world use.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standards: 2025 AFCC/ABA](https://img.shields.io/badge/Standards-2025%20AFCC%2FABA-green.svg)](https://www.afccnet.org)
[![Standards: 2005 ABA/AAA/ACR](https://img.shields.io/badge/Standards-2005%20ABA%2FAAA%2FACR-green.svg)](https://acrnet.org)
[![Jurisdictions: 5 States](https://img.shields.io/badge/Jurisdictions-5%20States-orange.svg)](#jurisdiction-modules)
[![Templates: 14](https://img.shields.io/badge/Templates-14-blueviolet.svg)](#practice-templates)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Why This Exists

Family mediators navigate some of the most consequential decisions in people's lives — custody arrangements, safety assessments, parenting plans that shape children's futures. Yet most mediators work without standardized practice tools. They rely on memory, experience, and handwritten notes to ensure compliance with evolving ethical standards.

**Access to Mediation changes that.** It provides a complete, standards-compliant practice toolkit — reference guides, screening checklists, interactive tools, practice templates, and decision-flow diagrams — all mapped to the two authoritative frameworks that govern family mediation in the United States:

1. **2025 Model Standards for Family and Divorce Mediation** (AFCC/ABA/ACR/APFM — approved May 2025)
2. **2005 Model Standards of Conduct for Mediators** (ABA/AAA/ACR — approved August–September 2005)

Every resource in this repository is grounded in these standards, with the applicable standard cited, the level of obligation identified (SHALL vs. SHOULD), and practical implementation guidance provided.

> **Disclaimer**: This project provides educational information and practice support templates. It does not constitute legal advice, therapy, or a substitute for professional judgment. Mediators must comply with applicable state law, court rules, and professional licensing requirements.

---

## Live Demo

**Try the interactive tools now** — no installation required:

**[Launch Access to Mediation](https://dougdevitre.github.io/mediation/)** — Parenting Plan Builder, Compliance Dashboard, CE Tracker, Mediation Readiness, Financial Disclosure, Scenario Search, and Reference Guide browser — all working directly in your browser.

---

## What's Inside

| Resource | Count | Description |
|----------|------:|-------------|
| **Reference Guides** | 19 | Standards-based guides for every phase of mediation practice |
| **Practice Templates** | 14 | Customizable Markdown templates (+ 2 Word .docx versions) |
| **Practice Scenarios** | 25 | "What do I do when..." real-world situation guidance |
| **Interactive Tools** | 5 | 3 for mediators + 2 party-facing preparation tools |
| **Workflow Diagrams** | 6 | Mermaid decision-flow diagrams for key processes |
| **Jurisdiction Modules** | 5 | State-specific statutes, reporting, and qualifications |
| **CLE Presentation** | 1 | 10-slide PowerPoint deck ready for conferences |
| **Case Management Schema** | 1 | Airtable/CSV schema for practice management |

---

## Interactive Tools

All tools feature **localStorage persistence** (data survives page refresh), **file download/export**, **form validation**, and **ARIA accessibility attributes**.

### For Mediators

| Tool | File | Key Features |
|------|------|-------------|
| **Parenting Plan Builder** | `app/parenting-plan-builder.jsx` | 50+ provisions across 8 categories, per-provision notes, copy-to-clipboard and file download, completeness hints for recommended categories |
| **Ethics & Compliance Dashboard** | `app/compliance-dashboard.jsx` | 46 audit items across 10 standards areas, progress bar, overall and per-section scoring, separate non-compliant vs. partial gap analysis, downloadable audit report |
| **CE Training Tracker** | `app/ce-tracker.jsx` | Log and edit training entries, 18 topics mapped to 2025 standards, required vs. optional distinction, gap alerts, downloadable training log |

### For Parties (Save Time & Money)

| Tool | File | Key Features |
|------|------|-------------|
| **Mediation Readiness** | `app/mediation-prep.jsx` | 7-step guided preparation: what to expect, issue identification, priority ranking (must-have/important/flexible), children's needs reflection, personalized document checklist, questions for the mediator, downloadable summary |
| **Financial Disclosure** | `app/financial-disclosure.jsx` | Income (7 sources), expenses (7 categories / 40+ line items), assets (11 categories), debts (9 categories), real-time totals, expense breakdown percentages, net worth, downloadable report |

---

## Practice Templates

All templates include **standards citations** in the header, consistent formatting, and customization guidance.

| Template | File | Standards |
|----------|------|-----------|
| Intake Questionnaire | `templates/intake-questionnaire.md` | 2025-III/IV, 2005-VI |
| Domestic Abuse Screening Checklist | `templates/domestic-abuse-screening-checklist.md` | 2025-V |
| Agreement to Mediate | `templates/agreement-to-mediate.md` | 2025-III, 2005-I |
| Conflict-of-Interest Disclosure | `templates/conflict-of-interest-disclosure.md` | 2025-VII, 2005-II/III |
| Parenting Plan Worksheet | `templates/parenting-plan-worksheet.md` | 2025-I/V(D)/X |
| Mediation Summary (court-neutral) | `templates/mediation-summary.md` | 2025-XII, 2005-VI |
| Settlement Agreement | `templates/mediation-settlement-agreement.md` | 2025-I/II/XII |
| Session Notes | `templates/session-notes.md` | 2025-I–XII, 2005-VI |
| Safety Plan (DV/High-Conflict) | `templates/safety-plan.md` | 2025-V |
| Post-Mediation Checklist | `templates/post-mediation-checklist.md` | 2025-VIII/XII/XIII, 2005-V/VIII |
| Termination Notice | `templates/termination-notice.md` | 2025-XII, 2005-I |
| Mediator Training Log | `templates/mediator-training-log.md` | 2025-XI, 2005-IV |
| Technology Consent Form | `templates/technology-consent.md` | 2025-IX |
| Fee Disclosure Statement | `templates/fee-disclosure.md` | 2025-XIII, 2005-VIII |

Word format versions: `docs/intake-questionnaire.docx`, `docs/agreement-to-mediate.docx`

---

## Who Is This For?

| Audience | How They Use It |
|----------|----------------|
| **Family mediators** | Daily practice support — templates, checklists, compliance tracking |
| **Parties preparing for mediation** | Preparation tools that reduce sessions and save money |
| **Mediation training programs** | Structured teaching resource with real scenarios and standards mapping |
| **Court ADR administrators** | Program compliance framework and quality benchmarks |
| **Legal aid organizations** | Resource for pro bono and volunteer mediators |
| **Law students and mediation students** | Study reference with standards citations |
| **State bar associations** | CLE presentation ready to deliver |

---

## Quick Start

1. **Try the live tools** at [dougdevitre.github.io/mediation](https://dougdevitre.github.io/mediation/)
2. **Browse** `references/` for standards-based guidance on any mediation task
3. **Copy and customize** templates from `templates/` (Markdown) or `docs/` (Word)
4. **Read the scenarios** in `scenarios/scenario-library.md` for challenging situations
5. **Check your jurisdiction** in `jurisdictions/` for state-specific rules
6. **Run the ethics self-audit** quarterly using the Compliance Dashboard
7. **Prepare parties** by sharing the Mediation Readiness and Financial Disclosure tools
8. **Deliver the CLE presentation** at your next conference

---

## Standards Coverage

Every resource is mapped to the applicable standard with the correct obligation level:

| Standard Area | 2025 Family (AFCC/ABA) | 2005 General (ABA/AAA/ACR) | Reference | Templates |
|---|---|---|---|---|
| Self-Determination | I | I | 01, 07, 12 | agreement-to-mediate |
| Informed Decision-Making | II | — | 01, 07, 12 | settlement-agreement |
| Education of Parties | III | — | 01, 05 | intake-questionnaire |
| Barriers & Modifications | IV | VI | 01, 10 | intake-questionnaire |
| Domestic Abuse | V | — | 02 | DV-screening, safety-plan |
| Child Maltreatment | VI | — | 03 | — |
| Impartiality & Conflicts | VII | II, III | 04 | conflict-of-interest |
| Confidentiality | VIII | V | 11 | agreement-to-mediate |
| Technology / ODR | IX | IV | 06 | technology-consent |
| Voice of the Child | X | — | 08 | parenting-plan-worksheet |
| Qualifications & Training | XI | IV | 15 | training-log |
| Suspension & Termination | XII | — | 13 | termination-notice, post-mediation |
| Fees | XIII | VIII | 14 | fee-disclosure |
| Advertising | XIV | VII | 16 | — |
| Advancement of Practice | — | IX | 17 | — |

---

## Jurisdiction Modules

State-specific guides mapping model standards to local law:

| State | Statutes | Confidentiality | Mandatory Reporting | DV & Mediation | Mediator Qualifications |
|-------|----------|-----------------|---------------------|----------------|------------------------|
| [California](jurisdictions/california/jurisdiction.md) | Fam. Code 3160-3186 | Evid. Code 1115-1128 | Penal Code 11164+ | Fam. Code 3181 | Rules of Court 5.210 |
| [Florida](jurisdictions/florida/jurisdiction.md) | F.S. Ch. 44, 61.183 | F.S. 44.405 | F.S. 39.201 (universal) | F.S. 44.102(2)(c) | Supreme Court certified |
| [Missouri](jurisdictions/missouri/jurisdiction.md) | RSMo 452.372 | RSMo 435.014 (UMA) | RSMo 210.115 | RSMo 452.372(3) | Local court rules |
| [New York](jurisdictions/new-york/jurisdiction.md) | DRL 253(c) | Program-dependent | SSL 413-420 | FCA Art. 8 | Part 146 (CDRCP) |
| [Texas](jurisdictions/texas/jurisdiction.md) | Fam. Code 153.0071 | CPRC 154.053 | Fam. Code 261.101 | Fam. Code 153.0071(f) | TMCA standards |

**Want to add your state?** Use the [contributor template](jurisdictions/TEMPLATE.md) and submit a pull request.

---

## Repository Structure

```
access-to-mediation/
├── README.md                         # This file
├── SKILL.md                          # Claude AI skill routing hub
├── LICENSE                           # MIT License
├── CONTRIBUTING.md                   # Contribution guidelines
├── CODE_OF_CONDUCT.md                # Contributor Covenant
├── SECURITY.md                       # Security policy
│
├── references/                       # 19 standards-based reference guides
│   ├── 01–17                         # One guide per standards area
│   ├── workflow-diagrams.md          # 6 Mermaid decision-flow diagrams
│   └── related-guidelines.md         # Cross-references to other standards
│
├── templates/                        # 14 ready-to-customize Markdown templates
│   ├── intake-questionnaire.md       # Pre-mediation screening
│   ├── domestic-abuse-screening-checklist.md
│   ├── agreement-to-mediate.md       # Initial consent document
│   ├── safety-plan.md                # DV/high-conflict safety measures
│   ├── session-notes.md              # Per-session documentation
│   ├── parenting-plan-worksheet.md   # Plan development aid
│   ├── mediation-settlement-agreement.md
│   ├── post-mediation-checklist.md   # Case closure workflow
│   └── ...                           # + 6 more templates
│
├── scenarios/                        # 20 "What do I do when..." practice scenarios
│
├── app/                              # 5 interactive React components
│   ├── parenting-plan-builder.jsx    # Mediator: 50+ provisions builder
│   ├── compliance-dashboard.jsx      # Mediator: ethics self-audit
│   ├── ce-tracker.jsx                # Mediator: training hour tracker
│   ├── mediation-prep.jsx            # Party: 7-step preparation wizard
│   └── financial-disclosure.jsx      # Party: income/expenses/assets/debts
│
├── docs/                             # GitHub Pages site + Word/PowerPoint
│   ├── index.html                    # Full interactive app (live demo)
│   ├── intake-questionnaire.docx     # Word template
│   ├── agreement-to-mediate.docx     # Word template
│   └── *.pptx                        # CLE presentation deck
│
├── jurisdictions/                    # State-specific modules
│   ├── TEMPLATE.md                   # Contributor template
│   ├── california/                   # California statutes & resources
│   ├── florida/                      # Florida statutes & resources
│   ├── missouri/                     # Missouri statutes & resources
│   ├── new-york/                     # New York statutes & resources
│   └── texas/                        # Texas statutes & resources
│
└── scripts/                          # Airtable/CSV case management schema
```

---

## Using as a Claude AI Skill

This repo doubles as a Claude AI skill. Install it and Claude will automatically route mediation questions to the appropriate reference file, apply the core principles, and respect the guardrails.

Copy `SKILL.md` and the `references/` and `templates/` directories into your Claude skills folder.

---

## Roadmap

We're building toward comprehensive national coverage and deeper tool integration:

- [ ] **Additional jurisdictions** — All 50 states (contributors welcome!)
- [ ] **Spanish language translation** — Templates and reference guides
- [ ] **PDF export** — Generate formatted documents from the interactive tools
- [ ] **Court-connected program module** — Administrative tools for court ADR offices
- [ ] **Research citations** — Link guidance to peer-reviewed mediation research
- [ ] **Accessibility audit** — Full WCAG 2.1 AA compliance certification
- [ ] **Mobile app** — PWA version of the interactive tools
- [ ] **LMS integration** — SCORM-compatible training modules for mediation programs
- [ ] **Outcome tracking** — Case outcome analytics across mediation practices
- [ ] **Multi-mediator support** — Authentication and cloud sync for group practices

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

We welcome contributions from mediators, attorneys, researchers, and technologists. **Priority areas:**

- **State jurisdiction modules** — Use the [template](jurisdictions/TEMPLATE.md) to add your state
- **Interactive tools and applications** — React components for mediators and parties
- **Translations** — Especially Spanish, Chinese, Vietnamese, Korean, Arabic
- **Additional scenarios** — Real situations mediators face
- **Research citations** — Evidence-based practice updates
- **Accessibility improvements** — Helping all mediators use these tools

---

## Standards Sources

- **2025 Model Standards for Family and Divorce Mediation**: [AFCC](https://www.afccnet.org) | [ACR](https://acrnet.org) | [Mediate.com](https://mediate.com/model-standards-for-family-and-divorce-mediation-2025-update/)
- **2005 Model Standards of Conduct for Mediators**: [ACR](https://acrnet.org/page/ModelS) | [ICDR/AAA](https://icdr.org) | [Mediate.com](https://mediate.com/model-standards-of-conduct/)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

The model standards referenced herein are published by AFCC, ABA, AAA, and ACR. This project provides educational commentary, implementation guidance, and practice templates — it does not reproduce the full text of the standards.

---

## Part of the Access To Initiative

This repo is part of the **Access To** open-source civic technology initiative by [CoTrackPro](https://cotrackpro.com) — free tools for justice, education, housing, health, safety, and services.

| Project | Description |
|---------|-------------|
| [Access to Justice](https://github.com/cotrackpro/access-to-justice) | Legal system navigation and court preparation |
| [Access to Safety](https://github.com/cotrackpro/access-to-safety) | Trauma-informed child safety documentation |
| [Access to Education](https://github.com/cotrackpro/access-to-education) | Special needs educational support |
| [Access to Health](https://github.com/cotrackpro/access-to-health) | Public health role-based guidance |
| [Access to Housing](https://github.com/cotrackpro/access-to-housing) | Housing access and tenant resources |
| [Access to Services](https://github.com/cotrackpro/access-to-services) | Social services navigation |
| **Access to Mediation** | **Standards-compliant family mediation tools** |
