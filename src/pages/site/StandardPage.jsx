import React from 'react';
import { Clock3, MonitorPlay, Eye, Server, Zap, Factory, ArrowRight, ArrowDown, Check, X, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button, Card, LMark, LProgress, ScoreBar, cx } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS, RESOLUTIONS, PLATFORMS, fmt, lScore } from '../../lib/score.js';
import { L_CREATOR_INCENTIVES, L_CREATOR_TARGET } from '../../data/mock.js';
import { PageHero, Section, SampleNote } from './common.jsx';

const FACTORS = [
  { Icon: Clock3, t: 'Duration', d: 'Seconds of video. Every second is streamed to every viewer, so it is the biggest lever.' },
  { Icon: MonitorPlay, t: 'Top resolution', d: 'The highest quality the post is published at sets how much data each second carries.' },
  { Icon: Server, t: 'Platform bitrate', d: 'How the platform encodes that resolution. Each platform streams a little differently.' },
  { Icon: Zap, t: 'Energy per GB', d: 'Energy to deliver one gigabyte of video, from the Impact+ model.' },
  { Icon: Factory, t: 'Grid factor', d: 'Carbon intensity of electricity in the market, from Ember.' },
  { Icon: Eye, t: 'Views', d: 'Normalises the result to 1,000 views, so a post is not penalised for reach.' },
];

