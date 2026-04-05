import { useState, useEffect } from "react";

const CATEGORIES = [
  {
    name: "Residential Schedule",
    provisions: [
      { id: "reg_weekday", label: "Regular weekday schedule", detail: "Which parent has the children on school nights" },
      { id: "reg_weekend", label: "Regular weekend schedule", detail: "Weekend rotation pattern" },
      { id: "alternating", label: "Alternating week schedule", detail: "Week-on/week-off arrangement" },
      { id: "midweek", label: "Midweek overnight", detail: "Non-custodial parent gets a midweek overnight" },
      { id: "2_2_3", label: "2-2-3 rotation", detail: "Two days, two days, three days alternating" },
      { id: "5_2", label: "5-2 schedule", detail: "Five days with one parent, two with the other" },
    ],
  },
  {
    name: "Holidays & Special Days",
    provisions: [
      { id: "hol_alternate", label: "Alternating holidays by year", detail: "Even/odd year rotation" },
      { id: "hol_split", label: "Split holidays", detail: "Morning with one parent, evening with the other" },
      { id: "hol_fixed", label: "Fixed holiday assignments", detail: "Specific holidays always with a specific parent" },
      { id: "child_bday", label: "Children's birthdays", detail: "How birthdays are shared" },
      { id: "parent_bday", label: "Parent birthdays", detail: "Children spend time with the birthday parent" },
      { id: "mothers_fathers", label: "Mother's/Father's Day", detail: "Child with respective parent" },
      { id: "school_break", label: "School breaks", detail: "Winter, spring, and summer break divisions" },
      { id: "religious", label: "Religious observances", detail: "Holiday schedule for religious holidays" },
    ],
  },
  {
    name: "Decision-Making",
    provisions: [
      { id: "joint_major", label: "Joint major decisions", detail: "Both parents decide education, healthcare, religion, activities" },
      { id: "sole_major", label: "Sole major decisions", detail: "One parent has final say on major decisions" },
      { id: "split_major", label: "Split decision areas", detail: "Each parent decides specific categories" },
      { id: "day_to_day", label: "Day-to-day decisions", detail: "Parent with the child decides routine matters" },
      { id: "emergency", label: "Emergency decisions", detail: "Either parent may make emergency decisions with prompt notice" },
      { id: "dispute_process", label: "Dispute resolution process", detail: "Mediation first, then court for unresolved disagreements" },
    ],
  },
  {
    name: "Communication",
    provisions: [
      { id: "parent_comm_method", label: "Parent-to-parent communication method", detail: "Email, text, co-parenting app, or phone" },
      { id: "parent_comm_freq", label: "Communication response time", detail: "Expected response window (e.g., 24 hours for non-urgent)" },
      { id: "child_comm", label: "Parent-child communication", detail: "Phone/video calls during the other parent's time" },
      { id: "coparent_app", label: "Co-parenting app requirement", detail: "Use of OFW, TalkingParents, or similar" },
      { id: "no_negative", label: "No negative comments", detail: "Neither parent disparages the other in front of children" },
      { id: "info_sharing", label: "Information sharing", detail: "School records, medical records, activity schedules" },
    ],
  },
  {
    name: "Transitions",
    provisions: [
      { id: "pickup_dropoff", label: "Pick-up/drop-off logistics", detail: "Times, locations, who transports" },
      { id: "school_transition", label: "School as transition point", detail: "One parent drops off, other picks up from school" },
      { id: "neutral_location", label: "Neutral exchange location", detail: "Public location for exchanges (safety cases)" },
      { id: "supervised_exchange", label: "Supervised exchanges", detail: "Third party present during transitions" },
      { id: "items_travel", label: "Items traveling with child", detail: "Clothing, medications, school materials, comfort items" },
      { id: "late_protocol", label: "Late pick-up protocol", detail: "Grace period and notification requirements" },
    ],
  },
  {
    name: "Travel & Relocation",
    provisions: [
      { id: "travel_notice", label: "Travel notification", detail: "Advance notice required for domestic travel" },
      { id: "intl_travel", label: "International travel", detail: "Consent, passport handling, itinerary sharing" },
      { id: "relocation_notice", label: "Relocation notice", detail: "Days/months notice required before moving" },
      { id: "geo_restriction", label: "Geographic restriction", detail: "Must reside within specified distance" },
      { id: "passport", label: "Passport possession", detail: "Who holds the passport" },
    ],
  },
  {
    name: "Child-Specific",
    provisions: [
      { id: "activities", label: "Extracurricular activities", detail: "Enrollment, attendance, cost sharing" },
      { id: "healthcare", label: "Healthcare providers", detail: "Pediatrician, dentist, specialists" },
      { id: "insurance", label: "Health insurance", detail: "Who provides, how costs are shared" },
      { id: "childcare", label: "Childcare arrangements", detail: "Daycare, babysitters, after-school" },
      { id: "special_needs", label: "Special needs accommodations", detail: "Therapies, IEP, accommodations" },
      { id: "pets", label: "Pet arrangements", detail: "Where pets reside, visitation" },
      { id: "rofr", label: "Right of first refusal", detail: "Offer the other parent before using childcare" },
      { id: "new_partners", label: "Introduction of new partners", detail: "Timeline and process for introducing significant others" },
      { id: "social_media", label: "Social media and children's images", detail: "Rules about posting children's photos online" },
    ],
  },
  {
    name: "Review & Modification",
    provisions: [
      { id: "review_annual", label: "Annual review", detail: "Review the plan yearly" },
      { id: "review_milestone", label: "Developmental milestone review", detail: "Review when child starts school, becomes a teen, etc." },
      { id: "mod_process", label: "Modification process", detail: "Mediation first, then court" },
      { id: "sunset", label: "Sunset provisions", detail: "Certain provisions expire or change at specified ages" },
    ],
  },
];

