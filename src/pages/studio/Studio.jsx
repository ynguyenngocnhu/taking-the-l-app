import React, { useState } from 'react';
import { Home, Megaphone, Upload, Film, Gift, ArrowRight, Calendar, Check, Users } from 'lucide-react';
import { SideLayout, ResetDemo } from '../../components/Shell.jsx';
import { Button, Card, Stat, StatusPill, Thumb, LProgress, PageHead, Modal, DemoNote, Empty, LGlyph, Avatar, cx } from '../../components/ui.jsx';
import { href, go } from '../../lib/router.js';
import { useStore, creatorStats } from '../../lib/store.jsx';
import { fmt, compact, MARKETS } from '../../lib/score.js';
import { ME, QUARTER, L_CREATOR_TARGET, REWARD_HISTORY, INCENTIVES } from '../../data/mock.js';
import Submit from './Submit.jsx';
import { PostDetail, MyPosts, Receipt } from './Posts.jsx';

export default function Studio({ route }) {
  const { state } = useStore();
  const me = state.creators.find((c) => c.id === ME);
  const stats = creatorStats(state, ME);
  const pageKey = { '': 'home', post: 'posts', receipt: 'posts' }[route.page] ?? route.page;
  const items = [
    { key: 'home', label: 'Dashboard', Icon: Home, to: 'studio' },
    { key: 'campaigns', label: 'Discover campaigns', Icon: Megaphone, to: 'studio-campaigns' },
    { key: 'submit', label: 'Submit a video', Icon: Upload, to: 'studio-submit' },
    { key: 'posts', label: 'My posts', Icon: Film, to: 'studio-posts', badge: stats.review || null },
    { key: 'rewards', label: 'My rewards', Icon: Gift, to: 'studio-rewards' },
  ];
  const user = (
    <span className="mt-2 flex items-center gap-2.5">
      <Avatar name={me.name} size={34} />
      <span className="flex min-w-0 flex-col leading-tight"><b className="text-[14px]">{me.name}</b><span className="truncate text-[12px] text-mute">{me.handle}</span></span>
    </span>
  );
  let body;
  switch (route.page) {
    case 'campaigns': body = <Campaigns />; break;
    case 'submit': body = <Submit />; break;
    case 'posts': body = <MyPosts />; break;
    case 'post': body = <PostDetail id={route.id} />; break;
    case 'receipt': body = <Receipt id={route.id} />; break;
    case 'rewards': body = <Rewards />; break;
    default: body = <Dashboard />;
  }
  return (
    <SideLayout title="Creator Studio" user={user} items={items} current={pageKey} footer={<ResetDemo />}>
      <div key={route.page + route.id} className="rise">{body}</div>
      <div className="mt-12 lg:hidden"><ResetDemo /></div>
    </SideLayout>
  );
}

function Dashboard() {
  const { state } = useStore();
  const me = state.creators.find((c) => c.id === ME);
  const s = creatorStats(state, ME);
  const recent = [...s.posts].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 5);
  const left = Math.max(0, L_CREATOR_TARGET - s.qualifiedQ);
  return (
    <div className="flex flex-col gap-8">
      <PageHead eyebrow={`${QUARTER.label} · ${MARKETS[me.market].name}`} title={`Welcome back, ${me.name.split(' ')[0]}`} sub="Here is how your posts are weighing in this quarter." actions={<Button as="a" href={href('studio-submit')}><UploadIcon /> Submit a video</Button>} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="flex flex-col gap-5 border-ink bg-ink p-6 text-white">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="eyebrow text-white/60">Progress to L Creator</span>
              <span className="display text-[56px] font-black leading-none tnum">{s.qualifiedQ}<span className="text-white/30">/{L_CREATOR_TARGET}</span></span>
            </div>
            <span className="max-w-[240px] text-[14px] text-white/70 sm:text-right">
              {left ? <>{left} more qualifying {left === 1 ? 'post' : 'posts'} by {QUARTER.end.slice(5).replace('-', '/')} unlocks the L-Media Fund and Lighter Rate.</> : 'You are an L Creator this quarter.'}
            </span>
          </div>
          <div className="rounded-xl bg-white/[0.06] p-3"><LProgressDark count={s.qualifiedQ} /></div>
          <a href={href('studio-rewards')} className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-brand-text hover:underline">See what unlocks <ArrowRight size={15} /></a>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Submitted" value={s.total} sub="all time" />
          <Stat label="Qualifying L posts" value={s.qualified} sub={`${s.qualifiedQ} this quarter`} />
          <Stat label="Rewards earned" value="$825" sub="+ 1 product kit" />
          <Stat label="Avg L-Score" value={s.avgScore ?? '–'} sub="g CO₂e / 1k views" />
        </div>
      </div>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="display text-[20px] font-extrabold">Recent submissions</h2>
          <a href={href('studio-posts')} className="text-[14px] font-semibold hover:underline">View all</a>
        </div>
        <Card className="divide-y divide-line">
          {recent.map((p) => (
            <a key={p.id} href={href(`studio-post-${p.id}`)} className="flex items-center gap-4 px-4 py-3 hover:bg-paper">
              <Thumb index={p.thumb} secs={p.secs} className="h-14 w-10" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[15px] font-semibold">{p.title}</span>
                <span className="text-[12px] text-mute">{p.platform} · {p.submitted}{p.type !== 'draft' ? ` · ${compact(p.views)} views` : ' · draft'}</span>
              </div>
              <span className="hidden flex-col items-end sm:flex">
                <span className="font-mono text-[15px] font-bold tnum">{fmt(p.score)}</span>
                <span className="font-mono text-[11px] text-mute">line {fmt(p.line)}</span>
              </span>
              <StatusPill status={p.status} />
            </a>
          ))}
        </Card>
      </section>
      <DemoNote />
    </div>
  );
}

