import React, { useRef, useState } from 'react';
import { LayoutDashboard, Film, Upload, Megaphone, UserRound, ArrowRight, Award, Plus, Trash2, Camera, AlertTriangle, Check, Clock, X, ArrowLeft, CalendarDays, Hash, AtSign, MapPin, Gift } from 'lucide-react';
import { AppHeader, UserMenu, SideLayout, ResetDemo } from '../../components/Shell.jsx';
import { Avatar, Button, Card, Field, LMark, LProgress, PageHead, Stat, StatusPill, Thumb, Empty, DemoNote, cx } from '../../components/ui.jsx';
import { CampaignTag } from '../../components/PostBits.jsx';
import { href, go } from '../../lib/router.js';
import { useStore, useMe, creatorStats, campaignLabel, DEMO_ID } from '../../lib/store.jsx';
import { MARKETS, PLATFORMS } from '../../lib/score.js';
import { QUARTER, L_CREATOR_TARGET, L_CREATOR_INCENTIVES, TODAY } from '../../data/mock.js';
import Submit from './Submit.jsx';
import { MyPosts, PostDetail } from './Posts.jsx';

export default function Studio({ route }) {
  const { state } = useStore();
  const me = useMe();

  if (!me) {
    return (
      <>
        <AppHeader label="Creator Studio" homeTo="home" right={<a href={href('home')} className="text-[14px] text-white/70 hover:text-white">Public site</a>} />
        {route.page === 'onboard' ? <Onboarding /> : <SignIn />}
      </>
    );
  }

  const stats = creatorStats(state, me.id);
  const pageKey = { '': 'home', post: 'posts', campaign: 'campaigns' }[route.page] ?? route.page;
  const items = [
    { key: 'home', label: 'Dashboard', Icon: LayoutDashboard, to: 'studio' },
    { key: 'posts', label: 'My Posts', Icon: Film, to: 'studio-posts', badge: stats.pending || null },
    { key: 'submit', label: 'Submit a Post', Icon: Upload, to: 'studio-submit' },
    { key: 'campaigns', label: 'Campaigns', Icon: Megaphone, to: 'studio-campaigns' },
    { key: 'profile', label: 'My Profile', Icon: UserRound, to: 'studio-profile' },
  ];
  const user = (
    <span className="mt-2 flex items-center gap-2.5">
      <Avatar name={me.name} src={me.avatar} size={34} />
      <span className="flex min-w-0 flex-col leading-tight"><b className="truncate text-[14px]">{me.name}</b><span className="truncate text-[12px] text-mute">{me.handle}</span></span>
    </span>
  );
  let body;
  switch (route.page) {
    case 'posts': body = <MyPosts />; break;
    case 'post': body = <PostDetail id={route.id} />; break;
    case 'submit': body = <Submit preset={route.id} />; break;
    case 'campaigns': body = <Campaigns />; break;
    case 'campaign': body = <CampaignBrief id={route.id} />; break;
    case 'profile': body = <Profile />; break;
    default: body = <Dashboard />;
  }
  return (
    <>
      <AppHeader label="Creator Studio" homeTo="studio" right={<UserMenu me={me} />} />
      <SideLayout title="Creator Studio" user={user} items={items} current={pageKey} footer={<ResetDemo />}>
        <div key={route.page + route.id} className="rise">{body}</div>
        <div className="mt-12 lg:hidden"><ResetDemo /></div>
      </SideLayout>
    </>
  );
}

// ---------------------------------------------------------------- sign in and onboarding

