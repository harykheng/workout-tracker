import ExerciseMedia from './ExerciseMedia.jsx';
import { localFrames } from '../data/exerciseImages.js';
import { Sheet, Chip, cx } from './ui/Primitives.jsx';
import { IconInfo, IconTimer, IconLayers } from './ui/Icons.jsx';

/**
 * Tampilan besar gerakan: dua frame (posisi awal ↔ akhir) dianimasikan,
 * plus target set/reps dan catatan tekniknya.
 */
export default function ExerciseMediaSheet({ exercise, restSec, onClose, open = true }) {
  if (!exercise || !open) return null;
  const frames = localFrames(exercise.search);

  return (
    <Sheet open={open} onClose={onClose} title={exercise.name}>
      <ExerciseMedia
        term={exercise.search}
        name={exercise.name}
        fill
        intervalMs={700}
        rounded="rounded-2xl"
        className="mb-3"
      />

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Chip tone="lime">
          <IconLayers size={12} /> {exercise.sets} set × {exercise.reps}
          {exercise.unit ? ` ${exercise.unit}` : ''}
        </Chip>
        {restSec ? (
          <Chip>
            <IconTimer size={12} /> rest {restSec}s
          </Chip>
        ) : null}
        {exercise.isGymAlt && <Chip tone="lime">versi gym</Chip>}
        {exercise.legSprinkle && <Chip tone="warn">leg sempilan</Chip>}
      </div>

      {exercise.note && (
        <p className="flex gap-2 text-[12.5px] text-amber-200/85 bg-amber-400/8 rounded-xl px-3 py-2.5 leading-relaxed mb-3">
          <IconInfo size={14} className="shrink-0 mt-0.5" />
          {exercise.note}
        </p>
      )}

      <p className={cx('text-[11.5px] text-muted leading-relaxed')}>
        {frames?.length > 1
          ? 'Gambar berganti antara posisi awal dan posisi akhir gerakan — ikutin ritmenya, jangan buru-buru.'
          : 'Belum ada gambar buat gerakan ini, jadi yang tampil inisial namanya.'}
      </p>
    </Sheet>
  );
}
