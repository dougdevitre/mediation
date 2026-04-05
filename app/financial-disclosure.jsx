import { useState, useEffect } from "react";

const STORAGE_KEY = "mediation-financial-disclosure";

const INCOME_FIELDS = [
  { id: "employment", label: "Employment income (gross monthly)", placeholder: "$0.00" },
  { id: "self_employment", label: "Self-employment / business income (gross monthly)", placeholder: "$0.00" },
  { id: "bonuses", label: "Bonuses / commissions (average monthly)", placeholder: "$0.00" },
  { id: "investment", label: "Investment / rental income (monthly)", placeholder: "$0.00" },
  { id: "retirement_income", label: "Retirement / pension / Social Security (monthly)", placeholder: "$0.00" },
  { id: "child_support_received", label: "Child support received (from other cases)", placeholder: "$0.00" },
  { id: "other_income", label: "Other income (monthly)", placeholder: "$0.00" },
];

const EXPENSE_CATEGORIES = [
  {
    name: "Housing",
    items: [
      { id: "mortgage_rent", label: "Mortgage / rent" },
      { id: "property_tax", label: "Property taxes" },
      { id: "homeowners_ins", label: "Homeowners / renters insurance" },
      { id: "hoa", label: "HOA / condo fees" },
      { id: "maintenance", label: "Home maintenance / repairs" },
      { id: "utilities", label: "Utilities (electric, gas, water, trash)" },
      { id: "internet_phone", label: "Internet / phone / cable" },
    ],
  },
  {
    name: "Transportation",
    items: [
      { id: "car_payment", label: "Car payment(s)" },
      { id: "car_insurance", label: "Auto insurance" },
      { id: "gas", label: "Gas / fuel" },
      { id: "car_maintenance", label: "Car maintenance / registration" },
      { id: "parking_tolls", label: "Parking / tolls / transit" },
    ],
  },
  {
    name: "Children",
    items: [
      { id: "childcare", label: "Childcare / daycare / after-school" },
      { id: "child_activities", label: "Activities / sports / lessons" },
      { id: "child_clothing", label: "Children's clothing" },
      { id: "school_expenses", label: "School supplies / tuition / fees" },
      { id: "child_medical", label: "Children's medical / dental / vision (out-of-pocket)" },
      { id: "child_other", label: "Other child-related expenses" },
    ],
  },
  {
    name: "Health & Insurance",
    items: [
      { id: "health_insurance", label: "Health insurance premiums" },
      { id: "medical_copays", label: "Medical / dental / vision (out-of-pocket)" },
      { id: "therapy", label: "Therapy / counseling" },
      { id: "prescriptions", label: "Prescriptions" },
      { id: "life_insurance", label: "Life insurance" },
    ],
  },
  {
    name: "Personal & Living",
    items: [
      { id: "groceries", label: "Groceries / household supplies" },
      { id: "clothing", label: "Clothing (yours)" },
      { id: "personal_care", label: "Personal care / hygiene" },
      { id: "dining", label: "Dining out" },
      { id: "entertainment", label: "Entertainment / recreation" },
      { id: "subscriptions", label: "Subscriptions / memberships" },
      { id: "pets_exp", label: "Pet expenses" },
    ],
  },
  {
    name: "Debt Payments",
    items: [
      { id: "credit_cards", label: "Credit card minimum payments" },
      { id: "student_loans", label: "Student loan payments" },
      { id: "personal_loans", label: "Personal loans" },
      { id: "other_debt", label: "Other debt payments" },
    ],
  },
  {
    name: "Savings & Other",
    items: [
      { id: "retirement_contrib", label: "Retirement contributions" },
      { id: "savings", label: "Savings" },
      { id: "charitable", label: "Charitable / religious giving" },
      { id: "legal_fees", label: "Legal fees (current)" },
      { id: "other_expenses", label: "Other expenses" },
    ],
  },
];

const ASSET_CATEGORIES = [
  { id: "home_value", label: "Primary residence (estimated value)", category: "Real Estate" },
  { id: "other_property", label: "Other real estate", category: "Real Estate" },
  { id: "checking", label: "Checking accounts", category: "Bank Accounts" },
  { id: "savings_acct", label: "Savings accounts", category: "Bank Accounts" },
  { id: "retirement_401k", label: "401(k) / 403(b)", category: "Retirement" },
  { id: "ira", label: "IRA / Roth IRA", category: "Retirement" },
  { id: "pension", label: "Pension (estimated value)", category: "Retirement" },
  { id: "brokerage", label: "Brokerage / investment accounts", category: "Investments" },
  { id: "vehicles", label: "Vehicles (current value)", category: "Personal Property" },
  { id: "business_value", label: "Business interest (estimated value)", category: "Business" },
  { id: "other_assets", label: "Other significant assets", category: "Other" },
];

