import React, { useState } from 'react';
import { Search, ArrowLeft, Award } from 'lucide-react';
import { Avatar, Card, Empty, LProgress, PageHead, Stat, StatusPill, Thumb, DemoNote, Button } from '../../components/ui.jsx';
import { useStore, creatorStats } from '../../lib/store.jsx';
import { href, go } from '../../lib/router.js';
import { MARKETS, fmt } from '../../lib/score.js';
import { L_CREATOR_TARGET, QUARTER } from '../../data/mock.js';

export function CreatorsAdmin() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const rows = state.creators
    .map((c) => ({ c, s: creatorStats(state, c.id) }))
    .filter(({ c }) => !q || `${c.name} ${c.handle} ${MARKETS[c.market].name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.s.qualifiedQ - a.s.qualifiedQ || a.c.name.localeCompare(b.c.name));
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Creators" title="Creators" sub="Profiles and post counts. Creators have no L-Score; only their posts do." />
      <label className="relative max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" /><input className="input pl-9" placeholder="Search name, handle or market" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search creators" /></label>
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <thead className="bg-paper text-[11px] uppercase tracking-wider text-mute">
              <tr>{['Creator', 'Market', 'Accounts', 'Joined', 'Submitted', 'Pending', 'Rejected', `Qualifying ${QUARTER.label}`, 'L Creator'].map((h) => <th key={h} className="whitespace-nowrap px-3 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(({ c, s }) => (
                <tr key={c.id} className="cursor-pointer border-t border-line hover:bg-paper/70" onClick={() => go(`admin-creator-${c.id}`)}>
                  <td className="px-3 py-2.5"><a href={href(`admin-creator-${c.id}`)} className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}><Avatar name={c.name} src={c.avatar} size={30} /><span className="flex flex-col leading-tight"><b className="hover:underline">{c.name}</b><span className="text-[12px] text-mute">{c.handle}</span></span></a></td>
                  <td className="px-3 py-2.5">{MARKETS[c.market].name}</td>
                  <td className="px-3 py-2.5 text-[13px]">{(c.accounts || []).map((a) => a.platform).join(', ')}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px]">{c.joined}</td>
                  <td className="px-3 py-2.5 font-mono">{s.total}</td>
                  <td className="px-3 py-2.5 font-mono">{s.pending}</td>
                  <td className="px-3 py-2.5 font-mono">{s.rejected}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold">{s.qualifiedQ}/{L_CREATOR_TARGET}</td>
                  <td className="px-3 py-2.5">{s.qualifiedQ >= L_CREATOR_TARGET ? <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[12px] font-semibold text-gold-deep"><Award size={12} /> Yes</span> : <span className="text-mute">–</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title="No creators match" />}
      <DemoNote>Sample creators for the prototype.</DemoNote>
    </div>
  );
}

export function CreatorDetail({ id }) {
  const { state } = useStore();
  const c = state.creators.find((x) => x.id === id);
  if (!c) return <Empty title="Creator not found" action={<Button as="a" href={href('admin-creators')}>All creators</Button>} />;
  const s = creatorStats(state, c.id);
  const posts = [...s.posts].sort((a, b) => b.submitted.localeCompare(a.submitted));
  return (
    <div className="flex flex-col gap-6">
      <a href={href('admin-creators')} className="inline-flex items-center gap-1 text-[13px] font-semibold text-mute hover:text-ink"><ArrowLeft size={14} /> Creators</a>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={c.name} src={c.avatar} size={64} />
        <div className="flex flex-col gap-0.5">
          <h1 className="display text-[28px] font-extrabold">{c.name}</h1>
          <span className="text-[14px] text-mute">{MARKETS[c.market].name} · {c.category} · joined {c.joined}</span>
          <span className="text-[13px]">{(c.accounts || []).map((a) => `${a.platform} ${a.handle}`).join(' · ')}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Submitted" value={s.total} />
        <Stat label="Qualifying" value={s.qualified} sub={`${s.qualifiedQ} this quarter`} />
        <Stat label="Not qualifying" value={s.notQualified} />
        <Stat label="Pending" value={s.pending} />
        <Stat label="Rejected" value={s.rejected} />
      </div>
      <Card className="flex flex-col gap-3 p-5">
        <span className="eyebrow">L Creator progress · {QUARTER.label}</span>
        <LProgress count={Math.min(s.qualifiedQ, L_CREATOR_TARGET)} />
      </Card>
      <Card className="divide-y divide-line">
        {posts.map((p) => (
          <a key={p.id} href={href(`admin-verification-${p.id}`)} className="flex items-center gap-3 p-3 hover:bg-paper">
            <Thumb index={p.thumb} status={p.status} className="h-12 w-10" play={false} label={p.title} />
            <span className="flex min-w-0 flex-1 flex-col leading-tight"><b className="truncate text-[14px]">{p.title}</b><span className="text-[12px] text-mute">{p.platform} · {p.submitted} · L-Score {fmt(p.score)} / line {fmt(p.line)}</span></span>
            <StatusPill status={p.status} className="hidden !text-[11px] sm:inline-flex" />
          </a>
        ))}
        {!posts.length && <p className="p-4 text-[14px] text-mute">No submissions yet.</p>}
      </Card>
    </div>
  );
}
