import Link from "next/link";

const tools = [
  {
    title: "Property Explorer",
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
    title: "Yield Calculator",
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

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ backgroundColor: "rgba(250,247,242,0.9)", borderColor: "#E7E0D6" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center">
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
            </div>
            <div>
              <p className="text-lg font-semibold leading-none tracking-tight sm:text-2xl" style={{ color: "#314A6E" }}>
                Property Compass
              </p>
              <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
                by Sextant Digital
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <a
              href="#tools"
              className="hidden rounded-2xl border px-5 py-2.5 text-sm font-medium transition hover:bg-white/70 sm:block"
              style={{ borderColor: "#3D5A80", color: "#314A6E" }}
            >
              Features
            </a>
            <Link
              href="/app"
              className="rounded-2xl px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#3D5A80", boxShadow: "0 4px 14px rgba(61,90,128,0.25)" }}
            >
              Launch App →
            </Link>
          </nav>

        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 55%, rgba(15,23,42,0.1) 100%), url("/hero-houses.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end px-6 py-14 sm:px-8 md:min-h-[500px]">
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
              Navigate your next property move
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-2xl px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: "#3D5A80", boxShadow: "0 10px 24px rgba(61,90,128,0.3)" }}
              >
                Launch free app →
              </Link>
              <a
                href="#tools"
                className="rounded-2xl border px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                See the tools
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro + example card ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">

          {/* Copy */}
          <div>
            <p
              className="text-base font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#3D5A80" }}
            >
              Free property tools
            </p>
            <h2
              className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: "#0F172A" }}
            >
              Free tools for buying &amp; investing in Aussie property
            </h2>
            <p className="mt-6 text-lg leading-9" style={{ color: "#4B5563" }}>
              A free app that calculates all things buying or investing in
              Australian property — mortgage repayments, rental yield, capital
              gains tax and more. No sign-up. No paywall. Just the numbers.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="rounded-2xl px-7 py-4 text-base font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: "#3D5A80", boxShadow: "0 10px 24px rgba(61,90,128,0.2)" }}
              >
                Launch free app →
              </Link>
              <a
                href="#tools"
                className="rounded-2xl border px-7 py-4 text-base font-medium transition hover:bg-white"
                style={{ borderColor: "#E7E0D6", color: "#314A6E" }}
              >
                See the tools
              </a>
            </div>
          </div>

          {/* Example analysis card */}
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
              Simple example property analysis
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
                Start with the flagship explorer, then branch into mortgage,
                yield, CGT and comparison tools as needed.
              </p>
              <Link
                href="/app"
                className="mt-5 inline-flex rounded-2xl px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: "#3D5A80" }}
              >
                Open Property Explorer
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features strip ── */}
      <section
        className="border-y py-16"
        style={{ borderColor: "#E7E0D6", backgroundColor: "rgba(250,247,242,0.7)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
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
        </div>
      </section>

      {/* ── Tools section ── */}
      <section id="tools" className="mx-auto max-w-6xl px-6 py-16">
        <p
          className="text-base font-semibold uppercase tracking-[0.22em]"
          style={{ color: "#3D5A80" }}
        >
          The toolkit
        </p>
        <h2
          className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          style={{ color: "#0F172A" }}
        >
          Simple tools to help you buy your first home or your next investment
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-9" style={{ color: "#4B5563" }}>
          Five purpose-built calculators in one app — all free, all instant.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
