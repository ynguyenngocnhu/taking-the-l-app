import React, { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';
import { initialState, TODAY, QUARTER, DEMO_CREATOR, verificationId, ORGANIC } from '../data/mock.js';
import { lScore, lineFor, formatOf } from './score.js';

const KEY = 'lplatform.demo.v2';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.version === 2 && Array.isArray(s.posts)) return s;
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
        const notes = a.note ? [...p.notes, { by: 'Verification team', date: TODAY, text: a.note }] : p.notes;
        if (a.decision === 'reject') return { ...p, status: 'rejected', verified: TODAY, notes };
        if (a.decision === 'info') return { ...p, status: 'info', notes };
        const line = lineFor(state.benchmarks, p.market, p.secs);
        return { ...p, status: lScore(p) <= line ? 'qualified' : 'not', verified: TODAY, vid: verificationId(p), notes };
      });
      return { ...state, posts };
    }
    case 'resubmit':
      return { ...state, posts: state.posts.map((p) => (p.id === a.id ? { ...p, ...a.changes, status: 'review', notes: [...p.notes, { by: 'Creator', date: TODAY, text: a.text }] } : p)) };
    case 'note':
      return { ...state, posts: state.posts.map((p) => (p.id === a.id ? { ...p, notes: [...p.notes, { by: 'Verification team', date: TODAY, text: a.text }] } : p)) };
    case 'signIn':
      return { ...state, session: { creatorId: a.id } };
    case 'signOut':
      return { ...state, session: { creatorId: null } };
    case 'onboard':
      return { ...state, creators: [...state.creators, a.creator], session: { creatorId: a.creator.id } };
    case 'profile':
      return { ...state, creators: state.creators.map((c) => (c.id === a.creator.id ? a.creator : c)) };
    case 'interest':
      return { ...state, interest: [...state.interest, a.entry] };
    case 'join':
      return { ...state, creators: state.creators.map((c) => (c.id === state.session.creatorId && !c.campaigns.includes(a.id) ? { ...c, campaigns: [...c.campaigns, a.id] } : c)) };
    case 'saveCampaign': {
      const exists = state.campaigns.some((c) => c.id === a.campaign.id);
      return { ...state, campaigns: exists ? state.campaigns.map((c) => (c.id === a.campaign.id ? a.campaign : c)) : [a.campaign, ...state.campaigns] };
    }
    case 'benchmarks':
      return { ...state, benchmarks: a.benchmarks, method: { ...state.method, updated: TODAY } };
    case 'period':
      return { ...state, benchmarkPeriod: { ...state.benchmarkPeriod, ...a.period } };
    case 'reset':
      return { ...initialState(), session: state.session.creatorId && state.creators.some((c) => c.id === state.session.creatorId && CREATOR_IDS.has(c.id)) ? state.session : { creatorId: null } };
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

const CREATOR_IDS = new Set(initialState().creators.map((c) => c.id));

export function useMe() {
  const { state } = useStore();
  return state.creators.find((c) => c.id === state.session.creatorId) || null;
}

export const DEMO_ID = DEMO_CREATOR;

export function enrich(post, benchmarks) {
  const score = lScore(post);
  const line = lineFor(benchmarks, post.market, post.secs);
  return { ...post, score, line, format: formatOf(post.secs), under: score <= line };
}

export function campaignLabel(state, p) {
  if (!p.campaignId) return ORGANIC;
  return state.campaigns.find((c) => c.id === p.campaignId)?.name || ORGANIC;
}

export function inQuarter(p) {
  return p.submitted >= QUARTER.start && p.submitted <= QUARTER.end;
}

// Creator-level figures are counts only. L-Score always belongs to a post.
export function creatorStats(state, creatorId) {
  const posts = state.posts.filter((p) => p.creatorId === creatorId).map((p) => enrich(p, state.benchmarks));
  const q = posts.filter(inQuarter);
  const count = (list, st) => list.filter((p) => p.status === st).length;
  return {
    posts,
    total: posts.length,
    qualified: count(posts, 'qualified'),
    qualifiedQ: count(q, 'qualified'),
    verified: posts.filter((p) => p.status === 'qualified' || p.status === 'not').length,
    pending: posts.filter((p) => p.status === 'review' || p.status === 'info').length,
    rejected: count(posts, 'rejected'),
    notQualified: count(posts, 'not'),
    views: posts.reduce((s, p) => s + p.views, 0),
  };
}
