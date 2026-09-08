import { CYCLE_DAYS, getDay, isCycleDay, resolveExercises } from '../data/schedule.js';
import { todayKey, addDays, diffDays, toKey } from './date.js';

/* ---------------------------------------------------------------- siklus */

/** Hari siklus berikutnya berdasarkan sesi siklus terakhir yang selesai. */
export function nextCycleDayId(sessions = []) {
  const last = sessions.find((s) => s.completed && isCycleDay(s.dayId));
  if (!last) return CYCLE_DAYS[0].id;
  const idx = CYCLE_DAYS.findIndex((d) => d.id === last.dayId);
  if (idx < 0) return CYCLE_DAYS[0].id;
  return CYCLE_DAYS[(idx + 1) % CYCLE_DAYS.length].id;
}

/** Hari yang ditampilkan: pilihan manual > sesi aktif > auto-rotate dari siklus. */
export function resolveTodayDayId(state) {
  if (state.prefs?.manualDayId) return state.prefs.manualDayId;
  if (state.active?.date === todayKey()) return state.active.dayId;
  // sesi siklus yang sudah selesai hari ini otomatis menggeser tampilan ke hari berikutnya
  return nextCycleDayId(state.sessions);
}

export function cyclePosition(dayId) {
  const idx = CYCLE_DAYS.findIndex((d) => d.id === dayId);
  return idx < 0 ? null : { index: idx, position: idx + 1, total: CYCLE_DAYS.length };
}

/* --------------------------------------------------------------- aktivitas */

/** Map tanggal -> daftar sesi selesai (padel & swim ikut dihitung "aktif"). */
export function activityByDate(sessions = []) {
  const map = new Map();
  for (const s of sessions) {
    if (!s.completed) continue;
    if (!map.has(s.date)) map.set(s.date, []);
    map.get(s.date).push(s);
  }
  return map;
}

