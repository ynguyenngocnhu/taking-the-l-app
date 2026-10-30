import React, { useState } from 'react';
import { ArrowLeft, Receipt as ReceiptIcon, Share2, Download, Copy, Check, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button, Card, StatusPill, Thumb, ScoreBar, Empty, DemoNote, Modal, Seg, LGlyph, LBox, Spinner, cx } from '../../components/ui.jsx';
import { useStore, enrich } from '../../lib/store.jsx';
import { href, go } from '../../lib/router.js';
import { fmt, compact, factors, MARKETS, FORMATS, lScore, RESOLUTIONS } from '../../lib/score.js';
import { ME } from '../../data/mock.js';

function usePost(id) {
  const { state } = useStore();
  const raw = state.posts.find((p) => p.id === id && p.creatorId === ME);
  return raw ? enrich(raw, state.benchmarks) : null;
}

function headline(p) {
  if (p.status === 'draft') return { tag: 'Estimated L-Potential', line: p.under ? 'This cut would qualify once published.' : 'This cut would not qualify yet.' };
  if (p.status === 'review') return { tag: 'Pending verification', line: p.under ? 'Under the L line. The L Mark is issued once we verify the post.' : 'Over the L line. We are still verifying the inputs.' };
  if (p.status === 'qualified') return { tag: 'L-Earned', line: 'Verified and under the L line. This post earned an L.' };
  if (p.status === 'rejected') return { tag: 'Rejected', line: 'The inputs could not be verified. See the reviewer note below.' };
  return { tag: 'Not qualified', line: 'Verified, but over the L line for this market and format.' };
}

function lighterOptions(p) {
  const out = [];
  const perSec = p.score / p.secs;
  const maxSecs = Math.floor(p.line / perSec);
  if (!p.under && maxSecs >= 5) out.push({ t: `Cut to ${maxSecs} s`, d: `Keeps the story, lands at ${fmt(lScore({ ...p, secs: maxSecs }))}.` });
  const order = Object.keys(RESOLUTIONS);
  const i = order.indexOf(p.res);
  if (i > 0) {
    const lower = order[i - 1];
    out.push({ t: `Export at ${lower}`, d: `Same length, lands at ${fmt(lScore({ ...p, res: lower }))}.` });
  }
  if (p.secs >= 40) out.push({ t: `Try a ${Math.round(p.secs / 2)} s cut`, d: `Half the seconds, about half the score: ${fmt(lScore({ ...p, secs: Math.round(p.secs / 2) }))}.` });
  return out.slice(0, 3);
}

