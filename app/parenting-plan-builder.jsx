import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-parenting-plan";

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

const RECOMMENDED_CATEGORIES = ["Residential Schedule", "Decision-Making", "Communication"];

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return { selected: new Set(parsed.selected || []), notes: parsed.notes || {} };
  } catch {
    return null;
  }
}

function saveToStorage(selected, notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected: [...selected], notes }));
  } catch {
    // storage full or unavailable
  }
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

export default function ParentingPlanBuilder() {
  const stored = loadFromStorage();
  const [selected, setSelected] = useState(stored?.selected || new Set());
  const [notes, setNotes] = useState(stored?.notes || {});
  const [expandedCat, setExpandedCat] = useState(new Set(["Residential Schedule"]));
  const [view, setView] = useState("builder");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    saveToStorage(selected, notes);
  }, [selected, notes]);

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

  const clearAll = () => {
    setSelected(new Set());
    setNotes({});
  };

  const getSummary = () => {
    return CATEGORIES.map((cat) => {
      const items = cat.provisions.filter((p) => selected.has(p.id));
      if (!items.length) return null;
      return { category: cat.name, items: items.map((p) => ({ label: p.label, detail: p.detail, note: notes[p.id] || "" })) };
    }).filter(Boolean);
  };

  const missingRecommended = RECOMMENDED_CATEGORIES.filter(
    (catName) => {
      const cat = CATEGORIES.find((c) => c.name === catName);
      return cat && !cat.provisions.some((p) => selected.has(p.id));
    }
  );

  const exportText = () => {
    const summary = getSummary();
    let text = "PARENTING PLAN — SELECTED PROVISIONS\n";
    text += "=".repeat(50) + "\n\n";
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `Total provisions selected: ${selected.size}\n\n`;
    summary.forEach((s) => {
      text += `\n## ${s.category}\n${"—".repeat(40)}\n`;
      s.items.forEach((item) => {
        text += `[x] ${item.label}\n`;
        text += `    ${item.detail}\n`;
        if (item.note) text += `    Notes: ${item.note}\n`;
      });
    });
    if (missingRecommended.length > 0) {
      text += `\n\nNOTE: The following recommended categories have no provisions selected:\n`;
      missingRecommended.forEach((c) => (text += `  - ${c}\n`));
    }
    text += "\n\nDISCLAIMER: This is a working document generated for mediation purposes.\n";
    text += "It does not constitute a legal agreement. Have any final plan reviewed by\n";
    text += "independent legal counsel before signing.\n";
    text += "\nBased on 2025 AFCC/ABA Model Standards for Family and Divorce Mediation.\n";
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(exportText(), `parenting-plan-${date}.txt`);
  };

  if (view === "summary") {
    const summary = getSummary();
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>Plan Summary — {selected.size} Provisions</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setView("builder")} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13 }}>Back</button>
            <button onClick={handleCopy} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 }} aria-label="Copy plan to clipboard">
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={handleDownload} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 13 }} aria-label="Download plan as text file">
              Download
            </button>
          </div>
        </div>
        {summary.length === 0 && <p style={{ color: "#64748b" }}>No provisions selected yet. Go back and select provisions to include in the plan.</p>}
        {summary.map((s) => (
          <div key={s.category} style={{ marginBottom: 20, background: "#f8fafc", borderRadius: 8, padding: 16, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#0f172a" }}>{s.category}</h3>
            {s.items.map((item) => (
              <div key={item.label} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: "3px solid #3b82f6" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{item.detail}</div>
                {item.note && <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{item.note}</div>}
              </div>
            ))}
          </div>
        ))}
        {missingRecommended.length > 0 && (
          <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8, borderLeft: "4px solid #f59e0b", marginBottom: 16 }} role="status">
            <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Recommended categories with no provisions selected:</div>
            {missingRecommended.map((c) => (
              <div key={c} style={{ fontSize: 13, color: "#92400e" }}>- {c}</div>
            ))}
          </div>
        )}
        <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
          This is a mediation working tool, not a legal document. Any final parenting plan should be reviewed by each party's independent attorney.
        </div>
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
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e40af" }}>{selected.size} provisions selected</span>
          {selected.size > 0 && (
            <button onClick={clearAll} style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 11, color: "#64748b" }} aria-label="Clear all selections">
              Clear all
            </button>
          )}
        </div>
        <button onClick={() => setView("summary")} disabled={selected.size === 0} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: selected.size > 0 ? "#2563eb" : "#94a3b8", color: "#fff", cursor: selected.size > 0 ? "pointer" : "default", fontSize: 13 }} aria-label={`View summary of ${selected.size} selected provisions`}>
          View Summary
        </button>
      </div>

      {missingRecommended.length > 0 && selected.size > 0 && (
        <div style={{ padding: 8, marginBottom: 12, background: "#fffbeb", borderRadius: 8, borderLeft: "3px solid #f59e0b", fontSize: 12, color: "#92400e" }} role="status">
          Consider adding provisions from: {missingRecommended.join(", ")}
        </div>
      )}

      {CATEGORIES.map((cat) => {
        const selectedInCat = cat.provisions.filter((p) => selected.has(p.id)).length;
        return (
          <div key={cat.name} style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => toggleCat(cat.name)} aria-expanded={expandedCat.has(cat.name)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
              <span>{cat.name}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {selectedInCat}/{cat.provisions.length} {expandedCat.has(cat.name) ? "[-]" : "[+]"}
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
                      <textarea
                        value={notes[p.id] || ""}
                        onChange={(e) => updateNote(p.id, e.target.value)}
                        placeholder="Add notes for this provision..."
                        aria-label={`Notes for ${p.label}`}
                        style={{ width: "100%", marginTop: 6, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 50, fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 16, padding: 12, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        This is a mediation working tool, not a legal document. Any final parenting plan should be reviewed by each party's independent attorney.
      </div>
    </div>
  );
}
