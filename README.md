# Property Compass

Free Australian property investment calculators by **Sextant Digital**. Live at **[propertycompass.sextantdigital.com.au](https://propertycompass.sextantdigital.com.au)**.

Built with Next.js (App Router) + Tailwind CSS, hosted on Vercel. No backend, database or login: everything runs in the browser. PDF reports are made with `jspdf`.

## Deploying

**Pushing to `main` deploys to production automatically** (Vercel ↔ GitHub, usually live within a minute). There is no staging step, so check before you push:

```bash
npx next build   # must pass cleanly
```

DNS is on Cloudflare.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

| Page | Route | File |
|---|---|---|
| Landing page | `/` | `app/page.tsx` |
| Property Explorer (includes stamp duty) | `/app` | `app/app/page.tsx` |
| Mortgage Calculator | `/app/mortgage` | `app/app/mortgage/page.tsx` |
| Yield Calculator | `/app/yield` | `app/app/yield/page.tsx` |
| Capital Gains Tax Estimator | `/app/cgt` | `app/app/cgt/page.tsx` |
| Compare Properties | `/app/compare` | `app/app/compare/page.tsx` |
| All tools | `/tools` | `app/tools/page.tsx` |
| Lab | `/lab` | `app/lab/page.tsx` |
| Work with me | `/work-with-me` | `app/work-with-me/page.tsx` |

Shared pieces live in `app/components/` (nav, footers, PDF modal).

Tax and stamp duty rules were last updated for the **July 2026** law changes. Re-check them each new financial year.

## Contact

Email links use `mailto:hello@sextantdigital.com.au` (Zoho Mail, forwarded to Gmail).

## Notes

- `notes/project-notes.md`: status, next steps, app store plans (Capacitor).
- `notes/progress.md`: session log.
- `notes/FHB-Kit-Source-of-Truth.md`: every input and calculation in the calculators, documented for the First Home Buyer Starter Kit.

## Related

| Site | Repo | URL |
|---|---|---|
| Sextant Digital (studio site) | `MissFe75/sextant-website` | sextantdigital.com.au |

## Licence

All rights reserved. See `LICENSE`.
