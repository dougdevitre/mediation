import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-mediator-dashboard";

const CASE_PHASES = [
  {
    id: "intake",
    label: "Intake & Screening",
    desc: "New case setup, conflict checks, DV screening, agreement to mediate",
    tools: [
      { name: "Intake Workflow", app: "intake-workflow", desc: "Step-by-step intake with compliance tracking" },
    ],
    templates: ["intake-questionnaire.md", "domestic-abuse-screening-checklist.md", "conflict-of-interest-disclosure.md", "agreement-to-mediate.md", "fee-disclosure.md", "technology-consent.md"],
    references: ["01-intake-screening.md", "02-domestic-abuse-screening.md", "03-child-maltreatment.md", "04-impartiality-conflicts.md", "05-agreement-to-mediate.md"],
    partyTools: ["Mediation Readiness Tool — share with parties to help them prepare", "Financial Disclosure — share with parties to organize finances before first session"],
  },
  {
    id: "session",
    label: "Active Mediation",
    desc: "Facilitating sessions, developing plans, tracking time",
    tools: [
      { name: "Session Timer & Billing", app: "session-timer", desc: "Track time and generate invoices" },
      { name: "Parenting Plan Builder", app: "parenting-plan-builder", desc: "Build plans with 50+ provisions" },
      { name: "Agreement Clause Library", app: "clause-library", desc: "Search and copy pre-written clauses" },
    ],
    templates: ["session-notes.md", "safety-plan.md", "parenting-plan-worksheet.md"],
    references: ["07-session-facilitation.md", "08-voice-of-child.md", "09-parenting-plans.md", "10-barriers-modifications.md", "11-confidentiality.md"],
    partyTools: ["Schedule Visualizer — show parties what different custody patterns look like", "Cost Estimator — help parties understand remaining cost expectations"],
  },
  {
    id: "agreement",
    label: "Agreement & Closure",
    desc: "Drafting agreements, case closure, post-mediation steps",
    tools: [
      { name: "Agreement Clause Library", app: "clause-library", desc: "Pre-written clause templates for drafting" },
    ],
    templates: ["mediation-settlement-agreement.md", "mediation-summary.md", "post-mediation-checklist.md", "termination-notice.md"],
    references: ["12-agreement-drafting.md", "13-suspension-termination.md", "18-agreement-plain-language.md"],
    partyTools: ["Plain-Language Guide — help parties understand what they are signing", "Compliance Tracker — share with parties to track agreement follow-through"],
  },
  {
    id: "practice",
    label: "Practice Management",
    desc: "Training, compliance, ethics, and professional development",
    tools: [
      { name: "CE Training Tracker", app: "ce-tracker", desc: "Track CE hours against required topics" },
      { name: "Ethics & Compliance Dashboard", app: "compliance-dashboard", desc: "Quarterly self-audit" },
    ],
    templates: ["mediator-training-log.md"],
    references: ["14-fees.md", "15-qualifications-training.md", "16-advertising.md", "17-ethics-compliance.md"],
    partyTools: [],
  },
];

const QUICK_ACTIONS = [
  { label: "Start New Case", phase: "intake", icon: "+" },
  { label: "Log a Session", phase: "session", icon: "T" },
  { label: "Find a Clause", phase: "agreement", icon: "S" },
  { label: "Run Self-Audit", phase: "practice", icon: "A" },
];