function SignIn() {
  const { state, dispatch, notify } = useStore();
  const demo = state.creators.find((c) => c.id === DEMO_ID);
  return (
    <main className="gutter py-14 sm:py-20">
      <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <LMark size={56} />
          <h1 className="display text-[40px] font-black uppercase leading-[0.95] sm:text-[52px]" style={{ fontStretch: '85%' }}>Creator Studio</h1>
          <p className="max-w-md text-[16px] text-ink-2">Submit your published posts for verification, follow their status, and join L campaigns. No follower minimum.</p>
          <a href={href('estimator')} className="inline-flex items-center gap-1 text-[14px] font-semibold underline">Just want an estimate? No sign-in needed</a>
        </div>
        <Card className="flex flex-col gap-4 p-6">
          <span className="eyebrow">Sign in</span>
          <button type="button" onClick={() => { dispatch({ type: 'signIn', id: demo.id }); notify(`Signed in as ${demo.name}`); go('studio'); }} className="flex items-center gap-3 rounded-xl border border-line p-4 text-left hover:border-ink">
            <Avatar name={demo.name} src={demo.avatar} size={44} />
            <span className="flex min-w-0 flex-1 flex-col leading-tight"><b>Continue as {demo.name}</b><span className="truncate text-[13px] text-mute">Demo creator · {demo.handle} · {MARKETS[demo.market].name}</span></span>
            <ArrowRight size={18} />
          </button>
          <div className="flex items-center gap-3 text-[12px] text-mute"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
          <Button variant="outline" as="a" href={href('studio-onboard')}><Plus size={16} /> Create a creator profile</Button>
          <DemoNote>Demo sign-in. A live version would use a secure account sign-in.</DemoNote>
        </Card>
      </div>
    </main>
  );
}

// Shrinks a picked image to a small square so it fits in the demo's browser storage.
function readAvatar(file, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = 160;
      const c = document.createElement('canvas');
      c.width = s; c.height = s;
      const k = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, s, s);
      cb(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => cb(null);
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

const CATEGORIES = ['Beauty', 'Skincare', 'Makeup', 'Hair', 'Grooming', 'Lifestyle'];

function ProfileForm({ initial, submitLabel, onSave }) {
  const [f, setF] = useState(() => ({ name: '', market: 'VN', category: 'Beauty', bio: '', avatar: null, accounts: [{ platform: 'TikTok', handle: '' }], ...initial }));
  const [err, setErr] = useState({});
  const fileRef = useRef(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const setAcc = (i, k, v) => setF((x) => ({ ...x, accounts: x.accounts.map((a, j) => (j === i ? { ...a, [k]: v } : a)) }));
  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Add your name';
    const accounts = f.accounts.filter((a) => a.handle.trim()).map((a) => ({ ...a, handle: a.handle.trim().startsWith('@') ? a.handle.trim() : `@${a.handle.trim()}` }));
    if (!accounts.length) er.accounts = 'Add at least one social account';
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ ...f, name: f.name.trim(), accounts, handle: accounts[0].handle, platform: accounts[0].platform });
  };
  return (
    <form onSubmit={save} className="flex flex-col gap-6" noValidate>
      <div className="flex items-center gap-4">
        <Avatar name={f.name || '?'} src={f.avatar} size={72} />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Camera size={15} /> {f.avatar ? 'Change photo' : 'Add a profile photo'}</Button>
            {f.avatar && <Button variant="ghost" size="sm" onClick={() => setF((x) => ({ ...x, avatar: null }))}>Remove</Button>}
          </div>
          <span className="text-[12px] text-mute">Stays in this browser for the demo.</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readAvatar(e.target.files[0], (url) => url && setF((x) => ({ ...x, avatar: url })))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="pf-name" error={err.name}><input id="pf-name" className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Country / market" htmlFor="pf-market"><select id="pf-market" className="input" value={f.market} onChange={set('market')}>{Object.entries(MARKETS).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}</select></Field>
        <Field label="Main content category" htmlFor="pf-cat"><select id="pf-cat" className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="About you (optional)" htmlFor="pf-bio"><input id="pf-bio" className="input" value={f.bio} onChange={set('bio')} placeholder="What you make, in one line" /></Field>
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="label mb-1.5">Social accounts</legend>
        {f.accounts.map((a, i) => (
          <div key={i} className="flex gap-2">
            <select aria-label="Platform" className="input w-[132px] shrink-0" value={a.platform} onChange={(e) => setAcc(i, 'platform', e.target.value)}>{Object.keys(PLATFORMS).map((p) => <option key={p}>{p}</option>)}</select>
            <input aria-label="Handle" className="input min-w-0 flex-1" placeholder="@handle" value={a.handle} onChange={(e) => setAcc(i, 'handle', e.target.value)} />
            {f.accounts.length > 1 && <button type="button" aria-label="Remove account" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-ink/5" onClick={() => setF((x) => ({ ...x, accounts: x.accounts.filter((_, j) => j !== i) }))}><Trash2 size={16} /></button>}
          </div>
        ))}
        {err.accounts && <span className="flex items-center gap-1 text-[13px] text-bad"><AlertTriangle size={13} /> {err.accounts}</span>}
        {f.accounts.length < 3 && <Button variant="ghost" size="sm" className="self-start" onClick={() => setF((x) => ({ ...x, accounts: [...x.accounts, { platform: 'Instagram', handle: '' }] }))}><Plus size={15} /> Add another account</Button>}
        <span className="text-[12px] text-mute">Posts you submit must come from one of these accounts. There is no follower minimum.</span>
      </fieldset>
      <Button type="submit" variant="brand" className="self-start">{submitLabel}</Button>
    </form>
  );
}

