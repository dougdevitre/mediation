import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-case-analytics";

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

const CASE_TYPES = ["Divorce", "Custody/Parenting", "Modification", "Paternity", "Property Only", "Other"];
const OUTCOMES = ["Full Agreement", "Partial Agreement", "No Agreement", "Terminated by Mediator", "Terminated by Party", "Suspended"];
const REFERRAL_SOURCES = ["Court-ordered", "Attorney referral", "Self-referred", "Agency", "Other"];

export default function CaseAnalytics() {
  const stored = loadFromStorage();
  const [cases, setCases] = useState(stored?.cases || []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", type: "Divorce", referral: "Self-referred", sessions: "", hours: "", outcome: "Full Agreement", dvScreened: true, children: "", dateOpened: "", dateClosed: "", fees: "", notes: "" });
  const [editId, setEditId] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => { saveToStorage({ cases }); }, [cases]);

  const addCase = () => {
    if (!form.label.trim()) return;
    const entry = { ...form, id: editId || Date.now(), sessions: parseInt(form.sessions) || 0, hours: parseFloat(form.hours) || 0, children: parseInt(form.children) || 0, fees: parseFloat(form.fees) || 0 };
    if (editId) {
      setCases(cases.map((c) => (c.id === editId ? entry : c)));
      setEditId(null);
    } else {
      setCases([entry, ...cases]);
    }
    setForm({ label: "", type: "Divorce", referral: "Self-referred", sessions: "", hours: "", outcome: "Full Agreement", dvScreened: true, children: "", dateOpened: "", dateClosed: "", fees: "", notes: "" });
    setShowForm(false);
  };

  const editCase = (c) => { setForm({ ...c, sessions: String(c.sessions), hours: String(c.hours), children: String(c.children), fees: String(c.fees) }); setEditId(c.id); setShowForm(true); };
  const removeCase = (id) => setCases(cases.filter((c) => c.id !== id));
  const clearAll = () => { setCases([]); setShowForm(false); };

  // Filtering
  const now = new Date();
  const filtered = cases.filter((c) => {
    if (dateFilter === "all") return true;
    if (!c.dateClosed) return dateFilter === "active";
    const closed = new Date(c.dateClosed);
    if (dateFilter === "ytd") return closed.getFullYear() === now.getFullYear();
    if (dateFilter === "12m") return (now - closed) < 365 * 24 * 60 * 60 * 1000;
    if (dateFilter === "active") return !c.dateClosed;
    return true;
  });

  // Analytics
  const totalCases = filtered.length;
  const totalSessions = filtered.reduce((s, c) => s + c.sessions, 0);
  const totalHours = filtered.reduce((s, c) => s + c.hours, 0);
  const totalFees = filtered.reduce((s, c) => s + c.fees, 0);
  const avgSessions = totalCases > 0 ? (totalSessions / totalCases).toFixed(1) : "0";
  const avgHours = totalCases > 0 ? (totalHours / totalCases).toFixed(1) : "0";
  const dvScreenedPct = totalCases > 0 ? Math.round((filtered.filter((c) => c.dvScreened).length / totalCases) * 100) : 0;

  const outcomeBreakdown = OUTCOMES.map((o) => ({ label: o, count: filtered.filter((c) => c.outcome === o).length })).filter((o) => o.count > 0);
  const typeBreakdown = CASE_TYPES.map((t) => ({ label: t, count: filtered.filter((c) => c.type === t).length })).filter((t) => t.count > 0);
  const referralBreakdown = REFERRAL_SOURCES.map((r) => ({ label: r, count: filtered.filter((c) => c.referral === r).length })).filter((r) => r.count > 0);

  const agreementRate = totalCases > 0 ? Math.round((filtered.filter((c) => c.outcome === "Full Agreement" || c.outcome === "Partial Agreement").length / totalCases) * 100) : 0;
  const fullAgreementRate = totalCases > 0 ? Math.round((filtered.filter((c) => c.outcome === "Full Agreement").length / totalCases) * 100) : 0;

  const childrenServed = filtered.reduce((s, c) => s + c.children, 0);

  const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const exportAnalytics = () => {
    const lines = [
      "MEDIATION PRACTICE ANALYTICS", "=".repeat(50),
      `Generated: ${new Date().toLocaleDateString()}`, `Period: ${dateFilter === "all" ? "All time" : dateFilter}`, "",
      "OVERVIEW:", `  Total cases: ${totalCases}`, `  Total sessions: ${totalSessions}`, `  Total hours: ${totalHours.toFixed(1)}`,
      `  Total fees collected: ${fmt(totalFees)}`, `  Avg sessions/case: ${avgSessions}`, `  Avg hours/case: ${avgHours}`,
      `  Children served: ${childrenServed}`, `  DV screening rate: ${dvScreenedPct}%`, "",
      "OUTCOMES:", `  Agreement rate: ${agreementRate}% (full + partial)`, `  Full agreement rate: ${fullAgreementRate}%`,
    ];
    outcomeBreakdown.forEach((o) => lines.push(`    ${o.label}: ${o.count} (${totalCases > 0 ? Math.round((o.count / totalCases) * 100) : 0}%)`));
    lines.push("", "CASE TYPES:");
    typeBreakdown.forEach((t) => lines.push(`    ${t.label}: ${t.count}`));
    lines.push("", "REFERRAL SOURCES:");
    referralBreakdown.forEach((r) => lines.push(`    ${r.label}: ${r.count}`));
    lines.push("", "INDIVIDUAL CASES:");
    filtered.forEach((c) => lines.push(`  ${c.label} | ${c.type} | ${c.sessions} sessions | ${c.outcome} | ${c.dateClosed || "Active"}`));
    downloadFile(lines.join("\n"), `practice-analytics-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };
  const inputStyle = { width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Practice Analytics</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Track case outcomes, workload, and practice metrics over time.</p>

      {/* Filter & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[["all", "All Time"], ["ytd", "This Year"], ["12m", "Last 12 Mo"], ["active", "Active"]].map(([val, label]) => (
            <button key={val} onClick={() => setDateFilter(val)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: dateFilter === val ? "2px solid #2563eb" : "1px solid #e2e8f0",
              background: dateFilter === val ? "#dbeafe" : "#fff",
              color: dateFilter === val ? "#1e40af" : "#64748b",
              fontWeight: dateFilter === val ? 600 : 400,
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {cases.length > 0 && <button onClick={exportAnalytics} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#475569" }}>Download Report</button>}
          <button onClick={() => { setShowForm(!showForm); setEditId(null); }} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 12 }}>
            {showForm ? "Cancel" : "+ Log Case"}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label htmlFor="ca-label" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Case Label *</label>
              <input id="ca-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g., Smith v. Jones" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="ca-type" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Case Type</label>
              <select id="ca-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>{CASE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div>
              <label htmlFor="ca-referral" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Referral Source</label>
              <select id="ca-referral" value={form.referral} onChange={(e) => setForm({ ...form, referral: e.target.value })} style={inputStyle}>{REFERRAL_SOURCES.map((r) => <option key={r}>{r}</option>)}</select>
            </div>
            <div>
              <label htmlFor="ca-outcome" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Outcome</label>
              <select id="ca-outcome" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} style={inputStyle}>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}</select>
            </div>
            <div>
              <label htmlFor="ca-sessions" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Sessions</label>
              <input id="ca-sessions" type="number" value={form.sessions} onChange={(e) => setForm({ ...form, sessions: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="ca-hours" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Total Hours</label>
              <input id="ca-hours" type="number" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="ca-children" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Children</label>
              <input id="ca-children" type="number" value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="ca-fees" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Fees Collected ($)</label>
              <input id="ca-fees" type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="ca-opened" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Date Opened</label>
              <input id="ca-opened" type="date" value={form.dateOpened} onChange={(e) => setForm({ ...form, dateOpened: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="ca-closed" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Date Closed</label>
              <input id="ca-closed" type="date" value={form.dateClosed} onChange={(e) => setForm({ ...form, dateClosed: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer", fontSize: 13 }}>
            <input type="checkbox" checked={form.dvScreened} onChange={(e) => setForm({ ...form, dvScreened: e.target.checked })} style={{ accentColor: "#2563eb" }} />
            DV screening completed
          </label>
          <button onClick={addCase} disabled={!form.label.trim()} style={{ marginTop: 8, padding: "8px 20px", borderRadius: 6, border: "none", background: form.label.trim() ? "#16a34a" : "#94a3b8", color: "#fff", cursor: form.label.trim() ? "pointer" : "default", fontSize: 13 }}>
            {editId ? "Update Case" : "Log Case"}
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {totalCases > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
            <div style={{ textAlign: "center", padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{agreementRate}%</div>
              <div style={{ fontSize: 11, color: "#166534" }}>Agreement Rate</div>
            </div>
            <div style={{ textAlign: "center", padding: 12, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1d4ed8" }}>{totalCases}</div>
              <div style={{ fontSize: 11, color: "#1e40af" }}>Cases</div>
            </div>
            <div style={{ textAlign: "center", padding: 12, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ca8a04" }}>{avgSessions}</div>
              <div style={{ fontSize: 11, color: "#854d0e" }}>Avg Sessions</div>
            </div>
            <div style={{ textAlign: "center", padding: 12, background: "#faf5ff", borderRadius: 8, border: "1px solid #d8b4fe" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed" }}>{fmt(totalFees)}</div>
              <div style={{ fontSize: 11, color: "#5b21b6" }}>Revenue</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ ...cardStyle, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Outcomes</div>
              {outcomeBreakdown.map((o) => (
                <div key={o.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                  <span style={{ color: "#334155" }}>{o.label}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{o.count}</span>
                </div>
              ))}
            </div>
            <div style={{ ...cardStyle, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Case Types</div>
              {typeBreakdown.map((t) => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                  <span style={{ color: "#334155" }}>{t.label}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{t.count}</span>
                </div>
              ))}
            </div>
            <div style={{ ...cardStyle, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Referral Sources</div>
              {referralBreakdown.map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                  <span style={{ color: "#334155" }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ padding: 10, background: dvScreenedPct === 100 ? "#f0fdf4" : "#fef2f2", borderRadius: 8, border: "1px solid " + (dvScreenedPct === 100 ? "#bbf7d0" : "#fecaca"), textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: dvScreenedPct === 100 ? "#16a34a" : "#dc2626" }}>{dvScreenedPct}%</div>
              <div style={{ fontSize: 11 }}>DV Screening Rate</div>
            </div>
            <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{childrenServed}</div>
              <div style={{ fontSize: 11 }}>Children Served</div>
            </div>
            <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{totalHours.toFixed(1)}</div>
              <div style={{ fontSize: 11 }}>Total Hours</div>
            </div>
          </div>
        </>
      )}

      {/* Case List */}
      <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Case Log ({filtered.length})</h3>
      {filtered.length === 0 && !showForm && (
        <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No cases logged yet. Click "+ Log Case" to start tracking your practice metrics.</div>
      )}
      {filtered.map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 4, background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{c.label}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{c.type} · {c.sessions} sessions · {c.outcome} · {c.dateClosed || "Active"}</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => editCase(c)} style={{ padding: "3px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 11, color: "#475569" }}>Edit</button>
            <button onClick={() => removeCase(c.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }} aria-label={`Remove ${c.label}`}>x</button>
          </div>
        </div>
      ))}

      {cases.length > 0 && (
        <button onClick={clearAll} style={{ marginTop: 12, padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>Clear All Cases</button>
      )}
    </div>
  );
}
