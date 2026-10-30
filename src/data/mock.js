// Fictional demo data. No real creators, posts, results or payments.
import { lScore, defaultBenchmarks, lineFor } from '../lib/score.js';

export const TODAY = '2026-10-30';
export const QUARTER = { label: 'Q4 2026', start: '2026-10-01', end: '2026-12-31' };
export const L_CREATOR_TARGET = 10;
export const DEMO_CREATOR = 'c1';

// Which markets have a local LOREALISTAR programme. Illustrative only: confirm per market before launch.
export const LOREALISTAR = {
  VN: true, ID: true, IN: true, TH: false, PH: false, MY: false,
};
export const LOREALISTAR_URL = 'https://www.lorealistar.com/en-en/';
export const ORGANIC = 'Organic L Post';

export const CREATORS = [
  { id: 'c1', name: 'Alex Tran', handle: '@alex.tran.makes', platform: 'TikTok', market: 'VN', accounts: [{ platform: 'TikTok', handle: '@alex.tran.makes' }, { platform: 'Instagram', handle: '@alex.tran.makes' }], bio: 'Skincare and quick routines from Ho Chi Minh City.', category: 'Beauty', joined: '2026-08-02', campaigns: ['k1', 'k2', 'k3'] },
  { id: 'c2', name: 'Minh Anh Le', handle: '@minhanh.glow', platform: 'TikTok', market: 'VN', accounts: [{ platform: 'TikTok', handle: '@minhanh.glow' }], bio: '', category: 'Beauty', joined: '2026-08-05', campaigns: ['k1', 'k2'] },
  { id: 'c3', name: 'Putri Rahma', handle: '@putri.glowup', platform: 'TikTok', market: 'ID', accounts: [{ platform: 'TikTok', handle: '@putri.glowup' }], bio: '', category: 'Beauty', joined: '2026-08-01', campaigns: ['k1', 'k3'] },
  { id: 'c4', name: 'Arjun Mehta', handle: '@arjun.grooms', platform: 'YouTube', market: 'IN', accounts: [{ platform: 'YouTube', handle: '@arjun.grooms' }], bio: '', category: 'Beauty', joined: '2026-08-11', campaigns: ['k2'] },
  { id: 'c5', name: 'Nadia Rahim', handle: '@nadia.rahim', platform: 'Instagram', market: 'MY', accounts: [{ platform: 'Instagram', handle: '@nadia.rahim' }], bio: '', category: 'Beauty', joined: '2026-08-19', campaigns: ['k3'] },
  { id: 'c6', name: 'Ploy Sirikul', handle: '@ploy.skin', platform: 'TikTok', market: 'TH', accounts: [{ platform: 'TikTok', handle: '@ploy.skin' }], bio: '', category: 'Beauty', joined: '2026-08-07', campaigns: ['k1', 'k2', 'k3'] },
  { id: 'c7', name: 'Bea Santos', handle: '@bea.santos.ph', platform: 'Instagram', market: 'PH', accounts: [{ platform: 'Instagram', handle: '@bea.santos.ph' }], bio: '', category: 'Beauty', joined: '2026-09-01', campaigns: ['k1'] },
  { id: 'c8', name: 'Kavya Iyer', handle: '@kavya.iyer', platform: 'TikTok', market: 'IN', accounts: [{ platform: 'TikTok', handle: '@kavya.iyer' }], bio: '', category: 'Beauty', joined: '2026-08-22', campaigns: [] },
  { id: 'c9', name: 'Rizky Pratama', handle: '@rizky.cuts', platform: 'TikTok', market: 'ID', accounts: [{ platform: 'TikTok', handle: '@rizky.cuts' }], bio: '', category: 'Beauty', joined: '2026-09-10', campaigns: ['k2'] },
  { id: 'c10', name: 'Linh Pham', handle: '@linh.daily', platform: 'TikTok', market: 'VN', accounts: [{ platform: 'TikTok', handle: '@linh.daily' }], bio: '', category: 'Beauty', joined: '2026-09-14', campaigns: ['k1', 'k3'] },
  { id: 'c11', name: 'Hana Yusof', handle: '@hana.yusof', platform: 'TikTok', market: 'MY', accounts: [{ platform: 'TikTok', handle: '@hana.yusof' }], bio: '', category: 'Beauty', joined: '2026-10-02', campaigns: [] },
  { id: 'c12', name: 'Marco Dela Cruz', handle: '@marco.dc', platform: 'YouTube', market: 'PH', accounts: [{ platform: 'YouTube', handle: '@marco.dc' }], bio: '', category: 'Beauty', joined: '2026-10-06', campaigns: ['k2'] },
];

