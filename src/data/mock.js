// Fictional demo data. No real creators, posts, results or payments.
import { lScore, defaultBenchmarks, lineFor } from '../lib/score.js';

export const TODAY = '2026-10-30';
export const QUARTER = { label: 'Q4 2026', start: '2026-10-01', end: '2026-12-31' };
export const L_CREATOR_TARGET = 10;
export const ME = 'c1';

export const CREATORS = [
  { id: 'c1', name: 'Alex Tran', handle: '@alex.tran.makes', platform: 'TikTok', market: 'VN', joined: '2026-08-02', campaigns: ['k1', 'k2', 'k3'] },
  { id: 'c2', name: 'Minh Anh Le', handle: '@minhanh.glow', platform: 'TikTok', market: 'VN', joined: '2026-08-05', campaigns: ['k1', 'k2'] },
  { id: 'c3', name: 'Putri Rahma', handle: '@putri.glowup', platform: 'TikTok', market: 'ID', joined: '2026-08-01', campaigns: ['k1', 'k3'] },
  { id: 'c4', name: 'Arjun Mehta', handle: '@arjun.grooms', platform: 'YouTube', market: 'IN', joined: '2026-08-11', campaigns: ['k2'] },
  { id: 'c5', name: 'Nadia Rahim', handle: '@nadia.rahim', platform: 'Instagram', market: 'MY', joined: '2026-08-19', campaigns: ['k3'] },
  { id: 'c6', name: 'Ploy Sirikul', handle: '@ploy.skin', platform: 'TikTok', market: 'TH', joined: '2026-08-07', campaigns: ['k1', 'k2', 'k3'] },
  { id: 'c7', name: 'Bea Santos', handle: '@bea.santos.ph', platform: 'Instagram', market: 'PH', joined: '2026-09-01', campaigns: ['k1'] },
  { id: 'c8', name: 'Kavya Iyer', handle: '@kavya.iyer', platform: 'TikTok', market: 'IN', joined: '2026-08-22', campaigns: [] },
  { id: 'c9', name: 'Rizky Pratama', handle: '@rizky.cuts', platform: 'TikTok', market: 'ID', joined: '2026-09-10', campaigns: ['k2'] },
  { id: 'c10', name: 'Linh Pham', handle: '@linh.daily', platform: 'TikTok', market: 'VN', joined: '2026-09-14', campaigns: ['k1', 'k3'] },
  { id: 'c11', name: 'Hana Yusof', handle: '@hana.yusof', platform: 'TikTok', market: 'MY', joined: '2026-10-02', campaigns: [] },
  { id: 'c12', name: 'Marco Dela Cruz', handle: '@marco.dc', platform: 'YouTube', market: 'PH', joined: '2026-10-06', campaigns: ['k2'] },
];

export const CAMPAIGNS = [
  {
    id: 'k1', name: 'Thirty Seconds of Glow', brand: 'Garnier', status: 'Live',
    description: 'Show your full morning routine in 30 seconds or less. Keep every step; lose the dead air.',
    reward: '$300 fee + L-Media Fund boost', start: '2026-10-01', end: '2026-11-30', tone: 0,
    brief: ['Max 30 s, vertical 9:16', 'Show the Garnier Micellar step on screen', 'Post on TikTok or Reels and submit within 7 days', 'Earn the L Mark to unlock the boost'],
  },
  {
    id: 'k2', name: 'The Invisible Edit', brand: "L'Oréal Paris", status: 'Live',
    description: 'Re-cut one of your 60-second tutorials into a 30-second version. Same steps, same story, half the seconds.',
    reward: '$500 + Lighter Rate +2 pts', start: '2026-10-10', end: '2026-12-15', tone: 1,
    brief: ['Start from a post you already published', 'Keep the hook and the result shot', 'Submit both versions so we can compare', 'Lighter Rate applies to the affiliate link on the 30 s cut'],
  },
  {
    id: 'k3', name: 'Lash Lift, Less Load', brand: 'Maybelline New York', status: 'Live',
    description: 'A lash look filmed in 720p and kept under 25 seconds. Proof that a lighter file still sells the look.',
    reward: '$250 + product kit', start: '2026-10-05', end: '2026-11-20', tone: 2,
    brief: ['720p export, under 25 s', 'Before / after in the first 3 s', 'Tag the campaign in the caption', 'Product kit ships after verification'],
  },
  {
    id: 'k4', name: 'Barrier Basics', brand: 'CeraVe', status: 'Draft',
    description: 'Three-step barrier routine, explained by a creator in under 40 seconds.',
    reward: '$200 + Lighter Rate +2 pts', start: '2026-12-01', end: '2027-01-31', tone: 3,
    brief: ['Under 40 s', 'Dermatologist-reviewed claims only'],
  },
];

