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

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "#172032" }} />

        {/* Brand */}
        <div className="mt-5 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span className="text-sm font-semibold text-white">Property Compass</span>
        </div>

        {/* Info row — stacks on mobile, row on desktop */}
        <div
          className="mt-2 flex flex-col gap-2 text-sm"
          style={{ color: "#A8BFD0" }}
        >
          <p>© 2026 Sextant Digital. All rights reserved.</p>
          <a
            href="mailto:hello@sextantdigital.com.au"
            className="transition-colors hover:text-slate-300"
            style={{ color: "#A8BFD0" }}
          >
            hello@sextantdigital.com.au
          </a>
        </div>

        {/* Disclaimer — single block */}
        <p className="mt-4 text-xs leading-relaxed" style={{ color: "#94AEBF" }}>
          This app provides general information only and does not constitute financial, tax, or legal advice. Calculations are estimates and costs may vary — always consult a qualified adviser before making investment decisions.
        </p>

      </div>
    </footer>
  );
}
