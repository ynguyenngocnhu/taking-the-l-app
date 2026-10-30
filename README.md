# L Platform: clickable prototype

Prototype for the L'Oréal SAPMENA × WPP Limitless Pitch 2026 ("Taking the L").
Three connected areas:

- **Public L website** (no login): Home, The L Standard (methodology), L-Score Estimator (estimate only, never the L Mark), Verified Posts gallery with filters, a public verification page per post (`#verify-LV-26Q4-XXXXX`), For Brands, Join L (LOREALISTAR markets vs interest registration).
- **Creator Studio** (`#studio`, demo sign-in): profile and onboarding, dashboard with progress to 10 qualifying posts a quarter, My Posts, post detail with the L Mark only for verified qualifying posts and the two impact receipts (long cut, short cut), submit flow (platform, link, campaign or Organic L Post, details, submit), campaigns and briefs.
- **Admin Console** (`#admin`, linked from the footer only): overview, submissions, verification (approve, reject, request information), campaigns, benchmarks (quarterly L lines), creators.

L-Score is always per post, never per creator. All data is sample data and the L-Score is an illustrative formula, not a validated carbon calculation.
State lives in the browser (localStorage); "Reset demo data" restores the original data.

## Demo path

1. Home → L-Score Estimator → try a duration
2. Creator Studio → Continue as Alex Tran → Submit a Post → TikTok → "Use a sample link" → Read → pick a campaign → Submit
3. The post shows Pending verification → footer "Admin Console (internal)" → Verification → Approve
4. Back in Creator Studio → My Posts → the post now carries the L Mark → Share verified post card / Verification page

## Run

```
npm install
npm run dev          # local dev server
npm run build        # production build to dist/ (what Vercel deploys)
npm run build:single # one self-contained HTML file in dist-single/
```

Stack: Vite, React 18, Tailwind CSS 3, lucide-react. Colours follow the L'Oréal palette (black, white, Passionate Red, Eternal Gold); values live in tailwind.config.js. Hash routes (`#studio-submit`, `#admin-creator-c4`) so it works on any static host.

Code map: `src/data/mock.js` (demo data), `src/lib/score.js` (demo L-Score and benchmarks), `src/lib/store.jsx` (state and actions, the place to plug in a real API), `src/pages/{site,studio,admin}`.

The earlier single-screen L-Score mobile mockup is kept at `/l-score/`.
