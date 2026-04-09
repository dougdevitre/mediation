# Workflow Diagrams

> Visual decision maps for key mediation workflows. These can be rendered with any Mermaid-compatible tool.

---

## 1. Intake & Screening Flow

```mermaid
flowchart TD
    A[Referral Received] --> B[Initial Contact]
    B --> C[Schedule Individual Pre-Mediation Sessions]
    C --> D[Party A: Individual Session]
    C --> E[Party B: Individual Session]
    D --> F[Education & Process Overview]
    E --> F
    F --> G[Domestic Abuse Screening]
    G --> H[Child Maltreatment Screening]
    H --> I[Barriers Assessment]
    I --> J[Conflict of Interest Check]
    J --> K{Is Mediation Appropriate?}
    K -->|Yes| L[Sign Agreement to Mediate]
    K -->|Yes with Mods| M[Design Process Modifications]
    M --> L
    K -->|No| N[Decline & Refer Out]
    L --> O[Schedule First Mediation Session]
    N --> P[Provide Referrals]

    style A fill:#1E3A5F,stroke:#1E3A5F,color:#fff
    style K fill:#F59E0B,stroke:#D97706,color:#000
    style L fill:#10B981,stroke:#059669,color:#fff
    style N fill:#EF4444,stroke:#DC2626,color:#fff
```

---

## 2. Domestic Abuse Screening Decision Tree

```mermaid
flowchart TD
    A[Individual Pre-Mediation Session] --> B[Screen for Physical Abuse]
    B --> C[Screen for Sexual Abuse]
    C --> D[Screen for Economic Abuse]
    D --> E[Screen for Psychological Abuse]
    E --> F[Screen for Coercive Control]
    F --> G{Any Indicators Present?}
    G -->|No| H[Proceed with Standard Process]
    G -->|Yes| I[Assess Nature & Context]
    I --> J{Can Party Make Autonomous Decisions?}
    J -->|Yes with safeguards| K[Design Modifications]
    K --> L[Shuttle/caucus mediation]
    K --> M[Remote sessions]
    K --> N[Support persons present]
    K --> O[Attorney presence required]
    J -->|No| P{Active Safety Risk?}
    P -->|Yes| Q[Do NOT Mediate]
    Q --> R[Provide Safety Resources]
    Q --> S[Refer to Alternative Process]
    P -->|No| T[Help Explore Alternative ADR]

    style G fill:#F59E0B,stroke:#D97706
    style Q fill:#EF4444,stroke:#DC2626,color:#fff
    style H fill:#10B981,stroke:#059669,color:#fff
```

---

## 3. Child Maltreatment Response Protocol

```mermaid
flowchart TD
    A[Concern or Disclosure Arises] --> B{Mediator Has Required Training?}
    B -->|No| C[Do NOT Mediate Child Issues]
    C --> D[Refer to Qualified Mediator]
    B -->|Yes| E{Immediate Safety Risk?}
    E -->|Yes| F[Suspend Mediation]
    F --> G[Comply with Mandatory Reporting]
    F --> H[Provide Safety Referrals]
    E -->|No| I{Meets Reporting Threshold?}
    I -->|Yes| J[Report to CPS/Authorities]
    J --> K[Inform Parties of Report]
    K --> L{Can Mediation Continue?}
    I -->|No| M[Monitor and Document]
    M --> L
    L -->|Yes with caution| N[Continue with Heightened Awareness]
    N --> O[Provide Referrals to Services]
    L -->|No| P[Suspend/Terminate]
    P --> O

    style E fill:#F59E0B,stroke:#D97706
    style F fill:#EF4444,stroke:#DC2626,color:#fff
    style J fill:#EF4444,stroke:#DC2626,color:#fff
```

---

## 4. Conflict of Interest Decision Flow

```mermaid
flowchart TD
    A[Pre-Case Conflict Check] --> B{Prior Relationship with Parties?}
    B -->|No| C{Subject Matter Conflict?}
    B -->|Yes| D[Disclose to Both Parties]
    C -->|No| E{Institutional Conflict?}
    C -->|Yes| D
    E -->|No| F{Role Conflict?}
    E -->|Yes| D
    F -->|No| G[No Conflict - Proceed]
    F -->|Yes| D
    D --> H{Can Impartiality Be Maintained?}
    H -->|Yes| I[Obtain Written Waivers]
    I --> J[Proceed with Monitoring]
    H -->|No| K[Withdraw]
    H -->|Might Undermine Integrity| K

    style G fill:#10B981,stroke:#059669,color:#fff
    style K fill:#EF4444,stroke:#DC2626,color:#fff
    style H fill:#F59E0B,stroke:#D97706
```

