export default function ToolsPage() {
  const tools = [
    "Mortgage Calculator",
    "Yield Calculator",
    "Capital Gains Tax Calculator",
    "Break-even Calculator",
    "Property Comparison Tool",
  ];

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Tools
        </p>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Your property toolkit
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          All the core tools you need to analyse property deals without messy
          spreadsheets and emotional suffering.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{tool}</h2>
              <p className="mt-2 text-sm text-slate-600">
                A clean, focused tool page will go here.
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}