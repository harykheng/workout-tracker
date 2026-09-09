import { useMemo, useState } from 'react';
import ExerciseMedia from './ExerciseMedia.jsx';
import ExerciseMediaSheet from './ExerciseMediaSheet.jsx';
import { Card, Chip, cx } from './ui/Primitives.jsx';
import { IconCheck, IconChevronDown, IconPlus, IconTrash, IconInfo, IconTimer, IconExpand } from './ui/Icons.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { useRestTimer } from '../hooks/useRestTimer.jsx';
import { lastLoggedSets } from '../lib/stats.js';
import { relativeLabel } from '../lib/date.js';

export default function ExerciseCard({ exercise, session, index }) {
  const { state, actions } = useStore();
  const rest = useRestTimer();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);

  const sets = session.entries?.[exercise.id]?.sets || [];
  const doneCount = sets.filter((s) => s.done).length;
  const target = exercise.sets;
  const allDone = doneCount >= target && sets.slice(0, target).every((s) => s.done);

  const last = useMemo(() => lastLoggedSets(state.sessions, exercise.id), [state.sessions, exercise.id]);
  const restSec = exercise.rest || state.settings.defaultRestSec;

  const handleSetToggle = (i) => {
    const next = !sets[i]?.done;
    actions.toggleSet(exercise.id, i, next);
    if (next && state.settings.autoStartRest && !exercise.optional) {
      rest.start(restSec, `Istirahat • ${exercise.name}`);
    }
  };

  const toggleAll = (e) => {
    e.stopPropagation();
    actions.toggleExercise(exercise.id, target, !allDone);
    if (!allDone) rest.stop();
  };

  const prefill = (i, field) => {
    if (!last) return '';
    const src = last.sets[Math.min(i, last.sets.length - 1)];
    return src?.[field] ?? '';
  };

  return (
    <Card
      className={cx(
        'overflow-hidden transition-colors duration-300',
        allDone && 'border-lime-accent/35 bg-lime-accent/[0.045]',
        exercise.optional && 'border-dashed'
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Lihat gerakan ${exercise.name}`}
          className="relative shrink-0 rounded-2xl transition-transform duration-200 active:scale-95"
        >
          <ExerciseMedia term={exercise.search} name={exercise.name} size={56} />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 grid place-items-center rounded-full bg-ink-800 border border-white/10 text-muted">
            <IconExpand size={11} />
          </span>
        </button>

        <button type="button" onClick={() => setOpen((o) => !o)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-muted tabular">{String(index + 1).padStart(2, '0')}</span>
            {exercise.isGymAlt && <Chip tone="lime">GYM</Chip>}
            {exercise.optional && <Chip>opsional</Chip>}
            {exercise.legSprinkle && <Chip tone="warn">leg</Chip>}
          </div>
          <p className={cx('text-[14px] font-bold leading-tight mt-0.5 line-clamp-2', allDone && 'text-lime-accent')}>
            {exercise.name}
          </p>
          <p className="text-[12px] text-muted mt-0.5">
            {target} set × {exercise.reps}
            {exercise.unit ? <span className="text-white/45"> {exercise.unit}</span> : null}
            <span className="mx-1.5 text-white/20">•</span>
            <span className="tabular">
              {doneCount}/{target}
            </span>
          </p>
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAll}
            aria-label={allDone ? 'Batalkan centang semua set' : 'Centang semua set'}
            className={cx(
              'w-10 h-10 grid place-items-center rounded-2xl transition-all duration-250 active:scale-92',
              allDone ? 'bg-lime-accent text-ink-900' : 'bg-white/6 text-muted hover:text-white hover:bg-white/12'
            )}
          >
            <IconCheck size={18} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Buka detail set"
            className="text-muted hover:text-white transition"
          >
            <IconChevronDown size={16} className={cx('transition-transform duration-300', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* strip progres set */}
      <div className="flex gap-1 px-3 pb-3">
        {Array.from({ length: Math.max(target, sets.length) }).map((_, i) => (
          <span
            key={i}
            className={cx(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              sets[i]?.done ? 'bg-lime-accent' : 'bg-white/8'
            )}
          />
        ))}
      </div>

      {open && (
        <div className="px-3 pb-3 anim-fade">
          {exercise.note && (
            <p className="flex gap-2 text-[12px] text-amber-200/85 bg-amber-400/8 rounded-xl px-3 py-2 mb-3 leading-relaxed">
              <IconInfo size={14} className="shrink-0 mt-0.5" />
              {exercise.note}
            </p>
          )}

          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10.5px] uppercase tracking-wider text-muted font-semibold">Set · reps · beban (kg)</span>
            <span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
              <IconTimer size={12} /> rest {restSec}s
            </span>
          </div>

          <div className="space-y-2">
            {sets.map((set, i) => (
              <div
                key={i}
                className={cx(
                  'flex items-center gap-2 rounded-2xl px-2.5 py-2 transition-colors duration-250',
                  set.done ? 'bg-lime-accent/10' : 'bg-ink-900/60'
                )}
              >
                <span
                  className={cx(
                    'w-6 h-6 shrink-0 grid place-items-center rounded-lg text-[11px] font-extrabold tabular',
                    set.done ? 'bg-lime-accent text-ink-900' : 'bg-white/6 text-muted'
                  )}
                >
                  {i + 1}
                </span>

                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={String(prefill(i, 'reps') || exercise.reps).slice(0, 5)}
                  value={set.reps}
                  onChange={(e) => actions.setSetField(exercise.id, i, 'reps', e.target.value)}
                  className="w-full min-w-0 bg-transparent border border-white/8 rounded-lg px-1.5 py-1.5 text-center tabular outline-none focus:border-lime-accent/60 transition"
                  aria-label={`Reps set ${i + 1}`}
                />
                <span className="text-white/20 text-xs">×</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder={String(prefill(i, 'weight') || 'kg')}
                  value={set.weight}
                  onChange={(e) => actions.setSetField(exercise.id, i, 'weight', e.target.value)}
                  className="w-full min-w-0 bg-transparent border border-white/8 rounded-lg px-1.5 py-1.5 text-center tabular outline-none focus:border-lime-accent/60 transition"
                  aria-label={`Beban set ${i + 1} (kg)`}
                />

                <button
                  type="button"
                  onClick={() => handleSetToggle(i)}
                  aria-label={set.done ? `Batalkan set ${i + 1}` : `Selesaikan set ${i + 1}`}
                  className={cx(
                    'w-9 h-9 shrink-0 grid place-items-center rounded-xl transition-all duration-200 active:scale-92',
                    set.done ? 'bg-lime-accent text-ink-900' : 'bg-white/6 text-muted hover:text-white'
                  )}
                >
                  <IconCheck size={15} />
                </button>
                {sets.length > target && (
                  <button
                    type="button"
                    onClick={() => actions.removeSet(exercise.id, i)}
                    className="w-7 h-9 grid place-items-center text-muted hover:text-red-300 transition"
                    aria-label={`Hapus set ${i + 1}`}
                  >
                    <IconTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <button
              type="button"
              onClick={() => actions.addSet(exercise.id)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-lime-accent transition"
            >
              <IconPlus size={14} /> Tambah set
            </button>
            {last && (
              <span className="text-[11px] text-muted">
                Terakhir {relativeLabel(last.date)}:{' '}
                <span className="text-white/80 font-semibold tabular">
                  {last.sets
                    .slice(0, 3)
                    .map((s) => `${s.reps || '-'}×${s.weight || '-'}kg`)
                    .join(', ')}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      <ExerciseMediaSheet exercise={exercise} restSec={restSec} onClose={() => setZoom(false)} open={zoom} />
    </Card>
  );
}
