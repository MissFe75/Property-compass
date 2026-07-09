"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PdfModal from "./components/PdfModal";
import Footer from "./components/Footer";

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

function focusField(tabIndex: number) {
  const el = document.querySelector<HTMLElement>(`[tabindex="${tabIndex}"]`);
  el?.focus();
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

type PropertyType = "Established" | "New build" | "Vacant land";
const PROPERTY_TYPES: PropertyType[] = ["Established", "New build", "Vacant land"];

// First-home-buyer duty concession bands by state and property type, as at July 2026.
// { exempt: price at/below which duty is $0, ceiling: price at/above which no concession applies }.
// Between the two, we taper the standard duty linearly to 0 as an estimate — state revenue
// offices don't publish a simple formula for this band, so treat it as an approximation.
// Infinity/Infinity = uncapped full exemption. null = no FHB duty concession modelled for this
// state/property type combination (see note text below for why).
const FHB_THRESHOLDS: Record<string, Record<PropertyType, { exempt: number; ceiling: number } | null>> = {
  NSW: {
    Established: { exempt: 800000, ceiling: 1000000 },
    "New build": { exempt: 800000, ceiling: 1000000 },
    "Vacant land": { exempt: 350000, ceiling: 450000 },
  },
  QLD: {
    Established: { exempt: 700000, ceiling: 800000 },
    "New build": { exempt: Infinity, ceiling: Infinity },
    "Vacant land": { exempt: Infinity, ceiling: Infinity },
  },
  VIC: {
    Established: { exempt: 600000, ceiling: 750000 },
    "New build": { exempt: 600000, ceiling: 750000 },
    "Vacant land": { exempt: 600000, ceiling: 750000 },
  },
  WA: {
    Established: { exempt: 600000, ceiling: 800000 },
    "New build": { exempt: 600000, ceiling: 800000 },
    "Vacant land": { exempt: 450000, ceiling: 550000 },
  },
  SA: {
    Established: null,
    "New build": { exempt: Infinity, ceiling: Infinity },
    "Vacant land": { exempt: 400000, ceiling: 450000 },
  },
  NT: { Established: null, "New build": null, "Vacant land": null },
  TAS: { Established: null, "New build": null, "Vacant land": null },
};

// First Home Owner Grant (FHOG) — a cash grant, separate from the duty concessions above. It's a
// hard price cap (no partial/taper) and, in every state that offers one, only ever applies to new
// builds and vacant land/house-and-land packages, never established homes. As at July 2026.
// null = no grant modelled (ACT abolished its FHOG in 2019 in favour of the duty exemption above;
// NT and TAS are single combined/uncapped figures — see note text for caveats).
const FHB_GRANTS: Record<string, Record<PropertyType, { amount: number; cap: number } | null>> = {
  NSW: {
    Established: null,
    "New build": { amount: 10000, cap: 600000 },
    "Vacant land": { amount: 10000, cap: 750000 },
  },
  QLD: {
    Established: null,
    "New build": { amount: 30000, cap: 750000 },
    "Vacant land": { amount: 30000, cap: 750000 },
  },
  VIC: {
    Established: null,
    "New build": { amount: 10000, cap: 750000 },
    "Vacant land": { amount: 10000, cap: 750000 },
  },
  SA: {
    Established: null,
    "New build": { amount: 15000, cap: Infinity },
    "Vacant land": { amount: 15000, cap: Infinity },
  },
  WA: {
    Established: null,
    "New build": { amount: 10000, cap: 800000 },
    "Vacant land": { amount: 10000, cap: 800000 },
  },
  TAS: {
    Established: null,
    "New build": { amount: 20000, cap: Infinity },
    "Vacant land": { amount: 20000, cap: Infinity },
  },
  NT: {
    Established: null,
    "New build": { amount: 80000, cap: Infinity },
    "Vacant land": { amount: 80000, cap: Infinity },
  },
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
    return "ACT abolished its First Home Owner Grant in 2019 — it now relies solely on the stamp duty exemption above.";
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

function calculateStandardDuty(purchasePrice: number, state: string): number {
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

    default:
      return 0;
  }
}

// States/property-types where the taper between exempt and ceiling uses a verified official
// formula rather than a linear guess. QLD: QRO publishes the exact home-concession rate plus a
// deduction table (confirmed linear across all 10 published $10k bands). VIC: the SRO's sliding
// scale is legislated as general duty × (value − $600,000) / $150,000, which is exactly the
// linear-on-standard-duty formula used below — so VIC's "taper" already is the real formula.
const FHB_EXACT_TAPER = new Set(["QLD", "VIC"]);

// Queensland's home concession rate (owner-occupier rate, lower than the standard/investor duty
// used elsewhere in this file) for the $540,000–$1,000,000 bracket — the only bracket the QLD
// first-home taper band ($700k–$800k) falls within. Source: qro.qld.gov.au concession rates.
function qldHomeConcessionDuty(p: number): number {
  return 10150 + 4.5 / 100 * (p - 540000);
}

// Exact QRO deduction table for the QLD first home concession, $700,000–$800,000, confirmed
// linear across all 10 published $10k bands (deduction of $1,735 per $10,000 below $800,000).
function qldFirstHomeDeduction(p: number): number {
  return 17350 * (800000 - p) / 100000;
}

function calculateEstimatedStampDuty(
  purchasePrice: number,
  state: string,
  isFirstHomeBuyer: boolean,
  propertyType: PropertyType
): number {
  const standardDuty = calculateStandardDuty(purchasePrice, state);
  if (!isFirstHomeBuyer) return standardDuty;

  // From 1 July 2026 the ACT abolished stamp duty entirely for first home buyers (no price or income cap).
  if (state === "ACT") return 0;

  const band = FHB_THRESHOLDS[state]?.[propertyType];
  if (!band) return standardDuty;

  const p = purchasePrice;
  if (p <= band.exempt) return 0;
  if (p >= band.ceiling) return standardDuty;

  if (state === "QLD" && propertyType === "Established") {
    return qldHomeConcessionDuty(p) - qldFirstHomeDeduction(p);
  }

  return standardDuty * (p - band.exempt) / (band.ceiling - band.exempt);
}

function getFhbNote(
  state: string,
  purchasePrice: number,
  isFirstHomeBuyer: boolean,
  propertyType: PropertyType
): string | null {
  if (!isFirstHomeBuyer) return null;
  const p = purchasePrice;
  const typeLabel = propertyType.toLowerCase();

  if (state === "ACT") {
    return "$0 — from 1 July 2026 the ACT abolished stamp duty for all first home buyers, with no price or income cap.";
  }

  const band = FHB_THRESHOLDS[state]?.[propertyType];
  if (band) {
    if (!isFinite(band.exempt)) {
      return `$0 — ${state} has no price cap on its first-home-buyer duty exemption for ${typeLabel} purchases.`;
    }
    if (p <= band.exempt) {
      return `$0 — ${typeLabel} purchases up to ${formatMoney(band.exempt)} are duty-exempt for first home buyers in ${state}.`;
    }
    if (p < band.ceiling) {
      const basis = FHB_EXACT_TAPER.has(state)
        ? `Calculated from ${state}'s published concession formula.`
        : `${state} doesn't publish a formula for this band (only an internal calculator), so this is our best estimate — it may differ slightly from the final figure at settlement.`;
      return `${state}'s first-home-buyer concession for ${typeLabel} purchases phases out between ${formatMoney(band.exempt)} and ${formatMoney(band.ceiling)}. ${basis}`;
    }
    return `No concession — ${state}'s first-home-buyer exemption for ${typeLabel} purchases only applies up to ${formatMoney(band.ceiling)}. This is the standard rate.`;
  }

  if (state === "SA" && propertyType === "Established") {
    return "SA doesn't offer a stamp duty concession to first home buyers on established homes — only new homes and vacant land qualify. This is the standard rate.";
  }
  if (state === "TAS") {
    return "Tasmania's first-home-buyer duty exemption (established homes and vacant land up to $750,000) only applied to settlements up to 30 June 2026 and has now expired — this is the standard rate.";
  }
  if (state === "NT") {
    return "The NT doesn't currently have a confirmed general stamp-duty concession for first home buyers — instead it offers cash grants (HomeGrown Territory Grant + FreshStart Grant). This is the standard rate.";
  }
  return null;
}

function calculateMonthlyRepayment(
  loanAmount: number,
  annualRatePercent: number,
  loanTermYears: number,
  repaymentType: string
): number {
  const monthlyRate = annualRatePercent / 100 / 12;
  const months = loanTermYears * 12;

  if (loanAmount <= 0) return 0;
  if (months <= 0) return 0;

  if (repaymentType === "Interest Only") {
    return loanAmount * monthlyRate;
  }

  if (monthlyRate === 0) {
    return loanAmount / months;
  }

  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

export default function AppPage() {
  const router = useRouter();
  const [showPdf, setShowPdf] = useState(false);
  const [showA2hs, setShowA2hs] = useState(false);
  const [netYieldInclMortgage, setNetYieldInclMortgage] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("650,000");
  const [deposit, setDeposit] = useState("130,000");
  const [conveyancer, setConveyancer] = useState("1,800");
  const [buildingPest, setBuildingPest] = useState("600");
  const [buyerAgent, setBuyerAgent] = useState("0");
  const [loanFee, setLoanFee] = useState("400");
  const [titleInsurance, setTitleInsurance] = useState("300");

  const [interestRate, setInterestRate] = useState("6.25");
  const [loanTerm, setLoanTerm] = useState("30");
  const [repaymentType, setRepaymentType] = useState("Principal & Interest");
  const [state, setState] = useState("QLD");
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>("Established");
  const [includeFhbGrant, setIncludeFhbGrant] = useState(true);

  const [weeklyRent, setWeeklyRent] = useState("620");
  const [rentFreq, setRentFreq] = useState("Weekly");
  const [vacancyRate, setVacancyRate] = useState("2");
  const [propertyManagement, setPropertyManagement] = useState("7");
  const [landlordIns, setLandlordIns] = useState("1,500");
  const [bodyCorp, setBodyCorp] = useState("0");
  const [maintenance, setMaintenance] = useState("2,000");
  const [councilRates, setCouncilRates] = useState("2,400");
  const [insurance, setInsurance] = useState("1,200");

  const currentPurchase = parseMoney(purchasePrice);
  const currentStampDuty = calculateEstimatedStampDuty(currentPurchase, state, isFirstHomeBuyer, propertyType);
  const fhbNote = getFhbNote(state, currentPurchase, isFirstHomeBuyer, propertyType);
  const fhbGrantAmount = getFhbGrantAmount(state, currentPurchase, propertyType, isFirstHomeBuyer, includeFhbGrant);
  const fhbGrantNote = getFhbGrantNote(state, currentPurchase, propertyType, isFirstHomeBuyer);
  const currentBuyingCosts =
    parseMoney(conveyancer) +
    parseMoney(buildingPest) +
    (parsePercent(buyerAgent) / 100 * currentPurchase) +
    parseMoney(loanFee) +
    parseMoney(titleInsurance);

  const currentLoanAmount =
    currentPurchase + currentStampDuty + currentBuyingCosts - parseMoney(deposit) - fhbGrantAmount;

  const rentMultiplier = rentFreq === "Weekly" ? 52 : rentFreq === "Fortnightly" ? 26 : rentFreq === "Monthly" ? 12 : 1;
  const currentAnnualRent = parseMoney(weeklyRent) * rentMultiplier;
  const currentVacancyCost = currentAnnualRent * (parsePercent(vacancyRate) / 100);
  const currentManagementCost = currentAnnualRent * (parsePercent(propertyManagement) / 100);
  const currentTotalExpenses =
    parseMoney(landlordIns) +
    parseMoney(bodyCorp) +
    parseMoney(maintenance) +
    parseMoney(councilRates) +
    parseMoney(insurance);
  const currentAnnualNetIncome =
    currentAnnualRent - currentVacancyCost - currentManagementCost - currentTotalExpenses;

  const currentMonthlyRepayment = calculateMonthlyRepayment(
    currentLoanAmount,
    parsePercent(interestRate),
    parseMoney(loanTerm),
    repaymentType
  );

  const currentGrossYield = currentPurchase > 0 ? (currentAnnualRent / currentPurchase) * 100 : 0;
  const currentNetYield = currentPurchase > 0 ? (currentAnnualNetIncome / currentPurchase) * 100 : 0;
  const annualCashflow = currentAnnualNetIncome - currentMonthlyRepayment * 12;
  const currentCashflow = annualCashflow / rentMultiplier;
  const currentRepayment = currentMonthlyRepayment * 12 / rentMultiplier;
  const netYieldWithMortgage = currentPurchase > 0 ? (annualCashflow / currentPurchase) * 100 : 0;
  const displayedNetYield = netYieldInclMortgage ? netYieldWithMortgage : currentNetYield;

  useEffect(() => {
    const totalExpenses = parseMoney(landlordIns) + parseMoney(bodyCorp) + parseMoney(maintenance) + parseMoney(councilRates) + parseMoney(insurance);
    localStorage.setItem("pc_analyser", JSON.stringify({
      price: purchasePrice,
      deposit,
      rent: weeklyRent,
      rentFreq,
      expenses: Math.round(totalExpenses).toLocaleString("en-AU"),
      rate: interestRate,
      state,
      isFirstHomeBuyer,
      propertyType,
      includeFhbGrant,
    }));
  }, [purchasePrice, deposit, weeklyRent, rentFreq, landlordIns, bodyCorp, maintenance, councilRates, insurance, interestRate, state, isFirstHomeBuyer, propertyType, includeFhbGrant]);

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, #F5F0E8, #FFFFFF)" }}
    >

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ backgroundColor: "rgba(250,247,242,0.9)", borderColor: "#E7E0D6" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#556987"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <div>
              <p className="text-lg font-semibold leading-none tracking-tight sm:text-2xl" style={{ color: "#314A6E" }}>
                Property Compass
              </p>
              <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
                by Sextant Digital
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowA2hs(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition hover:bg-white/60"
            style={{ borderColor: "#3D5A80", color: "#314A6E" }}
            aria-label="Add to home screen"
          >
            ?
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/images/piggybank.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-6 pt-14 pb-24 sm:px-8 md:min-h-[500px]">
          <div className="max-w-2xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Property Compass
            </p>
            <h1
              className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Property Explorer
            </h1>
            <p className="mt-3 text-base text-white/75 sm:text-lg">
              Explore what you can afford and how a property investment could perform.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>
            Navigate your next property move
          </p>
          <select
            value="/"
            onChange={(e) => router.push(e.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]"
            style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
          >
            <option value="/">Property Explorer</option>
            <option value="/app/mortgage">Mortgage Calculator</option>
            <option value="/app/yield">Yield Calculator</option>
            <option value="/app/cgt">Capital Gains Tax Estimator</option>
            <option value="/app/compare">Compare Properties</option>
          </select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div
              className="rounded-3xl border p-6 shadow-sm"
              style={{
                backgroundColor: "#FAF7F2",
                borderColor: "#E7E0D6",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    Purchase Details
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
                    Start with the upfront purchase numbers.
                  </p>
                </div>
              </div>

              <p className="mt-4 rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: "#EEF2FF", color: "#3D5A80" }}>
                ⟳ These inputs sync live to Property A in Compare Properties
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Purchase price
                  </label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={purchasePrice}
                      onChange={(e) => handleMoneyChange(e, setPurchasePrice)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(2); } }}
                      tabIndex={1}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Deposit
                  </label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={deposit}
                      onChange={(e) => handleMoneyChange(e, setDeposit)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }}
                      tabIndex={2}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }}
                    tabIndex={3}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  >
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
                  <input
                    type="checkbox"
                    id="fhb-toggle"
                    checked={isFirstHomeBuyer}
                    onChange={(e) => setIsFirstHomeBuyer(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "#3D5A80" }}
                  />
                  <label htmlFor="fhb-toggle" className="text-sm font-medium" style={{ color: "#3D5A80" }}>
                    First home buyer
                  </label>
                </div>

                {isFirstHomeBuyer && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>
                      Property type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                      style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isFirstHomeBuyer && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="fhb-grant-toggle"
                      checked={includeFhbGrant}
                      onChange={(e) => setIncludeFhbGrant(e.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "#3D5A80" }}
                    />
                    <label htmlFor="fhb-grant-toggle" className="text-sm font-medium" style={{ color: "#3D5A80" }}>
                      Include First Home Owner Grant (cash grant)
                    </label>
                  </div>
                )}

                {isFirstHomeBuyer && includeFhbGrant && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>First home owner grant</label>
                    <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#49A078", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                      <p className="text-base font-semibold" style={{ color: "#0F172A" }}>
                        {formatMoney(fhbGrantAmount)}
                      </p>
                      {fhbGrantNote && (
                        <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
                          {fhbGrantNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Stamp duty (est.)</label>
                  <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-base font-semibold" style={{ color: "#0F172A" }}>
                      {formatMoney(currentStampDuty)}
                    </p>
                    {fhbNote && (
                      <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
                        {fhbNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-3 text-sm font-medium" style={{ color: "#3D5A80" }}>
                    Buying costs
                  </p>
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
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleMoneyChange(e, setter)}
                            tabIndex={-1}
                            className="min-w-0 flex-1 bg-transparent outline-none text-sm"
                            style={{ color: "#0F172A" }}
                          />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="mb-1.5 block text-xs" style={{ color: "#64748B" }}>Buyer&apos;s agent fee</label>
                      <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                        <input
                          type="text"
                          value={buyerAgent}
                          onChange={(e) => setBuyerAgent(e.target.value)}
                          tabIndex={-1}
                          className="min-w-0 flex-1 bg-transparent outline-none text-sm"
                          style={{ color: "#0F172A" }}
                        />
                        <span className="ml-1 shrink-0 select-none" style={{ color: "#64748B" }}>%</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                      <p className="text-xs" style={{ color: "#64748B" }}>Total buying costs</p>
                      <p className="mt-1 text-base font-semibold" style={{ color: "#0F172A" }}>
                        {formatMoney(currentBuyingCosts)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl border p-6 shadow-sm"
              style={{
                backgroundColor: "#FAF7F2",
                borderColor: "#E7E0D6",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    Loan Details
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
                    Set the core loan settings for the deal.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Interest rate (%)
                  </label>
                  <input
                    type="text"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(5); } }}
                    tabIndex={4}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Repayment type
                  </label>
                  <div
                    tabIndex={5}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); focusField(6); }
                      if (e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                        e.preventDefault();
                        setRepaymentType(r => r === "Principal & Interest" ? "Interest Only" : "Principal & Interest");
                      }
                    }}
                    className="flex w-full overflow-hidden rounded-2xl border bg-white"
                    style={{ borderColor: "#E7E0D6", outline: "none" }}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setRepaymentType("Principal & Interest")}
                      className="flex-1 px-4 py-3 text-sm transition-colors"
                      style={{
                        backgroundColor: repaymentType === "Principal & Interest" ? "#3D5A80" : "transparent",
                        color: repaymentType === "Principal & Interest" ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      Principal & Interest
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setRepaymentType("Interest Only")}
                      className="flex-1 px-4 py-3 text-sm transition-colors"
                      style={{
                        backgroundColor: repaymentType === "Interest Only" ? "#3D5A80" : "transparent",
                        color: repaymentType === "Interest Only" ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      Interest Only
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Loan term (years)
                  </label>
                  <input
                    type="text"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(7); } }}
                    tabIndex={6}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  />
                </div>

                <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                  <p className="text-xs" style={{ color: "#64748B" }}>Loan amount (auto)</p>
                  <p className="mt-1 text-base font-semibold" style={{ color: "#0F172A" }}>
                    {formatMoney(currentLoanAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl border p-6 shadow-sm"
              style={{
                backgroundColor: "#FAF7F2",
                borderColor: "#E7E0D6",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    Income & Costs
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
                    Add rent and the ongoing holding costs.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {/* Frequency toggle + rent input */}
                <div>
                  <div className="mb-2 flex overflow-hidden rounded-xl border bg-white text-xs" style={{ borderColor: "#E7E0D6" }}>
                    {["Weekly", "Fortnightly", "Monthly", "Yearly"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        tabIndex={-1}
                        onClick={() => setRentFreq(f)}
                        className="flex-1 py-1.5 transition-colors"
                        style={{
                          backgroundColor: rentFreq === f ? "#3D5A80" : "transparent",
                          color: rentFreq === f ? "#fff" : "#64748B",
                        }}
                      >
                        {f === "Weekly" ? "Wkly" : f === "Fortnightly" ? "Frtly" : f === "Monthly" ? "Mthly" : "Yrly"}
                      </button>
                    ))}
                  </div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>{rentFreq} rent</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={weeklyRent}
                      onChange={(e) => handleMoneyChange(e, setWeeklyRent)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(8); } }}
                      tabIndex={7}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                {/* Spacer */}
                <div />

                {/* Property management */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Property management (%)</label>
                  <input
                    type="text"
                    value={propertyManagement}
                    onChange={(e) => setPropertyManagement(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(9); } }}
                    tabIndex={8}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  />
                </div>

                {/* Vacancy rate */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Vacancy rate (%)</label>
                  <input
                    type="text"
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(10); } }}
                    tabIndex={9}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  />
                </div>

                {/* Body corporate */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Body corporate</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={bodyCorp}
                      onChange={(e) => handleMoneyChange(e, setBodyCorp)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(11); } }}
                      tabIndex={10}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                {/* Landlord insurance */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Landlord insurance</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={landlordIns}
                      onChange={(e) => handleMoneyChange(e, setLandlordIns)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(12); } }}
                      tabIndex={11}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                {/* Council rates */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Council rates</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={councilRates}
                      onChange={(e) => handleMoneyChange(e, setCouncilRates)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(13); } }}
                      tabIndex={12}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                {/* Maintenance */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Maintenance</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={maintenance}
                      onChange={(e) => handleMoneyChange(e, setMaintenance)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(14); } }}
                      tabIndex={13}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                {/* Total expenses auto tile */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>{rentFreq} expenses (auto)</label>
                  <div className="rounded-2xl border-t-4 px-4 py-3" style={{ borderColor: "#3D5A80", backgroundColor: "#FAF7F2", boxShadow: "inset 0 0 0 1px #E7E0D6" }}>
                    <p className="text-base font-semibold" style={{ color: "#0F172A" }}>
                      {formatMoney(currentTotalExpenses / rentMultiplier)}
                    </p>
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "#3D5A80" }}>Insurance</label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={insurance}
                      onChange={(e) => handleMoneyChange(e, setInsurance)}
                      tabIndex={14}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </section>

          <aside
            className="rounded-3xl border p-6 shadow-sm lg:sticky lg:top-8 lg:self-start"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E7E0D6",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "#3D5A80" }}
                >
                  Results
                </p>
                <h2
                  className="mt-2 text-2xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  Results snapshot
                </h2>
              </div>
              <button
                onClick={() => setShowPdf(true)}
                className="shrink-0 rounded-2xl border px-4 py-2 text-xs font-medium transition hover:bg-white"
                style={{ borderColor: "#E7E0D6", color: "#3D5A80" }}
              >
                Save as PDF
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Loan amount
                </p>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatMoney(currentLoanAmount)}
                </p>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {rentFreq} repayment
                </p>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatMoney(currentRepayment)}
                </p>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Gross yield
                </p>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatPercent(currentGrossYield)}
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{
                    color:
                      currentGrossYield < 4
                        ? "#B45309"
                        : currentGrossYield <= 6
                        ? "#1D4ED8"
                        : "#15803D",
                  }}
                >
                  {currentGrossYield < 4
                    ? "Low return"
                    : currentGrossYield <= 6
                    ? "Average return"
                    : "Strong return"}
                </p>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Net yield
                </p>
                <div className="mt-1 flex overflow-hidden rounded-xl border text-xs" style={{ borderColor: "#E7E0D6" }}>
                  {[false, true].map((val) => (
                    <button key={String(val)} type="button" onClick={() => setNetYieldInclMortgage(val)}
                      className="flex-1 py-1 font-medium transition"
                      style={{ backgroundColor: netYieldInclMortgage === val ? "#3D5A80" : "transparent", color: netYieldInclMortgage === val ? "#FFFFFF" : "#94A3B8" }}>
                      {val ? "incl. mortgage" : "excl. mortgage"}
                    </button>
                  ))}
                </div>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatPercent(displayedNetYield)}
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{
                    color:
                      displayedNetYield < 0
                        ? "#DC2626"
                        : displayedNetYield < 4
                        ? "#B45309"
                        : displayedNetYield <= 6
                        ? "#1D4ED8"
                        : "#15803D",
                  }}
                >
                  {displayedNetYield < 0
                    ? "Negative return"
                    : displayedNetYield < 4
                    ? "Low return"
                    : displayedNetYield <= 6
                    ? "Average return"
                    : "Strong return"}
                </p>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {rentFreq} cashflow
                </p>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatMoney(currentCashflow)}
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{
                    color:
                      currentCashflow < -10
                        ? "#B45309"
                        : currentCashflow <= 10
                        ? "#1D4ED8"
                        : "#15803D",
                  }}
                >
                  {currentCashflow < -10
                    ? "Negatively geared"
                    : currentCashflow <= 10
                    ? "Neutral"
                    : "Positively geared"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── SEO Content ── */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="border-t pt-10" style={{ borderColor: "#E7E0D6" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "#0F172A" }}>How to analyse an investment property</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>Stamp duty by state, including 2026 first-home-buyer changes</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>Stamp duty (transfer duty in Queensland) is a state government tax paid when you buy property, typically adding $10,000–$30,000+ to your upfront costs. This calculator uses full duty schedules for all eight states and territories. If you&apos;re a first home buyer, tick the toggle above — from 1 July 2026 the ACT abolished stamp duty entirely for first home buyers, and NSW, QLD, VIC, WA and SA each offer their own exemption or concession depending on price and whether you&apos;re buying an established home, a new build, or vacant land.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>Gross yield vs net yield</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>Gross yield is your annual rent divided by the purchase price — a useful starting point. Net yield goes further by deducting all your ongoing holding costs: management fees, insurance, council rates, maintenance, and vacancy allowance. Net yield is a far more realistic measure of what a property actually earns and the number to focus on when deciding whether an investment stacks up.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>Negative gearing explained</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>A property is negatively geared when your costs — including mortgage repayments — exceed your rental income. In Australia, this shortfall is generally tax-deductible, which reduces the real after-tax cost. Most investment properties in capital cities are negatively geared, with investors accepting the cashflow deficit in exchange for expected long-term capital growth. A federal reform passed in the 2026-27 Budget will ring-fence rental losses on properties bought after 12 May 2026 to rental income only, starting 1 July 2027 (new builds are exempt) — it doesn&apos;t affect existing investments or the current financial year.</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold" style={{ color: "#314A6E" }}>First Home Owner Grants in 2026</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>On top of any stamp duty concession, most states pay a cash grant to first home buyers building or buying a new home: QLD ($30,000), NSW and VIC ($10,000), SA ($15,000, uncapped), WA ($10,000), TAS ($20,000 from 1 July 2026), and the NT (up to $80,000 across two grants). These only apply to new builds and vacant land, never established homes — and the ACT doesn&apos;t offer one at all, relying solely on its stamp duty exemption instead. Tick &quot;Include First Home Owner Grant&quot; above to see it reflected in your loan amount.</p>
            </div>
          </div>
        </div>
      </div>

      {showPdf && (
        <PdfModal
          title="Property Explorer"
          sections={[
            {
              heading: "Purchase Details",
              items: [
                { label: "Purchase price", value: formatMoney(currentPurchase) },
                { label: "Deposit", value: formatMoney(parseMoney(deposit)) },
                { label: "Stamp duty (est.)", value: formatMoney(currentStampDuty) },
                { label: "Total buying costs", value: formatMoney(currentBuyingCosts) },
                ...(fhbGrantAmount > 0 ? [{ label: "First home owner grant", value: `-${formatMoney(fhbGrantAmount)}` }] : []),
                { label: "Loan amount", value: formatMoney(currentLoanAmount) },
              ],
            },
            {
              heading: "Loan Details",
              items: [
                { label: "Interest rate", value: `${interestRate}%` },
                { label: "Loan term", value: `${loanTerm} years` },
                { label: "Repayment type", value: repaymentType },
                { label: `${rentFreq} repayment`, value: formatMoney(currentRepayment) },
              ],
            },
            {
              heading: "Income & Results",
              items: [
                { label: `${rentFreq} rent`, value: formatMoney(parseMoney(weeklyRent)) },
                { label: "Gross yield", value: formatPercent(currentGrossYield) },
                { label: "Net yield", value: formatPercent(currentNetYield) },
                { label: `${rentFreq} cashflow`, value: formatMoney(currentCashflow) },
              ],
            },
          ]}
          onClose={() => setShowPdf(false)}
        />
      )}

      {showA2hs && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: "rgba(15,23,42,0.5)" }}
          onClick={() => setShowA2hs(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl"
            style={{ backgroundColor: "#FAF7F2", border: "1px solid #E7E0D6" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold" style={{ color: "#0F172A" }}>Add to Home Screen</p>
              <button
                type="button"
                onClick={() => setShowA2hs(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                style={{ backgroundColor: "#E7E0D6", color: "#64748B" }}
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: "#4B5563" }}>
              Save Property Compass to your home screen for quick access — it works like an app, no App Store needed.
            </p>
            <div className="space-y-3">
              <div className="rounded-2xl p-4" style={{ backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#3D5A80" }}>iPhone / iPad</p>
                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                  Tap the <strong>Share</strong> button (the box with an arrow) at the bottom of Safari, then tap <strong>&quot;Add to Home Screen&quot;</strong>.
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#166534" }}>Android</p>
                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                  Tap the <strong>menu (⋮)</strong> in Chrome, then tap <strong>&quot;Add to Home Screen&quot;</strong> or <strong>&quot;Install App&quot;</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
