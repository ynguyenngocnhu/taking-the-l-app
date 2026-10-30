import React, { useEffect, useState } from 'react';
import { Menu, X, RotateCcw, LogOut, ArrowUpRight, ExternalLink } from 'lucide-react';
import { LBox, cx, Button, Modal, Avatar } from './ui.jsx';
import { href, go } from '../lib/router.js';
import { useStore, useMe } from '../lib/store.jsx';

// ---------------------------------------------------------------- public

const PUBLIC_NAV = [
  { page: 'home', label: 'Home' },
  { page: 'standard', label: 'The L Standard' },
  { page: 'estimator', label: 'L-Score Estimator' },
  { page: 'verified', label: 'Verified Posts' },
  { page: 'brands', label: 'For Brands' },
  { page: 'join', label: 'Join L' },
];

function SafeTop({ className = 'bg-ink' }) {
  return <div className={cx('pointer-events-none fixed inset-x-0 top-0 z-40 h-[env(safe-area-inset-top,0px)]', className)} />;
}

export function PublicHeader({ page }) {
  const [open, setOpen] = useState(false);
  const me = useMe();
  useEffect(() => setOpen(false), [page]);
  const current = page === 'verify' ? 'verified' : page;
  return (
    <>
      <SafeTop />
      <header className="gutter sticky top-[env(safe-area-inset-top,0px)] z-30 bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4">
          <a href={href('home')} className="flex items-center gap-3" aria-label="Taking the L, home">
            <LBox size={30} />
          </a>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {PUBLIC_NAV.slice(1).map((n) => (
              <a key={n.page} href={href(n.page)} aria-current={current === n.page ? 'page' : undefined} className={cx('rounded-full px-3 py-2 text-[14px] font-medium transition-colors', current === n.page ? 'text-white' : 'text-white/60 hover:text-white')}>
                {n.label}
                {current === n.page && <span className="mx-auto mt-0.5 block h-[2px] w-4 bg-brand" />}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={href('studio')} className="hidden h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold text-ink hover:bg-white/90 sm:inline-flex">
              {me ? <><Avatar name={me.name} src={me.avatar} size={22} /> Creator Studio</> : 'Creator Studio · Sign in'}
            </a>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Main" className="mx-auto flex max-w-[1240px] flex-col border-t border-white/10 py-3 lg:hidden">
            {PUBLIC_NAV.map((n) => (
              <a key={n.page} href={href(n.page)} className={cx('flex h-12 items-center justify-between text-[16px]', current === n.page ? 'font-semibold text-white' : 'text-white/70')}>
                {n.label}
                {current === n.page && <span className="h-2 w-2 bg-brand" />}
              </a>
            ))}
            <a href={href('studio')} className="mt-3 flex h-12 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-ink">Creator Studio · Sign in</a>
          </nav>
        )}
      </header>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer className="gutter bg-ink pb-[max(28px,env(safe-area-inset-bottom))] pt-14 text-white">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <LBox size={40} />
            <p className="max-w-xs text-[14px] text-white/60">An L'Oréal initiative. A public standard for lighter video, verified post by post.</p>
          </div>
          <FooterCol title="The standard" links={[['The L Standard', 'standard'], ['L-Score Estimator', 'estimator'], ['Verified Posts', 'verified']]} />
          <FooterCol title="Take part" links={[['Join L', 'join'], ['For Brands', 'brands'], ['Creator Studio', 'studio']]} />
          <div className="flex flex-col gap-2 text-[14px]">
            <span className="eyebrow text-white/40">L'Oréal</span>
            <a className="inline-flex items-center gap-1 text-white/70 hover:text-white" href="https://www.lorealistar.com/en-en/" target="_blank" rel="noreferrer">LOREALISTAR <ArrowUpRight size={14} /></a>
            <a className="text-white/40 hover:text-white/70" href={href('admin')}>Admin Console (internal)</a>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-[12px] text-white/45 sm:flex-row sm:justify-between">
          <span>Prototype for the L'Oréal SAPMENA Limitless Pitch 2026. Creators, posts and figures are sample data.</span>
          <ResetDemo dark />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div className="flex flex-col gap-2 text-[14px]">
      <span className="eyebrow text-white/40">{title}</span>
      {links.map(([l, to]) => <a key={to} className="text-white/70 hover:text-white" href={href(to)}>{l}</a>)}
    </div>
  );
}

// ---------------------------------------------------------------- studio and admin

export function AppHeader({ label, right, homeTo }) {
  return (
    <>
      <SafeTop />
      <header className="gutter sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-white/10 bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3">
          <a href={href(homeTo)} className="flex items-center gap-3">
            <LBox size={28} />
            <span className="text-[15px] font-semibold">{label}</span>
          </a>
          <div className="flex items-center gap-2">{right}</div>
        </div>
      </header>
    </>
  );
}

export function UserMenu({ me }) {
  const { dispatch, notify } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex h-10 items-center gap-2 rounded-full pl-1 pr-3 hover:bg-white/10">
        <Avatar name={me.name} src={me.avatar} size={30} />
        <span className="hidden text-[14px] font-medium sm:inline">{me.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 flex w-56 flex-col rounded-xl border border-line bg-white p-1.5 text-ink shadow-xl" onMouseLeave={() => setOpen(false)}>
          <a href={href('studio-profile')} className="rounded-lg px-3 py-2.5 text-[14px] hover:bg-paper" onClick={() => setOpen(false)}>My profile</a>
          <a href={href('home')} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] hover:bg-paper" onClick={() => setOpen(false)}>Public L website <ExternalLink size={14} /></a>
          <button type="button" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] hover:bg-paper" onClick={() => { dispatch({ type: 'signOut' }); notify('Signed out'); go('home'); }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// Left sidebar on desktop, a scrolling tab row on phones.
export function SideLayout({ title, user, items, current, children, footer }) {
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col lg:flex-row">
      <aside className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:w-[240px] lg:shrink-0 lg:border-r lg:border-line">
        <div className="gutter hidden flex-col gap-1 py-6 lg:flex lg:h-full">
          {(title || user) && (
            <div className="mb-5 flex flex-col gap-0.5 px-3">
              {title && <span className="eyebrow">{title}</span>}
              {user}
            </div>
          )}
          {items.map((it) => {
            const on = it.key === current;
            return (
              <a key={it.key} href={href(it.to)} aria-current={on ? 'page' : undefined} className={cx('flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors', on ? 'bg-ink text-white' : 'text-ink-2 hover:bg-ink/5')}>
                <it.Icon size={18} aria-hidden="true" className={on ? 'text-brand-text' : 'text-mute'} />
                <span className="flex-1">{it.label}</span>
                {it.badge ? <span className={cx('rounded-full px-2 py-0.5 text-[11px] font-bold tnum', on ? 'bg-brand text-white' : 'bg-ink text-white')}>{it.badge}</span> : null}
              </a>
            );
          })}
          <div className="mt-auto flex flex-col gap-1">{footer}</div>
        </div>
        <nav aria-label={title || 'Sections'} className="gutter scroll-x flex gap-1.5 border-b border-line py-2.5 lg:hidden">
          {items.map((it) => {
            const on = it.key === current;
            return (
              <a key={it.key} href={href(it.to)} aria-current={on ? 'page' : undefined} className={cx('flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold', on ? 'bg-ink text-white' : 'border border-line bg-white text-ink-2')}>
                <it.Icon size={15} aria-hidden="true" />
                {it.label}
                {it.badge ? <span className="rounded-full bg-brand px-1.5 text-[11px] text-white tnum">{it.badge}</span> : null}
              </a>
            );
          })}
        </nav>
      </aside>
      <main className="gutter min-w-0 flex-1 pb-16 pt-6 lg:pl-10 lg:pr-10 lg:pt-8">{children}</main>
    </div>
  );
}

export function ResetDemo({ dark }) {
  const { dispatch, notify } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cx('inline-flex items-center gap-2 text-[13px]', dark ? 'text-white/45 hover:text-white' : 'h-10 px-3 text-mute hover:text-ink')}>
        <RotateCcw size={14} /> Reset demo data
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Reset the demo?">
        <p className="text-[15px] text-mute">This clears test submissions, verification decisions, profiles and edits, and loads the original sample data again.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { dispatch({ type: 'reset' }); setOpen(false); notify('Demo data reset'); }}>Reset</Button>
        </div>
      </Modal>
    </>
  );
}
