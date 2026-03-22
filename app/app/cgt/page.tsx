"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function parseMoney(value: string): number {
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

function calcIncomeTax(income: number): number {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.19;
  if (income <= 120000) return 5092 + (income - 45000) * 0.325;
  if (income <= 180000) return 29467 + (income - 120000) * 0.37;
  return 51667 + (income - 180000) * 0.45;
}

function marginalBracket(income: number): string {
  if (income <= 18200) return "0%";
  if (income <= 45000) return "19%";
  if (income <= 120000) return "32.5%";
  if (income <= 180000) return "37%";
  return "45%";
}

export default function CGTPage() {
  const router = useRouter();

  const [purchasePrice, setPurchasePrice] = useState("500,000");
  const [purchaseCosts, setPurchaseCosts] = useState("25,000");
  const [salePrice, setSalePrice] = useState("750,000");
  const [saleCosts, setSaleCosts] = useState("18,000");
  const [yearsHeld, setYearsHeld] = useState("5");
  const [ownership, setOwnership] = useState("Individual");
  const [salary, setSalary] = useState("95,000");

  const costBase = parseMoney(purchasePrice) + parseMoney(purchaseCosts);
  const netSalePrice = parseMoney(salePrice) - parseMoney(saleCosts);
  const capitalGain = netSalePrice - costBase;
  const held = parseFloat(yearsHeld) || 0;
  const discountEligible = (ownership === "Individual" || ownership === "Joint") && held >= 1;
  const discountedGain = discountEligible && capitalGain > 0 ? capitalGain * 0.5 : capitalGain;
  const taxableGain = Math.max(0, discountedGain);

  const salaryNum = parseMoney(salary);
  const taxOnSalary = calcIncomeTax(salaryNum);
  const taxOnSalaryPlusGain = calcIncomeTax(salaryNum + taxableGain);
  const estimatedTax = taxOnSalaryPlusGain - taxOnSalary;
  const effectiveRate = taxableGain > 0 ? (estimatedTax / taxableGain) * 100 : 0;
  const bracketBefore = marginalBracket(salaryNum);
  const bracketAfter = marginalBracket(salaryNum + taxableGain);
  const pushedHigher = bracketAfter !== bracketBefore;
  const netProfit = capitalGain - estimatedTax;

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
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/images/house%20%26%20key%20tag.jpg")', backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-6 pt-14 pb-24 sm:px-8 md:min-h-[500px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.75)" }}>Property Compass</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Capital Gains Tax Estimator</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>Navigate your next property move</p>
          <select value="/app/cgt" onChange={(e) => router.push(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
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
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Purchase</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>What you paid and the costs involved.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Purchase price</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={purchasePrice} onChange={(e) => handleMoneyChange(e, setPurchasePrice)} tabIndex={1} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(2); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Purchase costs (stamp duty, fees)</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={purchaseCosts} onChange={(e) => handleMoneyChange(e, setPurchaseCosts)} tabIndex={2} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(3); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Sale</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>What you sold for and the costs of selling.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Sale price</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={salePrice} onChange={(e) => handleMoneyChange(e, setSalePrice)} tabIndex={3} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Sale costs (agent fees, legal)</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={saleCosts} onChange={(e) => handleMoneyChange(e, setSaleCosts)} tabIndex={4} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(5); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Tax Details</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Used to estimate your CGT liability.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Years held</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <input type="text" value={yearsHeld} onChange={(e) => setYearsHeld(e.target.value)} tabIndex={5} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(6); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>yrs</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Annual salary</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={salary} onChange={(e) => handleMoneyChange(e, setSalary)} tabIndex={6} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                    <span className="ml-1 shrink-0 select-none text-sm" style={{ color: "#64748B" }}>/yr</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Ownership structure</label>
                  <div className="flex w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "#E7E0D6" }}>
                    {["Individual", "Joint", "Company"].map((type) => (
                      <button key={type} type="button" onClick={() => setOwnership(type)}
                        className="flex-1 py-3 text-sm font-medium transition"
                        style={{ backgroundColor: ownership === type ? "#3D5A80" : "transparent", color: ownership === type ? "#FFFFFF" : "#64748B" }}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── Results ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Results</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Updates live as you type.</p>

              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="col-span-2 rounded-3xl border-t-4 p-5" style={{ borderColor: capitalGain >= 0 ? "#49A078" : "#E53E3E", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Capital gain</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: capitalGain >= 0 ? "#49A078" : "#E53E3E" }}>{formatMoney(capitalGain)}</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#D4A373", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Taxable gain</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatMoney(taxableGain)}</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#E53E3E", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>CGT payable</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatMoney(estimatedTax)}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>Effective rate {effectiveRate.toFixed(1)}%{pushedHigher ? ` · gain pushed you into ${bracketAfter}` : ""}</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Net profit after CGT</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#49A078" }}>{formatMoney(netProfit)}</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>50% CGT discount</p>
                  <p className="mt-3 text-base font-semibold" style={{ color: discountEligible ? "#49A078" : "#64748B" }}>{discountEligible ? "✓ Eligible" : "✗ Not eligible"}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{discountEligible ? "Held 12+ months" : ownership === "Company" ? "Not available to companies" : "Hold 12+ months"}</p>
                </div>

              </div>

              <p className="mt-4 text-xs leading-5" style={{ color: "#94A3B8" }}>
                Estimate only. Does not account for capital works deductions, depreciation, or prior year losses. Consult a tax adviser.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