function Onboarding() {
  const { dispatch, notify } = useStore();
  return (
    <main className="gutter py-10 sm:py-14">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6">
        <a href={href('studio')} className="inline-flex items-center gap-1 text-[13px] font-semibold text-mute hover:text-ink"><ArrowLeft size={14} /> Sign in</a>
        <PageHead eyebrow="New creator" title="Create your profile" sub="Tell us who you are and where you post. You can change this later." />
        <Card className="p-5 sm:p-6">
          <ProfileForm submitLabel="Create profile" onSave={(f) => {
            dispatch({ type: 'onboard', creator: { ...f, id: `c${Date.now().toString(36)}`, joined: TODAY, campaigns: [] } });
            notify('Profile created');
            go('studio');
          }} />
        </Card>
      </div>
    </main>
  );
}

function Profile() {
  const { dispatch, notify } = useStore();
  const me = useMe();
  return (
    <div className="flex max-w-[720px] flex-col gap-6">
      <PageHead eyebrow="My Profile" title={me.name} sub={`Creator since ${me.joined} · ${MARKETS[me.market].name}`} />
      <Card className="p-5 sm:p-6">
        <ProfileForm key={me.id} initial={me} submitLabel="Save changes" onSave={(f) => { dispatch({ type: 'profile', creator: { ...me, ...f } }); notify('Profile saved'); }} />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- dashboard

function Dashboard() {
  const { state } = useStore();
  const me = useMe();
  const s = creatorStats(state, me.id);
  const left = Math.max(0, L_CREATOR_TARGET - s.qualifiedQ);
  const isL = left === 0;
  const needs = s.posts.filter((p) => p.status === 'info');
  const activity = s.posts
    .flatMap((p) => [
      { p, date: p.submitted, text: 'Submitted for verification', Icon: Upload },
      p.verified && { p, date: p.verified, text: { qualified: 'Verified · qualifies for the L Mark', not: 'Verified · above the L line', rejected: 'Rejected' }[p.status], Icon: { qualified: Check, not: X, rejected: AlertTriangle }[p.status] },
      ...p.notes.filter((n) => n.by !== 'Creator').map((n) => ({ p, date: n.date, text: `Note: ${n.text}`, Icon: Clock })),
    ].filter(Boolean))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="flex flex-col gap-8">
      <PageHead eyebrow={`${QUARTER.label} · ${MARKETS[me.market].name}`} title={`Hi, ${me.name.split(' ')[0]}`} sub="Your posts, their verification status, and your progress this quarter." actions={<><Button variant="outline" as="a" href={href('estimator')}>Estimate a video</Button><Button variant="brand" as="a" href={href('studio-submit')}><Upload size={16} /> Submit a post</Button></>} />

      {needs.length > 0 && (
        <a href={href(`studio-post-${needs[0].id}`)} className="flex items-start gap-3 rounded-2xl border border-warn/40 bg-warn-bg p-4 text-[14px] text-warn">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span className="flex-1"><b>Information requested</b> on “{needs[0].title}”. Open the post to reply.</span>
          <ArrowRight size={16} className="mt-0.5" />
        </a>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="flex flex-col gap-5 border-ink bg-ink p-6 text-white">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="eyebrow text-white/60">Qualifying posts · {QUARTER.label}</span>
              <span className="display text-[56px] font-black leading-none tnum">{s.qualifiedQ}<span className="text-white/30">/{L_CREATOR_TARGET}</span></span>
            </div>
            {isL
              ? <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[13px] font-bold text-ink"><Award size={15} /> L Creator · {QUARTER.label}</span>
              : <span className="max-w-[260px] text-[14px] text-white/70 sm:text-right">{left} more qualifying {left === 1 ? 'post' : 'posts'} by {QUARTER.end} to become an L Creator this quarter.</span>}
          </div>
          <div className="rounded-xl bg-white/[0.06] p-3"><LProgress count={Math.min(s.qualifiedQ, L_CREATOR_TARGET)} /></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {L_CREATOR_INCENTIVES.map((i) => (
              <div key={i.name} className="flex items-start gap-2 text-[13px] text-white/70"><Gift size={15} className="mt-0.5 shrink-0 text-gold-text" /><span><b className="text-white">{i.name}</b>: {i.desc}</span></div>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
          <Stat label="Submitted" value={s.total} sub="all time" />
          <Stat label="Verified" value={s.verified} sub={`${s.notQualified} above the line`} />
          <Stat label="Qualifying" value={s.qualified} sub={`${s.qualifiedQ} this quarter`} />
          <Stat label="Pending" value={s.pending} sub="waiting for review" />
          <Stat label="Rejected" value={s.rejected} sub="could not be verified" />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold">Recent activity</h2>
          <a href={href('studio-posts')} className="text-[14px] font-semibold hover:underline">All posts</a>
        </div>
        {activity.length ? (
          <Card className="divide-y divide-line">
            {activity.map((a, i) => (
              <a key={i} href={href(`studio-post-${a.p.id}`)} className="flex items-center gap-3 p-3 hover:bg-paper sm:p-4">
                <Thumb index={a.p.thumb} status={a.p.status} className="h-12 w-10" label={a.p.title} play={false} />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <b className="truncate text-[14px]">{a.p.title}</b>
                  <span className="truncate text-[13px] text-mute">{a.text}</span>
                </span>
                <span className="shrink-0 font-mono text-[12px] text-mute">{a.date.slice(5)}</span>
              </a>
            ))}
          </Card>
        ) : (
          <Empty title="No posts yet" body="Submit a published post to get it verified." action={<Button as="a" href={href('studio-submit')}>Submit a post</Button>} />
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- campaigns

function eligible(c, me) {
  return c.markets.includes(me.market);
}

function Campaigns() {
  const { state } = useStore();
  const me = useMe();
  const live = state.campaigns.filter((c) => c.status === 'Live');
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Campaigns" title="L campaigns" sub="Brand briefs open to Creator Studio creators. Join one, then submit your post against it." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {live.map((c) => {
          const joined = me.campaigns.includes(c.id);
          const ok = eligible(c, me);
          return (
            <Card key={c.id} className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5"><span className="text-[13px] font-semibold text-mute">{c.brand}</span><h2 className="text-[20px] font-bold leading-tight">{c.name}</h2></div>
                {joined ? <span className="rounded-full bg-ink px-2.5 py-1 text-[12px] font-semibold text-white">Joined</span> : !ok && <span className="rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold text-mute">Not in your market</span>}
              </div>
              <p className="text-[15px] text-ink-2">{c.description}</p>
              <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
                <div><dt className="text-mute">Markets</dt><dd className="font-semibold">{c.markets.map((m) => MARKETS[m].name).join(', ')}</dd></div>
                <div><dt className="text-mute">Period</dt><dd className="font-semibold">{c.start} to {c.end}</dd></div>
                <div><dt className="text-mute">Deliverables</dt><dd className="font-semibold">{c.deliverables[0]}</dd></div>
                <div><dt className="text-mute">Reward</dt><dd className="font-semibold">{c.reward}</dd></div>
                <div className="sm:col-span-2"><dt className="text-mute">Eligibility</dt><dd className="font-semibold">{c.eligibility.join(' · ')}</dd></div>
              </dl>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button as="a" href={href(`studio-campaign-${c.id}`)}>View brief <ArrowRight size={16} /></Button>
                {joined && <Button variant="outline" as="a" href={href(`studio-submit-${c.id}`)}>Submit a post</Button>}
              </div>
            </Card>
          );
        })}
      </div>
      <DemoNote>Sample campaigns for the prototype. Brands, fees and dates are illustrative.</DemoNote>
    </div>
  );
}

function BriefBlock({ title, Icon, children }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4">
      <h3 className="flex items-center gap-2 text-[15px] font-bold">{Icon && <Icon size={16} className="text-mute" />}{title}</h3>
      <div className="text-[15px] text-ink-2">{children}</div>
    </div>
  );
}

function CampaignBrief({ id }) {
  const { state, dispatch, notify } = useStore();
  const me = useMe();
  const c = state.campaigns.find((x) => x.id === id && x.status === 'Live');
  if (!c) return <Empty title="Campaign not found" body="It may have closed." action={<Button as="a" href={href('studio-campaigns')}>All campaigns</Button>} />;
  const joined = me.campaigns.includes(c.id);
  const ok = eligible(c, me);
  const mine = state.posts.filter((p) => p.creatorId === me.id && p.campaignId === c.id);
  return (
    <div className="flex flex-col gap-6">
      <a href={href('studio-campaigns')} className="inline-flex items-center gap-1 text-[13px] font-semibold text-mute hover:text-ink"><ArrowLeft size={14} /> Campaigns</a>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <PageHead eyebrow={`${c.brand} · campaign brief`} title={c.name} sub={c.description} />
          <BriefBlock title="Objective">{c.objective}</BriefBlock>
          <BriefBlock title="Requirements"><ul className="list-disc space-y-1 pl-5">{c.requirements.map((r) => <li key={r}>{r}</li>)}</ul></BriefBlock>
          <BriefBlock title="Deliverables"><ul className="list-disc space-y-1 pl-5">{c.deliverables.map((r) => <li key={r}>{r}</li>)}</ul></BriefBlock>
          <BriefBlock title="Hashtags and mentions" Icon={Hash}>
            <div className="flex flex-wrap gap-1.5">
              {c.hashtags.map((h) => <span key={h} className="rounded-full bg-paper px-2.5 py-1 font-mono text-[13px]">{h}</span>)}
              {c.mentions.map((h) => <span key={h} className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 font-mono text-[13px]"><AtSign size={12} />{h.replace('@', '')}</span>)}
            </div>
          </BriefBlock>
          <BriefBlock title="Eligibility"><ul className="list-disc space-y-1 pl-5">{c.eligibility.map((r) => <li key={r}>{r}</li>)}</ul></BriefBlock>
          <BriefBlock title="How it is recognised">Campaign posts are verified like any other post. A post that comes in at or below its L line carries the L Mark and counts towards L Creator. The campaign reward follows the brief, whatever the L-Score.</BriefBlock>
        </div>
        <aside className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="flex flex-col gap-4 p-5">
            <dl className="flex flex-col gap-3 text-[14px]">
              <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-mute" /><div><dt className="text-mute">Eligible markets</dt><dd className="font-semibold">{c.markets.map((m) => MARKETS[m].name).join(', ')}</dd></div></div>
              <div className="flex items-start gap-2"><CalendarDays size={16} className="mt-0.5 text-mute" /><div><dt className="text-mute">Period · deadline</dt><dd className="font-semibold">{c.start} to {c.end}<br />Submit by {c.deadline}</dd></div></div>
              <div className="flex items-start gap-2"><Gift size={16} className="mt-0.5 text-mute" /><div><dt className="text-mute">Reward</dt><dd className="font-semibold">{c.reward}</dd></div></div>
            </dl>
            {!ok && <p className="rounded-xl bg-paper p-3 text-[13px]">This campaign is not open in {MARKETS[me.market].name}.</p>}
            {ok && !joined && <Button variant="brand" onClick={() => { dispatch({ type: 'join', id: c.id }); notify(`Joined ${c.name}`); }}>Join campaign</Button>}
            {joined && <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold"><Check size={16} /> You joined this campaign</span>}
            <Button variant={joined ? 'primary' : 'outline'} disabled={!joined} as={joined ? 'a' : 'button'} href={joined ? href(`studio-submit-${c.id}`) : undefined}><Upload size={16} /> Submit a post</Button>
            {!joined && ok && <span className="text-[12px] text-mute">Join first to submit against this brief.</span>}
          </Card>
          {mine.length > 0 && (
            <Card className="flex flex-col gap-2 p-5">
              <span className="eyebrow">Your submissions</span>
              {mine.map((p) => (
                <a key={p.id} href={href(`studio-post-${p.id}`)} className="flex items-center justify-between gap-2 py-1 text-[14px] hover:underline"><span className="truncate">{p.title}</span><StatusPill status={p.status} className="!px-2 !py-0.5 !text-[11px]" /></a>
              ))}
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
