'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'The Lab', href: '/lab' },
  { label: 'Work with me', href: '/work-with-me' },
]

export default function SextantNav() {
  const pathname = usePathname()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{ background: 'linear-gradient(to bottom, rgba(6,13,31,0.85) 0%, transparent 100%)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="group transition-opacity hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sextant-logo.png"
            alt="Sextant Digital"
            style={{ height: '40px', width: 'auto', display: 'block' }}
          />
        </Link>

        <nav className="flex items-center gap-7">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: pathname === href ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.55)' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
