import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { Button, Card, Empty } from '../../components/ui.jsx';
import { PostCard, useVerifiedPosts } from '../../components/PostBits.jsx';
import { useStore, campaignLabel } from '../../lib/store.jsx';
import { go, href } from '../../lib/router.js';
import { MARKETS, PLATFORMS, FORMATS } from '../../lib/score.js';
import { ORGANIC } from '../../data/mock.js';
import { PageHero, SampleNote, FilterSelect } from './common.jsx';

export function useLookup() {
  const { state } = useStore();
  return (q) => {
    const s = q.trim();
    if (!s) return null;
    const id = s.toUpperCase();
    const p = state.posts.find((x) => x.vid && (x.vid === id || x.url.toLowerCase() === s.toLowerCase()));
    return p ? p.vid : false;
  };
}

export function VerifyLookup({ compact }) {
  const lookup = useLookup();
  const [q, setQ] = useState('');
  const [miss, setMiss] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const vid = lookup(q);
    if (vid) go(`verify-${vid}`);
    else setMiss(q.trim() !== '');
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {!compact && <label htmlFor="vlookup" className="label">Check a verification ID or post link</label>}
      <div className="flex gap-2">
        <input id="vlookup" className="input min-w-0 flex-1 font-mono text-[14px]" placeholder="LV-26Q4-XXXXX or https://…" value={q} onChange={(e) => { setQ(e.target.value); setMiss(false); }} aria-label="Verification ID or post link" />
        <Button type="submit"><Search size={16} /> Check</Button>
      </div>
      {miss && <p className="text-[13px] text-bad">No verified post matches that. An L Mark without a matching verification ID is not verified.</p>}
    </form>
  );
}

const PAGE = 12;

export default function Verified({ id }) {
  const { state } = useStore();
  const owner = state.creators.find((c) => c.id === id) || null;
  const every = useVerifiedPosts();
  const all = useMemo(() => (owner ? every.filter((p) => p.creatorId === owner.id) : every), [every, owner]);
  const [fl, setFl] = useState({ market: '', platform: '', campaign: '', format: '' });
  const [n, setN] = useState(PAGE);
  const set = (k) => (v) => { setFl((x) => ({ ...x, [k]: v })); setN(PAGE); };

  const list = useMemo(() => all.filter((p) =>
    (!fl.market || p.market === fl.market)
    && (!fl.platform || p.platform === fl.platform)
    && (!fl.format || p.format === fl.format)
    && (!fl.campaign || (fl.campaign === 'organic' ? !p.campaignId : p.campaignId === fl.campaign))), [all, fl]);

  const campaigns = state.campaigns.filter((c) => all.some((p) => p.campaignId === c.id));

  return (
    <main>
      {owner ? (
        <PageHero eyebrow="Portfolio · verified posts" title={owner.name} intro={`Posts by ${owner.name} (${owner.handle}) that were verified and came in at or below the L line for their market and format. Each one links to its verification page.`}>
          <a href={href('verified')} className="inline-flex items-center gap-1 text-[14px] font-semibold underline">All verified posts</a>
        </PageHero>
      ) : (
        <PageHero eyebrow="Public gallery" title="Verified posts" intro="Every post here was submitted through Creator Studio, verified, and came in at or below the L line for its market and format.">
          <div className="max-w-xl pt-2"><VerifyLookup /></div>
        </PageHero>
      )}
      <section className="gutter py-10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:items-end">
            <FilterSelect id="f-market" label="Market" value={fl.market} onChange={set('market')} options={[['', 'All markets'], ...Object.entries(MARKETS).map(([k, m]) => [k, m.name])]} />
            <FilterSelect id="f-platform" label="Platform" value={fl.platform} onChange={set('platform')} options={[['', 'All platforms'], ...Object.keys(PLATFORMS).map((p) => [p, p])]} />
            <FilterSelect id="f-campaign" label="Campaign" value={fl.campaign} onChange={set('campaign')} options={[['', 'All posts'], ['organic', ORGANIC], ...campaigns.map((c) => [c.id, c.name])]} />
            <FilterSelect id="f-format" label="Format" value={fl.format} onChange={set('format')} options={[['', 'All formats'], ...Object.entries(FORMATS).map(([k, f]) => [k, f.name])]} />
            <p className="col-span-2 text-[14px] text-mute md:col-span-1 md:pb-2.5 md:text-right"><b className="text-ink tnum">{list.length}</b> verified posts</p>
          </div>
          {list.length ? (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, n).map((p) => <PostCard key={p.id} p={p} creator={state.creators.find((c) => c.id === p.creatorId)} campaign={campaignLabel(state, p)} />)}
            </div>
          ) : (
            <Empty title="No verified posts match" body="Try another market, platform or campaign." action={<Button variant="outline" onClick={() => setFl({ market: '', platform: '', campaign: '', format: '' })}>Clear filters</Button>} />
          )}
          {n < list.length && <Button variant="outline" className="self-center" onClick={() => setN(n + PAGE)}>Show more</Button>}
          <Card className="flex items-start gap-3 bg-paper p-5 text-[14px]">
            <ShieldCheck size={20} className="mt-0.5 shrink-0" />
            <span>The L Mark on a thumbnail is a shortcut, not proof. Open a post’s verification page to see its verification ID, original link, L-Score and L line.</span>
          </Card>
          <SampleNote />
        </div>
      </section>
    </main>
  );
}
