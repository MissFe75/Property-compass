# Property Compass — Project Notes

App: Property Compass — property zoning and mapping tool  
Last updated: Wednesday 3 June 2026  
Local path: /Users/graham/Projects/property-compass  
Notes file: /Users/graham/Projects/property-compass/notes

---

## Quick Reference

| Item | Detail |
|------|--------|
| GitHub | MissFe75/Property-compass |
| App stores | Google Play + App Store (free app) |
| Capacitor | Not yet set up |

---

## Current Status

As of 3 June 2026

- 14 uncommitted changes in VS Code source control — need to be committed before further work
- No Capacitor setup yet
- App store submission is planned; no accounts or assets prepared

---

## Next Steps

### 1. Commit pending changes

Commit the 14 uncommitted changes currently sitting in VS Code source control before doing anything else.

```bash
cd /Users/graham/Projects/property-compass
git add .
git commit -m "WIP: pending changes as of 3 June 2026"
git push
```

### 2. Set up Capacitor

Follow the same process used for Bearing:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Property Compass" "au.com.sextantdigital.propertycompass"
npx cap add android
npx cap add ios
```

Key configuration:

- Set `appId` in `capacitor.config.ts` (e.g. `au.com.sextantdigital.propertycompass`)
- Add `server.url` pointing to the live URL once deployed
- Generate icon and splash assets (`resources/icon.png`, `resources/splash.png`)
- Install CocoaPods if not already present (`brew install cocoapods`)
- Run `pod install` in the `ios/App` directory

Refer to Bearing's Capacitor setup as a working reference — the process is identical.

### 3. App store submission

- Property Compass is a free app — no payment integration required
- Use the existing Sextant Digital Google Play developer account
- Use the existing Apple Developer account (once approved) for App Store
- Write a privacy policy
- Prepare store screenshots for both platforms

---

## Notes

- Live URL: https://sextantdigital.com.au
- Hosting: Vercel (auto-deploys on every GitHub push to main)
- DNS: Cloudflare managing sextantdigital.com.au → Vercel
- sextantdigital.au redirects → sextantdigital.com.au via Cloudflare Page Rule
- Google Play and Apple Developer accounts are managed under the Bearing project — no separate accounts needed for this app
