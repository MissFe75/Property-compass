"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PdfModal from "../../components/PdfModal";

function parseMoney(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

function parsePercent(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

function formatMoney(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${Math.abs(rounded).toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function handleMoneyChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (v: string) => void
) {
  const el = e.target;
  const cursorPos = el.selectionStart ?? 0;
  const digitsBeforeCursor = el.value.slice(0, cursorPos).replace(/\D/g, "").length;
  const digits = el.value.replace(/\D/g, "");
  const formatted = digits ? parseInt(digits, 10).toLocaleString("en-AU") : "";
  setter(formatted);
  requestAnimationFrame(() => {
    if (digitsBeforeCursor === 0) { el.setSelectionRange(0, 0); return; }
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) count++;
      if (count === digitsBeforeCursor) { el.setSelectionRange(i + 1, i + 1); return; }
    }
    el.setSelectionRange(formatted.length, formatted.length);
  });
}

function focusField(n: number) {
  document.querySelector<HTMLElement>(`[tabindex="${n}"]`)?.focus();
}

function calculateMonthlyRepayment(loan: number, rate: number, years: number): number {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  if (loan <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return loan / months;
  return (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

function useProperty(defaults: { price: string; deposit: string; rent: string; expenses: string; rate: string }) {
  const [price, setPrice] = useState(defaults.price);
  const [deposit, setDeposit] = useState(defaults.deposit);
  const [rent, setRent] = useState(defaults.rent);
  const [expenses, setExpenses] = useState(defaults.expenses);
  const [rate, setRate] = useState(defaults.rate);

  const priceNum = parseMoney(price);
  const loanAmount = priceNum - parseMoney(deposit);
  const annualRent = parseMoney(rent) * 52;
  const annualExpenses = parseMoney(expenses);
  const netIncome = annualRent - annualExpenses;
  const monthly = calculateMonthlyRepayment(loanAmount, parsePercent(rate), 30);
  const grossYield = priceNum > 0 ? (annualRent / priceNum) * 100 : 0;
  const netYield = priceNum > 0 ? (netIncome / priceNum) * 100 : 0;
  const weeklyCashflow = (netIncome - monthly * 12) / 52;

  return { price, setPrice, deposit, setDeposit, rent, setRent, expenses, setExpenses, rate, setRate, loanAmount, monthly, grossYield, netYield, weeklyCashflow };
}

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold transition"
        style={{ backgroundColor: "#E7E0D6", color: "#64748B" }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="More info"
      >?</button>
      {show && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-2xl border p-3 text-xs shadow-lg"
          style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6", color: "#64748B" }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

function FreqToggle({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <span className="inline-flex overflow-hidden rounded-xl border" style={{ borderColor: "#E7E0D6" }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="px-2 py-0.5 text-[10px] font-medium transition"
          style={{
            backgroundColor: value === opt ? "#3D5A80" : "white",
            color: value === opt ? "white" : "#64748B",
          }}
        >{opt}</button>
      ))}
    </span>
  );
}

export default function ComparePage() {
  const router = useRouter();

  const a = useProperty({ price: "600,000", deposit: "120,000", rent: "580", expenses: "8,000", rate: "6.25" });
  const b = useProperty({ price: "750,000", deposit: "150,000", rent: "720", expenses: "10,000", rate: "6.25" });
  const c = useProperty({ price: "850,000", deposit: "170,000", rent: "820", expenses: "12,000", rate: "6.25" });

  const [nameA, setNameA] = useState("Property A");
  const [nameB, setNameB] = useState("Property B");
  const [nameC, setNameC] = useState("Property C");

  const [displayFreq, setDisplayFreq] = useState("Monthly");
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    function syncFromAnalyser() {
      try {
        const saved = localStorage.getItem("pc_analyser");
        if (!saved) return;
        const { price, deposit, rent, rentFreq, expenses, rate } = JSON.parse(saved);
        if (price) a.setPrice(price);
        if (deposit) a.setDeposit(deposit);
        if (rent) {
          const mult = rentFreq === "Fortnightly" ? 26 : rentFreq === "Monthly" ? 12 : rentFreq === "Yearly" ? 1 : 52;
          const weekly = Math.round(parseMoney(rent) * mult / 52);
          a.setRent(weekly.toLocaleString("en-AU"));
        }
        if (expenses) a.setExpenses(expenses);
        if (rate) a.setRate(rate);
      } catch {}
    }
    syncFromAnalyser();
    window.addEventListener("storage", syncFromAnalyser);
    return () => window.removeEventListener("storage", syncFromAnalyser);
  }, []);

  function repaymentForFreq(monthly: number): number {
    if (displayFreq === "Weekly") return monthly * 12 / 52;
    if (displayFreq === "Fortnightly") return monthly * 12 / 26;
    return monthly;
  }

  function cashflowForFreq(weeklyCashflow: number): number {
    if (displayFreq === "Weekly") return weeklyCashflow;
    if (displayFreq === "Fortnightly") return weeklyCashflow * 2;
    return weeklyCashflow * (52 / 12);
  }

  function inputField(label: string, value: string, setter: (v: string) => void, isMoney = true, suffix = "", tabIdx?: number) {
    return (
      <div key={label}>
        <label className="mb-2 block text-xs font-medium" style={{ color: "#3D5A80" }}>{label}</label>
        <div className="flex items-center rounded-2xl border bg-white px-3 py-2.5" style={{ borderColor: "#E7E0D6" }}>
          {isMoney && <span className="mr-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>$</span>}
          <input
            type="text"
            value={value}
            onChange={(e) => isMoney ? handleMoneyChange(e, setter) : setter(e.target.value)}
            tabIndex={tabIdx}
            onKeyDown={tabIdx !== undefined ? (e) => { if (e.key === "Enter") { e.preventDefault(); focusField(tabIdx + 1); } } : undefined}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#0F172A" }}
          />
          {suffix && <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>{suffix}</span>}
        </div>
      </div>
    );
  }

  function relativeColor(value: number, all: number[], higherIsBetter: boolean): string {
    const sorted = [...all].sort((x, y) => higherIsBetter ? y - x : x - y);
    const rank = sorted.findIndex(v => v === value);
    if (rank === 0) return "#49A078";
    if (rank === sorted.length - 1) return "#E53E3E";
    return "#D4A373";
  }

  const loans = [a.loanAmount, b.loanAmount, c.loanAmount];
  const monthlies = [a.monthly, b.monthly, c.monthly];
  const repaymentDisplays = monthlies.map(repaymentForFreq);
  const grossYields = [a.grossYield, b.grossYield, c.grossYield];
  const netYields = [a.netYield, b.netYield, c.netYield];
  const weeklyCashflows = [a.weeklyCashflow, b.weeklyCashflow, c.weeklyCashflow];
  const cashflowDisplays = weeklyCashflows.map(cashflowForFreq);

  const metrics = [
    {
      rowKey: "loan",
      label: "Loan amount",
      info: null,
      values: loans.map(formatMoney),
      colors: loans.map(v => relativeColor(v, loans, false)),
    },
    {
      rowKey: "repayment",
      label: `${displayFreq} repayment`,
      info: null,
      values: repaymentDisplays.map(formatMoney),
      colors: monthlies.map(v => relativeColor(v, monthlies, false)),
    },
    {
      rowKey: "cashflow",
      label: `${displayFreq} cashflow`,
      info: "Cash left over each period after mortgage repayments and expenses. Positive = property pays you; negative = you top it up.",
      values: cashflowDisplays.map(formatMoney),
      colors: weeklyCashflows.map(v => v > 50 ? "#49A078" : v > -10 ? "#D4A373" : "#E53E3E"),
    },
    {
      rowKey: "grossYield",
      label: "Gross yield",
      info: "Annual rent ÷ purchase price. A quick snapshot of rental income before costs are factored in.",
      values: grossYields.map(formatPercent),
      colors: grossYields.map(v => v >= 6 ? "#49A078" : v >= 4 ? "#D4A373" : "#E53E3E"),
    },
    {
      rowKey: "netYield",
      label: "Net yield",
      info: "Net income after expenses ÷ purchase price. A more realistic picture of your actual return.",
      values: netYields.map(formatPercent),
      colors: netYields.map(v => v >= 5 ? "#49A078" : v >= 3 ? "#D4A373" : "#E53E3E"),
    },
  ];

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(to bottom, #F5F0E8, #FFFFFF)" }}>

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ backgroundColor: "rgba(250,247,242,0.9)", borderColor: "#E7E0D6" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#556987" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <div>
              <p className="text-lg font-semibold leading-none tracking-tight sm:text-2xl" style={{ color: "#314A6E" }}>Property Compass</p>
              <p className="mt-1 text-xs" style={{ color: "#64748B" }}>by Sextant Digital</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <a href="/#tools" className="hidden rounded-2xl border px-5 py-2.5 text-sm font-medium transition hover:bg-white/70 sm:block" style={{ borderColor: "#3D5A80", color: "#314A6E" }}>All tools</a>
            <a href="/" className="rounded-2xl px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "#3D5A80", boxShadow: "0 4px 14px rgba(61,90,128,0.25)" }}>← Home</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/images/magnify.jpg")', backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-6 pt-14 pb-24 sm:px-8 md:min-h-[500px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.75)" }}>Property Compass</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Compare Properties</h1>
            <p className="mt-3 text-base text-white/75 sm:text-lg">Run up to three properties side by side to find the best performer across yield, cashflow, and loan costs.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>Navigate your next property move</p>
          <select value="/app/compare" onChange={(e) => router.push(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
            <option value="/app">Property Explorer</option>
            <option value="/app/mortgage">Mortgage Calculator</option>
            <option value="/app/yield">Yield Calculator</option>
            <option value="/app/cgt">Capital Gains Tax Estimator</option>
            <option value="/app/compare">Compare Properties</option>
          </select>
        </div>

        {/* ── Side by side inputs ── */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: nameA, setName: setNameA, p: a, accent: "#3D5A80" },
            { name: nameB, setName: setNameB, p: b, accent: "#49A078" },
            { name: nameC, setName: setNameC, p: c, accent: "#D4A373" },
          ].map(({ name, setName, p, accent }, index) => (
            <div key={name} className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-semibold outline-none"
                  style={{ color: "#0F172A" }}
                />
              </div>
              <p className="mb-4 rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: "#EEF2FF", color: "#3D5A80", visibility: index === 0 ? "visible" : "hidden" }}>
                ⟳ Live sync from Property Explorer
              </p>
              <div className="space-y-4">
                {inputField("Purchase price", p.price, p.setPrice, true, "", index * 5 + 1)}
                {inputField("Deposit", p.deposit, p.setDeposit, true, "", index * 5 + 2)}
                {inputField("Weekly rent", p.rent, p.setRent, true, "", index * 5 + 3)}
                {inputField("Annual expenses", p.expenses, p.setExpenses, true, "", index * 5 + 4)}
                {inputField("Interest rate", p.rate, p.setRate, false, "%", index * 5 + 5)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Comparison results ── */}
        <div className="mt-8 rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-xl font-semibold" style={{ color: "#0F172A" }}>Side by side</h2>
              <p className="text-sm" style={{ color: "#64748B" }}>Updates live as you type.</p>
            </div>
            <div className="flex items-center gap-3">
              <FreqToggle options={["Weekly", "Fortnightly", "Monthly"]} value={displayFreq} onChange={setDisplayFreq} />
              <button onClick={() => setShowPdf(true)} className="rounded-2xl border px-4 py-2 text-xs font-medium transition hover:bg-white" style={{ borderColor: "#E7E0D6", color: "#3D5A80" }}>Save as PDF</button>
            </div>
          </div>

          {/* Property name header */}
          <div className="mb-1 grid grid-cols-3 gap-6 border-b pb-3" style={{ borderColor: "#E7E0D6" }}>
            {[
              { name: nameA, accent: "#3D5A80" },
              { name: nameB, accent: "#49A078" },
              { name: nameC, accent: "#D4A373" },
            ].map(({ name, accent }) => (
              <div key={name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                <span className="text-sm font-semibold" style={{ color: accent }}>{name}</span>
              </div>
            ))}
          </div>

          {/* Metric rows */}
          <div className="divide-y" style={{ borderColor: "#E7E0D6" }}>
            {metrics.map(({ rowKey, label, info, values, colors }) => (
              <div key={rowKey} className="py-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#64748B" }}>
                  <span>{label}</span>
                  {info && <InfoTip text={info} />}
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {values.map((val, i) => (
                    <div key={i} className="text-base font-bold" style={{ color: colors[i] }}>{val}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showPdf && (
        <PdfModal
          title="Compare Properties"
          onClose={() => setShowPdf(false)}
          sections={[
            {
              heading: nameA,
              items: [
                { label: "Purchase price", value: `$${parseMoney(a.price).toLocaleString()}` },
                { label: "Deposit", value: `$${parseMoney(a.deposit).toLocaleString()}` },
                { label: "Weekly rent", value: `$${parseMoney(a.rent).toLocaleString()}` },
                { label: "Annual expenses", value: `$${parseMoney(a.expenses).toLocaleString()}` },
                { label: "Interest rate", value: `${a.rate}%` },
                { label: "Loan amount", value: formatMoney(a.loanAmount) },
                { label: "Monthly repayment", value: formatMoney(a.monthly) },
                { label: "Weekly cashflow", value: formatMoney(a.weeklyCashflow) },
                { label: "Gross yield", value: formatPercent(a.grossYield) },
                { label: "Net yield", value: formatPercent(a.netYield) },
              ],
            },
            {
              heading: nameB,
              items: [
                { label: "Purchase price", value: `$${parseMoney(b.price).toLocaleString()}` },
                { label: "Deposit", value: `$${parseMoney(b.deposit).toLocaleString()}` },
                { label: "Weekly rent", value: `$${parseMoney(b.rent).toLocaleString()}` },
                { label: "Annual expenses", value: `$${parseMoney(b.expenses).toLocaleString()}` },
                { label: "Interest rate", value: `${b.rate}%` },
                { label: "Loan amount", value: formatMoney(b.loanAmount) },
                { label: "Monthly repayment", value: formatMoney(b.monthly) },
                { label: "Weekly cashflow", value: formatMoney(b.weeklyCashflow) },
                { label: "Gross yield", value: formatPercent(b.grossYield) },
                { label: "Net yield", value: formatPercent(b.netYield) },
              ],
            },
            {
              heading: nameC,
              items: [
                { label: "Purchase price", value: `$${parseMoney(c.price).toLocaleString()}` },
                { label: "Deposit", value: `$${parseMoney(c.deposit).toLocaleString()}` },
                { label: "Weekly rent", value: `$${parseMoney(c.rent).toLocaleString()}` },
                { label: "Annual expenses", value: `$${parseMoney(c.expenses).toLocaleString()}` },
                { label: "Interest rate", value: `${c.rate}%` },
                { label: "Loan amount", value: formatMoney(c.loanAmount) },
                { label: "Monthly repayment", value: formatMoney(c.monthly) },
                { label: "Weekly cashflow", value: formatMoney(c.weeklyCashflow) },
                { label: "Gross yield", value: formatPercent(c.grossYield) },
                { label: "Net yield", value: formatPercent(c.netYield) },
              ],
            },
          ]}
        />
      )}
    </main>
  );
}