---

## 5. Suspension & Termination Decision

```mermaid
flowchart TD
    A[Concern Identified] --> B{What Type?}
    B --> C[Safety Cannot Be Ensured]
    B --> D[Party Unable to Participate]
    B --> E[Impartiality Compromised]
    B --> F[Bad Faith / Delay Tactics]
    B --> G[Impasse Reached]
    C --> H[TERMINATE]
    E --> H
    D --> I{Temporary or Permanent?}
    I -->|Temporary| J[SUSPEND]
    J --> K[Address Barrier]
    K --> L{Barrier Resolved?}
    L -->|Yes| M[Resume Mediation]
    L -->|No| H
    I -->|Permanent| H
    F --> N{Warning Given?}
    N -->|No| O[Warn and Set Expectations]
    O --> P{Behavior Continues?}
    P -->|Yes| H
    P -->|No| M
    N -->|Yes| H
    G --> Q{Options Explored?}
    Q -->|Yes| H
    Q -->|No| R[Try New Approaches]
    R --> M
    H --> S[Neutral Termination Notice]
    H --> T[Provide Referrals]

    style H fill:#EF4444,stroke:#DC2626,color:#fff
    style J fill:#F59E0B,stroke:#D97706
    style M fill:#10B981,stroke:#059669,color:#fff
```

---

## 6. Full Mediation Process Overview

```mermaid
flowchart LR
    subgraph PRE[Pre-Mediation]
        A1[Referral] --> A2[Individual Sessions]
        A2 --> A3[Screening]
        A3 --> A4[Agreement to Mediate]
    end
    subgraph DURING[During Mediation]
        B1[Opening] --> B2[Information Gathering]
        B2 --> B3[Option Generation]
        B3 --> B4[Negotiation]
        B4 --> B5[Agreement Drafting]
    end
    subgraph POST[Post-Mediation]
        C1[Attorney Review] --> C2[Signing]
        C2 --> C3[Court Filing]
    end
    PRE --> DURING --> POST

    style PRE fill:#EFF6FF,stroke:#2563EB,color:#1e40af
    style DURING fill:#F0FDF4,stroke:#16A34A,color:#166534
    style POST fill:#FEF3C7,stroke:#D97706,color:#92400e
    style A1 fill:#DBEAFE,stroke:#2563EB
    style A4 fill:#BFDBFE,stroke:#2563EB
    style B1 fill:#DCFCE7,stroke:#16A34A
    style B5 fill:#BBF7D0,stroke:#16A34A
    style C1 fill:#FEF3C7,stroke:#D97706
    style C3 fill:#FDE68A,stroke:#D97706
```

---

## 7. Party Preparation Workflow

```mermaid
flowchart TD
    A[Party Receives Mediation Notice] --> B{First Time?}
    B -->|Yes| C[Party Welcome Tool]
    B -->|No| D[Choose Path]
    C --> D
    D --> E[Mediation Readiness Tool]
    E --> F[Step 1: Learn What to Expect]
    F --> G[Step 2: Identify Issues]
    G --> H[Step 3: Set Priorities]
    H --> I{Children Involved?}
    I -->|Yes| J[Step 4: Children's Needs]
    J --> K[Step 5: Financial Disclosure]
    I -->|No| K
    K --> L[Step 6: Gather Documents]
    L --> M[Step 7: Write Questions]
    M --> N[Download Preparation Summary]
    N --> O[Arrive Prepared for Session]

    style A fill:#1E3A5F,stroke:#1E3A5F,color:#fff
    style C fill:#0D9488,stroke:#0D9488,color:#fff
    style K fill:#2563EB,stroke:#1D4ED8,color:#fff
    style O fill:#10B981,stroke:#059669,color:#fff
```

---

## 8. Mediator Case Lifecycle

