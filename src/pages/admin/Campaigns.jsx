import React, { useState } from 'react';
import { Plus, Pencil, Eye } from 'lucide-react';
import { Button, Card, PageHead, Modal, Field, Avatar, DemoNote, Seg, Empty, cx } from '../../components/ui.jsx';
import { useStore, enrich } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS } from '../../lib/score.js';
import { CampaignArt } from '../studio/Studio.jsx';

const STATUS_CLS = { Live: 'bg-lime text-ink', Draft: 'bg-paper text-mute border border-line', Ended: 'bg-ink/10 text-ink-2' };
const BLANK = { name: '', brand: "L'Oréal Paris", description: '', reward: '', start: '2026-11-01', end: '2026-12-31', status: 'Draft', brief: [] };

export function CampaignsAdmin() {
  const { state, dispatch, notify } = useStore();
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);
  const [filter, setFilter] = useState('all');
  const list = state.campaigns.filter((c) => filter === 'all' || c.status === filter);
  const stats = (id) => {
    const posts = state.posts.filter((p) => p.campaignId === id && p.type !== 'draft');
    return { creators: state.creators.filter((c) => c.campaigns.includes(id)), posts: posts.length, lposts: posts.filter((p) => p.status === 'qualified').length };
  };
  const viewing = view && state.campaigns.find((c) => c.id === view);
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Campaign management" title="Campaigns" sub="Create briefs, set dates and rewards, and see who is taking part." actions={<Button onClick={() => setEdit({ ...BLANK })}><Plus size={17} /> New campaign</Button>} />
      <Seg label="Filter campaigns" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, 'Live', 'Draft', 'Ended']} />
      {list.length === 0 ? (
        <Empty title={`No ${filter.toLowerCase()} campaigns`} body="Create one, or change the filter." />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => {
            const s = stats(c.id);
            return (
              <Card key={c.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <CampaignArt c={c} className="h-20 w-full shrink-0 rounded-xl sm:w-28" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-[16px]">{c.name}</b>
                    <span className={cx('rounded-full px-2 py-0.5 text-[11px] font-bold', STATUS_CLS[c.status])}>{c.status}</span>
                  </div>
                  <span className="text-[13px] text-mute">{c.brand} · <span className="font-mono">{c.start} → {c.end}</span> · {c.reward}</span>
                </div>
                <div className="flex gap-6 font-mono text-[13px]">
                  <span className="flex flex-col"><b className="text-[18px] tnum">{s.creators.length}</b><span className="text-mute">creators</span></span>
                  <span className="flex flex-col"><b className="text-[18px] tnum">{s.lposts}</b><span className="text-mute">L posts</span></span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setView(c.id)}><Eye size={15} /> View</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEdit({ ...c })}><Pencil size={15} /> Edit</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <DemoNote>Changes are saved in this browser only.</DemoNote>

      <Modal open={!!viewing} onClose={() => setView(null)} title={viewing ? viewing.name : ''} wide>
        {viewing && (() => {
          const s = stats(viewing.id);
          return (
            <div className="flex flex-col gap-5">
              <p className="text-[15px]">{viewing.description}</p>
              <dl className="grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-4">
                {[['Brand', viewing.brand], ['Status', viewing.status], ['Dates', `${viewing.start} → ${viewing.end}`], ['Reward', viewing.reward]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-paper p-3"><dt className="text-[12px] text-mute">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
              <div className="flex flex-col gap-2">
                <span className="eyebrow">Participating creators ({s.creators.length})</span>
                {s.creators.length === 0 ? <p className="text-[14px] text-mute">No creators have joined yet.</p> : (
                  <ul className="divide-y divide-line rounded-xl border border-line">
                    {s.creators.map((c) => {
                      const n = state.posts.filter((p) => p.creatorId === c.id && p.campaignId === viewing.id && p.status === 'qualified').length;
                      return (
                        <li key={c.id}>
                          <a href={href(`admin-creator-${c.id}`)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-paper">
                            <Avatar name={c.name} size={30} />
                            <span className="flex flex-1 flex-col leading-tight"><b className="text-[14px]">{c.name}</b><span className="text-[12px] text-mute">{c.handle} · {MARKETS[c.market].name}</span></span>
                            <span className="font-mono text-[13px]"><b>{n}</b> L posts</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="outline" onClick={() => { setView(null); setEdit({ ...viewing }); }}><Pencil size={15} /> Edit campaign</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <CampaignForm value={edit} onClose={() => setEdit(null)} onSave={(c) => {
        const isNew = !c.id;
        dispatch({ type: 'saveCampaign', campaign: isNew ? { ...c, id: `k${Date.now().toString(36)}`, tone: state.campaigns.length } : c });
        setEdit(null);
        notify(isNew ? 'Campaign created' : 'Campaign saved');
      }} />
    </div>
  );
}

function CampaignForm({ value, onClose, onSave }) {
  const [f, setF] = useState(value);
  const [err, setErr] = useState({});
  const [key, setKey] = useState(null);
  if (value && key !== value) { setKey(value); setF(value); setErr({}); }
  if (!value || !f) return null;
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target ? e.target.value : e }));
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Name the campaign.';
    if (!f.reward.trim()) er.reward = 'Describe the reward creators get.';
    if (!f.start || !f.end) er.end = 'Set both dates.';
    else if (f.end <= f.start) er.end = 'The end date must be after the start date.';
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ ...f, name: f.name.trim(), brief: f.brief.length ? f.brief : [f.description || 'Brief to follow'] });
  };
  return (
    <Modal open onClose={onClose} title={value.id ? 'Edit campaign' : 'New campaign'} wide>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Field label="Campaign name" htmlFor="c-name" error={err.name}><input id="c-name" className={cx('input', err.name && 'input-error')} value={f.name} onChange={set('name')} placeholder="e.g. Thirty Seconds of Glow" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" htmlFor="c-brand">
            <select id="c-brand" className="input" value={f.brand} onChange={set('brand')}>
              {["L'Oréal Paris", 'Garnier', 'Maybelline New York', 'CeraVe', 'La Roche-Posay', 'NYX Professional Makeup'].map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Status" htmlFor="c-status">
            <select id="c-status" className="input" value={f.status} onChange={set('status')}>{['Draft', 'Live', 'Ended'].map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
        </div>
        <Field label="Description" htmlFor="c-desc"><textarea id="c-desc" className="input h-24 resize-none" value={f.description} onChange={set('description')} placeholder="What creators should make, in a sentence or two." /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="c-start"><input id="c-start" type="date" className="input" value={f.start} onChange={set('start')} /></Field>
          <Field label="End date" htmlFor="c-end" error={err.end}><input id="c-end" type="date" className={cx('input', err.end && 'input-error')} value={f.end} onChange={set('end')} /></Field>
        </div>
        <Field label="Reward" htmlFor="c-reward" error={err.reward} hint="Shown to creators on the campaign card."><input id="c-reward" className={cx('input', err.reward && 'input-error')} value={f.reward} onChange={set('reward')} placeholder="$300 fee + L-Media Fund boost" /></Field>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">{value.id ? 'Save changes' : 'Create campaign'}</Button>
        </div>
      </form>
    </Modal>
  );
}
