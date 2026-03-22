"use client";

import { useRouter } from "next/navigation";

export default function ComparePage() {
  const router = useRouter();

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
              <p className="mt-1 text-xs" style={{ color: "#64748B" }}>by Sextant Digital</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="/#tools"
              className="hidden rounded-2xl border px-5 py-2.5 text-sm font-medium transition hover:bg-white/70 sm:block"
              style={{ borderColor: "#3D5A80", color: "#314A6E" }}
            >
              All tools
            </a>
            <a
              href="/"
              className="rounded-2xl px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#3D5A80", boxShadow: "0 4px 14px rgba(61,90,128,0.25)" }}
            >
              ← Home
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/images/magnify.jpg")',
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
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Compare Properties
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Calculator switcher */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium" style={{ color: "#64748B" }}>
            Navigate your next property move
          </p>
          <select
            value="/app/compare"
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "#3D5A80" }}>
            Coming next
          </p>
          <h2 className="mt-2 text-2xl font-semibold" style={{ color: "#0F172A" }}>
            Compare Properties
          </h2>
          <p className="mt-3 text-base" style={{ color: "#64748B" }}>
            This calculator is being built. Check back soon.
          </p>
        </div>

      </div>
    </main>
  );
}
