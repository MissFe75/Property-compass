# Property Compass — Source of Truth for First Home Buyer Starter Kit

Purpose: documented extraction of the exact inputs, calculations, and outputs found in the Property Compass web app. Only logic actually present in the codebase is reported. Anything not visible is marked "Not found in app."

Files analysed:
- `app/app/page.tsx` — Property Explorer (also contains the Stamp Duty engine)
- `app/app/mortgage/page.tsx` — Mortgage Calculator
- `app/app/yield/page.tsx` — Yield Calculator
- `app/app/compare/page.tsx` — Compare Properties
- `app/tools/page.tsx` — Tools index (placeholder page; no live logic)

Tool inventory (from in-app switcher on every calculator):
1. Property Explorer — `/app`
2. Mortgage Calculator — `/app/mortgage`
3. Yield Calculator — `/app/yield`
4. Capital Gains Tax Estimator — `/app/cgt` (outside the Starter Kit focus)
5. Compare Properties — `/app/compare`

There is no standalone Stamp Duty Calculator page. Stamp duty is calculated inside the Property Explorer using the `calculateEstimatedStampDuty` function. It is documented in its own section below.

Note on listing/URL ingestion: the app does NOT ingest a realestate.com.au / Domain URL. All fields are entered manually by the user. "User pastes listing link" is Not found in app.

---

## 1. Property Explorer (`/app`)

### Inputs
Purchase Details
- Purchase price ($)
- Deposit ($)
- State (dropdown: QLD, NSW, VIC, SA, WA, ACT, NT, TAS)
- Stamp duty (est.) — auto-calculated, not a user input
- Conveyancer / Solicitor ($)
- Building & pest inspection ($)
- Loan establishment fee ($)
- Title insurance ($)
- Buyer's agent fee (%)

Loan Details
- Interest rate (%)
- Repayment type (Principal & Interest | Interest Only)
- Loan term (years)
- Loan amount — auto-calculated

Income & Costs
- Rent frequency (Weekly | Fortnightly | Monthly | Yearly)
- Rent ($ per chosen frequency)
- Property management (%)
- Vacancy rate (%)
- Body corporate ($/yr)
- Landlord insurance ($/yr)
- Council rates ($/yr)
- Maintenance ($/yr)
- Insurance ($/yr)

Results display controls
- Net yield toggle: excl. mortgage | incl. mortgage

### Calculations (verbatim from source)
Stamp duty: `calculateEstimatedStampDuty(purchasePrice, state)` — full per-state logic in Section 2 below.

Buying costs total:
`currentBuyingCosts = conveyancer + buildingPest + (buyerAgent% × purchasePrice) + loanFee + titleInsurance`

Loan amount:
`currentLoanAmount = purchasePrice + stampDuty + buyingCosts − deposit`

Rent multiplier to annual:
- Weekly → × 52
- Fortnightly → × 26
- Monthly → × 12
- Yearly → × 1

Annual rent: `annualRent = rent × rentMultiplier`
Vacancy cost: `annualRent × (vacancyRate / 100)`
Management cost: `annualRent × (propertyManagement / 100)`
Fixed annual expenses: `landlordIns + bodyCorp + maintenance + councilRates + insurance`
Annual net income: `annualRent − vacancyCost − managementCost − fixedExpenses`

Monthly repayment: see Section 3 (`calculateMonthlyRepayment`) — same formula used across Property Explorer and Mortgage Calculator.

Gross yield: `(annualRent / purchasePrice) × 100`
Net yield (excl. mortgage): `(annualNetIncome / purchasePrice) × 100`
Net yield (incl. mortgage): `(annualCashflow / purchasePrice) × 100`
Annual cashflow: `annualNetIncome − monthlyRepayment × 12`
Cashflow shown at selected frequency: `annualCashflow / rentMultiplier`
Repayment shown at selected frequency: `monthlyRepayment × 12 / rentMultiplier`

### Outputs
- Stamp duty (est.) $
- Total buying costs $
- Loan amount $ (shown twice: beside Loan Details, and as a Results tile)
- Expenses at selected frequency $
- Repayment at selected frequency $
- Gross yield % with label:
  - < 4% → "Low return"
  - 4–6% → "Average return"
  - > 6% → "Strong return"
- Net yield % with label:
  - < 0% → "Negative return"
  - < 4% → "Low return"
  - 4–6% → "Average return"
  - > 6% → "Strong return"
