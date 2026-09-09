import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from './Icons.jsx';

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ Card */

export function Card({ className, as: Tag = 'div', ...rest }) {
  return <Tag className={cx('rounded-3xl bg-ink-800 border border-white/5', className)} {...rest} />;
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between mb-3 px-1">
      <h2 className="display text-[18px]">{children}</h2>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------- Button */

const VARIANTS = {
  primary: 'bg-lime-accent text-ink-900 hover:brightness-105 active:brightness-95 font-bold',
  ghost: 'bg-ink-700/70 text-white hover:bg-ink-600 font-semibold',
  outline: 'border border-white/12 text-white hover:bg-white/5 font-semibold',
  danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25 font-semibold',
  subtle: 'text-muted hover:text-white font-medium',
};

export function Button({ variant = 'primary', className, size = 'md', ...rest }) {
  const sizes = {
    sm: 'px-3 py-1.5 text-[13px] rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-2xl',
    lg: 'px-5 py-3.5 text-[15px] rounded-2xl',
  };
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none',
        VARIANTS[variant],
        sizes[size],
        className
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------- ProgressRing */

export function ProgressRing({
  value = 0,
  size = 150,
  stroke = 12,
  children,
  label,
  sublabel,
  color = 'var(--color-lime-accent)',
  track = 'rgba(255,255,255,0.08)',
  className,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = c - (pct / 100) * c;
  return (
    <div className={cx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        {children ?? (
          <>
            <span className="display-num text-[30px]">{Math.round(pct)}%</span>
            {label && <span className="mt-1 text-[11px] uppercase tracking-wider text-muted">{label}</span>}
            {sublabel && <span className="text-[11px] text-muted">{sublabel}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ StatCard */

export function StatCard({ icon: Icon, value, label, accent = false, className, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cx(
        'flex-1 rounded-2xl bg-ink-800 border border-white/5 px-3 py-3.5 flex flex-col items-center gap-1.5 min-w-0',
        onClick && 'transition active:scale-[0.97] hover:bg-ink-750 cursor-pointer',
        className
      )}
    >
      {Icon && (
        <span className={cx('grid place-items-center w-8 h-8 rounded-full', accent ? 'bg-lime-accent/15 text-lime-accent' : 'bg-white/5 text-muted')}>
          <Icon size={17} />
        </span>
      )}
      <span className="display-num text-[20px] truncate max-w-full">{value}</span>
      <span className="text-[10.5px] uppercase tracking-wider text-muted text-center leading-tight">{label}</span>
    </Tag>
  );
}

export function StatRow({ children, className }) {
  return <div className={cx('flex gap-2.5', className)}>{children}</div>;
}

/* -------------------------------------------------------------- Toggle */

export function Switch({ checked, onChange, label, hint, id }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 cursor-pointer select-none py-1">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted mt-0.5 leading-snug">{hint}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative shrink-0 w-12 h-7 rounded-full transition-colors duration-300',
          checked ? 'bg-lime-accent' : 'bg-ink-600'
        )}
      >
        <span
          className={cx(
            'absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  );
}

export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={cx('relative flex p-1 rounded-2xl bg-ink-900/70 border border-white/5', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cx(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-250',
              active ? 'bg-lime-accent text-ink-900 shadow-[0_2px_14px_rgba(212,255,61,.25)]' : 'text-muted hover:text-white'
            )}
          >
            {opt.icon && <opt.icon size={15} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Field */

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="block text-[11px] uppercase tracking-wider text-muted mb-1.5 font-semibold">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1.5">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...rest }) {
  return (
    <input
      className={cx(
        'w-full bg-ink-900/80 border border-white/8 rounded-xl px-3.5 py-2.5 text-white',
        'placeholder:text-white/25 outline-none focus:border-lime-accent/60 focus:ring-2 focus:ring-lime-accent/15 transition',
        className
      )}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }) {
  return (
    <select
      className={cx(
        'w-full bg-ink-900/80 border border-white/8 rounded-xl px-3.5 py-2.5 text-white outline-none',
        'focus:border-lime-accent/60 focus:ring-2 focus:ring-lime-accent/15 transition appearance-none',
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

/* --------------------------------------------------------------- Sheet */

export function Sheet({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  // Di-portal ke <body>: screen wrapper punya animasi (anim-screen) yang bikin
  // stacking context sendiri, jadi z-index sheet kalah sama bottom nav kalau
  // dirender in-place.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-md max-h-[88vh] overflow-y-auto no-scrollbar bg-ink-850 border border-white/8 rounded-t-3xl sm:rounded-3xl anim-sheet"
      >
        <div className="sticky top-0 z-10 bg-ink-850/95 backdrop-blur px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
          <h3 className="display text-[18px]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full bg-white/5 text-muted hover:text-white transition"
            aria-label="Tutup"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="sticky bottom-0 bg-ink-850/95 backdrop-blur px-5 py-3 border-t border-white/5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/* --------------------------------------------------------------- Toast */

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = (message, tone = 'ok') => {
    clearTimeout(timer.current);
    setToast({ message, tone });
    timer.current = setTimeout(() => setToast(null), 2800);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = toast ? (
    createPortal(
    <div className="fixed left-1/2 -translate-x-1/2 bottom-28 z-[80] anim-pop pointer-events-none">
      <div
        className={cx(
          'px-4 py-2.5 rounded-2xl text-[13px] font-semibold shadow-xl border',
          toast.tone === 'err'
            ? 'bg-red-500/90 text-white border-red-300/30'
            : 'bg-lime-accent text-ink-900 border-lime-accent'
        )}
      >
        {toast.message}
      </div>
    </div>,
    document.body
    )
  ) : null;
  return { show, node };
}

export function Chip({ children, tone = 'default', className }) {
  const tones = {
    default: 'bg-white/6 text-muted',
    lime: 'bg-lime-accent/15 text-lime-accent',
    warn: 'bg-amber-400/15 text-amber-300',
    danger: 'bg-red-500/15 text-red-300',
  };
  return (
    <span className={cx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      {Icon && (
        <span className="w-14 h-14 grid place-items-center rounded-2xl bg-white/5 text-muted mb-3">
          <Icon size={24} />
        </span>
      )}
      <p className="display text-[16px]">{title}</p>
      {text && <p className="text-[13px] text-muted mt-1.5 max-w-[36ch] leading-relaxed">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
