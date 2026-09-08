/**
 * Ambil gambar/GIF gerakan.
 *   1. cache localStorage (30 hari)
 *   2. wger API v2  — gratis, tanpa key
 *   3. ExerciseDB   — base URL & API key opsional, bisa diatur di Settings
 *   4. null         — komponen jatuh ke placeholder ikon + nama
 *
 * Tidak pernah melempar error: semua kegagalan (offline, CORS, 4xx, JSON aneh)
 * berakhir jadi `{ url: null, source: 'none' }`.
 */

const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 7000;
const WGER_BASE = 'https://wger.de';

const inflight = new Map();

async function fetchJSON(url, { headers } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers, mode: 'cors' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function absolutize(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return WGER_BASE + url;
  return null;
}

/* ------------------------------------------------------------------ wger */

async function fromWger(term) {
  const url = `${WGER_BASE}/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=2&format=json`;
  const json = await fetchJSON(url);
  const suggestions = Array.isArray(json?.suggestions) ? json.suggestions : [];
  for (const s of suggestions) {
    const img = absolutize(s?.data?.image);
    if (img) return { url: img, source: 'wger', label: s?.data?.name || term };
  }
  return null;
}

/* ------------------------------------------------------------- ExerciseDB */

const GIF_KEYS = ['gifUrl', 'gif_url', 'gif', 'imageUrl', 'image_url', 'image', 'thumbnail'];

/** Cari string URL gambar pertama di dalam struktur JSON apa pun (max depth 6). */
function digForMedia(node, depth = 0) {
  if (!node || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = digForMedia(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof node !== 'object') return null;
  for (const key of GIF_KEYS) {
    const val = node[key];
    if (typeof val === 'string' && /^(https?:)?\/\//.test(val)) {
      return { url: absolutize(val), label: typeof node.name === 'string' ? node.name : null };
    }
  }
  for (const val of Object.values(node)) {
    if (val && typeof val === 'object') {
      const hit = digForMedia(val, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

async function fromExerciseDB(term, settings) {
  const base = (settings?.exercisedbBase || '').replace(/\/+$/, '');
  if (!base) return null;
  const headers = {};
  if (settings?.exercisedbKey) {
    headers['X-RapidAPI-Key'] = settings.exercisedbKey;
    headers['X-RapidAPI-Host'] = base.replace(/^https?:\/\//, '').split('/')[0];
  }
  const candidates = [
    `${base}/exercises/search?q=${encodeURIComponent(term)}&limit=5`,
    `${base}/exercises/name/${encodeURIComponent(term)}?limit=5`,
    `${base}/exercises?search=${encodeURIComponent(term)}&limit=5`,
  ];
  for (const url of candidates) {
    const json = await fetchJSON(url, { headers });
    const hit = json && digForMedia(json);
    if (hit?.url) return { url: hit.url, source: 'exercisedb', label: hit.label || term };
  }
  return null;
}

/* ------------------------------------------------------------------ publik */

export function readCache(media, term) {
  const hit = media?.[term];
  if (!hit) return null;
  if (Date.now() - (hit.ts || 0) > TTL_MS) return null;
  return hit;
}

/**
 * @param {string} term istilah pencarian (bahasa Inggris)
 * @param {object} opts { media, settings, onCache }
 * @returns {Promise<{url: string|null, source: string, label?: string}>}
 */
export async function fetchExerciseMedia(term, { media, settings, onCache } = {}) {
  if (!term) return { url: null, source: 'none' };
  const cached = readCache(media, term);
  if (cached) return cached;
  if (inflight.has(term)) return inflight.get(term);

  const job = (async () => {
    let result = null;
    try {
      result = (await fromWger(term)) || (await fromExerciseDB(term, settings));
    } catch (err) {
      console.warn('[media] lookup gagal', term, err);
      result = null;
    }
    const payload = result
      ? { ...result, ts: Date.now() }
      : { url: null, source: 'none', ts: Date.now() };
    try {
      onCache?.(term, payload);
    } catch {
      /* cache gagal disimpan — tidak fatal */
    }
    return payload;
  })();

  inflight.set(term, job);
  try {
    return await job;
  } finally {
    inflight.delete(term);
  }
}
