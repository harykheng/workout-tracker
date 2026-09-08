import { useState } from 'react';
import { OVERLOAD_PRINCIPLES, GYM_PRINCIPLE } from '../data/schedule.js';
import { Card, cx } from './ui/Primitives.jsx';
import { IconBolt, IconChevronDown } from './ui/Icons.jsx';

/**
 * Reminder progressive overload — muncul di tiap sesi.
 * Versi rumah: 5 prinsip beban ringan. Versi gym: reps lebih rendah.
 */
export default function OverloadCard({ mode = 'home', defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const gym = mode === 'gym';

  return (
    <Card className="overflow-hidden border-lime-accent/20 bg-gradient-to-b from-lime-accent/[0.07] to-transparent">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-lime-accent text-ink-900">
          <IconBolt size={18} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold leading-tight">
            {gym ? 'Overload versi gym' : 'Overload dari teknik, bukan beban'}
          </span>
          <span className="block text-[11.5px] text-muted mt-0.5">
            {gym ? 'Beban berat = reps 8-15' : 'DB 5-10kg tetap bisa progres — begini caranya'}
          </span>
        </span>
        <IconChevronDown size={18} className={cx('text-muted transition-transform duration-300', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 anim-fade">
          {gym ? (
            <div className="rounded-2xl bg-ink-900/60 p-3.5">
              <p className="text-[13px] font-bold text-lime-accent">{GYM_PRINCIPLE.title}</p>
              <p className="text-[12.5px] text-muted leading-relaxed mt-1">{GYM_PRINCIPLE.text}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {OVERLOAD_PRINCIPLES.map((p, i) => (
                <li key={p.icon} className="flex gap-3 rounded-2xl bg-ink-900/50 p-3">
                  <span className="w-6 h-6 shrink-0 grid place-items-center rounded-lg bg-lime-accent/15 text-lime-accent text-[11px] font-extrabold">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold">{p.title}</span>
                    <span className="block text-[12px] text-muted leading-relaxed mt-0.5">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
