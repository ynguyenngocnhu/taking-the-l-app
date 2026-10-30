import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Link2, Leaf, Megaphone, AlertTriangle } from 'lucide-react';
import { Button, Card, Field, PageHead, ScoreBar, Spinner, DemoNote, cx } from '../../components/ui.jsx';
import { useStore, useMe } from '../../lib/store.jsx';
import { go, href } from '../../lib/router.js';
import { PLATFORMS, RESOLUTIONS, MARKETS, FORMATS, fmt, lScore, lineFor, formatOf } from '../../lib/score.js';
import { SAMPLE_URL, platformFromUrl, mockFetch } from '../../lib/lookup.js';
import { ORGANIC, TODAY } from '../../data/mock.js';

const STEPS = ['Platform', 'Link', 'Campaign', 'Details', 'Submit'];

function Stepper({ step }) {
  return (
    <ol className="scroll-x flex items-center gap-2" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex shrink-0 items-center gap-2" aria-current={i === step ? 'step' : undefined}>
          <span className={cx('flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold', i < step ? 'bg-ink text-white' : i === step ? 'bg-brand text-white' : 'border border-line-strong text-mute')}>
            {i < step ? <Check size={14} /> : i + 1}
          </span>
          <span className={cx('text-[13px] font-semibold', i === step ? 'text-ink' : 'text-mute', i !== step && 'hidden sm:inline')}>{s}</span>
          {i < STEPS.length - 1 && <span className="mx-0.5 h-px w-4 bg-line-strong sm:w-8" />}
        </li>
      ))}
    </ol>
  );
}