/** Streak berjalan: hari aktif berturut-turut. Hari ini yang masih kosong tidak memutus streak. */
export function computeStreak(sessions = []) {
  const map = activityByDate(sessions);
  if (map.size === 0) return { current: 0, best: 0, activeToday: false };

  const today = todayKey();
  const activeToday = map.has(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let current = 0;
  while (map.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const dates = [...map.keys()].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of dates) {
    run = prev && diffDays(d, prev) === 1 ? run + 1 : 1;
    prev = d;
    if (run > best) best = run;
  }
  return { current, best: Math.max(best, current), activeToday };
}

/** Berapa hari aktif dalam N hari terakhir. */
export function activeDaysIn(sessions, days = 7) {
  const map = activityByDate(sessions);
  let n = 0;
  for (let i = 0; i < days; i++) if (map.has(addDays(todayKey(), -i))) n += 1;
  return n;
}

/* ------------------------------------------------------------------ sesi */

export function sessionSetStats(session) {
  const entries = session?.entries || {};
  let done = 0;
  let total = 0;
  let volume = 0;
  for (const entry of Object.values(entries)) {
    for (const set of entry?.sets || []) {
      total += 1;
      if (set.done) {
        done += 1;
        const reps = Number(set.reps);
        const w = Number(set.weight);
        if (Number.isFinite(reps) && Number.isFinite(w)) volume += reps * w;
      }
    }
  }
  return { done, total, volume: Math.round(volume) };
}

/** Progres sesi berbasis set wajib (core finisher tidak dihitung). */
export function sessionProgress(session, day) {
  if (!session || !day) return { done: 0, total: 0, pct: 0 };
  if (day.special) return { done: session.completed ? 1 : 0, total: 1, pct: session.completed ? 100 : 0 };
  const required = resolveExercises(day, {
    mode: session.mode,
    skipLegSprinkle: session.skipLegSprinkle,
    includeCore: false,
  });
  let done = 0;
  let total = 0;
  for (const ex of required) {
    const sets = session.entries?.[ex.id]?.sets || [];
    total += ex.sets;
    done += sets.slice(0, ex.sets).filter((s) => s.done).length;
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function exerciseDone(session, ex) {
  const sets = session?.entries?.[ex.id]?.sets || [];
  return sets.length > 0 && sets.slice(0, ex.sets).every((s) => s.done) && sets.length >= ex.sets;
}

/* -------------------------------------------------------- log per gerakan */

/** Riwayat per gerakan: { [exerciseId]: { name, points: [{date, topWeight, topReps, volume, sets}] } } */
export function buildExerciseLog(sessions = []) {
  const log = {};
  const ordered = [...sessions].sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const s of ordered) {
    const day = getDay(s.dayId);
    if (!day || day.special) continue;
    const resolved = resolveExercises(day, { mode: s.mode, includeCore: true });
    for (const ex of resolved) {
      const sets = (s.entries?.[ex.id]?.sets || []).filter((set) => set.done);
      if (!sets.length) continue;
      let topWeight = 0;
      let topReps = 0;
      let volume = 0;
      for (const set of sets) {
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        if (w > topWeight || (w === topWeight && r > topReps)) {
          topWeight = w;
          topReps = r;
        }
        volume += w * r;
      }
      if (!log[ex.id]) log[ex.id] = { id: ex.id, name: ex.name, dayId: day.id, points: [] };
      log[ex.id].name = ex.name;
      log[ex.id].points.push({
        date: s.date,
        mode: s.mode,
        topWeight,
        topReps,
        volume: Math.round(volume),
        sets: sets.length,
      });
    }
  }
  return log;
}

/** Set terakhir yang tercatat untuk sebuah gerakan — dipakai buat prefill. */
export function lastLoggedSets(sessions, exerciseId) {
  for (const s of sessions) {
    const sets = (s.entries?.[exerciseId]?.sets || []).filter((set) => set.done && (set.weight || set.reps));
    if (sets.length) return { date: s.date, sets };
  }
  return null;
}

/* ------------------------------------------------------------ berat badan */

export function weightStats(state) {
  const { weights, profile } = state;
  const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  // baseline = berat awal di profil (bisa diedit), bukan entri pertama —
  // biar "turun berapa kg" tetap kehitung dari titik start yang sebenarnya
  const start = Number(profile.startWeightKg) || (sorted.length ? sorted[0].kg : 0);
  const current = sorted.length ? sorted[sorted.length - 1].kg : profile.startWeightKg;
  const goal = profile.targetMaxKg; // target "aman" tercapai di 95kg
  const totalToLose = Math.max(0.1, start - goal);
  const lost = start - current;
  const pct = Math.max(0, Math.min(100, Math.round((lost / totalToLose) * 100)));
  const daysLeft = diffDays(profile.targetDate, todayKey());
  const remaining = current - goal;
  const perWeekNeeded = daysLeft > 0 ? (remaining / daysLeft) * 7 : remaining;

  // laju aktual dari 3 pekan terakhir
  const recent = sorted.filter((w) => diffDays(todayKey(), w.date) <= 21);
  let perWeekActual = null;
  if (recent.length >= 2) {
    const first = recent[0];
    const last = recent[recent.length - 1];
    const days = Math.max(1, diffDays(last.date, first.date));
    perWeekActual = ((first.kg - last.kg) / days) * 7;
  }
  return {
    sorted,
    start,
    current,
    goal,
    goalMin: profile.targetMinKg,
    lost: Number(lost.toFixed(1)),
    pct,
    daysLeft,
    remaining: Number(remaining.toFixed(1)),
    perWeekNeeded: Number(perWeekNeeded.toFixed(2)),
    perWeekActual: perWeekActual === null ? null : Number(perWeekActual.toFixed(2)),
    onTrack: perWeekActual !== null && perWeekActual >= perWeekNeeded - 0.05,
  };
}

/** Ringkasan minggu berjalan buat stat card di Home. */
export function weekSummary(sessions) {
  const start = addDays(todayKey(), -6);
  const inRange = sessions.filter((s) => s.completed && s.date >= start);
  const totalSec = inRange.reduce((n, s) => n + (s.durationSec || 0), 0);
  const stats = inRange.reduce(
    (acc, s) => {
      const { done, volume } = sessionSetStats(s);
      acc.sets += done;
      acc.volume += volume;
      return acc;
    },
    { sets: 0, volume: 0 }
  );
  return { sessions: inRange.length, totalSec, ...stats, activeDays: activeDaysIn(sessions, 7) };
}

export { toKey };
