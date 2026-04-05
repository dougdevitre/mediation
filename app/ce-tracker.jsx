import { useState, useEffect } from "react";

const REQUIRED_TOPICS = [
  { id: "dv_dynamics", label: "Domestic abuse dynamics & coercive control", required: true, standard: "2025-V(C)" },
  { id: "dv_parenting", label: "Impact of domestic abuse on parenting/children", required: true, standard: "2025-V(C)" },
  { id: "dv_screening", label: "Domestic abuse screening techniques", required: true, standard: "2025-V(A)" },
  { id: "child_maltreatment", label: "Child maltreatment recognition & response", required: true, standard: "2025-VI(A)" },
  { id: "mandatory_reporting", label: "Mandatory reporting obligations", required: true, standard: "2025-VI(B)" },
  { id: "technology_odr", label: "Technology & ODR competence", required: true, standard: "2025-IX(B)" },
  { id: "data_security", label: "Data security & privacy in mediation", required: true, standard: "2025-IX(C)" },
  { id: "child_dev", label: "Child development", required: false, standard: "2025-X" },
  { id: "cultural", label: "Cultural competence & humility", required: false, standard: "2025-Intro" },
  { id: "high_conflict", label: "High-conflict family dynamics", required: false },
  { id: "substance", label: "Substance use & families", required: false },
  { id: "mental_health", label: "Mental health issues in mediation", required: false },
  { id: "financial", label: "Financial literacy for mediators", required: false },
  { id: "trauma", label: "Trauma-informed practice", required: false },
  { id: "lgbtq", label: "LGBTQ+ family issues", required: false },
  { id: "immigration", label: "Immigration impacts on family law", required: false },
  { id: "ethics", label: "Mediation ethics", required: false },
  { id: "bias", label: "Implicit bias awareness", required: false },
];

export default function CETracker() {
  const [trainings, setTrainings] = useState(() => {
    try { const saved = localStorage.getItem("ce-trainings"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", provider: "", date: "", hours: "", topics: [] });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try { localStorage.setItem("ce-trainings", JSON.stringify(trainings)); } catch {}
  }, [trainings]);

  const addTraining = () => {
    if (!form.title || !form.hours) {
      setFormError("Title and hours are required.");
      return;
    }
    const hours = parseFloat(form.hours);
    if (isNaN(hours) || hours <= 0) {
      setFormError("Hours must be a positive number.");
      return;
    }
    setFormError("");
    setTrainings([...trainings, { ...form, id: Date.now(), hours }]);
    setForm({ title: "", provider: "", date: "", hours: "", topics: [] });
    setShowForm(false);
  };

  const removeTraining = (id) => setTrainings(trainings.filter((t) => t.id !== id));

  const toggleTopic = (topicId) => {
    const topics = form.topics.includes(topicId)
      ? form.topics.filter((t) => t !== topicId)
      : [...form.topics, topicId];
    setForm({ ...form, topics });
  };

  const totalHours = trainings.reduce((sum, t) => sum + t.hours, 0);
  const coveredTopics = new Set(trainings.flatMap((t) => t.topics));
  const requiredTopics = REQUIRED_TOPICS.filter((t) => t.required);
  const coveredRequired = requiredTopics.filter((t) => coveredTopics.has(t.id));
  const missingRequired = requiredTopics.filter((t) => !coveredTopics.has(t.id));

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Continuing Education Tracker</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Track training hours against 2025 AFCC/ABA Model Standards requirements</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{totalHours}</div>
          <div style={{ fontSize: 12, color: "#166534" }}>Total CE Hours</div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: missingRequired.length === 0 ? "#f0fdf4" : "#fef2f2", borderRadius: 8, border: `1px solid ${missingRequired.length === 0 ? "#bbf7d0" : "#fecaca"}` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: missingRequired.length === 0 ? "#16a34a" : "#dc2626" }}>{coveredRequired.length}/{requiredTopics.length}</div>
          <div style={{ fontSize: 12, color: missingRequired.length === 0 ? "#166534" : "#991b1b" }}>Required Topics</div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>{coveredTopics.size}/{REQUIRED_TOPICS.length}</div>
          <div style={{ fontSize: 12, color: "#1e40af" }}>All Topics Covered</div>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", borderRadius: 8, borderLeft: "4px solid #dc2626" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>Missing Required Training</div>
          {missingRequired.map((t) => (
            <div key={t.id} style={{ fontSize: 13, color: "#7f1d1d", padding: "2px 0" }}>• {t.label} <span style={{ color: "#9ca3af" }}>({t.standard})</span></div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Training Log ({trainings.length} entries)</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }}>
          {showForm ? "Cancel" : "+ Add Training"}
        </button>
      </div>

      {showForm && (
        <div style={{ padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Training title *" style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
            <input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Provider" style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
            <input type="number" step="0.5" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Hours *" style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Topics covered:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {REQUIRED_TOPICS.map((t) => (
              <button key={t.id} onClick={() => toggleTopic(t.id)} aria-pressed={form.topics.includes(t.id)} style={{
                padding: "3px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer",
                border: form.topics.includes(t.id) ? "1px solid #2563eb" : "1px solid #cbd5e1",
                background: form.topics.includes(t.id) ? "#dbeafe" : "#fff",
                color: form.topics.includes(t.id) ? "#1e40af" : "#64748b",
                fontWeight: t.required ? 600 : 400,
              }}>
                {t.required ? "★ " : ""}{t.label}
              </button>
            ))}
          </div>
          {formError && <div role="alert" style={{ marginBottom: 8, padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, color: "#991b1b" }}>{formError}</div>}
          <button onClick={addTraining} disabled={!form.title || !form.hours} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: form.title && form.hours ? "#16a34a" : "#94a3b8", color: "#fff", cursor: form.title && form.hours ? "pointer" : "default", fontSize: 13 }}>
            Save Training
          </button>
        </div>
      )}

      {trainings.length === 0 && !showForm && (
        <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No trainings logged yet. Click "+ Add Training" to start tracking.</div>
      )}

      {trainings.map((t) => (
        <div key={t.id} style={{ padding: 12, marginBottom: 8, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{t.provider}{t.date ? ` · ${t.date}` : ""} · {t.hours} hrs</div>
            {t.topics.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                {t.topics.map((topicId) => {
                  const topic = REQUIRED_TOPICS.find((rt) => rt.id === topicId);
                  return topic ? <span key={topicId} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: topic.required ? "#dbeafe" : "#f1f5f9", color: topic.required ? "#1e40af" : "#64748b" }}>{topic.label}</span> : null;
                })}
              </div>
            )}
          </div>
          <button onClick={() => removeTraining(t.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}
