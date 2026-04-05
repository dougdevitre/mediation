import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-schedule-viz";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PRESETS = [
  { id: "alternating", name: "Alternating Weeks", desc: "Week on / week off", pattern: [0,0,0,0,0,0,0,1,1,1,1,1,1,1], cycle: 14 },
  { id: "2-2-3", name: "2-2-3 Rotation", desc: "Two days, two days, three days alternating", pattern: [0,0,1,1,0,0,0,1,1,0,0,1,1,1], cycle: 14 },
  { id: "5-2", name: "5-2 Schedule", desc: "Five days with one, two with the other", pattern: [0,0,0,0,0,1,1], cycle: 7 },
  { id: "3-4-4-3", name: "3-4-4-3 Rotation", desc: "3 days, 4 days alternating", pattern: [0,0,0,1,1,1,1,1,1,1,0,0,0,0], cycle: 14 },
  { id: "every-other-weekend", name: "Every Other Weekend", desc: "Primary parent weekdays, other parent every other weekend", pattern: [0,0,0,0,0,0,0,0,0,0,0,0,1,1], cycle: 14 },
  { id: "60-40", name: "60/40 Split", desc: "One midweek overnight + every other weekend", pattern: [0,0,0,0,0,0,0,0,0,1,0,0,1,1], cycle: 14 },
  { id: "custom", name: "Custom Schedule", desc: "Build your own pattern", pattern: [], cycle: 7 },
];

