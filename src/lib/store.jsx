import React, { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';
import { initialState, TODAY, QUARTER, ME } from '../data/mock.js';
import { lScore, lineFor, formatOf } from './score.js';

const KEY = 'lplatform.demo.v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.version === 1 && Array.isArray(s.posts)) return s;
    }
  } catch (e) { /* storage blocked: fall back to fresh demo data */ }
  return initialState();
}

function reducer(state, a) {
  switch (a.type) {
    case 'submit':
      return { ...state, posts: [a.post, ...state.posts] };
    case 'decide': {
      const posts = state.posts.map((p) => {
        if (p.id !== a.id) return p;
        const notes = a.note ? [...p.notes, { by: 'Admin (you)', date: TODAY, text: a.note }] : p.notes;
        if (a.decision === 'reject') return { ...p, status: 'rejected', verified: TODAY, notes };
        const line = lineFor(state.benchmarks, p.market, p.secs);
        return { ...p, status: lScore(p) <= line ? 'qualified' : 'not', verified: TODAY, notes };
      });
      return { ...state, posts };
    }
    case 'note':
      return { ...state, posts: state.posts.map((p) => (p.id === a.id ? { ...p, notes: [...p.notes, { by: 'Admin (you)', date: TODAY, text: a.text }] } : p)) };
    case 'join':
      return { ...state, creators: state.creators.map((c) => (c.id === ME && !c.campaigns.includes(a.id) ? { ...c, campaigns: [...c.campaigns, a.id] } : c)) };
    case 'saveCampaign': {
      const exists = state.campaigns.some((c) => c.id === a.campaign.id);
      return { ...state, campaigns: exists ? state.campaigns.map((c) => (c.id === a.campaign.id ? a.campaign : c)) : [a.campaign, ...state.campaigns] };
    }
    case 'benchmarks':
      return { ...state, benchmarks: a.benchmarks, method: { ...state.method, updated: TODAY } };
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }, [state]);

  const notify = useCallback((text, tone = 'ok') => {
    setToast({ text, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => ({ state, dispatch, toast, notify }), [state, toast, notify]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  return useContext(Ctx);
}

// Derived helpers ---------------------------------------------------------

export function enrich(post, benchmarks) {
  const score = lScore(post);
  const line = lineFor(benchmarks, post.market, post.secs);
  return { ...post, score, line, format: formatOf(post.secs), under: score <= line };
}

export function inQuarter(p) {
  return p.submitted >= QUARTER.start && p.submitted <= QUARTER.end;
}

export function creatorStats(state, creatorId) {
  const posts = state.posts.filter((p) => p.creatorId === creatorId).map((p) => enrich(p, state.benchmarks));
  const published = posts.filter((p) => p.type !== 'draft');
  const q = published.filter(inQuarter);
  const qualifiedQ = q.filter((p) => p.status === 'qualified');
  const scored = published.filter((p) => p.status === 'qualified' || p.status === 'not');
  const perf = scored.length ? Math.round((scored.reduce((s, p) => s + (1 - p.score / p.line), 0) / scored.length) * 100) : 0;
  return {
    posts,
    total: published.length,
    qualified: published.filter((p) => p.status === 'qualified').length,
    qualifiedQ: qualifiedQ.length,
    submittedQ: q.length,
    review: published.filter((p) => p.status === 'review').length,
    avgScore: scored.length ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length) : null,
    perf, // average % under the L line (negative = over)
    views: published.reduce((s, p) => s + p.views, 0),
  };
}

export function leaderboard(state) {
  return state.creators
    .map((c) => ({ ...c, ...creatorStats(state, c.id) }))
    .sort((a, b) => b.qualifiedQ - a.qualifiedQ || b.perf - a.perf)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}
