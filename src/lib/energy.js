/**
 * Estimasi kalori & hitungan defisit.
 *
 * Rumus kalori pakai MET (Compendium of Physical Activities):
 *   kcal = MET × 3.5 × beratBadanKg / 200 × menit
 *
 * Angka ini ESTIMASI, bukan pengukuran. Yang bikin berat turun tetap defisit
 * total (makan − keluar); pembakaran workout cuma salah satu komponennya.
 * Timbangan adalah umpan balik yang sebenarnya — kalau angka di app dan
 * timbangan beda arah, percaya timbangan.
 */

/** 1 kg lemak tubuh ≈ 7700 kcal. */
export const KCAL_PER_KG_FAT = 7700;

/** MET latihan beban per mode. Versi rumah rep tinggi + rest pendek = lebih tinggi. */
export const MET_STRENGTH = { home: 5, gym: 4.5 };

/** MET aktivitas non-siklus, per intensitas. */
export const MET_SPECIAL = {
  padel: { Santai: 5, Sedang: 6.5, Berat: 8, default: 6.5 },
  swim: { Santai: 6, Sedang: 8.3, default: 6 },
  custom: { Santai: 4, Sedang: 6, Berat: 8, default: 6 },
};

export function metFor(session) {
  if (!session) return 0;
  if (!session.special) return MET_STRENGTH[session.mode] ?? MET_STRENGTH.home;
  const table = MET_SPECIAL[session.dayId] || MET_SPECIAL.custom;
  return table[session.meta?.intensity] ?? table.default;
}

export function kcalFromMet(met, weightKg, minutes) {
  if (!met || !weightKg || !minutes) return 0;
  return Math.round((met * 3.5 * weightKg) / 200 * minutes);
}

/**
 * Kalori sebuah sesi. Pakai angka manual kalau user sudah mengisinya,
 * kalau tidak dihitung dari MET × durasi × berat badan saat itu.
 */
export function sessionKcal(session, weightKg) {
  if (!session) return 0;
  const manual = Number(session.kcal);
  if (Number.isFinite(manual) && manual > 0) return Math.round(manual);
  const minutes = (session.durationSec || 0) / 60;
  return kcalFromMet(metFor(session), weightKg, minutes);
}

/** Estimasi untuk sesi yang belum selesai / belum tercatat durasinya. */
export function estimateKcal({ special, dayId, mode, intensity, minutes, weightKg }) {
  const met = metFor({ special, dayId, mode, meta: { intensity } });
  return kcalFromMet(met, weightKg, minutes);
}

/** BMR Mifflin-St Jeor. Butuh umur — kalau kosong, kembalikan null. */
export function bmr({ weightKg, heightCm, age, sex }) {
  if (!weightKg || !heightCm || !age) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'female' ? base - 161 : base + 5);
}

/**
 * Ringkasan energi menuju target.
 * @returns {{
 *   perDayDeficit:number, totalDeficit:number, kgToLose:number, daysLeft:number,
 *   burnPerDay:number, fromFoodPerDay:number, bmr:number|null, tdeeBase:number|null,
 *   targetIntake:number|null, sample:{days:number, sessions:number, kcal:number}
 * }}
 */
/** Total kalori workout pada satu tanggal. */
export function dayWorkoutKcal(sessions, date, weightKg) {
  return sessions
    .filter((s) => s.completed && s.date === date)
    .reduce((n, s) => n + sessionKcal(s, weightKg), 0);
}

/** Deret kalori harian untuk N hari terakhir (buat grafik batang). */
export function dailySeries(sessions, dailyBurn, weightKg, days, addDaysFn, todayKeyFn) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysFn(todayKeyFn(), -i);
    const logged = dailyBurn.find((d) => d.date === date);
    out.push({
      date,
      workout: dayWorkoutKcal(sessions, date, weightKg),
      total: logged ? logged.kcal : null,
    });
  }
  return out;
}

