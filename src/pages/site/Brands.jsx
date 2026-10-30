import React, { useMemo, useState } from 'react';
import { Award, Megaphone } from 'lucide-react';
import { Avatar, Button, Card, Seg, Empty, cx } from '../../components/ui.jsx';
import { PostCard, useVerifiedPosts } from '../../components/PostBits.jsx';
import { useStore, campaignLabel, inQuarter } from '../../lib/store.jsx';
import { MARKETS, PLATFORMS, FORMATS } from '../../lib/score.js';
import { L_CREATOR_TARGET, QUARTER, ORGANIC } from '../../data/mock.js';
import { PageHero, SampleNote, FilterSelect } from './common.jsx';

function MarketStrip({ posts }) {
  const byMarket = Object.keys(MARKETS).map((k) => [k, posts.filter((p) => p.market === k).length]);
  const max = Math.max(1, ...byMarket.map(([, n]) => n));
  return (
    <Card className="flex flex-col gap-4 p-5">
      <span className="eyebrow">Verified qualifying posts by market</span>
      <ul className="flex flex-col gap-2.5">
        {byMarket.map(([k, n]) => (
          <li key={k} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-[14px]">
            <span>{MARKETS[k].name}</span>
            <span className="h-2.5 rounded-full bg-ink/[0.07]"><span className="block h-2.5 rounded-full bg-ink" style={{ width: `${(n / max) * 100}%` }} /></span>
            <b className="text-right font-mono tnum">{n}</b>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Creators({ posts, fl }) {
  const { state } = useStore();
  const rows = state.creators
    .map((c) => {
      const mine = posts.filter((p) => p.creatorId === c.id);
      const q = mine.filter(inQuarter).length;
      const platforms = [...new Set((c.accounts || [{ platform: c.platform }]).map((a) => a.platform))];
      return { c, total: mine.length, q, platforms };
    })
    .filter((r) => r.total > 0 && (!fl.market || r.c.market === fl.market) && (!fl.platform || r.platforms.includes(fl.platform)))
    .sort((a, b) => b.q - a.q || b.total - a.total);
  if (!rows.length) return <Empty title="No creators match" body="Try another market or platform." />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(({ c, total, q, platforms }) => (
        <Card key={c.id} className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <Avatar name={c.name} src={c.avatar} size={44} />
            <div className="flex min-w-0 flex-col leading-tight">
              <b className="truncate">{c.name}</b>
              <span className="truncate text-[13px] text-mute">{c.handle} · {MARKETS[c.market].name}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => <span key={p} className="rounded-full bg-paper px-2 py-0.5 text-[12px] font-semibold">{p}</span>)}
            {q >= L_CREATOR_TARGET && <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[12px] font-semibold text-gold-deep ring-1 ring-inset ring-gold/50"><Award size={12} /> L Creator · {QUARTER.label}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-[13px]">
            <div className="flex flex-col"><span className="text-mute">Qualifying posts</span><b className="font-mono text-[18px] tnum">{total}</b></div>
            <div className="flex flex-col"><span className="text-mute">This quarter</span><b className="font-mono text-[18px] tnum">{q}</b></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Campaigns({ posts }) {
  const { state } = useStore();
  const live = state.campaigns.filter((c) => c.status === 'Live');
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {live.map((c) => {
        const n = posts.filter((p) => p.campaignId === c.id).length;
        return (
          <Card key={c.id} className="flex flex-col gap-3 p-5">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-mute"><Megaphone size={13} /> {c.brand}</span>
            <b className="text-[18px]">{c.name}</b>
            <p className="text-[14px] text-mute">{c.description}</p>
            <span className="text-[13px]">{c.markets.map((m) => MARKETS[m].name).join(', ')}</span>
            <div className="mt-auto flex items-baseline gap-2 border-t border-line pt-3"><b className="font-mono text-[22px] tnum">{n}</b><span className="text-[13px] text-mute">verified qualifying posts</span></div>
          </Card>
        );
      })}
    </div>
  );
}

export default function Brands() {
  const { state } = useStore();
  const all = useVerifiedPosts();
  const [tab, setTab] = useState('posts');
  const [fl, setFl] = useState({ market: '', platform: '', campaign: '', format: '' });
  const set = (k) => (v) => setFl((x) => ({ ...x, [k]: v }));
  const posts = useMemo(() => all.filter((p) =>
    (!fl.market || p.market === fl.market)
    && (!fl.platform || p.platform === fl.platform)
    && (!fl.format || p.format === fl.format)
    && (!fl.campaign || (fl.campaign === 'organic' ? !p.campaignId : p.campaignId === fl.campaign))), [all, fl]);

  return (
    <main>
      <PageHero eyebrow="For brands and agencies" title="Find lighter content" intro="Browse verified posts, the creators behind them, and the campaigns they ran in. Every figure is per post: L does not score creators.">
        <ul className="grid max-w-3xl gap-2 pt-2 text-[15px] text-ink-2 sm:grid-cols-3">
          <li className="rounded-xl bg-paper p-4"><b className="block text-ink">Verified, not claimed</b>Each post links to a public verification page.</li>
          <li className="rounded-xl bg-paper p-4"><b className="block text-ink">Fair by market</b>Scored against the L line for its own market and format.</li>
          <li className="rounded-xl bg-paper p-4"><b className="block text-ink">Post by post</b>Creators are shown by qualifying post counts, never a score.</li>
        </ul>
      </PageHero>
      <section className="gutter py-10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <Seg label="Browse" value={tab} onChange={setTab} options={[{ value: 'posts', label: 'Posts' }, { value: 'creators', label: 'Creators' }, { value: 'campaigns', label: 'Campaigns' }, { value: 'markets', label: 'Markets' }]} />
            {tab !== 'campaigns' && tab !== 'markets' && (
              <div className={cx('grid grid-cols-2 gap-3', tab === 'posts' ? 'md:grid-cols-4' : 'md:grid-cols-2')}>
                <FilterSelect id="b-market" label="Market" value={fl.market} onChange={set('market')} options={[['', 'All markets'], ...Object.entries(MARKETS).map(([k, m]) => [k, m.name])]} />
                <FilterSelect id="b-platform" label="Platform" value={fl.platform} onChange={set('platform')} options={[['', 'All platforms'], ...Object.keys(PLATFORMS).map((p) => [p, p])]} />
                {tab === 'posts' && <FilterSelect id="b-campaign" label="Campaign" value={fl.campaign} onChange={set('campaign')} options={[['', 'All posts'], ['organic', ORGANIC], ...state.campaigns.filter((c) => c.status === 'Live').map((c) => [c.id, c.name])]} />}
                {tab === 'posts' && <FilterSelect id="b-format" label="Format" value={fl.format} onChange={set('format')} options={[['', 'All formats'], ...Object.entries(FORMATS).map(([k, f]) => [k, f.name])]} />}
              </div>
            )}
          </div>

          {tab === 'posts' && (posts.length ? (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {posts.slice(0, 12).map((p) => <PostCard key={p.id} p={p} creator={state.creators.find((c) => c.id === p.creatorId)} campaign={campaignLabel(state, p)} />)}
            </div>
          ) : <Empty title="No posts match" body="Try another filter." />)}
          {tab === 'creators' && <Creators posts={all} fl={fl} />}
          {tab === 'campaigns' && <Campaigns posts={all} />}
          {tab === 'markets' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MarketStrip posts={all} />
              <Card className="flex flex-col gap-3 p-5">
                <span className="eyebrow">Platforms</span>
                {Object.keys(PLATFORMS).map((pl) => (
                  <div key={pl} className="flex justify-between border-t border-line pt-2.5 text-[14px] first-of-type:border-0"><span>{pl}</span><b className="font-mono tnum">{all.filter((p) => p.platform === pl).length}</b></div>
                ))}
              </Card>
            </div>
          )}

          <Card className="flex flex-col gap-3 bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <b className="text-[18px]">Running a campaign with L?</b>
              <span className="text-[14px] text-white/65">L'Oréal brand teams set up L campaigns with the L team. Campaign briefs then appear in Creator Studio for eligible creators.</span>
            </div>
            <Button variant="light" as="a" href="#standard">Read the L Standard</Button>
          </Card>
          <SampleNote />
        </div>
      </section>
    </main>
  );
}
