import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "mediation-session-timer";

const SESSION_TYPES = [
  { id: "joint", label: "Joint Session" },
  { id: "caucus_a", label: "Caucus (Party A)" },
  { id: "caucus_b", label: "Caucus (Party B)" },
  { id: "intake", label: "Intake" },
  { id: "shuttle", label: "Shuttle Mediation" },
];

const FORMATS = [
  { id: "in-person", label: "In-Person" },
  { id: "video", label: "Video" },
  { id: "phone", label: "Phone" },
];

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { sessions: [], settings: { hourlyRate: "250", defaultType: "joint", defaultFormat: "in-person", caseLabel: "" } };
  } catch {
    return { sessions: [], settings: { hourlyRate: "250", defaultType: "joint", defaultFormat: "in-person", caseLabel: "" } };
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatHours(ms) {
  return (ms / 3600000).toFixed(2);
}

function formatCost(amount) {
  return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function getTypeLabel(id) {
  return SESSION_TYPES.find((t) => t.id === id)?.label || id;
}

function getFormatLabel(id) {
  return FORMATS.find((f) => f.id === id)?.label || id;
}

export default function SessionTimer() {
  const stored = loadFromStorage();
  const [sessions, setSessions] = useState(stored.sessions || []);
  const [settings, setSettings] = useState(stored.settings || { hourlyRate: "250", defaultType: "joint", defaultFormat: "in-person", caseLabel: "" });

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // accumulated ms
  const [startTime, setStartTime] = useState(null); // Date.now() when last started/resumed
  const intervalRef = useRef(null);

  // UI state
  const [activeTab, setActiveTab] = useState("timer"); // timer | log | settings | billing
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [manualForm, setManualForm] = useState({ date: "", caseLabel: "", durationMin: "", sessionType: "joint", format: "in-person" });

  // Billing filters
  const [filterCase, setFilterCase] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    saveToStorage({ sessions, settings });
  }, [sessions, settings]);

  // Timer interval
  useEffect(() => {
    if (timerRunning && !timerPaused && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + (Date.now() - startTime));
        setStartTime(Date.now());
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerPaused, startTime]);

  const rate = parseFloat(settings.hourlyRate) || 0;
  const runningCost = (elapsed / 3600000) * rate;

  const handleStart = () => {
    setTimerRunning(true);
    setTimerPaused(false);
    setStartTime(Date.now());
    setElapsed(0);
  };

  const handlePause = () => {
    if (timerPaused) {
      // Resume
      setTimerPaused(false);
      setStartTime(Date.now());
    } else {
      // Pause - accumulate remaining time
      if (startTime) {
        setElapsed((prev) => prev + (Date.now() - startTime));
      }
      setTimerPaused(true);
      setStartTime(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const handleStop = () => {
    // Accumulate any remaining running time
    let finalElapsed = elapsed;
    if (startTime && !timerPaused) {
      finalElapsed += Date.now() - startTime;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (finalElapsed > 0) {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        caseLabel: settings.caseLabel || "Unlabeled",
        durationMs: finalElapsed,
        sessionType: settings.defaultType,
        format: settings.defaultFormat,
        cost: (finalElapsed / 3600000) * rate,
      };
      setSessions((prev) => [entry, ...prev]);
    }

    setTimerRunning(false);
    setTimerPaused(false);
    setElapsed(0);
    setStartTime(null);
  };

  // Manual entry
  const openManualForm = (session) => {
    if (session) {
      setEditingId(session.id);
      setManualForm({
        date: session.date,
        caseLabel: session.caseLabel,
        durationMin: String(Math.round(session.durationMs / 60000)),
        sessionType: session.sessionType,
        format: session.format,
      });
    } else {
      setEditingId(null);
      setManualForm({
        date: new Date().toISOString().slice(0, 10),
        caseLabel: settings.caseLabel || "",
        durationMin: "",
        sessionType: settings.defaultType,
        format: settings.defaultFormat,
      });
    }
    setShowManualForm(true);
  };

  const saveManualEntry = () => {
    const mins = parseFloat(manualForm.durationMin);
    if (!manualForm.date || !mins || mins <= 0) return;
    const durationMs = mins * 60000;
    const cost = (durationMs / 3600000) * rate;

    if (editingId) {
      setSessions((prev) => prev.map((s) => s.id === editingId ? { ...s, date: manualForm.date, caseLabel: manualForm.caseLabel || "Unlabeled", durationMs, sessionType: manualForm.sessionType, format: manualForm.format, cost } : s));
    } else {
      const entry = {
        id: Date.now(),
        date: manualForm.date,
        caseLabel: manualForm.caseLabel || "Unlabeled",
        durationMs,
        sessionType: manualForm.sessionType,
        format: manualForm.format,
        cost,
      };
      setSessions((prev) => [entry, ...prev]);
    }
    setShowManualForm(false);
    setEditingId(null);
  };

  const deleteSession = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));

  const clearAll = () => setSessions([]);
  const clearByCase = (label) => setSessions((prev) => prev.filter((s) => s.caseLabel !== label));

  // Billing
  const filteredSessions = sessions.filter((s) => {
    if (filterCase && s.caseLabel.toLowerCase().indexOf(filterCase.toLowerCase()) === -1) return false;
    if (filterDateFrom && s.date < filterDateFrom) return false;
    if (filterDateTo && s.date > filterDateTo) return false;
    return true;
  });

  const totalMs = filteredSessions.reduce((sum, s) => sum + s.durationMs, 0);
  const totalCost = filteredSessions.reduce((sum, s) => sum + s.cost, 0);

  const caseBreakdown = {};
  filteredSessions.forEach((s) => {
    if (!caseBreakdown[s.caseLabel]) caseBreakdown[s.caseLabel] = { ms: 0, cost: 0, count: 0 };
    caseBreakdown[s.caseLabel].ms += s.durationMs;
    caseBreakdown[s.caseLabel].cost += s.cost;
    caseBreakdown[s.caseLabel].count += 1;
  });

  const exportInvoice = () => {
    const lines = [
      "MEDIATION SESSION BILLING SUMMARY",
      "=".repeat(50),
      `Generated: ${new Date().toLocaleDateString()}`,
      `Hourly Rate: ${formatCost(rate)}`,
      "",
    ];
    if (filterCase) lines.push(`Filtered by case: ${filterCase}`);
    if (filterDateFrom || filterDateTo) lines.push(`Date range: ${filterDateFrom || "start"} to ${filterDateTo || "present"}`);
    lines.push("");
    lines.push(`Total Sessions: ${filteredSessions.length}`);
    lines.push(`Total Hours: ${formatHours(totalMs)}`);
    lines.push(`Total Cost: ${formatCost(totalCost)}`);
    lines.push("");
    lines.push("PER-CASE BREAKDOWN:");
    lines.push("-".repeat(50));
    Object.entries(caseBreakdown).forEach(([label, data]) => {
      lines.push(`  ${label}`);
      lines.push(`    Sessions: ${data.count}  |  Hours: ${formatHours(data.ms)}  |  Cost: ${formatCost(data.cost)}`);
    });
    lines.push("");
    lines.push("SESSION DETAILS:");
    lines.push("-".repeat(50));
    filteredSessions.sort((a, b) => a.date.localeCompare(b.date)).forEach((s, i) => {
      lines.push(`${i + 1}. ${s.date}  |  ${s.caseLabel}  |  ${getTypeLabel(s.sessionType)}  |  ${getFormatLabel(s.format)}  |  ${formatHours(s.durationMs)} hrs  |  ${formatCost(s.cost)}`);
    });
    lines.push("");
    lines.push("---");
    lines.push("Generated by Mediation Session Timer");
    downloadFile(lines.join("\n"), `mediation-invoice-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const downloadHistory = () => {
    downloadFile(JSON.stringify(sessions, null, 2), `mediation-sessions-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const caseLabels = [...new Set(sessions.map((s) => s.caseLabel))];

  const tabStyle = (tab) => ({
    padding: "8px 16px", borderRadius: "6px 6px 0 0", border: "1px solid #e2e8f0", borderBottom: activeTab === tab ? "1px solid #fff" : "1px solid #e2e8f0",
    background: activeTab === tab ? "#fff" : "#f1f5f9", color: activeTab === tab ? "#1e293b" : "#64748b",
    cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, marginBottom: -1,
  });

  const btnPrimary = { padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 };
  const btnSecondary = { padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569" };
  const btnDanger = { padding: "6px 14px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff", cursor: "pointer", fontSize: 13, color: "#dc2626" };
  const inputStyle = { width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Session Timer</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Track session time, log history, and generate billing summaries</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 0 }}>
        <button onClick={() => setActiveTab("timer")} style={tabStyle("timer")}>Timer</button>
        <button onClick={() => setActiveTab("log")} style={tabStyle("log")}>Session Log</button>
        <button onClick={() => setActiveTab("billing")} style={tabStyle("billing")}>Billing</button>
        <button onClick={() => setActiveTab("settings")} style={tabStyle("settings")}>Settings</button>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: "0 8px 8px 8px", padding: 16, background: "#fff", minHeight: 200 }}>

        {/* ---- TIMER TAB ---- */}
        {activeTab === "timer" && (
          <div>
            {settings.caseLabel && (
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                Case: <strong style={{ color: "#1e293b" }}>{settings.caseLabel}</strong>
              </div>
            )}

            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", color: timerRunning ? (timerPaused ? "#d97706" : "#16a34a") : "#1e293b", marginBottom: 8 }} role="timer" aria-label={`Elapsed time: ${formatTime(elapsed)}`}>
                {formatTime(elapsed)}
              </div>
              {timerRunning && (
                <div style={{ fontSize: 18, color: "#2563eb", fontWeight: 600, marginBottom: 16 }}>
                  {formatCost(runningCost)}
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400, marginLeft: 6 }}>at {formatCost(rate)}/hr</span>
                </div>
              )}
              {timerPaused && (
                <div style={{ fontSize: 13, color: "#d97706", marginBottom: 8 }}>Paused</div>
              )}

              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
                {!timerRunning && (
                  <button onClick={handleStart} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                    Start Session
                  </button>
                )}
                {timerRunning && (
                  <>
                    <button onClick={handlePause} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: timerPaused ? "#2563eb" : "#d97706", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                      {timerPaused ? "Resume" : "Pause"}
                    </button>
                    <button onClick={handleStop} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #dc2626", background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                      Stop & Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {timerRunning && (
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 4 }}>
                Type: {getTypeLabel(settings.defaultType)} | Format: {getFormatLabel(settings.defaultFormat)}
              </div>
            )}
          </div>
        )}

        {/* ---- SESSION LOG TAB ---- */}
        {activeTab === "log" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Session Log ({sessions.length} entries)</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {sessions.length > 0 && (
                  <button onClick={downloadHistory} style={btnSecondary}>Download JSON</button>
                )}
                <button onClick={() => openManualForm(null)} style={btnPrimary}>+ Manual Entry</button>
              </div>
            </div>

            {showManualForm && (
              <div style={{ padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    <input type="date" value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Case Label</label>
                    <input value={manualForm.caseLabel} onChange={(e) => setManualForm({ ...manualForm, caseLabel: e.target.value })} placeholder="Case reference" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Duration (minutes) *</label>
                    <input type="number" min="1" value={manualForm.durationMin} onChange={(e) => setManualForm({ ...manualForm, durationMin: e.target.value })} placeholder="e.g. 90" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Session Type</label>
                    <select value={manualForm.sessionType} onChange={(e) => setManualForm({ ...manualForm, sessionType: e.target.value })} style={inputStyle}>
                      {SESSION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Format</label>
                    <select value={manualForm.format} onChange={(e) => setManualForm({ ...manualForm, format: e.target.value })} style={inputStyle}>
                      {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveManualEntry} style={{ ...btnPrimary, background: "#16a34a" }}>{editingId ? "Update" : "Save Entry"}</button>
                  <button onClick={() => { setShowManualForm(false); setEditingId(null); }} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            )}

            {sessions.length === 0 && !showManualForm && (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No sessions recorded yet. Use the timer or add a manual entry.</div>
            )}

            {sessions.map((s) => (
              <div key={s.id} style={{ padding: 12, marginBottom: 8, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{s.caseLabel}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {s.date} · {formatHours(s.durationMs)} hrs · {getTypeLabel(s.sessionType)} · {getFormatLabel(s.format)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", marginTop: 2 }}>{formatCost(s.cost)}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openManualForm(s)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: "2px 6px" }} title="Edit">Edit</button>
                  <button onClick={() => deleteSession(s.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: "2px 6px" }} title="Delete">x</button>
                </div>
              </div>
            ))}

            {sessions.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={clearAll} style={btnDanger}>Clear All Sessions</button>
                {caseLabels.length > 1 && caseLabels.map((label) => (
                  <button key={label} onClick={() => clearByCase(label)} style={{ ...btnSecondary, fontSize: 12 }}>Clear "{label}"</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- BILLING TAB ---- */}
        {activeTab === "billing" && (
          <div>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>Billing Summary</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Filter by Case</label>
                <input value={filterCase} onChange={(e) => setFilterCase(e.target.value)} placeholder="Case label" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date From</label>
                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date To</label>
                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>{filteredSessions.length}</div>
                <div style={{ fontSize: 12, color: "#1e40af" }}>Sessions</div>
              </div>
              <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{formatHours(totalMs)}</div>
                <div style={{ fontSize: 12, color: "#166534" }}>Total Hours</div>
              </div>
              <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{formatCost(totalCost)}</div>
                <div style={{ fontSize: 12, color: "#166534" }}>Total Cost</div>
              </div>
            </div>

            {Object.keys(caseBreakdown).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#0f172a" }}>Per-Case Breakdown</h4>
                {Object.entries(caseBreakdown).map(([label, data]) => (
                  <div key={label} style={{ padding: 10, marginBottom: 6, background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{data.count} session{data.count !== 1 ? "s" : ""} · {formatHours(data.ms)} hrs</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#2563eb" }}>{formatCost(data.cost)}</div>
                  </div>
                ))}
              </div>
            )}

            {filteredSessions.length > 0 && (
              <button onClick={exportInvoice} style={btnPrimary}>Export Invoice</button>
            )}

            {filteredSessions.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No sessions match the current filters.</div>
            )}
          </div>
        )}

        {/* ---- SETTINGS TAB ---- */}
        {activeTab === "settings" && (
          <div>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>Settings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Hourly Rate ($)</label>
                <input type="number" min="0" step="10" value={settings.hourlyRate} onChange={(e) => setSettings({ ...settings, hourlyRate: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Case Label</label>
                <input value={settings.caseLabel} onChange={(e) => setSettings({ ...settings, caseLabel: e.target.value })} placeholder="e.g. Smith v. Smith" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Default Session Type</label>
                <select value={settings.defaultType} onChange={(e) => setSettings({ ...settings, defaultType: e.target.value })} style={inputStyle}>
                  {SESSION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Default Format</label>
                <select value={settings.defaultFormat} onChange={(e) => setSettings({ ...settings, defaultFormat: e.target.value })} style={inputStyle}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>Settings are saved automatically. The case label and defaults apply to new timer sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
