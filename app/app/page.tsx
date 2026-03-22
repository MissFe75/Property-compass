"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

function calculateEstimatedStampDuty(purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;

  // Simple QLD-style estimate for now.
  // We can replace this later with state-specific rules.
  if (purchasePrice <= 5000) return purchasePrice * 0.015;
  if (purchasePrice <= 75000) return 75 + (purchasePrice - 5000) * 0.035;
  if (purchasePrice <= 540000) return 2450 + (purchasePrice - 75000) * 0.035;
  if (purchasePrice <= 1000000) return 18725 + (purchasePrice - 540000) * 0.045;

  return 39425 + (purchasePrice - 1000000) * 0.0575;
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
  const [purchasePrice, setPurchasePrice] = useState("650,000");
  const [deposit, setDeposit] = useState("130,000");
  const [buyingCosts, setBuyingCosts] = useState("3,500");

  const [interestRate, setInterestRate] = useState("6.25");
  const [loanTerm, setLoanTerm] = useState("30");
  const [repaymentType, setRepaymentType] = useState("Principal & Interest");

  const [weeklyRent, setWeeklyRent] = useState("620");
  const [annualExpenses, setAnnualExpenses] = useState("8,500");
  const [vacancyRate, setVacancyRate] = useState("2");
  const [propertyManagement, setPropertyManagement] = useState("7");
  const [councilRates, setCouncilRates] = useState("2,400");
  const [insurance, setInsurance] = useState("1,200");

  const currentPurchase = parseMoney(purchasePrice);
  const currentStampDuty = calculateEstimatedStampDuty(currentPurchase);
  const currentLoanAmount =
    currentPurchase + currentStampDuty + parseMoney(buyingCosts) - parseMoney(deposit);

  const currentAnnualRent = parseMoney(weeklyRent) * 52;
  const currentVacancyCost = currentAnnualRent * (parsePercent(vacancyRate) / 100);
  const currentManagementCost = currentAnnualRent * (parsePercent(propertyManagement) / 100);
  const currentAnnualNetIncome =
    currentAnnualRent -
    currentVacancyCost -
    currentManagementCost -
    parseMoney(annualExpenses) -
    parseMoney(councilRates) -
    parseMoney(insurance);

  const currentMonthlyRepayment = calculateMonthlyRepayment(
    currentLoanAmount,
    parsePercent(interestRate),
    parseMoney(loanTerm),
    repaymentType
  );

  const currentGrossYield = currentPurchase > 0 ? (currentAnnualRent / currentPurchase) * 100 : 0;
  const currentNetYield = currentPurchase > 0 ? (currentAnnualNetIncome / currentPurchase) * 100 : 0;
  const currentWeeklyCashflow = (currentAnnualNetIncome - currentMonthlyRepayment * 12) / 52;

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{ background: "linear-gradient(to bottom, #F5F0E8, #FFFFFF)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="mb-10 rounded-[32px] border p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.76), rgba(250,247,242,0.96))",
            borderColor: "#E7E0D6",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex shrink-0 items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="46"
                    height="46"
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
                </div>
                <p
                  className="text-xl font-semibold tracking-tight sm:text-2xl"
                  style={{ color: "#3D5A80" }}
                >
                  Property Compass
                </p>
              </div>

              <h1
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: "#0F172A" }}
              >
                Property Analyser
              </h1>

              <p
                className="mt-3 max-w-3xl text-base leading-7 sm:text-lg"
                style={{ color: "#64748B" }}
              >
                Analyse a property deal with clean inputs and useful results at a glance.
              </p>
            </div>

            <div
              className="overflow-hidden rounded-[28px] border"
              style={{ borderColor: "#E7E0D6" }}
            >
              <img
                src="/images/piggybank.jpg"
                alt="Piggy bank representing property saving goals"
                className="h-56 w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>
            Navigate your next property move
          </p>
          <select
            value="/app"
            onChange={(e) => router.push(e.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none sm:w-auto sm:min-w-[280px]"
            style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
          >
            <option value="/app">Property Analyser</option>
            <option value="/app/mortgage">Mortgage Calculator</option>
            <option value="/app/yield">Rental Yield Calculator</option>
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

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(3); } }}
                      tabIndex={2}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div
                    tabIndex={-1}
                    className="rounded-2xl border bg-white px-4 py-3"
                    style={{ borderColor: "#E7E0D6" }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3D5A80" }}
                    >
                      Auto-calculated stamp duty
                    </p>
                    <p
                      className="mt-2 text-2xl font-semibold"
                      style={{ color: "#0F172A" }}
                    >
                      {formatMoney(currentStampDuty)}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Buying costs
                  </label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={buyingCosts}
                      onChange={(e) => handleMoneyChange(e, setBuyingCosts)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(4); } }}
                      tabIndex={3}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      style={{ color: "#0F172A" }}
                    />
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
                    Loan term (years)
                  </label>
                  <input
                    type="text"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(6); } }}
                    tabIndex={5}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <div
                    tabIndex={-1}
                    className="rounded-2xl border bg-white px-4 py-3"
                    style={{ borderColor: "#E7E0D6" }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#3D5A80" }}
                    >
                      Auto-calculated loan amount
                    </p>
                    <p
                      className="mt-2 text-2xl font-semibold"
                      style={{ color: "#0F172A" }}
                    >
                      {formatMoney(currentLoanAmount)}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Repayment type
                  </label>
                  <div
                    tabIndex={6}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); focusField(7); }
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
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Weekly rent
                  </label>
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

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Annual expenses
                  </label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={annualExpenses}
                      onChange={(e) => handleMoneyChange(e, setAnnualExpenses)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(9); } }}
                      tabIndex={8}
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
                    Vacancy rate (%)
                  </label>
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

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Property management (%)
                  </label>
                  <input
                    type="text"
                    value={propertyManagement}
                    onChange={(e) => setPropertyManagement(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(11); } }}
                    tabIndex={10}
                    className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    style={{ borderColor: "#E7E0D6", color: "#0F172A" }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "#3D5A80" }}
                  >
                    Council rates
                  </label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={councilRates}
                      onChange={(e) => handleMoneyChange(e, setCouncilRates)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusField(12); } }}
                      tabIndex={11}
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
                    Insurance
                  </label>
                  <div className="flex items-center rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "#E7E0D6" }}>
                    <span className="mr-1 shrink-0 select-none" style={{ color: "#64748B" }}>$</span>
                    <input
                      type="text"
                      value={insurance}
                      onChange={(e) => handleMoneyChange(e, setInsurance)}
                      tabIndex={12}
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
                  Monthly repayment
                </p>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatMoney(currentMonthlyRepayment)}
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
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatPercent(currentNetYield)}
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{
                    color:
                      currentNetYield < 4
                        ? "#B45309"
                        : currentNetYield <= 6
                        ? "#1D4ED8"
                        : "#15803D",
                  }}
                >
                  {currentNetYield < 4
                    ? "Low return"
                    : currentNetYield <= 6
                    ? "Average return"
                    : "Strong return"}
                </p>
              </div>

              <div
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Weekly cashflow
                </p>
                <p
                  className="mt-2 text-3xl font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {formatMoney(currentWeeklyCashflow)}
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{
                    color:
                      currentWeeklyCashflow < -10
                        ? "#B45309"
                        : currentWeeklyCashflow <= 10
                        ? "#1D4ED8"
                        : "#15803D",
                  }}
                >
                  {currentWeeklyCashflow < -10
                    ? "Negatively geared"
                    : currentWeeklyCashflow <= 10
                    ? "Neutral"
                    : "Positively geared"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