function UploadIcon() {
  return <Upload size={17} />;
}

function LProgressDark({ count }) {
  return (
    <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${count} of ${L_CREATOR_TARGET} qualifying posts`}>
      {Array.from({ length: L_CREATOR_TARGET }).map((_, i) => (
        <div key={i} className={cx('flex aspect-square items-center justify-center rounded-md', i < count ? 'bg-gold text-ink' : 'border border-dashed border-white/25 text-white/25')}>
          <LGlyph size={16} weight={0.24} />
        </div>
      ))}
    </div>
  );
}

const TONES = ['from-[#F6C9B8] to-[#E58C7A]', 'from-[#E7D7F2] to-[#A58BC9]', 'from-[#CFE3EE] to-[#6E9DBB]', 'from-[#D8E8C6] to-[#8DB16A]'];

export function CampaignArt({ c, className }) {
  return (
    <div className={cx('relative overflow-hidden bg-gradient-to-br', TONES[c.tone % TONES.length], className)}>
      <LGlyph size={120} weight={0.18} stroke="rgba(255,255,255,.55)" className="absolute -bottom-4 -right-2" />
      <span className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[12px] font-bold text-ink">{c.brand}</span>
    </div>
  );
}

function Campaigns() {
  const { state, dispatch, notify } = useStore();
  const me = state.creators.find((c) => c.id === ME);
  const [open, setOpen] = useState(null);
  const live = state.campaigns.filter((c) => c.status === 'Live');
  const c = open && state.campaigns.find((x) => x.id === open);
  const joined = (id) => me.campaigns.includes(id);
  const join = (id) => { dispatch({ type: 'join', id }); notify('Joined. Tag this campaign when you submit.'); };
  return (
    <div className="flex flex-col gap-8">
      <PageHead eyebrow="Discover campaigns" title="Briefs that reward lighter posts" sub="Join a campaign, post to the brief, then submit the link. Qualifying posts unlock the campaign reward." />
      {live.length === 0 ? (
        <Empty title="No live campaigns" body="New briefs open every few weeks. Check back soon." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {live.map((k) => (
            <Card key={k.id} className="flex flex-col overflow-hidden">
              <CampaignArt c={k} className="h-32" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="display text-[20px] font-extrabold leading-tight">{k.name}</h3>
                <p className="flex-1 text-[14px] leading-relaxed text-mute">{k.description}</p>
                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-[13px]">
                  <div><dt className="text-mute">Reward</dt><dd className="font-semibold">{k.reward}</dd></div>
                  <div><dt className="text-mute">Deadline</dt><dd className="font-mono font-semibold">{k.end}</dd></div>
                </dl>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setOpen(k.id)}>View brief</Button>
                  {joined(k.id) ? (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper px-4 text-[13px] font-semibold text-ink"><Check size={15} /> Joined</span>
                  ) : (
                    <Button size="sm" onClick={() => join(k.id)}>Join campaign</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!c} onClose={() => setOpen(null)} title={c ? c.name : ''} wide>
        {c && (
          <div className="flex flex-col gap-5">
            <CampaignArt c={c} className="h-28 rounded-xl" />
            <p className="text-[15px] leading-relaxed">{c.description}</p>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
              <Info k="Reward" v={c.reward} />
              <Info k="Runs" v={`${c.start} → ${c.end}`} mono />
              <Info k="Creators in" v={state.creators.filter((x) => x.campaigns.includes(c.id)).length} mono />
            </div>
            <div className="flex flex-col gap-2">
              <span className="eyebrow">The brief</span>
              <ul className="flex flex-col gap-2">
                {c.brief.map((b) => <li key={b} className="flex gap-2 text-[14px]"><LGlyph size={16} className="mt-0.5 shrink-0 text-brand-deep" />{b}</li>)}
              </ul>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              {joined(c.id) ? (
                <Button onClick={() => { setOpen(null); go('studio-submit'); }}>Submit a video for this <ArrowRight size={16} /></Button>
              ) : (
                <Button onClick={() => join(c.id)}>Join campaign</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ k, v, mono }) {
  return (
    <div className="rounded-xl bg-paper p-3">
      <span className="block text-[12px] text-mute">{k}</span>
      <span className={cx('text-[14px] font-semibold', mono && 'font-mono')}>{v}</span>
    </div>
  );
}

function Rewards() {
  const { state } = useStore();
  const s = creatorStats(state, ME);
  const isL = s.qualifiedQ >= L_CREATOR_TARGET;
  return (
    <div className="flex flex-col gap-8">
      <PageHead eyebrow="My rewards" title={isL ? 'You are an L Creator' : 'On the way to L Creator'} sub={`Status resets each quarter. ${QUARTER.label} runs ${QUARTER.start} to ${QUARTER.end}.`} />
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cx('flex h-12 w-12 items-center justify-center rounded-xl', isL ? 'bg-gold' : 'bg-paper')}><LGlyph size={26} /></span>
            <div className="flex flex-col">
              <span className="eyebrow">Current status</span>
              <b className="text-[18px]">{isL ? 'L Creator' : 'L Contributor'}</b>
            </div>
          </div>
          <span className="font-mono text-[15px] font-semibold tnum">{s.qualifiedQ} / {L_CREATOR_TARGET} L posts</span>
        </div>
        <LProgress count={s.qualifiedQ} />
      </Card>
      <section className="flex flex-col gap-3">
        <h2 className="display text-[20px] font-extrabold">Incentives</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {INCENTIVES.map((i) => {
            const on = i.always || isL;
            return (
              <Card key={i.key} className={cx('flex flex-col gap-2 p-5', on && 'border-gold/60')}>
                <div className="flex items-center justify-between gap-2">
                  <b className="text-[16px]">{i.name}</b>
                  <span className={cx('rounded-full px-2.5 py-1 text-[12px] font-semibold', on ? 'bg-gold-soft text-gold-deep' : 'bg-paper text-mute')}>{on ? 'Unlocked' : 'Locked'}</span>
                </div>
                <p className="text-[14px] text-mute">{i.desc}</p>
                <span className="font-mono text-[11px] uppercase tracking-wider text-mute">Unlocks at: {i.unlock}</span>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="display text-[20px] font-extrabold">Earned rewards</h2>
          <span className="font-mono text-[14px] font-semibold">$825 + 1 kit</span>
        </div>
        <Card className="overflow-hidden">
          <div className="scroll-x">
            <table className="w-full min-w-[520px] text-[14px]">
              <thead className="bg-paper text-left text-mute"><tr><th className="px-4 py-3 font-medium">Date</th><th className="px-2 py-3 font-medium">Reward</th><th className="px-2 py-3 font-medium">From</th><th className="px-4 py-3 text-right font-medium">Amount</th></tr></thead>
              <tbody>
                {REWARD_HISTORY.map((r) => (
                  <tr key={r.date + r.item} className="border-t border-line">
                    <td className="px-4 py-3 font-mono text-[13px]">{r.date}</td>
                    <td className="px-2 py-3 font-medium">{r.item}</td>
                    <td className="px-2 py-3 text-mute">{r.source}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
      <DemoNote>Demo rewards. No real payments are made in this prototype.</DemoNote>
    </div>
  );
}
