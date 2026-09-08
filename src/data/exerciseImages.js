/**
 * Gambar gerakan yang ikut di-bundle (src/assets/exercises/<slug>/0.webp & 1.webp).
 * Sumber: free-exercise-db (yuhonas/free-exercise-db), lisensi Unlicense / public domain.
 * Dua frame per gerakan = posisi awal & akhir, dianimasikan bergantian biar kelihatan
 * seperti GIF tanpa perlu file GIF.
 *
 * Slug folder = istilah `search` di data/schedule.js dengan spasi jadi tanda hubung.
 */
const modules = import.meta.glob('../assets/exercises/*/*.webp', { eager: true, import: 'default' });

export const LOCAL_FRAMES = {};

for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/exercises\/([^/]+)\/(\d+)\.webp$/);
  if (!match) continue;
  const term = match[1].replace(/-/g, ' ');
  if (!LOCAL_FRAMES[term]) LOCAL_FRAMES[term] = [];
  LOCAL_FRAMES[term][Number(match[2])] = url;
}

/** @returns {string[]|null} daftar frame untuk sebuah istilah pencarian */
export function localFrames(term) {
  const frames = term ? LOCAL_FRAMES[term] : null;
  return frames && frames.length ? frames.filter(Boolean) : null;
}

export const LOCAL_COUNT = Object.keys(LOCAL_FRAMES).length;
