/**
 * Sumber kebenaran jadwal latihan.
 * Siklus 4 hari — hari rest / padel TIDAK menggeser posisi siklus.
 *
 * Struktur exercise:
 *  id      : stabil, dipakai sebagai key di localStorage (JANGAN diubah setelah rilis)
 *  name    : nama versi rumah (dumbbell)
 *  sets    : jumlah set target
 *  reps    : string target rep ("12-15", "45s", dst)
 *  unit    : label tambahan ("/lengan", "/kaki") — opsional
 *  note    : catatan teknik (tampil di card)
 *  rest    : detik istirahat default antar set
 *  search  : istilah pencarian untuk API GIF/gambar (bahasa Inggris)
 *  gym     : versi alternatif gym { name, sets, reps, note?, rest?, search }
 */

export const REST_HOME = 60;
export const REST_HOME_SHORT = 45;
export const REST_GYM = 90;

export const OVERLOAD_PRINCIPLES = [
  {
    icon: 'tempo',
    title: 'Tempo lambat',
    text: 'Turunin beban 3-4 detik tiap rep. Waktu di bawah tension yang bikin otot kepaksa, bukan angkanya.',
  },
  {
    icon: 'pause',
    title: 'Pause 1 detik',
    text: 'Tahan 1 detik di titik kontraksi puncak sebelum balik turun.',
  },
  {
    icon: 'unilateral',
    title: 'Unilateral',
    text: 'Satu tangan / satu kaki — ROM lebih dalam, beban efektif per sisi jadi dobel.',
  },
  {
    icon: 'reps',
    title: 'Rep tinggi + rest pendek',
    text: '15-25 rep dengan istirahat 45-60 detik. Metabolic stress gantiin beban berat.',
  },
  {
    icon: 'drop',
    title: 'Drop ke satu tangan',
    text: 'Kalau kanan-kiri udah gagal bareng, lanjut satu tangan sampai bener-bener habis.',
  },
];

export const GYM_PRINCIPLE = {
  title: 'Versi gym: reps lebih rendah',
  text: 'Beban udah cukup berat buat jadi overload — main di 8-15 rep, istirahat 90 detik, fokus nambah beban tiap minggu.',
};

export const CORE_FINISHER = {
  id: 'core',
  label: 'Core finisher',
  note: 'Opsional — tidak masuk hitungan target sesi.',
  exercises: [
    { id: 'core-plank', name: 'Plank', sets: 3, reps: '45s', rest: 45, search: 'plank' },
    { id: 'core-twist', name: 'Russian Twist', sets: 3, reps: '20', rest: 45, search: 'russian twist' },
  ],
};

