import { useState, useEffect, useId } from "react";

const STORAGE_KEY = "mediation-ce-tracker";

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

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(trainings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
  } catch {
    // storage full or unavailable
  }
}

function exportTrainingLog(trainings, totalHours, coveredTopics, missingRequired) {
  const lines = [
    "CONTINUING EDUCATION TRAINING LOG",
    "=".repeat(50),
    `Generated: ${new Date().toLocaleDateString()}`,
    `Total CE Hours: ${totalHours}`,
    `Topics Covered: ${coveredTopics.size}/${REQUIRED_TOPICS.length}`,
    `Required Topics Missing: ${missingRequired.length}`,
    "",
  ];

  if (missingRequired.length > 0) {
    lines.push("MISSING REQUIRED TRAINING:");
    missingRequired.forEach((t) => lines.push(`  - ${t.label} (${t.standard})`));
    lines.push("");
  }

  lines.push("TRAINING ENTRIES:");
  lines.push("-".repeat(50));
  trainings.forEach((t, i) => {
    lines.push(`${i + 1}. ${t.title}`);
    if (t.provider) lines.push(`   Provider: ${t.provider}`);
    if (t.date) lines.push(`   Date: ${t.date}`);
    lines.push(`   Hours: ${t.hours}`);
    if (t.topics.length > 0) {
      const topicLabels = t.topics
        .map((id) => REQUIRED_TOPICS.find((rt) => rt.id === id)?.label)
        .filter(Boolean);
      lines.push(`   Topics: ${topicLabels.join(", ")}`);
    }
    lines.push("");
  });

  lines.push("Based on 2025 AFCC/ABA Model Standards for Family and Divorce Mediation.");
  return lines.join("\n");
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

export default function CETracker() {
  const [trainings, setTrainings] = useState(() => loadFromStorage());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", provider: "", date: "", hours: "", topics: [] });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const formId = useId();

  useEffect(() => {
    saveToStorage(trainings);
  }, [trainings]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    const hours = parseFloat(form.hours);
    if (!form.hours || isNaN(hours) || hours <= 0) {
      errs.hours = "Enter valid hours (greater than 0)";
    } else if (hours > 40) {
      errs.hours = "Hours per training should not exceed 40";
    }
    if (form.date) {
      const d = new Date(form.date);
      if (d > new Date()) errs.date = "Date cannot be in the future";
    }
    if (form.topics.length === 0) errs.topics = "Select at least one topic";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addTraining = () => {
    if (!validate()) return;
    if (editingId !== null) {
      setTrainings(trainings.map((t) => (t.id === editingId ? { ...form, id: editingId, hours: parseFloat(form.hours) } : t)));
      setEditingId(null);
    } else {
      setTrainings([...trainings, { ...form, id: Date.now(), hours: parseFloat(form.hours) }]);
    }
    setForm({ title: "", provider: "", date: "", hours: "", topics: [] });
    setErrors({});
    setShowForm(false);
  };

  const editTraining = (t) => {
    setForm({ title: t.title, provider: t.provider, date: t.date, hours: String(t.hours), topics: [...t.topics] });
    setEditingId(t.id);
    setErrors({});
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", provider: "", date: "", hours: "", topics: [] });
    setErrors({});
  };

  const removeTraining = (id) => setTrainings(trainings.filter((t) => t.id !== id));

  const clearAll = () => {
    setTrainings([]);
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", provider: "", date: "", hours: "", topics: [] });
    setErrors({});
  };

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

  const handleExport = () => {
    const content = exportTrainingLog(trainings, totalHours, coveredTopics, missingRequired);
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(content, `ce-training-log-${date}.txt`);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Continuing Education Tracker</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Track training hours against 2025 AFCC/ABA Model Standards requirements</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }} role="status" aria-label={`${totalHours} total CE hours`}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{totalHours}</div>
          <div style={{ fontSize: 12, color: "#166534" }}>Total CE Hours</div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: missingRequired.length === 0 ? "#f0fdf4" : "#fef2f2", borderRadius: 8, border: `1px solid ${missingRequired.length === 0 ? "#bbf7d0" : "#fecaca"}` }} role="status" aria-label={`${coveredRequired.length} of ${requiredTopics.length} required topics covered`}>
          <div style={{ fontSize: 28, fontWeight: 700, color: missingRequired.length === 0 ? "#16a34a" : "#dc2626" }}>{coveredRequired.length}/{requiredTopics.length}</div>
          <div style={{ fontSize: 12, color: missingRequired.length === 0 ? "#166534" : "#991b1b" }}>Required Topics {missingRequired.length === 0 ? "(Complete)" : "(Incomplete)"}</div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }} role="status" aria-label={`${coveredTopics.size} of ${REQUIRED_TOPICS.length} total topics covered`}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>{coveredTopics.size}/{REQUIRED_TOPICS.length}</div>
          <div style={{ fontSize: 12, color: "#1e40af" }}>All Topics Covered</div>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fef2f2", borderRadius: 8, borderLeft: "4px solid #dc2626" }} role="alert">
          <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>Missing Required Training</div>
          {missingRequired.map((t) => (
            <div key={t.id} style={{ fontSize: 13, color: "#7f1d1d", padding: "2px 0" }}>- {t.label} <span style={{ color: "#9ca3af" }}>({t.standard})</span></div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Training Log ({trainings.length} entries)</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {trainings.length > 0 && (
            <>
              <button onClick={clearAll} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b" }} aria-label="Clear all training entries">
                Clear All
              </button>
              <button onClick={handleExport} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569" }} aria-label="Download training log as text file">
                Download Log
              </button>
            </>
          )}
          <button onClick={() => (showForm ? cancelForm() : setShowForm(true))} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }} aria-expanded={showForm}>
            {showForm ? "Cancel" : "+ Add Training"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }} role="form" aria-label={editingId ? "Edit training" : "Add new training"}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label htmlFor={`${formId}-title`} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Title *</label>
              <input id={`${formId}-title`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Training title" style={{ width: "100%", padding: 8, border: `1px solid ${errors.title ? "#dc2626" : "#cbd5e1"}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} aria-required="true" aria-invalid={!!errors.title} />
              {errors.title && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }} role="alert">{errors.title}</div>}
            </div>
            <div>
              <label htmlFor={`${formId}-provider`} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Provider</label>
              <input id={`${formId}-provider`} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Provider name" style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label htmlFor={`${formId}-date`} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Date</label>
              <input id={`${formId}-date`} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} max={new Date().toISOString().slice(0, 10)} style={{ width: "100%", padding: 8, border: `1px solid ${errors.date ? "#dc2626" : "#cbd5e1"}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} aria-invalid={!!errors.date} />
              {errors.date && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }} role="alert">{errors.date}</div>}
            </div>
            <div>
              <label htmlFor={`${formId}-hours`} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Hours *</label>
              <input id={`${formId}-hours`} type="number" step="0.5" min="0.5" max="40" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="CE hours" style={{ width: "100%", padding: 8, border: `1px solid ${errors.hours ? "#dc2626" : "#cbd5e1"}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} aria-required="true" aria-invalid={!!errors.hours} />
              {errors.hours && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }} role="alert">{errors.hours}</div>}
            </div>
          </div>
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 12px" }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Topics covered * {errors.topics && <span style={{ fontWeight: 400, color: "#dc2626" }}>({errors.topics})</span>}</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {REQUIRED_TOPICS.map((t) => (
                <button key={t.id} onClick={() => toggleTopic(t.id)} type="button" role="checkbox" aria-checked={form.topics.includes(t.id)} style={{
                  padding: "3px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer",
                  border: form.topics.includes(t.id) ? "1px solid #2563eb" : "1px solid #cbd5e1",
                  background: form.topics.includes(t.id) ? "#dbeafe" : "#fff",
                  color: form.topics.includes(t.id) ? "#1e40af" : "#64748b",
                  fontWeight: t.required ? 600 : 400,
                }}>
                  {t.required ? "* " : ""}{t.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>* = required by 2025 standards</div>
          </fieldset>
          <button onClick={addTraining} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13 }}>
            {editingId ? "Update Training" : "Save Training"}
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
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => editTraining(t)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: "2px 6px" }} aria-label={`Edit ${t.title}`} title="Edit">Edit</button>
            <button onClick={() => removeTraining(t.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: "2px 6px" }} aria-label={`Remove ${t.title}`} title="Remove">x</button>
          </div>
        </div>
      ))}
    </div>
  );
}
