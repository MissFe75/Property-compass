export default function SextantFooter() {
  return (
    <footer className="px-6 py-12">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
          &ldquo;Vibe coding through a properly cooked world since 2026 — here to remove the headache so you can live your life&rdquo;
        </p>
        <div
          className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          <span>© 2026 Sextant Digital. All rights reserved.</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <a
            href="https://mail.google.com/mail/?view=cm&to=hello@sextantdigital.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white/50"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            hello@sextantdigital.com.au
          </a>
        </div>
      </div>
    </footer>
  )
}
