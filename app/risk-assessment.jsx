import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "mediation-risk-assessment";

const DOMAINS = [
  {
    id: "physical",
    label: "Physical Violence",
    weight: 3,
    indicators: [
      { id: "phys_hit", label: "Has the other party ever hit, pushed, grabbed, or physically hurt you?", severity: 3 },
      { id: "phys_weapon", label: "Has the other party ever used or threatened to use a weapon?", severity: 5 },
      { id: "phys_strangulation", label: "Has the other party ever choked or strangled you?", severity: 5 },
      { id: "phys_escalating", label: "Has the physical violence gotten worse over time?", severity: 4 },
      { id: "phys_injury", label: "Have you ever needed medical attention due to the other party's actions?", severity: 4 },
    ],
  },
  {
    id: "coercive",
    label: "Coercive Control",
    weight: 3,
    indicators: [
      { id: "cc_isolate", label: "Does the other party try to control who you see or talk to?", severity: 3 },
      { id: "cc_monitor", label: "Does the other party monitor your phone, email, or location?", severity: 3 },
      { id: "cc_decisions", label: "Does the other party make all major decisions without your input?", severity: 2 },
      { id: "cc_threats", label: "Does the other party threaten consequences if you don't comply with their wishes?", severity: 3 },
      { id: "cc_children", label: "Does the other party use the children to control or manipulate you?", severity: 4 },
      { id: "cc_fear", label: "Are you afraid of the other party?", severity: 4 },
    ],
  },
  {
    id: "economic",
    label: "Economic Abuse",
    weight: 2,
    indicators: [
      { id: "econ_access", label: "Does the other party control your access to money or bank accounts?", severity: 2 },
      { id: "econ_work", label: "Has the other party prevented you from working or sabotaged your employment?", severity: 3 },
      { id: "econ_debt", label: "Has the other party forced you to take on debt or sign financial documents?", severity: 2 },
      { id: "econ_info", label: "Does the other party hide financial information from you?", severity: 2 },
    ],
  },
  {
    id: "psychological",
    label: "Psychological / Emotional Abuse",
    weight: 2,
    indicators: [
      { id: "psych_degrade", label: "Does the other party regularly criticize, humiliate, or belittle you?", severity: 2 },
      { id: "psych_gaslight", label: "Does the other party deny things that happened or make you question your reality?", severity: 3 },
      { id: "psych_threats_self", label: "Has the other party threatened to harm themselves if you leave or don't comply?", severity: 3 },
      { id: "psych_threats_custody", label: "Has the other party threatened to take the children away?", severity: 3 },
    ],
  },
  {
    id: "child_safety",
    label: "Child Safety Concerns",
    weight: 3,
    indicators: [
      { id: "child_witness", label: "Have the children witnessed violence or abuse?", severity: 4 },
      { id: "child_direct", label: "Has the other party physically harmed any child?", severity: 5 },
      { id: "child_threats", label: "Has the other party threatened to harm or abduct any child?", severity: 5 },
      { id: "child_neglect", label: "Are there concerns about child neglect when in the other party's care?", severity: 3 },
      { id: "child_substance", label: "Does the other party use substances that impair their ability to care for children?", severity: 3 },
    ],
  },
  {
    id: "risk_factors",
    label: "Escalation Risk Factors",
    weight: 2,
    indicators: [
      { id: "risk_separation", label: "Has violence or threats increased since separation?", severity: 4 },
      { id: "risk_stalk", label: "Has the other party followed you, shown up uninvited, or stalked you?", severity: 4 },
      { id: "risk_protection", label: "Do you have or have you had a protection/restraining order?", severity: 2 },
      { id: "risk_police", label: "Have police ever been called due to the other party's behavior?", severity: 2 },
      { id: "risk_pet", label: "Has the other party harmed or threatened pets?", severity: 3 },
      { id: "risk_access_weapons", label: "Does the other party have access to firearms?", severity: 4 },
    ],
  },
];

