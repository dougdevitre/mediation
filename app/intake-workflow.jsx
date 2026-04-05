import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-intake-workflow";

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

const STEPS = [
  {
    id: "conflict-check",
    title: "1. Conflict Check",
    reference: "references/04-impartiality-conflicts.md",
    template: "conflict-of-interest-disclosure.md",
    optional: false,
    substeps: [
      { id: "run-check", label: "Run conflict check against current/past cases" },
      { id: "document-conflicts", label: "Document any actual or potential conflicts" },
      { id: "obtain-waiver", label: "Obtain written waiver if proceeding with disclosed conflict" },
    ],
  },
  {
    id: "pre-med-party-a",
    title: "2. Individual Pre-Mediation Session \u2014 Party A",
    reference: "references/01-intake-screening.md",
    template: "intake-questionnaire.md, domestic-abuse-screening-checklist.md",
    optional: false,
    substeps: [
      { id: "intake-questionnaire-a", label: "Complete intake questionnaire" },
      { id: "dv-screening-a", label: "Conduct domestic abuse screening" },
      { id: "child-maltreatment-a", label: "Conduct child maltreatment screening" },
      { id: "barriers-a", label: "Assess barriers to participation" },
    ],
  },
  {
    id: "pre-med-party-b",
    title: "3. Individual Pre-Mediation Session \u2014 Party B",
    reference: "references/01-intake-screening.md",
    template: "intake-questionnaire.md, domestic-abuse-screening-checklist.md",
    optional: false,
    substeps: [
      { id: "intake-questionnaire-b", label: "Complete intake questionnaire" },
      { id: "dv-screening-b", label: "Conduct domestic abuse screening" },
      { id: "child-maltreatment-b", label: "Conduct child maltreatment screening" },
      { id: "barriers-b", label: "Assess barriers to participation" },
    ],
  },
  {
    id: "safety-assessment",
    title: "4. Safety Assessment",
    reference: "references/02-domestic-abuse-screening.md",
    template: "safety-plan.md",
    optional: false,
    substeps: [
      { id: "review-screenings", label: "Review both screening results" },
      { id: "determine-appropriate", label: "Determine if mediation is appropriate" },
      { id: "safety-plan", label: "If DV indicators: create safety plan" },
      { id: "session-format", label: "Decide session format (joint, shuttle, caucus-only)" },
    ],
  },
  {
    id: "fee-disclosure",
    title: "5. Fee Disclosure",
    reference: "references/14-fees.md",
    template: "fee-disclosure.md",
    optional: false,
    substeps: [
      { id: "provide-fee-info", label: "Provide fee information to both parties" },
      { id: "sliding-scale", label: "Discuss sliding scale if applicable" },
      { id: "fee-acknowledge", label: "Both parties acknowledge fee structure" },
    ],
  },
  {
    id: "technology-consent",
    title: "6. Technology Consent (if using ODR)",
    reference: "references/06-technology-odr.md",
    template: "technology-consent.md",
    optional: true,
    substeps: [
      { id: "assess-tech", label: "Assess technology capabilities" },
      { id: "explain-platform", label: "Explain platform, security, and consent requirements" },
      { id: "obtain-tech-consent", label: "Obtain signed consent" },
    ],
  },
  {
    id: "agreement-to-mediate",
    title: "7. Agreement to Mediate",
    reference: "references/05-agreement-to-mediate.md",
    template: "agreement-to-mediate.md",
    optional: false,
    substeps: [
      { id: "review-terms", label: "Review agreement terms with both parties" },
      { id: "explain-confidentiality", label: "Explain confidentiality and exceptions" },
      { id: "explain-rights", label: "Explain self-determination and withdrawal rights" },
      { id: "both-sign", label: "Both parties sign" },
    ],
  },
  {
    id: "case-ready",
    title: "8. Case Ready",
    reference: null,
    template: null,
    optional: false,
    substeps: [
      { id: "prerequisites-done", label: "All prerequisites completed" },
      { id: "schedule-session", label: "Schedule first mediation session" },
      { id: "prepare-agenda", label: "Prepare session agenda" },
    ],
  },
];

function buildInitialState() {
  const steps = {};
  STEPS.forEach((step) => {
    const checked = {};
    step.substeps.forEach((s) => { checked[s.id] = false; });
    steps[step.id] = { checked, completed: false, skipped: false, notes: "" };
  });
  return steps;
}