const ALEX_POSTS = [
  { id: 'p101', title: '30-second morning glow routine', platform: 'TikTok', secs: 30, res: '1080p', views: 125000, status: 'qualified', submitted: '2026-10-04', verified: '2026-10-06', campaignId: 'k1', thumb: 0 },
  { id: 'p102', title: 'Lash lift in 25 seconds', platform: 'TikTok', secs: 25, res: '720p', views: 88400, status: 'qualified', submitted: '2026-10-08', verified: '2026-10-09', campaignId: 'k3', thumb: 3 },
  { id: 'p103', title: 'SPF the right way (short cut)', platform: 'TikTok', secs: 35, res: '1080p', views: 64200, status: 'qualified', submitted: '2026-10-11', verified: '2026-10-13', campaignId: null, thumb: 1 },
  { id: 'p104', title: 'Night routine, no fluff', platform: 'Instagram', secs: 32, res: '1080p', views: 41800, status: 'qualified', submitted: '2026-10-15', verified: '2026-10-16', campaignId: null, thumb: 4 },
  { id: 'p105', title: 'Full GRWM for a wedding', platform: 'TikTok', secs: 75, res: '1080p', views: 152000, status: 'not', submitted: '2026-10-17', verified: '2026-10-18', campaignId: null, thumb: 2 },
  { id: 'p106', title: 'Brow tutorial: the 30 s cut', platform: 'TikTok', secs: 30, res: '1080p', views: 210500, status: 'qualified', submitted: '2026-10-19', verified: '2026-10-20', campaignId: 'k2', thumb: 5 },
  { id: 'p107', title: 'Dewy base in three steps', platform: 'TikTok', secs: 28, res: '1080p', views: 47900, status: 'qualified', submitted: '2026-10-23', verified: '2026-10-24', campaignId: null, thumb: 6 },
  { id: 'p108', title: 'Hair oil in 20 seconds', platform: 'TikTok', secs: 20, res: '1080p', views: 31200, status: 'review', submitted: '2026-10-27', verified: null, campaignId: 'k1', thumb: 7 },
  { id: 'p109', title: 'Lip combo test', platform: 'TikTok', secs: 45, res: '1080p', views: 0, status: 'draft', type: 'draft', submitted: '2026-10-29', verified: null, campaignId: null, thumb: 1 },
  { id: 'p110', title: 'Cleanser swap', platform: 'TikTok', secs: 30, res: '720p', views: 58300, status: 'qualified', submitted: '2026-09-12', verified: '2026-09-13', campaignId: null, thumb: 0 },
  { id: 'p111', title: 'Toner myths, explained', platform: 'TikTok', secs: 64, res: '1080p', views: 99100, status: 'not', submitted: '2026-09-03', verified: '2026-09-04', campaignId: null, thumb: 2 },
].map((p) => ({ creatorId: 'c1', market: 'VN', type: 'published', notes: [], url: urlFor(p.platform, 'alex.tran.makes', p.id), ...p }));

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
      const post = { id: `p${id++}`, creatorId: c.id, title: TITLES[Math.floor(r() * TITLES.length)], platform, secs, res, market: c.market, views, type: 'published', submitted, campaignId, thumb: Math.floor(r() * 8), notes: [] };
      post.url = urlFor(platform, c.handle.slice(1), post.id);
      const score = lScore(post);
      const line = lineFor(benchmarks, post.market, secs);
      if (submitted >= '2026-10-24' && r() < 0.55) {
        post.status = 'review';
        post.verified = null;
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
  return {
    version: 1,
    posts: [...ALEX_POSTS, ...generate()],
    campaigns: CAMPAIGNS.map((c) => ({ ...c })),
    creators: CREATORS.map((c) => ({ ...c, campaigns: [...c.campaigns] })),
    benchmarks: defaultBenchmarks(),
    method: { version: 'v0.3-demo', updated: '2026-10-12' },
  };
}

export const REWARD_HISTORY = [
  { date: '2026-10-24', item: 'Product kit: Maybelline lash set', source: 'Lash Lift, Less Load', amount: 'Kit' },
  { date: '2026-10-20', item: 'Campaign fee', source: 'The Invisible Edit', amount: '$500' },
  { date: '2026-10-06', item: 'Campaign fee', source: 'Thirty Seconds of Glow', amount: '$300' },
  { date: '2026-09-13', item: 'First L Mark welcome credit', source: 'L Creator Programme', amount: '$25' },
];

export const INCENTIVES = [
  { key: 'mark', name: 'L Mark', desc: 'A verified badge and Impact Receipt for every qualifying post.', unlock: 'Every qualifying post', always: true },
  { key: 'fund', name: 'L-Media Fund', desc: "L'Oréal adds 30% extra paid reach to your qualifying campaign posts.", unlock: 'L Creator (10 L posts in a quarter)' },
  { key: 'rate', name: 'Lighter Rate', desc: '+2 points of affiliate commission on L posts for the next quarter.', unlock: 'L Creator (10 L posts in a quarter)' },
  { key: 'day0', name: 'Brand Day Zero invite', desc: 'First look at new briefs before they open to all creators.', unlock: 'L Creator (10 L posts in a quarter)' },
];

// Thumbnail palettes (beauty tones). Index stored on each post.
export const THUMBS = [
  ['#F6C9B8', '#E58C7A'], ['#D8E8C6', '#8DB16A'], ['#E7D7F2', '#A58BC9'], ['#F9E3B5', '#E2A848'],
  ['#CFE3EE', '#6E9DBB'], ['#F2D0DA', '#C9718A'], ['#E6E1D6', '#A89A7C'], ['#D3EDE5', '#5FA48D'],
];
