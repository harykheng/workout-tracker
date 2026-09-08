import { useMemo, useState } from 'react';
import { useStore } from '../hooks/useStore.jsx';
import { sessionTitle } from '../data/schedule.js';
import { weightStats, computeStreak, buildExerciseLog, weekSummary } from '../lib/stats.js';
import { todayKey, formatFull, relativeLabel, diffDays, fmtDurationShort } from '../lib/date.js';
import { WeightChart, Sparkline } from '../components/Charts.jsx';
import HistoryCalendar from '../components/HistoryCalendar.jsx';
import {
  Button, Card, Chip, ProgressRing, SectionTitle, StatCard, StatRow, Sheet, Input, Field, cx, EmptyState,
} from '../components/ui/Primitives.jsx';
import {
  IconScale, IconFlame, IconTarget, IconChevronDown, IconPlus, IconTrash, IconChart, IconLayers, IconTimer,
} from '../components/ui/Icons.jsx';

export default function Progress() {
  const { state, actions } = useStore();
  const [tab, setTab] = useState('weight');
  const [addOpen, setAddOpen] = useState(false);
  const [dayDetail, setDayDetail] = useState(null);

  const w = useMemo(() => weightStats(state), [state]);
  const streak = useMemo(() => computeStreak(state.sessions), [state.sessions]);
  const week = useMemo(() => weekSummary(state.sessions), [state.sessions]);
  const exLog = useMemo(() => buildExerciseLog(state.sessions), [state.sessions]);

  return (
    <div className="anim-screen space-y-5">
      <header className="pt-1">
        <h1 className="display text-[27px]">Progress</h1>
        <p className="text-[13px] text-muted mt-0.5">
          {w.daysLeft > 0 ? `${w.daysLeft} hari lagi ke ${formatFull(state.profile.targetDate)}` : 'Target date sudah lewat'}
        </p>
      </header>

      <div className="flex p-1 rounded-2xl bg-ink-800 border border-white/5">
        {[
          { id: 'weight', label: 'Berat badan' },
          { id: 'history', label: 'Kalender' },
          { id: 'lifts', label: 'Beban' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cx(
              'flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all duration-250',
              tab === t.id ? 'bg-lime-accent text-ink-900' : 'text-muted hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------ berat badan */}
      {tab === 'weight' && (
        <div className="space-y-4 anim-fade">
          <Card className="p-5">
            <div className="flex items-center gap-5">
              <ProgressRing value={w.pct} size={128} stroke={11}>
                <span className="display-num text-[32px]">{w.current}</span>
                <span className="text-[11px] text-muted uppercase tracking-wider mt-0.5">kg sekarang</span>
              </ProgressRing>
              <div className="flex-1 min-w-0 space-y-2.5">
                <Row label="Start" value={`${w.start} kg`} />
                <Row label="Turun" value={`${w.lost > 0 ? '-' : ''}${Math.abs(w.lost)} kg`} accent={w.lost > 0} />
                <Row label="Target" value={`${w.goalMin}-${w.goal} kg`} />
                <Row label="Sisa" value={`${w.remaining > 0 ? w.remaining : 0} kg`} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <WeightChart
                data={w.sorted.length ? w.sorted : [{ date: todayKey(), kg: state.profile.startWeightKg }]}
                goalMin={w.goalMin}
                goalMax={w.goal}
                targetDate={state.profile.targetDate}
              />
            </div>
          </Card>

          <StatRow>
            <StatCard
              icon={IconTarget}
              value={w.daysLeft > 0 ? w.daysLeft : 0}
              label="Hari tersisa"
              accent
            />
            <StatCard icon={IconScale} value={`${w.perWeekNeeded > 0 ? w.perWeekNeeded : 0}`} label="Butuh kg/minggu" />
            <StatCard
              icon={IconChart}
              value={w.perWeekActual === null ? '—' : `${w.perWeekActual}`}
              label="Laju kg/minggu"
            />
          </StatRow>

          {w.perWeekActual !== null && (
            <Card className={cx('p-3.5 border', w.onTrack ? 'border-lime-accent/30 bg-lime-accent/[0.06]' : 'border-amber-400/25 bg-amber-400/[0.06]')}>
              <p className={cx('text-[12.5px] leading-relaxed', w.onTrack ? 'text-lime-accent' : 'text-amber-200')}>
                {w.onTrack
                  ? `On track — laju ${w.perWeekActual} kg/minggu, cukup buat nyampe ${w.goal}kg sebelum ${formatFull(state.profile.targetDate)}.`
                  : `Laju sekarang ${w.perWeekActual} kg/minggu, sementara butuh ${w.perWeekNeeded} kg/minggu. Perlu tambah defisit atau tambah hari aktif.`}
              </p>
            </Card>
          )}

          <Button className="w-full" size="lg" onClick={() => setAddOpen(true)}>
            <IconPlus size={16} /> Catat berat badan
          </Button>

          <section>
            <SectionTitle>Riwayat timbangan</SectionTitle>
            {w.sorted.length === 0 ? (
              <EmptyState icon={IconScale} title="Belum ada data" text="Catat berat badan minimal seminggu sekali biar grafiknya kebaca." />
            ) : (
              <div className="space-y-2">
                {[...w.sorted].reverse().map((entry, i, arr) => {
                  const prev = arr[i + 1];
                  const delta = prev ? Number((entry.kg - prev.kg).toFixed(1)) : null;
                  return (
                    <Card key={entry.date} className="p-3 flex items-center gap-3">
                      <span className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 text-muted shrink-0">
                        <IconScale size={17} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold tabular">{entry.kg} kg</p>
                        <p className="text-[11.5px] text-muted">{formatFull(entry.date)} · {relativeLabel(entry.date)}</p>
                      </div>
                      {delta !== null && (
                        <Chip tone={delta < 0 ? 'lime' : delta > 0 ? 'warn' : 'default'}>
                          {delta > 0 ? '+' : ''}
                          {delta} kg
                        </Chip>
                      )}
                      <button
                        type="button"
                        onClick={() => actions.removeWeight(entry.date)}
                        className="w-7 h-7 grid place-items-center rounded-full text-muted hover:text-red-300 transition shrink-0"
                        aria-label="Hapus data"
                      >
                        <IconTrash size={14} />
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* -------------------------------------------------------- kalender */}
      {tab === 'history' && (
        <div className="space-y-4 anim-fade">
          <Card className="p-5">
            <div className="flex items-center gap-5">
              <ProgressRing value={Math.min(100, (streak.current / Math.max(7, streak.best)) * 100)} size={112} stroke={10}>
                <span className="display-num text-[33px]">{streak.current}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted mt-1">hari streak</span>
              </ProgressRing>
              <div className="flex-1 min-w-0 space-y-2.5">
                <Row label="Streak terbaik" value={`${streak.best} hari`} accent />
                <Row label="Minggu ini" value={`${week.activeDays}/7 hari`} />
                <Row label="Total sesi" value={`${state.sessions.filter((s) => s.completed).length}`} />
                <Row label="Durasi 7 hari" value={fmtDurationShort(week.totalSec)} />
              </div>
            </div>
            {!streak.activeToday && (
              <p className="text-[12px] text-amber-200/80 mt-4 pt-3.5 border-t border-white/5 leading-relaxed">
                Hari ini belum ada aktivitas. Workout, padel, atau renang — semuanya ngitung buat streak.
              </p>
            )}
          </Card>

          <HistoryCalendar sessions={state.sessions} onPickDate={(date, list) => setDayDetail({ date, list })} />

          <Sheet open={!!dayDetail} onClose={() => setDayDetail(null)} title={dayDetail ? formatFull(dayDetail.date) : ''}>
            {dayDetail?.list?.length ? (
              <div className="space-y-2">
                {dayDetail.list.map((s) => (
                  <Card key={s.id} className="p-3">
                    <p className="text-[14px] font-bold">{sessionTitle(s)}</p>
                    <p className="text-[12px] text-muted mt-1">
                      {s.durationSec ? `${fmtDurationShort(s.durationSec)} · ` : ''}
                      {s.special ? s.meta?.intensity || 'aktif' : `${Object.values(s.entries || {}).flatMap((e) => e.sets || []).filter((x) => x.done).length} set`}
                      {s.mode === 'gym' && !s.special ? ' · versi gym' : ''}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted">
                Gak ada aktivitas tercatat di tanggal ini. Hari bolong gak apa-apa — yang penting rata-rata mingguannya.
              </p>
            )}
          </Sheet>
        </div>
      )}

      {/* ------------------------------------------------------------ beban */}
      {tab === 'lifts' && (
        <div className="space-y-3 anim-fade">
          {Object.keys(exLog).length === 0 ? (
            <EmptyState
              icon={IconLayers}
              title="Belum ada log beban"
              text="Isi reps & beban tiap set pas workout — nanti progresnya kelihatan di sini per gerakan."
            />
          ) : (
            Object.values(exLog)
              .sort((a, b) => b.points.length - a.points.length)
              .map((item) => <LiftRow key={item.id} item={item} />)
          )}
        </div>
      )}

      <AddWeightSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultKg={w.current}
        onSave={(date, kg) => {
          actions.addWeight(date, kg);
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className={cx('text-[13.5px] font-bold tabular', accent && 'text-lime-accent')}>{value}</span>
    </div>
  );
}

function LiftRow({ item }) {
  const [open, setOpen] = useState(false);
  const points = item.points;
  const last = points[points.length - 1];
  const first = points[0];
  const delta = Number((last.topWeight - first.topWeight).toFixed(1));

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 p-3.5 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold truncate">{item.name}</p>
          <p className="text-[11.5px] text-muted mt-0.5 tabular">
            {points.length} sesi · terakhir {last.topWeight || '—'}kg × {last.topReps || '—'}
            {delta !== 0 && (
              <span className={delta > 0 ? 'text-lime-accent ml-1.5' : 'text-amber-300 ml-1.5'}>
                {delta > 0 ? '+' : ''}
                {delta}kg
              </span>
            )}
          </p>
        </div>
        <Sparkline values={points.map((p) => p.volume || p.topWeight)} />
        <IconChevronDown size={16} className={cx('text-muted transition-transform duration-300', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 anim-fade">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-muted text-[10.5px] uppercase tracking-wider">
                <th className="text-left font-semibold py-1.5">Tanggal</th>
                <th className="text-right font-semibold">Set</th>
                <th className="text-right font-semibold">Top</th>
                <th className="text-right font-semibold">Volume</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p, i) => (
                <tr key={`${p.date}-${i}`} className="border-t border-white/5">
                  <td className="py-2 text-white/80">
                    {relativeLabel(p.date)}
                    {p.mode === 'gym' && <span className="text-lime-accent/70 ml-1.5 text-[10px]">gym</span>}
                  </td>
                  <td className="text-right tabular text-muted">{p.sets}</td>
                  <td className="text-right tabular font-semibold">
                    {p.topWeight || '—'}kg × {p.topReps || '—'}
                  </td>
                  <td className="text-right tabular text-muted">{p.volume || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function AddWeightSheet({ open, onClose, defaultKg, onSave }) {
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(todayKey());

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Catat berat badan"
      footer={
        <Button
          className="w-full"
          size="lg"
          disabled={!kg}
          onClick={() => {
            onSave(date, kg);
            setKg('');
            setDate(todayKey());
          }}
        >
          Simpan
        </Button>
      }
    >
      <div className="space-y-3.5">
        <Field label="Berat (kg)" hint={`Terakhir tercatat: ${defaultKg} kg`}>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={String(defaultKg)}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Tanggal">
          <Input type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <p className="text-[12px] text-muted leading-relaxed">
          Timbang di jam yang sama tiap kali (paling stabil: pagi setelah ke kamar mandi, sebelum makan).
        </p>
      </div>
    </Sheet>
  );
}

export { IconFlame, IconTimer, diffDays };
