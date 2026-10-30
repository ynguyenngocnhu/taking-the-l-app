import { useEffect, useState } from 'react';

// Plain hash routes like #studio-submit or #admin-creator-c4 (no slashes, so links work everywhere).
export function parse(hash) {
  const h = (hash || '').replace(/^#/, '');
  const [area = 'standard', page = '', ...rest] = h.split('-');
  const valid = ['standard', 'studio', 'admin'];
  return { area: valid.includes(area) ? area : 'standard', page, id: rest.join('-') };
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