const DEBT_ITEMS = [
  { id: "mortgage_bal", label: "Mortgage balance", category: "Secured" },
  { id: "home_equity", label: "Home equity loan / HELOC", category: "Secured" },
  { id: "auto_loan", label: "Auto loan(s)", category: "Secured" },
  { id: "credit_card_bal", label: "Credit card balances (total)", category: "Unsecured" },
  { id: "student_loan_bal", label: "Student loans", category: "Unsecured" },
  { id: "personal_loan_bal", label: "Personal loans", category: "Unsecured" },
  { id: "medical_debt", label: "Medical debt", category: "Unsecured" },
  { id: "tax_debt", label: "Tax debt owed", category: "Unsecured" },
  { id: "other_debt_bal", label: "Other debts", category: "Unsecured" },
];

const SECTIONS = [
  { id: "income", label: "Monthly Income" },
  { id: "expenses", label: "Monthly Expenses" },
  { id: "assets", label: "Assets" },
  { id: "debts", label: "Debts" },
  { id: "summary", label: "Summary" },
];

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function parseMoney(val) {
  const cleaned = (val || "").replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const normalized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : Math.max(0, n);
}

function fmt(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

export default function FinancialDisclosure() {
  const [values, setValues] = useState(() => loadFromStorage());
  const [section, setSection] = useState(0);

  useEffect(() => { saveToStorage(values); }, [values]);

  const set = (id, val) => setValues({ ...values, [id]: val });
  const get = (id) => values[id] || "";
  const getNum = (id) => parseMoney(values[id]);

  const totalIncome = INCOME_FIELDS.reduce((s, f) => s + getNum(f.id), 0);
  const totalExpenses = EXPENSE_CATEGORIES.reduce((s, cat) => s + cat.items.reduce((s2, i) => s2 + getNum(i.id), 0), 0);
  const totalAssets = ASSET_CATEGORIES.reduce((s, a) => s + getNum(a.id), 0);
  const totalDebts = DEBT_ITEMS.reduce((s, d) => s + getNum(d.id), 0);
  const netWorth = totalAssets - totalDebts;
  const monthlyBalance = totalIncome - totalExpenses;

  const clearAll = () => { setValues({}); setSection(0); };

  const exportReport = () => {
    const lines = [
      "FINANCIAL DISCLOSURE WORKSHEET",
      "=".repeat(50),
      "Generated: " + new Date().toLocaleDateString(),
      "CONFIDENTIAL — For mediation preparation only",
      "",
      "MONTHLY INCOME: " + fmt(totalIncome),
      "-".repeat(30),
    ];
    INCOME_FIELDS.forEach((f) => {
      const v = getNum(f.id);
      if (v > 0) lines.push("  " + f.label + ": " + fmt(v));
    });
    lines.push("");
    lines.push("MONTHLY EXPENSES: " + fmt(totalExpenses));
    lines.push("-".repeat(30));
    EXPENSE_CATEGORIES.forEach((cat) => {
      const catTotal = cat.items.reduce((s, i) => s + getNum(i.id), 0);
      if (catTotal > 0) {
        lines.push("  " + cat.name + ": " + fmt(catTotal));
        cat.items.forEach((i) => {
          const v = getNum(i.id);
          if (v > 0) lines.push("    " + i.label + ": " + fmt(v));
        });
      }
    });
    lines.push("");
    lines.push("MONTHLY BALANCE: " + fmt(monthlyBalance));
    lines.push("");
    lines.push("ASSETS: " + fmt(totalAssets));
    lines.push("-".repeat(30));
    ASSET_CATEGORIES.forEach((a) => {
      const v = getNum(a.id);
      if (v > 0) lines.push("  " + a.label + ": " + fmt(v));
    });
    lines.push("");
    lines.push("DEBTS: " + fmt(totalDebts));
    lines.push("-".repeat(30));
    DEBT_ITEMS.forEach((d) => {
      const v = getNum(d.id);
      if (v > 0) lines.push("  " + d.label + ": " + fmt(v));
    });
    lines.push("");
    lines.push("NET WORTH: " + fmt(netWorth));
    lines.push("");
    lines.push("NOTE: This worksheet is for your personal mediation preparation.");
    lines.push("Accuracy matters — incomplete or inaccurate financial disclosure");
    lines.push("can delay mediation and increase costs. Consult your attorney");
    lines.push("about any required formal financial disclosures in your jurisdiction.");
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(lines.join("\n"), "financial-disclosure-" + date + ".txt");
  };

  const cardStyle = { padding: 16, marginBottom: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" };
  const inputStyle = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, width: 120, textAlign: "right", boxSizing: "border-box" };
  const btnPrimary = { padding: "8px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13 };
  const btnSecondary = { padding: "8px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1e293b" }}>Financial Disclosure Worksheet</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>Organize your finances before mediation. Complete disclosure saves sessions and money.</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => setSection(i)} aria-current={section === i ? "step" : undefined} style={{
            padding: "4px 12px", borderRadius: 12, fontSize: 12, cursor: "pointer",
            border: section === i ? "2px solid #2563eb" : "1px solid #e2e8f0",
            background: section === i ? "#dbeafe" : "#fff",
            color: section === i ? "#1e40af" : "#64748b",
            fontWeight: section === i ? 600 : 400,
          }}>{s.label}</button>
        ))}
      </div>

      {/* At-a-glance bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        <div style={{ textAlign: "center", padding: 10, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>{fmt(totalIncome)}</div>
          <div style={{ fontSize: 11, color: "#166534" }}>Monthly Income</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>{fmt(totalExpenses)}</div>
          <div style={{ fontSize: 11, color: "#991b1b" }}>Monthly Expenses</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: totalAssets > 0 ? "#eff6ff" : "#f8fafc", borderRadius: 8, border: "1px solid #bfdbfe" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1d4ed8" }}>{fmt(totalAssets)}</div>
          <div style={{ fontSize: 11, color: "#1e40af" }}>Assets</div>
        </div>
        <div style={{ textAlign: "center", padding: 10, background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ca8a04" }}>{fmt(totalDebts)}</div>
          <div style={{ fontSize: 11, color: "#854d0e" }}>Debts</div>
        </div>
      </div>

      {/* Section 0: Income */}
      {section === 0 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#0f172a" }}>Monthly Income</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Enter gross (before-tax) monthly amounts. Use average for irregular income.</p>
            {INCOME_FIELDS.map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <label htmlFor={"inc-" + f.id} style={{ fontSize: 14, color: "#1e293b" }}>{f.label}</label>
                <input id={"inc-" + f.id} type="text" inputMode="decimal" value={get(f.id)} onChange={(e) => set(f.id, e.target.value)} placeholder="$0" style={inputStyle} />
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
              <span>Total Monthly Income</span>
              <span>{fmt(totalIncome)}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setSection(1)} style={btnPrimary}>Next: Monthly Expenses</button>
          </div>
        </div>
      )}

      {/* Section 1: Expenses */}
      {section === 1 && (
        <div>
          {EXPENSE_CATEGORIES.map((cat) => {
            const catTotal = cat.items.reduce((s, i) => s + getNum(i.id), 0);
            return (
              <div key={cat.name} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: "#0f172a" }}>{cat.name}</h3>
                  {catTotal > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{fmt(catTotal)}</span>}
                </div>
                {cat.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <label htmlFor={"exp-" + item.id} style={{ fontSize: 13, color: "#334155" }}>{item.label}</label>
                    <input id={"exp-" + item.id} type="text" inputMode="decimal" value={get(item.id)} onChange={(e) => set(item.id, e.target.value)} placeholder="$0" style={{ ...inputStyle, width: 100, fontSize: 13 }} />
                  </div>
                ))}
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", padding: 12, background: monthlyBalance >= 0 ? "#f0fdf4" : "#fef2f2", borderRadius: 8, marginBottom: 16, fontWeight: 700 }}>
            <span style={{ color: "#0f172a" }}>Monthly Balance (Income - Expenses)</span>
            <span style={{ color: monthlyBalance >= 0 ? "#16a34a" : "#dc2626" }}>{fmt(monthlyBalance)} {monthlyBalance >= 0 ? "(surplus)" : "(deficit)"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setSection(0)} style={btnSecondary}>Back</button>
            <button onClick={() => setSection(2)} style={btnPrimary}>Next: Assets</button>
          </div>
        </div>
      )}

      {/* Section 2: Assets */}
      {section === 2 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Assets</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Enter current estimated values. Include both marital and separate property — your mediator can help sort out what's what.</p>
            {["Real Estate", "Bank Accounts", "Retirement", "Investments", "Personal Property", "Business", "Other"].map((cat) => {
              const items = ASSET_CATEGORIES.filter((a) => a.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{cat}</div>
                  {items.map((a) => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <label htmlFor={"asset-" + a.id} style={{ fontSize: 14, color: "#1e293b" }}>{a.label}</label>
                      <input id={"asset-" + a.id} type="text" inputMode="decimal" value={get(a.id)} onChange={(e) => set(a.id, e.target.value)} placeholder="$0" style={inputStyle} />
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
              <span>Total Assets</span>
              <span>{fmt(totalAssets)}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setSection(1)} style={btnSecondary}>Back</button>
            <button onClick={() => setSection(3)} style={btnPrimary}>Next: Debts</button>
          </div>
        </div>
      )}

      {/* Section 3: Debts */}
      {section === 3 && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>Debts & Liabilities</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>Enter current balances owed.</p>
            {["Secured", "Unsecured"].map((cat) => {
              const items = DEBT_ITEMS.filter((d) => d.category === cat);
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{cat} Debt</div>
                  {items.map((d) => (
                    <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <label htmlFor={"debt-" + d.id} style={{ fontSize: 14, color: "#1e293b" }}>{d.label}</label>
                      <input id={"debt-" + d.id} type="text" inputMode="decimal" value={get(d.id)} onChange={(e) => set(d.id, e.target.value)} placeholder="$0" style={inputStyle} />
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
              <span>Total Debts</span>
              <span>{fmt(totalDebts)}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setSection(2)} style={btnSecondary}>Back</button>
            <button onClick={() => setSection(4)} style={btnPrimary}>View Summary</button>
          </div>
        </div>
      )}

      {/* Section 4: Summary */}
      {section === 4 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Financial Summary</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={exportReport} style={{ ...btnPrimary, background: "#16a34a" }} aria-label="Download financial summary">Download</button>
              <button onClick={clearAll} style={{ ...btnSecondary, fontSize: 12 }}>Start Over</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{fmt(totalIncome)}</div>
              <div style={{ fontSize: 12, color: "#166534" }}>Monthly Income</div>
            </div>
            <div style={{ padding: 16, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626" }}>{fmt(totalExpenses)}</div>
              <div style={{ fontSize: 12, color: "#991b1b" }}>Monthly Expenses</div>
            </div>
            <div style={{ padding: 16, background: monthlyBalance >= 0 ? "#f0fdf4" : "#fef2f2", borderRadius: 8, border: "1px solid " + (monthlyBalance >= 0 ? "#bbf7d0" : "#fecaca") }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: monthlyBalance >= 0 ? "#16a34a" : "#dc2626" }}>{fmt(monthlyBalance)}</div>
              <div style={{ fontSize: 12, color: monthlyBalance >= 0 ? "#166534" : "#991b1b" }}>Monthly Balance {monthlyBalance >= 0 ? "(surplus)" : "(deficit)"}</div>
            </div>
            <div style={{ padding: 16, background: netWorth >= 0 ? "#eff6ff" : "#fef2f2", borderRadius: 8, border: "1px solid " + (netWorth >= 0 ? "#bfdbfe" : "#fecaca") }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: netWorth >= 0 ? "#1d4ed8" : "#dc2626" }}>{fmt(netWorth)}</div>
              <div style={{ fontSize: 12, color: netWorth >= 0 ? "#1e40af" : "#991b1b" }}>Net Worth {netWorth >= 0 ? "(positive)" : "(negative)"}</div>
            </div>
          </div>

          {/* Expense breakdown */}
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "#0f172a" }}>Expense Breakdown</h4>
            {EXPENSE_CATEGORIES.map((cat) => {
              const catTotal = cat.items.reduce((s, i) => s + getNum(i.id), 0);
              if (catTotal === 0) return null;
              const pct = totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0;
              return (
                <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <span style={{ fontSize: 13, color: "#334155" }}>{cat.name}</span>
                  <span style={{ fontSize: 13, color: "#475569" }}>{fmt(catTotal)} ({pct}%)</span>
                </div>
              );
            })}
          </div>

          <div style={{ padding: 12, background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#92400e", marginBottom: 12 }}>
            <strong>Important:</strong> This is your personal worksheet. Accuracy matters — incomplete or inaccurate financial disclosure can delay mediation and increase costs. Your mediator may ask you to provide supporting documents for the figures above.
          </div>
          <div style={{ padding: 12, background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#1e40af" }}>
            Download this summary and bring it to your mediation session. Consider sharing it with your attorney if you have one.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 16 }}>
            <button onClick={() => setSection(3)} style={btnSecondary}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