```mermaid
flowchart TD
    subgraph INTAKE[Phase 1: Intake]
        I1[Conflict Check] --> I2[Individual Sessions]
        I2 --> I3[DV Screening]
        I3 --> I4[Risk Assessment]
        I4 --> I5{Safe to Proceed?}
        I5 -->|Yes| I6[Fee Disclosure]
        I5 -->|Modified| I7[Safety Plan]
        I7 --> I6
        I5 -->|No| I8[Terminate & Refer]
        I6 --> I9[Agreement to Mediate]
    end

    subgraph SESSION[Phase 2: Active Mediation]
        S1[Session Timer Start] --> S2[Facilitation]
        S2 --> S3[Parenting Plan Builder]
        S2 --> S4[Schedule Visualizer]
        S2 --> S5[Financial Disclosure Review]
        S3 --> S6[Session Notes]
        S4 --> S6
        S5 --> S6
        S6 --> S7[Session Timer Stop]
    end

    subgraph AGREEMENT[Phase 3: Agreement]
        A1[Clause Library] --> A2[Agreement Generator]
        A2 --> A3[Draft Review]
        A3 --> A4[Attorney Review]
        A4 --> A5[Final Agreement]
    end

    subgraph CLOSE[Phase 4: Closure]
        C1[Post-Mediation Checklist] --> C2[Case Analytics Log]
        C2 --> C3[Compliance Tracker Setup]
    end

    INTAKE --> SESSION --> AGREEMENT --> CLOSE

    style INTAKE fill:#EFF6FF,stroke:#2563EB
    style SESSION fill:#F0FDF4,stroke:#16A34A
    style AGREEMENT fill:#FEF3C7,stroke:#D97706
    style CLOSE fill:#FAF5FF,stroke:#7C3AED
    style I8 fill:#EF4444,stroke:#DC2626,color:#fff
```

---

## 9. Risk Assessment Scoring Flow

```mermaid
flowchart TD
    A[Begin Individual Screening] --> B[Physical Violence Domain]
    B --> C[Coercive Control Domain]
    C --> D[Economic Abuse Domain]
    D --> E[Psychological Abuse Domain]
    E --> F[Child Safety Domain]
    F --> G[Escalation Risk Factors]
    G --> H[Calculate Weighted Score]
    H --> I{Overall Risk Level}
    I -->|0-14%| J[LOW: Standard Joint Mediation]
    I -->|15-34%| K[MODERATE: Shuttle/Separate Sessions]
    I -->|35-59%| L[HIGH: Caucus-Only + Safety Plan]
    I -->|60%+| M[CRITICAL: Do Not Mediate]
    J --> N[Proceed]
    K --> O[Create Safety Plan]
    O --> N
    L --> P[Detailed Safety Protocol]
    P --> Q{Party Consents?}
    Q -->|Yes| N
    Q -->|No| R[Refer Out]
    M --> R

    style J fill:#10B981,stroke:#059669,color:#fff
    style K fill:#F59E0B,stroke:#D97706
    style L fill:#EF4444,stroke:#DC2626,color:#fff
    style M fill:#7F1D1D,stroke:#450A0A,color:#fff
```

---

## 10. Agreement Generation Flow

```mermaid
flowchart LR
    subgraph SETUP[Step 1: Case Setup]
        A1[Party Names] --> A2[State/Jurisdiction]
        A2 --> A3[Children Info]
        A3 --> A4[Select Sections]
    end

    subgraph CLAUSES[Step 2: Select Clauses]
        B1[Residential Schedule] --> B2[Holidays]
        B2 --> B3[Decision-Making]
        B3 --> B4[Communication]
        B4 --> B5[Financial Terms]
        B5 --> B6[Safety Provisions]
        B6 --> B7[Custom Language]
    end

    subgraph OUTPUT[Step 3: Generate]
        C1[Auto-Fill Variables] --> C2[Preview Draft]
        C2 --> C3{Review}
        C3 -->|Edit| C4[Back to Clauses]
        C3 -->|Accept| C5[Download/Copy]
        C5 --> C6[Attorney Review]
    end

    SETUP --> CLAUSES --> OUTPUT

    style SETUP fill:#EFF6FF,stroke:#2563EB
    style CLAUSES fill:#F0FDF4,stroke:#16A34A
    style OUTPUT fill:#FEF3C7,stroke:#D97706
```

---

## 11. Ethical Decision Engine Flow

