import { useMemo, useState } from 'react';
import { getDay, resolveExercises, CORE_FINISHER } from '../data/schedule.js';
import { useStore, useElapsed } from '../hooks/useStore.jsx';
import { useRestTimer } from '../hooks/useRestTimer.jsx';
import { sessionProgress, sessionSetStats, cyclePosition } from '../lib/stats.js';
import { fmtDuration, todayKey } from '../lib/date.js';
import { Button, Card, Chip, ProgressRing, StatCard, StatRow, Segmented, Switch, Sheet, cx } from '../components/ui/Primitives.jsx';
import {
  IconChevronLeft, IconPlay, IconPause, IconCheck, IconHome, IconDumbbell, IconSteam,
  IconWarn, IconLayers, IconTimer, IconFlame, IconRacket, IconWaves, DAY_ICONS, SPECIAL_TONE,
} from '../components/ui/Icons.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import ExerciseMedia from '../components/ExerciseMedia.jsx';
import ExerciseMediaSheet from '../components/ExerciseMediaSheet.jsx';
import OverloadCard from '../components/OverloadCard.jsx';
import { SpecialLogSheet } from './Home.jsx';

export default function WorkoutDetail({ dayId, onBack }) {
  const { state, actions } = useStore();
  const rest = useRestTimer();
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [zoomEx, setZoomEx] = useState(null);
  const [specialSheet, setSpecialSheet] = useState(null);

  const day = getDay(dayId);
  const active = state.active?.dayId === dayId ? state.active : null;
  const elapsed = useElapsed(active);

  const doneToday = state.sessions.find((s) => s.date === todayKey() && s.dayId === dayId && s.completed);
  const session = active || doneToday;
  const mode = active?.mode || state.prefs.modeByDay[dayId] || 'home';

  const exercises = useMemo(
    () =>
      day && !day.special
        ? resolveExercises(day, {
            mode,
            includeCore: !!active?.includeCore,
            skipLegSprinkle: !!active?.skipLegSprinkle,
          })
        : [],
    [day, mode, active?.includeCore, active?.skipLegSprinkle]
  );

  if (!day) return null;
  const Icon = DAY_ICONS[dayId];
  const pos = cyclePosition(dayId);
  const progress = session ? sessionProgress(session, day) : { pct: 0, done: 0, total: 0 };
  const stats = session ? sessionSetStats(session) : { done: 0, total: 0, volume: 0 };

  /* ------------------------------------------------------- hari non-siklus */
  if (day.special) {
    return (
      <div className="anim-screen space-y-5">
        <DetailHeader day={day} onBack={onBack} pos={null} />
        <Card className="p-5 text-center">
          <span className={cx('w-16 h-16 mx-auto grid place-items-center rounded-3xl mb-3', SPECIAL_TONE[dayId])}>
            <Icon size={30} />
          </span>
          <p className="text-[17px] font-extrabold">{day.blurb}</p>
          <p className="text-[12.5px] text-muted mt-2 leading-relaxed max-w-[34ch] mx-auto">{day.detail}</p>
          <Button className="w-full mt-5" size="lg" onClick={() => setSpecialSheet(day)}>
            <IconCheck size={16} /> Catat hari ini
          </Button>
          {doneToday && (
            <p className="text-[12px] text-lime-accent mt-3 font-semibold">
              {doneToday.meta?.name ? `"${doneToday.meta.name}" tercatat hari ini` : 'Sudah tercatat hari ini'}
              {doneToday.meta?.durationMin ? ` · ${doneToday.meta.durationMin} menit` : ''}
              {doneToday.meta?.intensity ? ` · ${doneToday.meta.intensity}` : ''}
            </p>
          )}
        </Card>
        <SpecialLogSheet
          day={specialSheet}
          onClose={() => setSpecialSheet(null)}
          onSave={(meta) => {
            actions.logSpecialDay(dayId, meta);
            setSpecialSheet(null);
            onBack();
          }}
        />
      </div>
    );
  }

  /* ------------------------------------------------------------ hari siklus */
  return (
    <div className="anim-screen space-y-4">
      <DetailHeader day={day} onBack={onBack} pos={pos} />

      {/* timer + progres */}
      <Card className="p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={progress.pct} size={118} stroke={10}>
            <span className="display-num text-[27px]">{progress.pct}%</span>
            <span className="text-[10px] uppercase tracking-wider text-muted mt-1 tabular">
              {progress.done}/{progress.total} set
            </span>
          </ProgressRing>

          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] uppercase tracking-wider text-muted font-bold">Durasi sesi</p>
            <p className="timer-num text-[36px] mt-1.5">
              {fmtDuration(active ? elapsed : doneToday?.durationSec || 0)}
            </p>

            {active ? (
              <div className="flex gap-2 mt-3">
                <Button
                  variant={active.running ? 'ghost' : 'primary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => (active.running ? actions.pauseTimer() : actions.resumeTimer())}
                >
                  {active.running ? <IconPause size={14} /> : <IconPlay size={14} />}
                  {active.running ? 'Pause' : 'Lanjut'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmFinish(true)}>
                  Selesai
                </Button>
              </div>
            ) : (
              <Button
                className="w-full mt-3"
                onClick={() => actions.startSession(dayId, { mode, padelRecent: false })}
              >
                <IconPlay size={14} /> {doneToday ? 'Mulai sesi baru' : 'Start workout'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {session && (
        <StatRow>
          <StatCard icon={IconLayers} value={`${stats.done}`} label="Set selesai" accent />
          <StatCard icon={IconFlame} value={stats.volume ? `${stats.volume}` : '—'} label="Volume (kg)" />
          <StatCard icon={IconTimer} value={`${exercises.length}`} label="Gerakan" />
        </StatRow>
      )}

      {/* toggle versi rumah / gym */}
      {day.hasGym && (
        <div>
          <Segmented
            value={mode}
            onChange={(m) => {
              actions.setDayMode(dayId, m);
              if (active) actions.reshapeActive({ mode: m });
            }}
            options={[
              { value: 'home', label: 'Versi rumah', icon: IconHome },
              { value: 'gym', label: 'Versi gym', icon: IconDumbbell },
            ]}
          />
          <p className="text-[11.5px] text-muted mt-2 px-1">
            {mode === 'gym'
              ? 'Semua gerakan diganti ke alternatif barbell/cable/machine, reps 8-15.'
              : 'Dumbbell 5-10kg, reps tinggi + tempo lambat.'}
          </p>
        </div>
      )}

      <OverloadCard mode={mode} defaultOpen={!session} />

      {/* opsi sesi */}
      {active && (
        <Card className="p-4 space-y-3">
          {day.padelWarning && (
            <>
              <Switch
                id="padel-recent"
                checked={!!active.padelRecent}
                onChange={(v) => actions.reshapeActive({ padelRecent: v, skipLegSprinkle: v })}
                label="Baru padel berat 1-2 hari terakhir"
                hint="Kalau ON, leg sprinkle (Goblet Squat & Reverse Lunge) dikeluarin dari sesi."
              />
              {active.padelRecent && (
                <div className="flex gap-2.5 rounded-2xl bg-amber-400/8 border border-amber-400/20 p-3">
                  <IconWarn size={16} className="text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-100/90 leading-relaxed">{day.padelWarning}</p>
                </div>
              )}
              <div className="h-px bg-white/5" />
            </>
          )}
          <Switch
            id="core-finisher"
            checked={!!active.includeCore}
            onChange={(v) => actions.reshapeActive({ includeCore: v })}
            label="Core finisher (opsional)"
            hint={`${CORE_FINISHER.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')} — ${CORE_FINISHER.note}`}
          />
        </Card>
      )}

      {/* daftar gerakan */}
      <div className="space-y-2.5 anim-stagger">
        {exercises.map((ex, i) =>
          session ? (
            <ExerciseCard key={ex.id} exercise={ex} session={session} index={i} />
          ) : (
            <PreviewCard key={ex.id} exercise={ex} index={i} onZoom={() => setZoomEx(ex)} />
          )
        )}
      </div>

      {day.footer && (
        <Card className="p-3.5 flex items-center gap-3">
          <span className="w-9 h-9 grid place-items-center rounded-xl bg-lime-accent/12 text-lime-accent shrink-0">
            <IconSteam size={18} />
          </span>
          <p className="text-[12.5px] text-muted leading-relaxed">{day.footer}</p>
        </Card>
      )}

      {active && (
        <div className="pt-1 pb-2 flex gap-2.5">
          <Button className="flex-1" size="lg" onClick={() => setConfirmFinish(true)}>
            <IconCheck size={17} /> Selesaikan sesi
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => {
              actions.discardSession();
              rest.stop();
            }}
          >
            Batal
          </Button>
        </div>
      )}

      <ExerciseMediaSheet exercise={zoomEx} onClose={() => setZoomEx(null)} />

      <Sheet
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        title="Selesaikan sesi?"
        footer={
          <div className="flex gap-2.5">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmFinish(false)}>
              Belum
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                actions.finishSession();
                rest.stop();
                setConfirmFinish(false);
                onBack();
              }}
            >
              Simpan sesi
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-muted leading-relaxed">
            Sesi bakal disimpan ke riwayat dengan durasi {fmtDuration(elapsed)} dan {stats.done} set tercatat.
            {progress.done < progress.total && (
              <span className="text-amber-300">
                {' '}
                Masih ada {progress.total - progress.done} set yang belum dicentang — gak masalah, tetap kesimpan.
              </span>
            )}
          </p>
          <StatRow>
            <StatCard icon={IconTimer} value={fmtDuration(elapsed)} label="Durasi" accent />
            <StatCard icon={IconLayers} value={stats.done} label="Set" />
            <StatCard icon={IconFlame} value={stats.volume || '—'} label="Volume kg" />
          </StatRow>
        </div>
      </Sheet>
    </div>
  );
}

