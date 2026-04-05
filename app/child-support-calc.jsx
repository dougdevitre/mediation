import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "mediation-cs-calc";

const STATES = [
  { id: "general", name: "General (Income Shares Model)", model: "income_shares", desc: "Used by ~40 states. Support based on both parents' combined income and parenting time split." },
  { id: "ca", name: "California", model: "income_shares", desc: "Based on CA Family Code 4055. Uses both incomes, tax filing status, and timeshare." },
  { id: "ny", name: "New York", model: "income_shares", desc: "Based on DRL 240(1-b). Combined parental income with statutory percentages." },
  { id: "tx", name: "Texas", model: "percentage", desc: "Percentage of obligor's net income. 20% for 1 child, 25% for 2, 30% for 3, 35% for 4, 40% for 5+." },
  { id: "fl", name: "Florida", model: "income_shares", desc: "Based on F.S. 61.30. Income shares model with adjustments for healthcare and childcare." },
  { id: "mo", name: "Missouri", model: "income_shares", desc: "Based on Form 14. Combined adjusted gross income with presumed support amount." },
];

const TX_PERCENTAGES = { 1: 0.20, 2: 0.25, 3: 0.30, 4: 0.35, 5: 0.40 };

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

function fmt(n) { return "$" + Math.round(n).toLocaleString(); }