export const CAMPAIGNS = [
  {
    id: 'k1', name: 'Thirty Seconds of Glow', brand: 'Garnier', status: 'Live', tone: 0,
    markets: ['VN', 'ID', 'TH', 'PH'],
    description: 'Show your full morning routine in 30 seconds or less. Keep every step; lose the dead air.',
    objective: 'Drive trial of Garnier Micellar Water with short, complete routines.',
    requirements: ['Vertical 9:16, 30 seconds or less', 'Show the Micellar step on screen', 'Natural light, no heavy filters'],
    deliverables: ['1 TikTok or Instagram Reel', 'Submit the published post link in Creator Studio'],
    hashtags: ['#GarnierMicellar', '#TakingTheL'], mentions: ['@garnier'],
    eligibility: ['Creator Studio profile in an eligible market', 'Beauty or lifestyle content in the last 90 days'],
    reward: '$300 campaign fee', start: '2026-10-01', end: '2026-11-30', deadline: '2026-12-07',
  },
  {
    id: 'k2', name: 'The Invisible Edit', brand: "L'Oréal Paris", status: 'Live', tone: 1,
    markets: ['VN', 'ID', 'IN'],
    description: 'Re-cut one of your 60-second tutorials into a 30-second version. Same steps, same story, half the seconds.',
    objective: 'Show that a shorter cut keeps the story and the results.',
    requirements: ['Start from a tutorial you already published', 'Keep the hook and the result shot', 'The new cut is half the length or less'],
    deliverables: ['1 short cut posted on the same account', 'Submit the short cut and the long cut length'],
    hashtags: ['#TheInvisibleEdit', '#TakingTheL'], mentions: ['@lorealparis'],
    eligibility: ['A published tutorial of 45 seconds or more', 'Creator Studio profile in an eligible market'],
    reward: '$500 campaign fee', start: '2026-10-10', end: '2026-12-15', deadline: '2026-12-22',
  },
  {
    id: 'k3', name: 'Lash Lift, Less Load', brand: 'Maybelline New York', status: 'Live', tone: 2,
    markets: ['VN', 'MY', 'PH', 'TH'],
    description: 'A lash look filmed in 720p and kept under 25 seconds. Proof that a lighter file still sells the look.',
    objective: 'Launch the Lash Lift mascara with fast before-and-after looks.',
    requirements: ['720p export, under 25 seconds', 'Before and after in the first 3 seconds'],
    deliverables: ['1 TikTok, Reel or Short', 'Submit the published post link in Creator Studio'],
    hashtags: ['#LashLift', '#TakingTheL'], mentions: ['@maybelline'],
    eligibility: ['Creator Studio profile in an eligible market'],
    reward: 'Product kit + $250 campaign fee', start: '2026-10-05', end: '2026-11-20', deadline: '2026-11-27',
  },
  {
    id: 'k4', name: 'Barrier Basics', brand: 'CeraVe', status: 'Draft', tone: 3,
    markets: ['IN', 'MY'],
    description: 'A three-step barrier routine, explained by a creator in under 40 seconds.',
    objective: 'Educate on skin barrier care with dermatologist-reviewed claims.',
    requirements: ['Under 40 seconds', 'Dermatologist-reviewed claims only'],
    deliverables: ['1 TikTok or Reel'],
    hashtags: ['#CeraVe', '#TakingTheL'], mentions: ['@cerave'],
    eligibility: ['Creator Studio profile in an eligible market', 'Skincare content in the last 90 days'],
    reward: '$200 campaign fee', start: '2026-12-01', end: '2027-01-31', deadline: '2027-02-07',
  },
];

