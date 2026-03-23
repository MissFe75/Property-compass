# Property Compass — Project Notes

Last updated: March 21, 2026
Status: Working app — now in refinement phase (decision tool upgrade)

---

## About This Project
- App name: Property Compass
- Business: Sextant Digital (sole trader, owner: Fiona Graham)
- Domain: sextantdigital.com.au
- Email: hello@sextantdigital.com.au
- Location: /Users/graham/Projects/property-compass

---

## Stack
- Next.js
- Tailwind CSS
- VS Code
- GitHub
- Vercel (later)
- Python (later, for formulas/backend if needed)

---

## Brand Palette
- Main accent / slate blue: `#3D5A80`
- Warm cream background: `#F5F0E8`
- Warm sidebar/card tint: `#FAF7F2`
- White: `#FFFFFF`
- Deep navy text: `#0F172A`
- Muted secondary text: `#64748B`
- Soft border: `#E7E0D6`

---

## Routes
- `/` — landing page (marketing / welcome)
- `/app` — Property Analyser (main workspace)
- `/tools` — tools page
- Planned tool pages: `/app/mortgage`, `/app/yield`, `/app/breakeven`, `/app/cgt`, `/app/compare`

Design principle:
- Landing page = marketing / hero
- App page = working tool / workspace

Calculator navigation plan:
- Keep /app as the main Property Analyser
- Other calculators as separate pages (links above)
- Add a calculator switcher near the top of /app
  - Desktop: pill buttons / tabs
  - Mobile: dropdown if needed
- Avoid turning /app into one giant all-in-one page

---

## Current State

### Live Domain
- sextantdigital.com.au → Cloudflare → GitHub Pages → property-toolkit (placeholder)
- Placeholder shows "Work in progress" while Property Compass is built separately
- Domain will be moved to Property Compass when ready

### Property Analyser (/app)

The app is fully built and working. All inputs are connected to calculation logic.

**Purchase Details**
- Purchase price
- Deposit
- Stamp duty (auto-calculated, QLD-style tiers, live-updating)
- Buying costs

**Loan Details**
- Interest rate
- Loan term
- Loan amount (auto-calculated: price + stamp duty + costs − deposit)
- Repayment type (Principal & Interest / Interest Only)

**Income & Costs**
- Weekly rent
- Annual expenses
- Vacancy rate (%)
- Property management (%)
- Council rates
- Insurance

**Results Panel (sticky on desktop)**
- Loan amount
- Monthly repayment
- Gross yield
- Net yield
- Weekly cashflow

**Header**
- Compass icon + "Property Compass" brand line + "Property Analyser" subline
- Descriptive sentence below
- Calmer and more compact than the landing page hero — intentional design choice

**Layout**
- Two-column desktop (inputs left, sticky results right)
- Hero card with piggy bank image
- Tailwind + brand palette consistently applied

---

## Deployment

- **Live at:** sextantdigital.com.au
- **Hosting:** Vercel (auto-deploys on every GitHub push)
- **DNS:** Cloudflare managing sextantdigital.com.au → Vercel
- **Workflow:** push to GitHub → Vercel deploys automatically, no manual steps
- **TODO:** Set up sextantdigital.au redirects to sextantdigital.com.au (DNS not active yet)

---

## Next Steps

1. Sort sextantdigital.au redirects when .au DNS is ready
2. Continue refining calculators

---

## Notes System

- `project-notes.md` — full session logs, decisions, and current state (this file)
- `progress.md` — short session snapshot (current state + next step)
- Claude chat — code instructions and feature implementation

Workflow:
- During session: use Claude for code
- End of session: update both notes files
- Always paste "ready to use" blocks into project-notes.md unless stated otherwise
- Goal: store only key decisions and progress, not full chat logs

---

## Session Logs

### March 19, 2026 — Landing page polish
- Added and positioned hero image (`public/hero-houses.jpg` / `public/images/`)
- Updated hero sentence to: *"Free tool for buying and investing in Aussie Property with clean layouts and no spreadsheet misery"*
- Restored footer compass icon to proper compass-style SVG (removed outer circle, lightened colour, tightened spacing, reduced size)
- Updated header icon to match footer (same SVG, removed outer border/ring, adjusted spacing)
- Main file edited: `app/app/page.tsx`
- Committed: `"Landing page polish, header/footer icon updates, hero text and image"`

**Things learned:**
- Use `grep` to find exact text in files
- Use `sed -n 'start,endp' file` to inspect line ranges before editing
- Keep edits small and test after each one
- Check the actual live block before editing — files can contain duplicate or older text

### March 20, 2026 — Domain rescue and repo confirmation
- sextantdigital.com.au was showing a GitHub Pages 404
- Root cause: property-toolkit repo had no valid index.html in the published root
- Fix: created a simple static "Work in progress" index.html directly in GitHub; redeployed successfully
- Zoho mail records left untouched
- Confirmed git repo root: `/Users/graham/Projects/property-compass`
- VS Code parent-repo popup can be ignored (click Never or X)

### March 20–21, 2026 — Property Analyser build
- Built skeleton layout for /app (Purchase Details, Loan Details, Income & Costs, Results)
- Expanded all three input sections with full fields
- Made Results panel sticky on desktop
- Redesigned /app header to calmer tool-style (compass icon, brand line, tool name, description)
- Added working calculation logic: stamp duty, loan amount, repayment, gross yield, net yield, cashflow
- All results update when Calculate button is clicked
- Added hero card with piggy bank image
- Moved away from Streamlit — using Next.js throughout

---

