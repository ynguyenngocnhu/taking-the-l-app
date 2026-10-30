import React from 'react';
import { ArrowRight, Film, Calculator, Send, ScanSearch, BadgeCheck } from 'lucide-react';
import { Button, Card, LMark, cx } from '../../components/ui.jsx';
import { PostCard, useVerifiedPosts } from '../../components/PostBits.jsx';
import { useStore, campaignLabel } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS } from '../../lib/score.js';
import { LOREALISTAR } from '../../data/mock.js';
import { Section, SampleNote } from './common.jsx';
import { Endorsement } from '../../components/Loreal.jsx';

function Hero() {
  return (
    <section className="gutter relative overflow-hidden bg-ink text-white">
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-8">
          <Endorsement tone="white" height={16} textClass="text-white/55" />
          <h1 className="font-black uppercase leading-[0.86] tracking-[-0.01em]" style={{ fontFamily: 'Archivo, system-ui, sans-serif', fontStretch: '78%', fontSize: 'clamp(64px, 13vw, 168px)' }}>
            Taking<br />the L.
          </h1>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="brand" as="a" href={href('standard')}>Explore the L Standard <ArrowRight size={18} /></Button>
            <Button size="lg" variant="light" as="a" href={href('studio')}>Creator Studio</Button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end" aria-hidden="true">
          <LMark size={300} className="hidden sm:inline-flex" />
          <LMark size={180} className="sm:hidden" />
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const items = [
    ['What L is', "A public standard from L'Oréal that measures how much a video weighs per view, and recognises posts that come in lighter than their market."],
    ['Why it matters', 'Every second of video is streamed to every viewer. Shorter, right-sized video carries the same story with less energy behind each view.'],
    ['How creators take part', 'Estimate a cut before posting, then submit the published post. Posts that qualify after verification carry the L Mark.'],
    ['How brands use it', 'Verified posts show their L-Score, L line and campaign, so brands can find and recognise qualifying content post by post.'],
  ];
  return (
    <Section eyebrow="Introducing L" title="A second number next to views.">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([t, d]) => (
          <div key={t} className="flex flex-col gap-3 bg-white p-6">
            <h3 className="text-[17px] font-bold">{t}</h3>
            <p className="text-[15px] leading-relaxed text-mute">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { Icon: Film, t: 'Create or publish a video', d: 'Any platform. Nothing to add to the video itself.' },
    { Icon: Calculator, t: 'Estimate its L-Score', d: 'Use the public estimator. No sign-in needed.' },
    { Icon: Send, t: 'Submit the published post', d: 'Paste the post link in Creator Studio.' },
    { Icon: ScanSearch, t: 'Checked against the L line', d: 'The platform verifies the post for its market and format.' },
    { Icon: BadgeCheck, t: 'Qualifying posts get the L Mark', d: 'With a verification ID and a public verification page.' },
  ];
  return (
    <Section eyebrow="How it works" title="Estimate first. Verification makes it official." className="bg-paper">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
        {[steps.slice(0, 2), steps.slice(2)].map((group, gi) => (
          <div key={gi} className={cx('flex flex-col gap-4 rounded-2xl p-5', gi === 0 ? 'border border-dashed border-line-strong bg-white' : 'bg-ink text-white')}>
            <span className={cx('eyebrow', gi === 1 && 'text-white/50')}>{gi === 0 ? 'Estimate · anyone' : 'Official · after verification'}</span>
            <ol className={cx('grid gap-4', gi === 0 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
              {group.map((s, i) => {
                const n = gi === 0 ? i + 1 : i + 3;
                return (
                  <li key={s.t} className="flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <span className={cx('flex h-8 w-8 items-center justify-center rounded-full font-mono text-[13px] font-bold', gi === 0 ? 'bg-paper' : 'bg-white/10')}>{n}</span>
                      {n === 5 ? <LMark size={22} /> : <s.Icon size={18} className={gi === 0 ? 'text-mute' : 'text-white/60'} />}
                    </span>
                    <b className="text-[15px]">{s.t}</b>
                    <span className={cx('text-[14px]', gi === 0 ? 'text-mute' : 'text-white/65')}>{s.d}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
      <p className="text-[14px] text-mute">An estimate is a guide. Only a verified post can carry the L Mark.</p>
    </Section>
  );
}

function Featured() {
  const { state } = useStore();
  const posts = useVerifiedPosts().filter((p, i, a) => a.findIndex((x) => x.creatorId === p.creatorId) === i).slice(0, 4);
  return (
    <Section eyebrow="Featured verified posts" title="Recognised, post by post.">
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {posts.map((p) => <PostCard key={p.id} p={p} creator={state.creators.find((c) => c.id === p.creatorId)} campaign={campaignLabel(state, p)} />)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SampleNote />
        <Button variant="outline" as="a" href={href('verified')}>All verified posts <ArrowRight size={16} /></Button>
      </div>
    </Section>
  );
}

function Community() {
  const withStar = Object.keys(LOREALISTAR).filter((k) => LOREALISTAR[k]).map((k) => MARKETS[k].name);
  return (
    <Section eyebrow="Join the L community" title="Start where you already create." className="bg-paper">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3 p-6">
          <span className="eyebrow">Markets with LOREALISTAR</span>
          <h3 className="text-[20px] font-bold">Keep your LOREALISTAR community. Add L to your posts.</h3>
          <p className="text-[15px] text-mute">L sits alongside LOREALISTAR. Your community stays there; L verifies and recognises qualifying posts. Example markets: {withStar.join(', ')}.</p>
          <Button variant="outline" as="a" href={href('join')} className="mt-auto self-start">Find your market</Button>
        </Card>
        <Card className="flex flex-col gap-3 p-6">
          <span className="eyebrow">Other markets</span>
          <h3 className="text-[20px] font-bold">Register your interest in L.</h3>
          <p className="text-[15px] text-mute">Tell us where you create. Local availability depends on rollout decisions in each market.</p>
          <Button variant="outline" as="a" href={href('join')} className="mt-auto self-start">Register interest</Button>
        </Card>
      </div>
    </Section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <HowItWorks />
      <Featured />
      <Community />
    </main>
  );
}