```mermaid
flowchart TD
    A[Ethical Dilemma Arises] --> B{Identify Category}
    B --> C[Safety / DV]
    B --> D[Mandatory Reporting]
    B --> E[Conflict of Interest]
    B --> F[Power Imbalance]
    B --> G[Process Decision]

    C --> H[Walk Decision Tree]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I[Answer Yes/No Questions]
    I --> J[Reach Recommendation]
    J --> K{Obligation Level}
    K -->|SHALL/Required| L[Must Follow]
    K -->|SHOULD/Recommended| M[Strongly Encouraged]
    K -->|MAY/Permitted| N[Professional Discretion]

    L --> O[Document Decision]
    M --> O
    N --> O
    O --> P[Standard Citation + References]
    P --> Q[Download Decision Record]

    style A fill:#1E3A5F,stroke:#1E3A5F,color:#fff
    style L fill:#EF4444,stroke:#DC2626,color:#fff
    style M fill:#F59E0B,stroke:#D97706
    style N fill:#10B981,stroke:#059669,color:#fff
```

---

## 12. Conflict Check Process

```mermaid
flowchart TD
    A[New Case Inquiry] --> B[Enter Party Names]
    B --> C[Enter Attorneys/Related Parties]
    C --> D[Search Client Database]
    D --> E{Match Found?}
    E -->|Exact Match| F[CONFLICT DETECTED]
    E -->|Partial Match| G[POSSIBLE MATCH - Review]
    E -->|No Match| H[CLEAR - No Conflicts]

    F --> I[Identify Conflict Type]
    I --> J[Direct: Same Party]
    I --> K[Related: Other Capacity]
    I --> L[Attorney: Prior Case]

    J --> M{Can Proceed?}
    K --> M
    L --> M
    M -->|With Disclosure + Waiver| N[Disclose & Get Written Consent]
    M -->|No| O[Decline Case]

    G --> P[Manual Review Required]
    P --> M

    H --> Q[Document Check]
    N --> Q
    O --> Q
    Q --> R[Download Conflict Check Report]

    style F fill:#EF4444,stroke:#DC2626,color:#fff
    style G fill:#F59E0B,stroke:#D97706
    style H fill:#10B981,stroke:#059669,color:#fff
```

---

## 13. Child Support Calculation Flow

```mermaid
flowchart TD
    A[Select State Model] --> B{Model Type}
    B -->|Income Shares| C[Enter Both Parents' Income]
    B -->|Percentage| D[Enter Obligor Income]

    C --> E[Enter Number of Children]
    D --> E
    E --> F[Enter Parenting Time Split]
    F --> G[Enter Healthcare/Childcare Costs]

    G --> H{Income Shares Model}
    G --> I{Percentage Model}

    H --> J[Calculate Combined Income]
    J --> K[Apply Base Percentage by Children]
    K --> L[Add Healthcare + Childcare]
    L --> M[Allocate by Income Share]
    M --> N[Adjust for Parenting Time]

    I --> O[Apply State Percentage]
    O --> P[1 child: 20% / 2: 25% / 3: 30%]

    N --> Q[Monthly Support Amount]
    P --> Q
    Q --> R[Identify Obligor/Obligee]
    R --> S[Display Estimate + Disclaimers]
    S --> T[Download Report]

    style A fill:#1E3A5F,stroke:#1E3A5F,color:#fff
    style Q fill:#2563EB,stroke:#1D4ED8,color:#fff
    style T fill:#10B981,stroke:#059669,color:#fff
```

---

## 14. Training Simulator Flow

```mermaid
flowchart TD
    A[Select Scenario Category] --> B[Read Situation Description]
    B --> C[Choose from 4 Response Options]
    C --> D{Evaluate Response}
    D -->|Correct| E[Green: Full Credit]
    D -->|Partial| F[Yellow: Half Credit]
    D -->|Incorrect| G[Red: No Credit]

    E --> H[Show Standards Citation]
    F --> H
    G --> H

    H --> I[Show What NOT To Do]
    I --> J[Update Running Score]
    J --> K{More Scenarios?}
    K -->|Yes| A
    K -->|No| L[Final Score Summary]
    L --> M[Review Missed Items]

    style E fill:#10B981,stroke:#059669,color:#fff
    style F fill:#F59E0B,stroke:#D97706
    style G fill:#EF4444,stroke:#DC2626,color:#fff
    style L fill:#2563EB,stroke:#1D4ED8,color:#fff
```

---

## 15. Practice Analytics Flow

