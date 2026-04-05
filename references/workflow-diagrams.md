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

    style PRE fill:#EFF6FF,stroke:#2563EB
    style DURING fill:#F0FDF4,stroke:#16A34A
    style POST fill:#FEF3C7,stroke:#D97706
```
