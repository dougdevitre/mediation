import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-conflict-check";
const ROLES = [
  { id: "party_a", label: "Party A" },
  { id: "party_b", label: "Party B" },
  { id: "attorney", label: "Attorney" },
  { id: "witness", label: "Witness" },
  { id: "other", label: "Other" },
];

function load() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { clients: [], history: [] };
  } catch { return { clients: [], history: [] }; }
}
function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function download(content, filename) {
  const b = new Blob([content], { type: "text/plain;charset=utf-8" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a"); a.href = u; a.download = filename; a.click();
  URL.revokeObjectURL(u);
}
function roleLabel(id) { return ROLES.find(r => r.id === id)?.label || id; }
function fuzzyMatch(query, target) {
  if (!query || !target) return null;
  const q = query.toLowerCase().trim(), t = target.toLowerCase().trim();
  if (!q) return null;
  if (t === q) return "exact";
  if (t.includes(q) || q.includes(t)) return "partial";
  const qWords = q.split(/\s+/), tWords = t.split(/\s+/);
  if (qWords.some(w => w.length > 2 && tWords.some(tw => tw.includes(w)))) return "fuzzy";
  return null;
}

const wrap = { fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 24, color: "#1e293b" };
const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 };
const btnPrimary = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
const btnSecondary = { padding: "6px 12px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" };
const btnDanger = { padding: "4px 10px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const tabBtn = (active) => ({ padding: "8px 16px", background: active ? "#2563eb" : "#f1f5f9", color: active ? "#fff" : "#334155", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 600 : 400 });

export default function ConflictCheck() {
  const stored = load();
  const [clients, setClients] = useState(stored.clients || []);
  const [history, setHistory] = useState(stored.history || []);
  const [tab, setTab] = useState("check");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", aliases: "", caseNumber: "", caseType: "", date: "", role: "party_a", status: "active" });
  const [editId, setEditId] = useState(null);
  const [checkForm, setCheckForm] = useState({ partyA: "", partyB: "", attorneyA: "", attorneyB: "", related: "" });
  const [results, setResults] = useState(null);

  useEffect(() => { save({ clients, history }); }, [clients, history]);

  const resetForm = () => { setForm({ name: "", aliases: "", caseNumber: "", caseType: "", date: "", role: "party_a", status: "active" }); setEditId(null); };
  const handleSaveClient = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setClients(clients.map(c => c.id === editId ? { ...c, ...form } : c));
      setEditId(null);
    } else {
      setClients([...clients, { ...form, id: Date.now().toString() }]);
    }
    resetForm();
  };
  const handleEdit = (c) => { setForm({ name: c.name, aliases: c.aliases, caseNumber: c.caseNumber, caseType: c.caseType, date: c.date, role: c.role, status: c.status }); setEditId(c.id); setTab("database"); };
  const handleDelete = (id) => setClients(clients.filter(c => c.id !== id));

  const runCheck = () => {
    const names = [
      { name: checkForm.partyA, label: "Party A" },
      { name: checkForm.partyB, label: "Party B" },
      { name: checkForm.attorneyA, label: "Attorney (Party A)" },
      { name: checkForm.attorneyB, label: "Attorney (Party B)" },
      ...checkForm.related.split(",").map(n => n.trim()).filter(Boolean).map(n => ({ name: n, label: "Related party" })),
    ].filter(n => n.name.trim());
    const matches = [];
    for (const entry of names) {
      for (const client of clients) {
        const allNames = [client.name, ...client.aliases.split(",").map(a => a.trim())].filter(Boolean);
        for (const cn of allNames) {
          const m = fuzzyMatch(entry.name, cn);
          if (m) {
            let conflictType = "Related conflict";
            if (["party_a", "party_b"].includes(client.role) && ["Party A", "Party B"].includes(entry.label)) conflictType = "Direct conflict";
            if (client.role === "attorney") conflictType = "Attorney conflict";
            matches.push({ queryName: entry.name, queryRole: entry.label, matchedName: cn, matchType: m, conflictType, client });
          }
        }
      }
    }
    const checkResult = { id: Date.now().toString(), date: new Date().toISOString(), query: { ...checkForm }, matchCount: matches.length, matches };
    setResults(checkResult);
    setHistory([checkResult, ...history]);
  };

  const downloadReport = (result) => {
    const r = result || results;
    if (!r) return;
    const lines = [`CONFLICT CHECK REPORT`, `Date: ${new Date(r.date).toLocaleString()}`, ``, `PARTIES CHECKED:`, `  Party A: ${r.query.partyA}`, `  Party B: ${r.query.partyB}`];
    if (r.query.attorneyA) lines.push(`  Attorney A: ${r.query.attorneyA}`);
    if (r.query.attorneyB) lines.push(`  Attorney B: ${r.query.attorneyB}`);
    if (r.query.related) lines.push(`  Related: ${r.query.related}`);
    lines.push(``, `RESULT: ${r.matchCount === 0 ? "NO CONFLICTS FOUND" : `${r.matchCount} POTENTIAL CONFLICT(S) DETECTED`}`, ``);
    if (r.matches.length > 0) {
      lines.push(`DETAILS:`);
      r.matches.forEach((m, i) => { lines.push(`  ${i + 1}. "${m.queryName}" (${m.queryRole}) matched "${m.matchedName}" — ${m.conflictType} (${m.matchType} match)`, `     Case: ${m.client.caseNumber || "N/A"} | Type: ${m.client.caseType || "N/A"} | Role: ${roleLabel(m.client.role)} | Status: ${m.client.status}`); });
    }
    download(lines.join("\n"), `conflict-check-${new Date(r.date).toISOString().slice(0, 10)}.txt`);
  };

  const filtered = clients.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.aliases.toLowerCase().includes(s) || c.caseNumber.toLowerCase().includes(s) || c.caseType.toLowerCase().includes(s);
  });

  return (
    <div style={wrap}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#0f172a" }}>Conflict Check</h2>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#64748b" }}>Track past clients and detect conflicts of interest for new cases.</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["check", "database", "history"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>{t === "check" ? "Conflict Check" : t === "database" ? "Client Database" : "History"}</button>
        ))}
      </div>

      {tab === "check" && (
        <div style={card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>New Case Conflict Check</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={labelStyle}>Party A Name *</label><input value={checkForm.partyA} onChange={e => setCheckForm({ ...checkForm, partyA: e.target.value })} style={inputStyle} placeholder="Full name" /></div>
            <div><label style={labelStyle}>Party B Name *</label><input value={checkForm.partyB} onChange={e => setCheckForm({ ...checkForm, partyB: e.target.value })} style={inputStyle} placeholder="Full name" /></div>
            <div><label style={labelStyle}>Attorney (Party A)</label><input value={checkForm.attorneyA} onChange={e => setCheckForm({ ...checkForm, attorneyA: e.target.value })} style={inputStyle} placeholder="Optional" /></div>
            <div><label style={labelStyle}>Attorney (Party B)</label><input value={checkForm.attorneyB} onChange={e => setCheckForm({ ...checkForm, attorneyB: e.target.value })} style={inputStyle} placeholder="Optional" /></div>
          </div>
          <div style={{ marginTop: 10 }}><label style={labelStyle}>Related Parties (comma-separated)</label><input value={checkForm.related} onChange={e => setCheckForm({ ...checkForm, related: e.target.value })} style={inputStyle} placeholder="e.g. John Doe, Jane Smith" /></div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button onClick={runCheck} disabled={!checkForm.partyA.trim() || !checkForm.partyB.trim()} style={{ ...btnPrimary, opacity: (!checkForm.partyA.trim() || !checkForm.partyB.trim()) ? 0.5 : 1 }}>Run Conflict Check</button>
            <button onClick={() => { setCheckForm({ partyA: "", partyB: "", attorneyA: "", attorneyB: "", related: "" }); setResults(null); }} style={btnSecondary}>Clear</button>
          </div>

          {results && (
            <div style={{ marginTop: 16 }}>
              {results.matchCount === 0 && (
                <div style={{ padding: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, color: "#166534", fontWeight: 600 }}>No conflicts found. This case appears clear.</div>
              )}
              {results.matches.filter(m => m.matchType === "exact" || m.matchType === "partial").length > 0 && (
                <div style={{ padding: 16, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>Potential conflict detected</div>
                  {results.matches.filter(m => m.matchType === "exact" || m.matchType === "partial").map((m, i) => (
                    <div key={i} style={{ padding: 8, background: "#fff", borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                      <div><strong>{m.conflictType}:</strong> "{m.queryName}" ({m.queryRole}) matched "{m.matchedName}" ({m.matchType})</div>
                      <div style={{ color: "#64748b", marginTop: 2 }}>Case: {m.client.caseNumber || "N/A"} | {m.client.caseType || "N/A"} | {roleLabel(m.client.role)} | {m.client.status}</div>
                    </div>
                  ))}
                </div>
              )}
              {results.matches.filter(m => m.matchType === "fuzzy").length > 0 && (
                <div style={{ padding: 16, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: "#b45309", marginBottom: 8 }}>Possible match — review needed</div>
                  {results.matches.filter(m => m.matchType === "fuzzy").map((m, i) => (
                    <div key={i} style={{ padding: 8, background: "#fff", borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                      <div><strong>{m.conflictType}:</strong> "{m.queryName}" ({m.queryRole}) ~ "{m.matchedName}" (fuzzy)</div>
                      <div style={{ color: "#64748b", marginTop: 2 }}>Case: {m.client.caseNumber || "N/A"} | {m.client.caseType || "N/A"} | {roleLabel(m.client.role)} | {m.client.status}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => downloadReport()} style={{ ...btnSecondary, marginTop: 8 }}>Document this check</button>
            </div>
          )}
        </div>
      )}

      {tab === "database" && (
        <div style={card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>{editId ? "Edit Client" : "Add Client"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={labelStyle}>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Full name" /></div>
            <div><label style={labelStyle}>Aliases / Maiden Names</label><input value={form.aliases} onChange={e => setForm({ ...form, aliases: e.target.value })} style={inputStyle} placeholder="Comma-separated" /></div>
            <div><label style={labelStyle}>Case Number</label><input value={form.caseNumber} onChange={e => setForm({ ...form, caseNumber: e.target.value })} style={inputStyle} placeholder="e.g. 2026-CV-001" /></div>
            <div><label style={labelStyle}>Case Type</label><input value={form.caseType} onChange={e => setForm({ ...form, caseType: e.target.value })} style={inputStyle} placeholder="e.g. Divorce, Commercial" /></div>
            <div><label style={labelStyle}>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>{ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
            <div><label style={labelStyle}>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}><option value="active">Active</option><option value="closed">Closed</option></select></div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={handleSaveClient} disabled={!form.name.trim()} style={{ ...btnPrimary, opacity: !form.name.trim() ? 0.5 : 1 }}>{editId ? "Update" : "Add Client"}</button>
            {editId && <button onClick={resetForm} style={btnSecondary}>Cancel</button>}
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: "#0f172a" }}>Client Database ({clients.length})</h4>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ ...inputStyle, width: 200 }} />
            </div>
            {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No clients found.</div>}
            {filtered.map(c => (
              <div key={c.id} style={{ padding: 10, marginBottom: 6, background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{c.name}{c.aliases ? ` (${c.aliases})` : ""}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{c.caseNumber || "No case #"} · {c.caseType || "N/A"} · {roleLabel(c.role)} · <span style={{ color: c.status === "active" ? "#16a34a" : "#94a3b8" }}>{c.status}</span>{c.date ? ` · ${c.date}` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => handleEdit(c)} style={btnSecondary}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} style={btnDanger}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div style={card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>Check History</h3>
          {history.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No conflict checks performed yet.</div>}
          {history.map(h => (
            <div key={h.id} style={{ padding: 12, marginBottom: 8, background: "#f8fafc", borderRadius: 6, border: `1px solid ${h.matchCount === 0 ? "#86efac" : "#fca5a5"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{h.query.partyA} vs. {h.query.partyB}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(h.date).toLocaleString()} · {h.matchCount === 0 ? <span style={{ color: "#16a34a" }}>Clear</span> : <span style={{ color: "#dc2626" }}>{h.matchCount} conflict(s)</span>}</div>
                </div>
                <button onClick={() => downloadReport(h)} style={btnSecondary}>Download</button>
              </div>
            </div>
          ))}
          {history.length > 0 && <button onClick={() => setHistory([])} style={{ ...btnDanger, marginTop: 8 }}>Clear History</button>}
        </div>
      )}
    </div>
  );
}
