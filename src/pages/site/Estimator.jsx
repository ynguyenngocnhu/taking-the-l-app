import React, { useMemo, useRef, useState } from 'react';
import { Link2, UploadCloud, SlidersHorizontal, Info, ArrowRight } from 'lucide-react';
import { Button, Card, Field, Seg, ScoreBar, Spinner, cx } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS, PLATFORMS, RESOLUTIONS, FORMATS, fmt, lScore, lineFor, formatOf, factors } from '../../lib/score.js';
import { SAMPLE_URL, platformFromUrl, mockFetch, resFromHeight } from '../../lib/lookup.js';
import { PageHero } from './common.jsx';

export default function Estimator() {
  const { state } = useStore();
  const [mode, setMode] = useState('manual');
  const [f, setF] = useState({ secs: 30, res: '1080p', platform: 'TikTok', market: 'VN' });
  const [url, setUrl] = useState('');
  const [link, setLink] = useState({ status: 'idle' });
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const score = lScore(f);
  const line = lineFor(state.benchmarks, f.market, f.secs);
  const under = score <= line;
  const rows = useMemo(() => factors(f), [f]);

  const readLink = () => {
    const platform = platformFromUrl(url);
    if (!platform) return setLink({ status: 'error', msg: 'Paste a full TikTok, Instagram or YouTube link that starts with https://' });
    setLink({ status: 'loading' });
    setTimeout(() => {
      const d = mockFetch(url);
      if (!d) return setLink({ status: 'error', msg: 'That link does not look like a single video post.' });
      setF((x) => ({ ...x, platform, secs: d.secs, res: d.res }));
      setLink({ status: 'ok', views: d.views, platform });
    }, 700);
  };

  const onFile = (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      const secs = Math.max(1, Math.round(v.duration || 0));
      const res = v.videoWidth ? resFromHeight(v.videoWidth, v.videoHeight) : '1080p';
      setF((x) => ({ ...x, secs: Math.min(600, secs), res }));
      setFile({ name: fl.name, secs, res, dims: v.videoWidth ? `${v.videoWidth}×${v.videoHeight}` : 'unknown' });
      URL.revokeObjectURL(v.src);
    };
    v.onerror = () => setFile({ name: fl.name, error: true });
    v.src = URL.createObjectURL(fl);
  };

  return (
    <main>
      <PageHero eyebrow="No sign-in needed" title="L-Score Estimator" intro="Check how heavy a video is per view before or after you post. Enter the details, paste a public link, or pick a video file. Nothing is uploaded or stored." />
      <section className="gutter py-10 sm:py-14">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <Seg label="How to estimate" value={mode} onChange={setMode} options={[{ value: 'manual', label: 'Enter details' }, { value: 'link', label: 'Paste a link' }, { value: 'file', label: 'Pick a file' }]} />

            {mode === 'link' && (
              <div className="flex flex-col gap-2">
                <Field label="Public post link" htmlFor="est-url" hint="Demo: the prototype reads sample details from the link." error={link.status === 'error' ? link.msg : null}>
                  <div className="flex gap-2">
                    <input id="est-url" className="input min-w-0 flex-1" placeholder="https://tiktok.com/@you/video/…" value={url} onChange={(e) => setUrl(e.target.value)} />
                    <Button onClick={readLink} disabled={!url || link.status === 'loading'}>{link.status === 'loading' ? <Spinner /> : <Link2 size={16} />} Read</Button>
                  </div>
                </Field>
                {!url && <button type="button" className="self-start text-[13px] font-semibold underline" onClick={() => setUrl(SAMPLE_URL)}>Use a sample link</button>}
                {link.status === 'ok' && <p className="rounded-xl bg-paper p-3 text-[13px]">Read from the link: {link.platform}, {f.secs} s, {f.res}, {fmt(link.views)} views. Check and adjust below.</p>}
              </div>
            )}

            {mode === 'file' && (
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong px-4 py-8 text-center hover:border-ink">
                  <UploadCloud size={26} className="text-mute" />
                  <b className="text-[15px]">{file ? file.name : 'Choose a video file'}</b>
                  <span className="text-[13px] text-mute">Read on your device for length and resolution. It never leaves your browser.</span>
                </button>
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={onFile} />
                {file && !file.error && <p className="rounded-xl bg-paper p-3 text-[13px]">Read from the file: {file.secs} s at {file.dims} ({file.res}). Pick the platform and market below.</p>}
                {file?.error && <p className="text-[13px] text-bad">This browser could not read that file. Enter the details instead.</p>}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Duration (seconds)" htmlFor="est-secs" hint={`${FORMATS[formatOf(f.secs)].name} · ${FORMATS[formatOf(f.secs)].note}`}>
                <div className="flex items-center gap-3">
                  <input id="est-secs-range" type="range" min="5" max="300" value={Math.min(300, f.secs)} onChange={(e) => set('secs')(Number(e.target.value))} className="min-w-0 flex-1 accent-[#111]" aria-label="Duration slider" />
                  <input id="est-secs" type="number" min="1" max="600" value={f.secs} onChange={(e) => set('secs')(Math.max(1, Math.min(600, Number(e.target.value) || 1)))} className="input w-20 text-center font-mono" />
                </div>
              </Field>
              <Field label="Top resolution" htmlFor="est-res">
                <select id="est-res" className="input" value={f.res} onChange={(e) => set('res')(e.target.value)}>
                  {Object.keys(RESOLUTIONS).map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Platform" htmlFor="est-platform">
                <select id="est-platform" className="input" value={f.platform} onChange={(e) => set('platform')(e.target.value)}>
                  {Object.keys(PLATFORMS).map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Main market (where it is watched)" htmlFor="est-market">
                <select id="est-market" className="input" value={f.market} onChange={(e) => set('market')(e.target.value)}>
                  {Object.entries(MARKETS).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-5 border-dashed border-line-strong p-5 sm:p-6" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="eyebrow">Estimated L-Score</span>
                <span className="rounded-full border border-dashed border-ink/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-2">Estimate · not an official verification</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="display text-[64px] font-black leading-none tnum">{fmt(score)}</span>
                <span className="pb-2 text-[14px] text-mute">g CO₂e per 1,000 views</span>
              </div>
              <ScoreBar score={score} line={line} />
              <p className="text-[15px]">
                {under
                  ? <>This estimate is <b>at or under</b> the {fmt(line)} g L line for {MARKETS[f.market].name}, {FORMATS[formatOf(f.secs)].name.toLowerCase()}. To be recognised, publish it and submit the post for verification.</>
                  : <>This estimate is <b>over</b> the {fmt(line)} g L line for {MARKETS[f.market].name}, {FORMATS[formatOf(f.secs)].name.toLowerCase()}.</>}
              </p>
              <p className="flex items-start gap-2 text-[12px] text-mute"><Info size={14} className="mt-0.5 shrink-0" /> Estimates never carry the L Mark. Only a published post verified through Creator Studio can qualify. Prototype figures are illustrative.</p>
            </Card>

            <Card className="flex flex-col gap-3 p-5 sm:p-6">
              <span className="eyebrow">What drives this estimate</span>
              <ul className="flex flex-col divide-y divide-line">
                {rows.map((r) => (
                  <li key={r.key} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <span className="text-[14px] font-semibold">{r.key} <span className="font-mono font-normal text-mute">{r.value}</span></span>
                    <span className="text-[13px] text-mute sm:max-w-[55%] sm:text-right">{r.note}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="brand" as="a" href={href('studio-submit')}>Submit a published post <ArrowRight size={16} /></Button>
              <Button variant="outline" as="a" href={href('standard')}><SlidersHorizontal size={16} /> How the score works</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