function loadFromStorage() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveToStorage(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function MediatorDashboard() {
  const stored = loadFromStorage();
  const [activePhase, setActivePhase] = useState(stored?.activePhase || null);
  const [recentCases, setRecentCases] = useState(stored?.recentCases || []);
  const [caseLabel, setCaseLabel] = useState("");

  useEffect(() => { saveToStorage({ activePhase, recentCases }); }, [activePhase, recentCases]);

  const addRecentCase = () => {
    if (!caseLabel.trim()) return;
    const entry = { label: caseLabel.trim(), date: new Date().toISOString().slice(0, 10), phase: "intake" };
    setRecentCases([entry, ...recentCases.slice(0, 9)]);
    setCaseLabel("");
    setActivePhase("intake");
  };

  const removeCase = (i) => setRecentCases(recentCases.filter((_, idx) => idx !== i));

  const cardStyle = { padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };

  // Phase detail view
  if (activePhase) {
    const phase = CASE_PHASES.find((p) => p.id === activePhase);
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <button onClick={() => setActivePhase(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>Back to Dashboard</button>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>{phase.label}</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>{phase.desc}</p>

        <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Tools</h3>
        <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
          {phase.tools.map((t) => (
            <div key={t.app} style={{ ...cardStyle, cursor: "pointer", borderLeft: "4px solid #2563eb" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{t.desc}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>app/{t.app}.jsx</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Templates to Use</h3>
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          {phase.templates.map((t) => (
            <div key={t} style={{ fontSize: 13, color: "#334155", padding: "3px 0" }}>templates/{t}</div>
          ))}
        </div>

        <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Reference Guides</h3>
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          {phase.references.map((r) => (
            <div key={r} style={{ fontSize: 13, color: "#334155", padding: "3px 0" }}>references/{r}</div>
          ))}
        </div>

        {phase.partyTools.length > 0 && (
          <>
            <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Share with Parties</h3>
            <div style={{ padding: 12, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", marginBottom: 20 }}>
              {phase.partyTools.map((t, i) => (
                <div key={i} style={{ fontSize: 13, color: "#1e40af", padding: "3px 0" }}>{t}</div>
              ))}
            </div>
          </>
        )}

        <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Scenarios for This Phase</h3>
        <div style={{ fontSize: 13, color: "#475569", padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          See <code>scenarios/scenario-library.md</code> for 25 "What do I do when..." scenarios with standards-based protocols.
        </div>
      </div>
    );
  }

  // Dashboard home
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Mediator Dashboard</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Your practice hub — tools, templates, and references organized by workflow phase.</p>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {QUICK_ACTIONS.map((a) => (
          <button key={a.label} onClick={() => setActivePhase(a.phase)} style={{
            padding: "14px 8px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", textAlign: "center",
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb", marginBottom: 4 }}>{a.icon}</div>
            <div style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{a.label}</div>
          </button>
        ))}
      </div>

      {/* New Case */}
      <div style={{ ...cardStyle, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <input value={caseLabel} onChange={(e) => setCaseLabel(e.target.value)} placeholder="Case label (e.g., Smith v. Smith)" onKeyDown={(e) => e.key === "Enter" && addRecentCase()} aria-label="New case label" style={{ flex: 1, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
        <button onClick={addRecentCase} disabled={!caseLabel.trim()} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: caseLabel.trim() ? "#2563eb" : "#94a3b8", color: "#fff", cursor: caseLabel.trim() ? "pointer" : "default", fontSize: 13, whiteSpace: "nowrap" }}>New Case</button>
      </div>

      {/* Recent Cases */}
      {recentCases.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Recent Cases</h3>
          {recentCases.map((c, i) => (
            <div key={`${c.label}-${c.date}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 4, background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{c.label}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>{c.date}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setActivePhase(c.phase)} style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 11, color: "#475569" }}>Open</button>
                <button onClick={() => removeCase(i)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }} aria-label={`Remove ${c.label}`}>x</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Phases */}
      <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>Workflow Phases</h3>
      {CASE_PHASES.map((phase) => (
        <button key={phase.id} onClick={() => setActivePhase(phase.id)} style={{
          display: "block", width: "100%", textAlign: "left", padding: "14px 16px", marginBottom: 8,
          background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{phase.label}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{phase.desc}</div>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{phase.tools.length} tools · {phase.templates.length} templates</div>
          </div>
        </button>
      ))}

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#16a34a" }}>11</div>
          <div style={{ fontSize: 12, color: "#166534" }}>Interactive Tools</div>
        </div>
        <div style={{ padding: 12, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1d4ed8" }}>14</div>
          <div style={{ fontSize: 12, color: "#1e40af" }}>Practice Templates</div>
        </div>
        <div style={{ padding: 12, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#ca8a04" }}>25</div>
          <div style={{ fontSize: 12, color: "#854d0e" }}>Practice Scenarios</div>
        </div>
        <div style={{ padding: 12, background: "#faf5ff", borderRadius: 8, border: "1px solid #d8b4fe", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#7c3aed" }}>20</div>
          <div style={{ fontSize: 12, color: "#5b21b6" }}>Reference Guides</div>
        </div>
      </div>
    </div>
  );
}
