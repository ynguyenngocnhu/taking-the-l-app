import { useEffect, useState } from 'react';

// Plain hash routes (no slashes) so links work on any static host and inside previews.
// Public:  #home  #standard  #estimator  #verified  #verify-LV-26Q4-XXXXX  #brands  #join
// Studio:  #studio  #studio-posts  #studio-post-p101  #studio-submit  #studio-campaigns  #studio-campaign-k1  #studio-profile  #studio-receipt-p101
// Admin:   #admin  #admin-submissions  #admin-verification-p108  #admin-campaigns  #admin-benchmarks  #admin-creators  #admin-creator-c4
export function parse(hash) {
  const h = (hash || '').replace(/^#/, '');
  const parts = h.split('-');
  if (parts[0] === 'studio' || parts[0] === 'admin') {
    const [area, page = '', ...rest] = parts;
    return { area, page, id: rest.join('-') };
  }
  const [page = 'home', ...rest] = parts;
  const pages = ['home', 'standard', 'estimator', 'verified', 'verify', 'brands', 'join'];
  return { area: 'site', page: pages.includes(page) ? page : 'home', id: rest.join('-') };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path) {
  window.location.hash = path;
}

export const href = (path) => `#${path}`;
