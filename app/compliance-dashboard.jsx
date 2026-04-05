import { useState, useEffect } from "react";

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

export default function ComplianceDashboard() {
  const [responses, setResponses] = useState(() => {
    try { const saved = localStorage.getItem("cd-responses"); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("cd-responses", JSON.stringify(responses)); } catch {}
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

  const getSectionScore = (sectionIdx) => {
    const section = AUDIT_SECTIONS[sectionIdx];
    let yes = 0, answered = 0;
    section.items.forEach((_, itemIdx) => {
      const r = getResponse(sectionIdx, itemIdx);
      if (r) { answered++; if (r === "yes") yes++; }
    });
    return answered > 0 ? Math.round((yes / answered) * 100) : null;
  };

  const scoreColor = (s) => (s >= 90 ? "#16a34a" : s >= 70 ? "#ca8a04" : "#dc2626");

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

  if (showResults) {
    const gaps = getGaps();
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Compliance Results</h2>
          <button onClick={() => setShowResults(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>← Back to Audit</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor(score) }}>{score}%</div>
            <div style={{ fontSize: 12, color: "#166534" }}>Overall Score</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ca8a04" }}>{gaps.length}</div>
            <div style={{ fontSize: 12, color: "#854d0e" }}>Gaps Found</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1d4ed8" }}>{answeredItems}/{totalItems}</div>
            <div style={{ fontSize: 12, color: "#1e40af" }}>Items Assessed</div>
          </div>
        </div>
        <h3 style={{ fontSize: 16, color: "#0f172a", marginBottom: 8 }}>Section Scores</h3>
        {AUDIT_SECTIONS.map((section, sIdx) => {
          const s = getSectionScore(sIdx);
          return (
            <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 4, background: "#f8fafc", borderRadius: 6 }}>
              <span style={{ fontSize: 14 }}>{section.title} <span style={{ fontSize: 11, color: "#94a3b8" }}>({section.level})</span></span>
              <span style={{ fontSize: 14, fontWeight: 600, color: s !== null ? scoreColor(s) : "#94a3b8" }}>{s !== null ? `${s}%` : "—"}</span>
            </div>
          );
        })}
        {gaps.length > 0 && (
          <>
            <h3 style={{ fontSize: 16, color: "#dc2626", marginTop: 20, marginBottom: 8 }}>Corrective Actions Needed</h3>
            {gaps.map((g, i) => (
              <div key={i} style={{ padding: 12, marginBottom: 8, background: g.status === "no" ? "#fef2f2" : "#fffbeb", borderRadius: 8, borderLeft: `4px solid ${g.status === "no" ? "#dc2626" : "#ca8a04"}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{g.item}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{g.section} · {g.standard} · {g.level} · {g.status === "no" ? "Not compliant" : "Partially compliant"}</div>
              </div>
            ))}
          </>
        )}
        <div style={{ marginTop: 16, padding: 12, background: "#f1f5f9", borderRadius: 8, fontSize: 12, color: "#475569" }}>
          Recommended frequency: quarterly or after every 10 cases. Date: {new Date().toLocaleDateString()}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "8px 12px", background: "#eff6ff", borderRadius: 8 }}>
        <span style={{ fontSize: 14, color: "#1e40af" }}>{answeredItems}/{totalItems} answered</span>
        <button onClick={() => setShowResults(true)} disabled={answeredItems === 0} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: answeredItems > 0 ? "#2563eb" : "#94a3b8", color: "#fff", cursor: answeredItems > 0 ? "pointer" : "default", fontSize: 13 }}>
          View Results →
        </button>
      </div>
      {AUDIT_SECTIONS.map((section, sIdx) => (
        <div key={sIdx} style={{ marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{section.title}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{section.standard} · Level: {section.level}</div>
          </div>
          <div style={{ padding: "8px 14px" }}>
            {section.items.map((item, iIdx) => {
              const r = getResponse(sIdx, iIdx);
              return (
                <div key={iIdx} style={{ padding: "8px 0", borderBottom: iIdx < section.items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ fontSize: 14, color: "#1e293b", marginBottom: 6 }}>{item}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["yes", "Yes", "#16a34a"], ["partial", "Partial", "#ca8a04"], ["no", "No", "#dc2626"]].map(([val, label, color]) => (
                      <button key={val} onClick={() => setResponse(sIdx, iIdx, val)} aria-pressed={r === val} style={{
                        padding: "4px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                        border: r === val ? `2px solid ${color}` : "1px solid #cbd5e1",
                        background: r === val ? `${color}15` : "#fff",
                        color: r === val ? color : "#64748b", fontWeight: r === val ? 600 : 400,
                        outline: "none",
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
