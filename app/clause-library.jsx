import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-clause-library";

const CLAUSES = [
  // Residential Schedule
  { id: "res-alt-weeks", cat: "Residential Schedule", title: "Alternating Weeks", desc: "Week-on/week-off rotation between parents", text: "The children shall reside with [PARENT A] during odd-numbered weeks and with [PARENT B] during even-numbered weeks, with transitions occurring on [DAY] at [TIME]. Week numbering shall follow the ISO calendar." },
  { id: "res-223", cat: "Residential Schedule", title: "2-2-3 Rotation", desc: "Two days with each parent, then three-day weekend alternating", text: "The children shall reside with [PARENT A] on Monday and Tuesday, with [PARENT B] on Wednesday and Thursday, and shall alternate weekends (Friday through Sunday) between parents, beginning with [PARENT A/B] on [DATE]." },
  { id: "res-primary", cat: "Residential Schedule", title: "Primary Residence with Visitation", desc: "One parent has primary custody with scheduled parenting time for the other", text: "The children shall primarily reside with [PARENT A]. [PARENT B] shall have parenting time every [OTHER] weekend from Friday at [TIME] to Sunday at [TIME], and one midweek overnight on [DAY] from [TIME] to [TIME]." },
  { id: "res-school-summer", cat: "Residential Schedule", title: "School-Year / Summer Split", desc: "Different schedules for school year and summer", text: "During the school year (first day of school through last day of school), the children shall follow [SCHEDULE]. During summer break, the children shall follow [SUMMER SCHEDULE], with each parent receiving no less than [NUMBER] consecutive weeks." },
  { id: "res-gradual", cat: "Residential Schedule", title: "Gradual Introduction Schedule", desc: "Step-up plan for young children or re-establishing relationship", text: "For the first [NUMBER] weeks, [PARENT B] shall have daytime-only parenting time on [DAYS] from [TIME] to [TIME]. Beginning week [NUMBER], overnight parenting time shall be introduced on [DAY]. The schedule shall step up to [FINAL SCHEDULE] by [DATE], subject to review." },
  { id: "res-birdnest", cat: "Residential Schedule", title: "Bird-Nesting Arrangement", desc: "Children stay in one home while parents rotate", text: "The children shall remain in the family residence at [ADDRESS]. [PARENT A] shall reside in the home during [DAYS/WEEKS] and [PARENT B] during [DAYS/WEEKS]. Each parent is responsible for maintaining separate housing when not in the family home. This arrangement shall be reviewed on [DATE]." },

  // Holidays
  { id: "hol-alternate", cat: "Holiday Schedule", title: "Alternating Holidays by Year", desc: "Even/odd year rotation for major holidays", text: "In even-numbered years, [PARENT A] shall have the children for [HOLIDAY LIST A] and [PARENT B] shall have them for [HOLIDAY LIST B]. In odd-numbered years, the assignments shall reverse. Holiday time shall take priority over the regular residential schedule." },
  { id: "hol-split", cat: "Holiday Schedule", title: "Split Holidays", desc: "Each holiday divided between both parents", text: "On [HOLIDAY], the children shall be with [PARENT A] from [TIME] to [TIME] and with [PARENT B] from [TIME] to [TIME]. The parent with morning time shall be responsible for transition at [LOCATION]." },
  { id: "hol-fixed", cat: "Holiday Schedule", title: "Fixed Holiday Assignments", desc: "Specific holidays always with a designated parent", text: "[PARENT A] shall have the children every year on [HOLIDAY LIST]. [PARENT B] shall have the children every year on [HOLIDAY LIST]. These fixed assignments shall take priority over the regular schedule." },
  { id: "hol-school-breaks", cat: "Holiday Schedule", title: "School Break Division", desc: "Winter, spring, and summer break allocations", text: "Winter break shall be divided equally, with [PARENT A] having the first half in even years and the second half in odd years. Spring break shall alternate annually, beginning with [PARENT A/B] in [YEAR]. Summer break shall be divided as set forth in the summer schedule provisions." },
  { id: "hol-birthdays", cat: "Holiday Schedule", title: "Children's Birthdays", desc: "How birthdays are shared", text: "Each child shall spend their birthday with [PARENT A] in even years and [PARENT B] in odd years, from [TIME] to [TIME]. The non-custodial parent may hold a separate celebration on another day. Mother's Day shall be spent with the mother; Father's Day with the father." },

  // Decision-Making
  { id: "dec-joint", cat: "Decision-Making", title: "Joint Major Decisions", desc: "Both parents must agree on major decisions", text: "The parties shall share joint legal custody and make major decisions together regarding the children's education, non-emergency healthcare, mental health treatment, religious upbringing, and extracurricular activities. Each parent shall make day-to-day decisions while the children are in their care." },
  { id: "dec-sole", cat: "Decision-Making", title: "Sole Decision-Making Authority", desc: "One parent has final say on major decisions", text: "[PARENT A] shall have sole legal custody and final decision-making authority regarding the children's education, healthcare, and extracurricular activities. [PARENT A] shall consult with [PARENT B] and consider their input before making major decisions, but shall have final authority." },
  { id: "dec-split", cat: "Decision-Making", title: "Split Decision Domains", desc: "Each parent decides specific categories", text: "[PARENT A] shall have final decision-making authority regarding education and extracurricular activities. [PARENT B] shall have final decision-making authority regarding healthcare and religious upbringing. Both parties shall consult with each other before making decisions in their respective domains." },
  { id: "dec-emergency", cat: "Decision-Making", title: "Emergency Decisions", desc: "Either parent may make emergency decisions", text: "Either parent may make emergency decisions regarding the children's health and safety without prior consultation. The deciding parent shall notify the other parent as soon as reasonably possible, and no later than [24/48] hours after the emergency decision." },
  { id: "dec-tiebreak", cat: "Decision-Making", title: "Tie-Breaking / Dispute Resolution", desc: "Process when parents cannot agree", text: "If the parties cannot agree on a major decision after good-faith discussion, they shall: (1) attempt to resolve the disagreement through mediation with a mutually agreed mediator; (2) if mediation is unsuccessful, consult a parenting coordinator; (3) if still unresolved, either party may petition the court. Neither party shall take unilateral action on the disputed matter until the dispute resolution process is complete." },

  // Communication
  { id: "comm-app", cat: "Communication", title: "Co-Parenting App Required", desc: "All parent communication through designated app", text: "All non-emergency communication between the parties regarding the children shall be conducted through [OurFamilyWizard / TalkingParents / AppClose]. Each party shall check the app daily and respond to messages within [24/48] hours. Emergency communications may be made by phone." },
  { id: "comm-response", cat: "Communication", title: "Communication Response Time", desc: "Expected response windows", text: "Each party shall respond to non-emergency communications regarding the children within [24] hours. Urgent matters (schedule changes, medical situations) shall receive a response within [4] hours. Failure to respond within these timeframes shall not be deemed consent to any proposal." },
  { id: "comm-no-negative", cat: "Communication", title: "No Disparagement", desc: "Neither parent disparages the other", text: "Neither party shall make negative, derogatory, or disparaging remarks about the other party, the other party's family, or the other party's household members in the presence of or within earshot of the children. Neither party shall allow others to do so." },
  { id: "comm-info", cat: "Communication", title: "Information Sharing", desc: "Sharing school, medical, and activity information", text: "Each party shall promptly share with the other party all information regarding the children's education (report cards, teacher communications, school events), health (medical appointments, prescriptions, diagnoses), and activities (schedules, registration, performance dates). Each party shall ensure the other is listed as an authorized contact at schools and medical providers." },
  { id: "comm-child", cat: "Communication", title: "Parent-Child Communication", desc: "Phone/video access during other parent's time", text: "Each child shall have reasonable telephone and/or video communication with the non-residential parent, at least [NUMBER] times per week at mutually convenient times. Neither parent shall monitor, record, or interfere with the children's communication with the other parent." },

  // Child Support
  { id: "cs-guideline", cat: "Child Support", title: "Guideline Child Support", desc: "Support calculated per state guidelines", text: "[PARENT A/B] shall pay child support to [PARENT A/B] in the amount of $[AMOUNT] per month, calculated pursuant to [STATE] child support guidelines based on the parties' current incomes. Payment shall be made by the [1st/15th] of each month via [direct deposit / wage assignment / check]." },
  { id: "cs-deviation", cat: "Child Support", title: "Deviation from Guidelines", desc: "Support differs from guideline amount with stated reasons", text: "The parties agree to a child support amount of $[AMOUNT] per month, which deviates from the guideline amount of $[GUIDELINE AMOUNT]. The parties agree this deviation is in the children's best interest because [REASONS: e.g., shared parenting time, extraordinary expenses, special needs]. This deviation is subject to court approval." },
  { id: "cs-expenses", cat: "Child Support", title: "Expense Sharing", desc: "How additional child expenses are split", text: "In addition to base child support, the parties shall share the following expenses: (a) unreimbursed medical/dental/vision expenses exceeding $[AMOUNT] per year — [PARENT A] [__]% / [PARENT B] [__]%; (b) childcare costs — [__]% / [__]%; (c) extracurricular activities mutually agreed upon — [__]% / [__]%; (d) private school tuition (if applicable) — [__]% / [__]%." },
  { id: "cs-duration", cat: "Child Support", title: "Duration and Modification", desc: "When support ends and how it can change", text: "Child support shall continue for each child until the child reaches age [18/19/21], graduates from high school, or is otherwise emancipated, whichever occurs [first/last]. Either party may seek modification of child support upon a material change in circumstances, including but not limited to a [15-20]% change in either party's income." },

  // Spousal Support
  { id: "ss-rehabilitative", cat: "Spousal Support", title: "Rehabilitative Spousal Support", desc: "Temporary support while recipient gets back on their feet", text: "[PAYOR] shall pay [RECIPIENT] rehabilitative spousal support/maintenance of $[AMOUNT] per month for a period of [NUMBER] months/years, beginning [DATE]. This support is intended to assist [RECIPIENT] in [completing education / obtaining employment / becoming self-supporting]. Support shall terminate on [DATE] and shall not be extended." },
  { id: "ss-permanent", cat: "Spousal Support", title: "Indefinite Spousal Support", desc: "Ongoing support with termination events", text: "[PAYOR] shall pay [RECIPIENT] spousal support/maintenance of $[AMOUNT] per month, beginning [DATE], and continuing until the earliest of: (a) death of either party; (b) remarriage of [RECIPIENT]; (c) cohabitation of [RECIPIENT] with an unrelated adult in a relationship analogous to marriage for [6] or more months; or (d) further order of the court." },
  { id: "ss-lump", cat: "Spousal Support", title: "Lump-Sum Payment", desc: "One-time payment in lieu of ongoing support", text: "In lieu of ongoing spousal support/maintenance, [PAYOR] shall pay [RECIPIENT] a lump sum of $[AMOUNT], payable on or before [DATE]. Upon receipt of this payment, [RECIPIENT] waives all claims to future spousal support/maintenance. This provision is non-modifiable." },
  { id: "ss-step-down", cat: "Spousal Support", title: "Step-Down Support", desc: "Support that decreases over time", text: "[PAYOR] shall pay [RECIPIENT] spousal support as follows: $[AMOUNT] per month for years 1-2; $[AMOUNT] per month for years 3-4; $[AMOUNT] per month for year 5. Support shall terminate entirely after [DATE]. This schedule reflects [RECIPIENT]'s anticipated increase in earning capacity." },

  // Property Division
  { id: "prop-home-sale", cat: "Property Division", title: "Marital Home — Sale", desc: "Home to be sold and proceeds divided", text: "The marital residence at [ADDRESS] shall be listed for sale within [30/60/90] days of the date of this agreement, at a listing price agreed upon by both parties or, if they cannot agree, at the price recommended by a mutually selected licensed appraiser. Net proceeds (after payment of the mortgage, closing costs, and real estate commissions) shall be divided [50/50 or __/__]%." },
  { id: "prop-home-buyout", cat: "Property Division", title: "Marital Home — Buyout", desc: "One party keeps the home and buys out the other's interest", text: "[PARENT A] shall retain the marital residence at [ADDRESS] and shall pay [PARENT B] $[AMOUNT] representing [PARENT B]'s equity interest, payable by [DATE]. [PARENT A] shall refinance the mortgage into their sole name within [90/180] days and shall hold [PARENT B] harmless from any liability on the current mortgage." },
  { id: "prop-qdro", cat: "Property Division", title: "Retirement Account — QDRO", desc: "Retirement account split via qualified order", text: "[PARENT A]'s [401(k)/pension/403(b)] account at [EMPLOYER/INSTITUTION] shall be divided by Qualified Domestic Relations Order (QDRO). [PARENT B] shall receive [50]% of the marital portion of the account, calculated from the date of marriage [DATE] to the date of separation [DATE]. The parties shall equally share the cost of preparing the QDRO." },
  { id: "prop-vehicles", cat: "Property Division", title: "Vehicle Assignment", desc: "Each party keeps designated vehicles", text: "[PARENT A] shall retain the [YEAR MAKE MODEL] (VIN: ______) and shall be solely responsible for all associated payments, insurance, and maintenance. [PARENT B] shall retain the [YEAR MAKE MODEL] (VIN: ______) under the same terms. Each party shall execute any necessary title transfer documents within [30] days." },

  // Safety & Boundaries
  { id: "safe-supervised", cat: "Safety & Boundaries", title: "Supervised Visitation", desc: "Parenting time monitored by third party", text: "[PARENT B]'s parenting time shall be supervised by [a professional supervisor at FACILITY / NAMED FAMILY MEMBER] until [DATE or CONDITION]. Supervision costs shall be paid by [PARENT B / split equally]. Transition to unsupervised time shall be reviewed on [DATE] and shall require [agreement of both parties / court approval / recommendation of therapist]." },
  { id: "safe-no-contact", cat: "Safety & Boundaries", title: "Limited Contact — Co-Parenting App Only", desc: "No direct communication except through app", text: "The parties shall have no direct contact (in person, by phone, by text, or by email) except through [CO-PARENTING APP]. All communication shall be limited to matters directly related to the children. Emergency communications regarding immediate child safety may be made by phone. Violations of this provision may be addressed through the dispute resolution process." },
  { id: "safe-drug-test", cat: "Safety & Boundaries", title: "Substance Testing Requirement", desc: "Drug/alcohol testing as condition of parenting time", text: "[PARENT] shall submit to [random/scheduled] [urine/hair follicle/breathalyzer] testing at [FREQUENCY]. Testing shall be conducted by [FACILITY]. If any test is positive for [SUBSTANCES], [PARENT]'s parenting time shall immediately convert to supervised until [CONDITION]. Costs of testing shall be borne by [PARENT / split equally]." },
  { id: "safe-rofr", cat: "Safety & Boundaries", title: "Right of First Refusal", desc: "Offer other parent before using childcare", text: "If either parent will be absent from the children for more than [4/6/8] consecutive hours during their parenting time, that parent shall first offer the other parent the opportunity to care for the children during the absence. The offering parent shall provide at least [24] hours' notice when possible. The other parent shall respond within [2] hours. If they decline or do not respond, the offering parent may arrange alternative childcare." },
  { id: "safe-new-partners", cat: "Safety & Boundaries", title: "Introduction of New Partners", desc: "Timeline for introducing significant others to children", text: "Neither party shall introduce a new romantic partner to the children until the relationship has been ongoing for at least [6] months. Neither party shall have a romantic partner stay overnight while the children are present until the relationship has been ongoing for at least [12] months or the parties otherwise agree in writing." },
];

