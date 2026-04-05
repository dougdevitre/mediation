import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-decision-engine";

const DILEMMAS = [
  {
    id: "dv-proceed",
    title: "Should I proceed with mediation when DV indicators are present?",
    category: "Safety",
    triggers: ["DV screening positive", "Party expresses fear", "Coercive control indicators", "History of violence"],
    decisionTree: [
      { q: "Has the affected party been screened individually and confidentially?", yes: 1, no: "action_screen_first" },
      { q: "Can the affected party participate meaningfully without fear or coercion?", yes: 2, no: "action_do_not_proceed" },
      { q: "Can safety be ensured through process modifications (shuttle, separate sessions, staggered arrivals)?", yes: 3, no: "action_do_not_proceed" },
      { q: "Has the affected party given informed, voluntary consent to proceed with modifications?", yes: "action_proceed_modified", no: "action_do_not_proceed" },
    ],
    actions: {
      action_screen_first: { label: "Screen First", level: "required", text: "You must complete individual, confidential DV screening before proceeding. Use templates/domestic-abuse-screening-checklist.md. Do NOT proceed to joint sessions without screening.", standard: "2025-V(A): Screening shall occur before consent to mediate is sought.", refs: ["references/02-domestic-abuse-screening.md", "app/risk-assessment.jsx"] },
      action_do_not_proceed: { label: "Do Not Proceed", level: "required", text: "Mediation is not appropriate at this time. The affected party cannot participate meaningfully and safely. Provide referrals to DV services, legal aid, and court resources. Document your decision.", standard: "2025-V(D): The mediator shall not conduct or shall terminate mediation if safety cannot be ensured.", refs: ["references/13-suspension-termination.md", "templates/termination-notice.md"] },
      action_proceed_modified: { label: "Proceed with Modifications", level: "permitted", text: "You may proceed with appropriate safety modifications. Create a safety plan. Use shuttle or caucus format. Implement staggered arrival/departure. Monitor throughout. Reassess at every session.", standard: "2025-V(B): The mediator shall implement appropriate safety measures.", refs: ["templates/safety-plan.md", "references/07-session-facilitation.md"] },
    },
  },
  {
    id: "mandatory-report",
    title: "Am I required to make a mandatory report?",
    category: "Child Safety",
    triggers: ["Child abuse allegation", "Child neglect concerns", "Child discloses harm", "Party describes child maltreatment"],
    decisionTree: [
      { q: "Are you a mandatory reporter in your jurisdiction (check your state law and professional license)?", yes: 1, no: "action_check_status" },
      { q: "Do you have reasonable cause to suspect child abuse or neglect based on what you've observed or been told?", yes: 2, no: "action_document_monitor" },
      { q: "Is a child in immediate danger right now?", yes: "action_report_immediately", no: "action_report_required" },
    ],
    actions: {
      action_check_status: { label: "Verify Your Status", level: "required", text: "You must determine whether you are a mandatory reporter. Many mediators are — especially if also licensed as attorneys, therapists, or social workers. Check your state's mandatory reporting statute and your professional licensing obligations. When in doubt, report.", standard: "2025-VI(B): Mediators shall understand their mandatory reporting obligations.", refs: ["references/03-child-maltreatment.md", "jurisdictions/"] },
      action_document_monitor: { label: "Document and Monitor", level: "discretionary", text: "The information does not currently meet the threshold for a report, but document what you observed and continue to monitor. If additional indicators emerge, reassess. Consider whether the children's safety requires any process modifications.", standard: "2025-VI(A): The mediator shall be alert to child maltreatment indicators.", refs: ["references/03-child-maltreatment.md", "templates/session-notes.md"] },
      action_report_immediately: { label: "Report Immediately", level: "required", text: "Call your jurisdiction's child abuse hotline NOW. A child in immediate danger takes priority over everything — the mediation session, confidentiality, and the parties' preferences. You may also need to call 911. Inform the parties of your reporting obligation. Suspend mediation.", standard: "2025-VI(B): Mandatory reporting obligations override mediation confidentiality.", refs: ["references/03-child-maltreatment.md", "references/13-suspension-termination.md"] },
      action_report_required: { label: "File a Report", level: "required", text: "You are required to report. Contact your jurisdiction's child protective services or abuse hotline. You do not need to prove abuse — you need reasonable suspicion. Inform the parties that you have a legal reporting obligation. Consider suspending mediation pending investigation. Document the report in your confidential notes.", standard: "2025-VI(B): The mediator shall comply with applicable mandatory reporting laws.", refs: ["references/03-child-maltreatment.md", "templates/session-notes.md"] },
    },
  },
  {
    id: "conflict-discovered",
    title: "I discovered a conflict of interest mid-case. What do I do?",
    category: "Ethics",
    triggers: ["Prior relationship with party", "Financial interest", "Personal bias discovered", "Connection to attorney or judge"],
    decisionTree: [
      { q: "Is the conflict something that would prevent you from being impartial?", yes: "action_withdraw", no: 1 },
      { q: "Can you disclose the conflict fully and transparently to both parties?", yes: 1, no: "action_withdraw" },
      { q: "After full disclosure, do both parties provide informed, voluntary consent to continue?", yes: "action_continue_disclosed", no: "action_withdraw" },
    ],
    actions: {
      action_withdraw: { label: "Withdraw from the Case", level: "required", text: "You must withdraw. Your impartiality is compromised or cannot be adequately addressed through disclosure. Provide referrals to other mediators. Do not disclose confidential mediation information to the replacement mediator beyond what the parties authorize.", standard: "2025-VII(C): The mediator shall withdraw if impartiality is compromised.", refs: ["references/04-impartiality-conflicts.md", "templates/conflict-of-interest-disclosure.md"] },
      action_continue_disclosed: { label: "Continue with Disclosure", level: "permitted", text: "You may continue after: (1) full written disclosure of the conflict; (2) both parties acknowledge the conflict in writing; (3) both parties voluntarily consent to proceed. Document the disclosure and consent. Monitor your own impartiality throughout. If doubts arise later, revisit the decision.", standard: "2025-VII(B): Conflicts may be waived with informed written consent.", refs: ["templates/conflict-of-interest-disclosure.md", "references/04-impartiality-conflicts.md"] },
    },
  },
  {
    id: "power-imbalance",
    title: "One party is dominating the process. How do I intervene?",
    category: "Process",
    triggers: ["One party talks over the other", "One party makes threats", "Economic power disparity", "One party has attorney, other doesn't", "Educational/literacy disparity"],
    decisionTree: [
      { q: "Is the imbalance caused by domestic abuse or coercive control?", yes: "action_dv_protocol", no: 1 },
      { q: "Can the imbalance be addressed through process modifications (caucus, ground rules, support person)?", yes: 2, no: "action_consider_termination" },
      { q: "After modifications, can the disadvantaged party participate meaningfully and make informed decisions?", yes: "action_continue_modified", no: "action_consider_termination" },
    ],
    actions: {
      action_dv_protocol: { label: "Activate DV Protocol", level: "required", text: "This is not a simple power imbalance — it's a safety issue. Switch to the DV screening and safety planning protocol. Do not attempt to 'balance' coercive control through facilitation techniques. Assess whether mediation is appropriate at all.", standard: "2025-V: The mediator shall screen for and address domestic abuse.", refs: ["references/02-domestic-abuse-screening.md", "app/risk-assessment.jsx"] },
      action_continue_modified: { label: "Continue with Modifications", level: "permitted", text: "Implement modifications: (1) Use caucus/separate sessions to equalize voice; (2) Set clear ground rules about interruption and respectful communication; (3) Suggest the disadvantaged party bring an attorney or support person; (4) Allow extra time for the disadvantaged party to consult with counsel; (5) Use reality-testing questions to ensure informed decision-making.", standard: "2025-IV: The mediator shall address barriers to meaningful participation.", refs: ["references/10-barriers-modifications.md", "references/07-session-facilitation.md"] },
      action_consider_termination: { label: "Consider Termination", level: "discretionary", text: "If modifications cannot ensure meaningful participation, the mediator should consider suspending or terminating. A party who cannot participate meaningfully cannot exercise self-determination. Provide referrals to legal aid, attorney representation, or court resources.", standard: "2025-XII: The mediator may terminate if meaningful participation cannot be ensured.", refs: ["references/13-suspension-termination.md", "templates/termination-notice.md"] },
    },
  },
  {
    id: "one-attorney",
    title: "Only one party has an attorney. How do I handle the power disparity?",
    category: "Process",
    triggers: ["Unequal representation", "Self-represented litigant", "Attorney coaching party during session"],
    decisionTree: [
      { q: "Has the unrepresented party been informed of their right to obtain an attorney?", yes: 1, no: "action_inform_rights" },
      { q: "Does the unrepresented party understand the legal implications of the issues being mediated?", yes: 2, no: "action_pause_for_counsel" },
      { q: "Can you ensure the process remains balanced despite the representation disparity?", yes: "action_proceed_balanced", no: "action_pause_for_counsel" },
    ],
    actions: {
      action_inform_rights: { label: "Inform of Rights", level: "required", text: "Before proceeding, inform the unrepresented party: (1) They have the right to consult an attorney at any time; (2) The mediator cannot give legal advice to either party; (3) Any agreement should be reviewed by an attorney before signing; (4) Legal aid resources may be available. Document that this information was provided.", standard: "2025-II(C): The mediator shall consider the impact of unequal representation.", refs: ["references/07-session-facilitation.md", "references/10-barriers-modifications.md"] },
      action_pause_for_counsel: { label: "Pause for Legal Consultation", level: "recommended", text: "Pause the mediation and strongly recommend the unrepresented party consult with an attorney before continuing. Provide legal aid referrals. Do not proceed with substantive negotiations on complex issues (property division, support calculations) until the party has had the opportunity for legal consultation.", standard: "2025-II(B): Parties shall have time to consult with experts and support persons.", refs: ["references/12-agreement-drafting.md"] },
      action_proceed_balanced: { label: "Proceed with Safeguards", level: "permitted", text: "You may proceed with safeguards: (1) Ensure the attorney does not dominate or speak for their client inappropriately; (2) Direct questions to both parties equally; (3) Allow the unrepresented party extra time; (4) Recommend attorney review of any agreement; (5) Check understanding frequently; (6) Consider whether a legal information session would help.", standard: "2025-II: The mediator shall facilitate informed decision-making.", refs: ["references/07-session-facilitation.md"] },
    },
  },
  {
    id: "terminate-vs-suspend",
    title: "Should I suspend or terminate this mediation?",
    category: "Process",
    triggers: ["Impasse", "Bad faith", "Safety concern", "Party unable to participate", "Mediator compromised"],
    decisionTree: [
      { q: "Is there an immediate safety concern (threat, DV escalation, child at risk)?", yes: "action_terminate_safety", no: 1 },
      { q: "Is there a reasonable possibility that the obstacle is temporary and can be resolved?", yes: 2, no: "action_terminate", },
      { q: "Have both parties expressed willingness to return after the obstacle is addressed?", yes: "action_suspend", no: "action_terminate" },
    ],
    actions: {
      action_terminate_safety: { label: "Terminate — Safety", level: "required", text: "Terminate immediately. Safety concerns require ending the process. Provide safety resources and referrals. Do not frame termination as a failure — frame it as protecting the parties and children. Document the safety concern in your confidential notes.", standard: "2025-XII(A): The mediator shall terminate when safety cannot be ensured.", refs: ["templates/termination-notice.md", "references/13-suspension-termination.md"] },
      action_suspend: { label: "Suspend", level: "discretionary", text: "Suspend with a clear plan: (1) Identify what needs to happen before resuming (e.g., complete financial disclosure, consult attorney, attend therapy, cool-off period); (2) Set a target date for reassessment; (3) Document any interim agreements; (4) Remind parties that mediation remains available when they're ready.", standard: "2025-XII(B): The mediator may suspend mediation when continuation is not productive.", refs: ["templates/session-notes.md", "references/13-suspension-termination.md"] },
      action_terminate: { label: "Terminate", level: "discretionary", text: "Terminate the mediation. Provide a termination notice. Offer referrals to other mediators, legal aid, court self-help, and counseling. Remind parties of their right to pursue other resolution processes. Document the reason for termination in your confidential notes. Complete the post-mediation checklist.", standard: "2025-XII(C): The mediator may terminate when mediation is no longer productive or appropriate.", refs: ["templates/termination-notice.md", "templates/post-mediation-checklist.md"] },
    },
  },
];

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