export const CYCLE_DAYS = [
  {
    id: 'd1',
    num: 1,
    title: 'Shoulder Fokus',
    tag: 'Shoulder',
    hasGym: true,
    footer: 'Steam room 10-15 menit setelah workout.',
    exercises: [
      {
        id: 'd1-ohp',
        name: 'DB Overhead Press (duduk/berdiri)',
        sets: 4,
        reps: '12-15',
        note: 'Eksentrik 3 detik.',
        rest: REST_HOME,
        search: 'dumbbell shoulder press',
        gym: {
          name: 'Barbell Overhead Press / Smith Machine',
          sets: 4,
          reps: '8-12',
          rest: REST_GYM,
          search: 'barbell shoulder press',
        },
      },
      {
        id: 'd1-lat-raise',
        name: 'DB Lateral Raise',
        sets: 4,
        reps: '15-20',
        note: 'Pause 1 detik di atas.',
        rest: REST_HOME,
        search: 'dumbbell lateral raise',
        gym: { name: 'Cable Lateral Raise', sets: 4, reps: '12-15', rest: REST_GYM, search: 'cable lateral raise' },
      },
      {
        id: 'd1-front-raise',
        name: 'DB Front Raise',
        sets: 3,
        reps: '15',
        rest: REST_HOME,
        search: 'dumbbell front raise',
        gym: {
          name: 'Cable Front Raise (single handle)',
          sets: 3,
          reps: '12-15',
          rest: REST_GYM,
          search: 'cable front raise',
        },
      },
      {
        id: 'd1-rear-delt-row',
        name: 'Standing Rear Delt Row (high pull)',
        sets: 4,
        reps: '12-15',
        note: 'Gak perlu nunduk — badan tetap tegak lurus.',
        rest: REST_HOME,
        search: 'dumbbell upright row',
        gym: { name: 'Cable Face Pull (rope)', sets: 4, reps: '12-15', rest: REST_GYM, search: 'face pull' },
      },
      {
        id: 'd1-arnold',
        name: 'DB Arnold Press',
        sets: 3,
        reps: '12',
        rest: REST_HOME,
        search: 'arnold press',
        gym: {
          name: 'Machine Shoulder Press (atau tetap DB Arnold)',
          sets: 3,
          reps: '10-12',
          rest: REST_GYM,
          search: 'machine shoulder press',
        },
      },
      {
        id: 'd1-shrug',
        name: 'DB Shrug (trap)',
        sets: 3,
        reps: '15',
        rest: REST_HOME,
        search: 'dumbbell shrug',
        gym: { name: 'Barbell Shrug', sets: 3, reps: '12-15', rest: REST_GYM, search: 'barbell shrug' },
      },
    ],
  },
  {
    id: 'd2',
    num: 2,
    title: 'Wings / Back Lebar',
    tag: 'Lats',
    hasGym: false,
    footer: 'Steam room 10-15 menit setelah workout.',
    exercises: [
      {
        id: 'd2-row',
        name: 'DB Single-Arm Row',
        sets: 5,
        reps: '15-20',
        unit: '/lengan',
        note: 'Squeeze penuh, tarik siku ke belakang.',
        rest: REST_HOME,
        search: 'dumbbell row',
      },
      {
        id: 'd2-pullover',
        name: 'DB Pullover',
        sets: 4,
        reps: '15',
        note: 'ROM lebar — paling kerasa buat lats meski beban ringan.',
        rest: REST_HOME,
        search: 'dumbbell pullover',
      },
      {
        id: 'd2-rear-delt-row',
        name: 'Standing Rear Delt Row (high pull)',
        sets: 4,
        reps: '12-15',
        note: 'Badan tetap tegak lurus.',
        rest: REST_HOME,
        search: 'dumbbell upright row',
      },
      {
        id: 'd2-rdl',
        name: 'DB Romanian Deadlift',
        sets: 3,
        reps: '12',
        note: 'Posterior chain + sedikit leg.',
        rest: REST_HOME,
        search: 'dumbbell romanian deadlift',
      },
    ],
  },
  {
    id: 'd3',
    num: 3,
    title: 'Chest + Bicep',
    tag: 'Push',
    hasGym: false,
    exercises: [
      { id: 'd3-press', name: 'DB Flat / Floor Press', sets: 4, reps: '15-20', rest: REST_HOME, search: 'dumbbell bench press' },
      {
        id: 'd3-incline',
        name: 'DB Incline Press',
        sets: 3,
        reps: '15',
        note: 'Pakai bangku miring atau ganjal bantal.',
        rest: REST_HOME,
        search: 'incline dumbbell press',
      },
      { id: 'd3-fly', name: 'DB Fly', sets: 3, reps: '15-20', rest: REST_HOME, search: 'dumbbell fly' },
      { id: 'd3-curl', name: 'DB Bicep Curl', sets: 4, reps: '15-20', rest: REST_HOME, search: 'dumbbell biceps curl' },
      { id: 'd3-hammer', name: 'DB Hammer Curl', sets: 3, reps: '15', rest: REST_HOME, search: 'hammer curl' },
      {
        id: 'd3-conc',
        name: 'DB Concentration Curl',
        sets: 3,
        reps: '12',
        unit: '/lengan',
        rest: REST_HOME,
        search: 'concentration curl',
      },
    ],
  },
  {
    id: 'd4',
    num: 4,
    title: 'Shoulder + Back Round 2',
    tag: 'Mixed + leg',
    hasGym: false,
    footer: 'Steam room 10-15 menit setelah workout.',
    padelWarning:
      'Baru padel berat 1-2 hari terakhir? Skip leg sprinkle (Goblet Squat & Reverse Lunge) — kaki udah dapet jatahnya.',
    exercises: [
      { id: 'd4-push-press', name: 'DB Push Press', sets: 3, reps: '12', rest: REST_HOME, search: 'dumbbell push press' },
      {
        id: 'd4-lat-drop',
        name: 'DB Lateral Raise dropset',
        sets: 3,
        reps: '20 dua tangan + 10 satu tangan',
        note: 'Langsung lanjut satu tangan tanpa istirahat.',
        rest: REST_HOME,
        search: 'dumbbell lateral raise',
      },
      { id: 'd4-row', name: 'DB Single-Arm Row', sets: 3, reps: '15', unit: '/lengan', rest: REST_HOME, search: 'dumbbell row' },
      {
        id: 'd4-goblet',
        name: 'DB Goblet Squat',
        sets: 3,
        reps: '15',
        note: 'Leg sempilan.',
        legSprinkle: true,
        rest: REST_HOME,
        search: 'goblet squat',
      },
      {
        id: 'd4-lunge',
        name: 'DB Reverse Lunge',
        sets: 3,
        reps: '12',
        unit: '/kaki',
        note: 'Leg sempilan.',
        legSprinkle: true,
        rest: REST_HOME,
        search: 'dumbbell reverse lunge',
      },
    ],
  },
];