const ALEX_POSTS = [
  { id: 'p101', title: '30-second morning glow routine', platform: 'TikTok', secs: 30, longSecs: 58, res: '1080p', views: 125000, status: 'qualified', submitted: '2026-10-04', verified: '2026-10-06', campaignId: 'k1', thumb: 0 },
  { id: 'p102', title: 'Lash lift in 25 seconds', platform: 'TikTok', secs: 25, res: '720p', views: 88400, status: 'qualified', submitted: '2026-10-08', verified: '2026-10-09', campaignId: 'k3', thumb: 3 },
  { id: 'p103', title: 'SPF the right way (short cut)', platform: 'TikTok', secs: 35, longSecs: 72, res: '1080p', views: 64200, status: 'qualified', submitted: '2026-10-11', verified: '2026-10-13', campaignId: null, thumb: 1 },
  { id: 'p104', title: 'Night routine, no fluff', platform: 'Instagram', secs: 32, res: '1080p', views: 41800, status: 'qualified', submitted: '2026-10-15', verified: '2026-10-16', campaignId: null, thumb: 4 },
  { id: 'p105', title: 'Full GRWM for a wedding', platform: 'TikTok', secs: 75, res: '1080p', views: 152000, status: 'not', submitted: '2026-10-17', verified: '2026-10-18', campaignId: null, thumb: 2 },
  { id: 'p106', title: 'Brow tutorial: the 30 s cut', platform: 'TikTok', secs: 30, longSecs: 60, res: '1080p', views: 210500, status: 'qualified', submitted: '2026-10-19', verified: '2026-10-20', campaignId: 'k2', thumb: 5 },
  { id: 'p107', title: 'Dewy base in three steps', platform: 'TikTok', secs: 28, res: '1080p', views: 47900, status: 'qualified', submitted: '2026-10-23', verified: '2026-10-24', campaignId: null, thumb: 6 },
  { id: 'p108', title: 'Hair oil in 20 seconds', platform: 'TikTok', secs: 20, res: '1080p', views: 31200, status: 'review', submitted: '2026-10-27', verified: null, campaignId: 'k1', thumb: 7 },
  { id: 'p109', title: 'Lip combo, one product', platform: 'Instagram', secs: 26, res: '1080p', views: 22800, status: 'info', submitted: '2026-10-28', verified: null, campaignId: null, thumb: 1, notes: [{ by: 'Verification team', date: '2026-10-29', text: 'The link opens a private post. Make it public or send a new link.' }] },
  { id: 'p110', title: 'Cleanser swap', platform: 'TikTok', secs: 30, res: '720p', views: 58300, status: 'qualified', submitted: '2026-09-12', verified: '2026-09-13', campaignId: null, thumb: 0 },
  { id: 'p111', title: 'Toner myths, explained', platform: 'TikTok', secs: 64, res: '1080p', views: 99100, status: 'not', submitted: '2026-09-03', verified: '2026-09-04', campaignId: null, thumb: 2 },
  { id: 'p112', title: 'Contour, no brush', platform: 'TikTok', secs: 40, res: '1080p', views: 18400, status: 'rejected', submitted: '2026-10-21', verified: '2026-10-22', campaignId: null, thumb: 3, notes: [{ by: 'Verification team', date: '2026-10-22', text: 'The account on the link does not match your profile.' }] },
].map((p) => ({ creatorId: 'c1', market: 'VN', notes: [], url: urlFor(p.platform, 'alex.tran.makes', p.id), ...p }));

const TITLES = [
  'Five-minute face, cut to 30', 'Skin prep before makeup', 'Curls without heat', 'Sunscreen reapply hack',
  'Office-to-dinner look', 'Brow lamination at home', 'Blush placement for round faces', 'Serum layering order',
  'Glass skin, real talk', 'Quick beard care', 'Rainy-day frizz fix', 'One-product eye look',
  'Hair mask Sunday', 'Liner for hooded eyes', 'Minimal makeup for school', 'Lip liner trick',
  'Toner vs essence', 'Scalp care basics', 'Night shift skincare', 'Festival glitter look',
];

function urlFor(platform, handle, id) {
  if (platform === 'YouTube') return `https://youtube.com/shorts/${id}x${handle.length}`;
  if (platform === 'Instagram') return `https://instagram.com/reel/${id}${handle.length}`;
  return `https://tiktok.com/@${handle}/video/7${id.replace(/\D/g, '')}40213`;
}

// Small seeded PRNG so the demo data is the same on every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PROFILE = {
  c2: { n: 16, short: 0.75 }, c3: { n: 22, short: 0.92, recent: 0.5 }, c4: { n: 10, short: 0.35 }, c5: { n: 11, short: 0.6 },
  c6: { n: 17, short: 0.85, recent: 0.3 }, c7: { n: 9, short: 0.55 }, c8: { n: 12, short: 0.5 }, c9: { n: 16, short: 0.85, recent: 0.4 },
  c10: { n: 10, short: 0.7 }, c11: { n: 5, short: 0.6 }, c12: { n: 6, short: 0.3 },
};

