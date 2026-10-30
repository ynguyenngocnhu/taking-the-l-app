import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, SlidersHorizontal, Info, ArrowRight, Scissors, MonitorPlay, Copy, RotateCcw, Check, ShieldCheck, Sparkles, FileVideo } from 'lucide-react';
import { Button, Card, Field, Seg, ScoreBar, Spinner, LMark, cx } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS, PLATFORMS, RESOLUTIONS, FORMATS, fmt, lScore, lineFor, formatOf, factors } from '../../lib/score.js';
import { resFromHeight } from '../../lib/lookup.js';
import { PageHero } from './common.jsx';

// Every input carries where its value came from, so the creator can tell what the estimate rests on.
const SOURCES = {
  detected: { label: 'Detected', cls: 'bg-ink text-white', note: 'Read from the video file' },
  entered: { label: 'Entered', cls: 'border border-ink text-ink', note: 'You typed or picked it' },
  assumed: { label: 'Assumed', cls: 'border border-dashed border-ink/40 text-mute', note: 'A default. Change it if it is wrong' },
};

function Src({ s }) {
  const x = SOURCES[s];
  return <span title={x.note} className={cx('inline-flex h-5 items-center rounded-full px-2 text-[10.5px] font-bold uppercase tracking-wider', x.cls)}>{x.label}</span>;
}

function Labelled({ label, s, htmlFor, hint, children }) {
  return (
    <Field label={<span className="flex items-center justify-between gap-2"><span>{label}</span><Src s={s} /></span>} htmlFor={htmlFor} hint={hint}>
      {children}
    </Field>
  );
}

const START = { platform: 'TikTok', secs: 30, res: '1080p', market: 'VN', views: '' };
const ASSUMED = { platform: 'assumed', secs: 'assumed', res: 'assumed', market: 'assumed', views: 'assumed' };
const SAMPLE = { name: 'sample-grwm-edit.mp4', secs: 45, res: '1080p', dims: '1080×1920', size: '38.4 MB' };
const clampSecs = (n) => Math.max(1, Math.min(600, Math.round(Number(n) || 1)));
const kg = (g) => (g >= 1000 ? `${(g / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} kg` : `${fmt(Math.round(g))} g`);

