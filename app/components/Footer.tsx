export default function Footer() {
  return (
    <footer
      className="px-6 pt-10 pb-6"
      style={{
        background: "linear-gradient(to bottom, #0F172A, #0C1525)",
        borderTop: "1px solid #172032",
      }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Brand: icon stacked above name */}
        <div className="flex flex-col items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5A7A9A"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span className="text-sm font-semibold text-white">Property Compass</span>
        </div>

        {/* Divider */}
        <div className="mt-5 border-t" style={{ borderColor: "#172032" }} />

        {/* Three-column info row */}
        <div
          className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "#7A93AA" }}
        >
          <p>© 2026 Sextant Digital. All rights reserved.</p>
          <p>Built for Australian property investors 🇦🇺</p>
          <a
            href="mailto:hello@sextantdigital.com.au"
            className="transition-colors hover:text-slate-300"
            style={{ color: "#7A93AA" }}
          >
            hello@sextantdigital.com.au
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-xs leading-relaxed" style={{ color: "#6E8A9E" }}>
          <p>This app provides general information only and does not constitute financial, tax, or legal advice.</p>
          <p className="mt-1">Calculations are estimates — always consult a qualified adviser before making investment decisions.</p>
        </div>

      </div>
    </footer>
  );
}
