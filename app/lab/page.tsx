import type { Metadata } from 'next'
import Link from 'next/link'
import SextantLayout from '../components/SextantLayout'

export const metadata: Metadata = {
  title: 'The Lab | Sextant Digital',
  description: 'Free digital tools built by Sextant Digital — Property Compass, First Home Buyer Starter Kit and more. Simple tools for real decisions.',
  alternates: { canonical: 'https://propertycompass.sextantdigital.com.au/lab' },
}

const TOOLS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
          fill="rgba(255,255,255,0.75)" stroke="none" />
      </svg>
    ),
    badge: 'Free Web App · Live',
    badgeColor: 'rgba(74,222,128,0.15)',
    badgeTextColor: 'rgba(74,222,128,0.9)',
    name: 'Property Compass',
    description: 'A free web app that calculates all things buying or investing in Australian property — mortgage repayments, rental yield, capital gains tax and more.',
    features: ['Property Explorer', 'Mortgage Calculator', 'Rental Yield Calculator', 'Capital Gains Tax Estimator', 'Compare Properties'],
    cta: { label: 'Launch the app →', href: '/app' },
    live: true,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    badge: 'Starter Kit · Almost ready',
    badgeColor: 'rgba(251,191,36,0.12)',
    badgeTextColor: 'rgba(251,191,36,0.85)',
    name: 'First Home Buyer Starter Kit',
    description: 'Everything you need to navigate your first home purchase — from saving your deposit through to settlement day. Checklists, calculators, red flags and plain-English guides, all in one place.',
    features: ['Stamp duty + deposit calculator', 'Pre-purchase checklist', 'Property red flags guide', 'Document checklist', 'Offer to settlement timeline'],
    cta: null,
    live: false,
  },
]

export default function TheLabPage() {
  return (
    <SextantLayout>

      {/* ── Hero ── */}
      <section className="px-6 pt-40 pb-16 max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em] mb-6"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          The Lab
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light text-white leading-tight mb-6">
          I am the tool...
        </h1>
        <p className="text-lg max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Simple digital tools for real decisions, real people and real life.
        </p>
      </section>

      {/* ── Products ── */}
      <section className="px-6 pb-32 max-w-6xl mx-auto flex flex-col gap-6">
        {TOOLS.map((tool) => (
          <div
            key={tool.name}
            className="rounded-3xl border overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="grid md:grid-cols-[1fr_auto] gap-0">

              {/* Main content */}
              <div className="p-10 sm:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {tool.icon}
                  <span
                    className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: tool.badgeColor, color: tool.badgeTextColor }}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-light text-white mb-4">
                  {tool.name}
                </h2>

                <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {tool.description}
                </p>

                <ul className="flex flex-wrap gap-2 mb-8">
                  {tool.features.map((f) => (
                    <li
                      key={f}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                {tool.cta ? (
                  <Link
                    href={tool.cta.href}
                    className="inline-block rounded-full px-7 py-3 text-sm font-medium text-white border transition-colors hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,0.25)' }}
                  >
                    {tool.cta.label}
                  </Link>
                ) : (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    Almost ready — coming soon.
                  </p>
                )}
              </div>

            </div>
          </div>
        ))}
      </section>

    </SextantLayout>
  )
}