export function energyPlan({
  sessions,
  profile,
  currentWeight,
  daysLeft,
  remainingKg,
  dailyBurn = [],
  windowDays = 14,
}) {
  const start = Date.now() - windowDays * 86400000;
  const recent = sessions.filter((s) => s.completed && new Date(`${s.date}T12:00:00`).getTime() >= start);
  const burned = recent.reduce((n, s) => n + sessionKcal(s, currentWeight), 0);
  const burnPerDay = Math.round(burned / windowDays);

  const kgToLose = Math.max(0, remainingKg);
  const totalDeficit = Math.round(kgToLose * KCAL_PER_KG_FAT);
  const days = Math.max(1, daysLeft);
  const perDayDeficit = Math.round(totalDeficit / days);

  // Total harian terukur (mis. dari Garmin) jauh lebih akurat daripada BMR × faktor.
  const recentDaily = dailyBurn.filter((d) => new Date(`${d.date}T12:00:00`).getTime() >= start);
  const measuredTdee = recentDaily.length
    ? Math.round(recentDaily.reduce((n, d) => n + d.kcal, 0) / recentDaily.length)
    : null;

  const restingBmr = bmr({
    weightKg: currentWeight,
    heightCm: profile.heightCm,
    age: profile.age,
    sex: profile.sex,
  });
  // TDEE "dasar": BMR × faktor aktivitas harian DI LUAR workout, biar pembakaran
  // workout tidak kehitung dua kali.
  const factor = Number(profile.activityFactor) || 1.35;
  const tdeeBase = restingBmr ? Math.round(restingBmr * factor) : null;

  // Angka terukur sudah termasuk workout, jadi tidak perlu ditambah burnPerDay lagi.
  const tdee = measuredTdee ?? (tdeeBase === null ? null : tdeeBase + burnPerDay);
  const tdeeSource = measuredTdee ? 'measured' : tdeeBase ? 'estimated' : null;
  const targetIntake = tdee === null ? null : Math.round(tdee - perDayDeficit);

  // Rambu keamanan: defisit yang terlalu dalam bikin kehilangan massa otot,
  // dan asupan di bawah lantai ini tidak dianjurkan tanpa pengawasan.
  const floor = profile.sex === 'female' ? 1200 : 1500;
  const weeklyLossPct = currentWeight ? ((kgToLose / days) * 7 * 100) / currentWeight : 0;
  let warning = null;
  if (targetIntake !== null && targetIntake < floor) {
    warning = {
      level: 'danger',
      text: `Target asupannya jatuh ke ${targetIntake} kcal — di bawah batas aman ${floor} kcal. Mundurin deadline atau longgarin target beratnya.`,
    };
  } else if (weeklyLossPct > 1.1) {
    warning = {
      level: 'warn',
      text: `Butuh turun ${weeklyLossPct.toFixed(1)}% berat badan per minggu. Di atas 1%/minggu, yang ikut hilang biasanya otot — bukan cuma lemak.`,
    };
  }

  return {
    perDayDeficit,
    totalDeficit,
    warning,
    weeklyLossPct: Number(weeklyLossPct.toFixed(2)),
    floor,
    kgToLose: Number(kgToLose.toFixed(1)),
    daysLeft: days,
    burnPerDay,
    fromFoodPerDay: Math.max(0, perDayDeficit - burnPerDay),
    bmr: restingBmr,
    tdeeBase,
    tdee,
    tdeeSource,
    measuredTdee,
    measuredDays: recentDaily.length,
    targetIntake,
    sample: { days: windowDays, sessions: recent.length, kcal: burned },
  };
}

/** Berapa kg setara dengan kalori yang dibakar. */
export function kcalToKg(kcal) {
  return Number((kcal / KCAL_PER_KG_FAT).toFixed(2));
}

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Duduk terus', hint: 'Kerja duduk, jarang jalan kaki' },
  { value: 1.35, label: 'Ringan', hint: 'Jalan kaki sedang, aktivitas harian normal' },
  { value: 1.5, label: 'Aktif', hint: 'Banyak berdiri / jalan sepanjang hari' },
];
