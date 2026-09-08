import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore.jsx';
import { fetchExerciseMedia, readCache } from '../lib/media.js';
import { localFrames } from '../data/exerciseImages.js';
import { cx } from './ui/Primitives.jsx';
import { IconImage } from './ui/Icons.jsx';

/* Satu ticker global buat semua kartu — bukan satu interval per gambar. */
const listeners = new Set();
let frameIndex = 0;
let ticker = null;

function subscribe(fn) {
  listeners.add(fn);
  if (!ticker) {
    ticker = setInterval(() => {
      frameIndex = (frameIndex + 1) % 2;
      listeners.forEach((l) => l(frameIndex));
    }, 900);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  };
}

function useFrameTick(enabled) {
  const [i, setI] = useState(frameIndex);
  useEffect(() => {
    if (!enabled) return undefined;
    return subscribe(setI);
  }, [enabled]);
  return i;
}

/**
 * Gambar gerakan. Urutan: bundel lokal (2 frame, dianimasikan) -> wger ->
 * ExerciseDB -> placeholder inisial. Tidak pernah melempar error.
 */
export default function ExerciseMedia({ term, name, size = 56, rounded = 'rounded-2xl', className }) {
  const { state, actions } = useStore();
  const frames = localFrames(term);
  const tick = useFrameTick(!!frames && frames.length > 1);

  const [media, setMedia] = useState(() => (frames ? null : readCache(state.media, term)));
  const [status, setStatus] = useState(() => (frames || readCache(state.media, term) ? 'done' : 'idle'));
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (frames) return undefined; // sudah ada di bundel, tidak perlu jaringan
    let alive = true;
    const cached = readCache(state.media, term);
    if (cached) {
      setMedia(cached);
      setStatus('done');
      return undefined;
    }
    if (!term) {
      setStatus('done');
      return undefined;
    }
    setStatus('loading');
    fetchExerciseMedia(term, { media: state.media, settings: state.settings, onCache: actions.cacheMedia }).then((res) => {
      if (!alive) return;
      setMedia(res);
      setStatus('done');
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const initials = (name || '?')
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={cx('relative shrink-0 overflow-hidden bg-white border border-white/6', rounded, className)}
      style={{ width: size, height: size }}
      title={name}
    >
      {frames ? (
        frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? name : ''}
            loading="lazy"
            aria-hidden={i !== 0}
            className={cx(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
              (frames.length === 1 ? 0 : tick) === i ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))
      ) : media?.url && !broken ? (
        <img
          src={media.url}
          alt={name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover anim-fade"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-ink-700/60">
          {status === 'loading' ? (
            <span className="w-full h-full animate-pulse bg-white/5" />
          ) : (
            <span className="flex flex-col items-center justify-center text-muted gap-0.5">
              {size >= 64 ? <IconImage size={18} /> : null}
              <span className="text-[11px] font-bold tracking-wide text-white/50">{initials}</span>
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function MediaSourceBadge({ term }) {
  const { state } = useStore();
  if (localFrames(term)) return <span className="text-[10px] uppercase tracking-wider text-muted">bundled</span>;
  const hit = readCache(state.media, term);
  if (!hit?.url) return null;
  return <span className="text-[10px] uppercase tracking-wider text-muted">via {hit.source}</span>;
}
