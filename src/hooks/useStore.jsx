import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadState, saveState, newId, normalize } from '../lib/storage.js';
import { getDay, resolveExercises } from '../data/schedule.js';
import { todayKey } from '../lib/date.js';

const StoreCtx = createContext(null);

function blankEntries(day, opts) {
  const entries = {};
  for (const ex of resolveExercises(day, { ...opts, includeCore: true })) {
    entries[ex.id] = {
      sets: Array.from({ length: ex.sets }, () => ({ reps: '', weight: '', done: false })),
    };
  }
  return entries;
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => loadState());
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  // sinkron antar tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'wt.v1' && e.newValue) {
        try {
          setState(normalize(JSON.parse(e.newValue)));
        } catch {
          /* abaikan payload rusak dari tab lain */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo(() => {
    const updateActive = (fn) =>
      setState((s) => (s.active ? { ...s, active: { ...s.active, ...fn(s.active) } } : s));

    return {
      /* ---------------------------------------------------------- sesi */
      startSession(dayId, opts = {}) {
        const day = getDay(dayId);
        if (!day) return;
        setState((s) => {
          const mode = opts.mode || s.prefs.modeByDay[dayId] || 'home';
          const config = { mode, skipLegSprinkle: !!opts.skipLegSprinkle };
          const session = {
            id: newId(),
            date: todayKey(),
            dayId,
            mode,
            special: !!day.special,
            startedAt: Date.now(),
            endedAt: null,
            durationSec: 0,
            running: true,
            lastResumeAt: Date.now(),
            completed: false,
            includeCore: !!opts.includeCore,
            skipLegSprinkle: !!opts.skipLegSprinkle,
            padelRecent: !!opts.padelRecent,
            notes: '',
            meta: {},
            entries: day.special ? {} : blankEntries(day, config),
          };
          return { ...s, active: session };
        });
      },

      updateActive,

      /** Sinkronkan daftar set kalau mode / leg-sprinkle / core berubah di tengah sesi. */
      reshapeActive(opts) {
        setState((s) => {
          if (!s.active) return s;
          const day = getDay(s.active.dayId);
          if (!day || day.special) return s;
          const next = { ...s.active, ...opts };
          const wanted = resolveExercises(day, {
            mode: next.mode,
            skipLegSprinkle: next.skipLegSprinkle,
            includeCore: true,
          });
          const entries = { ...next.entries };
          for (const ex of wanted) {
            const cur = entries[ex.id]?.sets || [];
            const sets = Array.from({ length: ex.sets }, (_, i) => cur[i] || { reps: '', weight: '', done: false });
            entries[ex.id] = { sets };
          }
          return { ...s, active: { ...next, entries } };
        });
      },

      setSetField(exId, index, field, value) {
        updateActive((a) => {
          const sets = [...(a.entries[exId]?.sets || [])];
          while (sets.length <= index) sets.push({ reps: '', weight: '', done: false });
          sets[index] = { ...sets[index], [field]: value };
          return { entries: { ...a.entries, [exId]: { ...a.entries[exId], sets } } };
        });
      },

      toggleSet(exId, index, done) {
        updateActive((a) => {
          const sets = [...(a.entries[exId]?.sets || [])];
          while (sets.length <= index) sets.push({ reps: '', weight: '', done: false });
          sets[index] = { ...sets[index], done };
          return { entries: { ...a.entries, [exId]: { ...a.entries[exId], sets } } };
        });
      },

      toggleExercise(exId, count, done) {
        updateActive((a) => {
          const cur = a.entries[exId]?.sets || [];
          const sets = Array.from({ length: Math.max(count, cur.length) }, (_, i) => ({
            ...(cur[i] || { reps: '', weight: '', done: false }),
            done,
          }));
          return { entries: { ...a.entries, [exId]: { ...a.entries[exId], sets } } };
        });
      },

      addSet(exId) {
        updateActive((a) => {
          const sets = [...(a.entries[exId]?.sets || []), { reps: '', weight: '', done: false }];
          return { entries: { ...a.entries, [exId]: { ...a.entries[exId], sets } } };
        });
      },

      removeSet(exId, index) {
        updateActive((a) => {
          const sets = (a.entries[exId]?.sets || []).filter((_, i) => i !== index);
          return { entries: { ...a.entries, [exId]: { ...a.entries[exId], sets } } };
        });
      },

      pauseTimer() {
        updateActive((a) =>
          a.running
            ? {
                running: false,
                durationSec: (a.durationSec || 0) + Math.round((Date.now() - (a.lastResumeAt || Date.now())) / 1000),
                lastResumeAt: null,
              }
            : {}
        );
      },

      resumeTimer() {
        updateActive((a) => (a.running ? {} : { running: true, lastResumeAt: Date.now() }));
      },

      finishSession() {
        setState((s) => {
          if (!s.active) return s;
          const a = s.active;
          const durationSec =
            (a.durationSec || 0) + (a.running ? Math.round((Date.now() - (a.lastResumeAt || Date.now())) / 1000) : 0);
          const done = {
            ...a,
            durationSec,
            running: false,
            lastResumeAt: null,
            endedAt: Date.now(),
            completed: true,
          };
          return {
            ...s,
            active: null,
            sessions: [done, ...s.sessions.filter((x) => x.id !== done.id)],
            prefs: { ...s.prefs, manualDayId: null },
          };
        });
      },

      discardSession() {
        setState((s) => ({ ...s, active: null }));
      },

      deleteSession(id) {
        setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
      },

      /** Catat cepat hari non-siklus (padel / swim) tanpa buka sesi. */
      logSpecialDay(dayId, meta = {}, date = todayKey()) {
        setState((s) => {
          const session = {
            id: newId(),
            date,
            dayId,
            mode: 'home',
            special: true,
            startedAt: Date.now(),
            endedAt: Date.now(),
            durationSec: (Number(meta.durationMin) || 0) * 60,
            completed: true,
            includeCore: false,
            skipLegSprinkle: false,
            padelRecent: dayId === 'padel',
            notes: '',
            meta,
            entries: {},
          };
          return {
            ...s,
            sessions: [session, ...s.sessions],
            active: s.active?.dayId === dayId ? null : s.active,
            prefs: { ...s.prefs, manualDayId: null },
          };
        });
      },

      /* -------------------------------------------------------- preferensi */
      setDayMode(dayId, mode) {
        setState((s) => ({
          ...s,
          prefs: { ...s.prefs, modeByDay: { ...s.prefs.modeByDay, [dayId]: mode } },
          active: s.active?.dayId === dayId ? { ...s.active, mode } : s.active,
        }));
      },

      setManualDay(dayId) {
        setState((s) => ({ ...s, prefs: { ...s.prefs, manualDayId: dayId } }));
      },

      updateProfile(p) {
        setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
      },

      updateSettings(p) {
        setState((s) => ({ ...s, settings: { ...s.settings, ...p } }));
      },

      /* ------------------------------------------------------- berat badan */
      addWeight(date, kg) {
        const value = Number(kg);
        if (!Number.isFinite(value) || value <= 0) return;
        setState((s) => {
          const rest = s.weights.filter((w) => w.date !== date);
          return { ...s, weights: [...rest, { date, kg: value }].sort((a, b) => (a.date < b.date ? -1 : 1)) };
        });
      },

      removeWeight(date) {
        setState((s) => ({ ...s, weights: s.weights.filter((w) => w.date !== date) }));
      },

      /* ------------------------------------------------------------- misc */
      cacheMedia(term, payload) {
        setState((s) => ({ ...s, media: { ...s.media, [term]: payload } }));
      },

      replaceState(next) {
        setState(normalize(next));
      },

      resetAll() {
        setState(normalize(null));
      },
    };
  }, []);

  const value = useMemo(() => ({ state, actions, patch }), [state, actions, patch]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore harus dipakai di dalam <StoreProvider>');
  return ctx;
}

/** Detik berjalan dari sesi aktif (tick tiap detik saat running). */
export function useElapsed(active) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active?.running) return undefined;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active?.running]);
  if (!active) return 0;
  const base = active.durationSec || 0;
  if (!active.running) return base;
  return base + Math.round((Date.now() - (active.lastResumeAt || Date.now())) / 1000);
}