function Choice({ on, onClick, children, className }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={cx('flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors', on ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink', className)}>
      <span className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-white' : 'border-line-strong')}>{on && <span className="h-2.5 w-2.5 rounded-full bg-white" />}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</span>
    </button>
  );
}

export default function Submit({ preset }) {
  const { state, dispatch, notify } = useStore();
  const me = useMe();
  const accounts = me.accounts?.length ? me.accounts : [{ platform: me.platform, handle: me.handle }];
  const joined = state.campaigns.filter((c) => c.status === 'Live' && me.campaigns.includes(c.id) && c.markets.includes(me.market));
  const presetOk = joined.some((c) => c.id === preset);

  const [step, setStep] = useState(0);
  const [f, setF] = useState({ platform: accounts[0].platform, url: '', campaignId: presetOk ? preset : '', title: '', market: me.market, secs: 30, res: '1080p', views: '' });
  const [lookup, setLookup] = useState({ status: 'idle' });
  const [err, setErr] = useState({});
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v && v.target ? v.target.value : v }));
  const account = accounts.find((a) => a.platform === f.platform);

  const readLink = (url) => {
    const platform = platformFromUrl(url);
    if (!platform) return setLookup({ status: 'error', msg: 'Paste the full post link, starting with https://' });
    if (platform !== f.platform) return setLookup({ status: 'error', msg: `That is a ${platform} link. You chose ${f.platform}.` });
    if (state.posts.some((p) => p.url === url.trim())) return setLookup({ status: 'error', msg: 'This post has already been submitted.' });
    setLookup({ status: 'loading' });
    setTimeout(() => {
      const d = mockFetch(url);
      if (!d) return setLookup({ status: 'error', msg: 'That link does not look like a single video post.' });
      const handle = account?.handle?.replace('@', '').toLowerCase();
      const mismatch = platform === 'TikTok' && handle && !url.toLowerCase().includes(`@${handle}`);
      setF((x) => ({ ...x, url: url.trim(), secs: d.secs, res: d.res, views: String(d.views), title: x.title || d.title }));
      setLookup({ status: 'ok', mismatch });
    }, 700);
  };

  const next = () => {
    const er = {};
    if (step === 1 && lookup.status !== 'ok') er.url = 'Read the link first';
    if (step === 3) {
      if (!f.title.trim()) er.title = 'Add a short title';
      if (!(Number(f.secs) > 0)) er.secs = 'Add the duration';
      if (!(Number(f.views) >= 0) || f.views === '') er.views = 'Add the view count';
    }
    setErr(er);
    if (!Object.keys(er).length) setStep(step + 1);
  };

  const post = { secs: Number(f.secs) || 1, res: f.res, platform: f.platform, market: f.market };
  const est = lScore(post);
  const line = lineFor(state.benchmarks, f.market, post.secs);
  const campaignName = f.campaignId ? state.campaigns.find((c) => c.id === f.campaignId)?.name : ORGANIC;

  const submit = () => {
    const id = `p${Date.now().toString(36)}`;
    dispatch({
      type: 'submit',
      post: {
        id, creatorId: me.id, title: f.title.trim(), platform: f.platform, url: f.url, secs: post.secs, res: f.res, market: f.market,
        views: Number(f.views), campaignId: f.campaignId || null,
        status: 'review', submitted: TODAY, verified: null, thumb: Math.floor(Math.random() * 8), notes: [],
      },
    });
    notify('Submitted · pending verification');
    go(`studio-post-${id}`);
  };

  return (
    <div className="flex max-w-[760px] flex-col gap-6">
      <PageHead eyebrow="Submit a Post" title="Submit a published post" sub="Verification checks the post, its account and its inputs, then compares its L-Score with the L line." />
      <Stepper step={step} />
      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        {step === 0 && (
          <div role="radiogroup" aria-label="Platform" className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold">Where is the post published?</h2>
            {Object.keys(PLATFORMS).map((pl) => {
              const acc = accounts.find((a) => a.platform === pl);
              return (
                <Choice key={pl} on={f.platform === pl} onClick={() => { set('platform')(pl); setLookup({ status: 'idle' }); }} className={!acc ? 'opacity-50' : ''}>
                  <b>{pl}</b>
                  <span className={cx('text-[13px]', f.platform === pl ? 'text-white/70' : 'text-mute')}>{acc ? acc.handle : 'No account on your profile'}</span>
                </Choice>
              );
            })}
            {!account && <p className="flex items-center gap-1.5 text-[13px] text-bad"><AlertTriangle size={14} /> Add a {f.platform} account in <a className="underline" href={href('studio-profile')}>My Profile</a> first.</p>}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold">Paste the post link</h2>
            <Field label={`${f.platform} post link`} htmlFor="s-url" error={lookup.status === 'error' ? lookup.msg : err.url} hint={`It must be public and posted from ${account?.handle}.`}>
              <div className="flex gap-2">
                <input id="s-url" className="input min-w-0 flex-1 font-mono text-[13px]" value={f.url} onChange={(e) => { set('url')(e.target.value); setLookup({ status: 'idle' }); }} placeholder="https://…" />
                <Button onClick={() => readLink(f.url)} disabled={!f.url || lookup.status === 'loading'}>{lookup.status === 'loading' ? <Spinner /> : <Link2 size={16} />} Read</Button>
              </div>
            </Field>
            {!f.url && f.platform === 'TikTok' && me.id === 'c1' && <button type="button" className="self-start text-[13px] font-semibold underline" onClick={() => set('url')(SAMPLE_URL)}>Use a sample link</button>}
            {lookup.status === 'ok' && (
              <div className="flex flex-col gap-2 rounded-xl bg-paper p-4 text-[14px]">
                <span className="flex items-center gap-2 font-semibold"><Check size={16} /> Post found</span>
                <span className="text-mute">{f.secs} s · {f.res} · {fmt(Number(f.views))} views. You can check these in Details.</span>
                {lookup.mismatch && <span className="flex items-start gap-1.5 text-warn"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> The link does not show {account.handle}. Verification will reject it if the account does not match.</span>}
              </div>
            )}
            <DemoNote>Demo: details are read from the link with sample data. A live version would read them from the platform.</DemoNote>
          </div>
        )}

        {step === 2 && (
          <div role="radiogroup" aria-label="Campaign" className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold">Is this post for a campaign?</h2>
            {joined.map((c) => (
              <Choice key={c.id} on={f.campaignId === c.id} onClick={() => set('campaignId')(c.id)}>
                <b className="flex items-center gap-1.5"><Megaphone size={14} /> {c.name}</b>
                <span className={cx('text-[13px]', f.campaignId === c.id ? 'text-white/70' : 'text-mute')}>{c.brand} · submit by {c.deadline}</span>
              </Choice>
            ))}
            <Choice on={!f.campaignId} onClick={() => set('campaignId')('')}>
              <b className="flex items-center gap-1.5"><Leaf size={14} /> {ORGANIC}</b>
              <span className={cx('text-[13px]', !f.campaignId ? 'text-white/70' : 'text-mute')}>Your own content, not tied to a brief. It counts towards L Creator the same way.</span>
            </Choice>
            {!joined.length && <p className="text-[13px] text-mute">You have not joined a live campaign in {MARKETS[me.market].name}. <a href={href('studio-campaigns')} className="font-semibold text-ink underline">See campaigns</a></p>}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-bold">Check the details</h2>
            <Field label="Title" htmlFor="s-title" error={err.title}><input id="s-title" className="input" value={f.title} onChange={set('title')} placeholder="What the post is" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Duration (seconds)" htmlFor="s-secs" error={err.secs} hint={FORMATS[formatOf(post.secs)].name}><input id="s-secs" type="number" min="1" className="input font-mono" value={f.secs} onChange={set('secs')} /></Field>
              <Field label="Top resolution" htmlFor="s-res"><select id="s-res" className="input" value={f.res} onChange={set('res')}>{Object.keys(RESOLUTIONS).map((r) => <option key={r}>{r}</option>)}</select></Field>
              <Field label="Views today" htmlFor="s-views" error={err.views}><input id="s-views" type="number" min="0" className="input font-mono" value={f.views} onChange={set('views')} /></Field>
              <Field label="Main market" htmlFor="s-market"><select id="s-market" className="input" value={f.market} onChange={set('market')}>{Object.entries(MARKETS).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}</select></Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-bold">Ready to submit</h2>
            <dl className="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
              {[['Title', f.title], ['Platform', `${f.platform} · ${account?.handle}`], ['Campaign', campaignName], ['Market', MARKETS[f.market].name], ['Inputs', `${post.secs} s · ${f.res} · ${fmt(Number(f.views))} views`]].map(([k, v]) => (
                <div key={k} className="flex flex-col border-t border-line pt-2"><dt className="text-[12px] text-mute">{k}</dt><dd className="break-words font-semibold">{v}</dd></div>
              ))}
              <div className="flex flex-col border-t border-line pt-2 sm:col-span-2"><dt className="text-[12px] text-mute">Link</dt><dd className="break-all font-mono text-[12px]">{f.url}</dd></div>
            </dl>
            <div className="flex flex-col gap-1 rounded-xl border border-dashed border-line-strong p-4">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-mute">Estimated L-Score · not official until verified</span>
              <span className="display text-[34px] font-black tnum">{fmt(est)} <span className="text-[14px] font-normal text-mute">g per 1,000 views</span></span>
              <ScoreBar score={est} line={line} compact />
              <span className="text-[13px] text-mute">L line {fmt(line)} g for {MARKETS[f.market].name}, {FORMATS[formatOf(post.secs)].name.toLowerCase()}.</span>
            </div>
            <p className="text-[13px] text-mute">After you submit, the post shows as pending verification. The L Mark appears only if it is verified at or below its L line.</p>
          </div>
        )}

        <div className="flex justify-between gap-2 border-t border-line pt-4">
          {step > 0 ? <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</Button> : <span />}
          {step < 4
            ? <Button onClick={next} disabled={step === 0 && !account}>Continue <ArrowRight size={16} /></Button>
            : <Button variant="brand" onClick={submit}>Submit for verification</Button>}
        </div>
      </Card>
    </div>
  );
}
