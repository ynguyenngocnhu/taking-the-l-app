import React, { useMemo, useState } from 'react';
import { Check, X, ExternalLink, HelpCircle, Search, CheckCircle2, XCircle, CircleDashed, ArrowLeft } from 'lucide-react';
import { Avatar, Button, Card, Empty, Field, PageHead, ScoreBar, StatusPill, Thumb, DemoNote, cx } from '../../components/ui.jsx';
import { CampaignTag } from '../../components/PostBits.jsx';
import { useStore, enrich, campaignLabel } from '../../lib/store.jsx';
import { href, go } from '../../lib/router.js';
import { fmt, compact, MARKETS, PLATFORMS, FORMATS, RESOLUTIONS, ENERGY_KWH_PER_GB } from '../../lib/score.js';
import { ORGANIC } from '../../data/mock.js';
import { FilterSelect } from '../site/common.jsx';
import { STATUS_LABEL } from '../../components/ui.jsx';

export function Submissions({ campaign }) {
  const { state } = useStore();
  const [fl, setFl] = useState({ status: '', market: '', platform: '', campaign: campaign || '', q: '' });
  const set = (k) => (v) => setFl((x) => ({ ...x, [k]: v && v.target ? v.target.value : v }));
  const rows = useMemo(() => state.posts
    .map((p) => ({ ...enrich(p, state.benchmarks), creator: state.creators.find((c) => c.id === p.creatorId) }))
    .filter((p) => (!fl.status || p.status === fl.status)
      && (!fl.market || p.market === fl.market)
      && (!fl.platform || p.platform === fl.platform)
      && (!fl.campaign || (fl.campaign === 'organic' ? !p.campaignId : p.campaignId === fl.campaign))
      && (!fl.q || `${p.title} ${p.creator?.name} ${p.url} ${p.vid || ''}`.toLowerCase().includes(fl.q.toLowerCase())))
    .sort((a, b) => b.submitted.localeCompare(a.submitted) || b.id.localeCompare(a.id)), [state, fl]);
  const [n, setN] = useState(40);

  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Submissions" title="All submissions" sub="Every post submitted through Creator Studio, with its inputs and verification status." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:items-end">
        <label className="col-span-2 flex flex-col gap-1 md:col-span-1"><span className="text-[12px] font-semibold text-mute">Search</span>
          <span className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" /><input className="input h-10 pl-9 text-[14px]" value={fl.q} onChange={set('q')} placeholder="Title, creator, link, ID" /></span>
        </label>
        <FilterSelect id="a-status" label="Status" value={fl.status} onChange={set('status')} options={[['', 'All statuses'], ...Object.entries(STATUS_LABEL)]} />
        <FilterSelect id="a-market" label="Market" value={fl.market} onChange={set('market')} options={[['', 'All markets'], ...Object.entries(MARKETS).map(([k, m]) => [k, m.name])]} />
        <FilterSelect id="a-platform" label="Platform" value={fl.platform} onChange={set('platform')} options={[['', 'All platforms'], ...Object.keys(PLATFORMS).map((p) => [p, p])]} />
        <FilterSelect id="a-campaign" label="Campaign" value={fl.campaign} onChange={set('campaign')} options={[['', 'All'], ['organic', ORGANIC], ...state.campaigns.map((c) => [c.id, c.name])]} />
      </div>
      <p className="text-[13px] text-mute"><b className="text-ink">{rows.length}</b> submissions</p>
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[1080px] text-left text-[13px]">
            <thead className="bg-paper text-[11px] uppercase tracking-wider text-mute">
              <tr>{['Post', 'Creator · account', 'Platform', 'Market · format', 'Campaign', 'Inputs', 'Submitted', 'L-Score', 'L line', 'Status', 'Verification ID'].map((h) => <th key={h} className="whitespace-nowrap px-3 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(0, n).map((p) => (
                <tr key={p.id} className="cursor-pointer border-t border-line hover:bg-paper/70" onClick={() => go(`admin-verification-${p.id}`)}>
                  <td className="max-w-[220px] px-3 py-2"><span className="flex items-center gap-2"><Thumb index={p.thumb} status={p.status} className="h-11 w-9" play={false} label={p.title} /><a href={href(`admin-verification-${p.id}`)} className="truncate font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>{p.title}</a></span></td>
                  <td className="whitespace-nowrap px-3 py-2">{p.creator?.name}<br /><span className="text-mute">{p.creator?.accounts?.find((a) => a.platform === p.platform)?.handle || p.creator?.handle}</span></td>
                  <td className="px-3 py-2">{p.platform}</td>
                  <td className="whitespace-nowrap px-3 py-2">{MARKETS[p.market].name}<br /><span className="text-mute">{FORMATS[p.format].name}</span></td>
                  <td className="max-w-[150px] px-3 py-2"><CampaignTag name={campaignLabel(state, p)} /></td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[12px]">{p.secs}s · {p.res}<br /><span className="text-mute">{compact(p.views)} views</span></td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[12px]">{p.submitted}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{fmt(p.score)}</td>
                  <td className="px-3 py-2 text-right font-mono text-mute">{fmt(p.line)}</td>
                  <td className="px-3 py-2"><StatusPill status={p.status} className="!text-[11px]" /></td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-mute">{p.vid || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title="No submissions match" />}
      {n < rows.length && <Button variant="outline" className="self-center" onClick={() => setN(n + 40)}>Show more</Button>}
      <DemoNote>Sample data. Pending scores are estimates until verification.</DemoNote>
    </div>
  );
}

function accountCheck(p, creator) {
  const acc = creator.accounts?.find((a) => a.platform === p.platform);
  if (!acc) return { ok: false, text: `No ${p.platform} account on the creator’s profile` };
  if (p.platform === 'TikTok') {
    const ok = p.url.toLowerCase().includes(`@${acc.handle.replace('@', '').toLowerCase()}`);
    return { ok, text: ok ? `Link matches ${acc.handle}` : `Link does not show ${acc.handle}` };
  }
  return { ok: null, text: `Check the post is from ${acc.handle}` };
}

function Check3({ ok, children }) {
  const Icon = ok === true ? CheckCircle2 : ok === false ? XCircle : CircleDashed;
  return <li className={cx('flex items-start gap-2 text-[14px]', ok === false && 'text-bad')}><Icon size={17} className={cx('mt-0.5 shrink-0', ok === true ? 'text-ink' : ok === false ? 'text-bad' : 'text-mute')} />{children}</li>;
}

function Row({ k, children }) {
  return <div className="flex justify-between gap-4 border-t border-line py-2 text-[14px]"><span className="text-mute">{k}</span><span className="min-w-0 break-words text-right font-semibold">{children}</span></div>;
}

export function Verification({ id }) {
  const { state, dispatch, notify } = useStore();
  const queue = state.posts.filter((p) => p.status === 'review').sort((a, b) => a.submitted.localeCompare(b.submitted) || a.id.localeCompare(b.id));
  const raw = state.posts.find((p) => p.id === id) || queue[0];
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  if (!raw) return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Verification" title="Verification queue" />
      <Empty title="Nothing to verify" body="All submissions have a decision." action={<Button as="a" href={href('admin-submissions')}>All submissions</Button>} />
    </div>
  );

  const p = enrich(raw, state.benchmarks);
  const creator = state.creators.find((c) => c.id === p.creatorId);
  const acc = accountCheck(p, creator);
  const r = RESOLUTIONS[p.res];
  const mb = (p.secs * r.mbps) / 8;
  const open = p.status === 'review' || p.status === 'info';
  const campaign = p.campaignId ? state.campaigns.find((c) => c.id === p.campaignId) : null;
  const inCampaignMarket = !campaign || campaign.markets.includes(p.market);
  const joined = !campaign || creator.campaigns.includes(campaign.id);

  const decide = (decision) => {
    if ((decision === 'reject' || decision === 'info') && !note.trim()) return setErr(decision === 'reject' ? 'Add a reason for the creator' : 'Say what information is needed');
    dispatch({ type: 'decide', id: p.id, decision, note: note.trim() });
    const label = decision === 'approve' ? (p.under ? 'Verified · qualifying' : 'Verified · not qualifying') : decision === 'reject' ? 'Rejected' : 'Information requested';
    notify(`${p.title}: ${label}`);
    setNote(''); setErr('');
    const nextPost = queue.find((x) => x.id !== p.id);
    go(nextPost ? `admin-verification-${nextPost.id}` : 'admin-verification');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow={`Verification · ${queue.length} in queue`} title={p.title} actions={<StatusPill status={p.status} />} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_1fr_340px]">
        <Card className="hidden max-h-[70vh] flex-col overflow-y-auto p-2 xl:flex">
          <span className="eyebrow px-2 py-2">Queue</span>
          {queue.map((q) => (
            <a key={q.id} href={href(`admin-verification-${q.id}`)} className={cx('flex flex-col rounded-lg px-2 py-2 text-[13px]', q.id === p.id ? 'bg-ink text-white' : 'hover:bg-paper')}>
              <b className="truncate">{q.title}</b>
              <span className={cx('truncate text-[12px]', q.id === p.id ? 'text-white/60' : 'text-mute')}>{state.creators.find((c) => c.id === q.creatorId)?.name} · {q.submitted.slice(5)}</span>
            </a>
          ))}
          {!queue.length && <p className="px-2 text-[13px] text-mute">Empty</p>}
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-3">
              <Avatar name={creator.name} src={creator.avatar} size={40} />
              <div className="flex min-w-0 flex-col leading-tight"><a href={href(`admin-creator-${creator.id}`)} className="font-bold hover:underline">{creator.name}</a><span className="truncate text-[13px] text-mute">{(creator.accounts || []).map((a) => `${a.platform} ${a.handle}`).join(' · ')}</span></div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-mute">Post link</span>
              <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 break-all font-mono text-[13px] underline">{p.url} <ExternalLink size={13} className="shrink-0" /></a>
            </div>
            <ul className="flex flex-col gap-2 border-t border-line pt-3">
              <Check3 ok={acc.ok}>Account match: {acc.text}</Check3>
              <Check3 ok={null}>Public post: open the link and confirm it is live</Check3>
              <Check3 ok={inCampaignMarket && joined}>{campaign ? `Campaign: ${campaign.name}${!joined ? ' (creator has not joined)' : ''}${!inCampaignMarket ? ' (market not eligible)' : ''}` : `Campaign: ${ORGANIC}`}</Check3>
              <Check3 ok={null}>Metrics: confirm duration, resolution and views on the post</Check3>
            </ul>
          </Card>

          <Card className="flex flex-col gap-1 p-5">
            <h2 className="mb-1 text-[16px] font-bold">Inputs and calculation</h2>
            <Row k="Duration">{p.secs} s · {FORMATS[p.format].name}</Row>
            <Row k="Top resolution">{p.res} · {r.mbps} Mbps</Row>
            <Row k="Platform">{p.platform}</Row>
            <Row k="Views at submission">{fmt(p.views)}</Row>
            <Row k="Data per view">{mb.toFixed(1)} MB</Row>
            <Row k="Energy per GB">{ENERGY_KWH_PER_GB} kWh (Impact+)</Row>
            <Row k="Grid factor">{MARKETS[p.market].name} · {MARKETS[p.market].grid} g/kWh (Ember)</Row>
            {p.longSecs && <Row k="Long cut">{p.longSecs} s</Row>}
          </Card>

          {p.notes.length > 0 && (
            <Card className="flex flex-col gap-2 p-5">
              <h2 className="text-[16px] font-bold">Notes</h2>
              {p.notes.map((n, i) => <div key={i} className="rounded-xl bg-paper p-3 text-[14px]"><span className="text-[12px] text-mute">{n.by} · {n.date}</span><p>{n.text}</p></div>)}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 p-5">
            <span className="eyebrow">Result</span>
            <div className="flex items-end gap-2"><span className="display text-[40px] font-black leading-none tnum">{fmt(p.score)}</span><span className="pb-1 text-[13px] text-mute">g / 1,000 views</span></div>
            <ScoreBar score={p.score} line={p.line} />
            <p className="text-[14px]">{p.under ? 'If approved: verified and qualifying. The L Mark and a verification ID are issued.' : 'If approved: verified but not qualifying. A verification ID is issued, no L Mark.'}</p>
            {open ? (
              <>
                <Field label="Note to the creator" htmlFor="v-note" error={err} hint="Required to reject or request information.">
                  <textarea id="v-note" className="input h-20 resize-none text-[14px]" value={note} onChange={(e) => { setNote(e.target.value); setErr(''); }} />
                </Field>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => decide('approve')}><Check size={16} /> Approve</Button>
                  <Button variant="outline" onClick={() => decide('info')}><HelpCircle size={16} /> Request information</Button>
                  <Button variant="danger" onClick={() => decide('reject')}><X size={16} /> Reject</Button>
                </div>
                {p.status === 'info' && <p className="text-[12px] text-mute">Waiting for the creator. You can still decide now.</p>}
              </>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl bg-paper p-3 text-[14px]">
                <span>Decided on {p.verified}.</span>
                {p.vid && <a className="font-mono text-[13px] underline" href={href(`verify-${p.vid}`)}>{p.vid}</a>}
              </div>
            )}
          </Card>
          <a href={href('admin-submissions')} className="inline-flex items-center gap-1 text-[13px] font-semibold text-mute hover:text-ink"><ArrowLeft size={14} /> All submissions</a>
        </div>
      </div>
    </div>
  );
}
