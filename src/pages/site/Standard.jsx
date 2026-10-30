import React, { useState } from 'react';
import { ArrowRight, ArrowDown, Ruler, Scissors, Award, ChevronDown, Clock, MonitorPlay, Eye, Gauge, Zap, Factory } from 'lucide-react';
import { Button, Card, StatusPill, ScoreBar, LGlyph, LBox, LMark, LProgress, DemoNote, Avatar, Thumb, cx } from '../../components/ui.jsx';
import { href } from '../../lib/router.js';
import { useStore, leaderboard, enrich } from '../../lib/store.jsx';
import { MARKETS, RESOLUTIONS, PLATFORMS, ENERGY_KWH_PER_GB, fmt, compact } from '../../lib/score.js';
import { QUARTER } from '../../data/mock.js';

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function Section({ id, eyebrow, title, intro, children, className }) {
  return (
    <section id={id} className={cx('gutter scroll-mt-20 py-16 sm:py-24', className)}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="display text-[34px] font-extrabold leading-[1.02] sm:text-[52px]">{title}</h2>
          {intro && <p className="max-w-2xl text-[17px] leading-relaxed text-mute">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="gutter relative overflow-hidden bg-ink text-paper">
      {/* The giant L: the page's one bold move */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-[8vw] top-8 hidden h-[620px] w-[520px] md:block">
        <div className="absolute left-0 top-0 h-full w-[34%] rounded-[28px] bg-brand" />
        <div className="absolute bottom-0 left-0 h-[30%] w-full rounded-[28px] bg-brand" />
      </div>
      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-8 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <span className="eyebrow flex items-center gap-2 text-white/60"><LBox size={18} /> A creator sustainability initiative by L'Oréal</span>
        <h1 className="display-tight max-w-[820px] text-[56px] font-black uppercase leading-[0.88] tracking-[-0.01em] sm:text-[96px] lg:text-[124px]">
          Taking<br />
          the{' '}
          <span className="relative inline-block">
            L.
            <span aria-hidden="true" className="absolute -bottom-1 left-0 h-[10px] w-full bg-gold sm:h-[16px]" />
          </span>
        </h1>
        <p className="max-w-[540px] text-[18px] leading-relaxed text-white/75 sm:text-[20px]">
          Taking the L is no longer about losing. It's about making every view count, with less digital impact.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" variant="brand" onClick={() => scrollTo('what')}>Explore the L Standard <ArrowDown size={18} /></Button>
          <Button size="lg" variant="light" as="a" href={href('studio')}>Join the L Movement <ArrowRight size={18} /></Button>
        </div>
        <dl className="mt-6 grid max-w-[640px] grid-cols-3 gap-4 border-t border-white/15 pt-6">
          {[
            ['g CO₂e', 'per 1,000 views'],
            ['610', 'Vietnam L line, short video'],
            ['10', 'L posts a quarter to be an L Creator'],
          ].map(([v, k]) => (
            <div key={k} className="flex flex-col gap-1">
              <dt className="order-2 text-[12px] leading-snug text-white/55">{k}</dt>
              <dd className="display order-1 text-[22px] font-extrabold sm:text-[28px]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function WhatIsL() {
  const steps = [
    { n: '1', t: 'Measure', d: 'See the estimated digital carbon impact of a video, per 1,000 views, from inputs anyone can check.', Icon: Ruler },
    { n: '2', t: 'Reduce', d: 'Make the same video lighter: fewer dead seconds, the right resolution for the screen it plays on.', Icon: Scissors },
    { n: '3', t: 'Reward', d: 'Posts under the L line earn the L Mark. Ten in a quarter makes you an L Creator, with real incentives.', Icon: Award },
  ];
  return (
    <Section id="what" eyebrow="What is L?" title="Measure. Reduce. Reward." intro="Every second of video is streamed to every viewer. L turns that hidden cost into a number a creator can act on.">
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n}>
            <Card className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <span className="display text-[44px] font-black leading-none text-line-strong">{s.n}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white"><s.Icon size={20} /></span>
              </div>
              <h3 className="display text-[24px] font-extrabold">{s.t}</h3>
              <p className="text-[15px] leading-relaxed text-mute">{s.d}</p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function ScoreIntro() {
  return (
    <Section id="score" eyebrow="Introducing L-Score" title="One number next to your views." className="bg-paper" intro="L-Score is the estimated grams of CO₂e for every 1,000 views of a post. Lower is lighter. Come in under the L line for your market and format, and the post earns an L.">
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden border-ink">
          <div className="flex items-center justify-between bg-ink px-5 py-3 text-white">
            <span className="font-mono text-[12px] uppercase tracking-widest">Sample L-Score</span>
            <span className="font-mono text-[11px] text-white/60">Illustrative</span>
          </div>
          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="eyebrow">Video views</span>
                <span className="display text-[40px] font-extrabold leading-none tnum sm:text-[52px]">125,000</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-line pl-6">
                <span className="eyebrow">L-Score</span>
                <span className="display text-[40px] font-extrabold leading-none tnum sm:text-[52px]">475</span>
                <span className="font-mono text-[12px] text-mute">g CO₂e / 1,000 views</span>
              </div>
            </div>
            <ScoreBar score={475} line={610} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <div className="flex flex-col">
                <span className="eyebrow">Market and format benchmark</span>
                <span className="font-mono text-[15px] font-semibold">L line 610 · Vietnam · short video</span>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-[14px] font-bold text-ink"><LGlyph size={16} /> Qualified: earned an L</span>
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          {[
            ['Lower is lighter', 'A 30-second cut of a 60-second post scores half as much: 475 instead of 950. Same story, half the streamed seconds.'],
            ['Shown next to views', 'Views tell you reach. L-Score tells you what that reach cost. Together they show a post that works and weighs less.'],
            ['Benchmarked fairly', 'Each market and format has its own L line, because grids and formats differ. A creator is only compared with like for like.'],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-4">
              <LGlyph size={22} className="mt-1 shrink-0 text-brand-deep" />
              <div className="flex flex-col gap-1">
                <h3 className="text-[17px] font-bold">{t}</h3>
                <p className="text-[15px] leading-relaxed text-mute">{d}</p>
              </div>
            </div>
          ))}
          <DemoNote>All figures on this page are illustrative demo data, not validated real-world results.</DemoNote>
        </div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const inputs = [
    { Icon: Clock, t: 'Video duration', d: 'Seconds streamed per view', src: 'From the post' },
    { Icon: MonitorPlay, t: 'Video resolution', d: '720p to 4K', src: 'From the post' },
    { Icon: Eye, t: 'Views', d: 'Scales the total, not the score', src: 'From the post' },
    { Icon: Gauge, t: 'Platform bitrate', d: 'Mbps by resolution', src: 'L Standard assumption' },
    { Icon: Zap, t: 'Energy per GB', d: `${ENERGY_KWH_PER_GB} kWh per GB`, src: 'L Standard assumption' },
    { Icon: Factory, t: 'Grid emission factor', d: 'g CO₂e per kWh, by market', src: 'Public grid data' },
  ];
  return (
    <Section id="how" eyebrow="How the L Standard works" title="Six inputs. All public." intro="Three inputs come from the post itself. Three are published assumptions that apply to everyone, so any creator or brand can check a score by hand.">
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {inputs.map((i) => (
          <Card key={i.t} className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper"><i.Icon size={19} /></span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[15px] font-bold">{i.t}</span>
              <span className="text-[14px] text-mute">{i.d}</span>
              <span className="mt-1 font-mono text-[11px] uppercase tracking-wider text-mute">{i.src}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="scroll-x border-b border-line bg-ink px-5 py-4 font-mono text-[13px] text-white sm:text-[14px]">
          <span className="whitespace-nowrap">L-Score = 1,000 views × seconds × bitrate (GB/s) × energy (kWh/GB) × grid (g/kWh)</span>
        </div>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-paper">
          <span className="flex flex-col">
            <span className="text-[15px] font-bold">Methodology {state.method.version}</span>
            <span className="text-[13px] text-mute">Assumptions and current L lines. Last updated {state.method.updated}.</span>
          </span>
          <ChevronDown size={20} className={cx('shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="grid gap-8 border-t border-line p-5 md:grid-cols-3">
            <MiniTable title="Bitrate by resolution" head={['Resolution', 'Mbps']} rows={Object.entries(RESOLUTIONS).map(([k, v]) => [k, v.mbps])} />
            <MiniTable title="Grid factor by market" head={['Market', 'g/kWh']} rows={Object.entries(MARKETS).map(([, m]) => [m.name, m.grid])} />
            <MiniTable title="L line (short / long)" head={['Market', 'g / 1k views']} rows={Object.entries(state.benchmarks).map(([k, b]) => [MARKETS[k].name, `${fmt(b.short)} / ${fmt(b.long)}`])} />
            <p className="text-[13px] leading-relaxed text-mute md:col-span-3">
              Platform adjustments: {Object.entries(PLATFORMS).map(([k, v]) => `${k} ×${v.factor}`).join(', ')}. Short video is up to 90 seconds. These values are illustrative for this prototype and have not been validated.
            </p>
          </div>
        )}
      </Card>
    </Section>
  );
}

function MiniTable({ title, head, rows }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="eyebrow">{title}</span>
      <table className="w-full text-[14px] tnum">
        <thead><tr>{head.map((h, i) => <th key={h} className={cx('border-b border-line pb-2 font-medium text-mute', i ? 'text-right' : 'text-left')}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={cx('border-b border-line py-2', i ? 'text-right font-mono' : '')}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Programme() {
  return (
    <Section id="programme" eyebrow="L Creator Programme" title="Ten Ls a quarter. Then it pays." className="bg-ink text-white [&_.eyebrow]:text-white/60" intro={null}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <ol className="flex flex-col gap-6">
          {[
            ['Post as usual', 'Publish on TikTok, Instagram or YouTube, then submit the link in Creator Studio.'],
            ['Earn the L Mark', 'Posts under the L line, once verified, earn an L Mark and a shareable Impact Receipt.'],
            ['Collect ten in a quarter', 'Ten qualifying posts within one quarter make you an L Creator.'],
            ['Unlock incentives', 'L Creators get the L-Media Fund boost, the Lighter Rate on commission and first access to briefs.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 font-mono text-[13px]">{i + 1}</span>
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-bold">{t}</h3>
                <p className="text-[15px] leading-relaxed text-white/65">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 text-ink sm:p-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="eyebrow">Example creator · {QUARTER.label}</span>
              <span className="display text-[44px] font-black leading-none tnum">6<span className="text-line-strong">/10</span></span>
            </div>
            <span className="text-right text-[13px] text-mute">4 more L posts<br />to L Creator</span>
          </div>
          <LProgress count={6} />
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-xl bg-paper p-3"><b className="block text-[15px]">L-Media Fund</b>+30% paid reach</div>
            <div className="rounded-xl bg-paper p-3"><b className="block text-[15px]">Lighter Rate</b>+2 pts commission</div>
          </div>
          <Button variant="brand" as="a" href={href('studio')}>Open Creator Studio <ArrowRight size={17} /></Button>
        </div>
      </div>
    </Section>
  );
}

function PublicBoard() {
  const { state } = useStore();
  const rows = leaderboard(state).slice(0, 6);
  const recent = state.posts
    .filter((p) => p.type !== 'draft' && p.submitted >= QUARTER.start)
    .map((p) => enrich(p, state.benchmarks))
    .sort((a, b) => b.submitted.localeCompare(a.submitted) || a.id.localeCompare(b.id))
    .slice(0, 12);
  return (
    <Section id="impact" eyebrow={`Public impact · ${QUARTER.label}`} title="The lightest creators this quarter." className="bg-paper" intro="Ranked by qualifying L posts this quarter, then by how far under the L line they land on average.">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[17px] font-bold">Latest posts this quarter</h3>
          <span className="flex items-center gap-1.5 text-[12px] text-mute"><LMark size={12} label={false} /> = earned an L</span>
        </div>
        <ul className="scroll-x -mx-1 flex gap-3 px-1 pb-1">
          {recent.map((p) => {
            const c = state.creators.find((x) => x.id === p.creatorId);
            return (
              <li key={p.id} className="w-[132px] shrink-0 sm:w-[150px]">
                <Thumb index={p.thumb} secs={p.secs} status={p.status === 'qualified' ? 'qualified' : null} mark="md" play={false} className={cx('aspect-[9/16] w-full rounded-xl', p.status === 'qualified' && 'ring-2 ring-gold')} label={`${p.title} by ${c.name}`} />
                <span className="mt-1.5 block truncate text-[13px] font-semibold">{c.name}</span>
                <span className="block font-mono text-[11px] text-mute">{compact(p.views)} views · {fmt(p.score)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <Card className="overflow-hidden">
        <div className="scroll-x">
          <table className="w-full min-w-[620px] text-[14px] tnum">
            <thead className="bg-paper text-left text-mute">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-2 py-3 font-medium">Creator</th>
                <th className="px-2 py-3 text-right font-medium">L posts</th>
                <th className="px-2 py-3 text-right font-medium">L performance</th>
                <th className="px-5 py-3 text-right font-medium">Campaigns</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-5 py-3.5 font-mono font-semibold">{r.rank}</td>
                  <td className="px-2 py-3.5">
                    <span className="flex items-center gap-3">
                      <Avatar name={r.name} size={32} />
                      <span className="flex flex-col"><b>{r.name}</b><span className="text-[12px] text-mute">{MARKETS[r.market].name}</span></span>
                    </span>
                  </td>
                  <td className="px-2 py-3.5 text-right font-mono font-semibold">{r.qualifiedQ}{r.qualifiedQ >= 10 && <span className="ml-2 rounded bg-gold px-1.5 py-0.5 font-sans text-[11px] font-bold">L Creator</span>}</td>
                  <td className="px-2 py-3.5 text-right font-mono">{r.perf >= 0 ? `${r.perf}% under` : `${-r.perf}% over`}</td>
                  <td className="px-5 py-3.5 text-right font-mono">{r.campaigns.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <DemoNote>Demo data. Creator names, posts and scores are fictional.</DemoNote>
    </Section>
  );
}

export default function Standard() {
  return (
    <main>
      <Hero />
      <WhatIsL />
      <ScoreIntro />
      <HowItWorks />
      <Programme />
      <PublicBoard />
      <footer className="gutter border-t border-line py-10">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5"><LBox size={24} /><span className="text-[13px] text-mute">Prototype for the L'Oréal SAPMENA Limitless Pitch 2026</span></span>
          <span className="text-[12px] text-mute">Illustrative demo. Not a real carbon calculation.</span>
        </div>
      </footer>
    </main>
  );
}
