import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-party-welcome";

const PATHS = [
  {
    id: "first-time",
    label: "I'm new to mediation",
    desc: "Learn what to expect and get ready for your first session",
    steps: [
      { label: "Learn what mediation is", tool: "mediation-prep", step: "Step 1: What to Expect explains the process, your rights, and what a typical session looks like." },
      { label: "Identify your issues", tool: "mediation-prep", step: "Step 2: Select the issues you need to resolve (custody, support, property, etc.)." },
      { label: "Set your priorities", tool: "mediation-prep", step: "Step 3: For each issue, decide what's a must-have vs. where you're flexible." },
      { label: "Think about your children", tool: "mediation-prep", step: "Step 4: Reflect on your children's needs, routines, and what matters to them." },
      { label: "Organize your finances", tool: "financial-disclosure", step: "Complete the Financial Disclosure worksheet — income, expenses, assets, and debts." },
      { label: "Gather your documents", tool: "mediation-prep", step: "Step 5: A personalized checklist of what to bring based on your issues." },
      { label: "Estimate the cost", tool: "cost-estimator", step: "See what mediation might cost based on your issues and complexity." },
      { label: "Write your questions", tool: "mediation-prep", step: "Step 6: Write down anything you want to ask your mediator." },
    ],
  },
  {
    id: "custody",
    label: "We need a parenting plan",
    desc: "Explore custody schedules and prepare for parenting discussions",
    steps: [
      { label: "See what schedules look like", tool: "schedule-visualizer", step: "Visualize different custody patterns (alternating weeks, 2-2-3, etc.) on a real calendar." },
      { label: "Understand schedule options", tool: null, step: "Read references/09-parenting-plans.md for age-based guidance on what works for different ages." },
      { label: "Think about your children's needs", tool: "mediation-prep", step: "Reflect on school, activities, medical needs, routines, and relationships." },
      { label: "Organize your finances", tool: "financial-disclosure", step: "Child support is based on both parents' incomes — have your numbers ready." },
      { label: "Estimate the cost", tool: "cost-estimator", step: "Parenting plans typically take 2-4 sessions. See your estimated cost." },
    ],
  },
  {
    id: "financial",
    label: "We need to divide finances",
    desc: "Organize property, debts, support, and financial disclosure",
    steps: [
      { label: "Organize your full financial picture", tool: "financial-disclosure", step: "Complete the worksheet: income, monthly expenses, assets (property, retirement, investments), and debts." },
      { label: "Understand financial terms", tool: null, step: "Read references/18-agreement-plain-language.md — explains QDRO, equitable distribution, alimony types, and more in plain language." },
      { label: "Gather your documents", tool: "mediation-prep", step: "Tax returns, pay stubs, bank statements, retirement statements, property docs, debt statements." },
      { label: "Estimate the cost", tool: "cost-estimator", step: "Complex financial cases take more sessions. Get your estimate." },
    ],
  },
  {
    id: "post-mediation",
    label: "We already have an agreement",
    desc: "Track compliance and understand your agreement terms",
    steps: [
      { label: "Understand your agreement", tool: null, step: "Read references/18-agreement-plain-language.md for plain-language explanations of common agreement terms." },
      { label: "Track compliance", tool: "compliance-tracker", step: "Add your agreement terms and track whether they're being followed." },
      { label: "Review your schedule", tool: "schedule-visualizer", step: "See your custody schedule on a calendar to verify it matches what you agreed to." },
    ],
  },
];

function loadFromStorage() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveToStorage(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function PartyWelcome() {
  const stored = loadFromStorage();
  const [activePath, setActivePath] = useState(stored?.activePath || null);
  const [completed, setCompleted] = useState(new Set(stored?.completed || []));

  useEffect(() => { saveToStorage({ activePath, completed: [...completed] }); }, [activePath, completed]);

  const toggleComplete = (pathId, stepIdx) => {
    const key = `${pathId}-${stepIdx}`;
    const next = new Set(completed);
    next.has(key) ? next.delete(key) : next.add(key);
    setCompleted(next);
  };

  const resetPath = () => { setActivePath(null); setCompleted(new Set()); };

  const cardStyle = { padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };

  // Path detail view
  if (activePath) {
    const path = PATHS.find((p) => p.id === activePath);
    const stepsComplete = path.steps.filter((_, i) => completed.has(`${path.id}-${i}`)).length;
    const progress = Math.round((stepsComplete / path.steps.length) * 100);

    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <button onClick={() => setActivePath(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>Back</button>

        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>{path.label}</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>{path.desc}</p>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", marginBottom: 4 }}>
            <span>{stepsComplete}/{path.steps.length} steps complete</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "#16a34a" : "#2563eb", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>

        {progress === 100 && (
          <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a", marginBottom: 4 }}>You're prepared!</div>
            <div style={{ fontSize: 13, color: "#166534" }}>You've completed all preparation steps. Bring your downloaded documents to your mediation session.</div>
          </div>
        )}

        {/* Steps */}
        {path.steps.map((step, i) => {
          const key = `${path.id}-${i}`;
          const done = completed.has(key);
          return (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                <input type="checkbox" checked={done} onChange={() => toggleComplete(path.id, i)} style={{ width: 20, height: 20, accentColor: "#16a34a", cursor: "pointer" }} aria-label={`Mark "${step.label}" as complete`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#16a34a" : "#1e293b", textDecoration: done ? "line-through" : "none" }}>
                  Step {i + 1}: {step.label}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{step.step}</div>
                {step.tool && (
                  <div style={{ fontSize: 12, color: "#2563eb", marginTop: 4 }}>
                    Tool: app/{step.tool}.jsx
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button onClick={resetPath} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b" }}>Start Over</button>
        </div>

        <div style={{ marginTop: 16, padding: 10, background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#1e40af" }}>
          Each step links to a specific tool. Open the tools in separate tabs/windows and come back here to check off your progress.
        </div>
      </div>
    );
  }

  // Welcome screen
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <div style={{ textAlign: "center", padding: "24px 16px", marginBottom: 20, background: "linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%)", borderRadius: 12, color: "#fff" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Welcome to Mediation</h2>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.92 }}>Free tools to help you prepare, save time, and save money. What brings you here?</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {PATHS.map((path) => (
          <button key={path.id} onClick={() => setActivePath(path.id)} style={{
            display: "block", width: "100%", textAlign: "left", padding: "16px 20px",
            background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer",
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{path.label}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{path.desc}</div>
            <div style={{ fontSize: 12, color: "#2563eb", marginTop: 6 }}>{path.steps.length} steps to get ready</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>What is mediation?</h3>
        <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Mediation is a <strong>voluntary</strong> process where a neutral mediator helps you and the other party communicate and reach your own agreements. The mediator doesn't take sides, doesn't give legal advice, and doesn't make decisions for you. You're always free to say no to any proposal and to walk away at any time.
        </p>
      </div>

      <div style={{ marginTop: 12, padding: 12, background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1e40af" }}>
        <strong>Why prepare?</strong> Parties who arrive prepared with organized finances, clear priorities, and relevant documents typically need fewer sessions — saving hundreds or thousands of dollars.
      </div>
    </div>
  );
}
