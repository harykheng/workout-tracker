import { useRef, useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore.jsx';
import { downloadBackup, parseImport } from '../lib/storage.js';
import { weightStats, computeStreak } from '../lib/stats.js';
import { formatFull, todayKey } from '../lib/date.js';
import { ACTIVITY_LEVELS, bmr } from '../lib/energy.js';
import { previewBeep } from '../hooks/useRestTimer.jsx';
import {
  Button, Card, Field, Input, Select, SectionTitle, Switch, cx, useToast, Sheet, StatCard, StatRow,
} from '../components/ui/Primitives.jsx';
import {
  IconUser, IconTarget, IconTimer, IconDownload, IconUpload, IconTrash, IconScale, IconFlame, IconImage, IconInfo,
} from '../components/ui/Icons.jsx';

export default function Profile() {
  const { state, actions } = useStore();
  const toast = useToast();
  const fileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importPreview, setImportPreview] = useState(null);

  const w = useMemo(() => weightStats(state), [state]);
  const streak = useMemo(() => computeStreak(state.sessions), [state.sessions]);
  const { profile, settings } = state;
  const restingBmr = bmr({ weightKg: w.current, heightCm: profile.heightCm, age: profile.age, sex: profile.sex });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseImport(text);
      if (!result.ok) {
        toast.show(result.error, 'err');
        return;
      }
      setImportPreview(result.state);
    } catch {
      toast.show('File gagal dibaca.', 'err');
    }
  };

  return (
    <div className="anim-screen space-y-5">
      <header className="flex items-center gap-4 pt-1">
        <span className="display w-16 h-16 shrink-0 grid place-items-center rounded-3xl bg-lime-accent text-ink-900 text-[25px]">
          {(profile.name || 'H').slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="display text-[26px] truncate">{profile.name || 'Kamu'}</h1>
          <p className="text-[13px] text-muted">
            {profile.heightCm} cm · {w.current} kg · target {profile.targetMinKg}-{profile.targetMaxKg} kg
          </p>
        </div>
      </header>

      <StatRow>
        <StatCard icon={IconFlame} value={streak.current} label="Streak" accent />
        <StatCard icon={IconScale} value={`${w.lost > 0 ? '-' : ''}${Math.abs(w.lost)}`} label="Kg turun" />
        <StatCard icon={IconTarget} value={w.daysLeft > 0 ? w.daysLeft : 0} label="Hari ke target" />
      </StatRow>

      {/* ---------------------------------------------------------- profil */}
      <section>
        <SectionTitle>Profil</SectionTitle>
        <Card className="p-4 space-y-3.5">
          <Field label="Nama (buat greeting di home)">
            <Input value={profile.name} onChange={(e) => actions.updateProfile({ name: e.target.value })} placeholder="Hary" />
          </Field>
          <div className="grid grid-cols-3 gap-2.5">
            <Field label="Umur">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="—"
                value={profile.age ?? ''}
                onChange={(e) => actions.updateProfile({ age: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </Field>
            <Field label="Gender">
              <Select value={profile.sex} onChange={(e) => actions.updateProfile({ sex: e.target.value })}>
                <option value="male">Pria</option>
                <option value="female">Wanita</option>
              </Select>
            </Field>
            <Field label="Tinggi (cm)">
              <Input
                type="number"
                inputMode="numeric"
                value={profile.heightCm}
                onChange={(e) => actions.updateProfile({ heightCm: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field
            label="Aktivitas harian di luar workout"
            hint={
              restingBmr
                ? `BMR kamu ≈ ${restingBmr} kcal/hari. Dipakai buat hitung target asupan di tab Progress.`
                : 'Isi umur dulu biar BMR & target asupan bisa dihitung.'
            }
          >
            <Select
              value={String(profile.activityFactor)}
              onChange={(e) => actions.updateProfile({ activityFactor: Number(e.target.value) })}
            >
              {ACTIVITY_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} — {l.hint}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Berat awal (kg)" hint="Titik start buat hitung “sudah turun berapa kg”.">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={profile.startWeightKg}
              onChange={(e) => actions.updateProfile({ startWeightKg: Number(e.target.value) })}
            />
          </Field>
        </Card>
      </section>

      {/* ---------------------------------------------------------- target */}
      <section>
        <SectionTitle>Target</SectionTitle>
        <Card className="p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target min (kg)">
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={profile.targetMinKg}
                onChange={(e) => actions.updateProfile({ targetMinKg: Number(e.target.value) })}
              />
            </Field>
            <Field label="Target max (kg)">
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={profile.targetMaxKg}
                onChange={(e) => actions.updateProfile({ targetMaxKg: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Deadline" hint={`Sekarang: ${formatFull(profile.targetDate)}`}>
            <Input
              type="date"
              value={profile.targetDate}
              min={todayKey()}
              onChange={(e) => actions.updateProfile({ targetDate: e.target.value })}
            />
          </Field>
        </Card>
      </section>

      {/* ------------------------------------------------------ rest timer */}
      <section>
        <SectionTitle>Rest timer</SectionTitle>
        <Card className="p-4 space-y-4">
          <Field label="Durasi default (detik)" hint="Catatan program: 45-60 detik buat rep tinggi, 90 detik buat versi gym.">
            <div className="flex gap-2">
              {[45, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => actions.updateSettings({ defaultRestSec: sec })}
                  className={cx(
                    'flex-1 py-2.5 rounded-xl text-[13px] font-bold transition tabular',
                    settings.defaultRestSec === sec ? 'bg-lime-accent text-ink-900' : 'bg-ink-900/70 text-muted hover:text-white'
                  )}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </Field>
          <Input
            type="number"
            inputMode="numeric"
            value={settings.defaultRestSec}
            onChange={(e) => actions.updateSettings({ defaultRestSec: Number(e.target.value) || 60 })}
            aria-label="Durasi rest kustom"
          />
          <div className="h-px bg-white/5" />
          <Switch
            id="auto-rest"
            checked={settings.autoStartRest}
            onChange={(v) => actions.updateSettings({ autoStartRest: v })}
            label="Auto-start tiap centang set"
            hint="Timer langsung jalan begitu satu set dicentang."
          />
          <Switch
            id="rest-sound"
            checked={settings.restSound}
            onChange={(v) => {
              actions.updateSettings({ restSound: v });
              if (v) previewBeep();
            }}
            label="Bunyi saat istirahat habis"
          />
          <Switch
            id="rest-vibrate"
            checked={settings.restVibrate}
            onChange={(v) => {
              actions.updateSettings({ restVibrate: v });
              if (v) navigator.vibrate?.(80);
            }}
            label="Getar saat istirahat habis"
            hint="Cuma jalan di browser HP yang support Vibration API."
          />
        </Card>
      </section>

      {/* ---------------------------------------------------- sumber gambar */}
      <section>
        <SectionTitle>Sumber GIF gerakan</SectionTitle>
        <Card className="p-4 space-y-3.5">
          <p className="flex gap-2 text-[12px] text-muted leading-relaxed">
            <IconInfo size={14} className="shrink-0 mt-0.5" />
            Semua gerakan di program ini gambarnya sudah ikut di-bundle (2 frame, dianimasikan) — jalan offline, tanpa
            request keluar. Untuk gerakan yang belum ada gambarnya, app cari ke wger API (gratis, tanpa key) lalu
            ExerciseDB; kalau dua-duanya gagal, tampil inisial gerakan dan app tetap jalan normal.
          </p>
          <Field label="ExerciseDB base URL" hint="Kosongkan kalau gak dipakai.">
            <Input
              value={settings.exercisedbBase}
              onChange={(e) => actions.updateSettings({ exercisedbBase: e.target.value })}
              placeholder="https://exercisedb-api.vercel.app/api/v1"
            />
          </Field>
          <Field label="RapidAPI key (opsional)">
            <Input
              type="password"
              value={settings.exercisedbKey}
              onChange={(e) => actions.updateSettings({ exercisedbKey: e.target.value })}
              placeholder="cuma kalau pakai endpoint RapidAPI"
            />
          </Field>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              actions.replaceState({ ...state, media: {} });
              toast.show('Cache gambar dibersihkan');
            }}
          >
            <IconImage size={15} /> Bersihkan cache gambar ({Object.keys(state.media).length})
          </Button>
        </Card>
      </section>

      {/* ------------------------------------------------------------ data */}
      <section>
        <SectionTitle>Data</SectionTitle>
        <Card className="p-4 space-y-2.5">
          <p className="text-[12px] text-muted leading-relaxed mb-1">
            Semua data disimpan di localStorage browser ini — {state.sessions.length} sesi, {state.weights.length} catatan
            berat. Backup rutin biar aman kalau ganti HP atau clear browser data.
          </p>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              downloadBackup(state);
              toast.show('Backup JSON diunduh');
            }}
          >
            <IconDownload size={16} /> Export JSON
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => fileRef.current?.click()}>
            <IconUpload size={16} /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
          <Button variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
            <IconTrash size={16} /> Reset semua data
          </Button>
        </Card>
      </section>

      <p className="text-center text-[11px] text-muted pb-2">
        Siklus 4 hari · leg dihandle padel · target {profile.targetMinKg}-{profile.targetMaxKg} kg di{' '}
        {formatFull(profile.targetDate)}
      </p>

      {/* --------------------------------------------------------- dialogs */}
      <Sheet
        open={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Import backup?"
        footer={
          <div className="flex gap-2.5">
            <Button variant="ghost" className="flex-1" onClick={() => setImportPreview(null)}>
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                actions.replaceState(importPreview);
                setImportPreview(null);
                toast.show('Data berhasil di-import');
              }}
            >
              Timpa data
            </Button>
          </div>
        }
      >
        <p className="text-[13px] text-muted leading-relaxed mb-3">
          Data sekarang bakal <span className="text-white font-semibold">ditimpa</span> sama isi file ini. Export dulu kalau
          belum yakin.
        </p>
        {importPreview && (
          <StatRow>
            <StatCard icon={IconTimer} value={importPreview.sessions.length} label="Sesi" accent />
            <StatCard icon={IconScale} value={importPreview.weights.length} label="Data berat" />
            <StatCard icon={IconUser} value={importPreview.profile.name || '—'} label="Nama" />
          </StatRow>
        )}
      </Sheet>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset semua data?"
        footer={
          <div className="flex gap-2.5">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                actions.resetAll();
                setConfirmReset(false);
                toast.show('Semua data direset');
              }}
            >
              Hapus semua
            </Button>
          </div>
        }
      >
        <p className="text-[13px] text-muted leading-relaxed">
          Riwayat sesi, log beban, catatan berat badan, dan streak bakal hilang permanen. Export JSON dulu kalau masih mau
          disimpan.
        </p>
      </Sheet>

      {toast.node}
    </div>
  );
}
