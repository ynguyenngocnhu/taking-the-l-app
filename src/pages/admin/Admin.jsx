import React from 'react';
import { BarChart3, Inbox, ClipboardCheck, Megaphone, SlidersHorizontal, Users, ArrowRight } from 'lucide-react';
import { AppHeader, SideLayout, ResetDemo } from '../../components/Shell.jsx';
import { Avatar, Card, PageHead, Stat, StatusPill, Thumb, DemoNote } from '../../components/ui.jsx';
import { useStore, creatorStats, inQuarter } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS } from '../../lib/score.js';
import { L_CREATOR_TARGET, QUARTER } from '../../data/mock.js';
import { Submissions, Verification } from './Verification.jsx';
import { CampaignsAdmin } from './Campaigns.jsx';
import { Benchmarks } from './Benchmarks.jsx';
import { CreatorsAdmin, CreatorDetail } from './Creators.jsx';

export default function Admin({ route }) {
  const { state } = useStore();
  const queue = state.posts.filter((p) => p.status === 'review').length;
  const pageKey = { '': 'overview', creator: 'creators' }[route.page] ?? route.page;
  const items = [
    { key: 'overview', label: 'Overview', Icon: BarChart3, to: 'admin' },
    { key: 'submissions', label: 'Submissions', Icon: Inbox, to: 'admin-submissions' },
    { key: 'verification', label: 'Verification', Icon: ClipboardCheck, to: 'admin-verification', badge: queue || null },
    { key: 'campaigns', label: 'Campaigns', Icon: Megaphone, to: 'admin-campaigns' },
    { key: 'benchmarks', label: 'Benchmarks', Icon: SlidersHorizontal, to: 'admin-benchmarks' },
    { key: 'creators', label: 'Creators', Icon: Users, to: 'admin-creators' },
  ];
  const user = (
    <span className="mt-2 flex items-center gap-2.5">
      <Avatar name="L Team" size={34} />
      <span className="flex flex-col leading-tight"><b className="text-[14px]">L verification team</b><span className="text-[12px] text-mute">Internal · demo</span></span>
    </span>
  );
  let body;
  switch (route.page) {
    case 'submissions': body = <Submissions campaign={route.id} />; break;
    case 'verification': body = <Verification id={route.id} />; break;
    case 'campaigns': body = <CampaignsAdmin />; break;
    case 'benchmarks': body = <Benchmarks />; break;
    case 'creators': body = <CreatorsAdmin />; break;
    case 'creator': body = <CreatorDetail id={route.id} />; break;
    default: body = <Overview />;
  }
  return (
    <>
      <AppHeader label="Admin Console" homeTo="admin" right={<a href={href('home')} className="text-[14px] text-white/70 hover:text-white">Public site</a>} />
      <SideLayout title="Admin Console" user={user} items={items} current={pageKey} footer={<ResetDemo />}>
        <div key={route.page + route.id} className="rise">{body}</div>
        <div className="mt-12 lg:hidden"><ResetDemo /></div>
      </SideLayout>
    </>
  );
}

function Overview() {
  const { state } = useStore();
  const n = (st) => state.posts.filter((p) => p.status === st).length;
  const lCreators = state.creators.filter((c) => creatorStats(state, c.id).qualifiedQ >= L_CREATOR_TARGET).length;
  const queue = state.posts.filter((p) => p.status === 'review').sort((a, b) => a.submitted.localeCompare(b.submitted) || a.id.localeCompare(b.id));
  const byMarket = Object.keys(MARKETS).map((k) => {
    const ps = state.posts.filter((p) => p.market === k && inQuarter(p));
    return { k, total: ps.length, q: ps.filter((p) => p.status === 'qualified').length, pend: ps.filter((p) => p.status === 'review' || p.status === 'info').length };
  });
  return (
    <div className="flex flex-col gap-8">
      <PageHead eyebrow={`${QUARTER.label} · all markets`} title="Overview" sub="Submissions, verification workload and recognition across L." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Submissions" value={state.posts.length} sub="all time" />
        <Stat label="Pending" value={n('review')} sub={`${n('info')} awaiting creator`} accent />
        <Stat label="Qualifying" value={n('qualified')} sub="verified, L Mark" />
        <Stat label="Not qualifying" value={n('not')} sub="verified, over line" />
        <Stat label="Rejected" value={n('rejected')} sub="failed checks" />
        <Stat label="L Creators" value={lCreators} sub={`of ${state.creators.length} creators`} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between"><h2 className="text-[17px] font-bold">Oldest in the queue</h2><a href={href('admin-verification')} className="inline-flex items-center gap-1 text-[14px] font-semibold hover:underline">Start verifying <ArrowRight size={15} /></a></div>
          {queue.slice(0, 5).map((p) => {
            const c = state.creators.find((x) => x.id === p.creatorId);
            return (
              <a key={p.id} href={href(`admin-verification-${p.id}`)} className="flex items-center gap-3 rounded-xl p-2 hover:bg-paper">
                <Thumb index={p.thumb} status={p.status} className="h-12 w-10" play={false} label={p.title} />
                <span className="flex min-w-0 flex-1 flex-col leading-tight"><b className="truncate text-[14px]">{p.title}</b><span className="truncate text-[12px] text-mute">{c?.name} · {p.platform} · {MARKETS[p.market].name}</span></span>
                <span className="font-mono text-[12px] text-mute">{p.submitted.slice(5)}</span>
              </a>
            );
          })}
          {!queue.length && <p className="text-[14px] text-mute">The queue is empty.</p>}
        </Card>
        <Card className="overflow-x-auto p-5">
          <h2 className="mb-3 text-[17px] font-bold">This quarter by market</h2>
          <table className="w-full min-w-[320px] text-[14px]">
            <thead className="text-left text-[11px] uppercase tracking-wider text-mute"><tr><th className="pb-2">Market</th><th className="pb-2 text-right">Submitted</th><th className="pb-2 text-right">Qualifying</th><th className="pb-2 text-right">Pending</th></tr></thead>
            <tbody>
              {byMarket.map((m) => (
                <tr key={m.k} className="border-t border-line"><td className="py-2">{MARKETS[m.k].name}</td><td className="py-2 text-right font-mono tnum">{m.total}</td><td className="py-2 text-right font-mono tnum">{m.q}</td><td className="py-2 text-right font-mono tnum">{m.pend}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Live campaigns" value={state.campaigns.filter((c) => c.status === 'Live').length} sub={`${state.campaigns.filter((c) => c.status === 'Draft').length} in draft`} />
        <Stat label="L line period" value={state.benchmarkPeriod.label} sub={state.benchmarkPeriod.status} />
        <Stat label="Interest registrations" value={state.interest.length} sub="from Join L" />
      </div>
      <DemoNote>Sample data for the prototype.</DemoNote>
    </div>
  );
}