const CATEGORIES = [...new Set(CLAUSES.map((c) => c.cat))];

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

export default function ClauseLibrary() {
  const stored = loadFromStorage();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [saved, setSaved] = useState(new Set(stored?.saved || []));
  const [copied, setCopied] = useState(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => { saveToStorage({ saved: [...saved] }); }, [saved]);

  const toggleSaved = (id) => { const n = new Set(saved); n.has(id) ? n.delete(id) : n.add(id); setSaved(n); };
  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const copyClause = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = CLAUSES.filter((c) => {
    if (showSaved && !saved.has(c.id)) return false;
    if (filterCat !== "all" && c.cat !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.text.toLowerCase().includes(q);
    }
    return true;
  });

  const exportSaved = () => {
    const savedClauses = CLAUSES.filter((c) => saved.has(c.id));
    if (!savedClauses.length) return;
    const lines = ["AGREEMENT CLAUSE COLLECTION", "=".repeat(50), "Generated: " + new Date().toLocaleDateString(), "Clauses: " + savedClauses.length, ""];
    let lastCat = "";
    savedClauses.forEach((c) => {
      if (c.cat !== lastCat) { lines.push("", "## " + c.cat, "-".repeat(40)); lastCat = c.cat; }
      lines.push("", "### " + c.title, c.desc, "", c.text);
    });
    lines.push("", "", "NOTE: These clauses are templates with [BLANKS] for customization.", "Have all agreement language reviewed by independent legal counsel.");
    downloadFile(lines.join("\n"), "clause-collection-" + new Date().toISOString().slice(0, 10) + ".txt");
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Agreement Clause Library</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Pre-written clause templates for agreement drafting. Copy, customize, and build your agreement.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clauses..." aria-label="Search clauses" style={{ flex: 1, padding: 8, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
        <button onClick={() => setShowSaved(!showSaved)} style={{
          padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
          border: showSaved ? "2px solid #f59e0b" : "1px solid #cbd5e1",
          background: showSaved ? "#fef3c7" : "#fff",
          color: showSaved ? "#92400e" : "#64748b", fontWeight: showSaved ? 600 : 400,
        }}>My Clauses ({saved.size})</button>
        {saved.size > 0 && (
          <button onClick={exportSaved} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 12 }} aria-label="Download saved clauses">Download</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setFilterCat("all")} style={{
          padding: "3px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer",
          border: filterCat === "all" ? "2px solid #2563eb" : "1px solid #e2e8f0",
          background: filterCat === "all" ? "#dbeafe" : "#fff",
          color: filterCat === "all" ? "#1e40af" : "#64748b",
          fontWeight: filterCat === "all" ? 600 : 400,
        }}>All ({CLAUSES.length})</button>
        {CATEGORIES.map((cat) => {
          const count = CLAUSES.filter((c) => c.cat === cat).length;
          return (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              padding: "3px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer",
              border: filterCat === cat ? "2px solid #2563eb" : "1px solid #e2e8f0",
              background: filterCat === cat ? "#dbeafe" : "#fff",
              color: filterCat === cat ? "#1e40af" : "#64748b",
              fontWeight: filterCat === cat ? 600 : 400,
            }}>{cat} ({count})</button>
          );
        })}
      </div>

      {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No clauses match your search.</div>}

      {filtered.map((c) => (
        <div key={c.id} style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: saved.has(c.id) ? "#fffbeb" : "#fff" }}>
          <button onClick={() => toggleExpand(c.id)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
          }} aria-expanded={expanded === c.id}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{c.cat} — {c.desc}</div>
            </div>
            <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>{expanded === c.id ? "[-]" : "[+]"}</span>
          </button>
          {expanded === c.id && (
            <div style={{ padding: "0 14px 12px" }}>
              <div style={{ padding: 12, background: "#f8fafc", borderRadius: 6, fontSize: 13, color: "#334155", lineHeight: 1.6, marginBottom: 8, border: "1px solid #e2e8f0", whiteSpace: "pre-wrap" }}>{c.text}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => copyClause(c.id, c.text)} style={{ padding: "4px 12px", borderRadius: 4, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                  {copied === c.id ? "Copied" : "Copy"}
                </button>
                <button onClick={() => toggleSaved(c.id)} style={{
                  padding: "4px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                  border: saved.has(c.id) ? "1px solid #f59e0b" : "1px solid #cbd5e1",
                  background: saved.has(c.id) ? "#fef3c7" : "#fff",
                  color: saved.has(c.id) ? "#92400e" : "#64748b",
                }}>{saved.has(c.id) ? "Remove from My Clauses" : "Save to My Clauses"}</button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 16, padding: 10, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
        These clauses are templates with [BLANKS] for customization. They are starting points — not final legal language. All agreement terms should be reviewed by each party's independent attorney before signing.
      </div>
    </div>
  );
}
