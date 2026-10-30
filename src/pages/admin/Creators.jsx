import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Card, PageHead, Avatar, Empty, Stat, StatusPill, Thumb, LProgress, DemoNote, Button, cx } from '../../components/ui.jsx';
import { useStore, creatorStats } from '../../lib/store.jsx';
import { href, go } from '../../lib/router.js';
import { MARKETS, fmt, compact } from '../../lib/score.js';
import { L_CREATOR_TARGET, QUARTER } from '../../data/mock.js';

function StatusTag({ n }) {
  const on = n >= L_CREATOR_TARGET;
  return <span className={cx('whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold', on ? 'bg-gold text-ink' : 'bg-paper text-mute')}>{on ? 'L Creator' : `${n}/${L_CREATOR_TARGET} to L Creator`}</span>;
}

export function CreatorsAdmin() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [market, setMarket] = useState('all');
  const rows = state.creators
    .map((c) => ({ ...c, ...creatorStats(state, c.id) }))
    .filter((c) => (market === 'all' || c.market === market) && (`${c.name} ${c.handle}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Creator management" title="Creators" sub={`${state.creators.length} creators in the SAPMENA pilot. L Creator status counts ${QUARTER.label} only.`} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search creators</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input id="creator-search" className="input pl-9" placeholder="Search by name or handle" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Market</span>
          <select id="creator-market" className="input" value={market} onChange={(e) => setMarket(e.target.value)}>
            <option value="all">All markets</option>
            {Object.entries(MARKETS).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}
          </select>
        </label>
      </div>
      {rows.length === 0 ? <Empty title="No creators match" body="Try another name or market." /> : (
        <Card className="overflow-hidden">
          <div className="scroll-x">
            <table className="w-full min-w-[720px] text-[14px] tnum">
              <thead className="bg-paper text-left text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Creator</th>
                  <th className="px-2 py-3 font-medium">Social account</th>
                  <th className="px-2 py-3 font-medium">Market</th>
                  <th className="px-2 py-3 text-right font-medium">Submissions</th>
                  <th className="px-2 py-3 text-right font-medium">L posts</th>
                  <th className="px-4 py-3 font-medium">L Creator status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="cursor-pointer border-t border-line hover:bg-paper" onClick={() => go(`admin-creator-${c.id}`)}>
                    <td className="px-4 py-3"><a href={href(`admin-creator-${c.id}`)} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 font-semibold"><Avatar name={c.name} size={32} />{c.name}</a></td>
                    <td className="px-2 py-3 text-mute">{c.handle} <span className="text-[12px]">· {c.platform}</span></td>
                    <td className="px-2 py-3">{MARKETS[c.market].name}</td>
                    <td className="px-2 py-3 text-right font-mono">{c.total}</td>
                    <td className="px-2 py-3 text-right font-mono font-semibold">{c.qualified}</td>
                    <td className="px-4 py-3"><StatusTag n={c.qualifiedQ} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <DemoNote />
    </div>
  );
}

export function CreatorProfile({ id }) {
  const { state } = useStore();
  const c = state.creators.find((x) => x.id === id);
  if (!c) return <Empty title="Creator not found" action={<Button as="a" href={href('admin-creators')}>All creators</Button>} />;
  const s = creatorStats(state, id);
  const posts = [...s.posts].sort((a, b) => b.submitted.localeCompare(a.submitted));
  return (
    <div className="flex flex-col gap-6">
      <a href={href('admin-creators')} className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-mute hover:text-ink"><ArrowLeft size={16} /> All creators</a>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={c.name} size={64} />
        <div className="flex flex-col gap-1">
          <h1 className="display text-[30px] font-extrabold leading-none">{c.name}</h1>
          <span className="text-[14px] text-mute">{c.handle} · {c.platform} · {MARKETS[c.market].name} · joined {c.joined}</span>
        </div>
        <span className="sm:ml-auto"><StatusTag n={s.qualifiedQ} /></span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Submissions" value={s.total} />
        <Stat label="L posts" value={s.qualified} sub={`${s.qualifiedQ} in ${QUARTER.label}`} />
        <Stat label="Avg L-Score" value={s.avgScore ?? '–'} sub="g CO₂e / 1k views" />
        <Stat label="Views" value={compact(s.views)} />
      </div>
      <Card className="flex flex-col gap-3 p-5">
        <span className="eyebrow">{QUARTER.label} progress</span>
        <LProgress count={s.qualifiedQ} />
        <span className="text-[13px] text-mute">Campaigns: {c.campaigns.length ? c.campaigns.map((k) => state.campaigns.find((x) => x.id === k)?.name).join(', ') : 'none'}</span>
      </Card>
      <Card className="overflow-hidden">
        <div className="scroll-x">
          <table className="w-full min-w-[640px] text-[14px] tnum">
            <thead className="bg-paper text-left text-mute"><tr><th className="px-4 py-3 font-medium">Post</th><th className="px-2 py-3 text-right font-medium">Views</th><th className="px-2 py-3 text-right font-medium">L-Score / line</th><th className="px-2 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Submitted</th></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-2.5"><span className="flex items-center gap-3"><Thumb index={p.thumb} secs={p.secs} status={p.status} className="h-11 w-8" /><span className="flex flex-col"><b>{p.title}</b><span className="text-[12px] text-mute">{p.platform} · {p.secs} s · {p.res}</span></span></span></td>
                  <td className="px-2 py-2.5 text-right font-mono">{p.type === 'draft' ? '–' : fmt(p.views)}</td>
                  <td className="px-2 py-2.5 text-right font-mono"><b>{fmt(p.score)}</b><span className="text-mute"> / {fmt(p.line)}</span></td>
                  <td className="px-2 py-2.5"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-2.5 text-right font-mono text-[13px] text-mute">{p.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
