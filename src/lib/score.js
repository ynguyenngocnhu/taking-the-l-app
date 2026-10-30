// Demo L-Score engine. Deterministic and illustrative only: it is NOT a real carbon calculation.
// Shape of the method: seconds watched × data per second (from resolution) × energy per GB × grid factor,
// expressed per 1,000 views. Calibrated so a 30 s 1080p TikTok in Vietnam = 475 and 60 s = 950 (the deck's figures).

export const RESOLUTIONS = {
  '720p': { mbps: 1.5, factor: 0.6 },
  '1080p': { mbps: 2.5, factor: 1 },
  '1440p': { mbps: 5, factor: 2 },
  '4K': { mbps: 7.5, factor: 3 },
};

export const PLATFORMS = {
  TikTok: { factor: 1, host: 'tiktok.com' },
  Instagram: { factor: 1.04, host: 'instagram.com' },
  YouTube: { factor: 0.96, host: 'youtube.com' },
};

export const ENERGY_KWH_PER_GB = 0.1;

// g CO2e per second per 1,000 views at 1080p on TikTok, Vietnam grid (demo calibration).
export const BASE_RATE = 475 / 30;

export const MARKETS = {
  VN: { name: 'Vietnam', grid: 500, factor: 1 },
  ID: { name: 'Indonesia', grid: 700, factor: 1.4 },
  IN: { name: 'India', grid: 710, factor: 1.42 },
  TH: { name: 'Thailand', grid: 440, factor: 0.88 },
  PH: { name: 'Philippines', grid: 600, factor: 1.2 },
  MY: { name: 'Malaysia', grid: 580, factor: 1.16 },
};

export const FORMATS = {
  short: { name: 'Short video', note: 'Up to 90 s' },
  long: { name: 'Long video', note: 'Over 90 s' },
};

export function formatOf(secs) {
  return secs > 90 ? 'long' : 'short';
}

export function lScore({ secs, res, platform, market }) {
  const r = RESOLUTIONS[res] || RESOLUTIONS['1080p'];
  const p = PLATFORMS[platform] || PLATFORMS.TikTok;
  const m = MARKETS[market] || MARKETS.VN;
  return Math.round(secs * BASE_RATE * r.factor * p.factor * m.factor);
}

// Default L lines (benchmarks). Admin can edit these in the demo.
export function defaultBenchmarks() {
  const out = {};
  for (const [code, m] of Object.entries(MARKETS)) {
    const short = Math.round(610 * m.factor);
    out[code] = { short, long: short * 3 };
  }
  return out;
}

export function lineFor(benchmarks, market, secs) {
  const b = benchmarks[market] || benchmarks.VN;
  return b[formatOf(secs)];
}

// Contribution breakdown for the "key factors" panel.
export function factors({ secs, res, platform, market }) {
  const r = RESOLUTIONS[res];
  const mbPerView = (secs * r.mbps) / 8;
  return [
    { key: 'Duration', value: `${secs} s`, note: 'Every second is streamed to every viewer. The biggest lever.' },
    { key: 'Resolution', value: `${res} · ${r.mbps} Mbps`, note: `About ${mbPerView.toFixed(1)} MB per view at this setting.` },
    { key: 'Platform', value: platform, note: 'Platform bitrate assumption for its default encode.' },
    { key: 'Market grid', value: `${MARKETS[market].name} · ${MARKETS[market].grid} g/kWh`, note: 'Electricity grid emission factor where it is watched.' },
  ];
}

export const fmt = (n) => Number(n).toLocaleString('en-US');
export const compact = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1)}K` : String(n);
