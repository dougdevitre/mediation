import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-agreement-gen";

const SECTIONS = [
  { id: "parties", label: "Parties & Case Info", required: true },
  { id: "parenting", label: "Parenting Plan", required: false },
  { id: "child_support", label: "Child Support", required: false },
  { id: "spousal_support", label: "Spousal Support", required: false },
  { id: "property", label: "Property Division", required: false },
  { id: "debt", label: "Debt Allocation", required: false },
  { id: "insurance", label: "Insurance", required: false },
  { id: "dispute", label: "Dispute Resolution", required: true },
  { id: "general", label: "General Provisions", required: true },
];

const PARENTING_OPTIONS = [
  { id: "schedule_alt", label: "Alternating Weeks", text: "The children shall reside with {parentA} during odd-numbered weeks and with {parentB} during even-numbered weeks, with transitions on {transitionDay} at {transitionTime}." },
  { id: "schedule_223", label: "2-2-3 Rotation", text: "The children shall reside with {parentA} on Monday and Tuesday, with {parentB} on Wednesday and Thursday, and alternate weekends (Friday through Sunday) between parents." },
  { id: "schedule_primary", label: "Primary Residence with Visitation", text: "The children shall primarily reside with {parentA}. {parentB} shall have parenting time every other weekend from Friday at {transitionTime} to Sunday at {transitionTime}, and one midweek overnight on {midweekDay}." },
  { id: "holiday_alternate", label: "Alternating Holidays", text: "In even-numbered years, {parentA} shall have the children for Thanksgiving, Christmas Eve, and Spring Break. {parentB} shall have them for Christmas Day, New Year's, and Winter Break. In odd-numbered years, the assignments shall reverse." },
  { id: "decision_joint", label: "Joint Decision-Making", text: "The parties shall share joint legal custody and make major decisions together regarding the children's education, non-emergency healthcare, mental health treatment, religious upbringing, and extracurricular activities." },
  { id: "decision_sole", label: "Sole Decision-Making", text: "{parentA} shall have sole legal custody and final decision-making authority regarding the children's education, healthcare, and activities. {parentA} shall consult with {parentB} before making major decisions." },
  { id: "comm_app", label: "Co-Parenting App Required", text: "All non-emergency communication between the parties regarding the children shall be conducted through {coparentApp}. Each party shall respond within 24 hours. Emergency communications may be made by phone." },
  { id: "comm_no_neg", label: "No Disparagement", text: "Neither party shall make negative, derogatory, or disparaging remarks about the other party or the other party's family in the presence of the children." },
  { id: "rofr", label: "Right of First Refusal", text: "If either parent will be absent from the children for more than {rofrHours} consecutive hours during their parenting time, that parent shall first offer the other parent the opportunity to care for the children." },
  { id: "travel", label: "Travel Notification", text: "Each party shall provide {travelNotice} days' written notice before traveling with the children domestically. International travel requires written consent of both parties and {intlNotice} days' notice." },
];

