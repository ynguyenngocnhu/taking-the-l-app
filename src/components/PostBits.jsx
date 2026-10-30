import React, { useState } from 'react';
import { ArrowUpRight, ShieldCheck, Copy, Check, Megaphone, Leaf } from 'lucide-react';
import { Thumb, LMark, StatusPill, Avatar, Modal, Button, cx } from './ui.jsx';
import { href } from '../lib/router.js';
import { useStore, enrich, campaignLabel } from '../lib/store.jsx';
import { fmt, compact, MARKETS, FORMATS, RESOLUTIONS, lScore, lineFor, formatOf } from '../lib/score.js';
import { ORGANIC } from '../data/mock.js';

export function CampaignTag({ name, className }) {
  const organic = name === ORGANIC;
  return (
    <span className={cx('inline-flex max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-semibold', organic ? 'bg-paper text-ink-2' : 'bg-ink text-white', className)}>
      {organic ? <Leaf size={11} className="shrink-0" /> : <Megaphone size={11} className="shrink-0" />}
      <span className="truncate">{name}</span>
    </span>
  );
}

export function contextLabel(p) {
  return `${MARKETS[p.market].name} · ${FORMATS[p.format].name.toLowerCase()}`;
}

// Public card for a verified, qualifying post: thumbnail with the L Mark, L-Score with its line,
// creator, platform, campaign, status, and both links.
export function PostCard({ p, creator, campaign }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <a href={href(`verify-${p.vid}`)} className="relative block" aria-label={`Verification for ${p.title}`}>
        <Thumb index={p.thumb} secs={p.secs} status={p.status} mark="md" play={false} className="aspect-[4/5] w-full rounded-none" label={p.title} />
        <span className="absolute bottom-2 left-2 rounded bg-ink/75 px-1.5 py-0.5 font-mono text-[11px] text-white">▶ {compact(p.views)}</span>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={creator.name} src={creator.avatar} size={28} />
          <div className="flex min-w-0 flex-col leading-tight">
            <b className="truncate text-[14px]">{creator.name}</b>
            <span className="truncate text-[12px] text-mute">{p.platform} · {creator.handle}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 border-t border-line pt-3">
          <div className="flex items-center gap-2">
            {p.status === 'qualified' && <LMark size={26} />}
            <div className="flex flex-col leading-none">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">L-Score</span>
              <span className="display text-[24px] font-black tnum">{fmt(p.score)}</span>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] leading-snug text-mute">
            L line {fmt(p.line)}<br />{contextLabel(p)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <CampaignTag name={campaign} />
          <StatusPill status={p.status} className="!px-2 !py-0.5 !text-[11px]" />
        </div>
        <div className="mt-auto flex gap-3 pt-1 text-[13px] font-semibold">
          <a href={href(`verify-${p.vid}`)} className="inline-flex items-center gap-1 hover:underline"><ShieldCheck size={14} /> Verification</a>
          <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-mute hover:text-ink hover:underline">Original post <ArrowUpRight size={14} /></a>
        </div>
      </div>
    </article>
  );
}

export function useVerifiedPosts() {
  const { state } = useStore();
  return state.posts
    .filter((p) => p.status === 'qualified' && p.vid)
    .map((p) => enrich(p, state.benchmarks))
    .sort((a, b) => (b.verified || '').localeCompare(a.verified || '') || a.id.localeCompare(b.id));
}

// The deck's Impact Receipt. A qualifying post has two: the short cut (the post) and the long cut it replaced.
function receiptRows(p, secs, benchmarks, kind, other) {
  const post = { ...p, secs };
  const score = lScore(post);
  const line = lineFor(benchmarks, p.market, secs);
  const mb = (secs * RESOLUTIONS[p.res].mbps) / 8;
  const under = score <= line;
  let claim = '–';
  if (kind === 'short' && other) claim = `lighter by ${Math.round((1 - secs / other) * 100)}%`;
  if (kind === 'long' && other) claim = `the long cut, ${secs} s`;
  return { score, line, mb, under, claim, format: FORMATS[formatOf(secs)].name.toLowerCase() };
}

