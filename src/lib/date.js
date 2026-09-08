/** Semua tanggal disimpan sebagai 'YYYY-MM-DD' waktu lokal (bukan UTC). */

export function toKey(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayKey() {
  return toKey(new Date());
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function diffDays(a, b) {
  const ms = fromKey(a).setHours(12, 0, 0, 0) - fromKey(b).setHours(12, 0, 0, 0);
  return Math.round(ms / 86400000);
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function dayName(key) {
  return HARI[fromKey(key).getDay()];
}

export function monthName(monthIdx) {
  return BULAN[monthIdx];
}

export function formatLong(key) {
  const d = fromKey(key);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`;
}

export function formatShort(key) {
  const d = fromKey(key);
  return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)}`;
}

export function formatFull(key) {
  const d = fromKey(key);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function relativeLabel(key) {
  const delta = diffDays(key, todayKey());
  if (delta === 0) return 'Hari ini';
  if (delta === -1) return 'Kemarin';
  if (delta === 1) return 'Besok';
  if (delta < 0 && delta > -7) return `${-delta} hari lalu`;
  return formatShort(key);
}

/** Grid kalender bulanan (Senin sebagai kolom pertama). */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function fmtDuration(sec = 0) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function fmtDurationShort(sec = 0) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}j ${m % 60}m`;
}
