import React, { useState } from 'react';
import { Plus, Pencil, Inbox } from 'lucide-react';
import { Button, Card, PageHead, Modal, Field, DemoNote, Seg, cx } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS } from '../../lib/score.js';

const lines = (a) => (a || []).join('\n');
const split = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const words = (s) => s.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);

function Editor({ campaign, onClose }) {
  const { dispatch, notify } = useStore();
  const [f, setF] = useState(() => ({
    id: campaign?.id || `k${Date.now().toString(36)}`, name: '', brand: '', status: 'Draft', tone: 0, markets: [], description: '', objective: '', reward: '', start: '', end: '', deadline: '',
    ...campaign,
    requirements: lines(campaign?.requirements), deliverables: lines(campaign?.deliverables), eligibility: lines(campaign?.eligibility),
    hashtags: (campaign?.hashtags || ['#TakingTheL']).join(' '), mentions: (campaign?.mentions || []).join(' '),
  }));
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (m) => setF((x) => ({ ...x, markets: x.markets.includes(m) ? x.markets.filter((y) => y !== m) : [...x.markets, m] }));
  const save = () => {
    const er = {};
    if (!f.name.trim()) er.name = 'Required';
    if (!f.brand.trim()) er.brand = 'Required';
    if (!f.markets.length) er.markets = 'Pick at least one market';
    if (!f.start || !f.end) er.dates = 'Add start and end dates';
    else if (f.end < f.start) er.dates = 'End must be after start';
    setErr(er);
    if (Object.keys(er).length) return;
    dispatch({ type: 'saveCampaign', campaign: { ...f, name: f.name.trim(), brand: f.brand.trim(), requirements: split(f.requirements), deliverables: split(f.deliverables), eligibility: split(f.eligibility), hashtags: words(f.hashtags), mentions: words(f.mentions), deadline: f.deadline || f.end } });
    notify(campaign ? 'Campaign saved' : 'Campaign created');
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={campaign ? `Edit ${campaign.name}` : 'New campaign'} wide>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Campaign name" htmlFor="c-name" error={err.name}><input id="c-name" className="input" value={f.name} onChange={set('name')} /></Field>
          <Field label="Brand" htmlFor="c-brand" error={err.brand}><input id="c-brand" className="input" value={f.brand} onChange={set('brand')} /></Field>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="label">Status</span>
          <Seg label="Status" value={f.status} onChange={(v) => setF((x) => ({ ...x, status: v }))} options={['Draft', 'Live', 'Closed']} />
          <span className="text-[12px] text-mute">Only Live campaigns appear in Creator Studio.</span>
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="label mb-1.5">Eligible markets</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MARKETS).map(([k, m]) => (
              <button key={k} type="button" aria-pressed={f.markets.includes(k)} onClick={() => toggle(k)} className={cx('h-9 rounded-full border px-3.5 text-[13px] font-semibold', f.markets.includes(k) ? 'border-ink bg-ink text-white' : 'border-line')}>{m.name}</button>
            ))}
          </div>
          {err.markets && <span className="text-[13px] text-bad">{err.markets}</span>}
        </fieldset>
        <Field label="Description" htmlFor="c-desc"><textarea id="c-desc" className="input h-16 resize-none" value={f.description} onChange={set('description')} /></Field>
        <Field label="Objective" htmlFor="c-obj"><input id="c-obj" className="input" value={f.objective} onChange={set('objective')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Requirements (one per line)" htmlFor="c-req"><textarea id="c-req" className="input h-24 resize-none" value={f.requirements} onChange={set('requirements')} /></Field>
          <Field label="Deliverables (one per line)" htmlFor="c-del"><textarea id="c-del" className="input h-24 resize-none" value={f.deliverables} onChange={set('deliverables')} /></Field>
          <Field label="Eligibility (one per line)" htmlFor="c-elig"><textarea id="c-elig" className="input h-24 resize-none" value={f.eligibility} onChange={set('eligibility')} /></Field>
          <div className="flex flex-col gap-4">
            <Field label="Hashtags" htmlFor="c-tags"><input id="c-tags" className="input font-mono text-[13px]" value={f.hashtags} onChange={set('hashtags')} /></Field>
            <Field label="Mentions" htmlFor="c-ment"><input id="c-ment" className="input font-mono text-[13px]" value={f.mentions} onChange={set('mentions')} /></Field>
          </div>
        </div>
        <Field label="Reward" htmlFor="c-reward"><input id="c-reward" className="input" value={f.reward} onChange={set('reward')} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Start" htmlFor="c-start" error={err.dates}><input id="c-start" type="date" className="input" value={f.start} onChange={set('start')} /></Field>
          <Field label="End" htmlFor="c-end"><input id="c-end" type="date" className="input" value={f.end} onChange={set('end')} /></Field>
          <Field label="Submission deadline" htmlFor="c-dl"><input id="c-dl" type="date" className="input" value={f.deadline} onChange={set('deadline')} /></Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>{campaign ? 'Save campaign' : 'Create campaign'}</Button>
        </div>
      </div>
    </Modal>
  );
}

export function CampaignsAdmin() {
  const { state } = useStore();
  const [edit, setEdit] = useState(null);
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Campaigns" title="Campaigns" sub="Create and edit briefs, set eligible markets and dates, and review what creators submit." actions={<Button onClick={() => setEdit('new')}><Plus size={16} /> New campaign</Button>} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {state.campaigns.map((c) => {
          const posts = state.posts.filter((p) => p.campaignId === c.id);
          const creators = state.creators.filter((x) => x.campaigns.includes(c.id)).length;
          return (
            <Card key={c.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col"><span className="text-[13px] text-mute">{c.brand}</span><b className="text-[18px]">{c.name}</b></div>
                <span className={cx('rounded-full px-2.5 py-1 text-[12px] font-semibold', c.status === 'Live' ? 'bg-ink text-white' : 'border border-line text-mute')}>{c.status}</span>
              </div>
              <p className="text-[14px] text-ink-2">{c.description}</p>
              <dl className="grid grid-cols-2 gap-2 text-[13px] sm:grid-cols-4">
                <div><dt className="text-mute">Markets</dt><dd className="font-semibold">{c.markets.map((m) => MARKETS[m].name).join(', ')}</dd></div>
                <div><dt className="text-mute">Dates</dt><dd className="font-semibold">{c.start} to {c.end}</dd></div>
                <div><dt className="text-mute">Creators joined</dt><dd className="font-mono font-semibold">{creators}</dd></div>
                <div><dt className="text-mute">Submissions</dt><dd className="font-mono font-semibold">{posts.length} · {posts.filter((p) => p.status === 'review').length} pending</dd></div>
              </dl>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setEdit(c)}><Pencil size={14} /> Edit</Button>
                <Button variant="ghost" size="sm" as="a" href={href(`admin-submissions-${c.id}`)}><Inbox size={14} /> Review submissions</Button>
              </div>
            </Card>
          );
        })}
      </div>
      <DemoNote>Sample campaigns. Edits stay in this browser.</DemoNote>
      {edit && <Editor campaign={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
    </div>
  );
}
