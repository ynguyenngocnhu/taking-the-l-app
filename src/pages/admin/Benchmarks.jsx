import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Button, Card, Field, PageHead, DemoNote, Seg } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { MARKETS, FORMATS, fmt, defaultBenchmarks } from '../../lib/score.js';

export function Benchmarks() {
  const { state, dispatch, notify } = useStore();
  const [b, setB] = useState(() => JSON.parse(JSON.stringify(state.benchmarks)));
  const [period, setPeriod] = useState(state.benchmarkPeriod);
  const dirty = JSON.stringify(b) !== JSON.stringify(state.benchmarks) || JSON.stringify(period) !== JSON.stringify(state.benchmarkPeriod);
  const set = (m, f, v) => setB((x) => ({ ...x, [m]: { ...x[m], [f]: Math.max(1, Number(v) || 0) } }));
  const save = () => {
    dispatch({ type: 'benchmarks', benchmarks: b });
    dispatch({ type: 'period', period });
    notify('L lines saved');
  };
  const counts = (m, f) => state.posts.filter((p) => p.market === m && (f === 'long' ? p.secs > 90 : p.secs <= 90) && (p.status === 'qualified' || p.status === 'not')).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHead eyebrow="Benchmarks" title="L lines" sub="The median L-Score for each market and format, reset every quarter. New verifications use the saved lines." actions={<Button onClick={save} disabled={!dirty}><Save size={16} /> Save</Button>} />
      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-[16px] font-bold">Period</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Label" htmlFor="bp-label"><input id="bp-label" className="input" value={period.label} onChange={(e) => setPeriod({ ...period, label: e.target.value })} /></Field>
          <Field label="Start" htmlFor="bp-start"><input id="bp-start" type="date" className="input" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} /></Field>
          <Field label="End" htmlFor="bp-end"><input id="bp-end" type="date" className="input" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} /></Field>
          <div className="flex flex-col gap-1.5"><span className="label">Status</span><Seg label="Status" value={period.status} onChange={(v) => setPeriod({ ...period, status: v })} options={['Draft', 'Active', 'Closed']} /></div>
        </div>
      </Card>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="bg-paper text-[11px] uppercase tracking-wider text-mute">
            <tr><th className="px-4 py-3">Market</th>{Object.entries(FORMATS).map(([k, f]) => <th key={k} className="px-4 py-3">{f.name} <span className="normal-case tracking-normal">({f.note})</span></th>)}<th className="px-4 py-3">Period</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {Object.entries(MARKETS).map(([m, mk]) => (
              <tr key={m} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{mk.name}</td>
                {Object.keys(FORMATS).map((f) => (
                  <td key={f} className="px-4 py-3">
                    <label className="flex items-center gap-2">
                      <input type="number" min="1" className="input h-10 w-24 py-0 font-mono" aria-label={`${mk.name} ${FORMATS[f].name} L line`} value={b[m][f]} onChange={(e) => set(m, f, e.target.value)} />
                      <span className="text-[12px] text-mute">g · {counts(m, f)} verified</span>
                    </label>
                  </td>
                ))}
                <td className="whitespace-nowrap px-4 py-3 text-mute">{period.label}</td>
                <td className="px-4 py-3">{period.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="ghost" className="self-start" onClick={() => setB(defaultBenchmarks())}><RotateCcw size={15} /> Restore sample values</Button>
      <DemoNote>Sample L lines for the prototype, not validated benchmarks. Method {state.method.version}, last updated {state.method.updated}.</DemoNote>
    </div>
  );
}
