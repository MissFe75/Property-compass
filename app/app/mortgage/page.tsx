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
  { label: "15% ($18.2k–$45k)", rate: 0.15 },
  { label: "30% ($45k–$135k)", rate: 0.30 },
  { label: "37% ($135k–$190k)", rate: 0.37 },
  { label: "45% (over $190k)", rate: 0.45 },
];

type PropertyType = "Established" | "New build" | "Vacant land";
const PROPERTY_TYPES: PropertyType[] = ["Established", "New build", "Vacant land"];

// First Home Owner Grant (FHOG) — a cash grant that reduces the effective loan amount. Hard price
// cap (no partial/taper), and in every state that offers one it only applies to new builds and
// vacant land, never established homes. As at July 2026. null = no grant modelled (ACT abolished
// its FHOG in 2019 in favour of a stamp duty exemption instead; NT/TAS have caveats — see note text).
const FHB_GRANTS: Record<string, Record<PropertyType, { amount: number; cap: number } | null>> = {
  NSW: { Established: null, "New build": { amount: 10000, cap: 600000 }, "Vacant land": { amount: 10000, cap: 750000 } },
  QLD: { Established: null, "New build": { amount: 30000, cap: 750000 }, "Vacant land": { amount: 30000, cap: 750000 } },
  VIC: { Established: null, "New build": { amount: 10000, cap: 750000 }, "Vacant land": { amount: 10000, cap: 750000 } },
  SA: { Established: null, "New build": { amount: 15000, cap: Infinity }, "Vacant land": { amount: 15000, cap: Infinity } },
  WA: { Established: null, "New build": { amount: 10000, cap: 800000 }, "Vacant land": { amount: 10000, cap: 800000 } },
  TAS: { Established: null, "New build": { amount: 20000, cap: Infinity }, "Vacant land": { amount: 20000, cap: Infinity } },
  NT: { Established: null, "New build": { amount: 80000, cap: Infinity }, "Vacant land": { amount: 80000, cap: Infinity } },
  ACT: { Established: null, "New build": null, "Vacant land": null },
};

function getFhbGrantAmount(
  state: string,
  purchasePrice: number,
  propertyType: PropertyType,
  isFirstHomeBuyer: boolean,
  includeGrant: boolean
): number {
  if (!isFirstHomeBuyer || !includeGrant) return 0;
  const grant = FHB_GRANTS[state]?.[propertyType];
  if (!grant) return 0;
  if (purchasePrice > grant.cap) return 0;
  return grant.amount;
}

function getFhbGrantNote(
  state: string,
  purchasePrice: number,
  propertyType: PropertyType,
  isFirstHomeBuyer: boolean
): string | null {
  if (!isFirstHomeBuyer) return null;
  const typeLabel = propertyType.toLowerCase();

  if (state === "ACT") {
    return "ACT abolished its First Home Owner Grant in 2019 — it relies solely on a stamp duty exemption instead (not modelled on this page).";
  }
  if (propertyType === "Established") {
    return "First Home Owner Grants only apply to new builds and vacant land in every state — established homes aren't eligible anywhere.";
  }

  const grant = FHB_GRANTS[state]?.[propertyType];
  if (!grant) return null;

  if (purchasePrice > grant.cap) {
    return `Not eligible — ${state}'s First Home Owner Grant for ${typeLabel} purchases only applies up to ${formatMoney(grant.cap)} (hard cap, no partial grant above it).`;
  }

  let extra = "";
  if (state === "WA") extra = " (the cap is $1,000,000 for properties north of the 26th parallel — not distinguished here)";
  if (state === "NT") extra = " — this combines the HomeGrown Territory Grant ($50,000) and FreshStart Grant ($30,000), which have their own separate eligibility conditions and an end date of 30 September 2026";
  if (state === "TAS") extra = " (dropped from $30,000 to $20,000 for contracts signed from 1 July 2026)";

  return `${formatMoney(grant.amount)} — ${state}'s First Home Owner Grant for ${typeLabel} purchases up to ${isFinite(grant.cap) ? formatMoney(grant.cap) : "any price"}${extra}.`;
}

