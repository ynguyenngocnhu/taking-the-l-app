import React from 'react';
import { cx } from '../../components/ui.jsx';

export function Section({ id, eyebrow, title, intro, children, className, inner }) {
  return (
    <section id={id} className={cx('gutter py-16 sm:py-20', className)}>
      <div className={cx('mx-auto flex max-w-[1240px] flex-col gap-10', inner)}>
        {(eyebrow || title) && (
          <div className="flex max-w-3xl flex-col gap-3">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2 className="display text-[32px] font-extrabold leading-[1.04] sm:text-[46px]">{title}</h2>}
            {intro && <p className="max-w-2xl text-[17px] leading-relaxed text-mute">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageHero({ eyebrow, title, intro, children }) {
  return (
    <section className="gutter border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 py-12 sm:py-16">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="display text-[40px] font-black uppercase leading-[0.95] sm:text-[64px]" style={{ fontStretch: '85%' }}>{title}</h1>
        {intro && <p className="max-w-2xl text-[17px] leading-relaxed text-ink-2">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function SampleNote({ children = 'Sample data. Creators, posts, scores and L lines are illustrative, not validated benchmarks.', className }) {
  return <p className={cx('text-[12px] text-mute', className)}>{children}</p>;
}

export function FilterSelect({ id, label, value, onChange, options }) {
  return (
    <label className="flex min-w-0 flex-col gap-1" htmlFor={id}>
      <span className="text-[12px] font-semibold text-mute">{label}</span>
      <select id={id} className="input h-10 py-0 text-[14px]" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
