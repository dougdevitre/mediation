# Airtable / CSV Schema — Mediation Case Management

> Data schema for tracking mediation cases with standards compliance fields. Import as CSV or create as an Airtable base.

---

## Table: Cases

```csv
case_id,referral_source,case_type,date_opened,date_closed,status,party_a_name,party_b_name,mediator_name,session_count,total_hours,outcome,dv_screening_completed,child_maltreatment_screening_completed,barriers_identified,process_modifications,conflict_check_completed,agreement_to_mediate_signed,technology_consent_obtained,notes
CASE-001,court,divorce,2026-04-01,,active,Jane Doe,John Doe,Mediator Name,3,4.5,pending,yes,yes,language_barrier,"interpreter provided",yes,yes,yes,""
CASE-002,self,custody_modification,2026-03-15,2026-04-10,completed,Party A,Party B,Mediator Name,5,7.0,full_agreement,yes,yes,none,,yes,yes,no,""
```

### Field Definitions

| Field | Type | Values | Standard |
|---|---|---|---|
| case_id | Text | Auto-generated | — |
| referral_source | Single Select | court, attorney, self, agency, other | — |
| case_type | Single Select | divorce, custody, modification, paternity, other | — |
| date_opened | Date | | — |
| date_closed | Date | | — |
| status | Single Select | intake, active, suspended, completed, terminated | 2025-XII |
| party_a_name | Text | | — |
| party_b_name | Text | | — |
| mediator_name | Text | | — |
| session_count | Number | | — |
| total_hours | Number | | — |
| outcome | Single Select | full_agreement, partial_agreement, no_agreement, terminated_by_mediator, terminated_by_party, pending | 2025-XII |
| dv_screening_completed | Checkbox | yes/no | 2025-V |
| child_maltreatment_screening_completed | Checkbox | yes/no | 2025-VI |
| barriers_identified | Multi Select | none, domestic_abuse, substance_use, mental_health, self_represented, language, literacy, cultural, financial, technology | 2025-IV |
| process_modifications | Text | Description of modifications implemented | 2025-IV |
| conflict_check_completed | Checkbox | yes/no | 2025-VII |
| agreement_to_mediate_signed | Checkbox | yes/no | 2025-III(B) |
| technology_consent_obtained | Checkbox | yes/no | 2025-IX |
| notes | Long Text | Confidential mediator notes | — |

---

## Table: Sessions

```csv
session_id,case_id,date,duration_hours,format,type,parties_present,attorney_present,notes
SESS-001,CASE-001,2026-04-01,1.5,in_person,joint,"party_a,party_b",none,""
SESS-002,CASE-001,2026-04-01,0.5,in_person,caucus_a,party_a,none,""
SESS-003,CASE-001,2026-04-08,1.5,video,joint,"party_a,party_b","party_a_attorney",""
```

### Field Definitions

| Field | Type | Values |
|---|---|---|
| session_id | Text | Auto-generated |
| case_id | Link | Links to Cases table |
| date | Date | |
| duration_hours | Number | |
| format | Single Select | in_person, video, phone, shuttle |
| type | Single Select | joint, caucus_a, caucus_b, intake_a, intake_b |
| parties_present | Multi Select | party_a, party_b |
| attorney_present | Single Select | none, party_a_attorney, party_b_attorney, both |
| notes | Long Text | Confidential session notes |

---

## Table: Training Log

```csv
training_id,mediator_name,date,title,provider,hours,topics,certificate_on_file
TR-001,Mediator Name,2026-01-15,Coercive Control in Family Mediation,AFCC,6.0,"dv_dynamics,dv_parenting",yes
TR-002,Mediator Name,2026-03-01,ODR Best Practices,ACR,3.0,"technology_odr,data_security",yes
```

### Required Topics (per 2025 Standards)

| Topic ID | Topic | Standard |
|---|---|---|
| dv_dynamics | Domestic abuse dynamics & coercive control | V(C) |
| dv_parenting | Impact of DA on parenting/children | V(C) |
| dv_screening | DA screening techniques | V(A) |
| child_maltreatment | Child maltreatment recognition | VI(A) |
| mandatory_reporting | Mandatory reporting | VI(B) |
| technology_odr | Technology & ODR competence | IX(B) |
| data_security | Data security & privacy | IX(C) |

---

## Table: Compliance Audits

```csv
audit_id,mediator_name,date,total_items,yes_count,partial_count,no_count,score_percent,gaps_identified,corrective_actions
AUDIT-001,Mediator Name,2026-04-01,42,38,3,1,90,"missing_tech_consent_form","Create tech consent template by April 15"
```

---

## Template Usage Guide

Each table corresponds to one or more practice templates. Use the templates alongside the schema for consistent documentation:

| Table | Templates | Notes |
|---|---|---|
| Cases | `templates/intake-questionnaire.md`, `templates/agreement-to-mediate.md` | Complete at case opening |
| Cases (DV) | `templates/domestic-abuse-screening-checklist.md`, `templates/safety-plan.md` | Complete before first joint session |
| Sessions | `templates/session-notes.md` | Complete after each session |
| Cases (Closure) | `templates/mediation-summary.md`, `templates/mediation-settlement-agreement.md`, `templates/post-mediation-checklist.md`, `templates/termination-notice.md` | Use appropriate template based on outcome |
| Training Log | `templates/mediator-training-log.md` | Ongoing; corresponds to CE Tracker app |
| Compliance Audits | `templates/mediator-training-log.md` (self-audit section) | Quarterly; corresponds to Compliance Dashboard app |

### Additional Templates (Not Directly Mapped to Tables)

| Template | When to Use |
|---|---|
| `templates/conflict-of-interest-disclosure.md` | When conflicts are identified (Cases table `conflict_check_completed` field) |
| `templates/technology-consent.md` | When using ODR (Cases table `technology_consent_obtained` field) |
| `templates/fee-disclosure.md` | At intake, before signing Agreement to Mediate |
| `templates/parenting-plan-worksheet.md` | During parenting plan development sessions |
