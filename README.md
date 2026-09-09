# Workout Tracker

Progressive-overload tracker buat siklus 4 hari (upper body fokus, leg dihandle padel), dibangun pakai
**React + Vite + Tailwind CSS**. Semua data disimpan lokal di `localStorage` — tanpa backend, tanpa login.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output ke dist/
npm run preview    # preview hasil build
```

Buka di HP lewat jaringan lokal: `npm run dev -- --host`.

## Isi program

| Hari | Fokus | Catatan |
|------|-------|---------|
| 1 | Shoulder | Satu-satunya hari yang punya alternatif versi gym (barbell/cable/machine) |
| 2 | Wings / back lebar (lats) | Steam room setelahnya |
| 3 | Chest + bicep | — |
| 4 | Shoulder + back round 2 | Ada leg sprinkle yang otomatis di-skip kalau baru padel |

Di luar siklus: **Padel** (auto-log sebagai leg + cardio), **Rest/Swim day**, dan **Aktivitas lain** (custom —
nama diisi sendiri, plus durasi & intensitas). Ketiganya dihitung sebagai "hari aktif" buat streak & kalender,
tapi **tidak menggeser posisi siklus 4 hari**.

## Fitur

- **Auto-rotate hari** — hari yang tampil dihitung dari sesi siklus terakhir yang selesai, bukan dari hari
  kalender. Ada toggle "aku pilih hari sendiri" buat lompat manual.
- **Toggle Rumah / Gym** per sesi — mengganti seluruh gerakan Hari 1 ke versi gym (reps 8-15, rest 90 detik).
- **Reminder progressive overload** di tiap sesi: tempo lambat, pause 1 detik, unilateral, rep tinggi + rest
  pendek, drop ke satu tangan. Versi gym menampilkan prinsip yang berbeda.
- **Checklist per set** dengan input reps & beban aktual, prefill dari sesi terakhir gerakan yang sama.
- **Workout timer** (start/pause/resume) — durasi ikut tersimpan ke riwayat, tahan refresh halaman.
- **Rest timer** otomatis jalan tiap centang set (default 60 detik, bisa diubah), plus bunyi (WebAudio) dan
  getar (Vibration API) saat habis.
- **Progress log** per gerakan: tabel tanggal, top set, volume, plus sparkline.
- **Weight tracker** dengan line chart menuju target 90-95 kg; target & deadline bisa diedit di Settings.
- **Kalori & hitungan defisit** — tiap sesi dapat estimasi kalori otomatis (rumus MET) yang bisa ditimpa
  manual, lalu diringkas jadi rencana defisit harian di tab Progress.
- **Streak & kalender bulanan** — hari aktif ditandai per jenis (workout / padel / swim), hari bolong tetap
  kelihatan.
- **Export / import JSON** buat backup.

## PWA

App-nya installable dan **jalan penuh tanpa koneksi**. `vite-plugin-pwa` (Workbox) mem-precache seluruh
app shell: JS, CSS, font Kanit & Outfit, dan 52 gambar gerakan — 69 entri, ~1,1 MB. Kartu **Pasang sebagai
aplikasi** di tab Profile memakai `beforeinstallprompt` di Chrome/Edge; di iOS Safari (yang tidak punya API
itu) yang tampil langkah manual Share → Add to Home Screen.

Update dipasang lewat `registerType: 'prompt'`, bukan `autoUpdate` — reload mendadak di tengah sesi, pas lagi
mengisi reps, bisa menghilangkan ketikan yang belum tersimpan. Versi baru memunculkan banner kecil dan baru
dipasang setelah tombolnya ditekan.

Ikon dibuat dari SVG di `public/` (192, 512, maskable 512, dan apple-touch-icon 180).

## Zoom di mobile

Input di-set **16px** lewat aturan base di `index.css`. Ini bukan pilihan estetika: iOS Safari otomatis
nge-zoom halaman begitu field dengan font di bawah 16px difokus, dan meta `user-scalable=no` diabaikan Safari
untuk kasus ini — jadi ukuran font adalah satu-satunya cara yang benar-benar mencegahnya. Ukuran visual tetap
terjaga lewat padding. Meta viewport juga mengunci `maximum-scale=1, user-scalable=no` (efektif di Android),
dan `touch-action: manipulation` menghapus zoom serta jeda 300 ms dari double-tap.

## Kalori & defisit

Estimasi kalori pakai rumus MET dari Compendium of Physical Activities:

```
kcal = MET × 3.5 × beratBadanKg / 200 × menit
```

MET yang dipakai: latihan beban 5,0 (versi rumah, rep tinggi + rest pendek) / 4,5 (versi gym); padel 5-8 dan
renang 6-8,3 tergantung intensitas; aktivitas custom 4-8. Angka otomatis ini bisa **ditimpa manual** di sheet
"Selesaikan sesi" atau saat mencatat hari non-siklus — isi angka dari jam tangan / heart rate monitor kalau
punya, karena itu lebih akurat.

Tab **Kalori** di Progress menampilkan total kalori hari ini, rinciannya per aktivitas, grafik batang 14 hari,
dan daftar total harian yang sudah dicatat. Total kalori hari ini juga tampil di stat card Home — tap kartunya
buat langsung input angka dari jam tangan.

**Total harian dari jam tangan (Garmin / Apple Watch).** Isi angka *total calories* satu hari penuh (bukan
active calories) lewat tab Kalori. Kalau ada, angka terukur ini dipakai sebagai TDEE menggantikan estimasi
BMR × faktor aktivitas — jauh lebih akurat, dan target asupan harian ikut menyesuaikan. Disimpan sebagai
`dailyBurn: [{ date, kcal, source }]`.

Panel **Hitungan defisit** di tab Progress memakai patokan 1 kg lemak ≈ 7.700 kcal:

- defisit total yang dibutuhkan = sisa kg × 7.700, dibagi jumlah hari tersisa
- rata-rata pembakaran workout 14 hari terakhir
- sisanya yang harus datang dari makan
- target asupan harian = TDEE − defisit, dengan TDEE diambil dari rata-rata total harian jam tangan kalau
  ada; kalau belum ada, dari BMR (Mifflin-St Jeor) × faktor aktivitas + pembakaran workout (butuh umur diisi
  di tab Profile)

Ada dua rambu: kalau target asupan jatuh di bawah 1.500 kcal (pria) / 1.200 kcal (wanita), atau kalau laju
yang dibutuhkan lebih dari 1,1% berat badan per minggu, app kasih peringatan buat mundurin deadline —
bukannya diam-diam menampilkan angka yang tidak sehat.

Semua angka pembakaran ini estimasi, bukan pengukuran; meleset 20-30% itu normal. Timbangan tetap umpan
balik yang menentukan.

## Tipografi

- **Kanit Bold (700)** — judul screen, nama hari, judul section & sheet, dan angka besar yang jarang
  berubah (persen ring, berat badan, streak, stat card). Utility: `.display` / `.display-num`.
- **Outfit** — body, nama gerakan, label, input, tabel, tombol.
- Angka yang berdetak tiap detik (timer sesi, rest timer) pakai utility `.timer-num` — Outfit bold dengan
  `tabular-nums`. Kanit tidak punya tabular figures (lebar "1" cuma separuh "0"), jadi timer akan goyang
  kalau dipaksa pakai Kanit.

Kedua font di-host sendiri di `src/assets/fonts/` (subset latin, total ~51 KB) dan di-bundle Vite — jalan
offline, tanpa request ke Google Fonts dan tanpa layout shift.

## Struktur

```
src/
  data/schedule.js      # sumber kebenaran jadwal, versi gym, core finisher, hari non-siklus
  lib/storage.js        # skema localStorage, normalisasi, export/import
  lib/stats.js          # auto-rotate siklus, streak, progres sesi, log beban, statistik berat
  lib/media.js          # rantai fallback gambar gerakan
  lib/date.js           # helper tanggal lokal (semua tanggal 'YYYY-MM-DD')
  hooks/useStore.jsx    # store global + semua aksi mutasi state
  hooks/useRestTimer.jsx# rest timer global (bunyi + getar)
  components/           # UI primitives, exercise card, chart, kalender, bottom nav
  screens/              # Home, Workouts, Progress, Profile, WorkoutDetail
