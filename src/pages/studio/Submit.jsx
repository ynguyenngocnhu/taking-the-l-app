import React, { useEffect, useRef, useState } from 'react';
import { Link2, FileVideo, ArrowLeft, ArrowRight, Check, UploadCloud } from 'lucide-react';
import { Button, Card, PageHead, Seg, Field, Spinner, DemoNote, cx } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { go } from '../../lib/router.js';
import { PLATFORMS, RESOLUTIONS, MARKETS } from '../../lib/score.js';
import { ME, TODAY } from '../../data/mock.js';

const STEPS = ['Type', 'Details', 'L-Score'];

const SAMPLE_URL = 'https://tiktok.com/@alex.tran.makes/video/7431190040213';

function platformFromUrl(url) {
  const u = url.toLowerCase();
  if (!/^https?:\/\//.test(u)) return null;
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  return null;
}

// Demo stand-in for the platform APIs: same link always returns the same details.
function mockFetch(url) {
  if (url === SAMPLE_URL) return { views: 125000, secs: 30, res: '1080p', title: 'Brow tutorial, the 30 s cut' };
  const m = url.match(/\/video\/(\d{6,})|\/(?:reel|p)\/([\w-]{5,})|\/shorts\/([\w-]{5,})|[?&]v=([\w-]{5,})|youtu\.be\/([\w-]{5,})/i);
  if (!m) return null;
  let h = 7;
  for (const ch of url) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    views: Math.round((12000 + (h % 380000)) / 100) * 100,
    secs: [15, 20, 25, 30, 35, 45, 60][h % 7],
    res: h % 5 === 0 ? '720p' : '1080p',
    title: '',
  };
}

function FromLink() {
  return <span className="ml-1.5 rounded-full bg-paper px-2 py-0.5 align-middle text-[11px] font-semibold text-ink-2 ring-1 ring-inset ring-line">From link</span>;
}

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2" aria-current={i === step ? 'step' : undefined}>
          <span className={cx('flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold', i < step ? 'bg-ink text-white' : i === step ? 'bg-brand text-white' : 'border border-line-strong text-mute')}>
            {i < step ? <Check size={14} /> : i + 1}
          </span>
          <span className={cx('text-[13px] font-semibold', i === step ? 'text-ink' : 'text-mute')}>{s}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-5 bg-line-strong sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

function resFromHeight(w, h) {
  const s = Math.min(w, h);
  if (s >= 2000) return '4K';
  if (s >= 1300) return '1440p';
  if (s >= 900) return '1080p';
  return '720p';
}