export default function IntakeWorkflow() {
  const stored = loadFromStorage();
  const [steps, setSteps] = useState(stored?.steps || buildInitialState());
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => { saveToStorage({ steps }); }, [steps]);

  const updateStep = (stepId, updates) => {
    setSteps((prev) => ({ ...prev, [stepId]: { ...prev[stepId], ...updates } }));
  };

  const toggleSubstep = (stepId, substepId) => {
    setSteps((prev) => {
      const step = prev[stepId];
      const checked = { ...step.checked, [substepId]: !step.checked[substepId] };
      return { ...prev, [stepId]: { ...step, checked } };
    });
  };

  const markComplete = (stepId) => {
    updateStep(stepId, { completed: true });
  };

  const markIncomplete = (stepId) => {
    updateStep(stepId, { completed: false });
  };

  const skipStep = (stepId) => {
    updateStep(stepId, { skipped: true, completed: false });
  };

  const unskipStep = (stepId) => {
    updateStep(stepId, { skipped: false });
  };

  const setNotes = (stepId, notes) => {
    updateStep(stepId, { notes });
  };

  const clearAll = () => {
    setSteps(buildInitialState());
    setExpandedStep(null);
  };

  // Compute progress
  const activeSteps = STEPS.filter((s) => !steps[s.id].skipped);
  const completedCount = activeSteps.filter((s) => steps[s.id].completed).length;
  const totalActive = activeSteps.length;
  const progressPct = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  const totalSubsteps = activeSteps.reduce((sum, s) => sum + s.substeps.length, 0);
  const checkedSubsteps = activeSteps.reduce((sum, s) => {
    return sum + s.substeps.filter((sub) => steps[s.id].checked[sub.id]).length;
  }, 0);

  const getStepStatus = (step) => {
    const state = steps[step.id];
    if (state.skipped) return "skipped";
    if (state.completed) return "completed";
    const anyChecked = step.substeps.some((s) => state.checked[s.id]);
    if (anyChecked) return "in-progress";
    return "not-started";
  };

  const statusColors = {
    completed: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", text: "#166534" },
    "in-progress": { bg: "#eff6ff", border: "#bfdbfe", dot: "#2563eb", text: "#1e40af" },
    "not-started": { bg: "#f8fafc", border: "#e2e8f0", dot: "#94a3b8", text: "#64748b" },
    skipped: { bg: "#f8fafc", border: "#e2e8f0", dot: "#cbd5e1", text: "#94a3b8" },
  };

  const allSubstepsChecked = (step) => {
    const state = steps[step.id];
    return step.substeps.every((s) => state.checked[s.id]);
  };

  const exportChecklist = () => {
    const lines = [
      "MEDIATION INTAKE WORKFLOW CHECKLIST",
      "=".repeat(50),
      `Date: ${new Date().toLocaleDateString()}`,
      `Overall Progress: ${completedCount}/${totalActive} steps completed (${progressPct}%)`,
      `Substeps: ${checkedSubsteps}/${totalSubsteps} checked`,
      "",
    ];

    STEPS.forEach((step) => {
      const state = steps[step.id];
      const status = getStepStatus(step);
      const statusLabel = status === "completed" ? "[COMPLETED]"
        : status === "skipped" ? "[SKIPPED]"
        : status === "in-progress" ? "[IN PROGRESS]"
        : "[NOT STARTED]";

      lines.push(`${step.title} ${statusLabel}`);
      if (step.reference) lines.push(`  Reference: ${step.reference}`);
      if (step.template) lines.push(`  Template(s): ${step.template}`);

      if (status !== "skipped") {
        step.substeps.forEach((sub) => {
          const mark = state.checked[sub.id] ? "[x]" : "[ ]";
          lines.push(`  ${mark} ${sub.label}`);
        });
      }

      if (state.notes.trim()) {
        lines.push(`  Notes: ${state.notes.trim()}`);
      }
      lines.push("");
    });

    lines.push("Generated by Mediation Intake Workflow Tool");
    downloadFile(lines.join("\n"), `intake-checklist-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const btnBase = { padding: "5px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#475569" };
  const btnPrimary = { ...btnBase, border: "none", background: "#2563eb", color: "#fff" };
  const btnSuccess = { ...btnBase, border: "none", background: "#16a34a", color: "#fff" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Intake Workflow</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
        Guide mediators through the complete intake process in the correct order, tracking which steps are complete.
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
            Overall Progress: {completedCount}/{totalActive} steps
          </span>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {checkedSubsteps}/{totalSubsteps} substeps checked
          </span>
        </div>
        <div style={{ height: 10, background: "#e2e8f0", borderRadius: 5, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: progressPct === 100 ? "#16a34a" : "#2563eb",
              borderRadius: 5,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: progressPct === 100 ? "#16a34a" : "#64748b", marginTop: 2, textAlign: "right" }}>
          {progressPct}%
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        <div style={{ textAlign: "center", padding: 10, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{completedCount}</div>
          <div style={{ fontSize: 11, color: "#166534" }}>Completed</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
            {STEPS.filter((s) => getStepStatus(s) === "in-progress").length}
          </div>
          <div style={{ fontSize: 11, color: "#1e40af" }}>In Progress</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#64748b" }}>
            {STEPS.filter((s) => getStepStatus(s) === "not-started").length}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Not Started</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#94a3b8" }}>
            {STEPS.filter((s) => steps[s.id].skipped).length}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Skipped</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 12 }}>
        <button onClick={exportChecklist} style={btnBase}>Export Checklist</button>
        <button onClick={clearAll} style={btnBase}>Clear All</button>
      </div>

      {/* Steps */}
      {STEPS.map((step) => {
        const status = getStepStatus(step);
        const colors = statusColors[status];
        const state = steps[step.id];
        const isExpanded = expandedStep === step.id;

        return (
          <div
            key={step.id}
            style={{
              marginBottom: 8,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              overflow: "hidden",
            }}
          >
            {/* Step header */}
            <div
              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              style={{
                padding: "12px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: colors.dot,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, textDecoration: status === "skipped" ? "line-through" : "none" }}>
                  {step.title}
                  {step.optional && <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>(optional)</span>}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                  {status === "completed" && "All substeps completed"}
                  {status === "in-progress" && `${step.substeps.filter((s) => state.checked[s.id]).length}/${step.substeps.length} substeps`}
                  {status === "not-started" && `${step.substeps.length} substeps`}
                  {status === "skipped" && "Skipped"}
                </div>
              </div>
              <span style={{ fontSize: 14, color: "#94a3b8", flexShrink: 0 }}>{isExpanded ? "\u25B2" : "\u25BC"}</span>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${colors.border}` }}>
                {/* Reference and template info */}
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 10, marginBottom: 10 }}>
                  {step.reference && <div>Reference: <span style={{ color: "#2563eb" }}>{step.reference}</span></div>}
                  {step.template && <div>Template: <span style={{ color: "#2563eb" }}>{step.template}</span></div>}
                </div>

                {/* Substeps */}
                {!state.skipped && step.substeps.map((sub) => (
                  <label
                    key={sub.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 0",
                      cursor: state.completed ? "default" : "pointer",
                      fontSize: 13,
                      color: state.checked[sub.id] ? "#166534" : "#1e293b",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={state.checked[sub.id]}
                      onChange={() => { if (!state.completed) toggleSubstep(step.id, sub.id); }}
                      disabled={state.completed}
                      style={{ accentColor: "#16a34a", width: 16, height: 16, flexShrink: 0 }}
                    />
                    <span style={{ textDecoration: state.checked[sub.id] ? "line-through" : "none" }}>
                      {sub.label}
                    </span>
                  </label>
                ))}

                {/* Notes */}
                {!state.skipped && (
                  <div style={{ marginTop: 10 }}>
                    <label style={labelStyle}>Case Notes</label>
                    <textarea
                      value={state.notes}
                      onChange={(e) => setNotes(step.id, e.target.value)}
                      placeholder="Add notes for this step..."
                      rows={2}
                      style={{
                        width: "100%",
                        padding: 8,
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        fontSize: 12,
                        fontFamily: "system-ui, sans-serif",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {!state.completed && !state.skipped && (
                    <button
                      onClick={() => markComplete(step.id)}
                      disabled={!allSubstepsChecked(step)}
                      style={{
                        ...btnSuccess,
                        opacity: allSubstepsChecked(step) ? 1 : 0.5,
                        cursor: allSubstepsChecked(step) ? "pointer" : "default",
                      }}
                    >
                      Mark Step Complete
                    </button>
                  )}
                  {state.completed && (
                    <button onClick={() => markIncomplete(step.id)} style={btnBase}>
                      Reopen Step
                    </button>
                  )}
                  {step.optional && !state.skipped && !state.completed && (
                    <button onClick={() => skipStep(step.id)} style={btnBase}>
                      Skip (In-Person)
                    </button>
                  )}
                  {state.skipped && (
                    <button onClick={() => unskipStep(step.id)} style={btnBase}>
                      Unskip Step
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {progressPct === 100 && (
        <div style={{ padding: 12, marginTop: 8, background: "#f0fdf4", borderRadius: 8, borderLeft: "4px solid #16a34a" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>Intake Complete</div>
          <div style={{ fontSize: 12, color: "#166534", marginTop: 2 }}>
            All required steps have been completed. The case is ready for the first mediation session.
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, padding: 10, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This workflow tool supports the intake process as described in the 2025 AFCC/ABA Model Standards.
        Always exercise independent professional judgment. Screening results and safety assessments
        may require deviation from the standard workflow.
      </div>
    </div>
  );
}