export function ImpactReceipt({ p, kind = 'short', benchmarks }) {
  const secs = kind === 'long' ? p.longSecs : p.secs;
  const r = receiptRows(p, secs, benchmarks, kind, kind === 'long' ? p.secs : p.longSecs);
  const result = kind === 'short' ? (p.status === 'qualified' ? 'L earned' : p.status === 'not' ? 'over the L line' : 'not verified yet') : r.under ? 'under the L line' : 'over the L line';
  return (
    <article className="flex w-full max-w-[340px] flex-col gap-0 rounded-xl border border-[#BDBDBD] bg-ink p-5 font-mono text-[13px] text-white">
      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase tracking-[0.08em]">Impact receipt</span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/70">{kind === 'long' ? 'Long cut' : p.longSecs ? 'Short cut' : 'Post'}</span>
      </div>
      <Dash />
      <Row k="seconds" v={secs} />
      <Row k="MB per view" v={r.mb.toFixed(1)} />
      <Row k="g CO2e / 1,000" v={fmt(r.score)} />
      <Row k="L line" v={`${fmt(r.line)} · ${MARKETS[p.market].name}, ${r.format}`} />
      <Dash />
      <Row k="views per 1 GB" v={Math.floor(1000 / r.mb)} />
      <Row k="result" v={result} red={result === 'L earned'} />
      <Row k="method" v="loreal.com/L" />
      <Row k="claim" v={r.claim} />
      <Dash />
      <Row k="share" v="post to feed" />
      {kind === 'short' && p.vid && <span className="mt-2 text-[10px] text-white/45">Verification {p.vid}</span>}
    </article>
  );
}

function Row({ k, v, red }) {
  return (
    <div className="flex flex-col py-1.5">
      <span className="text-[11px] text-white/55">{k}</span>
      <span className={cx('font-semibold', red && 'text-brand-text')}>{v}</span>
    </div>
  );
}

function Dash() {
  return <div className="my-2 border-t border-dashed border-white/35" />;
}

export function Receipts({ p, benchmarks }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4">
        {p.longSecs ? <ImpactReceipt p={p} kind="long" benchmarks={benchmarks} /> : null}
        <ImpactReceipt p={p} kind="short" benchmarks={benchmarks} />
      </div>
      {!p.longSecs && <p className="text-[13px] text-mute">No long cut was submitted with this post, so it has one receipt.</p>}
    </div>
  );
}

export function verifyUrl(vid) {
  const base = window.location.href.split('#')[0];
  return `${base}#verify-${vid}`;
}

// Share the verified post card: the card plus its public verification link.
export function ShareCardModal({ open, onClose, p, creator, campaign }) {
  const { notify } = useStore();
  const [copied, setCopied] = useState('');
  const link = verifyUrl(p.vid);
  const caption = `This post is verified under the L Standard: ${fmt(p.score)} g CO₂e per 1,000 views, at or under the ${fmt(p.line)} L line for ${contextLabel(p)}. Check it: ${link} #TakingTheL`;
  const copy = async (text, what) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); notify(`${what} copied`); }
    catch (e) { notify('Select the text and copy it', 'bad'); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Share the verified post card" wide>
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        <div className="mx-auto w-full max-w-[220px]"><PostCard p={p} creator={creator} campaign={campaign} /></div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-[14px] text-ink-2">Anyone can open the verification page to check this post. A copy of the L Mark image on its own is not proof; the verification ID is.</p>
          <label className="label" htmlFor="share-link">Verification link</label>
          <div className="flex gap-2">
            <input id="share-link" readOnly value={link} className="input min-w-0 flex-1 font-mono text-[12px]" onFocus={(e) => e.target.select()} />
            <Button variant="outline" onClick={() => copy(link, 'Link')}>{copied === 'Link' ? <Check size={16} /> : <Copy size={16} />}</Button>
          </div>
          <label className="label" htmlFor="share-caption">Caption</label>
          <textarea id="share-caption" readOnly value={caption} className="input h-28 resize-none text-[13px]" onFocus={(e) => e.target.select()} />
          <div className="flex flex-wrap gap-2">
            <Button variant="brand" onClick={() => copy(caption, 'Caption')}>{copied === 'Caption' ? <Check size={16} /> : <Copy size={16} />} Copy caption</Button>
            <Button variant="ghost" as="a" href={href(`verify-${p.vid}`)} onClick={onClose}>Open verification page</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function useCampaignName() {
  const { state } = useStore();
  return (p) => campaignLabel(state, p);
}
