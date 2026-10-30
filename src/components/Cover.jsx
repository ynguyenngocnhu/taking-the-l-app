import React from 'react';

// Illustrated video covers for the sample posts. Each scene is a simple flat beauty still life,
// picked from the post title so a lash video shows mascara, an SPF video shows sunscreen, and so on.
// viewBox is 100 × 125 (4:5, the vertical video cover ratio).

const W = '#FFFFFF';
const INK = '#1A1A1A';

function Lipstick({ a, b }) {
  return (
    <g>
      <path d="M22 84c8-10 20-12 28-6 8-6 20-4 28 6-10 12-46 12-56 0z" fill={b} opacity=".55" />
      <path d="M22 84c12 4 44 4 56 0-8 10-48 10-56 0z" fill={b} opacity=".8" />
      <rect x="54" y="52" width="16" height="30" rx="2" fill={INK} />
      <rect x="55.5" y="44" width="13" height="10" rx="1" fill="#C9A86A" />
      <path d="M57 44V30l10 6v8z" fill={b} />
      <rect x="54" y="78" width="16" height="4" fill="#C9A86A" />
    </g>
  );
}

function Dropper({ a, b }) {
  return (
    <g>
      <rect x="34" y="50" width="32" height="44" rx="8" fill={W} opacity=".55" />
      <rect x="34" y="66" width="32" height="28" rx="8" fill={b} opacity=".75" />
      <rect x="42" y="40" width="16" height="12" rx="2" fill={INK} />
      <rect x="44" y="24" width="12" height="18" rx="6" fill={INK} />
      <rect x="47" y="52" width="6" height="34" rx="3" fill={W} opacity=".7" />
      <circle cx="74" cy="44" r="3" fill={b} />
      <circle cx="80" cy="56" r="2" fill={b} opacity=".7" />
      <rect x="38" y="72" width="24" height="3" rx="1.5" fill={W} opacity=".7" />
    </g>
  );
}

function Mascara({ a, b }) {
  return (
    <g>
      <path d="M18 58c12-12 34-12 46 0-12 10-34 10-46 0z" fill={W} opacity=".85" />
      <circle cx="41" cy="58" r="8" fill={INK} />
      <circle cx="43.5" cy="55.5" r="2.4" fill={W} />
      {[20, 26, 32, 38, 44, 50, 56, 62].map((x, i) => <path key={x} d={`M${x} ${51 - Math.sin((i / 7) * Math.PI) * 3}l${-2 + i * 0.6} -7`} stroke={INK} strokeWidth="1.6" strokeLinecap="round" />)}
      <g transform="rotate(-35 70 82)">
        <rect x="66" y="66" width="10" height="44" rx="3" fill={INK} />
        <rect x="66" y="66" width="10" height="7" rx="2" fill="#C9A86A" />
        <rect x="69.6" y="48" width="2.8" height="20" fill={INK} />
        <rect x="67.5" y="40" width="7" height="12" rx="3" fill={INK} />
      </g>
    </g>
  );
}

function Hair({ a, b }) {
  return (
    <g>
      <circle cx="50" cy="44" r="16" fill={W} opacity=".9" />
      <path d="M30 46c-2-22 14-32 26-28 14 4 18 18 14 30 6 10 8 26 2 44-6-14-10-22-12-34 2-8-2-16-8-18-6 4-12 4-16 2-2 10-4 22-12 32-4-10-2-20 6-28z" fill={b} />
      <path d="M38 64c4 10 4 22 0 34M60 62c6 10 8 22 6 34" stroke={W} strokeWidth="1.4" opacity=".45" fill="none" />
      <g transform="rotate(20 76 96)">
        <rect x="62" y="92" width="30" height="6" rx="2" fill={INK} />
        {[64, 67, 70, 73, 76, 79, 82, 85, 88].map((x) => <rect key={x} x={x} y="98" width="1.4" height="7" fill={INK} />)}
      </g>
    </g>
  );
}

