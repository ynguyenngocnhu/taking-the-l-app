import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ShieldCheck, Share2, Upload, Scissors, AlertTriangle, Clock, Send } from 'lucide-react';
import { Button, Card, Empty, Field, LMark, PageHead, ScoreBar, Seg, StatusPill, Thumb, DemoNote, cx } from '../../components/ui.jsx';
import { CampaignTag, Receipts, ShareCardModal, contextLabel } from '../../components/PostBits.jsx';
import { useStore, useMe, enrich, campaignLabel } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { fmt, compact, MARKETS, FORMATS, lScore, lineFor } from '../../lib/score.js';
import { platformFromUrl } from '../../lib/lookup.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'qualified', label: 'Qualifying' },
  { value: 'not', label: 'Not qualifying' },
  { value: 'rejected', label: 'Rejected' },
];

export function qualification(p) {
  return {
    qualified: 'Qualifies · L Mark',
    not: 'Above the L line',
    review: 'Not decided yet',
    info: 'Not decided yet',
    rejected: 'Not eligible',
  }[p.status];
}

function pending(p) {
  return p.status === 'review' || p.status === 'info';
}

function ScoreCell({ p }) {
  if (p.status === 'rejected') return <span className="text-mute">–</span>;
  if (pending(p)) return <span className="font-mono text-mute" title="Estimate until verified">est. {fmt(p.score)}</span>;
  return <b className="font-mono tnum">{fmt(p.score)}</b>;
}

export function MyPosts() {
  const { state } = useStore();
  const me = useMe();
  const [filter, setFilter] = useState('all');
  const posts = useMemo(() => state.posts
    .filter((p) => p.creatorId === me.id)
    .map((p) => enrich(p, state.benchmarks))
    .sort((a, b) => b.submitted.localeCompare(a.submitted)), [state.posts, state.benchmarks, me.id]);
  const list = posts.filter((p) => filter === 'all' || (filter === 'pending' ? pending(p) : p.status === filter));
  const count = (v) => (v === 'all' ? posts.length : posts.filter((p) => (v === 'pending' ? pending(p) : p.status === v)).length);

  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="My Posts" title="Submitted posts" sub="Every post you have submitted, its L-Score against its L line, and where it is in verification." actions={<Button variant="brand" as="a" href={href('studio-submit')}><Upload size={16} /> Submit a post</Button>} />
      <Seg label="Filter by status" value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f.value, label: `${f.label} ${count(f.value)}` }))} />
      {!list.length ? (
        <Empty title="Nothing here" body="No posts with this status." />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-line lg:block">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-paper text-[11px] uppercase tracking-wider text-mute">
                <tr>
                  <th className="px-3 py-3">Post</th><th className="px-3 py-3">Platform · date</th><th className="px-3 py-3">Campaign</th>
                  <th className="px-3 py-3 text-right">L-Score</th><th className="px-3 py-3 text-right">L line</th><th className="px-3 py-3">Verification</th><th className="px-3 py-3">Qualification</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t border-line align-middle hover:bg-paper/60">
                    <td className="max-w-[280px] px-3 py-2.5">
                      <a href={href(`studio-post-${p.id}`)} className="flex items-center gap-3">
                        <Thumb index={p.thumb} secs={p.secs} status={p.status} mark="sm" className="h-16 w-12" label={p.title} play={false} />
                        <span className="flex min-w-0 flex-col">
                          <b className="truncate text-[14px] hover:underline">{p.title}</b>
                          <span className="truncate font-mono text-[11px] text-mute">{p.url.replace(/^https:\/\//, '')}</span>
                        </span>
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{p.platform}<br /><span className="text-mute">{p.submitted}</span></td>
                    <td className="max-w-[170px] px-3 py-2.5"><CampaignTag name={campaignLabel(state, p)} /></td>
                    <td className="px-3 py-2.5 text-right"><ScoreCell p={p} /></td>
                    <td className="px-3 py-2.5 text-right font-mono text-mute">{fmt(p.line)}</td>
                    <td className="px-3 py-2.5"><StatusPill status={p.status} className="!text-[11px]" /></td>
                    <td className={cx('whitespace-nowrap px-3 py-2.5 font-semibold', p.status === 'qualified' ? 'text-gold-deep' : 'text-mute')}>
                      <span className="inline-flex items-center gap-1.5">{p.status === 'qualified' && <LMark size={16} />}{qualification(p)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 lg:hidden">
            {list.map((p) => (
              <a key={p.id} href={href(`studio-post-${p.id}`)} className="flex gap-3 rounded-2xl border border-line p-3">
                <Thumb index={p.thumb} secs={p.secs} status={p.status} mark="sm" className="h-[104px] w-[78px]" label={p.title} play={false} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <b className="line-clamp-2 text-[14px] leading-snug">{p.title}</b>
                  <span className="truncate text-[12px] text-mute">{p.platform} · {p.submitted}</span>
                  <CampaignTag name={campaignLabel(state, p)} className="self-start" />
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                    <span>L-Score <ScoreCell p={p} /></span>
                    <span className="text-mute">line {fmt(p.line)}</span>
                  </span>
                  <StatusPill status={p.status} className="self-start !px-2 !py-0.5 !text-[11px]" />
                </span>
              </a>
            ))}
          </div>
        </>
      )}
      <DemoNote>Sample data. Scores and L lines are illustrative.</DemoNote>
    </div>
  );
}

function Detail({ k, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line py-2.5 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-[13px] text-mute">{k}</dt>
      <dd className="min-w-0 break-words text-[14px] font-semibold sm:text-right">{children}</dd>
    </div>
  );
}

function WhyNot({ p }) {
  const { state } = useStore();
  const perSec = p.score / p.secs;
  // Longest cut that would come in at or under the line for its own format.
  let target = null;
  for (let s = p.secs - 1; s >= 5; s--) {
    if (lScore({ ...p, secs: s }) <= lineFor(state.benchmarks, p.market, s)) { target = s; break; }
  }
  const lowerRes = p.res !== '720p' ? lScore({ ...p, res: '720p' }) : null;
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="text-[17px] font-bold">Why this post did not qualify</h2>
      <p className="text-[14px] text-ink-2">Its L-Score of {fmt(p.score)} g is {fmt(p.score - p.line)} g ({Math.round((p.score / p.line - 1) * 100)}%) above the {fmt(p.line)} g L line for {contextLabel(p)}. The score is official, but only posts at or below the line carry the L Mark.</p>
      <ul className="flex flex-col gap-2 text-[14px]">
        {target && <li className="flex items-start gap-2"><Scissors size={16} className="mt-0.5 shrink-0" /> A {target} s cut would have come in at about {fmt(Math.round(perSec * target))} g, under its line.</li>}
        {lowerRes && <li className="flex items-start gap-2"><Scissors size={16} className="mt-0.5 shrink-0" /> Publishing at 720p instead of {p.res} would estimate at {fmt(lowerRes)} g.</li>}
      </ul>
    </Card>
  );
}

