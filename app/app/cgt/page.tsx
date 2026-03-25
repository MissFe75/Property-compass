"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PdfModal from "../../components/PdfModal";

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

function calculateEstimatedStampDuty(purchasePrice: number, state: string): number {
  if (purchasePrice <= 0) return 0;
  const p = purchasePrice;
  switch (state) {
    case "QLD":
      if (p <= 5000) return p * 0.015;
      if (p <= 75000) return 75 + (p - 5000) * 0.035;
      if (p <= 540000) return 2450 + (p - 75000) * 0.035;
      if (p <= 1000000) return 18725 + (p - 540000) * 0.045;
      return 39425 + (p - 1000000) * 0.0575;
    case "NSW":
      if (p <= 14000) return p * 0.0125;
      if (p <= 30000) return 175 + (p - 14000) * 0.015;
      if (p <= 80000) return 415 + (p - 30000) * 0.0175;
      if (p <= 300000) return 1290 + (p - 80000) * 0.035;
      if (p <= 1000000) return 8990 + (p - 300000) * 0.045;
      if (p <= 3000000) return 40490 + (p - 1000000) * 0.055;
      return 150490 + (p - 3000000) * 0.07;
    case "VIC":
      if (p <= 25000) return p * 0.014;
      if (p <= 130000) return 350 + (p - 25000) * 0.024;
      if (p <= 960000) return 2870 + (p - 130000) * 0.06;
      if (p <= 2000000) return 52670 + (p - 960000) * 0.055;
      return 109870 + (p - 2000000) * 0.065;
    case "SA":
      if (p <= 12000) return p * 0.01;
      if (p <= 30000) return 120 + (p - 12000) * 0.02;
      if (p <= 50000) return 480 + (p - 30000) * 0.03;
      if (p <= 100000) return 1080 + (p - 50000) * 0.035;
      if (p <= 200000) return 2830 + (p - 100000) * 0.04;
      if (p <= 250000) return 6830 + (p - 200000) * 0.0425;
      if (p <= 300000) return 8955 + (p - 250000) * 0.0475;
      if (p <= 500000) return 11330 + (p - 300000) * 0.05;
      return 21330 + (p - 500000) * 0.055;
    case "WA":
      if (p <= 80000) return p * 0.019;
      if (p <= 100000) return 1520 + (p - 80000) * 0.0285;
      if (p <= 250000) return 2090 + (p - 100000) * 0.038;
      if (p <= 500000) return 7790 + (p - 250000) * 0.0475;
      return 19665 + (p - 500000) * 0.0515;
    case "ACT":
      if (p <= 200000) return p * 0.012;
      if (p <= 300000) return 2400 + (p - 200000) * 0.022;
      if (p <= 500000) return 4600 + (p - 300000) * 0.034;
      if (p <= 750000) return 11400 + (p - 500000) * 0.0432;
      if (p <= 1000000) return 22200 + (p - 750000) * 0.059;
      if (p <= 1455000) return 36950 + (p - 1000000) * 0.064;
      return 66070 + (p - 1455000) * 0.0454;
    case "NT": {
      const V = p / 1000;
      return 0.06571441 * V * V + 15 * V;
    }
    case "TAS":
      if (p <= 3000) return 50;
      if (p <= 25000) return 50 + (p - 3000) * 0.0175;
      if (p <= 75000) return 435 + (p - 25000) * 0.0225;
      if (p <= 200000) return 1560 + (p - 75000) * 0.035;
      if (p <= 375000) return 5935 + (p - 200000) * 0.04;
      if (p <= 725000) return 12935 + (p - 375000) * 0.0425;
      return 27810 + (p - 725000) * 0.045;
    default: return 0;
  }
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

  const [showPdf, setShowPdf] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("500,000");
  const [deposit, setDeposit] = useState("100,000");
  const [state, setState] = useState("QLD");
  const [conveyancer, setConveyancer] = useState("1,800");
  const [buildingPest, setBuildingPest] = useState("600");
  const [buyerAgent, setBuyerAgent] = useState("0");
  const [loanFee, setLoanFee] = useState("400");
  const [titleInsurance, setTitleInsurance] = useState("300");
  const [salePrice, setSalePrice] = useState("750,000");
  const [agentFee, setAgentFee] = useState("15,000");
  const [saleConveyancer, setSaleConveyancer] = useState("1,500");
  const [marketing, setMarketing] = useState("2,000");
  const [saleOther, setSaleOther] = useState("0");
  const [yearsHeld, setYearsHeld] = useState("5");
  const [ownership, setOwnership] = useState("Individual");
  const [salary, setSalary] = useState("95,000");

  const currentPurchasePrice = parseMoney(purchasePrice);
  const currentStampDuty = calculateEstimatedStampDuty(currentPurchasePrice, state);
  const currentBuyingCosts = parseMoney(conveyancer) + parseMoney(buildingPest) + ((Number(buyerAgent) || 0) / 100 * currentPurchasePrice) + parseMoney(loanFee) + parseMoney(titleInsurance);
  const costBase = currentPurchasePrice + currentStampDuty + currentBuyingCosts;
  const currentSaleCosts = parseMoney(agentFee) + parseMoney(saleConveyancer) + parseMoney(marketing) + parseMoney(saleOther);
  const netSalePrice = parseMoney(salePrice) - currentSaleCosts;
  const capitalGain = netSalePrice - costBase;
  const held = parseFloat(yearsHeld) || 0;
  const discountEligible = held >= 1;
  const isJoint = ownership === "Joint";
  const gainPerOwner = capitalGain * (isJoint ? 0.5 : 1);
  const taxableGainPerOwner = discountEligible && gainPerOwner > 0 ? gainPerOwner * 0.5 : Math.max(0, gainPerOwner);
  const taxableGain = taxableGainPerOwner * (isJoint ? 2 : 1);

  const salaryNum = parseMoney(salary);
  const medicareLevy = taxableGainPerOwner * 0.02;
  const taxPerOwner = calcIncomeTax(salaryNum + taxableGainPerOwner) - calcIncomeTax(salaryNum) + medicareLevy;
  const estimatedTax = taxPerOwner * (isJoint ? 2 : 1);
  const effectiveRate = taxableGainPerOwner > 0 ? (taxPerOwner / taxableGainPerOwner) * 100 : 0;
  const bracketBefore = marginalBracket(salaryNum);
  const bracketAfter = marginalBracket(salaryNum + taxableGainPerOwner);
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
            <p className="mt-3 text-base text-white/75 sm:text-lg">Estimate how much capital gains tax you&apos;d owe when selling, based on your income and the ATO&apos;s current tax brackets.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>Navigate your next property move</p>
          <select value="/app/cgt" onChange={(e) => router.push(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
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
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Purchase Details</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>What you paid and the costs involved.</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

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

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} tabIndex={3} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
                    <option value="QLD">QLD — Queensland</option>
                    <option value="NSW">NSW — New South Wales</option>
                    <option value="VIC">VIC — Victoria</option>
                    <option value="SA">SA — South Australia</option>
                    <option value="WA">WA — Western Australia</option>
                    <option value="ACT">ACT — Capital Territory</option>
                    <option value="NT">NT — Northern Territory</option>
                    <option value="TAS">TAS — Tasmania</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Stamp duty (est.)</label>
                  <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-base font-semibold" style={{ color: "#0F172A" }}>${Math.round(currentStampDuty).toLocaleString()}</p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-3 text-sm font-medium" style={{ color: "#3D5A80" }}>Buying costs</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Conveyancer / Solicitor", value: conveyancer, setter: setConveyancer },
                      { label: "Building & pest inspection", value: buildingPest, setter: setBuildingPest },
                      { label: "Loan establishment fee", value: loanFee, setter: setLoanFee },
                      { label: "Title insurance", value: titleInsurance, setter: setTitleInsurance },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>{label}</label>
                        <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                          <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                          <input type="text" value={value} onChange={(e) => handleMoneyChange(e, setter)} tabIndex={-1} className="min-w-0 flex-1 bg-transparent outline-none text-sm" style={{ color: "#0F172A" }} />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>Buyer's agent fee</label>
                      <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                        <input type="text" value={buyerAgent} onChange={(e) => setBuyerAgent(e.target.value)} tabIndex={-1} className="min-w-0 flex-1 bg-transparent outline-none text-sm" style={{ color: "#0F172A" }} />
                        <span className="ml-1 shrink-0 select-none" style={{ color: "#64748B" }}>%</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>Total buying costs</label>
                      <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                        <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>${Math.round(currentBuyingCosts).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-3xl border p-6 shadow-sm" style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}>
              <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Sale</h2>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Estimated sale price and costs of selling.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Estimated sale price</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input type="text" value={salePrice} onChange={(e) => handleMoneyChange(e, setSalePrice)} tabIndex={4} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(5); } }} className="min-w-0 flex-1 bg-transparent outline-none" style={{ color: "#0F172A" }} />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-3 text-sm font-medium" style={{ color: "#3D5A80" }}>Selling costs</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Agent commission", value: agentFee, setter: setAgentFee },
                      { label: "Conveyancer / Solicitor", value: saleConveyancer, setter: setSaleConveyancer },
                      { label: "Marketing & advertising", value: marketing, setter: setMarketing },
                      { label: "Other costs", value: saleOther, setter: setSaleOther },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>{label}</label>
                        <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                          <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                          <input type="text" value={value} onChange={(e) => handleMoneyChange(e, setter)} tabIndex={-1} className="min-w-0 flex-1 bg-transparent outline-none text-sm" style={{ color: "#0F172A" }} />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>Total selling costs</label>
                      <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                        <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>${Math.round(currentSaleCosts).toLocaleString()}</p>
                      </div>
                    </div>
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
                    {["Individual", "Joint"].map((type) => (
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Results</h2>
                <button onClick={() => setShowPdf(true)} className="rounded-2xl border px-4 py-2 text-xs font-medium transition hover:bg-white" style={{ borderColor: "#E7E0D6", color: "#3D5A80" }}>Save as PDF</button>
              </div>
              <p className="mt-2 text-sm" style={{ color: "#64748B" }}>Updates live as you type.</p>

              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#D4A373", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Taxable gain{isJoint ? " (total)" : ""}</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatMoney(taxableGain)}</p>
                  {isJoint && <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>Each owner: {formatMoney(taxableGainPerOwner)}</p>}
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#E53E3E", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>CGT payable{isJoint ? " (total)" : ""}</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#0F172A" }}>{formatMoney(estimatedTax)}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>
                    {isJoint ? `Each owner: ${formatMoney(taxPerOwner)} · ` : ""}Effective rate {effectiveRate.toFixed(1)}%{pushedHigher ? ` · pushed into ${bracketAfter}` : ""}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#49A078" }}>Incl. Medicare Levy (2%)</p>
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Net profit after CGT</p>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: "#49A078" }}>{formatMoney(netProfit)}</p>
                  {isJoint && <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>Each owner: {formatMoney(netProfit / 2)}</p>}
                </div>

                <div className="rounded-3xl border-t-4 p-5" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>50% CGT discount</p>
                  <p className="mt-3 text-base font-semibold" style={{ color: discountEligible ? "#49A078" : "#64748B" }}>{discountEligible ? "✓ Eligible" : "✗ Not eligible"}</p>
                  <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{discountEligible ? "Held 12+ months" : ownership === "Company" ? "Not available to companies" : "Hold 12+ months"}</p>
                </div>

              </div>

              <p className="mt-4 text-xs leading-5" style={{ color: "#94A3B8" }}>
                Estimate only. Does not account for capital works deductions, depreciation recapture, prior year capital losses, or trust and SMSF structures. Consult a registered tax agent or accountant before making any decisions.
              </p>
            </div>
          </div>

        </div>
      </div>
      {showPdf && (
        <PdfModal
          title="Capital Gains Tax Estimator"
          onClose={() => setShowPdf(false)}
          sections={[
            {
              heading: "Purchase Details",
              items: [
                { label: "Purchase price", value: `$${parseMoney(purchasePrice).toLocaleString()}` },
                { label: "State", value: state },
                { label: "Stamp duty (est.)", value: `$${Math.round(currentStampDuty).toLocaleString()}` },
                { label: "Total buying costs", value: `$${Math.round(currentBuyingCosts).toLocaleString()}` },
                { label: "Cost base", value: `$${Math.round(costBase).toLocaleString()}` },
              ],
            },
            {
              heading: "Sale Details",
              items: [
                { label: "Sale price", value: `$${parseMoney(salePrice).toLocaleString()}` },
                { label: "Total selling costs", value: `$${Math.round(currentSaleCosts).toLocaleString()}` },
                { label: "Net sale price", value: `$${Math.round(netSalePrice).toLocaleString()}` },
              ],
            },
            {
              heading: "CGT Results",
              items: [
                { label: "Capital gain", value: formatMoney(capitalGain) },
                { label: "Ownership", value: ownership },
                { label: "Years held", value: `${yearsHeld} yrs` },
                { label: "50% CGT discount", value: discountEligible ? "Eligible" : "Not eligible" },
                { label: `Taxable gain${isJoint ? " (total)" : ""}`, value: formatMoney(taxableGain) },
                { label: `CGT payable${isJoint ? " (total)" : ""}`, value: formatMoney(estimatedTax) },
                { label: "Effective rate", value: `${effectiveRate.toFixed(1)}%` },
                { label: "Net profit after CGT", value: formatMoney(netProfit) },
              ],
            },
          ]}
        />
      )}
    </main>
  );
}
