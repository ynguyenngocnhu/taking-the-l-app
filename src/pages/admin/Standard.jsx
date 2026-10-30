import React, { useState } from 'react';
import { Pencil, Save } from 'lucide-react';
import { Button, Card, PageHead, DemoNote, Avatar, Seg, Empty, cx } from '../../components/ui.jsx';
import { useStore, leaderboard } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { MARKETS, FORMATS, RESOLUTIONS, ENERGY_KWH_PER_GB, fmt } from '../../lib/score.js';
import { QUARTER, L_CREATOR_TARGET } from '../../data/mock.js';

export function Benchmarks() {
  const { state, dispatch, notify } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.benchmarks);
  const [err, setErr] = useState('');
  const start = () => { setDraft(JSON.parse(JSON.stringify(state.benchmarks))); setEditing(true); setErr(''); };
  const save = () => {
    for (const [k, b] of Object.entries(draft)) {
      for (const f of ['short', 'long']) {
        const v = Number(b[f]);
        if (!Number.isInteger(v) || v < 50 || v > 20000) { setErr(`${MARKETS[k].name} ${FORMATS[f].name.toLowerCase()}: enter a whole number between 50 and 20,000.`); return; }
      }
    }
    const clean = Object.fromEntries(Object.entries(draft).map(([k, b]) => [k, { short: Number(b.short), long: Number(b.long) }]));
    dispatch({ type: 'benchmarks', benchmarks: clean });
    setEditing(false);
    setErr('');
    notify('Benchmarks saved. Scores now compare to the new lines.');
  };
  const set = (k, f) => (e) => setDraft((d) => ({ ...d, [k]: { ...d[k], [f]: e.target.value } }));
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="L Standard & benchmarks" title="L lines by market and format" sub="A post earns an L when its L-Score is at or under the line for its market and format." actions={editing ? (
        <>
          <Button variant="ghost" onClick={() => { setEditing(false); setErr(''); }}>Cancel</Button>
          <Button onClick={save}><Save size={16} /> Save benchmarks</Button>
        </>
      ) : <Button variant="outline" onClick={start}><Pencil size={16} /> Edit values</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Methodology', state.method.version], ['Last updated', state.method.updated], ['Energy per GB', `${ENERGY_KWH_PER_GB} kWh`], ['Formats', Object.values(FORMATS).map((f) => f.name.split(' ')[0]).join(' / ')]].map(([k, v]) => (
          <Card key={k} className="flex flex-col gap-1 p-4"><span className="eyebrow">{k}</span><b className="font-mono text-[16px]">{v}</b></Card>
        ))}
      </div>
      {err && <p role="alert" className="rounded-xl bg-bad-bg px-4 py-3 text-[14px] text-bad">{err}</p>}
      <Card className="overflow-hidden">
        <div className="scroll-x">
          <table className="w-full min-w-[620px] text-[14px] tnum">
            <thead className="bg-paper text-left text-mute">
              <tr>
                <th className="px-4 py-3 font-medium">Market</th>
                <th className="px-2 py-3 text-right font-medium">Grid g/kWh</th>
                <th className="px-2 py-3 text-right font-medium">{FORMATS.short.name} <span className="font-normal">({FORMATS.short.note})</span></th>
                <th className="px-4 py-3 text-right font-medium">{FORMATS.long.name} <span className="font-normal">({FORMATS.long.note})</span></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MARKETS).map(([k, m]) => (
                <tr key={k} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{m.name}</td>
                  <td className="px-2 py-3 text-right font-mono">{m.grid}</td>
                  {['short', 'long'].map((f) => (
                    <td key={f} className={cx('py-2 text-right font-mono', f === 'long' ? 'px-4' : 'px-2')}>
                      {editing ? (
                        <input aria-label={`${m.name} ${FORMATS[f].name} L line`} id={`bm-${k}-${f}`} inputMode="numeric" className="input ml-auto w-24 py-1.5 text-right font-mono" value={draft[k][f]} onChange={set(k, f)} />
                      ) : <b>{fmt(state.benchmarks[k][f])}</b>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="flex flex-col gap-2 p-5">
        <span className="eyebrow">Bitrate assumptions</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(RESOLUTIONS).map(([k, r]) => <span key={k} className="rounded-full bg-paper px-3 py-1.5 font-mono text-[13px]">{k} · {r.mbps} Mbps</span>)}
        </div>
      </Card>
      <DemoNote>Benchmark values are illustrative for this prototype. They are not validated emission factors.</DemoNote>
    </div>
  );
}

export function Leaderboard() {
  const { state } = useStore();
  const [market, setMarket] = useState('all');
  const rows = leaderboard(state).filter((r) => market === 'all' || r.market === market);
  const maxPerf = Math.max(1, ...rows.map((r) => Math.abs(r.perf)));
  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow={`Leaderboard · ${QUARTER.label}`} title="Quarterly creator leaderboard" sub="Ranked by qualifying L posts this quarter, then by average distance under the L line." />
      <div className="scroll-x -mx-1 px-1">
        <Seg label="Market" value={market} onChange={setMarket} options={[{ value: 'all', label: 'All markets' }, ...Object.entries(MARKETS).map(([k, m]) => ({ value: k, label: m.name }))]} />
      </div>
      {rows.length === 0 ? <Empty title="No creators in this market yet" /> : (
        <Card className="overflow-hidden">
          <div className="scroll-x">
            <table className="w-full min-w-[720px] text-[14px] tnum">
              <thead className="bg-paper text-left text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-2 py-3 font-medium">Creator</th>
                  <th className="px-2 py-3 font-medium">Market</th>
                  <th className="px-2 py-3 text-right font-medium">L posts</th>
                  <th className="px-2 py-3 font-medium">L performance</th>
                  <th className="px-4 py-3 text-right font-medium">Campaigns</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={cx('border-t border-line', i < 3 && market === 'all' && 'bg-brand-soft/40')}>
                    <td className="px-4 py-3"><span className={cx('flex h-8 w-8 items-center justify-center rounded-full font-mono text-[13px] font-bold', i < 3 ? 'bg-ink text-white' : 'bg-paper')}>{market === 'all' ? r.rank : i + 1}</span></td>
                    <td className="px-2 py-3"><a href={href(`admin-creator-${r.id}`)} className="flex items-center gap-3 hover:underline"><Avatar name={r.name} size={32} /><span className="flex flex-col leading-tight"><b>{r.name}</b><span className="text-[12px] text-mute">{r.handle}</span></span></a></td>
                    <td className="px-2 py-3">{MARKETS[r.market].name}</td>
                    <td className="px-2 py-3 text-right font-mono"><b className="text-[16px]">{r.qualifiedQ}</b>{r.qualifiedQ >= L_CREATOR_TARGET && <span className="ml-2 rounded bg-brand px-1.5 py-0.5 font-sans text-[11px] font-bold">L Creator</span>}</td>
                    <td className="px-2 py-3">
                      <span className="flex items-center gap-2">
                        <span className="relative h-2 w-24 rounded-full bg-ink/[0.07]"><span className={cx('absolute inset-y-0 left-0 rounded-full', r.perf >= 0 ? 'bg-brand' : 'bg-over')} style={{ width: `${(Math.abs(r.perf) / maxPerf) * 100}%` }} /></span>
                        <span className="font-mono text-[13px]">{r.perf >= 0 ? `${r.perf}% under` : `${-r.perf}% over`}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{r.campaigns.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <DemoNote>Demo data. Creator names, posts and scores are fictional.</DemoNote>
    </div>
  );
}