function InfoReply({ p }) {
  const { dispatch, notify } = useStore();
  const [url, setUrl] = useState(p.url);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const send = () => {
    if (!platformFromUrl(url)) return setErr('Paste a full TikTok, Instagram or YouTube link');
    if (!text.trim()) return setErr('Add a short reply for the verification team');
    dispatch({ type: 'resubmit', id: p.id, changes: { url: url.trim() }, text: text.trim() });
    notify('Sent back for verification');
  };
  return (
    <Card className="flex flex-col gap-3 border-warn/40 p-5">
      <h2 className="flex items-center gap-2 text-[17px] font-bold text-warn"><AlertTriangle size={18} /> The verification team needs more information</h2>
      <Field label="Post link" htmlFor="ir-url"><input id="ir-url" className="input font-mono text-[13px]" value={url} onChange={(e) => { setUrl(e.target.value); setErr(''); }} /></Field>
      <Field label="Your reply" htmlFor="ir-text" error={err}><textarea id="ir-text" className="input h-20 resize-none" value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} placeholder="For example: the post is public now." /></Field>
      <Button className="self-start" onClick={send}><Send size={16} /> Send and resubmit</Button>
    </Card>
  );
}

export function PostDetail({ id }) {
  const { state } = useStore();
  const me = useMe();
  const [share, setShare] = useState(false);
  const raw = state.posts.find((p) => p.id === id && p.creatorId === me.id);
  if (!raw) return <Empty title="Post not found" action={<Button as="a" href={href('studio-posts')}>My Posts</Button>} />;
  const p = enrich(raw, state.benchmarks);
  const campaign = campaignLabel(state, p);
  const q = p.status === 'qualified';

  return (
    <div className="flex flex-col gap-6">
      <a href={href('studio-posts')} className="inline-flex items-center gap-1 text-[13px] font-semibold text-mute hover:text-ink"><ArrowLeft size={14} /> My Posts</a>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-3">
          <Thumb index={p.thumb} secs={p.secs} status={p.status} mark="lg" className="aspect-[4/5] w-full max-w-[340px] rounded-2xl" label={p.title} />
          {q && <p className="flex items-center gap-2 text-[13px] text-mute"><LMark size={18} /> Shown on your post in the L gallery and on its verification page.</p>}
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2"><StatusPill status={p.status} /><CampaignTag name={campaign} /></div>
            <h1 className="display text-[28px] font-extrabold leading-tight sm:text-[34px]">{p.title}</h1>
          </div>

          {q && (
            <Card className="flex flex-col gap-4 border-gold/60 p-5">
              <div className="flex items-center gap-3"><LMark size={44} /><div className="flex flex-col"><b className="text-[17px]">This post carries the L Mark</b><span className="text-[13px] text-mute">Verification {p.vid} · {p.verified}</span></div></div>
              <div className="flex flex-wrap gap-2">
                <Button variant="brand" onClick={() => setShare(true)}><Share2 size={16} /> Share verified post card</Button>
                <Button variant="outline" as="a" href={href(`verify-${p.vid}`)}><ShieldCheck size={16} /> Verification page</Button>
              </div>
            </Card>
          )}
          {pending(p) && (
            <Card className="flex items-start gap-3 border-dashed border-line-strong p-5">
              <Clock size={20} className="mt-0.5 shrink-0 text-warn" />
              <div className="flex flex-col gap-1 text-[14px]">
                <b className="text-[16px]">Pending verification · not complete</b>
                <span className="text-mute">The score below is an estimate from your submission. It becomes official, and the post can qualify for the L Mark, only after verification.</span>
              </div>
            </Card>
          )}
          {p.status === 'info' && <InfoReply p={p} />}
          {p.status === 'rejected' && (
            <Card className="flex flex-col gap-2 border-bad/40 p-5">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-bad"><AlertTriangle size={18} /> This post could not be verified</h2>
              <p className="text-[14px] text-ink-2">{p.notes.filter((n) => n.by !== 'Creator').slice(-1)[0]?.text || 'The post did not meet the verification checks.'}</p>
              <Button variant="outline" as="a" href={href('studio-submit')} className="self-start">Submit another post</Button>
            </Card>
          )}

          {p.status !== 'rejected' && (
            <Card className="flex flex-col gap-3 p-5">
              <div className="flex flex-wrap items-end gap-3">
                <span className={cx('display text-[48px] font-black leading-none tnum', pending(p) && 'text-mute')}>{fmt(p.score)}</span>
                <span className="pb-1 text-[14px] text-mute">{pending(p) ? 'Estimated L-Score · ' : 'L-Score · '}g CO₂e per 1,000 views</span>
              </div>
              <ScoreBar score={p.score} line={p.line} />
            </Card>
          )}
          {p.status === 'not' && <WhyNot p={p} />}

          <Card className="p-5">
            <dl className="flex flex-col [&>div:first-child]:border-0">
              <Detail k="Post link"><a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all font-mono text-[12px] underline">{p.url} <ArrowUpRight size={12} className="shrink-0" /></a></Detail>
              <Detail k="Platform">{p.platform}</Detail>
              <Detail k="Campaign">{campaign}</Detail>
              <Detail k="Market and format">{MARKETS[p.market].name} · {FORMATS[p.format].name}</Detail>
              <Detail k="L line">{fmt(p.line)} g · {state.benchmarkPeriod.label}</Detail>
              <Detail k="Inputs">{p.secs} s · {p.res} · {compact(p.views)} views{p.longSecs ? ` · long cut ${p.longSecs} s` : ''}</Detail>
              <Detail k="Submitted">{p.submitted}</Detail>
              <Detail k="Verified">{p.verified || 'Not yet'}</Detail>
              {p.vid && <Detail k="Verification ID"><a href={href(`verify-${p.vid}`)} className="font-mono underline">{p.vid}</a></Detail>}
            </dl>
          </Card>

          {(q || p.status === 'not') && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[18px] font-bold">Impact receipts</h2>
              <Receipts p={p} benchmarks={state.benchmarks} />
            </section>
          )}

          {p.notes.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-[16px] font-bold">Notes</h2>
              {p.notes.map((n, i) => (
                <div key={i} className="rounded-xl bg-paper p-3 text-[14px]"><span className="text-[12px] text-mute">{n.by} · {n.date}</span><p>{n.text}</p></div>
              ))}
            </section>
          )}
        </div>
      </div>
      {q && <ShareCardModal open={share} onClose={() => setShare(false)} p={p} creator={me} campaign={campaign} />}
    </div>
  );
}
