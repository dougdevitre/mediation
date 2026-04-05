import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-post-compliance";

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

export default function ComplianceTracker() {
  const stored = loadFromStorage();
  const [items, setItems] = useState(stored?.items || []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "schedule", dueDate: "", recurring: "none", notes: "" });

  useEffect(() => { saveToStorage({ items }); }, [items]);

  const CATEGORIES = [
    { id: "schedule", label: "Parenting Schedule", color: "#2563eb" },
    { id: "financial", label: "Financial / Support", color: "#16a34a" },
    { id: "communication", label: "Communication", color: "#7c3aed" },
    { id: "documents", label: "Documents / Records", color: "#ca8a04" },
    { id: "other", label: "Other", color: "#64748b" },
  ];

  const addItem = () => {
    if (!form.title.trim()) return;
    setItems([...items, { ...form, id: Date.now(), status: "pending", completions: [] }]);
    setForm({ title: "", category: "schedule", dueDate: "", recurring: "none", notes: "" });
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      const newStatus = item.status === "pending" ? "done" : "pending";
      const completions = newStatus === "done" ? [...(item.completions || []), new Date().toISOString().slice(0, 10)] : item.completions;
      return { ...item, status: newStatus, completions };
    }));
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const resetAll = () => setItems(items.map((i) => ({ ...i, status: "pending" })));
  const clearAll = () => { setItems([]); setShowForm(false); };

  const pending = items.filter((i) => i.status === "pending");
  const done = items.filter((i) => i.status === "done");
  const overdue = pending.filter((i) => i.dueDate && new Date(i.dueDate) < new Date());
  const compliance = items.length > 0 ? Math.round((done.length / items.length) * 100) : 0;

  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[4];

  const exportReport = () => {
    const lines = [
      "POST-MEDIATION COMPLIANCE REPORT", "=".repeat(40),
      `Date: ${new Date().toLocaleDateString()}`,
      `Total items: ${items.length}`, `Completed: ${done.length}`, `Pending: ${pending.length}`, `Overdue: ${overdue.length}`,
      `Compliance rate: ${compliance}%`, "",
    ];
    if (overdue.length > 0) {
      lines.push("OVERDUE:");
      overdue.forEach((i) => lines.push(`  [!] ${i.title} (due: ${i.dueDate})`));
      lines.push("");
    }
    lines.push("ALL ITEMS:");
    items.forEach((i) => {
      const status = i.status === "done" ? "[x]" : "[ ]";
      lines.push(`  ${status} ${i.title} (${getCat(i.category).label})${i.dueDate ? ` — due: ${i.dueDate}` : ""}`);
    });
    downloadFile(lines.join("\n"), `compliance-report-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Agreement Compliance Tracker</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Track whether mediation agreement terms are being followed by both parties.</p>

      {items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          <div style={{ textAlign: "center", padding: 10, background: compliance >= 80 ? "#f0fdf4" : compliance >= 50 ? "#fefce8" : "#fef2f2", borderRadius: 8, border: "1px solid " + (compliance >= 80 ? "#bbf7d0" : compliance >= 50 ? "#fde68a" : "#fecaca") }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: compliance >= 80 ? "#16a34a" : compliance >= 50 ? "#ca8a04" : "#dc2626" }}>{compliance}%</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Compliance</div>
          </div>
          <div style={{ textAlign: "center", padding: 10, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{done.length}</div>
            <div style={{ fontSize: 11, color: "#166534" }}>Done</div>
          </div>
          <div style={{ textAlign: "center", padding: 10, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1d4ed8" }}>{pending.length}</div>
            <div style={{ fontSize: 11, color: "#1e40af" }}>Pending</div>
          </div>
          <div style={{ textAlign: "center", padding: 10, background: overdue.length > 0 ? "#fef2f2" : "#f8fafc", borderRadius: 8, border: "1px solid " + (overdue.length > 0 ? "#fecaca" : "#e2e8f0") }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: overdue.length > 0 ? "#dc2626" : "#94a3b8" }}>{overdue.length}</div>
            <div style={{ fontSize: 11, color: overdue.length > 0 ? "#991b1b" : "#64748b" }}>Overdue</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Agreement Items ({items.length})</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {items.length > 0 && (
            <>
              <button onClick={exportReport} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#475569" }}>Download</button>
              <button onClick={resetAll} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#475569" }}>Reset Period</button>
              <button onClick={clearAll} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>Clear All</button>
            </>
          )}
          <button onClick={() => setShowForm(!showForm)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 12 }}>
            {showForm ? "Cancel" : "+ Add Item"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="item-title" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Agreement Term *</label>
            <input id="item-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder='e.g., "Pay child support by the 1st"' style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label htmlFor="item-cat" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Category</label>
              <select id="item-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="item-due" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Due Date</label>
              <input id="item-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label htmlFor="item-recur" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Recurring</label>
              <select id="item-recur" value={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.value })} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}>
                <option value="none">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>
          <button onClick={addItem} disabled={!form.title.trim()} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: form.title.trim() ? "#16a34a" : "#94a3b8", color: "#fff", cursor: form.title.trim() ? "pointer" : "default", fontSize: 13 }}>Add Item</button>
        </div>
      )}

      {overdue.length > 0 && (
        <div style={{ padding: 10, marginBottom: 12, background: "#fef2f2", borderRadius: 8, borderLeft: "4px solid #dc2626" }} role="alert">
          <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>{overdue.length} overdue item{overdue.length > 1 ? "s" : ""}</div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No agreement items yet. Click "+ Add Item" to start tracking compliance.</div>
      )}

      {items.map((item) => {
        const cat = getCat(item.category);
        const isOverdue = item.status === "pending" && item.dueDate && new Date(item.dueDate) < new Date();
        return (
          <div key={item.id} style={{ padding: 10, marginBottom: 6, background: item.status === "done" ? "#f0fdf4" : isOverdue ? "#fef2f2" : "#fff", borderRadius: 8, border: "1px solid " + (item.status === "done" ? "#bbf7d0" : isOverdue ? "#fecaca" : "#e2e8f0"), display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={item.status === "done"} onChange={() => toggleStatus(item.id)} style={{ accentColor: "#16a34a", width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} aria-label={`Mark "${item.title}" as ${item.status === "done" ? "pending" : "done"}`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: item.status === "done" ? "#166534" : "#1e293b", textDecoration: item.status === "done" ? "line-through" : "none" }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: cat.color }}>{cat.label}</span>
                {item.dueDate && <span>{isOverdue ? "Overdue: " : "Due: "}{item.dueDate}</span>}
                {item.recurring !== "none" && <span>Recurring: {item.recurring}</span>}
              </div>
            </div>
            <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: "2px 6px", flexShrink: 0 }} aria-label={`Remove ${item.title}`}>x</button>
          </div>
        );
      })}

      <div style={{ marginTop: 16, padding: 10, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This tool helps you track agreement compliance for your own awareness. It is not a legal enforcement mechanism. If agreement terms are not being followed, consult your attorney or return to mediation.
      </div>
    </div>
  );
}
