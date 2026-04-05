import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-compliance-audit";

const AUDIT_SECTIONS = [
  {
    title: "Self-Determination",
    standard: "2025-I, 2005-I",
    level: "SHALL",
    items: [
      "I support parties' voluntary, autonomous decision-making",
      "I never pressure parties toward settlement",
      "I inform parties of their right to withdraw at any time",
      "I inform parties they may agree or decline any proposal",
      "I address dynamics that might undermine meaningful participation",
    ],
  },
  {
    title: "Informed Decision-Making",
    standard: "2025-II",
    level: "SHALL",
    items: [
      "I facilitate safe and accurate disclosure of information",
      "I allow time for parties to consult with experts and support persons",
      "I recommend independent attorney review of agreements",
      "I do not provide legal advice or therapy",
      "When only one party has an attorney, I consider the power disparity",
    ],
  },
  {
    title: "Domestic Abuse Screening",
    standard: "2025-V",
    level: "SHALL",
    items: [
      "I screen every case for domestic abuse, separately and confidentially",
      "I screen before seeking consent to mediate",
      "I monitor for domestic abuse indicators throughout mediation",
      "I have specific training in domestic abuse dynamics including coercive control",
      "I maintain current training on domestic abuse topics",
    ],
  },
  {
    title: "Child Maltreatment",
    standard: "2025-VI",
    level: "SHALL",
    items: [
      "I do not mediate child maltreatment cases without relevant training",
      "I explain mandatory reporting obligations to parties",
      "I provide appropriate referrals when concerns arise",
      "I consider suspension/termination when child maltreatment is alleged",
    ],
  },
  {
    title: "Impartiality & Conflicts",
    standard: "2025-VII, 2005-II/III",
    level: "SHALL",
    items: [
      "I conduct a conflict-of-interest check before accepting every case",
      "I disclose all actual and potential conflicts",
      "I obtain informed, written waivers when proceeding with disclosed conflicts",
      "I withdraw when impartiality is compromised",
      "I guard against bias based on personal characteristics",
    ],
  },
  {
    title: "Confidentiality",
    standard: "2025-VIII, 2005-V",
    level: "SHALL",
    items: [
      "I explain confidentiality and its exceptions before mediation",
      "I include confidentiality provisions in the Agreement to Mediate",
      "I discuss caucus confidentiality before separate sessions",
      "I implement data security measures for digital information",
      "I know my jurisdiction's confidentiality and privilege rules",
    ],
  },
  {
    title: "Technology & ODR",
    standard: "2025-IX",
    level: "SHOULD",
    items: [
      "I assess parties' technology abilities before using ODR",
      "I obtain informed consent for technology use",
      "I maintain training on technology tools I use",
      "I implement end-to-end encryption and data security",
      "I regularly evaluate the tools I use for ethical/legal compliance",
    ],
  },
  {
    title: "Voice of the Child",
    standard: "2025-X",
    level: "SHOULD",
    items: [
      "I help parents consider children's perspectives and needs",
      "I use developmentally appropriate methods for including children's voice",
      "I apply safeguards when children are directly involved",
      "I never place children in a position of choosing between parents",
    ],
  },
  {
    title: "Qualifications & Training",
    standard: "2025-XI, 2005-IV",
    level: "SHALL",
    items: [
      "I am qualified by education and training for the cases I mediate",
      "I maintain a training log with dates, topics, and hours",
      "I engage in peer consultation regularly",
      "I recognize and decline cases beyond my competence",
    ],
  },
  {
    title: "Fees & Advertising",
    standard: "2025-XIII/XIV, 2005-VII/VIII",
    level: "SHALL",
    items: [
      "I disclose fee information before mediation begins",
      "I never charge contingent or outcome-based fees",
      "My advertising is truthful and does not guarantee outcomes",
      "I accurately represent my qualifications in all marketing",
    ],
  },
];

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveToStorage(responses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  } catch {
    // storage full or unavailable
  }
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ComplianceDashboard() {
  const [responses, setResponses] = useState(() => loadFromStorage());
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    saveToStorage(responses);
  }, [responses]);

  const setResponse = (sectionIdx, itemIdx, value) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setResponses({ ...responses, [key]: value });
  };

  const getResponse = (sectionIdx, itemIdx) => responses[`${sectionIdx}-${itemIdx}`];

  const totalItems = AUDIT_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const answeredItems = Object.keys(responses).length;
  const yesItems = Object.values(responses).filter((v) => v === "yes").length;
  const noItems = Object.values(responses).filter((v) => v === "no").length;
  const partialItems = Object.values(responses).filter((v) => v === "partial").length;
  const score = answeredItems > 0 ? Math.round((yesItems / answeredItems) * 100) : 0;
  const progressPct = Math.round((answeredItems / totalItems) * 100);

  const getSectionScore = (sectionIdx) => {
    const section = AUDIT_SECTIONS[sectionIdx];
    let yes = 0, answered = 0;
    section.items.forEach((_, itemIdx) => {
      const r = getResponse(sectionIdx, itemIdx);
      if (r) { answered++; if (r === "yes") yes++; }
    });
    return answered > 0 ? Math.round((yes / answered) * 100) : null;
  };

  const getSectionProgress = (sectionIdx) => {
    const section = AUDIT_SECTIONS[sectionIdx];
    let answered = 0;
    section.items.forEach((_, itemIdx) => {
      if (getResponse(sectionIdx, itemIdx)) answered++;
    });
    return { answered, total: section.items.length };
  };

  const scoreColor = (s) => (s >= 90 ? "#16a34a" : s >= 70 ? "#ca8a04" : "#dc2626");
  const scoreLabel = (s) => (s >= 90 ? "Strong" : s >= 70 ? "Needs attention" : "Action required");

  const getGaps = () => {
    const gaps = [];
    AUDIT_SECTIONS.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        const r = getResponse(sIdx, iIdx);
        if (r === "no" || r === "partial") {
          gaps.push({ section: section.title, standard: section.standard, level: section.level, item, status: r });
        }
      });
    });
    return gaps;
  };

  const clearAll = () => {
    setResponses({});
    setShowResults(false);
  };

  const exportReport = () => {
    const gaps = getGaps();
    const lines = [
      "ETHICS & COMPLIANCE SELF-AUDIT REPORT",
      "=".repeat(50),
      `Date: ${new Date().toLocaleDateString()}`,
      `Overall Score: ${score}% (${scoreLabel(score)})`,
      `Items Assessed: ${answeredItems}/${totalItems}`,
      `Compliant: ${yesItems} | Partial: ${partialItems} | Non-compliant: ${noItems}`,
      "",
      "SECTION SCORES:",
      "-".repeat(50),
    ];

    AUDIT_SECTIONS.forEach((section, sIdx) => {
      const s = getSectionScore(sIdx);
      const prog = getSectionProgress(sIdx);
      lines.push(`  ${section.title} (${section.standard}, ${section.level}): ${s !== null ? `${s}% (${scoreLabel(s)})` : "Not assessed"} [${prog.answered}/${prog.total} answered]`);
    });

    if (gaps.length > 0) {
      lines.push("");
      lines.push("CORRECTIVE ACTIONS NEEDED:");
      lines.push("-".repeat(50));
      gaps.forEach((g) => {
        const status = g.status === "no" ? "NOT COMPLIANT" : "PARTIAL";
        lines.push(`  [${status}] ${g.item}`);
        lines.push(`    Section: ${g.section} | Standard: ${g.standard} | Level: ${g.level}`);
      });
    }

    lines.push("");
    lines.push("Recommended audit frequency: quarterly or after every 10 cases.");
    lines.push("Based on 2025 AFCC/ABA Model Standards & 2005 ABA/AAA/ACR Model Standards of Conduct.");

    const date = new Date().toISOString().slice(0, 10);
    downloadFile(lines.join("\n"), `compliance-audit-${date}.txt`);
  };

  if (showResults) {
    const gaps = getGaps();
    const noGaps = gaps.filter((g) => g.status === "no");
    const partialGaps = gaps.filter((g) => g.status === "partial");
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Compliance Results</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowResults(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>Back to Audit</button>
            <button onClick={exportReport} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13 }} aria-label="Download compliance report">
              Download Report
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }} role="status">
            <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(score) }}>{score}%</div>
            <div style={{ fontSize: 12, color: scoreColor(score), fontWeight: 600 }}>{scoreLabel(score)}</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }} role="status">
            <div style={{ fontSize: 32, fontWeight: 700, color: "#dc2626" }}>{noGaps.length}</div>
            <div style={{ fontSize: 12, color: "#991b1b" }}>Non-compliant</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a" }} role="status">
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ca8a04" }}>{partialGaps.length}</div>
            <div style={{ fontSize: 12, color: "#854d0e" }}>Partial</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }} role="status">
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1d4ed8" }}>{answeredItems}/{totalItems}</div>
            <div style={{ fontSize: 12, color: "#1e40af" }}>Assessed</div>
          </div>
        </div>
        <h3 style={{ fontSize: 16, color: "#0f172a", marginBottom: 8 }}>Section Scores</h3>
        {AUDIT_SECTIONS.map((section, sIdx) => {
          const s = getSectionScore(sIdx);
          const prog = getSectionProgress(sIdx);
          return (
            <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 4, background: "#f8fafc", borderRadius: 6 }}>
              <span style={{ fontSize: 14 }}>
                {section.title}{" "}
                <span style={{ fontSize: 11, color: "#94a3b8" }}>({section.level} · {prog.answered}/{prog.total})</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: s !== null ? scoreColor(s) : "#94a3b8" }}>
                {s !== null ? `${s}% — ${scoreLabel(s)}` : "Not assessed"}
              </span>
            </div>
          );
        })}
        {noGaps.length > 0 && (
          <>
            <h3 style={{ fontSize: 16, color: "#dc2626", marginTop: 20, marginBottom: 8 }}>Non-Compliant — Immediate Action Required</h3>
            {noGaps.map((g, i) => (
              <div key={`no-${i}`} style={{ padding: 12, marginBottom: 8, background: "#fef2f2", borderRadius: 8, borderLeft: "4px solid #dc2626" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{g.item}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{g.section} · {g.standard} · {g.level}</div>
              </div>
            ))}
          </>
        )}
        {partialGaps.length > 0 && (
          <>
            <h3 style={{ fontSize: 16, color: "#ca8a04", marginTop: 20, marginBottom: 8 }}>Partially Compliant — Improvement Needed</h3>
            {partialGaps.map((g, i) => (
              <div key={`partial-${i}`} style={{ padding: 12, marginBottom: 8, background: "#fffbeb", borderRadius: 8, borderLeft: "4px solid #ca8a04" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{g.item}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{g.section} · {g.standard} · {g.level}</div>
              </div>
            ))}
          </>
        )}
        {gaps.length === 0 && (
          <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", borderRadius: 8, textAlign: "center", color: "#166534", fontSize: 14, fontWeight: 600 }} role="status">
            Full compliance achieved on all assessed items.
          </div>
        )}
        <div style={{ marginTop: 16, padding: 12, background: "#f1f5f9", borderRadius: 8, fontSize: 12, color: "#475569" }}>
          Recommended frequency: quarterly or after every 10 cases. Audit date: {new Date().toLocaleDateString()}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Ethics & Compliance Self-Audit</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Based on 2025 AFCC/ABA Model Standards & 2005 ABA/AAA/ACR Model Standards of Conduct</p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: "#475569" }}>Progress: {answeredItems}/{totalItems} items ({progressPct}%)</span>
          <div style={{ display: "flex", gap: 8 }}>
            {answeredItems > 0 && (
              <button onClick={clearAll} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 11, color: "#64748b" }} aria-label="Clear all responses">
                Clear all
              </button>
            )}
          </div>
        </div>
        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Audit completion progress">
          <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct === 100 ? "#16a34a" : "#2563eb", borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={() => setShowResults(true)} disabled={answeredItems === 0} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: answeredItems > 0 ? "#2563eb" : "#94a3b8", color: "#fff", cursor: answeredItems > 0 ? "pointer" : "default", fontSize: 13 }} aria-label="View compliance results">
          View Results
        </button>
      </div>

      {AUDIT_SECTIONS.map((section, sIdx) => {
        const prog = getSectionProgress(sIdx);
        return (
          <div key={sIdx} style={{ marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{section.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{section.standard} · Level: {section.level}</div>
              </div>
              <span style={{ fontSize: 12, color: prog.answered === prog.total ? "#16a34a" : "#94a3b8", fontWeight: prog.answered === prog.total ? 600 : 400 }}>
                {prog.answered}/{prog.total}
              </span>
            </div>
            <div style={{ padding: "8px 14px" }}>
              {section.items.map((item, iIdx) => {
                const r = getResponse(sIdx, iIdx);
                return (
                  <div key={iIdx} style={{ padding: "8px 0", borderBottom: iIdx < section.items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ fontSize: 14, color: "#1e293b", marginBottom: 6 }}>{item}</div>
                    <div style={{ display: "flex", gap: 6 }} role="radiogroup" aria-label={`Compliance for: ${item}`}>
                      {[
                        ["yes", "Yes — Compliant", "#16a34a"],
                        ["partial", "Partial", "#ca8a04"],
                        ["no", "No — Non-compliant", "#dc2626"],
                      ].map(([val, label, color]) => (
                        <button key={val} onClick={() => setResponse(sIdx, iIdx, val)} role="radio" aria-checked={r === val} aria-label={label} style={{
                          padding: "4px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                          border: r === val ? `2px solid ${color}` : "1px solid #cbd5e1",
                          background: r === val ? `${color}15` : "#fff",
                          color: r === val ? color : "#64748b", fontWeight: r === val ? 600 : 400,
                        }}>{val === "yes" ? "Yes" : val === "partial" ? "Partial" : "No"}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
