# L Platform: clickable prototype

Prototype for the L'Oréal SAPMENA × WPP Limitless Pitch 2026 ("Taking the L").
Three experiences in one app, switched from the top bar:

- **L Standard** (`#standard`): public site. Hero, Measure / Reduce / Reward, sample L-Score, the six inputs and methodology, the L Creator Programme, public leaderboard.
- **Creator Studio** (`#studio`): Alex's dashboard, campaigns, submit a video (published post or draft), L-Score result, My posts, Impact Receipt, rewards.
- **Admin Console** (`#admin`): overview charts, campaign management, creators, submission review (approve / reject), L Standard benchmarks, leaderboard.

All data is fictional demo data. The L-Score is a fixed, illustrative formula, not a real carbon calculation.
State lives in the browser (localStorage); "Reset demo data" in either sidebar restores the original data.

## Demo path

1. L Standard → Join the L Movement
2. Creator Studio → Submit a video → Published post → "Fill with a sample post" → Calculate
3. Result shows "Pending verification" → switch to Admin Console → Submission review → Approve
4. Back in Creator Studio → My posts → the post now shows L-Earned → View Impact Receipt / Share your L Mark

## Run

```
npm install
npm run dev          # local dev server
npm run build        # production build to dist/ (what Vercel deploys)
npm run build:single # one self-contained HTML file in dist-single/
```

Stack: Vite, React 18, Tailwind CSS 3, Recharts, lucide-react. Colours follow the pitch deck: black, L red #E52521, cream. Hash routes (`#studio-submit`, `#admin-creator-c4`) so it works on any static host.

Code map: `src/data/mock.js` (demo data), `src/lib/score.js` (demo L-Score and benchmarks), `src/lib/store.jsx` (state and actions, the place to plug in a real API), `src/pages/{site,studio,admin}`.

The earlier single-screen L-Score mobile mockup is kept at `/l-score/`.
