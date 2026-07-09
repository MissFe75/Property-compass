import type { Metadata } from 'next'
import SextantLayout from '../components/SextantLayout'

export const metadata: Metadata = {
  title: 'Work with me | Sextant Digital',
  description: 'Get in touch with Sextant Digital. I build clean websites and practical digital tools for small businesses — no agency process, no jargon.',
  alternates: { canonical: 'https://propertycompass.sextantdigital.com.au/work-with-me' },
}

const WHAT_I_DO = [
  {
    title: 'Websites',
    description: 'Clean, fast, no-nonsense websites that look great and actually work — built to your needs, not off a generic template.',
  },
  {
    title: 'Digital tools & calculators',
    description: 'Custom web tools for businesses that need something a spreadsheet can\'t do — interactive, shareable, and built properly.',
  },
  {
    title: 'Small business digital strategy',
    description: 'Not sure where to start? I can help you figure out what you actually need — and more importantly, what you don\'t.',
  },
]

export default function WorkWithMePage() {
  return (
    <SextantLayout>

      {/* ── Hero ── */}
      <section className="px-6 pt-40 pb-20 max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em] mb-6"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Work with me
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light text-white leading-tight mb-6 max-w-3xl">
          Want to work with me?
        </h1>
        <p className="text-lg max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          I build simple, clean digital tools and websites for small businesses. No bloated agency process, no jargon, no drama — just good work that does what it needs to do.
        </p>
      </section>

      {/* ── What I do ── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-4">
          {WHAT_I_DO.map(({ title, description }) => (
            <div
              key={title}
              className="rounded-2xl border p-8"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
            >
              <h3 className="text-base font-medium text-white mb-3">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Get in touch ── */}
      <section className="px-6 pb-32 max-w-6xl mx-auto">
        <div
          className="rounded-3xl border p-10 sm:p-16 text-center"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-6"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Get in touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-5">
            Drop me a message
          </h2>
          <p className="text-base leading-relaxed max-w-md mx-auto mb-10"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Got a project, an idea, or just a question? I&apos;d love to hear from you. No obligation, no sales pitch.
          </p>
          <a
            href="https://mail.google.com/mail/?view=cm&to=hello@sextantdigital.com.au&su=Working%20with%20Sextant%20Digital"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-medium transition-colors hover:bg-white/90"
            style={{ background: 'white', color: '#060d1f' }}
          >
            hello@sextantdigital.com.au →
          </a>
          <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Opens Gmail · I&apos;ll get back to you within a day or two
          </p>
        </div>
      </section>

    </SextantLayout>
  )
}
