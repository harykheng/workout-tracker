import { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore.jsx';
import { fetchExerciseMedia, readCache } from '../lib/media.js';
import { cx } from './ui/Primitives.jsx';
import { IconImage } from './ui/Icons.jsx';

/**
 * Gambar/GIF gerakan dengan rantai fallback:
 * cache -> wger -> ExerciseDB -> placeholder ikon + nama.
 * Komponen ini sengaja tidak pernah melempar error.
 */
export default function ExerciseMedia({ term, name, size = 56, rounded = 'rounded-2xl', className }) {
  const { state, actions } = useStore();
  const [media, setMedia] = useState(() => readCache(state.media, term));
  const [status, setStatus] = useState(() => (readCache(state.media, term) ? 'done' : 'idle'));
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let alive = true;
    const cached = readCache(state.media, term);
    if (cached) {
      setMedia(cached);
      setStatus('done');
      return () => {
        alive = false;
      };
    }
    if (!term) {
      setStatus('done');
      return () => {
        alive = false;
      };
    }
    setStatus('loading');
    fetchExerciseMedia(term, {
      media: state.media,
      settings: state.settings,
      onCache: actions.cacheMedia,
    }).then((res) => {
      if (!alive) return;
      setMedia(res);
      setStatus('done');
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const showImage = media?.url && !broken;
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
      className={cx('relative shrink-0 overflow-hidden bg-ink-700/60 border border-white/6 grid place-items-center', rounded, className)}
      style={{ width: size, height: size }}
      title={name}
    >
      {status === 'loading' && !showImage && <span className="absolute inset-0 animate-pulse bg-white/5" />}
      {showImage ? (
        <img
          src={media.url}
          alt={name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover bg-white anim-fade"
        />
      ) : (
        status !== 'loading' && (
          <span className="flex flex-col items-center justify-center text-muted gap-0.5">
            {size >= 64 ? <IconImage size={18} /> : null}
            <span className="text-[11px] font-bold tracking-wide text-white/50">{initials}</span>
          </span>
        )
      )}
    </div>
  );
}

export function MediaSourceBadge({ term }) {
  const { state } = useStore();
  const hit = readCache(state.media, term);
  if (!hit?.url) return null;
  return <span className="text-[10px] uppercase tracking-wider text-muted">via {hit.source}</span>;
}