const FINANCIAL_OPTIONS = {
  child_support: [
    { id: "cs_guideline", label: "Guideline Amount", text: "{payor} shall pay child support to {payee} of ${csAmount} per month, calculated pursuant to {state} child support guidelines. Payment due by the {csDay} of each month." },
    { id: "cs_expenses", label: "Shared Expenses", text: "In addition to base child support, the parties shall share: (a) unreimbursed medical expenses — {parentA} {medSplitA}% / {parentB} {medSplitB}%; (b) childcare costs — {parentA} {careSplitA}% / {parentB} {careSplitB}%; (c) extracurricular activities mutually agreed upon — {parentA} {actSplitA}% / {parentB} {actSplitB}%." },
  ],
  spousal_support: [
    { id: "ss_rehab", label: "Rehabilitative", text: "{payor} shall pay {payee} rehabilitative spousal support of ${ssAmount} per month for {ssDuration}, beginning {ssStart}. This support shall terminate on {ssEnd} and shall not be extended." },
    { id: "ss_indef", label: "Indefinite", text: "{payor} shall pay {payee} spousal support of ${ssAmount} per month, continuing until the earliest of: (a) death of either party; (b) remarriage of {payee}; (c) cohabitation of {payee} with an unrelated adult for 6+ months; or (d) further court order." },
  ],
  property: [
    { id: "prop_home_sale", label: "Home — Sale & Split", text: "The marital residence at {homeAddress} shall be listed for sale within {listDays} days. Net proceeds shall be divided {parentA} {homeSplitA}% / {parentB} {homeSplitB}%." },
    { id: "prop_home_buyout", label: "Home — Buyout", text: "{parentA} shall retain the marital residence and pay {parentB} ${buyoutAmount} representing {parentB}'s equity interest. {parentA} shall refinance within {refiDays} days." },
    { id: "prop_retirement", label: "Retirement — QDRO", text: "{parentA}'s {retirementType} shall be divided by QDRO. {parentB} shall receive {retirementPct}% of the marital portion (from {marriageDate} to {separationDate}). Parties shall share QDRO preparation costs equally." },
    { id: "prop_vehicles", label: "Vehicle Assignment", text: "{parentA} shall retain the {vehicleA} and be solely responsible for associated payments and insurance. {parentB} shall retain the {vehicleB} under the same terms." },
  ],
  debt: [
    { id: "debt_assign", label: "Debt Assignment", text: "{parentA} shall be responsible for: {debtsA}. {parentB} shall be responsible for: {debtsB}. Each party shall indemnify and hold the other harmless from any liability on debts assigned to them." },
  ],
  insurance: [
    { id: "ins_children", label: "Children's Health Insurance", text: "{parentA} shall maintain health insurance for the children through {insuranceSource}. If employer-provided coverage becomes unavailable, the parties shall share the cost of replacement coverage {parentA} {insSplitA}% / {parentB} {insSplitB}%." },
    { id: "ins_life", label: "Life Insurance", text: "Each party shall maintain life insurance of at least ${lifeInsAmount} naming the children as beneficiaries until the youngest child reaches age {lifeInsAge}." },
  ],
};

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

function fillTemplate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (match, key) => vars[key] || `[${key.toUpperCase()}]`);
}

