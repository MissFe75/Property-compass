export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Property Compass
        </p>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Make smarter property decisions with clarity.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Modern tools for cash flow, yield, mortgage, and investment analysis.
          No clutter. Just clean numbers and confident decisions.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/app"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Open App
          </a>
          <a
            href="/tools"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            View Tools
          </a>
        </div>
      </section>
    </main>
  );
}