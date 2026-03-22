import Link from "next/link";

const tools = [
  {
    title: "Property Analyser",
    description:
      "Run a full snapshot of purchase price, deposit, repayments, yield and weekly cash flow.",
    href: "/app",
  },
  {
    title: "Mortgage Calculator",
    description:
      "Estimate repayments across different loan amounts, rates and terms.",
    href: "/app/mortgage",
  },
  {
    title: "Rental Yield Calculator",
    description:
      "Check gross and net rental yield with rent, costs and purchase price.",
    href: "/app/yield",
  },
  {
    title: "Capital Gains Tax Estimator",
    description:
      "Get a simple capital gains estimate for investment property scenarios.",
    href: "/app/cgt",
  },
  {
    title: "Compare Properties",
    description:
      "Put two property scenarios side by side and compare the numbers.",
    href: "/app/compare",
  },
];

const features = [
  {
    title: "Always free",
    description: "No subscription, no hidden fees. Use every tool at no cost.",
  },
  {
    title: "No account required",
    description: "Open the app and start calculating. Nothing to sign up for.",
  },
  {
    title: "ATO-aligned",
    description: "Built around Australian tax rules and property conventions.",
  },
  {
    title: "Instant results",
    description: "Every calculation updates live as you type. No waiting.",
  },
];

const exampleStats = [
  { label: "Gross yield", value: "5.2%", accent: "#49A078" },
  { label: "Net yield", value: "4.1%", accent: "#3D5A80" },
  { label: "Monthly repayment", value: "$2,684", accent: "#D4A373" },
  { label: "Net weekly cashflow", value: "+$48/wk", accent: "#49A078" },
];

export default function HomePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, #F5F0E8, #FFFFFF)", color: "#0F172A" }}
    >

      {/* ── Hero card ── */}
      <section className="mx-auto max-w-6xl px-6 pt-6 pb-4">
        <div
          className="rounded-[32px] border px-10 pt-8 pb-12 sm:px-14 sm:pt-10 sm:pb-16"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.76), rgba(250,247,242,0.96))",
            borderColor: "#E7E0D6",
            boxShadow: "0 16px 48px rgba(15,23,42,0.07)",
          }}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

            {/* Left: logo + headline + CTA */}
            <div className="flex flex-col justify-center gap-6">

              {/* Logo block */}
              <div>
                <div className="flex items-center gap-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
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
                  <p
                    className="text-2xl font-semibold tracking-tight sm:text-3xl"
                    style={{ color: "#3D5A80" }}
                  >
                    Property Compass
                  </p>
                </div>
                <p className="mt-1.5 text-sm" style={{ color: "#94A3B8" }}>
                  Navigate your next property move
                </p>
              </div>

              {/* Headline + body */}
              <div className="space-y-3">
                <h1
                  className="text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl"
                  style={{ color: "#0F172A" }}
                >
                  Free tools for buying &amp; investing in Aussie property
                </h1>
                <p className="text-lg leading-7" style={{ color: "#4B5563" }}>
                  Calculate mortgage repayments, yield, CGT and compare up to 3 properties — no spreadsheets required.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <Link
                  href="/app"
                  className="inline-flex rounded-2xl px-7 py-4 text-base font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#3D5A80", boxShadow: "0 10px 24px rgba(61,90,128,0.25)" }}
                >
                  Launch free app →
                </Link>
              </div>
            </div>

            {/* Right: image */}
            <div
              className="overflow-hidden rounded-[28px] border"
              style={{ borderColor: "#E7E0D6" }}
            >
              <img
                src="/hero-houses.jpg"
                alt="Australian residential street"
                className="h-full w-full object-cover"
                style={{ maxHeight: "420px" }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Features + example card ── */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-10">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Left: feature cards (2×2 grid) */}
          <div className="grid grid-cols-2 content-start gap-4 lg:pt-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border bg-white p-6"
                style={{ borderColor: "#E7E0D6", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}
              >
                <p className="text-base font-semibold" style={{ color: "#0F172A" }}>
                  {f.title}
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "#64748B" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right: example analysis card */}
          <div
            className="rounded-[32px] border p-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              borderColor: "#E7E0D6",
              boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
            }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#7C8698" }}
            >
              Example property analysis
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {exampleStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border-t-4 p-5"
                  style={{
                    borderColor: stat.accent,
                    backgroundColor: "#FAF7F2",
                    boxShadow: "inset 0 0 0 1px #E7E0D6",
                  }}
                >
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold" style={{ color: "#0F172A" }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-6 rounded-3xl border p-6"
              style={{ backgroundColor: "#FFFDF9", borderColor: "#E7E0D6" }}
            >
              <p className="text-sm leading-7" style={{ color: "#64748B" }}>
                Start with the flagship analyser, then branch into mortgage,
                yield, CGT and comparison tools as needed.
              </p>
              <Link
                href="/app"
                className="mt-5 inline-flex rounded-2xl px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: "#3D5A80" }}
              >
                Open Property Analyser
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Tools section ── */}
      <section id="tools" className="mx-auto max-w-6xl px-6 pt-4 pb-20">
        <p
          className="text-sm font-semibold uppercase tracking-[0.22em]"
          style={{ color: "#3D5A80" }}
        >
          The toolkit
        </p>
        <h2
          className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
          style={{ color: "#0F172A" }}
        >
          Everything you need to analyse Aussie property
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-8" style={{ color: "#4B5563" }}>
          Five purpose-built calculators in one app — all free, all instant, no
          spreadsheets required.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="rounded-3xl border p-6 transition hover:-translate-y-0.5 hover:bg-white"
              style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderColor: "#E7E0D6",
                boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: "#0F172A" }}>
                {tool.title}
              </h3>
              <p className="mt-2 text-sm leading-7" style={{ color: "#64748B" }}>
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
