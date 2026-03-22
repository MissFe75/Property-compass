import Link from "next/link";

export default function HomePage() {
  const tools = [
    {
      title: "Property Analyser",

      description:
        "Run a clean snapshot of purchase price, deposit, repayments, yield and weekly cash flow.",
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
      title: "Break-even Calculator",
      description:
        "See the rent or price point needed to make a deal stack up.",
      href: "/app/breakeven",
    },
    {
      title: "CGT Calculator",
      description:
        "Get a simple capital gains estimate for investment property scenarios.",
      href: "/app/cgt",
    },
    {
      title: "Compare Deals",
      description:
        "Put two property scenarios side by side and compare the numbers.",
      href: "/app/compare",
    },
  ];

  return (
    <main
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #F5F0E8, #FFFFFF)",
        color: "#0F172A",
      }}
    >
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{
          backgroundColor: "rgba(250, 247, 242, 0.88)",
          borderColor: "#E7E0D6",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
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
              <p
                className="text-2xl font-semibold leading-none tracking-tight"
                style={{ color: "#314A6E" }}
              >
                Property Compass
              </p>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
                by Sextant Digital
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <a
              href="#tools"
              className="rounded-2xl border px-5 py-3 text-sm font-medium transition hover:bg-white/70"
              style={{ borderColor: "#3D5A80", color: "#314A6E" }}
            >
              Features
            </a>

            <Link
              href="/app"
              className="rounded-2xl px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              style={{
                backgroundColor: "#3D5A80",
                boxShadow: "0 10px 24px rgba(61, 90, 128, 0.22)",
              }}
            >
              Launch App →
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(15,23,42,0.45), rgba(15,23,42,0.12)), url("/hero-houses.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative mx-auto flex min-h-[540px] max-w-6xl items-end px-6 py-12 md:min-h-[640px]">
          <div className="max-w-3xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Property Compass
            </p>

            <h1
              className="mt-4 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
              style={{ color: "#FFFFFF" }}
            >
              Navigate your next property move
            </h1>

            <p
              className="mt-6 max-w-2xl text-lg leading-8 sm:text-xl"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Free tool for buying and investing in Aussie Property with clean layouts and no spreadsheet misery
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/app"
                className="rounded-2xl px-7 py-4 text-base font-medium text-white transition hover:opacity-90"
                style={{
                  backgroundColor: "#3D5A80",
                  boxShadow: "0 10px 24px rgba(61, 90, 128, 0.25)",
                }}
              >
                Launch App →
              </Link>

              <a
                href="#tools"
                className="rounded-2xl border px-7 py-4 text-base font-medium transition"
                style={{
                  borderColor: "rgba(255,255,255,0.75)",
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                Explore Tools
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#3D5A80" }}
            >
              Free property tools
            </p>

            <h2
              className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
              style={{ color: "#0F172A" }}
            >
              Free tools for buying & investing in Aussie property
            </h2>

            <p
              className="mt-6 max-w-2xl text-lg leading-9"
              style={{ color: "#4B5563" }}
            >
              A free app that calculates all things buying or investing in
              Australian property, including mortgage repayments, rental yield,
              capital gains tax and side-by-side deal checks. No sign-up. No
              paywall. Just the numbers.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {tools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="rounded-3xl border p-5 transition hover:-translate-y-0.5 hover:bg-white"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)",
                    borderColor: "#E7E0D6",
                    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "#0F172A" }}
                  >
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7" style={{ color: "#64748B" }}>
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div
            className="rounded-[32px] border p-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.82)",
              borderColor: "#E7E0D6",
              boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06)",
            }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#7C8698" }}
            >
              Example property analysis
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div
                className="rounded-3xl border-t-4 p-5"
                style={{
                  borderColor: "#49A078",
                  backgroundColor: "#FAF7F2",
                  boxShadow: "inset 0 0 0 1px #E7E0D6",
                }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Gross yield
                </p>
                <p className="mt-3 text-4xl font-semibold" style={{ color: "#0F172A" }}>
                  5.2%
                </p>
              </div>

              <div
                className="rounded-3xl border-t-4 p-5"
                style={{
                  borderColor: "#3D5A80",
                  backgroundColor: "#FAF7F2",
                  boxShadow: "inset 0 0 0 1px #E7E0D6",
                }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Net yield
                </p>
                <p className="mt-3 text-4xl font-semibold" style={{ color: "#0F172A" }}>
                  4.1%
                </p>
              </div>

              <div
                className="rounded-3xl border-t-4 p-5"
                style={{
                  borderColor: "#D4A373",
                  backgroundColor: "#FAF7F2",
                  boxShadow: "inset 0 0 0 1px #E7E0D6",
                }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Monthly repayment
                </p>
                <p className="mt-3 text-4xl font-semibold" style={{ color: "#0F172A" }}>
                  $2,684
                </p>
              </div>

              <div
                className="rounded-3xl border-t-4 p-5"
                style={{
                  borderColor: "#49A078",
                  backgroundColor: "#FAF7F2",
                  boxShadow: "inset 0 0 0 1px #E7E0D6",
                }}
              >
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Net weekly cashflow
                </p>
                <p className="mt-3 text-4xl font-semibold" style={{ color: "#0F172A" }}>
                  +$48/wk
                </p>
              </div>
            </div>

            <div
              className="mt-8 rounded-3xl border p-6"
              style={{
                backgroundColor: "#FFFDF9",
                borderColor: "#E7E0D6",
              }}
            >
              <p className="text-sm leading-7" style={{ color: "#64748B" }}>
                Start with the flagship analyser, then branch into mortgage,
                yield, break-even, CGT and comparison tools as needed.
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

      <footer
        className="border-t"
        style={{
          borderColor: "#E7E0D6",
          backgroundColor: "rgba(250, 247, 242, 0.78)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                <p className="font-medium" style={{ color: "#314A6E" }}>
                  Property Compass by Sextant Digital
                </p>
                <p className="mt-1" style={{ color: "#64748B" }}>
                  Navigate your next property move.
                </p>
              </div>
            </div>

          <div className="text-sm" style={{ color: "#64748B" }}>
            <p>hello@sextantdigital.com.au</p>
            <p className="mt-1">
              General information only. Not financial, tax or legal advice.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );

}
