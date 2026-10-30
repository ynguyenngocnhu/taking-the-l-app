import React, { useState } from 'react';
import { Check, X, ExternalLink, StickyNote } from 'lucide-react';
import { Button, Card, PageHead, Empty, Thumb, ScoreBar, StatusPill, Avatar, DemoNote, Field, cx } from '../../components/ui.jsx';
import { useStore, enrich } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { fmt, MARKETS, RESOLUTIONS, PLATFORMS, ENERGY_KWH_PER_GB, FORMATS } from '../../lib/score.js';
import { ME } from '../../data/mock.js';

export default function Review() {
  const { state, dispatch, notify } = useStore();
  const queue = state.posts
    .filter((p) => p.status === 'review')
    .map((p) => enrich(p, state.benchmarks))
    .sort((a, b) => (b.creatorId === ME) - (a.creatorId === ME) || b.submitted.localeCompare(a.submitted));
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');
  const [done, setDone] = useState([]);
  const current = queue.find((p) => p.id === sel) || queue[0];
  const creator = current && state.creators.find((c) => c.id === current.creatorId);

  const decide = (decision) => {
    if (decision === 'reject' && !note.trim()) {
      notify('Add a note so the creator knows why', 'bad');
      document.getElementById('review-note')?.focus();
      return;
    }
    dispatch({ type: 'decide', id: current.id, decision, note: note.trim() });
    const outcome = decision === 'reject' ? 'Rejected' : current.under ? 'Approved: L Mark issued' : 'Approved: over the line, not qualified';
    setDone((d) => [{ id: current.id, title: current.title, creator: creator.name, outcome, creatorId: current.creatorId }, ...d].slice(0, 5));
    notify(outcome);
    setNote('');
    const next = queue.find((p) => p.id !== current.id);
    setSel(next ? next.id : null);
  };

  const addNote = () => {
    if (!note.trim()) return;
    dispatch({ type: 'note', id: current.id, text: note.trim() });
    setNote('');
    notify('Internal note added');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Submission review" title={queue.length ? `${queue.length} waiting for verification` : 'Review queue'} sub="Check the inputs against the live post, then approve or reject. Approval issues the L Mark when the score is under the line." />
      {!current ? (
        <Empty title="All caught up" body="No submissions are waiting. New ones appear here as creators submit." action={<Button variant="outline" as="a" href={href('admin')}>Back to overview</Button>} />
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[320px_1fr]">
          <Card className="overflow-hidden">
            <div className="scroll-x flex gap-2 p-2 xl:flex-col xl:gap-0 xl:p-0">
              {queue.map((p) => {
                const c = state.creators.find((x) => x.id === p.creatorId);
                const on = p.id === current.id;
                return (
                  <button key={p.id} type="button" onClick={() => { setSel(p.id); setNote(''); }} aria-pressed={on} className={cx('flex w-[240px] shrink-0 items-center gap-3 rounded-xl p-3 text-left xl:w-auto xl:rounded-none xl:border-b xl:border-line', on ? 'bg-ink text-white' : 'hover:bg-paper')}>
                    <Thumb index={p.thumb} secs={p.secs} className="h-12 w-[34px]" />
                    <span className="flex min-w-0 flex-col">
                      <b className="truncate text-[14px]">{p.title}</b>
                      <span className={cx('truncate text-[12px]', on ? 'text-white/60' : 'text-mute')}>{c.name} · {p.submitted}</span>
                    </span>
                    {p.creatorId === ME && <span className="ml-auto rounded-full bg-lime px-1.5 text-[10px] font-bold text-ink">NEW</span>}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="flex min-w-0 flex-col gap-6 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <Thumb index={current.thumb} secs={current.secs} className="h-[100px] w-[70px]" label={current.title} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h2 className="display text-[22px] font-extrabold leading-tight">{current.title}</h2>
                <a href={href(`admin-creator-${creator.id}`)} className="flex flex-wrap items-center gap-x-2 text-[14px] hover:underline"><Avatar name={creator.name} size={22} /><b>{creator.name}</b><span className="text-mute">{creator.handle}</span></a>
                <a href={current.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1 text-[13px] text-mute hover:text-ink"><ExternalLink size={13} className="shrink-0" /><span className="truncate">{current.url}</span></a>
                <span><StatusPill status="review" /></span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="eyebrow">Submitted inputs</span>
                <dl className="divide-y divide-line rounded-xl border border-line text-[14px]">
                  {[
                    ['Platform', current.platform],
                    ['Duration', `${current.secs} s (${FORMATS[current.format].name.toLowerCase()})`],
                    ['Resolution', current.res],
                    ['Views', fmt(current.views)],
                    ['Market', MARKETS[current.market].name],
                    ['Campaign', current.campaignId ? state.campaigns.find((k) => k.id === current.campaignId)?.name : 'None'],
                  ].map(([k, v]) => <div key={k} className="flex justify-between gap-3 px-3 py-2"><dt className="text-mute">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
                </dl>
              </div>
              <div className="flex flex-col gap-2">
                <span className="eyebrow">L Standard assumptions</span>
                <dl className="divide-y divide-line rounded-xl border border-line font-mono text-[13px]">
                  {[
                    ['Bitrate', `${RESOLUTIONS[current.res].mbps} Mbps`],
                    ['Platform factor', `×${PLATFORMS[current.platform].factor}`],
                    ['Energy', `${ENERGY_KWH_PER_GB} kWh / GB`],
                    ['Grid', `${MARKETS[current.market].grid} g / kWh`],
                    ['L line', fmt(current.line)],
                  ].map(([k, v]) => <div key={k} className="flex justify-between gap-3 px-3 py-2"><dt className="font-sans text-mute">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                </dl>
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-paper p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="eyebrow">Calculated L-Score</span>
                <span className={cx('text-[13px] font-semibold', current.under ? 'text-lime-deep' : 'text-bad')}>{current.under ? 'Under the line: approval issues an L Mark' : 'Over the line: approval records not qualified'}</span>
              </div>
              <span className="display text-[44px] font-black leading-none tnum">{fmt(current.score)}</span>
              <ScoreBar score={current.score} line={current.line} />
            </div>

            {current.notes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="eyebrow">Internal notes</span>
                {current.notes.map((n, i) => <p key={i} className="text-[14px]"><span className="font-mono text-[12px] text-mute">{n.date} · {n.by}</span><br />{n.text}</p>)}
              </div>
            )}

            <Field label="Internal note" htmlFor="review-note" hint="Required to reject. Shared with the creator if you reject.">
              <textarea id="review-note" className="input h-20 resize-none text-[14px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Views match the post. Duration checked at 30 s." />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => decide('approve')}><Check size={17} /> Approve</Button>
              <Button variant="danger" onClick={() => decide('reject')}><X size={17} /> Reject</Button>
              <Button variant="ghost" onClick={addNote} disabled={!note.trim()}><StickyNote size={16} /> Save note only</Button>
            </div>
          </Card>
        </div>
      )}
      {done.length > 0 && (
        <Card className="flex flex-col gap-2 p-5">
          <span className="eyebrow">Decided this session</span>
          {done.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 text-[14px] first:border-0 first:pt-0">
              <span><b>{d.title}</b> <span className="text-mute">· {d.creator}</span></span>
              <span className="flex items-center gap-3">
                <span className="text-mute">{d.outcome}</span>
                {d.creatorId === ME && <a className="font-semibold underline" href={href(`studio-post-${d.id}`)}>See it in Creator Studio</a>}
              </span>
            </div>
          ))}
        </Card>
      )}
      <DemoNote />
    </div>
  );
}