/** Hari di luar siklus — tidak menggeser urutan, tapi tetap dihitung sebagai hari aktif. */
export const SPECIAL_DAYS = [
  {
    id: 'padel',
    title: 'Padel',
    tag: 'Leg + Cardio',
    special: true,
    blurb: 'Auto-log sebagai leg + cardio. Gak perlu leg day terpisah.',
    short: 'Leg + cardio',
    detail: '1-2x seminggu. Setelah ini, tandai "baru padel" biar leg sprinkle di Hari 4 otomatis dikasih peringatan.',
    fields: [
      { key: 'durationMin', label: 'Durasi main', unit: 'menit', placeholder: '90' },
      { key: 'intensity', label: 'Intensitas', type: 'select', options: ['Santai', 'Sedang', 'Berat'] },
    ],
  },
  {
    id: 'swim',
    title: 'Rest / Swim Day',
    tag: 'Recovery',
    special: true,
    blurb: 'Renang 20-30 menit, pace santai-sedang.',
    short: 'Renang 20-30 menit',
    detail: 'Taruh setelah hari terberat — biasanya sehabis Hari 2 atau Hari 4.',
    fields: [
      { key: 'durationMin', label: 'Durasi renang', unit: 'menit', placeholder: '25' },
      { key: 'intensity', label: 'Pace', type: 'select', options: ['Santai', 'Sedang'] },
    ],
  },
  {
    id: 'custom',
    title: 'Aktivitas lain',
    tag: 'Custom',
    special: true,
    custom: true,
    blurb: 'Lari, hiking, badminton — tulis sendiri namanya.',
    short: 'Nama isi sendiri',
    detail:
      'Isi nama aktivitas, durasi, dan intensitas. Masuk ke streak & kalender sebagai hari aktif, dan tidak menggeser urutan siklus 4 hari.',
    fields: [
      { key: 'name', label: 'Nama aktivitas', type: 'text', placeholder: 'Lari sore, hiking, badminton…', required: true },
      { key: 'durationMin', label: 'Durasi', unit: 'menit', placeholder: '45' },
      { key: 'intensity', label: 'Intensitas', type: 'select', options: ['Santai', 'Sedang', 'Berat'] },
    ],
  },
];

export const ALL_DAYS = [...CYCLE_DAYS, ...SPECIAL_DAYS];

/** Judul yang ditampilkan untuk sebuah sesi — hari custom pakai nama isian user. */
export function sessionTitle(session) {
  const day = getDay(session?.dayId);
  if (!day) return session?.dayId || 'Sesi';
  if (day.custom) return session?.meta?.name?.trim() || day.title;
  return day.special ? day.title : `Hari ${day.num} — ${day.title}`;
}

export function getDay(id) {
  return ALL_DAYS.find((d) => d.id === id) || null;
}

export function isCycleDay(id) {
  return CYCLE_DAYS.some((d) => d.id === id);
}

/** Daftar exercise final untuk sebuah hari, sudah memperhitungkan mode gym & core finisher. */
export function resolveExercises(day, { mode = 'home', includeCore = false, skipLegSprinkle = false } = {}) {
  if (!day || day.special) return [];
  let list = day.exercises;
  if (skipLegSprinkle) list = list.filter((ex) => !ex.legSprinkle);
  const resolved = list.map((ex) => {
    if (mode === 'gym' && ex.gym) {
      return {
        ...ex,
        name: ex.gym.name,
        sets: ex.gym.sets,
        reps: ex.gym.reps,
        note: ex.gym.note ?? ex.note,
        rest: ex.gym.rest ?? REST_GYM,
        search: ex.gym.search ?? ex.search,
        isGymAlt: true,
      };
    }
    return { ...ex, isGymAlt: false };
  });
  return includeCore ? [...resolved, ...CORE_FINISHER.exercises.map((e) => ({ ...e, optional: true }))] : resolved;
}

/** Total set wajib (core finisher tidak dihitung). */
export function requiredSetCount(day, opts) {
  return resolveExercises(day, { ...opts, includeCore: false }).reduce((n, ex) => n + ex.sets, 0);
}
