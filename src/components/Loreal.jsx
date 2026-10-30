import React from 'react';
import { cx } from './ui.jsx';

// Official L'Oréal logo files, dropped into src/assets/brand/ as supplied. Never redrawn or recoloured here.
const files = import.meta.glob('../assets/brand/loreal-logo-*.{svg,png}', { eager: true, query: '?url', import: 'default' });
function pick(tone) {
  const key = Object.keys(files).find((k) => k.includes(`loreal-logo-${tone}.`));
  return key ? files[key] : null;
}
export const LOREAL_LOGO = { black: pick('black'), white: pick('white') };

// Parent-brand endorsement. `height` sets the logo height; width follows the file's own proportions.
// Clear space around the logo is kept with padding equal to half its height.
export function LorealLogo({ tone = 'black', height = 16, className }) {
  const src = LOREAL_LOGO[tone];
  if (!src) return null;
  return (
    <span className={cx('inline-flex shrink-0 items-center', className)} style={{ padding: height / 2 }}>
      <img src={src} alt="L'Oréal" style={{ height, width: 'auto' }} draggable="false" />
    </span>
  );
}

// "A L'Oréal initiative" line with the logo beside it when the file is present.
export function Endorsement({ tone = 'black', height = 14, className, textClass }) {
  return (
    <span className={cx('inline-flex flex-wrap items-center gap-x-1', className)}>
      <span className={cx('eyebrow', textClass)}>A L'Oréal initiative</span>
      <LorealLogo tone={tone} height={height} className="-my-2" />
    </span>
  );
}
