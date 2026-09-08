import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const RestCtx = createContext(null);

/** Beep pakai WebAudio — tanpa file audio, aman kalau browser blokir. */
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [0, 0.18, 0.36].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 2 ? 1046 : 784, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    /* audio tidak tersedia — abaikan */
  }
}

function vibrate() {
  try {
    navigator.vibrate?.([120, 80, 120, 80, 220]);
  } catch {
    /* vibration tidak didukung */
  }
}

export function RestTimerProvider({ settings, children }) {
  const [timer, setTimer] = useState(null); // { endsAt, duration, label }
  const [remaining, setRemaining] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const firedRef = useRef(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!timer) return undefined;
    firedRef.current = false;
    const tick = () => {
      const left = Math.max(0, Math.round((timer.endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        if (settingsRef.current?.restSound) beep();
        if (settingsRef.current?.restVibrate) vibrate();
        setJustFinished(true);
        setTimeout(() => setJustFinished(false), 4000);
        setTimeout(() => setTimer((t) => (t === timer ? null : t)), 2500);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [timer]);

  const api = useMemo(
    () => ({
      timer,
      remaining,
      justFinished,
      running: !!timer && remaining > 0,
      start(seconds, label = 'Istirahat') {
        const dur = Math.max(5, Math.round(Number(seconds) || settingsRef.current?.defaultRestSec || 60));
        setTimer({ endsAt: Date.now() + dur * 1000, duration: dur, label });
        setRemaining(dur);
      },
      stop() {
        setTimer(null);
        setRemaining(0);
      },
      adjust(delta) {
        setTimer((t) => {
          if (!t) return t;
          const endsAt = Math.max(Date.now(), t.endsAt + delta * 1000);
          return { ...t, endsAt, duration: Math.max(5, t.duration + delta) };
        });
      },
    }),
    [timer, remaining, justFinished]
  );

  return <RestCtx.Provider value={api}>{children}</RestCtx.Provider>;
}

export function useRestTimer() {
  const ctx = useContext(RestCtx);
  if (!ctx) throw new Error('useRestTimer harus dipakai di dalam <RestTimerProvider>');
  return ctx;
}

export { beep as previewBeep };

export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  const cb = useCallback(() => setNow(Date.now()), []);
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(cb, intervalMs);
    return () => clearInterval(id);
  }, [cb, intervalMs, enabled]);
  return now;
}
