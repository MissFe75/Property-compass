"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

function focusField(n: number) {
  document.querySelector<HTMLElement>(`[tabindex="${n}"]`)?.focus();
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

function calculateMonthlyRepayment(
  loanAmount: number,
  annualRatePercent: number,
  loanTermYears: number,
  repaymentType: string
): number {
  const monthlyRate = annualRatePercent / 100 / 12;
  const months = loanTermYears * 12;
  if (loanAmount <= 0 || months <= 0) return 0;
  if (repaymentType === "Interest Only") return loanAmount * monthlyRate;
  if (monthlyRate === 0) return loanAmount / months;
  return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

const TAX_RATES = [
  { label: "19% (up to $45k)", rate: 0.19 },
  { label: "32.5% ($45k–$120k)", rate: 0.325 },
  { label: "37% ($120k–$180k)", rate: 0.37 },
  { label: "45% (over $180k)", rate: 0.45 },
];

export default function MortgagePage() {
  const router = useRouter();

  const [loanPurpose, setLoanPurpose] = useState("Owner Occupier");
  const [purchasePrice, setPurchasePrice] = useState("650,000");
  const [deposit, setDeposit] = useState("130,000");
  const [interestRate, setInterestRate] = useState("6.25");
  const [loanTerm, setLoanTerm] = useState("30");
  const [repaymentType, setRepaymentType] = useState("Principal & Interest");
  const [repaymentFrequency, setRepaymentFrequency] = useState("Monthly");
  const [taxRate, setTaxRate] = useState("0.325");
  const [extraRepayment, setExtraRepayment] = useState("500");
  const [extraFrequency, setExtraFrequency] = useState("Monthly");

  const isInvestment = loanPurpose === "Investment";
  const loanAmount = parseMoney(purchasePrice) - parseMoney(deposit);
  const monthly = calculateMonthlyRepayment(loanAmount, parsePercent(interestRate), parseMoney(loanTerm), repaymentType);
  const originalMonths = parseMoney(loanTerm) * 12;
  const totalRepaid = monthly * originalMonths;
  const totalInterest = totalRepaid - (repaymentType === "Interest Only" ? 0 : loanAmount);
  const monthlyRate = parsePercent(interestRate) / 100 / 12;
  const monthlyInterest = loanAmount * monthlyRate;
  const taxSavingMonthly = isInvestment ? monthlyInterest * parseFloat(taxRate) : 0;
  const afterTaxMonthly = monthly - taxSavingMonthly;

  const freqPerYear = repaymentFrequency === "Monthly" ? 12 : repaymentFrequency === "Fortnightly" ? 26 : 52;
  const freqSuffix = repaymentFrequency === "Monthly" ? "/mo" : repaymentFrequency === "Fortnightly" ? "/fn" : "/wk";
  const repaymentDisplay = monthly * 12 / freqPerYear;
  const afterTaxDisplay = afterTaxMonthly * 12 / freqPerYear;
  const taxSavingDisplay = taxSavingMonthly * 12 / freqPerYear;

  const extraNum = parseMoney(extraRepayment);
  const extraFreqPerYear = extraFrequency === "Monthly" ? 12 : extraFrequency === "Fortnightly" ? 26 : 52;
  const extraSuffix = extraFrequency === "Monthly" ? "/mo" : extraFrequency === "Fortnightly" ? "/fn" : "/wk";
  const extraMonthlyEquiv = extraNum * extraFreqPerYear / 12;
  let yearsSaved = 0;
  let interestSaved = 0;
  if (extraMonthlyEquiv > 0 && repaymentType === "Principal & Interest" && loanAmount > 0 && monthlyRate > 0) {
    const newPayment = monthly + extraMonthlyEquiv;
    const newMonths = Math.log(1 - (loanAmount * monthlyRate) / newPayment) / Math.log(1 + monthlyRate) * -1;
    if (newMonths > 0 && newMonths < originalMonths) {
      yearsSaved = (originalMonths - newMonths) / 12;
      interestSaved = totalInterest - (newPayment * newMonths - loanAmount);
    }
  }

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
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/images/coins.jpg")', backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-6 pt-14 pb-24 sm:px-8 md:min-h-[500px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.75)" }}>Property Compass</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Mortgage Calculator</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>Navigate your next property move</p>
          <select value="/app/mortgage" onChange={(e) => router.push(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
            <option value="/app">Property Analyser</option>
            <option value="/app/mortgage">Mortgage Calculator</option>
            <option value="/app/yield">Yield Calculator</option>
            <option value="/app/cgt">Capital Gains Tax Estimator</option>
            <option value="/app/compare">Compare Properties</option>
          </select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── Inputs ── */}
          <div className="space-y-6">

            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Loan Details</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Enter the property and loan details.</p>

              <div className="mt-4">
                <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                  {["Owner Occupier", "Investment"].map((type) => (
                    <button key={type} type="button" onClick={() => setLoanPurpose(type)}
                      className="flex-1 py-3 text-sm font-medium transition"
                      style={{ backgroundColor: loanPurpose === type ? "#3D5A80" : "transparent", color: loanPurpose === type ? "#FFFFFF" : "#64748B" }}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Repayment frequency</label>
                <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                  {["Weekly", "Fortnightly", "Monthly"].map((freq) => (
                    <button key={freq} type="button" onClick={() => setRepaymentFrequency(freq)}
                      className="flex-1 py-3 text-sm font-medium transition"
                      style={{ backgroundColor: repaymentFrequency === freq ? "#3D5A80" : "transparent", color: repaymentFrequency === freq ? "#FFFFFF" : "#64748B" }}>
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Purchase price</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={purchasePrice} onChange={(e) => handleMoneyChange(e, setPurchasePrice)} tabIndex={1} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(2); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Deposit</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={deposit} onChange={(e) => handleMoneyChange(e, setDeposit)} tabIndex={2} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(3); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>

                <div className="sm:col-span-2 rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                  <p className="text-sm font-medium" style={{ color: "#3D5A80" }}>Loan amount</p>
                  <p className="mt-1 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatMoney(loanAmount)}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Interest rate (%)</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <input type="text" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} tabIndex={3} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none" style={{ color: "#64748B" }}>%</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Loan term (years)</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <input type="text" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} tabIndex={4} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(5); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Repayment type</label>
                  <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                    {["Principal & Interest", "Interest Only"].map((type) => (
                      <button key={type} type="button" onClick={() => setRepaymentType(type)}
                        className="flex-1 py-3 text-sm font-medium transition"
                        style={{ backgroundColor: repaymentType === type ? "#3D5A80" : "transparent", color: repaymentType === type ? "#FFFFFF" : "#64748B" }}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {isInvestment && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Marginal tax rate</label>
                    <select value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
                      {TAX_RATES.map((t) => (
                        <option key={t.rate} value={t.rate}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>
            {/* ── Pay Off Sooner ── */}
            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Pay Off Sooner</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>See how much time and interest you save by paying extra.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Extra repayment amount</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={extraRepayment} onChange={(e) => handleMoneyChange(e, setExtraRepayment)} tabIndex={5} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>{extraSuffix}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Frequency</label>
                  <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                    {["Weekly", "Fortnightly", "Monthly"].map((freq) => (
                      <button key={freq} type="button" onClick={() => setExtraFrequency(freq)}
                        className="flex-1 py-3 text-sm font-medium transition"
                        style={{ backgroundColor: extraFrequency === freq ? "#3D5A80" : "transparent", color: extraFrequency === freq ? "#FFFFFF" : "#64748B" }}>
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {repaymentType === "Interest Only" && (
                <p className="mt-4 text-xs" style={{ color: "#94A3B8" }}>Switch to Principal & Interest to use this calculator.</p>
              )}
            </div>
          </div>

          {/* ── Results ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Results</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Updates live as you type.</p>

              <div className="mt-6 grid grid-cols-2 gap-4">

                {[
                  { label: `${repaymentFrequency} repayment`, value: formatMoney(repaymentDisplay), accent: "#3D5A80" },
                  { label: "Annual repayment", value: formatMoney(monthly * 12), accent: "#3D5A80" },
                  { label: "Total amount repaid", value: formatMoney(totalRepaid), accent: "#64748B" },
                  { label: "Total interest paid", value: formatMoney(totalInterest), accent: "#D4A373" },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="rounded-3xl border-t-4 p-5" style={{ borderColor: accent, backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-sm" style={{ color: "#64748B" }}>{label}</p>
                    <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{value}</p>
                  </div>
                ))}

                {extraMonthlyEquiv > 0 && yearsSaved > 0 && repaymentType === "Principal & Interest" && (<>
                  <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-sm" style={{ color: "#64748B" }}>Years sooner</p>
                    <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{yearsSaved.toFixed(1)} yrs</p>
                  </div>
                  <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-sm" style={{ color: "#64748B" }}>Interest saved</p>
                    <p className="mt-3 text-2xl font-semibold" style={{ color: "#49A078" }}>{formatMoney(interestSaved)}</p>
                  </div>
                </>)}

              </div>

              {isInvestment && (
                <div className="mt-4 rounded-3xl border-t-4 p-5" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>After-tax cost ({repaymentFrequency.toLowerCase()})</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#49A078" }}>{formatMoney(afterTaxDisplay)}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>Tax deduction saves {formatMoney(taxSavingDisplay)}{freqSuffix} at your marginal rate</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