## How To Work With Me (Claude)

**About me:**
- I am a complete beginner — explain things simply and casually
- Never assume I know technical terms — explain them
- Be encouraging and funny

**Rules for code changes:**
- Do not redesign the app
- Do not change file structure
- Only modify relevant parts of code
- Keep Tailwind styling consistent
- Keep changes simple and minimal
- Explain changes briefly
- Ask before making major changes

**At the start of every session:**
- Paste the latest notes block so Claude can resume quickly
- Claude does not automatically read the local notes file

---

## Run Project

```bash
cd ~/Projects/property-compass
npm run dev
# Open: http://localhost:3000
```
## March 21, 2026 — Notes Cleanup

- Cleaned and reorganised project-notes.md into structured sections
- Removed duplicate and repeated content
- Preserved all important information
- Added clear separation between current state, next steps, and session logs

Result:
- Notes are now clean, readable, and reliable
- Project documentation reflects actual build state

Next step:
- Begin enhancing results with investment indicators
Claude workflow:
- Used Plan Mode to review and structure project-notes.md
- Approved cleaned version before applying changes
- Switched to edit mode to apply updates safely

Result:
- Controlled and safe update process
- Notes now structured and accurate

Next step:
- Begin implementing investment indicators in results panel
## March 21, 2026 — Live Results Update

- Updated Property Analyser so results auto-update when inputs change
- Removed reliance on manual Calculate step for core calculations
- Existing indicators now update live with the results
- Removed the Calculate button
Result:
- App feels faster and more interactive
- Results respond immediately to user input
## March 21, 2026 — Investment Indicators

- Added yield rating labels:
  - Low return (<4%)
  - Average return (4–6%)
  - Strong return (>6%)
- Applied to:
  - Gross yield
  - Net yield
- Added cashflow status labels:
  - Negatively geared (< -10)
  - Neutral (-10 to +10)
  - Positively geared (> +10)
- Labels display directly under results

Result:
- App now provides clear investment insights
- Users can interpret results instantly without thinking

Notes:
- Net yield label added after initial implementation
- All indicators now consistent across results
Workflow update:
- Switched to end-of-session documentation only
- No longer logging every change during build
- Using a single clean summary at session end

Process:
- Build continuously during session
- At end: summarise, update notes, and back up

Goal:
- Maintain momentum while keeping notes clean and structured
Landing Page Build – Summary

The Property Compass landing page has been significantly refined from an initial rough layout into a clean, structured, and more premium-feeling design.

Key improvements:
- Hero section simplified and improved for clarity and visual impact
- Navigation cleaned up (removed unnecessary buttons and clutter)
- Main value proposition clarified and tightened
- Example Property Analysis block positioned as a strong visual anchor
- Feature cards (Always free, No account required, ATO-aligned, Instant results) integrated into the main section instead of floating separately
- Layout flow improved to guide the user naturally from value → proof → tools

Design direction:
- Clean, minimal, and “premium SaaS” feel
- Focus on clarity over clutter
- Use of spacing and alignment instead of extra elements
- Avoid unnecessary images or filler content

Current state:
- Layout is ~95% complete
- Visual hierarchy is strong
- Sections are mostly cohesive and balanced

Outstanding issue:
- Toolkit section is still affected by a leftover column layout (“ghost left column”), causing empty space on the left
- This needs a structural layout fix (not a visual patch)

Next steps:
1. Convert toolkit section into a full-width layout (remove ghost column)
2. Final spacing and alignment polish across sections
3. Minor UI refinements (consistency, balance, spacing rhythm)
4. Final review before considering build complete

Principle going forward:
Fix layout issues at the structure level — do not patch with extra content.

---

### March 22, 2026 — Calculator overhaul

**Compare Properties**
- Expanded from 2 to 3 properties (A/B/C) with editable names and accent colours
- Added green/amber/red colour coding to all comparison table rows
  - Relative ranking (best/middle/worst) for loan amount and repayments
  - Absolute thresholds for gross yield, net yield, and cashflow
- Added Weekly/Fortnightly/Monthly frequency toggle on the repayment row
- Added Weekly/Fortnightly/Monthly frequency toggle on the cashflow row
- Added hover info (?) tooltips on gross yield, net yield, and cashflow rows
- Fixed tooltip positioning so they don't clip off screen edge
- Property A live-syncs from Property Analyser via localStorage (reads on mount + storage event)
- Info banners added to both pages explaining the sync

**Mortgage Calculator**
- Added Investment / Owner Occupier toggle
- Added repayment frequency selector (Weekly/Fortnightly/Monthly) — moved to below the toggle
- Added Pay Off Sooner section: extra repayment amount + frequency, calculates years and interest saved
- After-tax cost card shown for Investment loans
- Extra repayment input resized to 2-column grid to match other fields

**Yield Calculator**
- Expanded expenses into individual fields: landlord insurance, council rates, water rates, maintenance, strata
- Frequency selectors on rent input, expense inputs, and results panel
- Total expenses tile styled to match results cards

**CGT Calculator**
- Added salary field for accurate ATO bracket-based CGT calculation
- Uses `tax(salary + gain) − tax(salary)` method across 2024–25 brackets
- Shows effective rate and bracket push warning in results

**All calculators**
- Tab and Enter key navigation between all data entry fields
- Auto-calc display fields excluded from tab order

**Property Analyser**
- Hero image updated to piggybank.jpg
- Inputs auto-save to localStorage on every change (syncing to Compare Property A)

**Committed and pushed to:** `MissFe75/property-compass` on GitHub