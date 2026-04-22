"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function YieldPage() {
  const router = useRouter();
  const [showPdf, setShowPdf] = useState(false);

  const [purchasePrice, setPurchasePrice] = useState("650,000");
  const [rent, setRent] = useState("620");
  const [rentFrequency, setRentFrequency] = useState("Weekly");
  const [vacancyRate, setVacancyRate] = useState("2");
  const [propertyManagement, setPropertyManagement] = useState("7");

  const [landlordInsurance, setLandlordInsurance] = useState("1,500");
  const [councilRates, setCouncilRates] = useState("2,000");
  const [waterRates, setWaterRates] = useState("800");
  const [maintenance, setMaintenance] = useState("2,000");
  const [strata, setStrata] = useState("0");
  const [landTax, setLandTax] = useState("0");
  const [expenseFrequency, setExpenseFrequency] = useState("Annual");

  const [incomeFrequency, setIncomeFrequency] = useState("Weekly");

  const [includeLoan, setIncludeLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState("520,000");
  const [interestRate, setInterestRate] = useState("6.50");
  const [loanTerm, setLoanTerm] = useState("30");
  const [repaymentType, setRepaymentType] = useState("PI");
  const [netYieldInclMortgage, setNetYieldInclMortgage] = useState(false);

  const rentMultiplier = rentFrequency === "Weekly" ? 52 : rentFrequency === "Fortnightly" ? 26 : 1;
  const rentSuffix = rentFrequency === "Weekly" ? "/wk" : rentFrequency === "Fortnightly" ? "/fn" : "/yr";
  const expenseMultiplier = expenseFrequency === "Weekly" ? 52 : expenseFrequency === "Fortnightly" ? 26 : 1;
  const expenseSuffix = expenseFrequency === "Weekly" ? "/wk" : expenseFrequency === "Fortnightly" ? "/fn" : "/yr";

  const price = parseMoney(purchasePrice);
  const annualRent = parseMoney(rent) * rentMultiplier;
  const vacancyCost = annualRent * (parsePercent(vacancyRate) / 100);
  const managementCost = annualRent * (parsePercent(propertyManagement) / 100);
  const fixedExpenses = (parseMoney(landlordInsurance) + parseMoney(councilRates) + parseMoney(waterRates) + parseMoney(maintenance) + parseMoney(strata) + parseMoney(landTax)) * expenseMultiplier;
  const totalExpenses = fixedExpenses + vacancyCost + managementCost;
  const netAnnualIncome = annualRent - totalExpenses;
  const grossYield = price > 0 ? (annualRent / price) * 100 : 0;
  const netYield = price > 0 ? (netAnnualIncome / price) * 100 : 0;

  const loan = parseMoney(loanAmount);
  const annualRate = parsePercent(interestRate) / 100;
  const monthlyRate = annualRate / 12;
  const months = parseInt(loanTerm) * 12;
  const monthlyRepayment = repaymentType === "IO"
    ? loan * monthlyRate
    : monthlyRate > 0 && months > 0
      ? loan * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : 0;
  const annualLoanCost = monthlyRepayment * 12;
  const cashflowAfterMortgage = netAnnualIncome - annualLoanCost;
  const weeklyCashflow = cashflowAfterMortgage / 52;
  const netYieldWithMortgage = price > 0 ? (cashflowAfterMortgage / price) * 100 : 0;
  const displayedNetYield = includeLoan && netYieldInclMortgage ? netYieldWithMortgage : netYield;

  const freqDivisor = incomeFrequency === "Weekly" ? 52 : incomeFrequency === "Fortnightly" ? 26 : 1;
  const freqLabel = incomeFrequency === "Weekly" ? "/wk" : incomeFrequency === "Fortnightly" ? "/fn" : "/yr";


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
            <a href="/" className="rounded-2xl px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "#3D5A80", boxShadow: "0 4px 14px rgba(61,90,128,0.25)" }}>← Home</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/images/house%20in%20hand.jpg")', backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-6 pt-14 pb-24 sm:px-8 md:min-h-[500px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.75)" }}>Property Compass</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Yield Calculator</h1>
            <p className="mt-3 text-base text-white/75 sm:text-lg">Calculate gross and net rental yield, factor in all your potential costs, and see what a property really earns.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>Navigate your next property move</p>
          <select value="/app/yield" onChange={(e) => router.push(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
            <option value="/app">Property Explorer</option>
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
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Property Details</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Enter the property income and cost details.</p>

              <div className="mt-4">
                <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                  {["Weekly", "Fortnightly", "Annual"].map((freq) => (
                    <button key={freq} type="button" onClick={() => setRentFrequency(freq)}
                      className="flex-1 py-3 text-sm font-medium transition"
                      style={{ backgroundColor: rentFrequency === freq ? "#3D5A80" : "transparent", color: rentFrequency === freq ? "#FFFFFF" : "#64748B" }}>
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
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Rent</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={rent} onChange={(e) => handleMoneyChange(e, setRent)} tabIndex={2} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(3); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>{rentSuffix}</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Vacancy rate</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <input type="text" value={vacancyRate} onChange={(e) => setVacancyRate(e.target.value)} tabIndex={3} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none" style={{ color: "#64748B" }}>%</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Property management</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <input type="text" value={propertyManagement} onChange={(e) => setPropertyManagement(e.target.value)} tabIndex={4} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(5); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none" style={{ color: "#64748B" }}>%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Expenses ── */}
            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Expenses</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Enter your fixed costs.</p>

              <div className="mt-4">
                <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                  {["Weekly", "Fortnightly", "Annual"].map((freq) => (
                    <button key={freq} type="button" onClick={() => setExpenseFrequency(freq)}
                      className="flex-1 py-3 text-sm font-medium transition"
                      style={{ backgroundColor: expenseFrequency === freq ? "#3D5A80" : "transparent", color: expenseFrequency === freq ? "#FFFFFF" : "#64748B" }}>
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {[
                  { label: "Landlord insurance", value: landlordInsurance, setter: setLandlordInsurance, tabIdx: 5 },
                  { label: "Council rates", value: councilRates, setter: setCouncilRates, tabIdx: 6 },
                  { label: "Water rates", value: waterRates, setter: setWaterRates, tabIdx: 7 },
                  { label: "Maintenance & repairs", value: maintenance, setter: setMaintenance, tabIdx: 8 },
                  { label: "Strata / body corporate", value: strata, setter: setStrata, tabIdx: 9 },
                  { label: "Land tax", value: landTax, setter: setLandTax, tabIdx: 10 },
                ].map(({ label, value, setter, tabIdx }) => (
                  <div key={label}>
                    <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>{label}</label>
                    <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                      <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                      <input type="text" value={value} onChange={(e) => handleMoneyChange(e, setter)} tabIndex={tabIdx} onKeyDown={(e) => { if (e.key === "Enter" && tabIdx < 9) { e.preventDefault(); focusField(tabIdx + 1); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                      <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>{expenseSuffix}</span>
                    </div>
                  </div>
                ))}

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total expenses</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatMoney(fixedExpenses / expenseMultiplier)}<span className="text-sm font-normal ml-1" style={{ color: "#64748B" }}>{expenseSuffix}</span></p>
                </div>

              </div>
            </div>

            {/* ── Loan Costs ── */}
            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Loan Costs</h2>
                  <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Include your mortgage to see true cashflow.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeLoan(!includeLoan)}
                  className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                  style={{ backgroundColor: includeLoan ? "#3D5A80" : "#CBD5E1" }}
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" style={{ transform: includeLoan ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
              </div>

              {includeLoan && (
                <div className="mt-6 space-y-5">
                  <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                    {["PI", "IO"].map((type) => (
                      <button key={type} type="button" onClick={() => setRepaymentType(type)}
                        className="flex-1 py-3 text-sm font-medium transition"
                        style={{ backgroundColor: repaymentType === type ? "#3D5A80" : "transparent", color: repaymentType === type ? "#FFFFFF" : "#64748B" }}>
                        {type === "PI" ? "Principal & Interest" : "Interest Only"}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Loan amount</label>
                      <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                        <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                        <input type="text" value={loanAmount} onChange={(e) => handleMoneyChange(e, setLoanAmount)} tabIndex={11} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Interest rate</label>
                      <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                        <input type="text" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} tabIndex={12} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                        <span className="ml-1 shrink-0 select-none" style={{ color: "#64748B" }}>%</span>
                      </div>
                    </div>

                    {repaymentType === "PI" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Loan term</label>
                        <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                          <input type="text" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} tabIndex={13} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                          <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>yrs</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Results ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Results</h2>
                <button onClick={() => setShowPdf(true)} className="rounded-2xl border px-4 py-2 text-xs font-medium transition hover:bg-white" style={{ borderColor: "#E7E0D6", color: "#3D5A80" }}>Save as PDF</button>
              </div>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Updates live as you type.</p>

              <div className="mt-4">
                <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                  {["Weekly", "Fortnightly", "Annual"].map((freq) => (
                    <button key={freq} type="button" onClick={() => setIncomeFrequency(freq)}
                      className="flex-1 py-3 text-sm font-medium transition"
                      style={{ backgroundColor: incomeFrequency === freq ? "#3D5A80" : "transparent", color: incomeFrequency === freq ? "#FFFFFF" : "#64748B" }}>
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Gross yield</p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>Rent ÷ purchase price</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatPercent(grossYield)}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{grossYield < 4 ? "Low return" : grossYield <= 6 ? "Average return" : "Strong return"}</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Net yield</p>
                  {includeLoan ? (
                    <div className="mt-1 flex overflow-hidden rounded-xl border text-xs" style={{ borderColor: "#E7E0D6" }}>
                      {[false, true].map((val) => (
                        <button key={String(val)} type="button" onClick={() => setNetYieldInclMortgage(val)}
                          className="flex-1 py-1 font-medium transition"
                          style={{ backgroundColor: netYieldInclMortgage === val ? "#3D5A80" : "transparent", color: netYieldInclMortgage === val ? "#FFFFFF" : "#94A3B8" }}>
                          {val ? "incl. mortgage" : "excl. mortgage"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "#94A3B8" }}>After costs, excl. mortgage</p>
                  )}
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatPercent(displayedNetYield)}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{displayedNetYield < 0 ? "Negative return" : displayedNetYield < 4 ? "Low return" : displayedNetYield <= 6 ? "Average return" : "Strong return"}</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: netAnnualIncome >= 0 ? "#49A078" : "#E53E3E", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Net income</p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>After expenses, before mortgage</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: netAnnualIncome >= 0 ? "#49A078" : "#E53E3E" }}>{formatMoney(netAnnualIncome / freqDivisor)}{freqLabel}</p>
                </div>

                {includeLoan && (
                  <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: cashflowAfterMortgage >= 0 ? "#49A078" : "#E53E3E", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-sm" style={{ color: "#64748B" }}>Cashflow after mortgage</p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>After costs & repayments</p>
                    <p className="mt-3 text-2xl font-semibold" style={{ color: cashflowAfterMortgage >= 0 ? "#49A078" : "#E53E3E" }}>{formatMoney(cashflowAfterMortgage / freqDivisor)}{freqLabel}</p>
                    <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{weeklyCashflow < -10 ? "Negatively geared" : weeklyCashflow <= 10 ? "Roughly neutral" : "Positively geared"}</p>
                  </div>
                )}

              </div>

              <div className="mt-4 rounded-2xl px-4 py-3 text-xs leading-5" style={{ backgroundColor: "#EEF2FF", color: "#3D5A80" }}>
                <strong>Depreciation tip:</strong> A quantity surveyor&apos;s depreciation schedule can reduce your taxable income by thousands each year and significantly improve your real after-tax return — especially on newer or recently renovated properties. A depreciation schedule is not included in this yield calculation.
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── SEO Content ── */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="border-t pt-10" style={{ borderColor: "#E7E0D6" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "#0F172A" }}>Understanding rental yield</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>Gross yield vs net yield</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>Gross yield is simply annual rent divided by the purchase price — the headline figure you&apos;ll see on property listings. Net yield goes further, deducting vacancy, property management fees, council rates, insurance, and other holding costs. Net yield is what you actually earn and the number that matters when comparing investment properties.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>What&apos;s a good rental yield in Australia?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>Gross yields in most Australian capital cities range from 3% to 6%. High-growth suburbs in inner Sydney and Melbourne often sit at the lower end, while Queensland, regional, and outer-metro areas can offer 5–7%+. As a general guide, a net yield of 4% or more is considered a reasonable return for an Australian investment property.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>Don&apos;t forget depreciation</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>A quantity surveyor&apos;s depreciation schedule lets you claim wear and tear on the building and fixtures as a tax deduction each year. On a newer property this can be worth $5,000–$15,000+ in deductions annually — significantly improving your real after-tax return. Depreciation isn&apos;t included in this yield calculation but is worth factoring in separately when evaluating a property.</p>
            </div>
          </div>
        </div>
      </div>

      {showPdf && (
        <PdfModal
          title="Yield Calculator"
          sections={[
            {
              heading: "Property Details",
              items: [
                { label: "Purchase price", value: formatMoney(price) },
                { label: `${rentFrequency} rent`, value: formatMoney(parseMoney(rent)) },
                { label: "Vacancy rate", value: `${vacancyRate}%` },
                { label: "Property management", value: `${propertyManagement}%` },
              ],
            },
            {
              heading: "Results",
              items: [
                { label: "Gross yield", value: formatPercent(grossYield) },
                { label: "Net yield", value: formatPercent(netYield) },
                { label: "Annual gross rent", value: formatMoney(annualRent) },
                { label: "Annual net income", value: formatMoney(netAnnualIncome) },
                { label: "Total annual expenses", value: formatMoney(totalExpenses) },
                { label: "Land tax", value: formatMoney(parseMoney(landTax) * expenseMultiplier) },
              ],
            },
          ]}
          onClose={() => setShowPdf(false)}
        />
      )}
    </main>
  );
}