function Jar({ a, b }) {
  return (
    <g>
      <rect x="26" y="64" width="48" height="28" rx="6" fill={W} opacity=".9" />
      <rect x="24" y="54" width="52" height="12" rx="4" fill={INK} />
      <rect x="34" y="74" width="32" height="4" rx="2" fill={b} opacity=".8" />
      <path d="M58 38c6-8 18-8 22 0s-6 12-14 10c-6-1-10-4-8-10z" fill={W} />
      <path d="M62 40c4-4 10-4 13 0" stroke={b} strokeWidth="1.4" fill="none" opacity=".7" />
    </g>
  );
}

function Sun({ a, b }) {
  return (
    <g>
      <circle cx="68" cy="34" r="12" fill={W} opacity=".9" />
      {Array.from({ length: 8 }).map((_, i) => {
        const t = (i / 8) * Math.PI * 2;
        return <line key={i} x1={68 + Math.cos(t) * 16} y1={34 + Math.sin(t) * 16} x2={68 + Math.cos(t) * 21} y2={34 + Math.sin(t) * 21} stroke={W} strokeWidth="2" strokeLinecap="round" opacity=".9" />;
      })}
      <g transform="rotate(-14 42 76)">
        <path d="M30 52h24l-2 46H32z" fill={W} />
        <rect x="34" y="98" width="16" height="8" rx="1.5" fill={INK} />
        <rect x="33" y="62" width="18" height="12" rx="2" fill={b} />
        <text x="42" y="70.5" fontSize="6" fontWeight="800" textAnchor="middle" fill={W} fontFamily="Archivo, system-ui, sans-serif">SPF</text>
      </g>
    </g>
  );
}

function Face({ a, b }) {
  return (
    <g>
      <circle cx="50" cy="30" r="10" fill={INK} />
      <ellipse cx="50" cy="58" rx="22" ry="26" fill={W} opacity=".95" />
      <path d="M28 52c0-18 10-26 22-26s22 8 22 26c-6-10-14-14-22-14s-16 4-22 14z" fill={INK} />
      <path d="M39 59q4 3 8 0M53 59q4 3 8 0" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="67" r="4.5" fill={b} opacity=".55" />
      <circle cx="62" cy="67" r="4.5" fill={b} opacity=".55" />
      <path d="M45 74q5 4 10 0" stroke={b} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M28 108c4-16 12-22 22-22s18 6 22 22z" fill={W} opacity=".6" />
    </g>
  );
}

function Palette({ a, b }) {
  return (
    <g>
      <rect x="20" y="46" width="46" height="40" rx="6" fill={INK} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={31 + (i % 2) * 24} cy={58 + Math.floor(i / 2) * 16} r="6.5" fill={[b, a, W, b][i]} opacity={[1, 1, 0.85, 0.6][i]} />)}
      <g transform="rotate(32 72 70)">
        <rect x="69" y="64" width="6" height="40" rx="3" fill={INK} />
        <rect x="68.5" y="58" width="7" height="8" fill="#C9A86A" />
        <path d="M68 58c-2-10 1-18 4-20 3 2 6 10 4 20z" fill={b} />
      </g>
    </g>
  );
}

const SCENES = [Lipstick, Dropper, Mascara, Hair, Jar, Sun, Face, Palette];
const RULES = [
  [/lash|mascara|eye|liner|brow/i, 2],
  [/lip|lipstick/i, 0],
  [/hair|curl|frizz|scalp|beard|mask sunday|oil/i, 3],
  [/spf|sun/i, 5],
  [/serum|toner|essence|drop/i, 1],
  [/blush|contour|palette|glitter|look|makeup|base/i, 7],
  [/cleanser|cream|barrier|micellar|jar/i, 4],
  [/face|skin|glow|routine|grwm|night|prep/i, 6],
];

export function sceneFor(title, index) {
  for (const [re, i] of RULES) if (re.test(title || '')) return i;
  return index % SCENES.length;
}

export function CoverArt({ title, index, a, b }) {
  const Scene = SCENES[sceneFor(title, index)];
  const id = `g${index}${(title || '').length}`;
  return (
    <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}l`} cx="30%" cy="20%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="125" fill={`url(#${id}l)`} />
      <circle cx="50" cy="66" r="40" fill="#fff" opacity=".18" />
      <rect x="0" y="100" width="100" height="25" fill={b} opacity=".35" />
      <Scene a={a} b={b} />
    </svg>
  );
}
