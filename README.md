# Taking the L: L-Score prototype

A testable prototype for the WPP × L'Oréal SAPMENA Limitless Pitch 2026.

- **Weigh a post:** pick a video from your phone. The app reads its length and resolution in the browser (nothing is uploaded) and gives its L-Score: grams of CO₂e per 1,000 views.
- **Impact Receipt:** a shareable card, downloadable as a 1080 × 1350 image.
- **Earnings:** the Lighter Rate and the L-Media Fund.
- **Method:** the formula and factors.

`L-Score = 1,000 × seconds × bitrate (GB/s) × energy per GB (kWh) × grid (g CO₂e/kWh)`

The basis is from the deck: 1080p at 2.5 Mbps, 0.1 kWh/GB, and the Vietnam grid at 500 g/kWh with an L line of 610. Other bitrates, grids and lines are placeholders until the Impact+ model and Ember factors are confirmed. Posts are stored only in the viewer's browser.

## Run locally

Any static server works: `python3 -m http.server`, then open http://localhost:8000.

## Deploy

Import the repository at vercel.com/new and click Deploy. There's no build step and no settings to change.