- Cashflow at selected frequency with label:
  - < −$10 → "Negatively geared"
  - −$10 to $10 → "Neutral"
  - > $10 → "Positively geared"
- "Save as PDF" button (opens `PdfModal` with Purchase Details, Loan Details, Income & Results sections)

### Assumptions / limitations explicitly present
- Stamp duty is calculated from `purchasePrice` and `state` only. It does NOT apply any first-home-buyer concession, owner-occupier/investor distinction, off-the-plan, foreign buyer surcharge, or pensioner concession.
- SEO copy on this page states: "This calculator estimates stamp duty using Queensland rates." (Note: this text conflicts with the actual logic, which uses full per-state schedules for all 8 states.)
- Interest rate and loan term fields are plain text inputs (no validation shown).
- Inputs are persisted to browser `localStorage` under key `pc_analyser`. This feeds Property A in Compare Properties (see Section 5).

---

## 2. Stamp Duty engine (embedded in Property Explorer)

Function: `calculateEstimatedStampDuty(p, state)` where `p` = purchase price. Returns 0 if `p <= 0` or state not matched.

### Inputs
- Purchase price ($)
- State (QLD | NSW | VIC | SA | WA | ACT | NT | TAS)

### Bracket logic (verbatim)

QLD
- p ≤ 5,000 → `p × 0.015`
- p ≤ 75,000 → `75 + (p − 5,000) × 0.035`
- p ≤ 540,000 → `2,450 + (p − 75,000) × 0.035`
- p ≤ 1,000,000 → `18,725 + (p − 540,000) × 0.045`
- p > 1,000,000 → `39,425 + (p − 1,000,000) × 0.0575`

NSW
- p ≤ 14,000 → `p × 0.0125`
- p ≤ 30,000 → `175 + (p − 14,000) × 0.015`
- p ≤ 80,000 → `415 + (p − 30,000) × 0.0175`
- p ≤ 300,000 → `1,290 + (p − 80,000) × 0.035`
- p ≤ 1,000,000 → `8,990 + (p − 300,000) × 0.045`
- p ≤ 3,000,000 → `40,490 + (p − 1,000,000) × 0.055`
- p > 3,000,000 → `150,490 + (p − 3,000,000) × 0.07`

VIC
- p ≤ 25,000 → `p × 0.014`
- p ≤ 130,000 → `350 + (p − 25,000) × 0.024`
- p ≤ 960,000 → `2,870 + (p − 130,000) × 0.06`
- p ≤ 2,000,000 → `52,670 + (p − 960,000) × 0.055`
- p > 2,000,000 → `109,870 + (p − 2,000,000) × 0.065`

SA
- p ≤ 12,000 → `p × 0.01`
- p ≤ 30,000 → `120 + (p − 12,000) × 0.02`
- p ≤ 50,000 → `480 + (p − 30,000) × 0.03`
- p ≤ 100,000 → `1,080 + (p − 50,000) × 0.035`
- p ≤ 200,000 → `2,830 + (p − 100,000) × 0.04`
- p ≤ 250,000 → `6,830 + (p − 200,000) × 0.0425`
- p ≤ 300,000 → `8,955 + (p − 250,000) × 0.0475`
- p ≤ 500,000 → `11,330 + (p − 300,000) × 0.05`
- p > 500,000 → `21,330 + (p − 500,000) × 0.055`

WA
- p ≤ 80,000 → `p × 0.019`
- p ≤ 100,000 → `1,520 + (p − 80,000) × 0.0285`
- p ≤ 250,000 → `2,090 + (p − 100,000) × 0.038`
- p ≤ 500,000 → `7,790 + (p − 250,000) × 0.0475`
- p > 500,000 → `19,665 + (p − 500,000) × 0.0515`

ACT
- p ≤ 200,000 → `p × 0.012`
- p ≤ 300,000 → `2,400 + (p − 200,000) × 0.022`
- p ≤ 500,000 → `4,600 + (p − 300,000) × 0.034`
- p ≤ 750,000 → `11,400 + (p − 500,000) × 0.0432`
- p ≤ 1,000,000 → `22,200 + (p − 750,000) × 0.059`
- p ≤ 1,455,000 → `36,950 + (p − 1,000,000) × 0.064`
- p > 1,455,000 → `66,070 + (p − 1,455,000) × 0.0454`

