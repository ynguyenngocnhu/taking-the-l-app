import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Check, Users, Send } from 'lucide-react';
import { Button, Card, Field, cx } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS, PLATFORMS } from '../../lib/score.js';
import { LOREALISTAR, LOREALISTAR_URL, TODAY } from '../../data/mock.js';
import { PageHero, SampleNote } from './common.jsx';

function StarPath({ market }) {
  return (
    <Card className="flex flex-col gap-5 p-6">
      <span className="eyebrow">{MARKETS[market].name} · LOREALISTAR market</span>
      <h2 className="text-[24px] font-bold leading-tight">Keep creating with LOREALISTAR. Use L for your posts.</h2>
      <p className="text-[15px] text-ink-2">LOREALISTAR is L'Oréal's creator community in {MARKETS[market].name}. L does not replace it. L is a separate standard that verifies individual posts and recognises the ones that come in under the L line.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl bg-paper p-4"><b>LOREALISTAR</b><span className="text-[14px] text-mute">Your creator community, programmes and opportunities.</span></div>
        <div className="flex flex-col gap-1 rounded-xl bg-paper p-4"><b>L</b><span className="text-[14px] text-mute">Estimate, submit and verify posts. Qualifying posts carry the L Mark.</span></div>
      </div>
      <p className="text-[13px] text-mute">The two are separate today: you sign in to each on its own, and nothing is shared between them automatically.</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" as="a" href={LOREALISTAR_URL} target="_blank" rel="noreferrer">Explore LOREALISTAR <ArrowUpRight size={16} /></Button>
        <Button variant="brand" as="a" href={href('studio')}>Open Creator Studio <ArrowRight size={16} /></Button>
      </div>
    </Card>
  );
}

function InterestPath({ market }) {
  const { state, dispatch, notify } = useStore();
  const [f, setF] = useState({ name: '', email: '', handle: '', platform: 'TikTok' });
  const [err, setErr] = useState({});
  const done = state.interest.some((i) => i.market === market && i.email === f.email && f.email);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Add your name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Add an email address';
    setErr(er);
    if (Object.keys(er).length) return;
    dispatch({ type: 'interest', entry: { ...f, market, date: TODAY } });
    setSent(true);
    notify('Interest registered');
  };
  return (
    <Card className="flex flex-col gap-5 p-6">
      <span className="eyebrow">{MARKETS[market].name}</span>
      <h2 className="text-[24px] font-bold leading-tight">Register your interest in L.</h2>
      <p className="text-[15px] text-ink-2">L is not confirmed for {MARKETS[market].name} yet. Leave your details and the L team will contact you if and when it opens here. In the meantime, the estimator is open to everyone.</p>
      {sent || done ? (
        <div className="flex items-start gap-3 rounded-xl bg-paper p-4 text-[15px]"><Check size={18} className="mt-0.5 shrink-0" /><span>Thanks, {f.name.split(' ')[0] || 'you'}. Your interest for {MARKETS[market].name} is registered. This is not a sign-up and does not guarantee access.</span></div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Name" htmlFor="i-name" error={err.name}><input id="i-name" className="input" value={f.name} onChange={set('name')} /></Field>
          <Field label="Email" htmlFor="i-email" error={err.email}><input id="i-email" type="email" className="input" value={f.email} onChange={set('email')} /></Field>
          <Field label="Main platform" htmlFor="i-platform"><select id="i-platform" className="input" value={f.platform} onChange={set('platform')}>{Object.keys(PLATFORMS).map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label="Handle (optional)" htmlFor="i-handle"><input id="i-handle" className="input" placeholder="@you" value={f.handle} onChange={set('handle')} /></Field>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="submit" variant="brand"><Send size={16} /> Register interest</Button>
            <Button variant="outline" as="a" href={href('estimator')}>Try the estimator</Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function Join() {
  const [market, setMarket] = useState('VN');
  return (
    <main>
      <PageHero eyebrow="Join L" title="Start where you create" intro="Pick your market. Where L'Oréal runs LOREALISTAR, L sits alongside it. Elsewhere, you can register your interest." />
      <section className="gutter py-10 sm:py-14">
        <div className="mx-auto grid max-w-[1240px] gap-6 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-3">
            <span className="label">Your market</span>
            <div role="radiogroup" aria-label="Market" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {Object.entries(MARKETS).map(([k, m]) => (
                <button key={k} type="button" role="radio" aria-checked={market === k} onClick={() => setMarket(k)} className={cx('flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-[15px] font-semibold transition-colors', market === k ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink')}>
                  {m.name}
                  {LOREALISTAR[k] && <span className={cx('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', market === k ? 'bg-white/15 text-white' : 'bg-paper text-ink-2')}>LOREALISTAR</span>}
                </button>
              ))}
            </div>
            <SampleNote>Which markets run LOREALISTAR is shown for illustration. Confirm per market before launch.</SampleNote>
          </div>
          <div className="flex flex-col gap-4">
            {LOREALISTAR[market] ? <StarPath market={market} /> : <InterestPath market={market} />}
            <Card className="flex items-start gap-3 p-5">
              <Users size={20} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1 text-[14px]">
                <b className="text-[15px]">Any creator can take part</b>
                <span className="text-mute">There is no follower minimum. What counts is each post: estimate it, publish it, submit it. Brand teams and agencies can browse verified posts on <a className="font-semibold text-ink underline" href={href('brands')}>For Brands</a>.</span>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
