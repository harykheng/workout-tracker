import { useRestTimer } from '../hooks/useRestTimer.jsx';
import { cx } from './ui/Primitives.jsx';
import { IconX, IconPlus, IconMinus } from './ui/Icons.jsx';
import { fmtDuration } from '../lib/date.js';

/** Bar rest timer melayang di atas bottom nav. */
export default function RestTimerBar() {
  const rest = useRestTimer();
  if (!rest.timer) return null;

  const pct = rest.timer.duration ? (rest.remaining / rest.timer.duration) * 100 : 0;
  const done = rest.remaining <= 0;

  return (
    <div className="w-full">
      <div
        className={cx(
          'rounded-3xl border overflow-hidden pointer-events-auto anim-pop shadow-[0_10px_40px_rgba(0,0,0,.6)]',
          done ? 'bg-lime-accent border-lime-accent text-ink-900 pulse-ring' : 'bg-ink-800/97 backdrop-blur-xl border-white/10'
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className={cx('text-[10.5px] uppercase tracking-wider font-bold', done ? 'text-ink-900/70' : 'text-muted')}>
              {done ? 'Istirahat selesai — gas set berikutnya' : rest.timer.label}
            </p>
            <p className={cx('display-num text-[30px] mt-1', !done && 'text-lime-accent')}>
              {fmtDuration(rest.remaining)}
            </p>
          </div>

          {!done && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => rest.adjust(-15)}
                className="w-9 h-9 grid place-items-center rounded-full bg-white/6 text-white hover:bg-white/12 transition active:scale-95"
                aria-label="Kurangi 15 detik"
              >
                <IconMinus size={16} />
              </button>
              <button
                type="button"
                onClick={() => rest.adjust(15)}
                className="w-9 h-9 grid place-items-center rounded-full bg-white/6 text-white hover:bg-white/12 transition active:scale-95"
                aria-label="Tambah 15 detik"
              >
                <IconPlus size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={rest.stop}
            className={cx(
              'w-9 h-9 grid place-items-center rounded-full transition active:scale-95',
              done ? 'bg-ink-900/15 text-ink-900 hover:bg-ink-900/25' : 'bg-white/6 text-muted hover:text-white hover:bg-white/12'
            )}
            aria-label="Tutup rest timer"
          >
            <IconX size={16} />
          </button>
        </div>
        {!done && (
          <div className="h-1 bg-white/8">
            <div
              className="h-full bg-lime-accent transition-[width] duration-250 ease-linear"
              style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