export default function ChildSupportCalc() {
  const stored = loadFromStorage();
  const [state, setState] = useState(stored?.state || "general");
  const [incomeA, setIncomeA] = useState(stored?.incomeA || "");
  const [incomeB, setIncomeB] = useState(stored?.incomeB || "");
  const [children, setChildren] = useState(stored?.children || "1");
  const [overnightsA, setOvernightsA] = useState(stored?.overnightsA || "182");
  const [healthcare, setHealthcare] = useState(stored?.healthcare || "0");
  const [childcare, setChildcare] = useState(stored?.childcare || "0");
  const [parentAName, setParentAName] = useState(stored?.parentAName || "Parent A");
  const [parentBName, setParentBName] = useState(stored?.parentBName || "Parent B");

  useEffect(() => {
    saveToStorage({ state, incomeA, incomeB, children, overnightsA, healthcare, childcare, parentAName, parentBName });
  }, [state, incomeA, incomeB, children, overnightsA, healthcare, childcare, parentAName, parentBName]);

  const iA = parseFloat(incomeA) || 0;
  const iB = parseFloat(incomeB) || 0;
  const nChildren = parseInt(children) || 1;
  const oA = parseInt(overnightsA) || 182;
  const oB = 365 - oA;
  const hc = parseFloat(healthcare) || 0;
  const cc = parseFloat(childcare) || 0;

  const stateInfo = STATES.find((s) => s.id === state);

  const { combined, shareA, shareB, timeshareA, timeshareB, basicObligation, adjustedObligation, obligorName, obligeeName, monthlySupport, annualSupport } = useMemo(() => {
    const combined = iA + iB;
    const shareA = combined > 0 ? iA / combined : 0.5;
    const shareB = combined > 0 ? iB / combined : 0.5;
    const timeshareA = oA / 365;
    const timeshareB = oB / 365;

    // Basic income shares calculation
    const basePctMap = { 1: 0.17, 2: 0.25, 3: 0.29, 4: 0.31, 5: 0.34 };
    const basePct = basePctMap[Math.min(nChildren, 5)] || 0.17;
    const basicObligation = combined * basePct;
    const adjustedObligation = basicObligation + hc + cc;

    let obligorName, obligeeName, monthlySupport, annualSupport;

    if (state === "tx") {
      // Texas percentage model
      const pct = TX_PERCENTAGES[Math.min(nChildren, 5)] || 0.20;
      // Obligor is the parent with fewer overnights
      if (oA < oB) {
        obligorName = parentAName;
        obligeeName = parentBName;
        monthlySupport = (iA * pct);
      } else {
        obligorName = parentBName;
        obligeeName = parentAName;
        monthlySupport = (iB * pct);
      }
      annualSupport = monthlySupport * 12;
    } else {
      // Income shares model
      const obligationA = adjustedObligation * shareA;
      const obligationB = adjustedObligation * shareB;
      // Adjust for parenting time
      const adjustmentFactor = Math.abs(timeshareA - 0.5) * 2;
      if (shareA > shareB && timeshareA < 0.5) {
        obligorName = parentAName;
        obligeeName = parentBName;
        monthlySupport = (obligationA - (basicObligation * timeshareA)) * (1 + adjustmentFactor * 0.2);
      } else if (shareB > shareA && timeshareB < 0.5) {
        obligorName = parentBName;
        obligeeName = parentAName;
        monthlySupport = (obligationB - (basicObligation * timeshareB)) * (1 + adjustmentFactor * 0.2);
      } else if (oA < oB) {
        obligorName = parentAName;
        obligeeName = parentBName;
        monthlySupport = Math.abs(obligationA - (basicObligation * timeshareA));
      } else {
        obligorName = parentBName;
        obligeeName = parentAName;
        monthlySupport = Math.abs(obligationB - (basicObligation * timeshareB));
      }
      monthlySupport = Math.max(0, monthlySupport);
      annualSupport = monthlySupport * 12;
    }

    return { combined, shareA, shareB, timeshareA, timeshareB, basicObligation, adjustedObligation, obligorName, obligeeName, monthlySupport, annualSupport };
  }, [state, iA, iB, nChildren, oA, oB, hc, cc, parentAName, parentBName]);

  const exportCalc = () => {
    const lines = [
      "CHILD SUPPORT ESTIMATE", "=".repeat(50),
      `Date: ${new Date().toLocaleDateString()}`, `State: ${stateInfo.name}`, `Model: ${stateInfo.model}`, "",
      "INPUTS:",
      `  ${parentAName} gross monthly income: ${fmt(iA)}`,
      `  ${parentBName} gross monthly income: ${fmt(iB)}`,
      `  Combined monthly income: ${fmt(combined)}`,
      `  Number of children: ${nChildren}`,
      `  ${parentAName} overnights/year: ${oA} (${Math.round(timeshareA * 100)}%)`,
      `  ${parentBName} overnights/year: ${oB} (${Math.round(timeshareB * 100)}%)`,
      `  Monthly healthcare costs: ${fmt(hc)}`,
      `  Monthly childcare costs: ${fmt(cc)}`, "",
      "ESTIMATE:",
      `  Obligor: ${obligorName}`,
      `  Obligee: ${obligeeName}`,
      `  Estimated monthly support: ${fmt(monthlySupport)}`,
      `  Estimated annual support: ${fmt(annualSupport)}`, "",
      "IMPORTANT DISCLAIMERS:",
      "  This is a ROUGH ESTIMATE for discussion purposes only.",
      "  Actual child support is calculated using your state's official",
      "  guidelines worksheet, which accounts for deductions, credits,",
      "  and adjustments not included in this estimator.",
      "  Consult your attorney or use your state's official calculator.",
      "  Courts make the final determination of child support.",
    ];
    downloadFile(lines.join("\n"), `child-support-estimate-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };
  const inputStyle = { width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Child Support Estimator</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Rough estimate based on state guidelines. For discussion purposes — not a legal calculation.</p>

      <div style={cardStyle}>
        <label htmlFor="cs-state" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>State / Model</label>
        <select id="cs-state" value={state} onChange={(e) => setState(e.target.value)} style={{ ...inputStyle, marginBottom: 8 }}>
          {STATES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div style={{ fontSize: 12, color: "#64748b" }}>{stateInfo.desc}</div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#0f172a" }}>Monthly Gross Income</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label htmlFor="cs-nameA" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Parent A Name</label>
            <input id="cs-nameA" value={parentAName} onChange={(e) => setParentAName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="cs-nameB" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Parent B Name</label>
            <input id="cs-nameB" value={parentBName} onChange={(e) => setParentBName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="cs-incA" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>{parentAName} Monthly Income ($)</label>
            <input id="cs-incA" type="number" value={incomeA} onChange={(e) => setIncomeA(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="cs-incB" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>{parentBName} Monthly Income ($)</label>
            <input id="cs-incB" type="number" value={incomeB} onChange={(e) => setIncomeB(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#0f172a" }}>Children & Parenting Time</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label htmlFor="cs-children" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Number of Children</label>
            <select id="cs-children" value={children} onChange={(e) => setChildren(e.target.value)} style={inputStyle}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cs-overnights" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>{parentAName} Overnights/Year</label>
            <input id="cs-overnights" type="number" min="0" max="365" value={overnightsA} onChange={(e) => setOvernightsA(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="cs-hc" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Monthly Healthcare ($)</label>
            <input id="cs-hc" type="number" value={healthcare} onChange={(e) => setHealthcare(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="cs-cc" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Monthly Childcare ($)</label>
            <input id="cs-cc" type="number" value={childcare} onChange={(e) => setChildcare(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          Time split: {parentAName} {Math.round(timeshareA * 100)}% ({oA} nights) · {parentBName} {Math.round(timeshareB * 100)}% ({oB} nights)
        </div>
      </div>

      {/* Results */}
      {combined > 0 && (
        <div style={{ padding: 20, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Estimated Child Support</h3>
            <button onClick={exportCalc} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 12 }}>Download</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ textAlign: "center", padding: 14, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>{fmt(monthlySupport)}</div>
              <div style={{ fontSize: 12, color: "#1e40af" }}>Per Month</div>
            </div>
            <div style={{ textAlign: "center", padding: 14, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#475569" }}>{fmt(annualSupport)}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Per Year</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#334155", textAlign: "center" }}>
            <strong>{obligorName}</strong> pays <strong>{obligeeName}</strong>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", textAlign: "center" }}>
            Income share: {parentAName} {Math.round(shareA * 100)}% · {parentBName} {Math.round(shareB * 100)}%
          </div>
        </div>
      )}

      <div style={{ padding: 10, background: "#fef2f2", borderRadius: 8, fontSize: 12, color: "#991b1b", borderLeft: "4px solid #dc2626", marginBottom: 8 }}>
        <strong>Important:</strong> This is a rough estimate for mediation discussion, NOT a legal calculation. Actual support uses your state's official guidelines worksheet with deductions, credits, and adjustments not included here. Always use the official state calculator and consult an attorney.
      </div>
      <div style={{ padding: 10, background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#1e40af" }}>
        Courts make the final determination. Deviations from guidelines require court approval and a finding that the deviation serves the children's best interests.
      </div>
    </div>
  );
}
