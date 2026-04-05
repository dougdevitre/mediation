import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-cost-est";

const ISSUE_COMPLEXITY = [
  { id: "parenting", label: "Parenting plan / custody", sessions: 2, category: "Children" },
  { id: "child_support", label: "Child support", sessions: 1, category: "Children" },
  { id: "spousal_support", label: "Spousal support / alimony", sessions: 1.5, category: "Financial" },
  { id: "property_simple", label: "Property division (simple)", sessions: 1, category: "Financial" },
  { id: "property_complex", label: "Property division (complex: business, real estate, investments)", sessions: 3, category: "Financial" },
  { id: "debt", label: "Debt allocation", sessions: 0.5, category: "Financial" },
  { id: "retirement", label: "Retirement / pension division", sessions: 1, category: "Financial" },
  { id: "relocation", label: "Relocation dispute", sessions: 2, category: "Other" },
  { id: "modification", label: "Modification of existing order", sessions: 1.5, category: "Other" },
  { id: "communication", label: "Parent communication issues", sessions: 0.5, category: "Other" },
];

const COMPLEXITY_FACTORS = [
  { id: "high_conflict", label: "High-conflict relationship", multiplier: 1.5 },
  { id: "dv_history", label: "History of domestic abuse (may require shuttle mediation)", multiplier: 1.75 },
  { id: "multiple_children", label: "Multiple children with different needs", multiplier: 1.25 },
  { id: "self_represented", label: "One or both parties without attorneys", multiplier: 1.15 },
  { id: "interstate", label: "Interstate / long-distance co-parenting", multiplier: 1.3 },
  { id: "language", label: "Interpreter needed", multiplier: 1.2 },
];

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