export default function MortgagePage() {
  const router = useRouter();
  const [showPdf, setShowPdf] = useState(false);

  const [loanPurpose, setLoanPurpose] = useState("Owner Occupier");
  const [purchasePrice, setPurchasePrice] = useState("650,000");
  const [deposit, setDeposit] = useState("130,000");
  const [interestRate, setInterestRate] = useState("6.25");
  const [loanTerm, setLoanTerm] = useState("30");
  const [repaymentType, setRepaymentType] = useState("Principal & Interest");
  const [repaymentFrequency, setRepaymentFrequency] = useState("Monthly");
  const [taxRate, setTaxRate] = useState("0.30");
  const [extraRepayment, setExtraRepayment] = useState("500");
  const [extraFrequency, setExtraFrequency] = useState("Monthly");

  const [state, setState] = useState("QLD");
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>("Established");
  const [includeFhbGrant, setIncludeFhbGrant] = useState(true);

  const isInvestment = loanPurpose === "Investment";
  const fhbGrantAmount = getFhbGrantAmount(state, parseMoney(purchasePrice), propertyType, isFirstHomeBuyer, includeFhbGrant);
  const fhbGrantNote = getFhbGrantNote(state, parseMoney(purchasePrice), propertyType, isFirstHomeBuyer);
  const loanAmount = parseMoney(purchasePrice) - parseMoney(deposit) - fhbGrantAmount;
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
            <p className="mt-3 text-base text-white/75 sm:text-lg">Work out your repayments, compare P&amp;I vs interest only, and see how extra payments could get you mortgage-free sooner.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>Navigate your next property move</p>
          <select value="/app/mortgage" onChange={(e) => router.push(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
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

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
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

                <div className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" id="fhb-toggle" checked={isFirstHomeBuyer} onChange={(e) => setIsFirstHomeBuyer(e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: "#3D5A80" }} />
                  <label htmlFor="fhb-toggle" className="text-sm font-medium" style={{ color: "#3D5A80" }}>First home buyer</label>
                </div>

                {isFirstHomeBuyer && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Property type</label>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" style={{ borderColor: "#E7E0D6", color: "#0F172A" }}>
                      {PROPERTY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                )}

                {isFirstHomeBuyer && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input type="checkbox" id="fhb-grant-toggle" checked={includeFhbGrant} onChange={(e) => setIncludeFhbGrant(e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: "#3D5A80" }} />
                    <label htmlFor="fhb-grant-toggle" className="text-sm font-medium" style={{ color: "#3D5A80" }}>Include First Home Owner Grant (cash grant)</label>
                  </div>
                )}

                {isFirstHomeBuyer && includeFhbGrant && (
                  <div className="sm:col-span-2 rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#49A078", backgroundColor: "white", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-sm font-medium" style={{ color: "#3D5A80" }}>First home owner grant</p>
                    <p className="mt-1 text-base font-semibold" style={{ color: "#0F172A" }}>{formatMoney(fhbGrantAmount)}</p>
                    {fhbGrantNote && <p className="mt-1 text-xs" style={{ color: "#64748B" }}>{fhbGrantNote}</p>}
                  </div>
                )}

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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: "#0F172A" }}>Results</h2>
                <button onClick={() => setShowPdf(true)} className="rounded-2xl border px-4 py-2 text-xs font-medium transition hover:bg-white" style={{ borderColor: "#E7E0D6", color: "#3D5A80" }}>Save as PDF</button>
              </div>
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

      {/* ── SEO Content ── */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="border-t pt-10" style={{ borderColor: "#E7E0D6" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "#0F172A" }}>Understanding your mortgage</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>Principal &amp; Interest vs Interest Only</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>With Principal &amp; Interest, each repayment reduces your loan balance so you build equity over time. Interest Only means your repayments cover only the interest — the loan amount stays the same. IO is popular with investors because repayments are lower and may improve cashflow, but you&apos;ll pay more interest overall and won&apos;t reduce the underlying debt.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>How extra repayments save you thousands</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>Because mortgage interest is calculated on your outstanding balance, extra repayments directly reduce future interest charges. Even modest additional payments — say $200 a fortnight — can cut years off a 30-year loan and save tens of thousands in interest. The Pay Off Sooner section shows exactly how much you&apos;d save with your own numbers.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>After-tax cost for investors</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>If you&apos;re borrowing to invest, the interest on your loan is generally tax-deductible in Australia. This means your real out-of-pocket cost is lower than the headline repayment figure. Toggle to Investment mode and select your marginal tax rate to see your actual after-tax repayment — the amount that truly comes out of your pocket each month. Marginal tax rates here reflect the FY2026-27 ATO brackets, including the rate cut on the $18,201–$45,000 bracket from 16% to 15% effective 1 July 2026.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>First home buyer support in 2026</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>Tick &quot;First home buyer&quot; above to reduce your loan amount by the relevant First Home Owner Grant — a cash payment separate from any stamp duty concession, ranging from $10,000 (NSW, VIC, WA) to $30,000 (QLD) depending on your state, and only available for new builds or vacant land. The ACT doesn&apos;t offer a cash grant, but from 1 July 2026 it abolished stamp duty entirely for first home buyers instead.</p>
            </div>
          </div>
        </div>
      </div>

      {showPdf && (
        <PdfModal
          title="Mortgage Calculator"
          sections={[
            {
              heading: "Loan Details",
              items: [
                { label: "Loan purpose", value: loanPurpose },
                { label: "Purchase price", value: formatMoney(parseMoney(purchasePrice)) },
                { label: "Deposit", value: formatMoney(parseMoney(deposit)) },
                ...(fhbGrantAmount > 0 ? [{ label: "First home owner grant", value: `-${formatMoney(fhbGrantAmount)}` }] : []),
                { label: "Loan amount", value: formatMoney(loanAmount) },
                { label: "Interest rate", value: `${interestRate}%` },
                { label: "Loan term", value: `${loanTerm} years` },
                { label: "Repayment type", value: repaymentType },
              ],
            },
            {
              heading: "Results",
              items: [
                { label: `${repaymentFrequency} repayment`, value: formatMoney(repaymentDisplay) },
                { label: "Annual repayment", value: formatMoney(monthly * 12) },
                { label: "Total repaid", value: formatMoney(totalRepaid) },
                { label: "Total interest", value: formatMoney(totalInterest) },
                ...(yearsSaved > 0 ? [
                  { label: "Years saved (extra repayments)", value: `${yearsSaved.toFixed(1)} yrs` },
                  { label: "Interest saved", value: formatMoney(interestSaved) },
                ] : []),
              ],
            },
          ]}
          onClose={() => setShowPdf(false)}
        />
      )}
    </main>
  );
}
