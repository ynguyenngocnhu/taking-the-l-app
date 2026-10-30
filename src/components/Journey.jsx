import React from 'react';
import { Compass, Calculator, Lightbulb, Clapperboard, ShieldCheck, Search, RotateCcw, Award, Eye, Briefcase } from 'lucide-react';
import { LMark, cx } from './ui.jsx';
import { href } from '../lib/router.js';

// The creator journey, in the same words as the pitch deck (slide 7).
// Steps 1–4 happen before a post goes live, 5–7 after it is published, then the loop starts again at Estimate.
export const JOURNEY = [
  { key: 'discover', name: 'Discover', Icon: Compass, d: 'Learn what L measures and why lighter video matters.', to: 'standard' },
  { key: 'estimate', name: 'Estimate', Icon: Calculator, d: 'Get an estimated L-Score for a video. No sign-in.', to: 'estimator' },
  { key: 'learn', name: 'Learn', Icon: Lightbulb, d: 'See which production choices you could reconsider.', to: 'estimator' },
  { key: 'create', name: 'Create', Icon: Clapperboard, d: 'Make and publish the post your way.', to: null },
  { key: 'verify', name: 'Verify', Icon: ShieldCheck, d: 'Submit the published post in Creator Studio.', to: 'studio-submit' },
  { key: 'recognised', name: 'Get Recognised', Icon: null, d: 'Qualifying posts carry the L Mark and a verification page.', to: 'verified' },
  { key: 'discovered', name: 'Get Discovered', Icon: Search, d: 'Appear in the public gallery where brands look.', to: 'brands' },
];

// The incentive framing used on deck slide 9. Fund and Lighter Rate are proposals for a pilot, never guaranteed.
export const AFTER_VERIFY = [
  { key: 'recognition', name: 'Recognition', Icon: Award, d: 'The L Mark on the post, a public verification page, and the post added to your portfolio of verified posts.' },
  { key: 'visibility', name: 'Visibility', Icon: Eye, d: 'Qualifying posts appear in the public gallery, where brands can find content by market, platform and campaign.' },
  { key: 'opportunity', name: 'Opportunity', Icon: Briefcase, d: 'Proposed for the pilot: L-Media Fund reach and a Lighter Rate on campaign posts. Not guaranteed.' },
];

function StepIcon({ s, size, on }) {
  if (s.key === 'recognised') return <LMark size={size + 2} />;
  return <s.Icon size={size} className={on ? '' : 'opacity-60'} />;
}

// Full journey: seven steps in two groups plus the loop back to Estimate.
// `current` highlights steps (array of keys). `dark` for use on black.
export function Journey({ current = [], links = true, dark = false, className }) {
  const groups = [['Before you post', JOURNEY.slice(0, 4)], ['After you publish', JOURNEY.slice(4)]];
  return (
    <div className={cx('flex flex-col gap-3', className)}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[4fr_3fr]">
        {groups.map(([label, steps], gi) => (
          <div key={label} className={cx('flex flex-col gap-3 rounded-2xl p-4 sm:p-5', gi === 0 ? (dark ? 'border border-white/15' : 'border border-dashed border-line-strong bg-white') : (dark ? 'bg-white/[0.07]' : 'bg-ink text-white'))}>
            <span className={cx('eyebrow', (gi === 1 || dark) && 'text-white/55')}>{label}</span>
            <ol className={cx('grid gap-2', gi === 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3')}>
              {steps.map((s) => {
                const n = JOURNEY.indexOf(s) + 1;
                const on = current.includes(s.key);
                const light = gi === 1 || dark;
                const body = (
                  <>
                    <span className="flex items-center gap-2">
                      <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold', on ? 'bg-brand text-white' : light ? 'bg-white/10' : 'bg-paper')}>{n}</span>
                      <StepIcon s={s} size={17} on={on} />
                    </span>
                    <b className="text-[15px]">{s.name}</b>
                    <span className={cx('text-[13px] leading-snug', light ? 'text-white/65' : 'text-mute')}>{s.d}</span>
                    {on && <span className={cx('text-[11px] font-bold uppercase tracking-wider', light ? 'text-white' : 'text-brand-deep')}>You are here</span>}
                  </>
                );
                const cls = cx('flex h-full flex-col gap-1.5 rounded-xl p-2.5', on && (light ? 'ring-1 ring-white/60' : 'ring-1 ring-ink'));
                return (
                  <li key={s.key}>
                    {links && s.to ? <a href={href(s.to)} className={cx(cls, light ? 'hover:bg-white/10' : 'hover:bg-paper')}>{body}</a> : <div className={cls}>{body}</div>}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
      <p className={cx('flex items-center gap-2 text-[13px] font-semibold', dark ? 'text-white/70' : 'text-ink-2')}>
        <RotateCcw size={15} /> Then back to Estimate for the next video. Every post is scored on its own.
      </p>
    </div>
  );
}

// Recognition, Visibility, Opportunity: what a verified, qualifying post opens up.
export function AfterVerify({ className, dark = false }) {
  return (
    <div className={cx('grid grid-cols-1 gap-3 md:grid-cols-3', className)}>
      {AFTER_VERIFY.map(({ key, name, Icon, d }) => (
        <div key={key} className={cx('flex flex-col gap-2 rounded-2xl p-4 sm:p-5', dark ? 'bg-white/[0.07]' : 'border border-line bg-white')}>
          <span className="flex items-center gap-2">{key === 'recognition' ? <LMark size={24} /> : <Icon size={20} className={key === 'opportunity' ? 'text-gold-deep' : ''} />}<b className="text-[16px]">{name}</b></span>
          <span className={cx('text-[14px] leading-snug', dark ? 'text-white/70' : 'text-ink-2')}>{d}</span>
        </div>
      ))}
    </div>
  );
}
