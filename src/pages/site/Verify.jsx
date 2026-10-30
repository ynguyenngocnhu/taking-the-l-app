import React from 'react';
import { ArrowUpRight, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Avatar, Button, Card, LMark, ScoreBar, StatusPill, Thumb, cx } from '../../components/ui.jsx';
import { ImpactReceipt, CampaignTag, contextLabel } from '../../components/PostBits.jsx';
import { useStore, enrich, campaignLabel } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS, FORMATS, fmt, compact } from '../../lib/score.js';
import { SampleNote } from './common.jsx';
import { VerifyLookup } from './Verified.jsx';
import { Endorsement } from '../../components/Loreal.jsx';

function Row({ k, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line py-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-[13px] text-mute">{k}</dt>
      <dd className="min-w-0 break-words text-[14px] font-semibold sm:text-right">{children}</dd>
    </div>
  );
}

export default function Verify({ id }) {
  const { state } = useStore();
  const raw = state.posts.find((p) => p.vid && p.vid === (id || '').toUpperCase());

  if (!raw) {
    return (
      <main className="gutter py-16">
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <ShieldAlert size={32} className="text-bad" />
          <h1 className="display text-[34px] font-extrabold leading-tight">No verified post with this ID</h1>
          <p className="text-[15px] text-mute">{id ? <>We could not find <span className="font-mono">{id}</span>. </> : null}If a post shows the L Mark but has no matching verification ID, it has not been verified under the L Standard.</p>
          <VerifyLookup />
          <Button variant="ghost" as="a" href={href('verified')} className="self-start"><ArrowLeft size={16} /> Verified posts</Button>
        </div>
      </main>
    );
  }

  const p = enrich(raw, state.benchmarks);
  const creator = state.creators.find((c) => c.id === p.creatorId);
  const qualifies = p.status === 'qualified';
  const account = creator.accounts?.find((a) => a.platform === p.platform)?.handle || creator.handle;

  return (
    <main>
      <section className={cx('gutter', qualifies ? 'bg-ink text-white' : 'bg-paper')}>
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4 py-10 sm:py-14">
          <a href={href('verified')} className={cx('inline-flex items-center gap-1 text-[13px] font-semibold', qualifies ? 'text-white/60 hover:text-white' : 'text-mute hover:text-ink')}><ArrowLeft size={14} /> Verified posts</a>
          <div className="flex flex-wrap items-center gap-4">
            {qualifies ? <LMark size={56} /> : <ShieldCheck size={44} />}
            <div className="flex flex-col gap-1">
              <span className={cx('eyebrow', qualifies && 'text-white/55')}>Verification</span>
              <h1 className="display break-all font-mono text-[26px] font-bold sm:text-[34px]">{p.vid}</h1>
            </div>
          </div>
          <p className={cx('max-w-2xl text-[16px]', qualifies ? 'text-white/75' : 'text-ink-2')}>
            {qualifies
              ? `This post was verified under the L Standard on ${p.verified} and is at or below the L line for ${contextLabel(p)}.`
              : `This post was verified on ${p.verified}, but its L-Score is above the L line for ${contextLabel(p)}. It does not carry the L Mark.`}
          </p>
        </div>
      </section>

      <section className="gutter py-10">
        <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-4">
            <Thumb index={p.thumb} secs={p.secs} status={p.status} mark="lg" className="aspect-[4/5] w-full rounded-2xl" label={p.title} />
            <Button variant="outline" as="a" href={p.url} target="_blank" rel="noreferrer">Open the original post <ArrowUpRight size={16} /></Button>
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <Card className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={creator.name} src={creator.avatar} size={40} />
                  <div className="flex flex-col leading-tight"><b>{creator.name}</b><span className="text-[13px] text-mute">{p.platform} · {account}</span></div>
                </div>
                <StatusPill status={p.status} />
              </div>
              <h2 className="text-[20px] font-bold">{p.title}</h2>
              <div className="flex items-end gap-3">
                <span className="display text-[52px] font-black leading-none tnum">{fmt(p.score)}</span>
                <span className="pb-1.5 text-[14px] text-mute">L-Score · g CO₂e per 1,000 views</span>
              </div>
              <ScoreBar score={p.score} line={p.line} />
              <dl className="flex flex-col">
                <Row k="Verification ID"><span className="font-mono">{p.vid}</span></Row>
                <Row k="Status">{qualifies ? 'Verified · qualifying' : 'Verified · not qualifying'}</Row>
                <Row k="L line">{fmt(p.line)} g · {state.benchmarkPeriod.label}</Row>
                <Row k="Market and format">{MARKETS[p.market].name} · {FORMATS[p.format].name}</Row>
                <Row k="Campaign"><CampaignTag name={campaignLabel(state, p)} /></Row>
                <Row k="Creator and account">{creator.name} · {account} on {p.platform}</Row>
                <Row k="Original post"><a href={p.url} target="_blank" rel="noreferrer" className="break-all font-mono text-[12px] underline">{p.url}</a></Row>
                <Row k="Inputs">{p.secs} s · {p.res} · {compact(p.views)} views at verification</Row>
                <Row k="Submitted · verified">{p.submitted} · {p.verified}</Row>
              </dl>
            </Card>
            <div className="flex flex-col gap-3">
              <h2 className="text-[18px] font-bold">Impact receipt</h2>
              <ImpactReceipt p={p} benchmarks={state.benchmarks} />
            </div>
            <Card className="flex items-start gap-3 bg-paper p-5 text-[14px]">
              <ShieldCheck size={20} className="mt-0.5 shrink-0" />
              <span>This page is the proof of verification. A copy of the L Mark image on its own is not. If the post link or account above does not match what you are looking at, the post is not this one.</span>
            </Card>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              <Endorsement height={12} textClass="text-mute" />
              <span className="text-[12px] text-mute">Verified under the L Standard</span>
            </div>
            <SampleNote />
          </div>
        </div>
      </section>
    </main>
  );
}