export default function DecisionEngine() {
  const stored = loadFromStorage();
  const [activeDilemma, setActiveDilemma] = useState(null);
  const [answers, setAnswers] = useState(stored?.answers || {});
  const [notes, setNotes] = useState(stored?.notes || {});
  const [history, setHistory] = useState(stored?.history || []);

  useEffect(() => { saveToStorage({ answers, notes, history }); }, [answers, notes, history]);

  const setAnswer = (dilemmaId, stepIdx, val) => {
    const key = `${dilemmaId}-${stepIdx}`;
    setAnswers({ ...answers, [key]: val });
  };
  const getAnswer = (dilemmaId, stepIdx) => answers[`${dilemmaId}-${stepIdx}`];

  const getResult = (dilemma) => {
    let stepIdx = 0;
    while (stepIdx < dilemma.decisionTree.length) {
      const step = dilemma.decisionTree[stepIdx];
      const ans = getAnswer(dilemma.id, stepIdx);
      if (!ans) return null;
      if (ans === "yes") {
        if (typeof step.yes === "string") return dilemma.actions[step.yes];
        stepIdx = step.yes;
      } else {
        if (typeof step.no === "string") return dilemma.actions[step.no];
        stepIdx = step.no;
      }
    }
    return null;
  };

  const getCurrentStep = (dilemma) => {
    let stepIdx = 0;
    while (stepIdx < dilemma.decisionTree.length) {
      const step = dilemma.decisionTree[stepIdx];
      const ans = getAnswer(dilemma.id, stepIdx);
      if (!ans) return stepIdx;
      if (ans === "yes") {
        if (typeof step.yes === "string") return -1;
        stepIdx = step.yes;
      } else {
        if (typeof step.no === "string") return -1;
        stepIdx = step.no;
      }
    }
    return -1;
  };

  const saveToHistory = (dilemma, result) => {
    const entry = { date: new Date().toISOString().slice(0, 10), dilemma: dilemma.title, result: result.label, level: result.level, notes: notes[dilemma.id] || "" };
    setHistory([entry, ...history.slice(0, 49)]);
  };

  const resetDilemma = (id) => {
    const newAnswers = { ...answers };
    Object.keys(newAnswers).filter((k) => k.startsWith(id)).forEach((k) => delete newAnswers[k]);
    setAnswers(newAnswers);
  };

  const exportDecision = (dilemma, result) => {
    const lines = [
      "ETHICAL DECISION DOCUMENTATION", "=".repeat(50),
      `Date: ${new Date().toLocaleDateString()}`,
      `Dilemma: ${dilemma.title}`, `Category: ${dilemma.category}`,
      "", "DECISION PATH:",
    ];
    let stepIdx = 0;
    while (stepIdx < dilemma.decisionTree.length) {
      const step = dilemma.decisionTree[stepIdx];
      const ans = getAnswer(dilemma.id, stepIdx);
      if (!ans) break;
      lines.push(`  Q: ${step.q}`);
      lines.push(`  A: ${ans.toUpperCase()}`);
      if (ans === "yes") { if (typeof step.yes === "string") break; stepIdx = step.yes; }
      else { if (typeof step.no === "string") break; stepIdx = step.no; }
    }
    lines.push("", "RECOMMENDATION:", `  ${result.label} (${result.level})`, `  ${result.text}`, "", `  Standard: ${result.standard}`);
    lines.push("", "REFERENCES:");
    result.refs.forEach((r) => lines.push(`  - ${r}`));
    if (notes[dilemma.id]) lines.push("", "MEDIATOR NOTES:", `  ${notes[dilemma.id]}`);
    lines.push("", "CONFIDENTIAL — Mediator decision-support documentation.");
    downloadFile(lines.join("\n"), `decision-${dilemma.id}-${new Date().toISOString().slice(0, 10)}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };
  const levelColor = { required: "#dc2626", recommended: "#ca8a04", permitted: "#16a34a", discretionary: "#2563eb" };

  // Dilemma detail view
  if (activeDilemma) {
    const dilemma = DILEMMAS.find((d) => d.id === activeDilemma);
    const result = getResult(dilemma);
    const currentStep = getCurrentStep(dilemma);

    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <button onClick={() => setActiveDilemma(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>Back</button>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, color: "#1e293b" }}>{dilemma.title}</h2>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Category: {dilemma.category} | Triggers: {dilemma.triggers.join(", ")}</div>

        {/* Decision tree questions */}
        {dilemma.decisionTree.map((step, idx) => {
          const ans = getAnswer(dilemma.id, idx);
          const isActive = idx === currentStep;
          const isPast = currentStep === -1 || idx < currentStep;
          if (!isPast && !isActive) return null;
          return (
            <div key={idx} style={{ ...cardStyle, borderLeft: isActive ? "4px solid #2563eb" : ans === "yes" ? "4px solid #16a34a" : ans === "no" ? "4px solid #f59e0b" : "4px solid #e2e8f0", opacity: isActive ? 1 : 0.7 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{step.q}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setAnswer(dilemma.id, idx, "yes")} style={{
                  padding: "6px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                  border: ans === "yes" ? "2px solid #16a34a" : "1px solid #cbd5e1",
                  background: ans === "yes" ? "#f0fdf4" : "#fff",
                  color: ans === "yes" ? "#16a34a" : "#64748b", fontWeight: ans === "yes" ? 600 : 400,
                }}>Yes</button>
                <button onClick={() => setAnswer(dilemma.id, idx, "no")} style={{
                  padding: "6px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                  border: ans === "no" ? "2px solid #f59e0b" : "1px solid #cbd5e1",
                  background: ans === "no" ? "#fefce8" : "#fff",
                  color: ans === "no" ? "#ca8a04" : "#64748b", fontWeight: ans === "no" ? 600 : 400,
                }}>No</button>
              </div>
            </div>
          );
        })}

        {/* Result */}
        {result && (
          <div style={{ padding: 20, background: "#fff", borderRadius: 8, border: `2px solid ${levelColor[result.level]}`, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${levelColor[result.level]}15`, color: levelColor[result.level], fontWeight: 600, textTransform: "uppercase" }}>{result.level}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginLeft: 8 }}>{result.label}</span>
              </div>
              <button onClick={() => { exportDecision(dilemma, result); saveToHistory(dilemma, result); }} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 12 }}>Save & Download</button>
            </div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 12 }}>{result.text}</div>
            <div style={{ fontSize: 12, color: "#2563eb", fontStyle: "italic", marginBottom: 8 }}>{result.standard}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              <strong>References:</strong> {result.refs.join(", ")}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: 12 }}>
          <label htmlFor={`note-${dilemma.id}`} style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Your Notes (confidential)</label>
          <textarea id={`note-${dilemma.id}`} value={notes[dilemma.id] || ""} onChange={(e) => setNotes({ ...notes, [dilemma.id]: e.target.value })} placeholder="Document your reasoning and case-specific considerations..." style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 60, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <button onClick={() => resetDilemma(dilemma.id)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>Reset This Decision</button>
      </div>
    );
  }

  // Dilemma list
  const categories = [...new Set(DILEMMAS.map((d) => d.category))];
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Ethical Decision Engine</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Standards-based decision trees for common ethical dilemmas. Answer questions, get a recommendation with citations.</p>

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{cat}</h3>
          {DILEMMAS.filter((d) => d.category === cat).map((d) => {
            const result = getResult(d);
            return (
              <button key={d.id} onClick={() => setActiveDilemma(d.id)} style={{
                display: "block", width: "100%", textAlign: "left", padding: "12px 16px", marginBottom: 6,
                background: result ? "#f0fdf4" : "#fff", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{d.title}</div>
                  {result && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${levelColor[result.level]}15`, color: levelColor[result.level], fontWeight: 600 }}>{result.label}</span>}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.triggers.join(" · ")}</div>
              </button>
            );
          })}
        </div>
      ))}

      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Decision History</h3>
          {history.slice(0, 10).map((h, i) => (
            <div key={i} style={{ fontSize: 12, color: "#475569", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
              {h.date} — {h.dilemma} — <span style={{ fontWeight: 600, color: levelColor[h.level] }}>{h.result}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
