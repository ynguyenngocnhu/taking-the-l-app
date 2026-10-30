import React, { useEffect, useRef } from 'react';
import { Check, Clock, X, Sparkles, Play, AlertTriangle, Info } from 'lucide-react';
import { THUMBS } from '../data/mock.js';
import { fmt } from '../lib/score.js';
import { useStore } from '../lib/store.jsx';

export const cx = (...a) => a.filter(Boolean).join(' ');

// The L glyph: two strokes, the recurring motif.
export function LGlyph({ size = 20, stroke = 'currentColor', weight = 0.22, className }) {
  const w = size * weight;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
      <path d={`M${w / 2 + size * 0.18} ${size * 0.08}V${size - w / 2 - size * 0.08}H${size * 0.86}`} stroke={stroke} strokeWidth={w} fill="none" strokeLinecap="square" />
    </svg>
  );
}

export function LBox({ size = 28, className }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-[7px] bg-brand text-ink', className)} style={{ width: size, height: size }}>
      <LGlyph size={size * 0.68} />
    </span>
  );
}

export function Button({ variant = 'primary', size = 'md', className, as: As = 'button', children, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';
  const sizes = { sm: 'h-9 px-4 text-[13px]', md: 'h-11 px-5 text-[15px]', lg: 'h-[52px] px-7 text-base' };
  const variants = {
    primary: 'bg-ink text-white hover:bg-ink-2',
    brand: 'bg-brand text-ink hover:brightness-95',
    outline: 'border border-ink/80 text-ink hover:bg-ink hover:text-white',
    ghost: 'text-ink hover:bg-ink/5',
    danger: 'border border-bad text-bad hover:bg-bad hover:text-white',
    light: 'border border-white/70 text-white hover:bg-white hover:text-ink',
  };
  return (
    <As className={cx(base, sizes[size], variants[variant], className)} {...(As === 'button' && !rest.type ? { type: 'button' } : {})} {...rest}>
      {children}
    </As>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-card', className)} {...rest}>
      {children}
    </div>
  );
}

const STATUS = {
  qualified: { label: 'L-Earned', cls: 'bg-brand text-ink', Icon: Check },
  review: { label: 'Under review', cls: 'bg-warn-bg text-warn', Icon: Clock },
  not: { label: 'Not qualified', cls: 'bg-over-bg text-over', Icon: X },
  rejected: { label: 'Rejected', cls: 'border border-bad/40 text-bad', Icon: AlertTriangle },
  draft: { label: 'Estimate', cls: 'bg-ink/5 text-mute', Icon: Sparkles },
};

export function StatusPill({ status, className }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold', s.cls, className)}>
      <s.Icon size={13} strokeWidth={2.5} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function duration(secs) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

export function Thumb({ index, secs, className, label }) {
  const [a, b] = THUMBS[index % THUMBS.length];
  return (
    <div className={cx('relative shrink-0 overflow-hidden rounded-lg', className)} style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} role="img" aria-label={label || 'Video thumbnail'}>
      <div className="absolute inset-x-[20%] top-[14%] bottom-[34%] rounded-t-full bg-white/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85"><Play size={12} className="ml-0.5 text-ink" fill="currentColor" /></span>
      </div>
      {secs != null && <span className="absolute bottom-1 right-1 rounded bg-ink/75 px-1 font-mono text-[10px] text-white tnum">{duration(secs)}</span>}
    </div>
  );
}

export function Stat({ label, value, sub, className, accent }) {
  return (
    <Card className={cx('flex flex-col gap-1 p-4', accent && 'border-ink bg-ink text-white', className)}>
      <span className={cx('eyebrow', accent && 'text-white/60')}>{label}</span>
      <span className="display text-[28px] font-extrabold leading-none tnum">{value}</span>
      {sub && <span className={cx('text-[13px]', accent ? 'text-white/70' : 'text-mute')}>{sub}</span>}
    </Card>
  );
}

// Score against the L line on one scale.
export function ScoreBar({ score, line, compact = false, dark = false }) {
  const max = Math.max(line * 1.7, score * 1.12);
  const sp = Math.min(100, (score / max) * 100);
  const lp = (line / max) * 100;
  const under = score <= line;
  return (
    <div className={cx('w-full', compact ? 'pt-1' : 'pt-7')}>
      <div className={cx('relative h-3 rounded-full', dark ? 'bg-white/15' : 'bg-ink/[0.08]')}>
        <div className={cx('grow absolute inset-y-0 left-0 rounded-full', under ? 'bg-brand' : 'bg-over')} style={{ width: `${sp}%` }} />
        <div className={cx('absolute -top-1.5 -bottom-1.5 w-[3px] -translate-x-1/2 rounded', dark ? 'bg-white' : 'bg-ink')} style={{ left: `${lp}%` }} />
        {!compact && (
          <span className="absolute -top-7 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] font-semibold text-ink" style={{ left: `${lp}%` }}>
            L line {fmt(line)}
          </span>
        )}
      </div>
      {!compact && (
        <div className="mt-2 flex justify-between font-mono text-[11px] text-mute">
          <span>0</span>
          <span>{under ? `${fmt(line - score)} g under the line` : `${fmt(score - line)} g over the line`}</span>
        </div>
      )}
    </div>
  );
}

export function LProgress({ count, target = 10 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${count} of ${target} qualifying posts`}>
        {Array.from({ length: target }).map((_, i) => (
          <div key={i} className={cx('flex aspect-square items-center justify-center rounded-md border', i < count ? 'border-brand bg-brand text-ink' : 'border-dashed border-line-strong text-line-strong')}>
            <LGlyph size={16} weight={0.24} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    ref.current?.focus();
    const key = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={cx('rise max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card p-5 pb-[max(20px,env(safe-area-inset-bottom))] outline-none sm:rounded-2xl sm:p-7', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="display text-xl font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} className="-m-2 rounded-full p-2 hover:bg-ink/5" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div key={toast.id} role="status" className="rise fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-white shadow-lg">
      {toast.tone === 'bad' ? <X size={16} className="text-brand-text" /> : <Check size={16} className="text-brand-text" />}
      {toast.text}
    </div>
  );
}

export function Seg({ options, value, onChange, label, className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex flex-wrap gap-1 rounded-full bg-ink/[0.06] p-1', className)}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const on = v === value;
        return (
          <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)} className={cx('h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors', on ? 'bg-ink text-white' : 'text-mute hover:text-ink')}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <span className="flex items-center gap-1 text-[13px] text-bad"><AlertTriangle size={13} />{error}</span> : hint ? <span className="text-[12px] text-mute">{hint}</span> : null}
    </div>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
      <LGlyph size={36} stroke="#C8C0B2" />
      <p className="display text-lg font-bold">{title}</p>
      {body && <p className="max-w-sm text-[14px] text-mute">{body}</p>}
      {action}
    </div>
  );
}

export function DemoNote({ children = 'Demo data. All names, posts and figures are fictional and illustrative.', className }) {
  return (
    <p className={cx('flex items-start gap-1.5 text-[12px] text-mute', className)}>
      <Info size={13} className="mt-[2px] shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function PageHead({ eyebrow, title, sub, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="display text-[28px] font-extrabold leading-[1.05] sm:text-[34px]">{title}</h1>
        {sub && <p className="max-w-xl text-[15px] text-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Avatar({ name, size = 36 }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink" style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${h} 45% 86%)` }} aria-hidden="true">
      {initials}
    </span>
  );
}

export function Spinner({ size = 18 }) {
  return <span className="spin inline-block rounded-full border-2 border-current border-t-transparent" style={{ width: size, height: size }} aria-hidden="true" />;
}