export default function Estimator() {
  const { state } = useStore();
  const [method, setMethod] = useState('upload');
  const [f, setF] = useState(START);
  const [src, setSrc] = useState(ASSUMED);
  const [file, setFile] = useState(null); // { status: 'reading' | 'ok' | 'error', name, ... }
  const fileRef = useRef(null);

  const enter = (k) => (v) => {
    setF((x) => ({ ...x, [k]: v }));
    setSrc((x) => ({ ...x, [k]: 'entered' }));
  };

  const switchMethod = (m) => {
    setMethod(m);
    // Detected values only make sense while a video is loaded.
    if (m === 'manual') setSrc((x) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, v === 'detected' ? 'entered' : v])));
  };

  // Demo: metadata extraction is simulated with a short delay. Duration and resolution are read from the file on this device.
  const extract = (meta) => {
    setFile({ status: 'reading', name: meta.name });
    setTimeout(() => {
      setF((x) => ({ ...x, secs: clampSecs(meta.secs), res: meta.res }));
      setSrc((x) => ({ ...x, secs: 'detected', res: 'detected' }));
      setFile({ status: 'ok', ...meta });
    }, 900);
  };

  const onFile = (e) => {
    const fl = e.target.files?.[0];
    e.target.value = '';
    if (!fl) return;
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      extract({
        name: fl.name,
        secs: Math.max(1, Math.round(v.duration || 0)),
        res: v.videoWidth ? resFromHeight(v.videoWidth, v.videoHeight) : '1080p',
        dims: v.videoWidth ? `${v.videoWidth}×${v.videoHeight}` : 'unknown',
        size: `${(fl.size / 1e6).toFixed(1)} MB`,
      });
      URL.revokeObjectURL(v.src);
    };
    v.onerror = () => setFile({ status: 'error', name: fl.name });
    v.src = URL.createObjectURL(fl);
  };

  const score = lScore(f);
  const line = lineFor(state.benchmarks, f.market, f.secs);
  const format = FORMATS[formatOf(f.secs)];
  const under = score <= line;
  const views = Number(f.views) || 0;
  const rows = factors(f);

  return (
    <main>
      <PageHero
        eyebrow="No sign-in needed · estimate only"
        title="L-Score Estimator"
        intro="See how heavy a video is per view, and which production choices move the number. Upload a video or enter its details. Nothing is stored and nothing here awards the L Mark."
      />

      <section className="gutter py-10 sm:py-14">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Inputs */}
          <Card className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">1 · Your video</span>
              <Seg label="How to estimate" value={method} onChange={switchMethod} options={[{ value: 'upload', label: 'Upload a video' }, { value: 'manual', label: 'Enter details' }]} />
            </div>

            {method === 'upload' && (
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong px-4 py-7 text-center hover:border-ink">
                  {file?.status === 'reading' ? <Spinner size={24} /> : <UploadCloud size={26} className="text-mute" />}
                  <b className="text-[15px]">{file?.status === 'reading' ? `Reading ${file.name}…` : file?.status === 'ok' ? 'Choose another video' : 'Choose a video file'}</b>
                  <span className="text-[13px] text-mute">Demo: the prototype reads duration and resolution on your device. The video is not uploaded or kept.</span>
                </button>
                <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={onFile} />
                {!file && <button type="button" className="self-start text-[13px] font-semibold underline" onClick={() => extract(SAMPLE)}>No video handy? Try a sample video</button>}
                {file?.status === 'ok' && (
                  <div className="flex items-start gap-3 rounded-xl bg-paper p-3 text-[13px]">
                    <FileVideo size={18} className="mt-0.5 shrink-0" />
                    <span className="min-w-0"><b className="break-all">{file.name}</b> · {file.size}<br />Detected {file.secs} s at {file.dims} ({file.res}). Check the platform and market below: a file cannot tell us where it will be posted or watched.</span>
                  </div>
                )}
                {file?.status === 'error' && <p className="text-[13px] text-bad">This browser could not read that file. Switch to Enter details, or try a sample video.</p>}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Labelled label="Platform" s={src.platform} htmlFor="est-platform">
                <select id="est-platform" className="input" value={f.platform} onChange={(e) => enter('platform')(e.target.value)}>
                  {Object.keys(PLATFORMS).map((p) => <option key={p}>{p}</option>)}
                </select>
              </Labelled>
              <Labelled label="Main market (where it is watched)" s={src.market} htmlFor="est-market">
                <select id="est-market" className="input" value={f.market} onChange={(e) => enter('market')(e.target.value)}>
                  {Object.entries(MARKETS).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}
                </select>
              </Labelled>
              <Labelled label="Duration (seconds)" s={src.secs} htmlFor="est-secs" hint={`Measured as a ${format.name.toLowerCase()} (${format.note.toLowerCase()}), so it is checked against that L line.`}>
                <div className="flex items-center gap-3">
                  <input id="est-secs-range" type="range" min="5" max="300" value={Math.min(300, f.secs)} onChange={(e) => enter('secs')(Number(e.target.value))} className="min-w-0 flex-1 accent-[#111]" aria-label="Duration slider" />
                  <input id="est-secs" type="number" min="1" max="600" value={f.secs} onChange={(e) => enter('secs')(clampSecs(e.target.value))} className="input w-20 text-center font-mono" />
                </div>
              </Labelled>
              <Labelled label="Resolution" s={src.res} htmlFor="est-res">
                <select id="est-res" className="input" value={f.res} onChange={(e) => enter('res')(e.target.value)}>
                  {Object.keys(RESOLUTIONS).map((r) => <option key={r}>{r}</option>)}
                </select>
              </Labelled>
              <div className="sm:col-span-2">
                <Labelled label="Views (optional)" s={f.views === '' ? 'assumed' : src.views} htmlFor="est-views" hint={f.views === '' ? 'Not needed for the L-Score, which is per 1,000 views. Add expected or actual views to see the total.' : 'Used only for the total below. The L-Score stays per 1,000 views.'}>
                  <input id="est-views" type="number" min="0" inputMode="numeric" placeholder="e.g. 120000" value={f.views} onChange={(e) => enter('views')(e.target.value === '' ? '' : String(Math.max(0, Math.round(Number(e.target.value) || 0))))} className="input font-mono" />
                </Labelled>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[12px] text-mute">
              {Object.entries(SOURCES).map(([k, x]) => <span key={k} className="flex items-center gap-1.5"><Src s={k} /> {x.note}</span>)}
            </div>
          </Card>

          {/* Result */}
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="flex flex-col gap-5 border-dashed border-line-strong p-5 sm:p-6" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="eyebrow">2 · Estimated L-Score</span>
                <span className="rounded-full border border-dashed border-ink/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-2">Estimate · not a verification</span>
              </div>
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="display text-[64px] font-black leading-none tnum">{fmt(score)}</span>
                <span className="pb-2 text-[14px] text-mute">g CO₂e per 1,000 views (estimated)</span>
              </div>
              <ScoreBar score={score} line={line} />
              <p className="text-[15px]">
                {under
                  ? <>This estimate is <b>at or under</b> the {fmt(line)} g L line for a {format.name.toLowerCase()} in {MARKETS[f.market].name}. That is not the L Mark: only a published post that passes verification can carry it.</>
                  : <>This estimate is <b>over</b> the {fmt(line)} g L line for a {format.name.toLowerCase()} in {MARKETS[f.market].name}. See the choices below that usually move it most.</>}
              </p>
              {views > 0 && (
                <p className="rounded-xl bg-paper p-3 text-[14px]">At {fmt(views)} views this is about <b>{kg((score * views) / 1000)} CO₂e</b> in total (estimated).</p>
              )}
              <ul className="flex flex-col divide-y divide-line border-t border-line">
                {rows.map((r) => {
                  const k = { Duration: 'secs', Resolution: 'res', Platform: 'platform', 'Market grid': 'market' }[r.key];
                  return (
                    <li key={r.key} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <span className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">{r.key} <span className="font-mono font-normal text-mute">{r.value}</span> {k && <Src s={src[k]} />}</span>
                      <span className="text-[13px] text-mute sm:max-w-[50%] sm:text-right">{r.note}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="flex items-start gap-2 text-[12px] text-mute"><Info size={14} className="mt-0.5 shrink-0" /> Prototype figures are illustrative. Estimates never carry the L Mark and are not a claim you can publish.</p>
            </Card>
          </div>
        </div>
      </section>

      <Improve f={f} score={score} line={line} benchmarks={state.benchmarks} onApply={(alt) => {
        setF((x) => ({ ...x, ...alt }));
        setSrc((x) => ({ ...x, ...(alt.secs !== f.secs ? { secs: 'entered' } : {}), ...(alt.res !== f.res ? { res: 'entered' } : {}) }));
      }} />

      <RoleOfL />
    </main>
  );
}

const TIPS = [
  { Icon: Scissors, title: 'Review the duration', body: 'Every second is streamed to every viewer, so length moves the score most. Check whether a shorter edit still keeps the key message, the hook and the result.' },
  { Icon: MonitorPlay, title: 'Review resolution and delivery', body: 'Ask whether the content needs its top resolution. For most phone viewing, 720p or 1080p carries the same story with less data per view.' },
  { Icon: Copy, title: 'Avoid duplicate exports and uploads', body: 'Upload one final version per platform instead of re-posting near-identical cuts. Each extra upload is streamed again.' },
];

function Improve({ f, score, line, benchmarks, onApply }) {
  const [alt, setAlt] = useState({ secs: f.secs, res: f.res });
  const [applied, setApplied] = useState(false);
  // Keep the alternative in step when the original changes.
  useEffect(() => { setAlt({ secs: f.secs, res: f.res }); }, [f.secs, f.res]);

  const altF = { ...f, ...alt };
  const altScore = lScore(altF);
  const altLine = lineFor(benchmarks, f.market, alt.secs);
  const diff = altScore - score;
  const pct = score ? Math.round((diff / score) * 100) : 0;
  const same = alt.secs === f.secs && alt.res === f.res;
  const altFormat = FORMATS[formatOf(alt.secs)];

  return (
    <section id="improve" className="gutter border-t border-line bg-paper py-10 sm:py-14">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="eyebrow">3 · Improve your L-Score</span>
          <h2 className="display text-[30px] font-extrabold leading-tight sm:text-[38px]">Explore other choices before you post</h2>
          <p className="text-[15px] text-ink-2">Try a different duration or resolution and compare. The alternative is recalculated with the same method and the same inputs as your estimate. These are directions to explore, not guarantees: a change helps only if it still serves your content.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
            <span className="eyebrow">Try an alternative</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Duration (seconds)" htmlFor="alt-secs" hint={`Now ${f.secs} s`}>
                <div className="flex items-center gap-3">
                  <input type="range" min="5" max="300" value={Math.min(300, alt.secs)} onChange={(e) => { setApplied(false); setAlt((a) => ({ ...a, secs: Number(e.target.value) })); }} className="min-w-0 flex-1 accent-[#111]" aria-label="Alternative duration slider" />
                  <input id="alt-secs" type="number" min="1" max="600" value={alt.secs} onChange={(e) => { setApplied(false); setAlt((a) => ({ ...a, secs: clampSecs(e.target.value) })); }} className="input w-20 text-center font-mono" />
                </div>
              </Field>
              <Field label="Resolution" htmlFor="alt-res" hint={`Now ${f.res}`}>
                <select id="alt-res" className="input" value={alt.res} onChange={(e) => { setApplied(false); setAlt((a) => ({ ...a, res: e.target.value })); }}>
                  {Object.keys(RESOLUTIONS).map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-xl border border-line bg-white p-4">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-mute">Your estimate</span>
                <span className="display text-[34px] font-black leading-none tnum">{fmt(score)}</span>
                <span className="text-[12px] text-mute">{f.secs} s · {f.res} · line {fmt(line)}</span>
              </div>
              <div className={cx('flex flex-col gap-1 rounded-xl border p-4', same ? 'border-dashed border-line-strong bg-white' : 'border-ink bg-white')}>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-mute">Alternative</span>
                <span className="display text-[34px] font-black leading-none tnum">{fmt(altScore)}</span>
                <span className="text-[12px] text-mute">{alt.secs} s · {alt.res} · line {fmt(altLine)}</span>
              </div>
            </div>
            <ScoreBar score={altScore} line={altLine} />
            <p className="text-[14px]" aria-live="polite">
              {same
                ? 'Change the duration or resolution above to compare.'
                : <>The alternative estimate is <b>{diff === 0 ? 'the same' : `${fmt(Math.abs(diff))} g ${diff < 0 ? 'lower' : 'higher'} (${Math.abs(pct)}%)`}</b> per 1,000 views, and {altScore <= altLine ? 'at or under' : 'over'} the {fmt(altLine)} g L line for a {altFormat.name.toLowerCase()}.{altFormat !== FORMATS[formatOf(f.secs)] && ' The length changes which L line applies.'}</>}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { onApply(alt); setApplied(true); }} disabled={same}>{applied ? <Check size={16} /> : <ArrowRight size={16} />} Use as my estimate</Button>
              <Button variant="ghost" onClick={() => { setAlt({ secs: f.secs, res: f.res }); setApplied(false); }} disabled={same}><RotateCcw size={16} /> Reset</Button>
            </div>
            {applied && <p className="text-[13px] text-mute">Updated. The estimate above now uses these values, marked as entered.</p>}
          </Card>

          <div className="flex min-w-0 flex-col gap-3">
            {TIPS.map(({ Icon, title, body }) => (
              <Card key={title} className="flex items-start gap-3 p-4 sm:p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white"><Icon size={17} /></span>
                <span className="flex flex-col gap-1"><b className="text-[15px]">{title}</b><span className="text-[14px] text-ink-2">{body}</span></span>
              </Card>
            ))}
            <p className="flex items-start gap-2 px-1 text-[12px] text-mute"><Info size={14} className="mt-0.5 shrink-0" /> Suggestions are general. Results depend on the post, and none of them guarantees a lower score or the L Mark.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleOfL() {
  const steps = [
    { Icon: SlidersHorizontal, title: 'Understand and improve', body: 'The estimator shows which production choices drive impact, so you can decide before you post. It is open to everyone and awards nothing.' },
    { Icon: ShieldCheck, title: 'Verify a published post', body: 'Submit the live post in Creator Studio. It is checked against the L line for its market and format before any decision.', mark: false },
    { Icon: Sparkles, title: 'Recognition and discovery', body: 'Posts that qualify after verification carry the L Mark, with a public verification page, and appear where brands look for creators.', mark: true },
  ];
  return (
    <section className="gutter py-10 sm:py-14">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="eyebrow">What L does</span>
          <h2 className="display text-[30px] font-extrabold leading-tight sm:text-[38px]">An estimate is a starting point. The L Mark is earned.</h2>
        </div>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map(({ Icon, title, body, mark }, i) => (
            <li key={title}>
              <Card className="flex h-full flex-col gap-3 p-5">
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-mute">0{i + 1}</span>
                  {mark ? <LMark size={28} /> : <Icon size={22} />}
                </span>
                <b className="text-[17px]">{title}</b>
                <span className="text-[14px] text-ink-2">{body}</span>
              </Card>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <Button variant="brand" as="a" href={href('studio-submit')}>Submit a published post <ArrowRight size={16} /></Button>
          <Button variant="outline" as="a" href={href('verified')}>See verified posts</Button>
          <Button variant="ghost" as="a" href={href('standard')}>How the score works</Button>
        </div>
      </div>
    </section>
  );
}