export default function CostEstimator() {
  const stored = loadFromStorage();
  const [issues, setIssues] = useState(new Set(stored?.issues || []));
  const [factors, setFactors] = useState(new Set(stored?.factors || []));
  const [hourlyRate, setHourlyRate] = useState(stored?.hourlyRate || "250");
  const [sessionLength, setSessionLength] = useState(stored?.sessionLength || "1.5");
  const [splitMethod, setSplitMethod] = useState(stored?.splitMethod || "equal");

  useEffect(() => {
    saveToStorage({ issues: [...issues], factors: [...factors], hourlyRate, sessionLength, splitMethod });
  }, [issues, factors, hourlyRate, sessionLength, splitMethod]);

  const toggleIssue = (id) => { const n = new Set(issues); n.has(id) ? n.delete(id) : n.add(id); setIssues(n); };
  const toggleFactor = (id) => { const n = new Set(factors); n.has(id) ? n.delete(id) : n.add(id); setFactors(n); };

  const rate = parseFloat(hourlyRate) || 0;
  const sessLen = parseFloat(sessionLength) || 1.5;

  const baseSessions = ISSUE_COMPLEXITY.filter((i) => issues.has(i.id)).reduce((s, i) => s + i.sessions, 0);
  const intakeSessions = issues.size > 0 ? 1 : 0;
  const totalBase = baseSessions + intakeSessions;

  const multiplier = COMPLEXITY_FACTORS.filter((f) => factors.has(f.id)).reduce((m, f) => m * f.multiplier, 1);
  const adjustedSessions = Math.ceil(totalBase * multiplier * 2) / 2;

  const totalHours = adjustedSessions * sessLen;
  const totalCost = totalHours * rate;
  const perPartyCost = splitMethod === "equal" ? totalCost / 2 : totalCost;

  const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const lowEst = Math.round(totalCost * 0.75);
  const highEst = Math.round(totalCost * 1.35);
  const lowPerParty = splitMethod === "equal" ? Math.round(lowEst / 2) : lowEst;
  const highPerParty = splitMethod === "equal" ? Math.round(highEst / 2) : highEst;

  const exportEstimate = () => {
    const lines = [
      "MEDIATION COST ESTIMATE", "=".repeat(40),
      `Generated: ${new Date().toLocaleDateString()}`, "",
      "ISSUES TO ADDRESS:",
      ...ISSUE_COMPLEXITY.filter((i) => issues.has(i.id)).map((i) => `  [x] ${i.label}`),
      "", "COMPLEXITY FACTORS:",
      ...(factors.size > 0 ? COMPLEXITY_FACTORS.filter((f) => factors.has(f.id)).map((f) => `  [x] ${f.label}`) : ["  None selected"]),
      "", "ESTIMATE:",
      `  Hourly rate: ${fmt(rate)}`,
      `  Session length: ${sessLen} hours`,
      `  Estimated sessions: ${adjustedSessions}`,
      `  Estimated total hours: ${totalHours}`,
      `  Cost range: ${fmt(lowEst)} - ${fmt(highEst)}`,
      `  Per party (${splitMethod === "equal" ? "split equally" : "one party pays"}): ${fmt(lowPerParty)} - ${fmt(highPerParty)}`,
      "", "NOTE: This is a rough estimate for planning purposes only.",
      "Actual costs depend on cooperation, preparation, complexity, and mediator rates.",
      "Parties who arrive prepared (with financial documents and clear priorities) typically need fewer sessions.",
    ];
    downloadFile(lines.join("\n"), `mediation-cost-estimate-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Mediation Cost Estimator</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Get a rough estimate of what mediation might cost based on your issues and circumstances.</p>

      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div>
            <label htmlFor="rate" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Hourly Rate ($)</label>
            <input id="rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor="sessLen" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Session Length (hrs)</label>
            <input id="sessLen" type="number" step="0.5" value={sessionLength} onChange={(e) => setSessionLength(e.target.value)} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor="split" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Fee Split</label>
            <select id="split" value={splitMethod} onChange={(e) => setSplitMethod(e.target.value)} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}>
              <option value="equal">Split equally</option>
              <option value="one">One party pays</option>
            </select>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>What issues do you need to resolve?</h3>
        {["Children", "Financial", "Other"].map((cat) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{cat}</div>
            {ISSUE_COMPLEXITY.filter((i) => i.category === cat).map((issue) => (
              <label key={issue.id} htmlFor={`issue-${issue.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", cursor: "pointer" }}>
                <input id={`issue-${issue.id}`} type="checkbox" checked={issues.has(issue.id)} onChange={() => toggleIssue(issue.id)} style={{ accentColor: "#2563eb" }} />
                <span style={{ fontSize: 13, color: "#1e293b" }}>{issue.label}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Any complexity factors?</h3>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>These may increase the number of sessions needed.</p>
        {COMPLEXITY_FACTORS.map((f) => (
          <label key={f.id} htmlFor={`factor-${f.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", cursor: "pointer" }}>
            <input id={`factor-${f.id}`} type="checkbox" checked={factors.has(f.id)} onChange={() => toggleFactor(f.id)} style={{ accentColor: "#f59e0b" }} />
            <span style={{ fontSize: 13, color: "#1e293b" }}>{f.label}</span>
          </label>
        ))}
      </div>

      {issues.size > 0 && (
        <div style={{ padding: 20, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Estimated Cost</h3>
            <button onClick={exportEstimate} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 12 }}>Download</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>Sessions</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{adjustedSessions}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>Total Hours</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{totalHours}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>Total Cost</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{fmt(lowEst)} - {fmt(highEst)}</div>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>Your estimated cost {splitMethod === "equal" ? "(per party)" : ""}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1e40af" }}>{fmt(lowPerParty)} - {fmt(highPerParty)}</div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#166534" }}>
            Tip: Parties who arrive prepared with financial documents and clear priorities typically need fewer sessions. Use the Mediation Readiness and Financial Disclosure tools to prepare.
          </div>
        </div>
      )}
      {issues.size === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Select your issues above to see a cost estimate.</div>
      )}
      <div style={{ padding: 10, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This is a rough estimate for planning purposes. Actual costs depend on mediator rates in your area, party cooperation, case complexity, and preparation level. Many mediators offer free consultations to discuss fees.
      </div>
    </div>
  );
}