```

### Skema localStorage (`wt.v1`)

```jsonc
{
  "version": 1,
  "profile":  { "name", "heightCm", "startWeightKg", "targetMinKg", "targetMaxKg", "targetDate" },
  "settings": { "defaultRestSec", "restSound", "restVibrate", "autoStartRest",
                "exercisedbBase", "exercisedbKey" },
  "prefs":    { "modeByDay": { "d1": "home|gym" }, "manualDayId": null },
  "active":   { /* sesi yang lagi jalan, tahan refresh */ },
  "sessions": [ { "id", "date", "dayId", "mode", "durationSec", "completed",
                  "includeCore", "skipLegSprinkle", "padelRecent",
                  "entries": { "<exerciseId>": { "sets": [{ "reps", "weight", "done" }] } },
                  "meta": { "durationMin", "intensity" } } ],
  "weights":  [ { "date", "kg" } ],
  "media":    { "<search term>": { "url", "source", "ts" } }
}
```

`id` tiap gerakan di `data/schedule.js` dipakai sebagai key riwayat — jangan diubah setelah dipakai, kalau
tidak log lama akan terputus dari gerakannya.

## Gambar gerakan

Semua gerakan di program ini gambarnya **ikut di-bundle** di `src/assets/exercises/<slug>/{0,1}.webp` —
dua frame (posisi awal & akhir) yang dianimasikan bergantian tiap 900 ms, jadi kelihatan seperti GIF tanpa
file GIF. Sumbernya [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (lisensi Unlicense /
public domain), sudah di-resize ke 440 px dan dikompres ke WebP: 52 frame, total ~690 KB. Karena lokal,
gambar muncul instan, jalan offline, dan tidak kena CORS atau rate limit.

Untuk gerakan yang belum punya gambar bundel, urutan fallback-nya: **wger API v2** (gratis, tanpa key) →
**ExerciseDB** (base URL & RapidAPI key opsional, diatur di tab Profile) → **placeholder inisial + ikon**.
Semua kegagalan ditangani diam-diam; app tidak pernah crash karena gambar.

Thumbnail di daftar sengaja **diam di frame pertama** — puluhan gambar yang berkedip bareng bikin daftar
susah dibaca, dan frame kedua tidak ikut diunduh selama tidak dipakai. Tap thumbnail-nya (di Home, di daftar
preview, atau di kartu sesi) buat buka tampilan besar: di sana frame-nya baru berganti tiap 700 ms, lengkap
dengan target set/reps, durasi rest, dan catatan tekniknya. Interval-nya hidup hanya selama modal terbuka.

Mau nambah gerakan baru? Taruh dua frame di `src/assets/exercises/<istilah-search-dengan-tanda-hubung>/`
dan `data/exerciseImages.js` bakal otomatis nemuin lewat `import.meta.glob` — tidak perlu daftar manual.
