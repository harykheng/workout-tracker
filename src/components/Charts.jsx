import { useMemo, useState } from 'react';
import { fromKey, formatShort, formatFull, diffDays } from '../lib/date.js';
import { cx } from './ui/Primitives.jsx';

const LIME = '#d4ff3d';

/* ------------------------------------------------------------ line chart */

/**
 * Grafik berat badan menuju target.
 * @param {{date,kg}[]} data  urut menaik
 */
export function WeightChart({ data = [], goalMin, goalMax, targetDate, height = 190 }) {
  const [hover, setHover] = useState(null);
  const W = 340;
  const H = height;
  const pad = { l: 34, r: 12, t: 14, b: 24 };

  const chart = useMemo(() => {
    if (!data.length) return null;
    const t0 = fromKey(data[0].date).getTime();
    const tEndCandidates = [fromKey(data[data.length - 1].date).getTime()];
    if (targetDate) tEndCandidates.push(fromKey(targetDate).getTime());
    const t1 = Math.max(...tEndCandidates);
    const spanMs = Math.max(1, t1 - t0);

    const values = data.map((d) => d.kg);
    const lo = Math.min(...values, goalMin ?? Infinity) - 1.5;
    const hi = Math.max(...values, goalMax ?? -Infinity) + 1.5;
    const range = Math.max(1, hi - lo);

    const x = (key) => pad.l + ((fromKey(key).getTime() - t0) / spanMs) * (W - pad.l - pad.r);
    const y = (kg) => pad.t + (1 - (kg - lo) / range) * (H - pad.t - pad.b);

    const points = data.map((d) => ({ ...d, cx: x(d.date), cy: y(d.kg) }));
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');
    const area = `${line} L${points[points.length - 1].cx.toFixed(1)},${H - pad.b} L${points[0].cx.toFixed(1)},${H - pad.b} Z`;

    const ticks = [hi, (hi + lo) / 2, lo].map((v) => ({ v, y: y(v) }));

    const guide =
      targetDate && goalMax
        ? `M${points[0].cx.toFixed(1)},${points[0].cy.toFixed(1)} L${x(targetDate).toFixed(1)},${y(goalMax).toFixed(1)}`
        : null;

    return {
      points,
      line,
      area,
      ticks,
      guide,
      bandTop: goalMax ? y(goalMax) : null,
      bandBottom: goalMin ? y(goalMin) : null,
    };
  }, [data, goalMin, goalMax, targetDate, H]);

  if (!chart) return null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Grafik berat badan">
        <defs>
          <linearGradient id="wt-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LIME} stopOpacity="0.28" />
            <stop offset="100%" stopColor={LIME} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid + label kg */}
        {chart.ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="rgba(255,255,255,.07)" strokeDasharray="3 5" />
            <text x={4} y={t.y + 3.5} fontSize="9" fill="#a0a0a0">
              {t.v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* zona target 90-95kg */}
        {chart.bandTop !== null && chart.bandBottom !== null && (
          <>
            <rect
              x={pad.l}
              y={chart.bandTop}
              width={W - pad.l - pad.r}
              height={Math.max(1, chart.bandBottom - chart.bandTop)}
              fill={LIME}
              opacity="0.1"
            />
            <line x1={pad.l} x2={W - pad.r} y1={chart.bandTop} y2={chart.bandTop} stroke={LIME} strokeOpacity=".5" strokeWidth="1" />
          </>
        )}

        {/* jalur ideal ke target */}
        {chart.guide && <path d={chart.guide} stroke="#ffffff" strokeOpacity=".22" strokeWidth="1.4" strokeDasharray="4 5" fill="none" />}

        <path d={chart.area} fill="url(#wt-area)" />
        <path d={chart.line} stroke={LIME} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {chart.points.map((p, i) => (
          <g key={p.date}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={i === chart.points.length - 1 ? 4.5 : 3}
              fill={i === chart.points.length - 1 ? LIME : '#121212'}
              stroke={LIME}
              strokeWidth="2"
            />
            <circle
              cx={p.cx}
              cy={p.cy}
              r="12"
              fill="transparent"
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover(p)}
            />
          </g>
        ))}

        <text x={pad.l} y={H - 6} fontSize="9" fill="#a0a0a0">
          {formatShort(data[0].date)}
        </text>
        <text x={W - pad.r} y={H - 6} fontSize="9" fill="#a0a0a0" textAnchor="end">
          {targetDate ? formatShort(targetDate) : formatShort(data[data.length - 1].date)}
        </text>
      </svg>

      {hover && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none px-2.5 py-1.5 rounded-xl bg-ink-900 border border-white/10 text-[11px] whitespace-nowrap anim-fade"
          style={{ left: `${(hover.cx / W) * 100}%`, top: `${(hover.cy / H) * height - 8}px` }}
        >
          <span className="font-bold text-lime-accent tabular">{hover.kg} kg</span>
          <span className="text-muted ml-1.5">{formatFull(hover.date)}</span>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- sparkline */

export function Sparkline({ values = [], width = 92, height = 30, color = LIME }) {
  if (values.length < 2) {
    return <div className="text-[11px] text-muted">butuh 2+ sesi</div>;
  }
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const range = hi - lo || 1;
  const step = width / (values.length - 1);
  const d = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - ((v - lo) / range) * (height - 4) - 2).toFixed(1)}`)
    .join(' ');
  const up = values[values.length - 1] >= values[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? color : '#f87171'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={width}
        cy={height - ((values[values.length - 1] - lo) / range) * (height - 4) - 2}
        r="2.6"
        fill={up ? color : '#f87171'}
      />
    </svg>
  );
}

/* -------------------------------------------------------------- bar chart */

export function VolumeBars({ items = [], max, className }) {
  const peak = max || Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={cx('flex items-end gap-1.5 h-24', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-full flex-1 flex items-end">
            <div
              className={cx('w-full rounded-t-md transition-all duration-500', item.value ? 'bg-lime-accent' : 'bg-white/8')}
              style={{ height: `${Math.max(item.value ? 6 : 3, (item.value / peak) * 100)}%` }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
          <span className="text-[9.5px] text-muted truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export { diffDays };
