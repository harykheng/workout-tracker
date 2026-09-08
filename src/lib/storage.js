/**
 * Skema localStorage (key: "wt.v1").
 *
 * {
 *   version: 1,
 *   profile:  { name, heightCm, startWeightKg, targetMinKg, targetMaxKg, targetDate },
 *   settings: { defaultRestSec, restSound, restVibrate, autoStartRest, exercisedbBase, exercisedbKey },
 *   prefs:    { modeByDay: { d1: 'home'|'gym' }, manualDayId: string|null },
 *   active:   Session | null,          // sesi yang lagi jalan (tahan refresh)
 *   sessions: Session[],               // riwayat, terbaru di depan
 *   weights:  [{ date, kg }],          // berat badan, urut menaik
 *   dailyBurn:[{ date, kcal, source }], // total kalori terbakar sehari (mis. dari Garmin)
 *   media:    { [searchTerm]: { url, source, ts } }  // cache hasil API gambar/GIF
 * }
 *
 * Session {
 *   id, date, dayId, mode, special, startedAt, endedAt, durationSec, completed,
 *   includeCore, skipLegSprinkle, padelRecent, notes,
 *   kcal: number|null,               // override manual; kosong = dihitung dari MET
 *   entries: { [exerciseId]: { sets: [{ reps, weight, done }] } },
 *   meta: { durationMin, intensity }   // khusus padel / swim
 * }
 */

export const STORAGE_KEY = 'wt.v1';
export const SCHEMA_VERSION = 1;

export const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  profile: {
    name: 'Hary',
    heightCm: 189,
    startWeightKg: 101,
    targetMinKg: 90,
    targetMaxKg: 95,
    targetDate: '2026-10-24',
    age: null,
    sex: 'male',
    activityFactor: 1.35,
  },
  settings: {
    defaultRestSec: 60,
    restSound: true,
    restVibrate: true,
    autoStartRest: true,
    exercisedbBase: 'https://exercisedb-api.vercel.app/api/v1',
    exercisedbKey: '',
  },
  prefs: {
    modeByDay: {},
    manualDayId: null,
  },
  active: null,
  sessions: [],
  weights: [],
  dailyBurn: [],
  media: {},
};

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/** Merge defensif: field yang hilang / rusak diisi default, field asing dibuang. */
export function normalize(raw) {
  const src = isObj(raw) ? raw : {};
  const state = {
    version: SCHEMA_VERSION,
    profile: { ...DEFAULT_STATE.profile, ...(isObj(src.profile) ? src.profile : {}) },
    settings: { ...DEFAULT_STATE.settings, ...(isObj(src.settings) ? src.settings : {}) },
    prefs: {
      ...DEFAULT_STATE.prefs,
      ...(isObj(src.prefs) ? src.prefs : {}),
      modeByDay: isObj(src.prefs?.modeByDay) ? src.prefs.modeByDay : {},
    },
    active: isObj(src.active) ? src.active : null,
    sessions: Array.isArray(src.sessions) ? src.sessions.filter(isObj) : [],
    weights: Array.isArray(src.weights)
      ? src.weights
          .filter((w) => isObj(w) && w.date && Number.isFinite(Number(w.kg)))
          .map((w) => ({ date: String(w.date), kg: Number(w.kg) }))
          .sort((a, b) => (a.date < b.date ? -1 : 1))
      : [],
    dailyBurn: Array.isArray(src.dailyBurn)
      ? src.dailyBurn
          .filter((d) => isObj(d) && d.date && Number(d.kcal) > 0)
          .map((d) => ({ date: String(d.date), kcal: Math.round(Number(d.kcal)), source: d.source || 'manual' }))
          .sort((a, b) => (a.date < b.date ? -1 : 1))
      : [],
    media: isObj(src.media) ? src.media : {},
  };
  // umur opsional: null kalau kosong / tidak masuk akal
  const age = Number(state.profile.age);
  state.profile.age = Number.isFinite(age) && age > 0 && age < 120 ? Math.round(age) : null;
  if (state.profile.sex !== 'female') state.profile.sex = 'male';
  const factor = Number(state.profile.activityFactor);
  state.profile.activityFactor = Number.isFinite(factor) && factor >= 1 && factor <= 2 ? factor : 1.35;

  // angka profil harus numerik
  for (const k of ['heightCm', 'startWeightKg', 'targetMinKg', 'targetMaxKg']) {
    const n = Number(state.profile[k]);
    state.profile[k] = Number.isFinite(n) ? n : DEFAULT_STATE.profile[k];
  }
  const rest = Number(state.settings.defaultRestSec);
  state.settings.defaultRestSec = Number.isFinite(rest) && rest > 0 ? Math.round(rest) : 60;
  // riwayat: terbaru duluan, buang yang tanpa tanggal
  state.sessions = state.sessions
    .filter((s) => s.date && s.dayId)
    .sort((a, b) => (a.date === b.date ? (b.startedAt || 0) - (a.startedAt || 0) : a.date < b.date ? 1 : -1));
  return state;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw));
  } catch (err) {
    console.warn('[storage] gagal baca localStorage, pakai state default', err);
    return normalize(null);
  }
}

let saveTimer = null;
export function saveState(state) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[storage] gagal simpan localStorage', err);
    }
  }, 120);
}

export function exportJSON(state) {
  const payload = { ...state, exportedAt: new Date().toISOString() };
  delete payload.media; // cache gambar gak perlu ikut backup
  return JSON.stringify(payload, null, 2);
}

export function downloadBackup(state) {
  const blob = new Blob([exportJSON(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** @returns {{ ok: true, state: object } | { ok: false, error: string }} */
export function parseImport(text) {
  try {
    const raw = JSON.parse(text);
    if (!isObj(raw)) return { ok: false, error: 'File bukan objek JSON yang valid.' };
    if (!('sessions' in raw) && !('weights' in raw) && !('profile' in raw)) {
      return { ok: false, error: 'JSON ini kelihatannya bukan backup Workout Tracker.' };
    }
    return { ok: true, state: normalize(raw) };
  } catch {
    return { ok: false, error: 'File gagal di-parse — pastikan itu file .json backup.' };
  }
}

export function newId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