export default function Submit() {
  const { state, dispatch } = useStore();
  const me = state.creators.find((c) => c.id === ME);
  const [step, setStep] = useState(0);
  const [type, setType] = useState('published');
  const [f, setF] = useState({ title: '', platform: 'TikTok', url: '', campaignId: '', market: me.market, secs: 30, res: '1080p', views: '' });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState(0);
  const fileRef = useRef(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v && v.target ? v.target.value : v }));
  const campaigns = state.campaigns.filter((c) => c.status === 'Live');

  const [lookup, setLookup] = useState({ status: 'idle' });

  // Paste a link: detect the platform and pull views, duration and resolution from the post.
  useEffect(() => {
    if (type !== 'published') return;
    const url = f.url.trim();
    const plat = platformFromUrl(url);
    if (!plat) { setLookup({ status: 'idle' }); return; }
    setF((x) => (x.platform === plat ? x : { ...x, platform: plat }));
    setLookup({ status: 'loading', platform: plat });
    const t = setTimeout(() => {
      const meta = mockFetch(url);
      if (!meta) { setLookup({ status: 'error', platform: plat }); return; }
      setF((x) => ({ ...x, views: String(meta.views), secs: meta.secs, res: meta.res, title: x.title || meta.title }));
      setErrors((e) => ({ ...e, url: null, views: null, secs: null }));
      setLookup({ status: 'done', platform: plat, meta });
    }, 900);
    return () => clearTimeout(t);
  }, [f.url, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const fromLink = (k) => lookup.status === 'done' && String(f[k]) === String(lookup.meta[k]);

  const fillSample = () => {
    setF((x) => ({ ...x, title: '', platform: 'TikTok', url: SAMPLE_URL, campaignId: 'k2' }));
    setErrors({});
  };

  const onFile = (e) => {
    const fl = e.target.files && e.target.files[0];
    if (!fl) return;
    if (!fl.type.startsWith('video/')) {
      setErrors((x) => ({ ...x, file: 'That file is not a video. Choose an MP4 or MOV.' }));
      return;
    }
    const url = URL.createObjectURL(fl);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      const secs = Math.max(1, Math.round(v.duration || 0));
      setF((x) => ({ ...x, secs, res: v.videoWidth ? resFromHeight(v.videoWidth, v.videoHeight) : x.res, title: x.title || fl.name.replace(/\.[^.]+$/, '') }));
      setFile({ name: fl.name, secs, w: v.videoWidth, h: v.videoHeight });
      setErrors((x) => ({ ...x, file: null }));
      URL.revokeObjectURL(url);
    };
    v.onerror = () => {
      setFile({ name: fl.name });
      setErrors((x) => ({ ...x, file: 'Could not read this video in the browser. Enter duration and resolution by hand.' }));
    };
    v.src = url;
  };

  const validate = () => {
    const e = {};
    if (!f.title.trim()) e.title = 'Give the video a title so you can find it later.';
    const secs = Number(f.secs);
    if (!Number.isFinite(secs) || secs < 1 || secs > 600) e.secs = 'Enter a duration between 1 and 600 seconds.';
    if (type === 'published') {
      const host = PLATFORMS[f.platform].host;
      if (!/^https?:\/\//i.test(f.url) || !f.url.toLowerCase().includes(host)) e.url = `Paste the full ${f.platform} link, starting with https:// and containing ${host}.`;
      else if (state.posts.some((p) => p.url === f.url.trim())) e.url = 'This post was already submitted. Find it in My posts.';
      const views = Number(String(f.views).replace(/[, ]/g, ''));
      if (!Number.isInteger(views) || views < 1) e.views = 'Enter the current view count as a whole number.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;
    setStep(2);
    setPhase(0);
  };

  useEffect(() => {
    if (step !== 2) return;
    if (phase < 3) {
      const t = setTimeout(() => setPhase((p) => p + 1), 550);
      return () => clearTimeout(t);
    }
    const id = `p${Date.now().toString(36)}`;
    const post = {
      id, creatorId: ME, title: f.title.trim(), platform: f.platform, url: type === 'published' ? f.url.trim() : '',
      campaignId: f.campaignId || null, secs: Number(f.secs), res: f.res, market: f.market,
      views: type === 'published' ? Number(String(f.views).replace(/[, ]/g, '')) : 0,
      type, status: type === 'draft' ? 'draft' : 'review', submitted: TODAY, verified: null, notes: [], thumb: Math.floor(Math.random() * 8),
    };
    dispatch({ type: 'submit', post });
    go(`studio-post-${id}`);
  }, [step, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHead eyebrow="Submit a video" title={step === 0 ? 'What are you submitting?' : step === 1 ? 'Video details' : 'Calculating your L-Score'} />
      <Stepper step={step} />

      {step === 0 && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Submission type">
            {[
              { v: 'published', t: 'Published social media post', d: 'Paste the link to a live post. Verified posts can earn the L Mark.', Icon: Link2 },
              { v: 'draft', t: 'Draft video', d: 'Check a cut before you post. You get an estimated L-Score. Drafts never receive the L Mark.', Icon: FileVideo },
            ].map((o) => {
              const on = type === o.v;
              return (
                <button key={o.v} type="button" role="radio" aria-checked={on} onClick={() => setType(o.v)} className={cx('flex flex-col gap-3 rounded-2xl border-2 bg-white p-5 text-left transition-colors', on ? 'border-ink' : 'border-line hover:border-line-strong')}>
                  <span className="flex items-center justify-between">
                    <span className={cx('flex h-11 w-11 items-center justify-center rounded-xl', on ? 'bg-brand text-white' : 'bg-paper')}><o.Icon size={20} /></span>
                    <span className={cx('flex h-5 w-5 items-center justify-center rounded-full border-2', on ? 'border-ink bg-ink' : 'border-line-strong')}>{on && <span className="h-2 w-2 rounded-full bg-brand" />}</span>
                  </span>
                  <b className="text-[17px]">{o.t}</b>
                  <span className="text-[14px] text-mute">{o.d}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end"><Button onClick={() => setStep(1)}>Continue <ArrowRight size={16} /></Button></div>
        </div>
      )}

      {step === 1 && (
        <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); calculate(); }} noValidate>
          <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="eyebrow">{type === 'published' ? 'Published post' : 'Draft video'}</span>
              {type === 'published' && <button type="button" onClick={fillSample} className="text-[13px] font-semibold text-brand-deep hover:underline">Fill with a sample post</button>}
            </div>
            <Field label="Social platform">
              <Seg label="Social platform" options={Object.keys(PLATFORMS)} value={f.platform} onChange={set('platform')} />
            </Field>
            {type === 'published' ? (
              <Field label="Video URL" htmlFor="f-url" error={errors.url}>
                <input id="f-url" className={cx('input', errors.url && 'input-error')} inputMode="url" placeholder={`https://${PLATFORMS[f.platform].host}/…`} value={f.url} onChange={set('url')} />
                {lookup.status === 'loading' && <span className="flex items-center gap-2 text-[13px] text-mute"><Spinner size={13} /> Reading the post from {lookup.platform}…</span>}
                {lookup.status === 'done' && <span className="flex items-start gap-1.5 text-[13px] text-ink-2"><Check size={15} className="mt-[2px] shrink-0 text-brand-deep" /><span>Pulled from the post: <b className="font-mono">{Number(lookup.meta.views).toLocaleString('en-US')} views · {lookup.meta.secs} s · {lookup.meta.res}</b>. You can still edit them.</span></span>}
                {lookup.status === 'error' && <span className="text-[13px] text-warn">Couldn't read a post from this link. Check it's a public post link, or enter views and duration by hand.</span>}
              </Field>
            ) : (
              <Field label="Upload video" error={errors.file} hint="Read in your browser to fill duration and resolution. Nothing is uploaded in this demo.">
                <label htmlFor="f-file" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-paper px-4 py-7 text-center hover:border-ink focus-within:border-ink">
                  <UploadCloud size={26} className="text-mute" />
                  {file ? (
                    <span className="text-[14px]"><b>{file.name}</b>{file.secs ? <span className="block font-mono text-[12px] text-mute">{file.secs} s · {file.w}×{file.h}</span> : null}</span>
                  ) : (
                    <span className="text-[14px]"><b>Choose a video</b> <span className="text-mute">or drop it here</span></span>
                  )}
                  <input ref={fileRef} id="f-file" type="file" accept="video/*" className="sr-only" onChange={onFile} />
                </label>
              </Field>
            )}
            <Field label="Title" htmlFor="f-title" error={errors.title}>
              <input id="f-title" className={cx('input', errors.title && 'input-error')} placeholder="e.g. 30-second morning routine" value={f.title} onChange={set('title')} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Campaign (optional)" htmlFor="f-camp">
                <select id="f-camp" className="input" value={f.campaignId} onChange={set('campaignId')}>
                  <option value="">No campaign</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.brand}{me.campaigns.includes(c.id) ? '' : ' (not joined)'}</option>)}
                </select>
              </Field>
              <Field label="Market" htmlFor="f-market" hint="Where most of your audience watches.">
                <select id="f-market" className="input" value={f.market} onChange={set('market')}>
                  {Object.entries(MARKETS).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={<>Video duration (seconds){fromLink('secs') && <FromLink />}</>} htmlFor="f-secs" error={errors.secs}>
                <div className="flex flex-col gap-2">
                  <input id="f-secs" type="number" min="1" max="600" className={cx('input font-mono', errors.secs && 'input-error')} value={f.secs} onChange={set('secs')} />
                  <div className="flex gap-1.5">
                    {[15, 30, 45, 60].map((n) => (
                      <button key={n} type="button" onClick={() => set('secs')(n)} className={cx('h-8 flex-1 rounded-full border font-mono text-[12px] font-semibold', Number(f.secs) === n ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink')}>{n}s</button>
                    ))}
                  </div>
                </div>
              </Field>
              <Field label={<>Resolution{fromLink('res') && <FromLink />}</>}>
                <Seg label="Resolution" options={Object.keys(RESOLUTIONS)} value={f.res} onChange={set('res')} />
              </Field>
            </div>
            {type === 'published' && (
              <Field label={<>Views{fromLink('views') && <FromLink />}</>} htmlFor="f-views" error={errors.views} hint={type === 'published' ? 'Filled in from the link. Edit it if the post has grown since.' : undefined}>
                <input id="f-views" inputMode="numeric" className={cx('input font-mono', errors.views && 'input-error')} placeholder="125000" value={f.views} onChange={set('views')} />
              </Field>
            )}
          </Card>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</Button>
            <Button type="submit" disabled={lookup.status === 'loading'}>Calculate L-Score <ArrowRight size={16} /></Button>
          </div>
          <DemoNote>{type === 'published' ? 'In the live product, views, duration and resolution come from the platform once the creator connects their account. Here the lookup is simulated. ' : ''}The L-Score uses a fixed demo formula. It is illustrative, not a real carbon calculation.</DemoNote>
        </form>
      )}

      {step === 2 && (
        <Card className="flex flex-col items-center gap-6 px-6 py-12 text-center" aria-live="polite">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white"><Spinner size={24} /></span>
          <ul className="flex flex-col gap-2 text-left text-[15px]">
            {['Reading the video details', 'Applying the L Standard', `Comparing with the ${MARKETS[f.market].name} L line`].map((t, i) => (
              <li key={t} className={cx('flex items-center gap-2 transition-opacity', phase > i ? 'opacity-100' : phase === i ? 'opacity-100' : 'opacity-30')}>
                {phase > i ? <Check size={16} className="text-brand-deep" /> : phase === i ? <Spinner size={14} /> : <span className="h-4 w-4" />}
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
