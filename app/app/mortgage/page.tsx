"use client";

import { useRouter } from "next/navigation";

export default function MortgagePage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{ background: "linear-gradient(to bottom, #F5F0E8, #FFFFFF)" }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Hero card */}
        <div
          className="mb-8 rounded-[32px] border p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.76), rgba(250,247,242,0.96))",
            borderColor: "#E7E0D6",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
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

            <div className="min-w-0">
              <p
                className="text-sm font-semibold uppercase tracking-[0.22em]"
                style={{ color: "#3D5A80" }}
              >
                Property Compass
              </p>

              <h1
                className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: "#0F172A" }}
              >
                Mortgage Calculator
              </h1>

              <p
                className="mt-3 max-w-3xl text-base leading-7 sm:text-lg"
                style={{ color: "#64748B" }}
              >
                Calculate repayments for principal and interest or interest-only loans with clean, simple inputs.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>
            Navigate your next property move
          </p>
          <select
            value="/app/mortgage"
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

        {/* Placeholder content */}
        <div
          className="rounded-3xl border p-8 shadow-sm"
          style={{ backgroundColor: "#FAF7F2", borderColor: "#E7E0D6" }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-[0.18em]"
            style={{ color: "#3D5A80" }}
          >
            Coming next
          </p>
          <h2
            className="mt-2 text-2xl font-semibold"
            style={{ color: "#0F172A" }}
          >
            Mortgage Calculator
          </h2>
          <p className="mt-3 text-base" style={{ color: "#64748B" }}>
            This calculator is being built. Check back soon.
          </p>
        </div>

      </div>
    </main>
  );
}
