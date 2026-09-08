import { useMemo, useState } from 'react';
import { monthGrid, monthName, todayKey, fromKey } from '../lib/date.js';
import { activityByDate } from '../lib/stats.js';
import { Card, cx } from './ui/Primitives.jsx';
import { IconChevronLeft, IconChevronRight } from './ui/Icons.jsx';

const DOW = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

const KIND = {
  cycle: { dot: 'bg-lime-accent', label: 'Workout' },
  padel: { dot: 'bg-amber-400', label: 'Padel' },
  swim: { dot: 'bg-sky-400', label: 'Swim' },
  custom: { dot: 'bg-violet-400', label: 'Lainnya' },
};

function kindOf(sessions) {
  if (sessions.some((s) => !s.special)) return 'cycle';
  if (sessions.some((s) => s.dayId === 'padel')) return 'padel';
  if (sessions.some((s) => s.dayId === 'swim')) return 'swim';
  return 'custom';
}

export default function HistoryCalendar({ sessions, onPickDate }) {
  const today = todayKey();
  const now = fromKey(today);
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const byDate = useMemo(() => activityByDate(sessions), [sessions]);
  const cells = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);

  const monthStats = useMemo(() => {
    let active = 0;
    let missed = 0;
    for (const key of cells) {
      if (!key || key > today) continue;
      if (byDate.has(key)) active += 1;
      else missed += 1;
    }
    return { active, missed };
  }, [cells, byDate, today]);

  const shift = (delta) => {
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="w-8 h-8 grid place-items-center rounded-xl bg-white/5 text-muted hover:text-white transition"
          aria-label="Bulan sebelumnya"
        >
          <IconChevronLeft size={16} />
        </button>
        <div className="text-center">
          <p className="text-[15px] font-bold">
            {monthName(cursor.m)} {cursor.y}
          </p>
          <p className="text-[11px] text-muted tabular">
            {monthStats.active} hari aktif · {monthStats.missed} bolong
          </p>
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          className="w-8 h-8 grid place-items-center rounded-xl bg-white/5 text-muted hover:text-white transition"
          aria-label="Bulan berikutnya"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d, i) => (
          <span key={i} className="text-center text-[10px] font-bold text-muted/70 py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((key, i) => {
          if (!key) return <span key={`e${i}`} />;
          const list = byDate.get(key) || [];
          const active = list.length > 0;
          const kind = active ? kindOf(list) : null;
          const isToday = key === today;
          const future = key > today;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPickDate?.(key, list)}
              className={cx(
                'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-[11.5px] font-semibold transition-all duration-200 active:scale-92',
                active ? 'bg-white/7 text-white' : future ? 'text-white/20' : 'text-white/45 hover:bg-white/5',
                isToday && 'ring-2 ring-lime-accent/70'
              )}
            >
              <span className="tabular leading-none">{fromKey(key).getDate()}</span>
              <span
                className={cx(
                  'w-1.5 h-1.5 rounded-full',
                  active ? KIND[kind].dot : future ? 'bg-transparent' : 'bg-white/12'
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-3.5 pt-3 border-t border-white/5 flex-wrap">
        {Object.entries(KIND).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[10.5px] text-muted">
            <span className={cx('w-2 h-2 rounded-full', v.dot)} />
            {v.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
