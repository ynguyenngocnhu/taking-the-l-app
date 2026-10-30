import React, { useState } from 'react';
import { Globe, LayoutGrid, ShieldCheck, RotateCcw } from 'lucide-react';
import { LBox, cx, Button, Modal } from './ui.jsx';
import { href, go } from '../lib/router.js';
import { useStore } from '../lib/store.jsx';

const ROLES = [
  { area: 'standard', label: 'L Standard', short: 'Standard', Icon: Globe, to: 'standard' },
  { area: 'studio', label: 'Creator Studio', short: 'Studio', Icon: LayoutGrid, to: 'studio' },
  { area: 'admin', label: 'Admin Console', short: 'Admin', Icon: ShieldCheck, to: 'admin' },
];

export function TopBar({ area }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[env(safe-area-inset-top,0px)] bg-ink" />
      <header className="gutter sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-white/10 bg-ink text-paper">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3">
          <a href={href('standard')} className="flex items-center gap-2.5" aria-label="Home">
            <LBox size={30} />
          </a>
          <nav aria-label="Switch experience" className="flex items-center gap-2">
            <span className="eyebrow hidden text-white/50 md:inline">Demo as</span>
            <div className="flex gap-1 rounded-full border border-white/15 bg-white/5 p-1">
              {ROLES.map((r) => {
                const on = r.area === area;
                return (
                  <a key={r.area} href={href(r.to)} aria-current={on ? 'page' : undefined} className={cx('flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors', on ? 'bg-brand text-white' : 'text-white/65 hover:text-white')}>
                    <r.Icon size={15} aria-hidden="true" className="hidden min-[400px]:block" />
                    <span className="lg:hidden">{r.short}</span>
                    <span className="hidden lg:inline">{r.label}</span>
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

// Left sidebar on desktop, a scrolling tab row on phones.
export function SideLayout({ title, user, items, current, children, footer }) {
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col lg:flex-row">
      <aside className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:w-[248px] lg:shrink-0 lg:border-r lg:border-line">
        <div className="gutter hidden flex-col gap-1 py-6 lg:flex lg:h-full">
          <div className="mb-5 flex flex-col gap-0.5 px-3">
            <span className="eyebrow">{title}</span>
            {user}
          </div>
          {items.map((it) => {
            const on = it.key === current;
            return (
              <a key={it.key} href={href(it.to)} aria-current={on ? 'page' : undefined} className={cx('flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors', on ? 'bg-ink text-white' : 'text-ink-2 hover:bg-ink/5')}>
                <it.Icon size={18} aria-hidden="true" className={on ? 'text-brand' : 'text-mute'} />
                <span className="flex-1">{it.label}</span>
                {it.badge ? <span className={cx('rounded-full px-2 py-0.5 text-[11px] font-bold tnum', on ? 'bg-brand text-ink' : 'bg-ink text-white')}>{it.badge}</span> : null}
              </a>
            );
          })}
          <div className="mt-auto">{footer}</div>
        </div>
        <nav aria-label={title} className="gutter scroll-x flex gap-1.5 border-b border-line py-2.5 lg:hidden">
          {items.map((it) => {
            const on = it.key === current;
            return (
              <a key={it.key} href={href(it.to)} aria-current={on ? 'page' : undefined} className={cx('flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold', on ? 'bg-ink text-white' : 'border border-line bg-white text-ink-2')}>
                <it.Icon size={15} aria-hidden="true" />
                {it.label}
                {it.badge ? <span className="rounded-full bg-brand px-1.5 text-[11px] text-ink tnum">{it.badge}</span> : null}
              </a>
            );
          })}
        </nav>
      </aside>
      <main className="gutter min-w-0 flex-1 pb-16 pt-6 lg:pt-8 lg:pl-10 lg:pr-10">{children}</main>
    </div>
  );
}

export function ResetDemo() {
  const { dispatch, notify } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 px-3 text-[13px] text-mute hover:text-ink">
        <RotateCcw size={15} /> Reset demo data
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Reset the demo?">
        <p className="text-[15px] text-mute">This clears your test submissions, approvals and edits, and loads the original demo data again.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { dispatch({ type: 'reset' }); setOpen(false); notify('Demo data reset'); go(window.location.hash.slice(1).split('-')[0]); }}>Reset</Button>
        </div>
      </Modal>
    </>
  );
}