NT
- `V = p / 1000`
- `duty = 0.06571441 × V² + 15 × V`

TAS
- p ≤ 3,000 → `50`
- p ≤ 25,000 → `50 + (p − 3,000) × 0.0175`
- p ≤ 75,000 → `435 + (p − 25,000) × 0.0225`
- p ≤ 200,000 → `1,560 + (p − 75,000) × 0.035`
- p ≤ 375,000 → `5,935 + (p − 200,000) × 0.04`
- p ≤ 725,000 → `12,935 + (p − 375,000) × 0.0425`
- p > 725,000 → `27,810 + (p − 725,000) × 0.045`

### Outputs
- Estimated stamp duty $ (feeds into Property Explorer's Buying Costs → Loan amount)

### Assumptions / limitations explicitly present
- No first-home-buyer concession logic.
- No owner-occupier vs investor differentiation.
- No off-the-plan, vacant-land, foreign-buyer, or pensioner concessions.
- Labelled "Stamp duty (est.)" in the UI.

---

## 3. Mortgage Calculator (`/app/mortgage`)

### Inputs
- Loan purpose (Owner Occupier | Investment)
- Repayment frequency (Weekly | Fortnightly | Monthly) — display only
- Purchase price ($)
- Deposit ($)
- Interest rate (%)
- Loan term (years)
- Repayment type (Principal & Interest | Interest Only)
- Marginal tax rate (only shown when Loan purpose = Investment):
  - 19% (up to $45k)
  - 32.5% ($45k–$120k)
  - 37% ($120k–$180k)
  - 45% (over $180k)

Pay Off Sooner panel
- Extra repayment amount ($)
- Extra repayment frequency (Weekly | Fortnightly | Monthly)

### Calculations (verbatim)
Loan amount: `loanAmount = purchasePrice − deposit`

Monthly repayment (`calculateMonthlyRepayment`):
- If `loanAmount ≤ 0` or `months ≤ 0` → 0
- If repaymentType = "Interest Only" → `loanAmount × monthlyRate`
- If `monthlyRate = 0` → `loanAmount / months`
- Else standard amortisation:
  `M = (L × r × (1 + r)^n) / ((1 + r)^n − 1)` where `r = rate%/100/12`, `n = years × 12`

Totals:
- `originalMonths = loanTermYears × 12`
- `totalRepaid = monthly × originalMonths`
- `totalInterest = totalRepaid − (IO? 0 : loanAmount)`

Frequency display conversions (display only; amortisation is monthly-based):
- Weekly divisor = `monthly × 12 / 52`
- Fortnightly divisor = `monthly × 12 / 26`
- Monthly divisor = `monthly`

Investment (after-tax) mode:
- `monthlyInterest = loanAmount × monthlyRate`
- `taxSavingMonthly = monthlyInterest × marginalTaxRate` (Investment only)
- `afterTaxMonthly = monthly − taxSavingMonthly`

Pay Off Sooner (only when repaymentType = "Principal & Interest", `loanAmount > 0`, `monthlyRate > 0`, `extra > 0`):
- `extraFreqPerYear` = 52 / 26 / 12 based on frequency
- `extraMonthlyEquiv = extra × extraFreqPerYear / 12`
- `newPayment = monthly + extraMonthlyEquiv`
- `newMonths = −ln(1 − (L × r) / newPayment) / ln(1 + r)`
- `yearsSaved = (originalMonths − newMonths) / 12`
- `interestSaved = totalInterest − (newPayment × newMonths − loanAmount)`

### Outputs
- Loan amount $
- {Frequency} repayment $ (Weekly/Fortnightly/Monthly)
- Annual repayment $
- Total amount repaid $
- Total interest paid $
- If Investment: After-tax cost ({frequency}) $ with subtext "Tax deduction saves $X{/mo|/fn|/wk} at your marginal rate"
- If extra repayments active and P&I: Years sooner (yrs), Interest saved $
- "Save as PDF" button → PDF with Loan Details and Results sections

### Assumptions / limitations explicitly present
- Amortisation is computed monthly; weekly/fortnightly views are annualised conversions, not true weekly/fortnightly amortisation.
- Interest Only mode disables the Pay Off Sooner calculation (UI shows: "Switch to Principal & Interest to use this calculator.").
- Tax saving applies interest-only deduction (interest × marginal rate); no Medicare levy, no depreciation, no other deductions.
- Tax brackets are hard-coded labels; Not found in app: LITO, LMITO, or stage-3 bracket updates beyond these four tiers.

---

## 4. Yield Calculator (`/app/yield`)

### Inputs
Property Details
- Rent frequency (Weekly | Fortnightly | Annual)
- Purchase price ($)
- Rent ($ per chosen frequency)
- Vacancy rate (%)
- Property management (%)

Expenses
- Expense frequency (Weekly | Fortnightly | Annual) — applies to all six expense fields below
- Landlord insurance ($)
- Council rates ($)
- Water rates ($)
- Maintenance & repairs ($)
- Strata / body corporate ($)
- Land tax ($)

Loan Costs (optional toggle: Include mortgage)
- Repayment type (Principal & Interest | Interest Only)
- Loan amount ($)
- Interest rate (%)
- Loan term (years) — hidden when Interest Only

Display
- Income frequency toggle (Weekly | Fortnightly | Annual) for the results panel
- Net yield toggle: excl. mortgage | incl. mortgage (only shown when Include mortgage is on)

### Calculations (verbatim)
- `rentMultiplier` = 52 (W) / 26 (F) / 1 (Annual)
- `expenseMultiplier` = 52 (W) / 26 (F) / 1 (Annual)
- `annualRent = rent × rentMultiplier`
- `vacancyCost = annualRent × (vacancyRate / 100)`
- `managementCost = annualRent × (propertyManagement / 100)`
- `fixedExpenses = (landlordIns + councilRates + waterRates + maintenance + strata + landTax) × expenseMultiplier`
- `totalExpenses = fixedExpenses + vacancyCost + managementCost`
- `netAnnualIncome = annualRent − totalExpenses`
- `grossYield = (annualRent / price) × 100`
- `netYield = (netAnnualIncome / price) × 100`

Loan (when included):
- `monthlyRate = rate / 100 / 12`
- `months = loanTerm × 12`
- `monthlyRepayment` = IO → `loan × monthlyRate`; PI → standard amortisation formula
- `annualLoanCost = monthlyRepayment × 12`
- `cashflowAfterMortgage = netAnnualIncome − annualLoanCost`
- `weeklyCashflow = cashflowAfterMortgage / 52`
- `netYieldWithMortgage = (cashflowAfterMortgage / price) × 100`
- `displayedNetYield` = `netYieldWithMortgage` if toggle "incl. mortgage"; else `netYield`

Income-frequency divisor for results (`freqDivisor`): 52 / 26 / 1.

### Outputs
- Gross yield % with label:
  - < 4% → "Low return"
  - 4–6% → "Average return"
  - > 6% → "Strong return"
- Net yield % (label thresholds identical to gross, with "Negative return" for < 0%)
- Net income at selected frequency $ (colour turns red when negative)
- Cashflow after mortgage at selected frequency $ (only when Include mortgage is on) with label:
  - weeklyCashflow < −10 → "Negatively geared"
  - −10 to 10 → "Roughly neutral"
  - > 10 → "Positively geared"
- Total expenses $ (shown within the Expenses card, at the chosen expense frequency)
- Depreciation tip (static text): a surveyor's depreciation schedule is not included in this calculation.
- "Save as PDF" button → PDF with Property Details and Results (incl. Land tax annualised)

### Assumptions / limitations explicitly present
- Depreciation is NOT included.
- Loan section is optional; net yield "incl. mortgage" only appears when the toggle is on.
- Tax rates / negative gearing tax effects are NOT applied here (that logic is only in the Mortgage Calculator's Investment mode).
- Land tax is treated as a flat user input; no state-based land-tax threshold logic.

---

## 5. Compare Properties (`/app/compare`)

### Inputs (per property, ×3 — Property A, B, C)
- Editable property name (free text)
- Purchase price ($)
- Deposit ($)
- Weekly rent ($)
- Annual expenses ($)
- Interest rate (%)

Display
- Frequency toggle (Weekly | Fortnightly | Monthly) — changes how repayment and cashflow are displayed

### Live sync (behaviour)
- On load and on `storage` events, the page reads `localStorage.pc_analyser` saved by the Property Explorer and copies into Property A:
  - `price → A.price`
  - `deposit → A.deposit`
  - `rent` is converted to weekly using the saved `rentFreq` (Fortnightly ×26, Monthly ×12, Yearly ×1, else ×52) divided by 52 and written to `A.rent`
  - `expenses → A.expenses`
  - `rate → A.rate`
- B and C are entered manually.

### Calculations (per property)
- `loanAmount = price − deposit` (Note: Compare does NOT add stamp duty or buying costs — unlike Property Explorer)
- `annualRent = rent × 52`
- `netIncome = annualRent − annualExpenses`
- `monthly = calculateMonthlyRepayment(loan, rate, 30)` — loan term is hard-coded to 30 years
- `grossYield = (annualRent / price) × 100`
- `netYield = (netIncome / price) × 100`
- `weeklyCashflow = (netIncome − monthly × 12) / 52`

Frequency conversions for display:
- Weekly: `monthly × 12 / 52`, cashflow = `weeklyCashflow`
- Fortnightly: `monthly × 12 / 26`, cashflow = `weeklyCashflow × 2`
- Monthly: `monthly`, cashflow = `weeklyCashflow × 52 / 12`

### Outputs (side-by-side rows)
- Loan amount $ — coloured relative to the three values (green = lowest, red = highest)
- {Frequency} repayment $ — coloured relative to the three values (green = lowest, red = highest)
- {Frequency} cashflow $ — absolute thresholds: > $50 green, −$10 to $50 amber, < −$10 red
- Gross yield % — absolute thresholds: ≥ 6% green, 4–6% amber, < 4% red
- Net yield % — absolute thresholds: ≥ 5% green, 3–5% amber, < 3% red
- Hover tooltips on cashflow, gross yield, net yield explaining each metric
- "Save as PDF" button → PDF with all three properties listed

### Assumptions / limitations explicitly present
- Loan term is locked to 30 years; no user control.
- Repayment type is locked to Principal & Interest (no Interest Only option).
- Stamp duty and buying costs are NOT included in the loan amount here (different from Property Explorer).
- Exactly three property slots, no more, no fewer.
- Weekly rent is the only rent frequency accepted.

---

## 6. Shared UI / output behaviours

- Currency inputs use `en-AU` locale formatting with commas (e.g., "650,000").
- All results "update live as you type".
- Every calculator has a "Save as PDF" button that opens `components/PdfModal.tsx` with the structured sections listed above.
- The `/tools` page is a placeholder list (Mortgage, Yield, CGT, Break-even, Property Comparison) — no live logic; each card displays "A clean, focused tool page will go here."
- Break-even Calculator: listed on `/tools` but Not found in app (no page, no logic).

---

## 7. Starter-Kit-relevant mapping (what ties directly to which kit section)

- Section 2 "The Real Numbers → Deposit": Property Explorer "Deposit" field; Compare "Deposit" field.
- Section 2 "The Real Numbers → Stamp Duty": the Stamp Duty engine (Section 2 above). All 8 states covered. No first-home-buyer concessions are applied in the app.
- Section 2 "The Real Numbers → Loan repayments": Mortgage Calculator (`calculateMonthlyRepayment`); also appears in Property Explorer and Compare.
- Section 2 "The Real Numbers → Ongoing costs": Property Explorer "Income & Costs" fields (council rates, insurance, body corp, maintenance, landlord insurance); Yield Calculator's Expenses block (adds water rates, strata, land tax).
- Section 1 "Pre-approval / borrowing power": Not found in app. There is no borrowing-power / serviceability calculator.
- Section 1 "Build and pest / insurance": Property Explorer exposes "Building & pest inspection" and "Title insurance" as dollar inputs only — no flood/fire zone flagging or quote integration. Not found in app.
- Section 3 "Red Flags": Not found in app. No qualitative red-flag engine.
- Section 5 "First home vs investment": Mortgage Calculator has an "Owner Occupier | Investment" toggle that only affects the after-tax repayment display. No broader first-home-vs-investment framework.

---

## 8. Gaps between app logic and Starter Kit scope

These are genuinely missing from the app and would need to be authored from scratch for the kit (not "documented from the app"):
- Borrowing-power / serviceability calculator
- Pre-approval checklist logic
- First-home-buyer concession rules (per state)
- Flood / fire / hazard zone flagging
- Offer-to-settlement timeline content
- Red-flag diagnostic
- Contract review checklist
- Listing-URL ingestion (realestate.com.au / Domain)