```mermaid
flowchart LR
    subgraph INPUT[Data Collection]
        A1[Log Cases] --> A2[Track Sessions]
        A2 --> A3[Record Outcomes]
        A3 --> A4[Note DV Screening]
    end

    subgraph METRICS[Computed Metrics]
        B1[Agreement Rate]
        B2[Avg Sessions/Case]
        B3[Revenue]
        B4[DV Screening Compliance]
        B5[Children Served]
    end

    subgraph ANALYSIS[Breakdowns]
        C1[By Outcome]
        C2[By Case Type]
        C3[By Referral Source]
        C4[By Time Period]
    end

    subgraph OUTPUT[Reports]
        D1[Filtered Dashboard]
        D2[Downloadable Report]
        D3[Practice Trends]
    end

    INPUT --> METRICS --> ANALYSIS --> OUTPUT

    style INPUT fill:#EFF6FF,stroke:#2563EB
    style METRICS fill:#F0FDF4,stroke:#16A34A
    style ANALYSIS fill:#FEF3C7,stroke:#D97706
    style OUTPUT fill:#FAF5FF,stroke:#7C3AED
```

---

## 16. Complete Tool Ecosystem

```mermaid
flowchart TB
    subgraph PARTY[Party Tools]
        P1[Party Welcome]
        P2[Mediation Readiness]
        P3[Financial Disclosure]
        P4[Schedule Visualizer]
        P5[Cost Estimator]
        P6[Child Support Calc]
        P7[Compliance Tracker]
    end

    subgraph MEDIATOR[Mediator Tools]
        M1[Mediator Dashboard]
        M2[Intake Workflow]
        M3[Risk Assessment]
        M4[Conflict Check]
        M5[Session Timer]
        M6[Parenting Plan Builder]
        M7[Clause Library]
        M8[Agreement Generator]
        M9[Compliance Dashboard]
        M10[CE Tracker]
        M11[Decision Engine]
        M12[Training Simulator]
        M13[Case Analytics]
    end

    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5

    M1 --> M2
    M2 --> M3
    M3 --> M5
    M5 --> M6
    M6 --> M7
    M7 --> M8

    P3 -.->|Financial data| M5
    P4 -.->|Schedule choice| M6
    M8 -.->|Agreement terms| P7
    M3 -.->|Risk level| M2

    style PARTY fill:#EFF6FF,stroke:#2563EB
    style MEDIATOR fill:#F0FDF4,stroke:#16A34A
    style P1 fill:#0D9488,stroke:#0D9488,color:#fff
    style M1 fill:#1E3A5F,stroke:#1E3A5F,color:#fff
```

---

## 17. AI Use Assessment Workflow (NCTDR/ICODR ODR Standards)

```mermaid
flowchart TD
    A[Consider Using AI Tool] --> B[Identify Purpose & Phase of Use]
    B --> C[Assess Against 9 ODR Standards]

    C --> D{Accessible?}
    D -->|Yes| E{Accountable?}
    D -->|No| X[Do Not Use / Find Alternative]

    E -->|Yes| F{Competent?}
    E -->|No| X

    F -->|Yes| G{Confidential?}
    F -->|No| X

    G -->|Yes| H{Equal & Fair?}
    G -->|No| X

    H -->|Yes| I{Legal & Secure?}
    H -->|No| X

    I -->|Yes| J{Transparent?}
    I -->|No| X

    J -->|Yes| K[Complete AI Use Disclosure Form]
    J -->|No| X

    K --> L[Disclose AI Use to All Parties]
    L --> M[Obtain Informed Consent]
    M --> N{Consent Given?}

    N -->|Yes| O[Deploy AI with Human Oversight]
    N -->|No| P[Proceed Without AI]

    O --> Q[Monitor Throughout Process]
    Q --> R[Verify AI Outputs Before Use]
    R --> S[Monitor for Bias & Accuracy]
    S --> T{Issues Found?}

    T -->|Yes| U[Adjust, Disclose, or Discontinue]
    T -->|No| V[Continue with Oversight]
    U --> Q
    V --> Q

    X --> W[Document Decision & Rationale]

    style A fill:#1E3A5F,stroke:#1E3A5F,color:#fff
    style K fill:#2563EB,stroke:#1D4ED8,color:#fff
    style O fill:#10B981,stroke:#059669,color:#fff
    style X fill:#EF4444,stroke:#DC2626,color:#fff
    style P fill:#F59E0B,stroke:#D97706,color:#000
    style N fill:#F59E0B,stroke:#D97706,color:#000
```