function Formula() {
  const steps = [
    ['Duration × resolution × platform bitrate', 'Data per view (MB)'],
    ['× energy per GB', 'Energy per view (kWh)'],
    ['× market grid factor', 'Carbon per view (g CO₂e)'],
    ['× 1,000', 'L-Score: g CO₂e per 1,000 views'],
  ];
  return (
    <ol className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {steps.map(([op, out], i) => (
        <li key={out} className="relative flex flex-col gap-2">
          <div className={cx('flex min-h-[120px] flex-col justify-between gap-3 rounded-2xl p-5', i === 3 ? 'bg-ink text-white' : 'border border-line bg-white')}>
            <span className={cx('font-mono text-[12px]', i === 3 ? 'text-white/60' : 'text-mute')}>{op}</span>
            <b className="text-[17px] leading-snug">{out}</b>
          </div>
          {i < 3 && <ArrowRight size={18} className="absolute -right-[15px] top-1/2 z-10 hidden -translate-y-1/2 text-mute md:block" aria-hidden="true" />}
          {i < 3 && <ArrowDown size={18} className="mx-auto text-mute md:hidden" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function Example() {
  const base = { res: '1080p', platform: 'TikTok', market: 'VN' };
  const rows = [15, 30, 60].map((secs) => [`${secs} s post`, lScore({ ...base, secs })]);
  const max = rows[rows.length - 1][1] * 1.1;
  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Worked example</span>
        <h3 className="text-[20px] font-bold">How duration drives the score</h3>
        <p className="text-[14px] text-mute">1080p, TikTok, watched in Vietnam. Every second is streamed to every viewer, so the score rises with length.</p>
      </div>
      {rows.map(([l, v]) => (
        <div key={l} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[14px]"><span>{l}</span><b className="font-mono tnum">{fmt(v)} g</b></div>
          <div className="h-3 rounded-full bg-ink/[0.08]"><div className="h-3 rounded-full bg-ink" style={{ width: `${(v / max) * 100}%` }} /></div>
        </div>
      ))}
      <p className="font-mono text-[12px] text-mute">{RESOLUTIONS['1080p'].mbps} Mbps at 1080p · {(30 * RESOLUTIONS['1080p'].mbps / 8).toFixed(1)} MB per view for a 30 s post</p>
    </Card>
  );
}

function LineDiagram() {
  // Illustrative distribution of short-video posts in one market and the median that becomes the L line.
  const bars = [3, 6, 11, 16, 19, 17, 12, 8, 5, 3];
  const peak = Math.max(...bars);
  return (
    <Card className="flex flex-col gap-4 p-6">
      <span className="eyebrow">How an L line is set</span>
      <div className="relative flex h-40 items-end gap-1.5" role="img" aria-label="A distribution of post scores with the median marked as the L line">
        {bars.map((b, i) => (
          <div key={i} className={cx('flex-1 rounded-t', i < 5 ? 'bg-ink' : 'bg-line-strong')} style={{ height: `${(b / peak) * 100}%` }} />
        ))}
        <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-brand" />
        <span className="absolute -top-1 left-1/2 ml-2 font-mono text-[11px] font-semibold text-brand-deep">L line = median</span>
      </div>
      <div className="flex justify-between font-mono text-[11px] text-mute"><span>Lighter</span><span>Heavier</span></div>
      <p className="text-[14px] text-mute">All posts of one format in one market, ordered by L-Score. The middle value is the L line for the quarter. Posts at or below it qualify.</p>
    </Card>
  );
}

function BenchmarkTable() {
  const { state } = useStore();
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[520px] text-left text-[14px]">
          <thead className="bg-paper text-[12px] uppercase tracking-wider text-mute">
            <tr><th className="px-4 py-3">Market</th><th className="px-4 py-3">Short video (≤ 90 s)</th><th className="px-4 py-3">Long video (&gt; 90 s)</th><th className="px-4 py-3">Grid factor</th></tr>
          </thead>
          <tbody>
            {Object.entries(MARKETS).map(([k, m]) => (
              <tr key={k} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{m.name}</td>
                <td className="px-4 py-3 font-mono tnum">{fmt(state.benchmarks[k].short)} g</td>
                <td className="px-4 py-3 font-mono tnum">{fmt(state.benchmarks[k].long)} g</td>
                <td className="px-4 py-3 font-mono text-mute tnum">{m.grid} g/kWh</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SampleNote>L lines for {state.benchmarkPeriod.label} ({state.benchmarkPeriod.status.toLowerCase()}). Sample values for the prototype, not validated benchmarks. Method {state.method.version}, updated {state.method.updated}.</SampleNote>
    </div>
  );
}

function Outcomes() {
  const rows = [
    { Icon: Clock, t: 'Pending verification', d: 'Submitted and waiting for review. No L Mark, no official score yet.', cls: 'bg-warn-bg text-warn' },
    { Icon: Check, t: 'Verified · qualifying', d: 'Checked, and at or below the L line. Carries the L Mark and a verification ID.', cls: 'bg-gold-soft text-gold-deep', mark: true },
    { Icon: X, t: 'Verified · not qualifying', d: 'Checked, but above the L line. The score is official; there is no L Mark.', cls: 'bg-over-bg text-over' },
    { Icon: AlertTriangle, t: 'Rejected', d: 'Could not be verified, for example the account does not match or the post is not public.', cls: 'border border-bad/40 text-bad' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((r) => (
        <Card key={r.t} className="flex flex-col gap-3 p-5">
          <span className={cx('flex h-9 w-9 items-center justify-center rounded-full', r.cls)}>{r.mark ? <LMark size={22} /> : <r.Icon size={17} />}</span>
          <b className="text-[16px]">{r.t}</b>
          <p className="text-[14px] text-mute">{r.d}</p>
        </Card>
      ))}
    </div>
  );
}

function Verification() {
  const steps = [
    ['Account match', 'The post belongs to an account on the creator’s profile.'],
    ['Public post', 'The link opens a live, public post on the named platform.'],
    ['Inputs checked', 'Duration, top resolution, platform, market and views are confirmed from the post.'],
    ['Score against the line', 'The L-Score is calculated and compared with the L line for its market and format.'],
    ['ID issued', 'A unique verification ID and public verification page are created for the post.'],
  ];
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
      <ol className="flex flex-col gap-0">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4 border-l-2 border-line pb-6 pl-5 last:pb-0 relative">
            <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-bold text-white">{i + 1}</span>
            <div className="flex flex-col gap-1"><b className="text-[16px]">{t}</b><span className="text-[14px] text-mute">{d}</span></div>
          </li>
        ))}
      </ol>
      <Card className="flex flex-col gap-3 bg-paper p-6">
        <ShieldCheck size={22} />
        <b className="text-[17px]">The verification page is the proof</b>
        <p className="text-[14px] text-mute">A copied L Mark image proves nothing on its own. Every qualifying post has a verification ID that anyone can check on its public page, with the original post link, the L-Score and the L line it was measured against.</p>
        <Button variant="outline" as="a" href={href('verified')} className="self-start">Check a verification ID</Button>
      </Card>
    </div>
  );
}

function LCreator() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="flex flex-col gap-4 p-6">
        <span className="eyebrow">L Creator</span>
        <h3 className="text-[22px] font-bold">{L_CREATOR_TARGET} qualifying posts in a quarter</h3>
        <p className="text-[14px] text-mute">Status follows posts, not people. A creator becomes an L Creator for the quarter once {L_CREATOR_TARGET} of their posts are verified and qualifying. There is no creator-level L-Score, and the count resets each quarter with the L lines.</p>
        <LProgress count={7} />
        <span className="font-mono text-[12px] text-mute">Example: 7 of {L_CREATOR_TARGET} this quarter</span>
      </Card>
      <div className="grid gap-3">
        {L_CREATOR_INCENTIVES.map((i) => (
          <Card key={i.name} className="flex flex-col gap-1.5 border-gold/50 p-6">
            <b className="text-[17px]">{i.name}</b>
            <span className="text-[14px] text-mute">{i.desc}</span>
          </Card>
        ))}
        <SampleNote>Incentives as proposed in the pitch. Terms to be confirmed per market.</SampleNote>
      </div>
    </div>
  );
}

export default function StandardPage() {
  return (
    <main>
      <PageHero eyebrow="Methodology" title="The L Standard" intro="How L measures a video, sets the line it is compared with, and decides which posts carry the L Mark.">
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="brand" as="a" href={href('estimator')}>Estimate a video <ArrowRight size={16} /></Button>
          <Button variant="outline" as="a" href={href('verified')}>See verified posts</Button>
        </div>
      </PageHero>

      <Section eyebrow="1 · What the L-Score measures" title="Carbon per 1,000 views, for one post." intro="The L-Score is grams of CO₂e for every 1,000 views of a single post. It describes the post, never the creator, and it is the same whether a post gets a hundred views or a million.">
        <Formula />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          <Example />
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            {FACTORS.map((f) => (
              <div key={f.t} className="flex flex-col gap-2 rounded-2xl border border-line p-4">
                <f.Icon size={18} className="text-mute" aria-hidden="true" />
                <b className="text-[15px]">{f.t}</b>
                <span className="text-[13px] text-mute">{f.d}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section eyebrow="2 · The L line" title="Compared with its own market and format." intro="Each post is compared with the median L-Score of posts in the same market and the same format. L lines are reset every quarter, so the standard moves as content gets lighter." className="bg-paper">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr]">
          <LineDiagram />
          <BenchmarkTable />
        </div>
      </Section>

      <Section eyebrow="3 · What qualifies" title="At or below the line, and verified.">
        <Card className="flex flex-col gap-2 p-6">
          <div className="flex justify-between text-[14px]"><span>A 30 s post in Vietnam, short video</span><b className="font-mono">475 g · qualifies</b></div>
          <ScoreBar score={475} line={610} />
        </Card>
        <Outcomes />
      </Section>

      <Section eyebrow="4 · Verification" title="Estimates guide. Verification decides." intro="Anyone can estimate an L-Score. Only a post submitted through Creator Studio and verified can qualify." className="bg-paper">
        <Verification />
      </Section>

      <Section eyebrow="5 · Recognition" title="Becoming an L Creator.">
        <LCreator />
      </Section>
    </main>
  );
}
