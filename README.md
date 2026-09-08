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

Di luar siklus: **Padel** (auto-log sebagai leg + cardio) dan **Rest/Swim day**. Dua-duanya dihitung sebagai
"hari aktif" buat streak & kalender, tapi **tidak menggeser posisi siklus 4 hari**.

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
- **Streak & kalender bulanan** — hari aktif ditandai per jenis (workout / padel / swim), hari bolong tetap
  kelihatan.
- **Export / import JSON** buat backup.

## Tipografi

- **Bebas Neue** — judul, nama hari, dan angka besar (persentase ring, timer, stat card). Caps-only &
  condensed, kesan gym/angkat beban.
- **Inter** — body, nama gerakan, label, input, tabel.

Kedua font di-host sendiri di `src/assets/fonts/` (subset latin, total ~62 KB) dan di-bundle Vite — jadi
jalan offline, tanpa request ke Google Fonts dan tanpa layout shift. Utility-nya: `.display` untuk judul
(otomatis uppercase) dan `.display-num` untuk angka. Digit Bebas Neue lebarnya seragam, jadi timer yang
berdetak tidak goyang.

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

Urutan pencarian: **wger API v2** (gratis, tanpa key) → **ExerciseDB** (base URL & RapidAPI key opsional,
diatur di tab Profile) → **placeholder inisial + ikon**. Semua kegagalan (offline, CORS, rate limit, JSON
tak dikenal) ditangani diam-diam; app tidak pernah crash karena gambar. Hasil lookup di-cache 30 hari di
localStorage dan bisa dibersihkan dari Settings.

Catatan: wger menyajikan gambar statis, bukan GIF animasi. Kalau mau GIF animasi beneran, isi endpoint
ExerciseDB di Settings — parser-nya sengaja toleran dan menerima field `gifUrl` / `image` dari bentuk
respons apa pun.