function loadFromStorage() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ScheduleVisualizer() {
  const stored = loadFromStorage();
  const [preset, setPreset] = useState(stored?.preset || "alternating");
  const [customPattern, setCustomPattern] = useState(stored?.customPattern || [0,0,0,0,0,0,0]);
  const [parentA, setParentA] = useState(stored?.parentA || "Parent A");
  const [parentB, setParentB] = useState(stored?.parentB || "Parent B");
  const [year, setYear] = useState(stored?.year || new Date().getFullYear());
  const [month, setMonth] = useState(stored?.month ?? new Date().getMonth());
  const [startDate, setStartDate] = useState(stored?.startDate || new Date().toISOString().slice(0, 10));

  useEffect(() => {
    saveToStorage({ preset, customPattern, parentA, parentB, year, month, startDate });
  }, [preset, customPattern, parentA, parentB, year, month, startDate]);

  const activePreset = PRESETS.find((p) => p.id === preset);
  const pattern = preset === "custom" ? customPattern : activePreset.pattern;
  const cycle = preset === "custom" ? customPattern.length : activePreset.cycle;

  const toggleCustomDay = (i) => {
    const next = [...customPattern];
    next[i] = next[i] === 0 ? 1 : 0;
    setCustomPattern(next);
  };

  const addCustomDay = () => setCustomPattern([...customPattern, 0]);
  const removeCustomDay = () => { if (customPattern.length > 2) setCustomPattern(customPattern.slice(0, -1)); };

  const getParentForDate = (dateStr) => {
    if (!pattern.length || !cycle) return null;
    const start = new Date(startDate);
    const target = new Date(dateStr);
    const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    const idx = diff % cycle;
    return pattern[idx];
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const countA = calendarDays.filter((d) => d && getParentForDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`) === 0).length;
  const countB = calendarDays.filter((d) => d && getParentForDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`) === 1).length;
  const totalDays = countA + countB;
  const pctA = totalDays > 0 ? Math.round((countA / totalDays) * 100) : 0;
  const pctB = totalDays > 0 ? Math.round((countB / totalDays) * 100) : 0;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const exportSchedule = () => {
    const lines = [`CUSTODY SCHEDULE — ${MONTHS[month]} ${year}`, "=".repeat(40), `Schedule: ${activePreset?.name || "Custom"}`, `${parentA}: ${countA} days (${pctA}%)`, `${parentB}: ${countB} days (${pctB}%)`, `Start date: ${startDate}`, ""];
    const weeks = [];
    let week = [];
    calendarDays.forEach((d, i) => { week.push(d); if ((i + 1) % 7 === 0) { weeks.push(week); week = []; } });
    if (week.length) weeks.push(week);
    lines.push("  " + DAYS.join("  "));
    weeks.forEach((w) => {
      lines.push("  " + w.map((d) => {
        if (!d) return "   ";
        const p = getParentForDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
        return `${String(d).padStart(2)}${p === 0 ? "A" : p === 1 ? "B" : " "}`;
      }).join(" "));
    });
    lines.push("", "A = " + parentA, "B = " + parentB, "", "NOTE: This is a visualization tool for mediation discussion, not a legal document.");
    downloadFile(lines.join("\n"), `custody-schedule-${year}-${String(month + 1).padStart(2, "0")}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Custody Schedule Visualizer</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>See what different parenting schedules actually look like on a calendar.</p>

      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div>
            <label htmlFor="parentA" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Parent A Name</label>
            <input id="parentA" value={parentA} onChange={(e) => setParentA(e.target.value)} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor="parentB" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Parent B Name</label>
            <input id="parentB" value={parentB} onChange={(e) => setParentB(e.target.value)} style={{ width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>
        <label htmlFor="startDate" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Schedule Start Date</label>
        <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, marginBottom: 12 }} />

        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Schedule Type</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => setPreset(p.id)} aria-pressed={preset === p.id} style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: preset === p.id ? "2px solid #2563eb" : "1px solid #cbd5e1",
              background: preset === p.id ? "#dbeafe" : "#fff",
              color: preset === p.id ? "#1e40af" : "#64748b",
              fontWeight: preset === p.id ? 600 : 400,
            }}>{p.name}</button>
          ))}
        </div>
        {activePreset && preset !== "custom" && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{activePreset.desc}</div>}
      </div>

      {preset === "custom" && (
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Custom Pattern (repeating cycle of {customPattern.length} days)</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
            {customPattern.map((val, i) => (
              <button key={i} onClick={() => toggleCustomDay(i)} style={{
                width: 36, height: 36, borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600,
                border: "1px solid " + (val === 0 ? "#3b82f6" : "#f97316"),
                background: val === 0 ? "#dbeafe" : "#ffedd5",
                color: val === 0 ? "#1e40af" : "#c2410c",
              }}>{val === 0 ? "A" : "B"}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={addCustomDay} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12 }}>+ Day</button>
            <button onClick={removeCustomDay} disabled={customPattern.length <= 2} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, opacity: customPattern.length <= 2 ? 0.4 : 1 }}>- Day</button>
          </div>
        </div>
      )}

      {/* Time split summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ textAlign: "center", padding: 12, background: "#dbeafe", borderRadius: 8, border: "1px solid #93c5fd" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1e40af" }}>{countA} days ({pctA}%)</div>
          <div style={{ fontSize: 13, color: "#1e40af" }}>{parentA}</div>
        </div>
        <div style={{ textAlign: "center", padding: 12, background: "#ffedd5", borderRadius: 8, border: "1px solid #fdba74" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#c2410c" }}>{countB} days ({pctB}%)</div>
          <div style={{ fontSize: 13, color: "#c2410c" }}>{parentB}</div>
        </div>
      </div>

      {/* Calendar */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={prevMonth} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }} aria-label="Previous month">Prev</button>
          <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>{MONTHS[month]} {year}</h3>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={exportSchedule} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 12 }} aria-label="Download schedule">Download</button>
            <button onClick={nextMonth} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }} aria-label="Next month">Next</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748b", padding: 4 }}>{d}</div>)}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ padding: 8 }} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const p = getParentForDate(dateStr);
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            return (
              <div key={dateStr} style={{
                textAlign: "center", padding: "6px 2px", borderRadius: 6, fontSize: 13, fontWeight: isToday ? 700 : 400,
                background: p === 0 ? "#dbeafe" : p === 1 ? "#ffedd5" : "#f8fafc",
                color: p === 0 ? "#1e40af" : p === 1 ? "#c2410c" : "#94a3b8",
                border: isToday ? "2px solid #0f172a" : "1px solid transparent",
              }}>
                <div>{day}</div>
                <div style={{ fontSize: 9, fontWeight: 600 }}>{p === 0 ? "A" : p === 1 ? "B" : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: 10, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This is a visualization tool for mediation discussion, not a legal document. Actual schedules should account for holidays, school breaks, and special circumstances.
      </div>
    </div>
  );
}
