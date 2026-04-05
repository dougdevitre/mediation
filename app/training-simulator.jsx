import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-training-sim";

const CATEGORIES = [
  { id: "Safety", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { id: "Ethics", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { id: "Process", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { id: "Children", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
  { id: "Financial", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
];

const SCENARIOS = [
  {
    id: 1, category: "Safety",
    situation: "During a joint mediation session, one party discloses that the other party has been physically abusive. The accused party becomes visibly agitated.",
    options: [
      { text: "Immediately separate the parties, suspend the joint session, and conduct individual safety screening before deciding whether mediation can continue.", grade: "correct" },
      { text: "Ask the disclosing party to elaborate on the abuse allegations so you can assess severity.", grade: "incorrect" },
      { text: "Acknowledge the disclosure and suggest the parties take a break to calm down before continuing the joint session.", grade: "partial" },
      { text: "Remind both parties that mediation is voluntary and ask if they want to continue.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-V(A) requires mediators to screen for domestic abuse and, upon disclosure, immediately ensure party safety. Joint sessions must be suspended and individual caucuses conducted to assess whether mediation is appropriate or safe to continue.",
    whatNotToDo: "Never ask a party to elaborate on abuse in front of the alleged abuser -- this creates immediate danger. Do not simply take a break and resume jointly, as the power dynamic has been fundamentally altered and safety is at risk.",
  },
  {
    id: 2, category: "Ethics",
    situation: "One party pulls you aside during a break and says, 'You're the expert here. Just tell us what's fair -- I'll agree to whatever you recommend.'",
    options: [
      { text: "Provide your professional recommendation since the party is asking for guidance.", grade: "incorrect" },
      { text: "Explain that as a mediator you cannot make recommendations or decisions, and that your role is to facilitate their own agreement. Suggest they consult their attorney for legal advice.", grade: "correct" },
      { text: "Offer some general guidelines about what courts typically decide in similar cases.", grade: "partial" },
      { text: "Agree to provide a recommendation to help move the process along.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-III(A) requires mediator impartiality and prohibits recommending outcomes. The mediator's role is to facilitate self-determination. Providing recommendations crosses into advisory territory and compromises neutrality.",
    whatNotToDo: "Never recommend specific outcomes, even when asked. Do not share what courts 'usually do' as this can be perceived as a recommendation. Redirect parties to their own attorneys for legal advice.",
  },
  {
    id: 3, category: "Ethics",
    situation: "Midway through a case, you realize one party is the cousin of your business partner. Neither party is aware of this connection.",
    options: [
      { text: "Continue the mediation since neither party knows about the connection.", grade: "incorrect" },
      { text: "Immediately disclose the conflict to both parties, offer to withdraw, and only continue if both parties provide informed written consent after full disclosure.", grade: "correct" },
      { text: "Quietly recuse yourself and refer the case without explaining why.", grade: "partial" },
      { text: "Disclose the relationship only to the connected party and let them decide.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-III(B) requires disclosure of any actual or potential conflict of interest. Both parties must receive full disclosure and have the opportunity to decide whether to continue. Withdrawal is appropriate if consent is not freely given.",
    whatNotToDo: "Never continue without disclosure -- even if you believe you can remain impartial. Do not disclose to only one party, as this creates an information asymmetry that further compromises the process.",
  },
  {
    id: 4, category: "Children",
    situation: "During a child-inclusive session, an 11-year-old tells you privately that they want to live with their mother and 'never see Dad again.' The father has no history of abuse.",
    options: [
      { text: "Report the child's exact words to both parents in the next joint session.", grade: "incorrect" },
      { text: "Acknowledge the child's feelings, explore what's behind the statement, and share only age-appropriate themes (not verbatim quotes) with parents, focusing on the child's needs rather than preferences.", grade: "correct" },
      { text: "Tell the child you'll make sure they get to live with their mother.", grade: "incorrect" },
      { text: "Let the parents know the child has strong feelings about the arrangement without sharing specifics.", grade: "partial" },
    ],
    explanation: "Standard 2025-X(B) provides that children's voices should be heard but protected. Mediators should explore underlying needs, not amplify surface preferences. Sharing verbatim statements can put the child in the middle and create loyalty conflicts.",
    whatNotToDo: "Never share a child's exact words with parents -- this makes the child a messenger and can cause guilt or retaliation. Never promise outcomes to a child or position yourself as their advocate against a parent.",
  },
  {
    id: 5, category: "Safety",
    situation: "A party arrives at the session and appears intoxicated -- slurred speech, unsteady gait, and the smell of alcohol.",
    options: [
      { text: "Proceed but note the behavior and ask the party to confirm they understand what's being discussed.", grade: "incorrect" },
      { text: "Suspend the session immediately, document your observations, ensure the party has safe transportation, and reschedule. Consider whether a substance abuse assessment is needed before resuming.", grade: "correct" },
      { text: "Ask the other party if they're comfortable continuing.", grade: "incorrect" },
      { text: "Take a 30-minute break and offer the party coffee, then reassess.", grade: "partial" },
    ],
    explanation: "Standard 2025-IV(A) requires that parties have capacity to participate meaningfully. An intoxicated party cannot provide informed consent or make binding decisions. The session must be suspended to protect the integrity of any agreements reached.",
    whatNotToDo: "Never continue a session with an impaired party -- any agreement reached would be vulnerable to challenge. Do not defer the safety decision to the other party. Ensure safe transportation before the impaired party leaves.",
  },
  {
    id: 6, category: "Process",
    situation: "One party quickly agrees to every proposal without negotiation, giving up significant financial and custodial rights. The other party seems pleased.",
    options: [
      { text: "Accept the agreements since both parties appear to consent.", grade: "incorrect" },
      { text: "Caucus privately with the agreeable party to explore whether they understand the implications, are acting under duress or pressure, and have received independent legal advice.", grade: "correct" },
      { text: "Suggest the agreeable party might want to think about it overnight.", grade: "partial" },
      { text: "Document the agreements quickly before anyone changes their mind.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-IV(B) requires mediators to ensure self-determination and informed consent. Rapid capitulation may signal coercion, fear, or lack of understanding. The mediator must assess whether the party is making genuinely voluntary, informed decisions.",
    whatNotToDo: "Never rush to finalize an agreement that shows signs of imbalance. Do not assume that because both parties say yes, the process is fair. A mediator has an obligation to ensure informed consent even when it slows down the process.",
  },
  {
    id: 7, category: "Process",
    situation: "An attorney accompanying one party repeatedly interrupts, answers questions directed at their client, and objects to the other party's statements.",
    options: [
      { text: "Allow it since attorneys have a right to advocate for their clients.", grade: "incorrect" },
      { text: "Ask the attorney to leave the session.", grade: "incorrect" },
      { text: "Restate the ground rules about the mediation process, clarify the role of attorneys in mediation versus litigation, and if the behavior continues, caucus to address it directly.", grade: "correct" },
      { text: "Redirect questions to the client and hope the attorney gets the message.", grade: "partial" },
    ],
    explanation: "Standard 2025-VII requires mediators to manage the process effectively. Attorneys may attend but must respect the mediation framework. The mediator should address disruptions directly while respecting the attorney's role as advisor, not advocate.",
    whatNotToDo: "Never allow an attorney to take over the mediation process -- this undermines party self-determination. Do not eject the attorney, as this may prejudice the party's rights. Address the behavior, not the person.",
  },
  {
    id: 8, category: "Ethics",
    situation: "One party requests permission to audio-record the mediation session 'for their own records.'",
    options: [
      { text: "Allow it since it's their right to document proceedings.", grade: "incorrect" },
      { text: "Deny the request, explaining that mediation confidentiality provisions and the agreement to mediate typically prohibit recording. Confirm with both parties and review the signed confidentiality agreement.", grade: "correct" },
      { text: "Allow recording only if the other party consents.", grade: "partial" },
      { text: "Let them record but instruct them not to share it.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-VIII(A) establishes mediation confidentiality. Recording undermines the candor that confidentiality protects. Most agreements to mediate expressly prohibit recording. Even with mutual consent, recording can chill open communication.",
    whatNotToDo: "Never allow recording without reviewing the confidentiality agreement and applicable law. Do not assume mutual consent resolves the issue -- the chilling effect on candor persists regardless of consent.",
  },
  {
    id: 9, category: "Financial",
    situation: "While reviewing financial disclosures, you notice one party's reported expenses are significantly lower than would be expected for their lifestyle, and bank statements show large unexplained transfers.",
    options: [
      { text: "Ignore it -- verifying financials is the attorneys' job.", grade: "incorrect" },
      { text: "Accuse the party of hiding assets.", grade: "incorrect" },
      { text: "Note the discrepancy neutrally, ask both parties to ensure disclosures are complete, remind them of their obligation for full disclosure, and recommend independent financial review before finalizing agreements.", grade: "correct" },
      { text: "Mention the discrepancy privately to the other party's attorney.", grade: "partial" },
    ],
    explanation: "Standard 2025-IV(C) requires that agreements be based on complete and accurate information. Mediators should flag apparent gaps without accusation and ensure both parties have access to adequate financial information before reaching binding agreements.",
    whatNotToDo: "Never ignore apparent disclosure gaps -- agreements based on incomplete information are unfair and may be voidable. Do not make accusations or take sides. Do not share concerns with only one party, as this compromises impartiality.",
  },
  {
    id: 10, category: "Process",
    situation: "During an online mediation session, the video platform crashes. One party can reconnect but the other cannot due to technical issues.",
    options: [
      { text: "Continue the session by phone with the disconnected party.", grade: "partial" },
      { text: "Continue with only the connected party and get the other's input later.", grade: "incorrect" },
      { text: "Suspend the session, contact the disconnected party to confirm they are safe and not under duress, offer technical support or alternative connection methods, and only resume when both parties can participate equally.", grade: "correct" },
      { text: "Ask the connected party to relay information to the other party.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-IX(B) requires technological competence and equal access. Both parties must be able to participate fully. Continuing with unequal access undermines fairness. Always verify safety when contact is unexpectedly lost in ODR.",
    whatNotToDo: "Never continue substantive discussions with only one party present. Do not assume a disconnection is purely technical -- verify the party is safe. Do not use one party as a messenger to the other.",
  },
  {
    id: 11, category: "Safety",
    situation: "During a heated exchange, one party says to the other: 'If you try to take my kids, you'll regret it. I know where you live.'",
    options: [
      { text: "Note it but continue -- people say things they don't mean when emotional.", grade: "incorrect" },
      { text: "Immediately stop the session, separate the parties, assess the threat level, document the statement, and determine whether to report to authorities. Do not resume joint sessions without a safety reassessment.", grade: "correct" },
      { text: "Ask the threatening party to apologize and remind them of the ground rules.", grade: "partial" },
      { text: "Tell the threatened party they can call the police if they feel unsafe.", grade: "incorrect" },
    ],
    explanation: "Standard 2025-V(B) requires mediators to respond to threats immediately. A direct threat with specific knowledge ('I know where you live') elevates the risk level. The mediator must stop the session, assess danger, and may have reporting obligations.",
    whatNotToDo: "Never minimize threats or continue the session after a direct threat is made. Do not simply ask for an apology -- this normalizes threatening behavior. The mediator has a duty to act, not defer safety decisions to the threatened party.",
  },
  {
    id: 12, category: "Children",
    situation: "A family from a culture where elder males make all family decisions is mediating custody. The father insists his cultural tradition should determine that he gets full custody, and the mother defers to this position despite appearing distressed.",
    options: [
      { text: "Respect the cultural tradition and accept the father's position.", grade: "incorrect" },
      { text: "Tell the family their cultural values are wrong and apply standard custody principles.", grade: "incorrect" },
      { text: "Acknowledge and respect the cultural context while ensuring each party can express their own views. Caucus privately with the mother to ensure she is participating voluntarily. Ensure the children's best interests are centered, as required by law.", grade: "correct" },
      { text: "Suggest they consult a cultural mediator instead.", grade: "partial" },
    ],
    explanation: "Standard 2025-Intro and 2025-IV(B) require cultural competence alongside self-determination. Respecting culture does not override the obligation to ensure voluntary participation and the legal standard of children's best interests. Private caucuses can reveal coercion.",
    whatNotToDo: "Never defer entirely to cultural norms when a party appears distressed or coerced. Equally, never dismiss cultural values -- work within them while ensuring legal standards and voluntary participation are met.",
  },
];

function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export default function TrainingSimulator() {
  const [answers, setAnswers] = useState({});
  const [activeScenario, setActiveScenario] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const saved = loadState();
    if (saved) setAnswers(saved.answers || {});
  }, []);

  useEffect(() => {
    saveState({ answers });
  }, [answers]);

  const selectOption = (scenarioId, optionIndex) => {
    if (answers[scenarioId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [scenarioId]: optionIndex }));
  };

  const completedCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([sid, idx]) => {
    const s = SCENARIOS.find((sc) => sc.id === Number(sid));
    return s && s.options[idx]?.grade === "correct";
  }).length;
  const partialCount = Object.entries(answers).filter(([sid, idx]) => {
    const s = SCENARIOS.find((sc) => sc.id === Number(sid));
    return s && s.options[idx]?.grade === "partial";
  }).length;
  const score = completedCount > 0 ? Math.round(((correctCount + partialCount * 0.5) / completedCount) * 100) : 0;

  const filtered = filterCategory === "All" ? SCENARIOS : SCENARIOS.filter((s) => s.category === filterCategory);

  const resetAll = () => { setAnswers({}); setActiveScenario(null); };

  const gradeColor = (grade) => grade === "correct" ? "#16a34a" : grade === "partial" ? "#ca8a04" : "#dc2626";
  const gradeBg = (grade) => grade === "correct" ? "#f0fdf4" : grade === "partial" ? "#fefce8" : "#fef2f2";
  const gradeLabel = (grade) => grade === "correct" ? "Correct" : grade === "partial" ? "Partially Correct" : "Incorrect";

  const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Mediator Training Simulator</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Interactive scenario-based training aligned with 2025 AFCC/ABA Model Standards</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }} role="status">
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>{completedCount}/{SCENARIOS.length}</div>
          <div style={{ fontSize: 12, color: "#1e40af" }}>Completed</div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }} role="status">
          <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{correctCount}</div>
          <div style={{ fontSize: 12, color: "#166534" }}>Correct Answers</div>
        </div>
        <div style={{ textAlign: "center", padding: 16, background: score >= 70 ? "#f0fdf4" : score >= 40 ? "#fefce8" : "#fef2f2", borderRadius: 8, border: `1px solid ${score >= 70 ? "#bbf7d0" : score >= 40 ? "#fef08a" : "#fecaca"}` }} role="status">
          <div style={{ fontSize: 28, fontWeight: 700, color: score >= 70 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626" }}>{completedCount > 0 ? `${score}%` : "--"}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Score</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["All", ...CATEGORIES.map((c) => c.id)].map((cat) => (
            <button key={cat} onClick={() => { setFilterCategory(cat); setActiveScenario(null); }} style={{
              padding: "4px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer",
              border: filterCategory === cat ? "1px solid #2563eb" : "1px solid #cbd5e1",
              background: filterCategory === cat ? "#dbeafe" : "#fff",
              color: filterCategory === cat ? "#1d4ed8" : "#64748b", fontWeight: filterCategory === cat ? 600 : 400,
            }}>{cat}</button>
          ))}
        </div>
        {completedCount > 0 && (
          <button onClick={resetAll} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>Reset All</button>
        )}
      </div>

      {activeScenario === null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((s) => {
            const answered = answers[s.id] !== undefined;
            const grade = answered ? s.options[answers[s.id]].grade : null;
            const cm = catMeta(s.category);
            return (
              <button key={s.id} onClick={() => setActiveScenario(s.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: "1px solid #e2e8f0", background: answered ? gradeBg(grade) : "#fff",
              }}>
                <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: cm.bg, color: cm.color, border: `1px solid ${cm.border}`, whiteSpace: "nowrap" }}>{s.category}</span>
                <span style={{ fontSize: 13, color: "#1e293b", flex: 1 }}>{s.situation.slice(0, 80)}...</span>
                {answered && <span style={{ fontSize: 11, fontWeight: 600, color: gradeColor(grade) }}>{gradeLabel(grade)}</span>}
                {!answered && <span style={{ fontSize: 11, color: "#94a3b8" }}>Not attempted</span>}
              </button>
            );
          })}
        </div>
      ) : (
        (() => {
          const s = SCENARIOS.find((sc) => sc.id === activeScenario);
          if (!s) return null;
          const answered = answers[s.id] !== undefined;
          const selectedIdx = answers[s.id];
          const cm = catMeta(s.category);
          return (
            <div>
              <button onClick={() => setActiveScenario(null)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b", marginBottom: 12 }}>Back to scenarios</button>

              <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: cm.bg, color: cm.color, border: `1px solid ${cm.border}` }}>{s.category}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Scenario {s.id} of {SCENARIOS.length}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{s.situation}</p>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>What should you do?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {s.options.map((opt, i) => {
                  const isSelected = selectedIdx === i;
                  const showGrade = answered;
                  let borderColor = "#e2e8f0";
                  let bg = "#fff";
                  if (showGrade && isSelected) { borderColor = gradeColor(opt.grade); bg = gradeBg(opt.grade); }
                  if (showGrade && opt.grade === "correct" && !isSelected) { borderColor = "#86efac"; bg = "#f0fdf4"; }
                  return (
                    <button key={i} onClick={() => selectOption(s.id, i)} disabled={answered} style={{
                      padding: 12, borderRadius: 8, border: `2px solid ${borderColor}`, background: bg,
                      cursor: answered ? "default" : "pointer", textAlign: "left", fontSize: 13, color: "#334155",
                      opacity: showGrade && !isSelected && opt.grade !== "correct" ? 0.6 : 1,
                    }}>
                      <span>{opt.text}</span>
                      {showGrade && isSelected && <span style={{ display: "block", marginTop: 4, fontSize: 11, fontWeight: 600, color: gradeColor(opt.grade) }}>{gradeLabel(opt.grade)}</span>}
                      {showGrade && opt.grade === "correct" && !isSelected && <span style={{ display: "block", marginTop: 4, fontSize: 11, fontWeight: 600, color: "#16a34a" }}>Correct answer</span>}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: 14, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>Standard & Explanation</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{s.explanation}</p>
                  </div>
                  <div style={{ padding: 14, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginBottom: 6 }}>What NOT To Do</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#7f1d1d", lineHeight: 1.5 }}>{s.whatNotToDo}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {s.id < SCENARIOS.length && (
                      <button onClick={() => setActiveScenario(s.id + 1)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }}>Next Scenario</button>
                    )}
                    <button onClick={() => setActiveScenario(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569" }}>All Scenarios</button>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
