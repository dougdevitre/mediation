import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-party-prep";

const STEPS = [
  { id: "learn", label: "What to Expect" },
  { id: "issues", label: "Your Issues" },
  { id: "priorities", label: "Priorities" },
  { id: "children", label: "Children's Needs" },
  { id: "documents", label: "Documents" },
  { id: "questions", label: "Your Questions" },
  { id: "summary", label: "Summary" },
];

const ISSUES = [
  { id: "parenting", label: "Parenting plan / custody / visitation", category: "Children" },
  { id: "child_support", label: "Child support", category: "Children" },
  { id: "spousal_support", label: "Spousal support / alimony", category: "Financial" },
  { id: "property", label: "Property division", category: "Financial" },
  { id: "debt", label: "Debt allocation", category: "Financial" },
  { id: "retirement", label: "Retirement / pension division", category: "Financial" },
  { id: "insurance", label: "Insurance (health, life)", category: "Financial" },
  { id: "tax", label: "Tax considerations", category: "Financial" },
  { id: "pet", label: "Pet custody / arrangements", category: "Other" },
  { id: "relocation", label: "Relocation", category: "Other" },
  { id: "communication", label: "Communication between parents", category: "Other" },
  { id: "business", label: "Family business division", category: "Financial" },
  { id: "name_change", label: "Name change", category: "Other" },
];

const DOCUMENTS = [
  { id: "income_docs", label: "Recent pay stubs (last 3 months)", category: "Income", forIssues: ["child_support", "spousal_support", "property"] },
  { id: "tax_returns", label: "Tax returns (last 2-3 years)", category: "Income", forIssues: ["child_support", "spousal_support", "property", "tax"] },
  { id: "bank_statements", label: "Bank statements (last 3 months, all accounts)", category: "Assets", forIssues: ["property", "debt"] },
  { id: "retirement_statements", label: "Retirement / pension account statements", category: "Assets", forIssues: ["retirement", "property"] },
  { id: "property_docs", label: "Property deeds, mortgage statements, appraisals", category: "Assets", forIssues: ["property"] },
  { id: "vehicle_docs", label: "Vehicle titles and loan statements", category: "Assets", forIssues: ["property", "debt"] },
  { id: "debt_statements", label: "Credit card and loan statements", category: "Debts", forIssues: ["debt", "property"] },
  { id: "insurance_policies", label: "Insurance policies (health, life, auto, home)", category: "Insurance", forIssues: ["insurance"] },
  { id: "business_docs", label: "Business financial statements / tax returns", category: "Business", forIssues: ["business", "property"] },
  { id: "existing_orders", label: "Existing court orders (custody, support, protection)", category: "Legal", forIssues: [] },
  { id: "prenup", label: "Prenuptial or postnuptial agreement", category: "Legal", forIssues: ["property", "spousal_support"] },
  { id: "children_records", label: "Children's school, medical, therapy records", category: "Children", forIssues: ["parenting"] },
  { id: "expenses_list", label: "Monthly expense worksheet (see below)", category: "Budget", forIssues: ["child_support", "spousal_support"] },
  { id: "calendar", label: "Current parenting schedule / calendar", category: "Children", forIssues: ["parenting", "communication"] },
  { id: "benefits", label: "Employee benefits summary", category: "Income", forIssues: ["insurance", "retirement"] },
];

const CHILDREN_QUESTIONS = [
  { id: "school", label: "What school or childcare arrangements work best for each child?" },
  { id: "activities", label: "What activities, sports, or hobbies are important to each child?" },
  { id: "medical", label: "Do any children have medical, therapeutic, or special education needs?" },
  { id: "routine", label: "What daily routines matter most to your children (bedtime, meals, homework)?" },
  { id: "relationships", label: "What relationships are important to your children (grandparents, friends, pets)?" },
  { id: "concerns", label: "Do you have any safety concerns about your children?" },
  { id: "transitions", label: "How do your children handle transitions between homes?" },
  { id: "wishes", label: "Have your children expressed preferences about their schedule?" },
];

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
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

