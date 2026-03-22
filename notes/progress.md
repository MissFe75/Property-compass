Terminal cheat sheet:
- cd ~/Projects/property-compass → go to project folder
- npm run dev → start app (localhost:3000)
- ls → list files
- pwd → show current folder
- cd .. → go back one level
- Ctrl + C → stop server

Workflow:
- Start every session with cd + npm run dev
- Use terminal only for navigation and running app

Goal:
- Keep terminal usage simple and repeatable
Current state:
- App running on Next.js (npm run dev)
- Property Analyser working with calculations

Last done:
- VS Code setup fixed
- Notes system created (project-notes + progress)

Next:
- Add investment indicators (yield + cashflow labels)

Rules:
- Stay in Next.js (no switching)
- Claude = code
- ChatGPT = direction
Claude usage setup:
- Claude Code runs inside VS Code, not in the browser app
- The browser (localhost:3000) is only for viewing/testing the app
- Claude rules must be pasted at the start of each session (not saved permanently)

Workflow:
1. Open VS Code and project folder
2. Run npm run dev
3. Open app in browser
4. Use Claude in VS Code to make code changes
5. Refresh browser to see updates

Goal:
- Keep roles clear between tools
- Avoid confusion between building and viewing the app

Current state:
- Investment indicators working (yield + cashflow)

Last done:
- Added labels to gross yield, net yield, and cashflow
Session summary:
- Landing page layout significantly improved
- Feature cards + example block now aligned in same section
- Toolkit section moved up and spacing improved
- Identified remaining issue: ghost left column causing empty space before toolkit section

Next session plan:
1. Fix layout structure so toolkit section becomes full-width (remove ghost column)
2. Final spacing + alignment polish
3. Minor premium UI tweaks
4. Final review

Important:
- Do NOT add filler content (no extra images)
- Fix layout, not symptoms