const PROCESS_MODS = {
  low: [
    "Standard joint mediation is likely appropriate",
    "Monitor for indicators throughout the process",
    "Ensure both parties understand voluntary participation",
  ],
  moderate: [
    "Consider shuttle mediation (parties in separate rooms/sessions)",
    "Conduct separate pre-mediation sessions with each party",
    "Create a safety plan (templates/safety-plan.md)",
    "Arrange staggered arrival/departure times",
    "Ensure affected party has support person available",
    "Increase check-ins with affected party between sessions",
  ],
  high: [
    "Shuttle mediation or caucus-only format required",
    "Create detailed safety plan with emergency protocols",
    "Coordinate with affected party's DV advocate",
    "Consider whether mediation is appropriate at all",
    "If proceeding: short sessions, frequent breaks, code word for exit",
    "Provide DV hotline and local resources",
    "Consult with supervisor or peer before proceeding",
  ],
  critical: [
    "Mediation is likely NOT appropriate — safety cannot be ensured",
    "Provide immediate safety resources and referrals",
    "Contact local DV services: National Hotline 1-800-799-7233",
    "Assess mandatory reporting obligations",
    "Document screening results (confidential mediator notes)",
    "Refer to legal aid for protective order assistance",
    "Do not share screening results with the other party",
  ],
};