export default function MediationPrep() {
  const stored = loadFromStorage();
  const [step, setStep] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState(new Set(stored?.selectedIssues || []));
  const [priorities, setPriorities] = useState(stored?.priorities || {});
  const [childrenNotes, setChildrenNotes] = useState(stored?.childrenNotes || {});
  const [checkedDocs, setCheckedDocs] = useState(new Set(stored?.checkedDocs || []));
  const [questions, setQuestions] = useState(stored?.questions || "");
  const [numChildren, setNumChildren] = useState(stored?.numChildren || 0);

  useEffect(() => {
    saveToStorage({
      selectedIssues: [...selectedIssues],
      priorities,
      childrenNotes,
      checkedDocs: [...checkedDocs],
      questions,
      numChildren,
    });
  }, [selectedIssues, priorities, childrenNotes, checkedDocs, questions, numChildren]);

  const toggleIssue = (id) => {
    const next = new Set(selectedIssues);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIssues(next);
  };

  const toggleDoc = (id) => {
    const next = new Set(checkedDocs);
    next.has(id) ? next.delete(id) : next.add(id);
    setCheckedDocs(next);
  };

  const setPriority = (issueId, level) => {
    setPriorities({ ...priorities, [issueId]: level });
  };

  const hasChildIssues = selectedIssues.has("parenting") || selectedIssues.has("child_support") || selectedIssues.has("communication");

  const relevantDocs = DOCUMENTS.filter(
    (d) => d.forIssues.length === 0 || d.forIssues.some((i) => selectedIssues.has(i))
  );

  const exportPrep = () => {
    const lines = [
      "MY MEDIATION PREPARATION SUMMARY",
      "=".repeat(50),
      "Generated: " + new Date().toLocaleDateString(),
      "",
      "ISSUES TO ADDRESS:",
      "-".repeat(30),
    ];
    const issueList = ISSUES.filter((i) => selectedIssues.has(i.id));
    issueList.forEach((i) => {
      const p = priorities[i.id];
      lines.push("  [x] " + i.label + (p ? " — Priority: " + p : ""));
    });

    if (hasChildIssues && numChildren > 0) {
      lines.push("");
      lines.push("CHILDREN'S NEEDS NOTES:");
      lines.push("-".repeat(30));
      CHILDREN_QUESTIONS.forEach((q) => {
        if (childrenNotes[q.id]) {
          lines.push("  Q: " + q.label);
          lines.push("  A: " + childrenNotes[q.id]);
          lines.push("");
        }
      });
    }

    lines.push("");
    lines.push("DOCUMENTS TO BRING:");
    lines.push("-".repeat(30));
    relevantDocs.forEach((d) => {
      lines.push("  [" + (checkedDocs.has(d.id) ? "x" : " ") + "] " + d.label);
    });

    if (questions.trim()) {
      lines.push("");
      lines.push("MY QUESTIONS FOR THE MEDIATOR:");
      lines.push("-".repeat(30));
      lines.push("  " + questions.trim());
    }

    lines.push("");
    lines.push("NOTE: This is your personal preparation document.");
    lines.push("You do not need to share this with anyone — it's to help you arrive prepared.");
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(lines.join("\n"), "mediation-preparation-" + date + ".txt");
  };

  const clearAll = () => {
    setSelectedIssues(new Set());
    setPriorities({});
    setChildrenNotes({});
    setCheckedDocs(new Set());
    setQuestions("");
    setNumChildren(0);
    setStep(0);
  };

  const cardStyle = { padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };
  const btnPrimary = { padding: "8px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 };
  const btnSecondary = { padding: "8px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Prepare for Your Mediation</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>This tool helps you get ready so you can make the most of your mediation time.</p>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {STEPS.filter((s) => !(s.id === "children" && !hasChildIssues)).map((s) => {
          const i = STEPS.indexOf(s);
          return (
            <button key={s.id} onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined} style={{
              padding: "4px 12px", borderRadius: 12, fontSize: 12, cursor: "pointer",
              border: step === i ? "2px solid #2563eb" : "1px solid #e2e8f0",
              background: step === i ? "#dbeafe" : "#fff",
              color: step === i ? "#1e40af" : "#64748b",
              fontWeight: step === i ? 600 : 400,
            }}>{s.label}</button>
          );
        })}
      </div>

      {/* Step 0: What to Expect */}
      {step === 0 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>What Is Mediation?</h3>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 8px" }}>Mediation is a <strong>voluntary</strong> process where a neutral mediator helps you and the other party communicate and reach your own agreements. The mediator does not take sides, give legal advice, or make decisions for you.</p>
              <p style={{ margin: "0 0 8px" }}>You can save significant time and money by arriving prepared. This tool will walk you through the key steps.</p>
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>What to Know Before You Start</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#334155", lineHeight: 1.8 }}>
              <li><strong>It's voluntary</strong> — you can leave at any time and are never forced to agree to anything</li>
              <li><strong>It's confidential</strong> — what's said in mediation generally stays in mediation (with limited exceptions like child safety)</li>
              <li><strong>The mediator is neutral</strong> — they won't tell you what to do or take sides</li>
              <li><strong>You should consult an attorney</strong> — the mediator cannot give you legal advice; have a lawyer review any agreement</li>
              <li><strong>Come with an open mind</strong> — be willing to listen and explore options</li>
              <li><strong>Bring your documents</strong> — this tool will tell you exactly what to gather</li>
            </ul>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>Typical Session Flow</h3>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#334155", lineHeight: 1.8 }}>
              <li><strong>Opening</strong> — mediator explains the process, ground rules, and confidentiality</li>
              <li><strong>Each party shares their perspective</strong> — uninterrupted time to explain what matters to you</li>
              <li><strong>Issue identification</strong> — together, identify what needs to be resolved</li>
              <li><strong>Exploring options</strong> — brainstorm solutions that could work for everyone</li>
              <li><strong>Negotiation</strong> — work through details and reach agreements</li>
              <li><strong>Next steps</strong> — summarize what was agreed, what's left, and schedule follow-up</li>
            </ol>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setStep(1)} style={btnPrimary}>Next: Identify Your Issues</button>
          </div>
        </div>
      )}

      {/* Step 1: Issues */}
      {step === 1 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>What issues do you need to resolve?</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Check everything that applies. This helps you and your mediator focus on what matters.</p>
            {["Children", "Financial", "Other"].map((cat) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>{cat}</div>
                {ISSUES.filter((i) => i.category === cat).map((issue) => (
                  <label key={issue.id} htmlFor={"issue-" + issue.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer" }}>
                    <input id={"issue-" + issue.id} type="checkbox" checked={selectedIssues.has(issue.id)} onChange={() => toggleIssue(issue.id)} style={{ accentColor: "#2563eb" }} />
                    <span style={{ fontSize: 14, color: "#1e293b" }}>{issue.label}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          {hasChildIssues && (
            <div style={cardStyle}>
              <label htmlFor="num-children" style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>How many children are involved?</label>
              <input id="num-children" type="number" min="0" max="20" value={numChildren} onChange={(e) => setNumChildren(parseInt(e.target.value) || 0)} style={{ marginLeft: 8, padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 6, width: 60, fontSize: 14 }} />
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(0)} style={btnSecondary}>Back</button>
            <button onClick={() => setStep(2)} disabled={selectedIssues.size === 0} style={{ ...btnPrimary, background: selectedIssues.size > 0 ? "#2563eb" : "#94a3b8", cursor: selectedIssues.size > 0 ? "pointer" : "default" }}>Next: Set Priorities</button>
          </div>
        </div>
      )}

      {/* Step 2: Priorities */}
      {step === 2 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>How important is each issue to you?</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Knowing your priorities helps you focus on what matters most and find compromises on less critical items.</p>
            {ISSUES.filter((i) => selectedIssues.has(i.id)).map((issue) => (
              <div key={issue.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", marginBottom: 4 }}>{issue.label}</div>
                <div style={{ display: "flex", gap: 6 }} role="radiogroup" aria-label={"Priority for " + issue.label}>
                  {[
                    ["must-have", "Must-Have", "#dc2626"],
                    ["important", "Important", "#ca8a04"],
                    ["flexible", "Flexible", "#16a34a"],
                  ].map(([val, label, color]) => (
                    <button key={val} onClick={() => setPriority(issue.id, val)} role="radio" aria-checked={priorities[issue.id] === val} style={{
                      padding: "3px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                      border: priorities[issue.id] === val ? "2px solid " + color : "1px solid #cbd5e1",
                      background: priorities[issue.id] === val ? color + "15" : "#fff",
                      color: priorities[issue.id] === val ? color : "#64748b",
                      fontWeight: priorities[issue.id] === val ? 600 : 400,
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 10, background: "#eff6ff", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#1e40af" }}>
            Tip: Knowing where you're flexible helps you negotiate effectively. Most successful mediations involve some give-and-take.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} style={btnSecondary}>Back</button>
            <button onClick={() => setStep(hasChildIssues ? 3 : 4)} style={btnPrimary}>Next: {hasChildIssues ? "Children's Needs" : "Documents"}</button>
          </div>
        </div>
      )}

      {/* Step 3: Children */}
      {step === 3 && hasChildIssues && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Think About Your Children's Needs</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Reflecting on these questions before mediation helps you advocate for your children's best interests.</p>
            {CHILDREN_QUESTIONS.map((q) => (
              <div key={q.id} style={{ marginBottom: 12 }}>
                <label htmlFor={"child-" + q.id} style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#1e293b", marginBottom: 4 }}>{q.label}</label>
                <textarea id={"child-" + q.id} value={childrenNotes[q.id] || ""} onChange={(e) => setChildrenNotes({ ...childrenNotes, [q.id]: e.target.value })} placeholder="Your thoughts..." style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 50, fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ padding: 10, background: "#f0fdf4", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#166534" }}>
            Remember: Mediation focuses on your children's needs, not on "winning." The goal is a plan that works for your family.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>Back</button>
            <button onClick={() => setStep(4)} style={btnPrimary}>Next: Documents to Gather</button>
          </div>
        </div>
      )}

      {/* Step 4: Documents */}
      {step === 4 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Documents to Gather</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Based on your issues, here's what to bring. Check off items as you gather them. Missing documents are the #1 reason sessions run long.</p>
            {relevantDocs.length === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>Go back and select your issues to see relevant documents.</p>}
            {["Legal", "Income", "Assets", "Debts", "Insurance", "Business", "Budget", "Children"].filter((cat) => relevantDocs.some((d) => d.category === cat)).map((cat) => {
              const docs = relevantDocs.filter((d) => d.category === cat);
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{cat}</div>
                  {docs.map((d) => (
                    <label key={d.id} htmlFor={"doc-" + d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer" }}>
                      <input id={"doc-" + d.id} type="checkbox" checked={checkedDocs.has(d.id)} onChange={() => toggleDoc(d.id)} style={{ accentColor: "#16a34a" }} />
                      <span style={{ fontSize: 14, color: checkedDocs.has(d.id) ? "#166534" : "#1e293b", textDecoration: checkedDocs.has(d.id) ? "line-through" : "none" }}>{d.label}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }} role="status">
            <span style={{ fontSize: 13, color: "#475569" }}>{checkedDocs.size}/{relevantDocs.length} documents gathered</span>
            <div style={{ height: 6, flex: 1, marginLeft: 12, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: relevantDocs.length > 0 ? (checkedDocs.size / relevantDocs.length * 100) + "%" : "0%", background: "#16a34a", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(hasChildIssues ? 3 : 2)} style={btnSecondary}>Back</button>
            <button onClick={() => setStep(5)} style={btnPrimary}>Next: Your Questions</button>
          </div>
        </div>
      )}

      {/* Step 5: Questions */}
      {step === 5 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Questions for Your Mediator</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Write down anything you want to ask or clarify before or during mediation. No question is too small.</p>
            <textarea value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder={"Examples:\n- How long will mediation take?\n- Can I bring my attorney?\n- What if we can't agree on something?\n- How is the parenting schedule enforced?\n- What happens after we reach an agreement?"} aria-label="Your questions for the mediator" style={{ width: "100%", padding: 12, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, resize: "vertical", minHeight: 150, fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(4)} style={btnSecondary}>Back</button>
            <button onClick={() => setStep(6)} style={btnPrimary}>View Summary</button>
          </div>
        </div>
      )}

      {/* Step 6: Summary */}
      {step === 6 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Your Preparation Summary</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={exportPrep} style={{ ...btnPrimary, background: "#16a34a" }} aria-label="Download preparation summary">Download</button>
              <button onClick={clearAll} style={{ ...btnSecondary, fontSize: 12 }}>Start Over</button>
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Issues & Priorities</h4>
            {ISSUES.filter((i) => selectedIssues.has(i.id)).map((i) => {
              const p = priorities[i.id];
              const pColor = p === "must-have" ? "#dc2626" : p === "important" ? "#ca8a04" : p === "flexible" ? "#16a34a" : "#94a3b8";
              return (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 14 }}>
                  <span style={{ color: "#1e293b" }}>{i.label}</span>
                  {p && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: pColor + "15", color: pColor, fontWeight: 600 }}>{p}</span>}
                </div>
              );
            })}
            {selectedIssues.size === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No issues selected.</p>}
          </div>

          {hasChildIssues && Object.values(childrenNotes).some((v) => v) && (
            <div style={cardStyle}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Children's Needs Notes</h4>
              {CHILDREN_QUESTIONS.filter((q) => childrenNotes[q.id]).map((q) => (
                <div key={q.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{q.label}</div>
                  <div style={{ fontSize: 14, color: "#1e293b" }}>{childrenNotes[q.id]}</div>
                </div>
              ))}
            </div>
          )}

          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Document Checklist ({checkedDocs.size}/{relevantDocs.length} gathered)</h4>
            {relevantDocs.map((d) => (
              <div key={d.id} style={{ fontSize: 13, padding: "2px 0", color: checkedDocs.has(d.id) ? "#166534" : "#dc2626" }}>
                {checkedDocs.has(d.id) ? "[x]" : "[ ]"} {d.label}
              </div>
            ))}
          </div>

          {questions.trim() && (
            <div style={cardStyle}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Your Questions</h4>
              <div style={{ fontSize: 14, color: "#1e293b", whiteSpace: "pre-wrap" }}>{questions}</div>
            </div>
          )}

          <div style={{ padding: 12, background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1e40af" }}>
            Download this summary and bring it to your first session. You do not need to share it with anyone — it's for your own preparation.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 16 }}>
            <button onClick={() => setStep(5)} style={btnSecondary}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