function addDays(iso, d) {
  const t = new Date(iso + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() + d);
  return t.toISOString().slice(0, 10);
}

function generate() {
  const benchmarks = defaultBenchmarks();
  const r = rng(20261030);
  const out = [];
  let id = 200;
  for (const c of CREATORS) {
    const prof = PROFILE[c.id];
    if (!prof) continue;
    for (let i = 0; i < prof.n; i++) {
      const short = r() < prof.short;
      const secs = short ? [15, 18, 20, 22, 25, 28, 30, 32][Math.floor(r() * 8)] : [45, 60, 70, 90, 140, 180][Math.floor(r() * 6)];
      const res = r() < 0.2 ? '720p' : r() < 0.85 ? '1080p' : '1440p';
      const platform = r() < 0.8 ? c.platform : ['TikTok', 'Instagram', 'YouTube'][Math.floor(r() * 3)];
      const startOffset = Math.max(0, Math.round((new Date(c.joined) - new Date('2026-08-01')) / 864e5));
      const day = prof.recent && r() < prof.recent ? 61 + Math.floor(r() * 29) : startOffset + Math.floor(r() * (89 - startOffset));
      const submitted = addDays('2026-08-01', Math.min(day, 89));
      const views = Math.round((8000 + r() ** 2 * 380000) / 100) * 100;
      const campaignId = c.campaigns.length && r() < 0.65 && submitted >= '2026-10-01' ? c.campaigns[Math.floor(r() * c.campaigns.length)] : null;
      const post = { id: `p${id++}`, creatorId: c.id, title: TITLES[Math.floor(r() * TITLES.length)], platform, secs, res, market: c.market, views, submitted, campaignId, thumb: Math.floor(r() * 8), notes: [] };
      if (short && r() < 0.5) post.longSecs = secs * 2;
      post.url = urlFor(platform, c.handle.slice(1), post.id);
      const score = lScore(post);
      const line = lineFor(benchmarks, post.market, secs);
      if (submitted >= '2026-10-24' && r() < 0.55) {
        post.status = 'review';
        post.verified = null;
      } else if (r() < 0.04) {
        post.status = 'rejected';
        post.verified = addDays(submitted, 1);
        post.notes = [{ by: 'Verification team', date: post.verified, text: 'Views on the post did not match the submission.' }];
      } else {
        post.status = score <= line ? 'qualified' : 'not';
        post.verified = addDays(submitted, 1 + Math.floor(r() * 2));
      }
      out.push(post);
    }
  }
  return out;
}

export function initialState() {
  const posts = [...ALEX_POSTS, ...generate()].map((p) => (p.status === 'qualified' || p.status === 'not' ? { ...p, vid: verificationId(p) } : p));
  return {
    version: 2,
    session: { creatorId: null },
    interest: [],
    posts,
    campaigns: CAMPAIGNS.map((c) => ({ ...c })),
    creators: CREATORS.map((c) => ({ ...c, campaigns: [...c.campaigns] })),
    benchmarks: defaultBenchmarks(),
    method: { version: 'v0.3-demo', updated: '2026-10-12' },
    benchmarkPeriod: { label: 'Q4 2026', start: '2026-10-01', end: '2026-12-31', status: 'Active' },
  };
}

// Incentives defined in the pitch deck for L Creators (10 qualifying posts in a quarter).
export const L_CREATOR_INCENTIVES = [
  { name: 'L-Media Fund', desc: "L'Oréal adds paid reach to qualifying campaign posts." },
  { name: 'Lighter Rate', desc: '+2 points of commission on qualifying posts.' },
];

// Platform-issued verification ID, e.g. LV-26Q4-7K3QX. Deterministic from the post.
export function verificationId(p) {
  let h = 2166136261;
  for (const ch of p.id + p.url) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const code = h.toString(36).toUpperCase().padStart(6, '0').slice(-5);
  const d = p.submitted || '2026-10-01';
  const q = Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1;
  return `LV-${d.slice(2, 4)}Q${q}-${code}`;
}

// Thumbnail palettes (beauty tones). Index stored on each post.
export const THUMBS = [
  ['#F6C9B8', '#E58C7A'], ['#D8E8C6', '#8DB16A'], ['#E7D7F2', '#A58BC9'], ['#F9E3B5', '#E2A848'],
  ['#CFE3EE', '#6E9DBB'], ['#F2D0DA', '#C9718A'], ['#E6E1D6', '#A89A7C'], ['#D3EDE5', '#5FA48D'],
];