function loadFromStorage() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveToStorage(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function RiskAssessment() {
  const stored = loadFromStorage();
  const [responses, setResponses] = useState(stored?.responses || {});
  const [showResults, setShowResults] = useState(false);
  const [notes, setNotes] = useState(stored?.notes || "");

  useEffect(() => { saveToStorage({ responses, notes }); }, [responses, notes]);

  const setResponse = (id, val) => setResponses({ ...responses, [id]: val });
  const clearAll = () => { setResponses({}); setShowResults(false); setNotes(""); };

  const answered = Object.keys(responses).length;
  const totalIndicators = DOMAINS.reduce((s, d) => s + d.indicators.length, 0);

  // Calculate risk score
  const { domainScores, totalScore, totalMaxScore, overallPct, riskLevel, riskColor, riskLabel, yesCount, sometimesCount } = useMemo(() => {
    const ds = DOMAINS.map((domain) => {
      let score = 0, maxScore = 0;
      domain.indicators.forEach((ind) => {
        maxScore += ind.severity * domain.weight;
        if (responses[ind.id] === "yes") score += ind.severity * domain.weight;
        else if (responses[ind.id] === "sometimes") score += (ind.severity * domain.weight) * 0.5;
      });
      return { ...domain, score, maxScore, pct: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0 };
    });
    const ts = ds.reduce((s, d) => s + d.score, 0);
    const tms = ds.reduce((s, d) => s + d.maxScore, 0);
    const op = tms > 0 ? Math.round((ts / tms) * 100) : 0;
    const rl = op >= 60 ? "critical" : op >= 35 ? "high" : op >= 15 ? "moderate" : "low";
    const vals = Object.values(responses);
    return {
      domainScores: ds, totalScore: ts, totalMaxScore: tms, overallPct: op, riskLevel: rl,
      riskColor: { low: "#16a34a", moderate: "#ca8a04", high: "#dc2626", critical: "#7f1d1d" }[rl],
      riskLabel: { low: "Low Risk", moderate: "Moderate Risk", high: "High Risk", critical: "Critical Risk" }[rl],
      yesCount: vals.filter((v) => v === "yes").length,
      sometimesCount: vals.filter((v) => v === "sometimes").length,
    };
  }, [responses]);


  const exportAssessment = () => {
    const lines = [
      "CONFIDENTIAL — DOMESTIC ABUSE RISK ASSESSMENT", "=".repeat(50),
      `Date: ${new Date().toLocaleDateString()}`, `Risk Level: ${riskLabel} (${overallPct}%)`,
      `Indicators present: ${yesCount} yes, ${sometimesCount} sometimes, out of ${totalIndicators}`, "",
      "DOMAIN SCORES:", "-".repeat(30),
    ];
    domainScores.forEach((d) => lines.push(`  ${d.label}: ${d.pct}%`));
    lines.push("", "INDICATORS FLAGGED:", "-".repeat(30));
    DOMAINS.forEach((domain) => {
      const flagged = domain.indicators.filter((i) => responses[i.id] === "yes" || responses[i.id] === "sometimes");
      if (flagged.length > 0) {
        lines.push(`  ${domain.label}:`);
        flagged.forEach((i) => lines.push(`    [${responses[i.id]}] ${i.label}`));
      }
    });
    lines.push("", "RECOMMENDED PROCESS MODIFICATIONS:", "-".repeat(30));
    PROCESS_MODS[riskLevel].forEach((m) => lines.push(`  - ${m}`));
    if (notes) lines.push("", "MEDIATOR NOTES:", "-".repeat(30), `  ${notes}`);
    lines.push("", "This assessment is a CONFIDENTIAL mediator work product.", "Do NOT share with parties or the court.", "Per 2025 Standard V (Domestic Abuse).");
    downloadFile(lines.join("\n"), `risk-assessment-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };

  if (showResults) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Risk Assessment Results</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowResults(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>Back</button>
            <button onClick={exportAssessment} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13 }}>Download</button>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: 24, background: riskLevel === "low" ? "#f0fdf4" : riskLevel === "moderate" ? "#fefce8" : "#fef2f2", borderRadius: 12, border: `2px solid ${riskColor}`, marginBottom: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: riskColor }}>{riskLabel}</div>
          <div style={{ fontSize: 16, color: riskColor, marginTop: 4 }}>Score: {overallPct}%</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{yesCount} indicators present, {sometimesCount} sometimes</div>
        </div>

        <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Domain Breakdown</h3>
        {domainScores.map((d) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 13, color: "#334155", width: 180, flexShrink: 0 }}>{d.label}</span>
            <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${d.pct}%`, background: d.pct >= 50 ? "#dc2626" : d.pct >= 25 ? "#ca8a04" : "#16a34a", borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: d.pct >= 50 ? "#dc2626" : d.pct >= 25 ? "#ca8a04" : "#16a34a", width: 40, textAlign: "right" }}>{d.pct}%</span>
          </div>
        ))}

        <h3 style={{ fontSize: 15, color: "#0f172a", marginTop: 20, marginBottom: 8 }}>Recommended Process Modifications</h3>
        <div style={{ ...cardStyle, borderLeft: `4px solid ${riskColor}` }}>
          {PROCESS_MODS[riskLevel].map((mod, i) => (
            <div key={i} style={{ fontSize: 13, color: "#334155", padding: "4px 0" }}>- {mod}</div>
          ))}
        </div>

        <h3 style={{ fontSize: 15, color: "#0f172a", marginTop: 16, marginBottom: 8 }}>Mediator Notes</h3>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Document your assessment, observations, and decisions..." aria-label="Mediator notes" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 80, fontFamily: "inherit", boxSizing: "border-box" }} />

        <div style={{ marginTop: 16, padding: 10, background: "#fef2f2", borderRadius: 8, fontSize: 12, color: "#991b1b", borderLeft: "4px solid #dc2626" }}>
          <strong>CONFIDENTIAL.</strong> This assessment is a mediator work product. Do not share with parties or the court. Per 2025 Standard V.
        </div>
      </div>
    );
  }

  // Screening form
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Domestic Abuse Risk Assessment</h2>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>Confidential screening tool per 2025 Standard V. Complete during individual pre-mediation sessions.</p>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>CONFIDENTIAL — Do not share with the other party.</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#475569" }}>{answered}/{totalIndicators} answered</span>
        <div style={{ display: "flex", gap: 8 }}>
          {answered > 0 && <button onClick={clearAll} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>Clear All</button>}
          <button onClick={() => setShowResults(true)} disabled={answered === 0} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: answered > 0 ? "#2563eb" : "#94a3b8", color: "#fff", cursor: answered > 0 ? "pointer" : "default", fontSize: 12 }}>View Results</button>
        </div>
      </div>

      {DOMAINS.map((domain) => (
        <div key={domain.id} style={{ marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{domain.label}</div>
          </div>
          <div style={{ padding: "8px 14px" }}>
            {domain.indicators.map((ind) => {
              const r = responses[ind.id];
              return (
                <div key={ind.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 13, color: "#1e293b", marginBottom: 6 }}>{ind.label}</div>
                  <div style={{ display: "flex", gap: 6 }} role="radiogroup" aria-label={ind.label}>
                    {[["yes", "Yes", "#dc2626"], ["sometimes", "Sometimes", "#ca8a04"], ["no", "No", "#16a34a"]].map(([val, label, color]) => (
                      <button key={val} onClick={() => setResponse(ind.id, val)} role="radio" aria-checked={r === val} style={{
                        padding: "3px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                        border: r === val ? `2px solid ${color}` : "1px solid #cbd5e1",
                        background: r === val ? `${color}15` : "#fff",
                        color: r === val ? color : "#64748b", fontWeight: r === val ? 600 : 400,
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
