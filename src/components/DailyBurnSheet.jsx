import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore.jsx';
import { todayKey, formatFull } from '../lib/date.js';
import { dayWorkoutKcal } from '../lib/energy.js';
import { weightStats } from '../lib/stats.js';
import { Button, Field, Input, Sheet } from './ui/Primitives.jsx';

/**
 * Input total kalori terbakar sehari — angka dari jam tangan (Garmin/Apple Watch),
 * yang sudah termasuk metabolisme basal, aktivitas harian, dan workout.
 */
export default function DailyBurnSheet({ open, onClose, date: initialDate }) {
  const { state, actions } = useStore();
  const [date, setDate] = useState(initialDate || todayKey());
  const [kcal, setKcal] = useState('');

  useEffect(() => {
    if (!open) return;
    const d = initialDate || todayKey();
    setDate(d);
    setKcal(String(state.dailyBurn.find((x) => x.date === d)?.kcal || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate]);

  const existing = state.dailyBurn.find((x) => x.date === date);
  const workout = dayWorkoutKcal(state.sessions, date, weightStats(state).current);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Total kalori harian"
      footer={
        <div className="flex gap-2.5">
          {existing && (
            <Button
              variant="danger"
              onClick={() => {
                actions.removeDailyBurn(date);
                onClose();
              }}
            >
              Hapus
            </Button>
          )}
          <Button
            className="flex-1"
            size="lg"
            disabled={!kcal}
            onClick={() => {
              actions.setDailyBurn(date, kcal);
              onClose();
            }}
          >
            Simpan
          </Button>
        </div>
      }
    >
      <div className="space-y-3.5">
        <p className="text-[12.5px] text-muted leading-relaxed">
          Isi angka <span className="text-white font-semibold">total calories</span> dari Garmin (bukan active
          calories) — sudah termasuk metabolisme basal, aktivitas harian, dan workout. Kalau ada, app pakai angka ini
          buat hitung target asupan, gantiin estimasi BMR yang cuma tebakan rumus.
        </p>

        <Field label="Tanggal">
          <Input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <Field
          label="Total kalori terbakar"
          hint={
            workout
              ? `Workout kamu di ${formatFull(date)} diestimasi ${workout} kcal — angka Garmin harusnya jauh lebih besar karena termasuk BMR.`
              : 'Belum ada sesi tercatat di tanggal ini.'
          }
        >
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="2950"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              className="pr-14"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-muted">kcal</span>
          </div>
        </Field>
      </div>
    </Sheet>
  );
}
