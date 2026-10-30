import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, LabelList } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Card, Stat, PageHead, DemoNote, Seg, Button, cx } from '../../components/ui.jsx';
import { useStore, enrich, inQuarter } from '../../lib/store.jsx';
import { href } from '../../lib/router.js';
import { fmt, compact, MARKETS } from '../../lib/score.js';

const C = { blue: '#000000', green: '#9C7F45', red: '#C9C9C9', review: '#6B6B6B', grid: '#E6E6E6', text: '#5C5C5C' };

function weekStart(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  const day = (d.getUTCDay() + 6) % 7; // Monday start
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-[12px] shadow-md">
      {label && <div className="mb-1 font-mono text-mute">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload.fill }} />
          <span className="text-mute">{p.name}</span>
          <b className="ml-auto pl-3 font-mono">{fmt(p.value)}</b>
        </div>
      ))}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-ink-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />{i.label}{i.value != null && <b className="font-mono">{fmt(i.value)}</b>}
        </span>
      ))}
    </div>
  );
}

export default function Overview() {
  const { state } = useStore();
  const [range, setRange] = useState('all');
  const posts = useMemo(() => state.posts.filter((p) => p.type !== 'draft').map((p) => enrich(p, state.benchmarks)), [state]);
  const scope = range === 'q' ? posts.filter(inQuarter) : posts;

  const qualified = scope.filter((p) => p.status === 'qualified');
  const scored = scope.filter((p) => p.status === 'qualified' || p.status === 'not');
  const avg = scored.length ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length) : 0;
  const inCampaign = state.creators.filter((c) => c.campaigns.length).length;

  const trend = useMemo(() => {
    const map = new Map();
    for (const p of scope) {
      const w = weekStart(p.submitted);
      const r = map.get(w) || { week: w, submitted: 0, qualified: 0 };
      r.submitted += 1;
      if (p.status === 'qualified') r.qualified += 1;
      map.set(w, r);
    }
    return [...map.values()].sort((a, b) => a.week.localeCompare(b.week)).map((r) => ({ ...r, label: r.week.slice(5).replace('-', '/') }));
  }, [scope]);

  const split = [
    { name: 'Qualified', value: qualified.length, fill: C.green },
    { name: 'Not qualified', value: scope.filter((p) => p.status === 'not' || p.status === 'rejected').length, fill: C.red },
    { name: 'Under review', value: scope.filter((p) => p.status === 'review').length, fill: C.review },
  ];

  const camp = state.campaigns.filter((c) => c.status !== 'Draft').map((c) => ({
    name: c.name,
    lposts: scope.filter((p) => p.campaignId === c.id && p.status === 'qualified').length,
    creators: state.creators.filter((x) => x.campaigns.includes(c.id)).length,
  }));

  const pending = posts.filter((p) => p.status === 'review').length;

  return (
    <div className="flex flex-col gap-8">
      <PageHead eyebrow="Admin Console" title="Programme overview" sub="SAPMENA pilot. All figures are fictional demo data." actions={<Seg label="Time range" value={range} onChange={setRange} options={[{ value: 'all', label: 'Since launch' }, { value: 'q', label: 'This quarter' }]} />} />
      {pending > 0 && (
        <a href={href('admin-review')} className="flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 font-semibold text-white">
          <span>{pending} submissions are waiting for verification</span>
          <span className="flex items-center gap-1 text-[14px]">Review now <ArrowRight size={16} /></span>
        </a>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        <Stat label="Total creators" value={state.creators.length} sub={`${Object.keys(MARKETS).length} markets`} />
        <Stat label="Submitted posts" value={fmt(scope.length)} />
        <Stat label="Qualifying L posts" value={fmt(qualified.length)} sub={scope.length ? `${Math.round((qualified.length / scope.length) * 100)}% of submitted` : ''} accent />
        <Stat label="Estimated views" value={compact(scope.reduce((s, p) => s + p.views, 0))} />
        <Stat label="Average L-Score" value={avg} sub="g CO₂e / 1k views" />
        <Stat label="In a campaign" value={`${Math.round((inCampaign / state.creators.length) * 100)}%`} sub={`${inCampaign} of ${state.creators.length} creators`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="flex min-w-0 flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold">Submissions per week</h2>
            <Legend items={[{ label: 'Submitted', color: C.blue }, { label: 'Qualified', color: C.green }]} />
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.text }} tickLine={false} axisLine={{ stroke: C.grid }} interval="preserveStartEnd" minTickGap={18} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.text }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: '#121411', strokeDasharray: '3 3' }} />
                <Line type="monotone" dataKey="submitted" name="Submitted" stroke={C.blue} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="qualified" name="Qualified" stroke={C.green} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[12px] text-mute">Week starting (Monday)</span>
        </Card>

        <Card className="flex min-w-0 flex-col gap-4 p-5">
          <h2 className="text-[16px] font-bold">Qualified vs not qualified</h2>
          <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
            <div className="relative h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={split} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="#fff" strokeWidth={2} startAngle={90} endAngle={-270}>
                    {split.map((s) => <Cell key={s.name} fill={s.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="display text-[30px] font-black tnum">{scope.length ? Math.round((qualified.length / scope.length) * 100) : 0}%</span>
                <span className="text-[11px] text-mute">qualified</span>
              </div>
            </div>
            <ul className="flex w-full flex-col gap-2 text-[14px]">
              {split.map((s) => (
                <li key={s.name} className="flex items-center gap-2 border-b border-line pb-2 last:border-0">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.fill }} />
                  <span className="flex-1">{s.name}</span>
                  <b className="font-mono tnum">{fmt(s.value)}</b>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="flex min-w-0 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold">Campaign performance: qualifying L posts</h2>
          <a href={href('admin-campaigns')} className="text-[13px] font-semibold hover:underline">Manage campaigns</a>
        </div>
        <div style={{ height: camp.length * 56 + 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={camp} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barCategoryGap={14}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12, fill: '#2B2E29' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(18,20,17,.04)' }} />
              <Bar dataKey="lposts" name="L posts" fill={C.green} radius={[0, 4, 4, 0]} maxBarSize={26}>
                <LabelList dataKey="lposts" position="right" style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fill: '#121411', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 text-[13px] text-mute">
          {camp.map((c) => <span key={c.name}>{c.name}: <b className="font-mono text-ink">{c.creators}</b> creators</span>)}
        </div>
      </Card>
      <DemoNote />
    </div>
  );
}