export function PostDetail({ id }) {
  const { state } = useStore();
  const p = usePost(id);
  const [share, setShare] = useState(false);
  if (!p) return <Empty title="Post not found" body="It may have been removed when the demo was reset." action={<Button as="a" href={href('studio-posts')}>Back to My posts</Button>} />;
  const h = headline(p);
  const campaign = p.campaignId && state.campaigns.find((c) => c.id === p.campaignId);
  const canReceipt = p.status !== 'draft' && p.status !== 'rejected' && p.under;
  const opts = lighterOptions(p);
  return (
    <div className="flex flex-col gap-6">
      <a href={href('studio-posts')} className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-mute hover:text-ink"><ArrowLeft size={16} /> My posts</a>
      <div className="flex items-start gap-4">
        <Thumb index={p.thumb} secs={p.secs} className="h-[86px] w-[60px]" label={p.title} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="display text-[24px] font-extrabold leading-tight sm:text-[30px]">{p.title}</h1>
          <span className="text-[14px] text-mute">{p.platform} · {MARKETS[p.market].name} · submitted {p.submitted}{campaign ? ` · ${campaign.name}` : ''}</span>
          <span><StatusPill status={p.status} /></span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className={cx('flex flex-col gap-6 overflow-hidden p-6 sm:p-8', p.status === 'qualified' && 'border-ink')}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className={cx('inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wider', p.status === 'qualified' ? 'bg-brand text-ink' : p.status === 'draft' ? 'border border-dashed border-ink/40 text-ink' : 'bg-paper text-ink')}>
                {p.status === 'qualified' && <LGlyph size={13} />}{h.tag}
              </span>
              <span className="mt-3 flex items-baseline gap-2">
                <span className="display text-[72px] font-black leading-[0.9] tnum sm:text-[88px]">{fmt(p.score)}</span>
              </span>
              <span className="font-mono text-[13px] text-mute">g CO₂e per 1,000 views</span>
            </div>
            {p.status !== 'draft' && (
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="eyebrow">Views</span>
                <span className="display text-[28px] font-extrabold tnum">{fmt(p.views)}</span>
              </div>
            )}
          </div>
          <ScoreBar score={p.score} line={p.line} />
          <p className="text-[15px]">{h.line}</p>
          <div className="flex flex-wrap gap-2">
            {canReceipt && <Button as="a" href={href(`studio-receipt-${p.id}`)}><ReceiptIcon size={17} /> View Impact Receipt</Button>}
            {p.status === 'qualified' && <Button variant="brand" onClick={() => setShare(true)}><Share2 size={17} /> Share your L Mark</Button>}
            {p.status === 'draft' && <Button onClick={() => go('studio-submit')}>Submit once published <ArrowRight size={16} /></Button>}
          </div>
          {p.status === 'review' && (
            <div className="flex items-start gap-3 rounded-xl bg-paper p-4 text-[14px]">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <span>Demo tip: switch to <a className="font-semibold underline" href={href('admin-review')}>Admin Console › Submission review</a> to approve this post, then come back to see the L Mark.</span>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-1 p-5">
            <span className="eyebrow mb-2">Key factors</span>
            {factors(p).map((f) => (
              <div key={f.key} className="flex flex-col gap-0.5 border-t border-line py-3 first:border-0 first:pt-0">
                <div className="flex justify-between gap-3 text-[14px]"><span className="text-mute">{f.key}</span><b className="text-right font-mono text-[13px]">{f.value}</b></div>
                <span className="text-[12px] text-mute">{f.note}</span>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-line pt-3 text-[14px]"><span className="text-mute">L line</span><b className="font-mono text-[13px]">{fmt(p.line)} · {FORMATS[p.format].name.toLowerCase()}</b></div>
          </Card>
          {opts.length > 0 && (
            <Card className="flex flex-col gap-3 p-5">
              <span className="eyebrow">{p.under ? 'Make it even lighter' : 'Ways to get under the line'}</span>
              {opts.map((o) => (
                <div key={o.t} className="flex gap-3"><LGlyph size={18} className="mt-0.5 shrink-0 text-brand-deep" /><div className="text-[14px]"><b>{o.t}.</b> <span className="text-mute">{o.d}</span></div></div>
              ))}
            </Card>
          )}
          {p.notes.length > 0 && (
            <Card className="flex flex-col gap-2 p-5">
              <span className="eyebrow">Reviewer notes</span>
              {p.notes.map((n, i) => <p key={i} className="text-[14px]"><span className="font-mono text-[12px] text-mute">{n.date}</span> {n.text}</p>)}
            </Card>
          )}
          {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 self-start text-[13px] text-mute hover:text-ink"><ExternalLink size={14} /> Open the post (demo link)</a>}
        </div>
      </div>
      <DemoNote />
      <ShareModal open={share} onClose={() => setShare(false)} p={p} />
    </div>
  );
}

function ShareModal({ open, onClose, p }) {
  const { notify } = useStore();
  const [copied, setCopied] = useState(false);
  const caption = `Took the L on this one: ${fmt(p.score)} g CO₂e per 1,000 views, under the ${fmt(p.line)} L line. Same story, lighter post. #TakingTheL #LMark`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      notify('Caption copied');
    } catch (e) {
      const el = document.getElementById('share-caption');
      el?.select();
      notify('Select the caption and copy it', 'bad');
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Share your L Mark">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4 rounded-2xl bg-ink p-5 text-white">
          <LBox size={56} />
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">L Mark · verified</span>
            <span className="display text-[30px] font-black leading-none tnum">{fmt(p.score)}</span>
            <span className="font-mono text-[11px] text-white/60">g CO₂e / 1k views · line {fmt(p.line)}</span>
          </div>
        </div>
        <label className="label" htmlFor="share-caption">Caption</label>
        <textarea id="share-caption" readOnly className="input h-28 resize-none text-[14px]" value={caption} />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" as="a" href={href(`studio-receipt-${p.id}`)} onClick={onClose}>Open receipt</Button>
          <Button onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy caption'}</Button>
        </div>
      </div>
    </Modal>
  );
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'review', label: 'Under review' },
  { value: 'not', label: 'Not qualified' },
];

export function MyPosts() {
  const { state } = useStore();
  const [filter, setFilter] = useState(() => {
    try { return sessionStorage.getItem('lp.postsFilter') || 'all'; } catch (e) { return 'all'; }
  });
  const choose = (v) => { setFilter(v); try { sessionStorage.setItem('lp.postsFilter', v); } catch (e) { /* ignore */ } };
  const all = state.posts.filter((p) => p.creatorId === ME).map((p) => enrich(p, state.benchmarks)).sort((a, b) => b.submitted.localeCompare(a.submitted));
  const match = (p) => filter === 'all' || p.status === filter || (filter === 'not' && p.status === 'rejected');
  const rows = all.filter(match);
  const count = (v) => all.filter((p) => v === 'all' || p.status === v || (v === 'not' && p.status === 'rejected')).length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="eyebrow">My posts</span>
          <h1 className="display text-[28px] font-extrabold leading-none sm:text-[34px]">Every post, weighed</h1>
        </div>
        <Button as="a" href={href('studio-submit')}>Submit a video</Button>
      </div>
      <Seg label="Filter posts" value={filter} onChange={choose} options={FILTERS.map((f) => ({ value: f.value, label: `${f.label} ${count(f.value)}` }))} />
      {rows.length === 0 ? (
        <Empty title="Nothing here yet" body={filter === 'review' ? 'No posts are waiting for verification.' : 'No posts match this filter.'} action={<Button variant="outline" onClick={() => choose('all')}>Show all posts</Button>} />
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-[14px] tnum">
              <thead className="bg-paper text-left text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Video</th>
                  <th className="px-2 py-3 font-medium">Platform</th>
                  <th className="px-2 py-3 text-right font-medium">Views</th>
                  <th className="px-2 py-3 text-right font-medium">L-Score</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="cursor-pointer border-t border-line hover:bg-paper" onClick={() => go(`studio-post-${p.id}`)}>
                    <td className="px-4 py-3">
                      <a href={href(`studio-post-${p.id}`)} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <Thumb index={p.thumb} secs={p.secs} className="h-12 w-[34px]" />
                        <span className="font-semibold">{p.title}</span>
                      </a>
                    </td>
                    <td className="px-2 py-3">{p.platform}</td>
                    <td className="px-2 py-3 text-right font-mono">{p.type === 'draft' ? '–' : fmt(p.views)}</td>
                    <td className="px-2 py-3 text-right font-mono"><b>{fmt(p.score)}</b><span className="text-mute"> / {fmt(p.line)}</span></td>
                    <td className="px-2 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-right font-mono text-[13px] text-mute">{p.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="grid gap-2 md:hidden">
            {rows.map((p) => (
              <a key={p.id} href={href(`studio-post-${p.id}`)} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                <Thumb index={p.thumb} secs={p.secs} className="h-16 w-11" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[15px] font-semibold">{p.title}</span>
                  <span className="text-[12px] text-mute">{p.platform} · {p.submitted}{p.type !== 'draft' ? ` · ${compact(p.views)} views` : ''}</span>
                  <span className="flex items-center gap-2"><StatusPill status={p.status} /><span className="font-mono text-[12px]"><b>{fmt(p.score)}</b><span className="text-mute"> / {fmt(p.line)}</span></span></span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Receipt({ id }) {
  const { state, notify } = useStore();
  const p = usePost(id);
  const [busy, setBusy] = useState(false);
  const [share, setShare] = useState(false);
  if (!p) return <Empty title="Receipt not found" body="It may have been removed when the demo was reset." action={<Button as="a" href={href('studio-posts')}>Back to My posts</Button>} />;
  const me = state.creators.find((c) => c.id === ME);
  const verified = p.status === 'qualified';
  const download = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); notify('Receipt saved as PNG (demo)'); }, 1100);
  };
  const rows = [
    ['Views', fmt(p.views)],
    ['L-Score', `${fmt(p.score)} g / 1k views`],
    ['L line', `${fmt(p.line)} · ${MARKETS[p.market].name}`],
    ['Format', `${p.secs} s · ${p.res} · ${p.platform}`],
    ['Status', verified ? 'Qualified · L-Earned' : 'Pending verification'],
    ['Date verified', p.verified || '–'],
  ];
  return (
    <div className="flex flex-col gap-6">
      <a href={href(`studio-post-${p.id}`)} className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-mute hover:text-ink"><ArrowLeft size={16} /> Back to result</a>
      <div className="grid items-start gap-8 lg:grid-cols-[420px_1fr]">
        <article aria-label="Impact Receipt" className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#BDBDBD]/60 bg-ink text-paper shadow-[0_20px_40px_-24px_rgba(13,13,13,.5)]">
          <div className="flex items-center justify-between border-b border-dashed border-[#BDBDBD]/50 px-6 py-4 text-white">
            <span className="flex items-center gap-2"><LBox size={26} /><b className="display text-[16px]">L Platform</b></span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">Impact Receipt</span>
          </div>
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-center gap-4">
              <Thumb index={p.thumb} secs={p.secs} className="h-[92px] w-[64px]" label={p.title} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/55">{me.name} · {me.handle}</span>
                <b className="text-[17px] leading-snug">{p.title}</b>
              </div>
            </div>
            <div className="flex items-end justify-between rounded-xl bg-white/[0.06] p-4">
              <div className="flex flex-col">
                <span className="eyebrow text-white/55">L-Score</span>
                <span className="display text-[56px] font-black leading-[0.9] text-brand-text tnum">{fmt(p.score)}</span>
                <span className="font-mono text-[11px] text-white/55">g CO₂e / 1,000 views</span>
              </div>
              <div className={cx('flex flex-col items-center gap-1 rounded-xl px-3 py-2', verified ? 'bg-brand text-ink' : 'border border-dashed border-white/40')}>
                <LGlyph size={30} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{verified ? 'L-Earned' : 'Pending'}</span>
              </div>
            </div>
            <ScoreBar score={p.score} line={p.line} compact dark />
            <dl className="flex flex-col font-mono text-[13px]">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-dashed border-[#BDBDBD]/40 py-2 last:border-0">
                  <dt className="text-white/55">{k}</dt><dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="font-mono text-[10px] leading-relaxed text-white/45">Receipt {p.id.toUpperCase()} · L Standard {state.method.version}. Illustrative demo figures, not a validated carbon result.</p>
          </div>
          {!verified && <div className="pointer-events-none absolute right-5 top-20 rotate-12 rounded-md border-2 border-[#F2B84B] px-2 py-0.5 font-mono text-[12px] font-bold uppercase text-[#F2B84B]">Not yet verified</div>}
        </article>
        <div className="flex flex-col gap-4">
          <h1 className="display text-[28px] font-extrabold leading-tight">Your Impact Receipt</h1>
          <p className="max-w-md text-[15px] text-mute">Proof that this post landed under the L line. Post it to your story, pin it to the comments, or attach it to a campaign report.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={download} disabled={busy}>{busy ? <Spinner size={16} /> : <Download size={17} />} {busy ? 'Preparing…' : 'Download receipt'}</Button>
            <Button variant="brand" onClick={() => setShare(true)} disabled={!verified}><Share2 size={17} /> Share your L Mark</Button>
          </div>
          {!verified && <p className="text-[13px] text-warn">Sharing unlocks once the post is verified.</p>}
          <DemoNote>Download and share are simulated in this prototype.</DemoNote>
        </div>
      </div>
      <ShareModal open={share} onClose={() => setShare(false)} p={p} />
    </div>
  );
}