export default function ParentingPlanBuilder() {
  const [selected, setSelected] = useState(() => {
    try { const saved = localStorage.getItem("ppb-selected"); return saved ? new Set(JSON.parse(saved)) : new Set(); } catch { return new Set(); }
  });
  const [notes, setNotes] = useState(() => {
    try { const saved = localStorage.getItem("ppb-notes"); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });
  const [expandedCat, setExpandedCat] = useState(new Set(["Residential Schedule"]));
  const [view, setView] = useState("builder");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    try { localStorage.setItem("ppb-selected", JSON.stringify([...selected])); } catch {}
  }, [selected]);
  useEffect(() => {
    try { localStorage.setItem("ppb-notes", JSON.stringify(notes)); } catch {}
  }, [notes]);

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleCat = (name) => {
    const next = new Set(expandedCat);
    next.has(name) ? next.delete(name) : next.add(name);
    setExpandedCat(next);
  };

  const updateNote = (id, val) => setNotes({ ...notes, [id]: val });

  const getSummary = () => {
    return CATEGORIES.map((cat) => {
      const items = cat.provisions.filter((p) => selected.has(p.id));
      if (!items.length) return null;
      return { category: cat.name, items: items.map((p) => ({ label: p.label, note: notes[p.id] || "" })) };
    }).filter(Boolean);
  };

  const exportText = () => {
    const summary = getSummary();
    let text = "PARENTING PLAN — SELECTED PROVISIONS\n";
    text += "=".repeat(50) + "\n\n";
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `Total provisions selected: ${selected.size}\n\n`;
    summary.forEach((s) => {
      text += `\n## ${s.category}\n${"—".repeat(40)}\n`;
      s.items.forEach((item) => {
        text += `✓ ${item.label}\n`;
        if (item.note) text += `  Notes: ${item.note}\n`;
      });
    });
    text += "\n\nDISCLAIMER: This is a working document generated for mediation purposes.\n";
    text += "It does not constitute a legal agreement. Have any final plan reviewed by\n";
    text += "independent legal counsel before signing.\n";
    return text;
  };

  if (view === "summary") {
    const summary = getSummary();
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Plan Summary — {selected.size} Provisions</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("builder")} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => { navigator.clipboard.writeText(exportText()).then(() => { setCopyStatus("Copied!"); setTimeout(() => setCopyStatus(""), 2000); }).catch(() => { setCopyStatus("Copy failed"); setTimeout(() => setCopyStatus(""), 2000); }); }} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }} aria-label="Copy plan to clipboard">{copyStatus || "Copy to Clipboard"}</button>
          </div>
        </div>
        {summary.length === 0 && <p style={{ color: "#64748b" }}>No provisions selected yet. Go back and select provisions to include in the plan.</p>}
        {summary.map((s) => (
          <div key={s.category} style={{ marginBottom: 20, background: "#f8fafc", borderRadius: 8, padding: 16, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#0f172a" }}>{s.category}</h3>
            {s.items.map((item) => (
              <div key={item.label} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: "3px solid #3b82f6" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{item.label}</div>
                {item.note && <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{item.note}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Parenting Plan Builder</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Select provisions to include. Add notes for each. Based on 2025 AFCC/ABA Model Standards.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "8px 12px", background: "#eff6ff", borderRadius: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1e40af" }}>{selected.size} provisions selected</span>
        <button onClick={() => setView("summary")} disabled={selected.size === 0} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: selected.size > 0 ? "#2563eb" : "#94a3b8", color: "#fff", cursor: selected.size > 0 ? "pointer" : "default", fontSize: 13 }}>
          View Summary →
        </button>
      </div>
      {CATEGORIES.map((cat) => (
        <div key={cat.name} style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => toggleCat(cat.name)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
            <span>{cat.name}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {cat.provisions.filter((p) => selected.has(p.id)).length}/{cat.provisions.length} · {expandedCat.has(cat.name) ? "▲" : "▼"}
            </span>
          </button>
          {expandedCat.has(cat.name) && (
            <div style={{ padding: "8px 14px" }}>
              {cat.provisions.map((p) => (
                <div key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <label htmlFor={`provision-${p.id}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                    <input id={`provision-${p.id}`} type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} style={{ marginTop: 3, accentColor: "#2563eb" }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{p.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{p.detail}</div>
                    </div>
                  </label>
                  {selected.has(p.id) && (
                    <textarea value={notes[p.id] || ""} onChange={(e) => updateNote(p.id, e.target.value)} placeholder="Add notes for this provision..." style={{ width: "100%", marginTop: 6, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 50, fontFamily: "inherit", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{ marginTop: 16, padding: 12, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This is a mediation working tool, not a legal document. Any final parenting plan should be reviewed by each party's independent attorney.
      </div>
    </div>
  );
}