export default function AgreementGenerator() {
  const stored = loadFromStorage();
  const [step, setStep] = useState(0);
  const [activeSections, setActiveSections] = useState(new Set(stored?.activeSections || ["parties", "dispute", "general"]));
  const [vars, setVars] = useState(stored?.vars || {});
  const [selectedClauses, setSelectedClauses] = useState(new Set(stored?.selectedClauses || []));
  const [customClauses, setCustomClauses] = useState(stored?.customClauses || {});

  useEffect(() => {
    saveToStorage({ activeSections: [...activeSections], vars, selectedClauses: [...selectedClauses], customClauses });
  }, [activeSections, vars, selectedClauses, customClauses]);

  const setVar = (key, val) => setVars({ ...vars, [key]: val });
  const toggleSection = (id) => { const n = new Set(activeSections); n.has(id) ? n.delete(id) : n.add(id); setActiveSections(n); };
  const toggleClause = (id) => { const n = new Set(selectedClauses); n.has(id) ? n.delete(id) : n.add(id); setSelectedClauses(n); };

  const clearAll = () => { setStep(0); setActiveSections(new Set(["parties", "dispute", "general"])); setVars({}); setSelectedClauses(new Set()); setCustomClauses({}); };

  const generateAgreement = () => {
    const lines = [];
    lines.push("MEDIATION SETTLEMENT AGREEMENT");
    lines.push("=".repeat(50));
    lines.push("");
    lines.push(`PARTIES: ${vars.parentA || "[PARENT A]"} and ${vars.parentB || "[PARENT B]"}`);
    lines.push(`DATE: ${vars.agreementDate || new Date().toLocaleDateString()}`);
    lines.push(`CASE NUMBER: ${vars.caseNumber || "[CASE NUMBER]"}`);
    lines.push(`STATE: ${vars.state || "[STATE]"}`);
    lines.push("");
    lines.push("The parties participated in voluntary mediation and reached the following agreements. Each party confirms they entered into this agreement voluntarily, without coercion, and with full knowledge of the relevant facts.");
    lines.push("");

    if (activeSections.has("parenting")) {
      lines.push("", "PARENTING PLAN", "-".repeat(40));
      if (vars.childrenNames) lines.push(`Children: ${vars.childrenNames}`);
      PARENTING_OPTIONS.filter((c) => selectedClauses.has(c.id)).forEach((c) => {
        lines.push("", fillTemplate(c.text, vars));
      });
      if (customClauses.parenting) lines.push("", customClauses.parenting);
    }

    if (activeSections.has("child_support")) {
      lines.push("", "CHILD SUPPORT", "-".repeat(40));
      FINANCIAL_OPTIONS.child_support.filter((c) => selectedClauses.has(c.id)).forEach((c) => {
        lines.push("", fillTemplate(c.text, vars));
      });
      if (customClauses.child_support) lines.push("", customClauses.child_support);
    }

    if (activeSections.has("spousal_support")) {
      lines.push("", "SPOUSAL SUPPORT", "-".repeat(40));
      FINANCIAL_OPTIONS.spousal_support.filter((c) => selectedClauses.has(c.id)).forEach((c) => {
        lines.push("", fillTemplate(c.text, vars));
      });
      if (customClauses.spousal_support) lines.push("", customClauses.spousal_support);
    }

    if (activeSections.has("property")) {
      lines.push("", "PROPERTY DIVISION", "-".repeat(40));
      FINANCIAL_OPTIONS.property.filter((c) => selectedClauses.has(c.id)).forEach((c) => {
        lines.push("", fillTemplate(c.text, vars));
      });
      if (customClauses.property) lines.push("", customClauses.property);
    }

    if (activeSections.has("debt")) {
      lines.push("", "DEBT ALLOCATION", "-".repeat(40));
      FINANCIAL_OPTIONS.debt.filter((c) => selectedClauses.has(c.id)).forEach((c) => {
        lines.push("", fillTemplate(c.text, vars));
      });
      if (customClauses.debt) lines.push("", customClauses.debt);
    }

    if (activeSections.has("insurance")) {
      lines.push("", "INSURANCE", "-".repeat(40));
      FINANCIAL_OPTIONS.insurance.filter((c) => selectedClauses.has(c.id)).forEach((c) => {
        lines.push("", fillTemplate(c.text, vars));
      });
      if (customClauses.insurance) lines.push("", customClauses.insurance);
    }

    lines.push("", "DISPUTE RESOLUTION", "-".repeat(40));
    lines.push("If a dispute arises regarding this agreement, the parties shall: (1) attempt direct communication; (2) return to mediation; (3) if mediation is unsuccessful, either party may seek court resolution.");
    if (customClauses.dispute) lines.push("", customClauses.dispute);

    lines.push("", "GENERAL PROVISIONS", "-".repeat(40));
    lines.push("This document represents the full agreement between the parties on the matters addressed.");
    lines.push("This agreement may only be modified in writing, signed by both parties.");
    lines.push(`This agreement shall be governed by the laws of the State of ${vars.state || "[STATE]"}.`);
    lines.push("Each party has had the opportunity to consult with independent legal counsel.");
    if (customClauses.general) lines.push("", customClauses.general);

    lines.push("", "", "SIGNATURES", "-".repeat(40));
    lines.push(`${vars.parentA || "[PARENT A]"}: _______________ Date: _______________`);
    lines.push(`${vars.parentB || "[PARENT B]"}: _______________ Date: _______________`);
    lines.push("Mediator (witness): _______________ Date: _______________");
    lines.push("", "DISCLAIMER: This draft was generated for mediation purposes. Each party should");
    lines.push("have this agreement reviewed by independent legal counsel before signing.");

    return lines.join("\n");
  };

  const handleDownload = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(generateAgreement(), `draft-agreement-${date}.txt`);
  };

  const cardStyle = { padding: 16, marginBottom: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };
  const inputStyle = { width: "100%", padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };

  // Step 0: Case setup
  if (step === 0) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Agreement Generator</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Build a complete draft agreement from selected clauses. Variables auto-fill throughout.</p>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#0f172a" }}>Case Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["parentA", "Parent A Name"], ["parentB", "Parent B Name"],
              ["caseNumber", "Case Number"], ["state", "State"],
              ["agreementDate", "Agreement Date"], ["childrenNames", "Children (names & ages)"],
            ].map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`var-${key}`} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>{label}</label>
                <input id={`var-${key}`} value={vars[key] || ""} onChange={(e) => setVar(key, e.target.value)} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>What does this agreement cover?</h3>
          {SECTIONS.map((s) => (
            <label key={s.id} htmlFor={`sec-${s.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: s.required ? "default" : "pointer", opacity: s.required ? 0.7 : 1 }}>
              <input id={`sec-${s.id}`} type="checkbox" checked={activeSections.has(s.id)} onChange={() => !s.required && toggleSection(s.id)} disabled={s.required} style={{ accentColor: "#2563eb" }} />
              <span style={{ fontSize: 14, color: "#1e293b" }}>{s.label} {s.required && <span style={{ fontSize: 11, color: "#94a3b8" }}>(always included)</span>}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep(1)} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }}>Next: Select Clauses</button>
          <button onClick={clearAll} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b" }}>Clear All</button>
        </div>
      </div>
    );
  }

  // Step 1: Select clauses and fill variables
  if (step === 1) {
    const allOptions = [];
    if (activeSections.has("parenting")) allOptions.push({ section: "Parenting Plan", options: PARENTING_OPTIONS });
    if (activeSections.has("child_support")) allOptions.push({ section: "Child Support", options: FINANCIAL_OPTIONS.child_support });
    if (activeSections.has("spousal_support")) allOptions.push({ section: "Spousal Support", options: FINANCIAL_OPTIONS.spousal_support });
    if (activeSections.has("property")) allOptions.push({ section: "Property Division", options: FINANCIAL_OPTIONS.property });
    if (activeSections.has("debt")) allOptions.push({ section: "Debt Allocation", options: FINANCIAL_OPTIONS.debt });
    if (activeSections.has("insurance")) allOptions.push({ section: "Insurance", options: FINANCIAL_OPTIONS.insurance });

    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Select Clauses & Fill Details</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Check the clauses to include. Fill in bracketed values as you go.</p>

        {allOptions.map((group) => (
          <div key={group.section} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, color: "#0f172a", marginBottom: 8 }}>{group.section}</h3>
            {group.options.map((opt) => {
              const selected = selectedClauses.has(opt.id);
              const preview = fillTemplate(opt.text, vars);
              const blanks = [...new Set((opt.text.match(/\{(\w+)\}/g) || []).map((m) => m.slice(1, -1)))].filter((k) => !vars[k]);
              return (
                <div key={opt.id} style={{ ...cardStyle, borderLeft: selected ? "4px solid #2563eb" : "4px solid transparent" }}>
                  <label htmlFor={`clause-${opt.id}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                    <input id={`clause-${opt.id}`} type="checkbox" checked={selected} onChange={() => toggleClause(opt.id)} style={{ marginTop: 3, accentColor: "#2563eb" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{preview}</div>
                    </div>
                  </label>
                  {selected && blanks.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {blanks.map((key) => (
                        <div key={key}>
                          <label htmlFor={`var-${key}`} style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 1 }}>{key.replace(/_/g, " ")}</label>
                          <input id={`var-${key}`} value={vars[key] || ""} onChange={(e) => setVar(key, e.target.value)} placeholder={key} style={{ ...inputStyle, fontSize: 12 }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ marginBottom: 8 }}>
              <label htmlFor={`custom-${group.section}`} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>Additional {group.section} provisions (optional)</label>
              <textarea id={`custom-${group.section}`} value={customClauses[group.section.toLowerCase().replace(/ /g, "_")] || ""} onChange={(e) => setCustomClauses({ ...customClauses, [group.section.toLowerCase().replace(/ /g, "_")]: e.target.value })} placeholder="Add custom language..." style={{ ...inputStyle, minHeight: 50, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep(0)} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>Back</button>
          <button onClick={() => setStep(2)} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }}>Preview Agreement</button>
        </div>
      </div>
    );
  }

  // Step 2: Preview & Download
  const agreement = generateAgreement();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Draft Agreement Preview</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep(1)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>Edit</button>
          <button onClick={() => { navigator.clipboard.writeText(agreement); }} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }}>Copy</button>
          <button onClick={handleDownload} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13 }}>Download</button>
        </div>
      </div>
      <pre style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "inherit", overflow: "auto" }}>{agreement}</pre>
      <div style={{ marginTop: 12, padding: 10, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This is a draft generated for mediation purposes. Items shown as [BRACKETS] still need values. Each party should have this agreement reviewed by independent legal counsel before signing.
      </div>
    </div>
  );
}
