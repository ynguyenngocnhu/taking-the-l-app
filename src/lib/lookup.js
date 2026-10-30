// Demo stand-in for reading a public post link. The same link always returns the same details.
// In a real build these figures would come from the platform once the creator connects the account.
export const SAMPLE_URL = 'https://tiktok.com/@alex.tran.makes/video/7431190040213';

export function platformFromUrl(url) {
  const u = (url || '').trim().toLowerCase();
  if (!/^https?:\/\//.test(u)) return null;
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  return null;
}

export function mockFetch(url) {
  const u = (url || '').trim();
  if (u === SAMPLE_URL) return { views: 125000, secs: 30, res: '1080p', title: 'Brow tutorial: the 30 s cut' };
  const m = u.match(/\/video\/(\d{6,})|\/(?:reel|p)\/([\w-]{5,})|\/shorts\/([\w-]{5,})|[?&]v=([\w-]{5,})|youtu\.be\/([\w-]{5,})/i);
  if (!m) return null;
  let h = 7;
  for (const ch of u) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    views: Math.round((12000 + (h % 380000)) / 100) * 100,
    secs: [15, 20, 25, 30, 35, 45, 60][h % 7],
    res: h % 5 === 0 ? '720p' : '1080p',
    title: '',
  };
}

export function resFromHeight(w, h) {
  const s = Math.min(w, h);
  if (s >= 2000) return '4K';
  if (s >= 1300) return '1440p';
  if (s >= 900) return '1080p';
  return '720p';
}