function DetailHeader({ day, onBack, pos }) {
  const Icon = DAY_ICONS[day.id];
  return (
    <header className="flex items-center gap-3 pt-1">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 shrink-0 grid place-items-center rounded-2xl bg-ink-800 border border-white/6 text-white hover:bg-ink-750 transition"
        aria-label="Kembali"
      >
        <IconChevronLeft size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Chip tone="lime">{day.special ? 'Non-siklus' : `Hari ${day.num}`}</Chip>
          {pos && <span className="text-[11px] text-muted">posisi {pos.position}/{pos.total} siklus</span>}
        </div>
        <h1 className="display text-[21px] mt-1 truncate">{day.title}</h1>
      </div>
      <span className="w-10 h-10 shrink-0 grid place-items-center rounded-2xl bg-lime-accent/12 text-lime-accent">
        <Icon size={20} />
      </span>
    </header>
  );
}

function PreviewCard({ exercise, index, onZoom }) {
  return (
    <Card className="p-3 flex items-center gap-3">
      <button
        type="button"
        onClick={onZoom}
        aria-label={`Lihat gerakan ${exercise.name}`}
        className="shrink-0 rounded-xl transition-transform duration-200 active:scale-95"
      >
        <ExerciseMedia term={exercise.search} name={exercise.name} size={46} rounded="rounded-xl" />
      </button>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] font-bold text-muted tabular">{String(index + 1).padStart(2, '0')}</span>
        <span className="block text-[13.5px] font-bold truncate">{exercise.name}</span>
        <span className="block text-[11.5px] text-muted">
          {exercise.sets} × {exercise.reps} {exercise.unit || ''}
          {exercise.note ? ` · ${exercise.note}` : ''}
        </span>
      </span>
      {exercise.isGymAlt && <Chip tone="lime">gym</Chip>}
    </Card>
  );
}

export { IconRacket, IconWaves };
