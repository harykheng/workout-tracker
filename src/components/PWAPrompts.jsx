import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Card, cx } from './ui/Primitives.jsx';
import { IconDownload, IconRefresh, IconX } from './ui/Icons.jsx';

/** Banner kecil saat versi baru sudah siap dipakai. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.warn('[pwa] service worker gagal didaftarkan', err);
    },
  });

  if (!needRefresh) return null;
  return (
    <div className="fixed top-3 inset-x-0 z-[60] px-4 anim-pop">
      <div className="mx-auto max-w-md flex items-center gap-3 rounded-2xl bg-lime-accent text-ink-900 px-4 py-3 shadow-[0_10px_40px_-10px_rgba(212,255,61,.5)]">
        <IconRefresh size={18} className="shrink-0" />
        <p className="flex-1 text-[13px] font-bold leading-tight">Versi baru siap dipakai</p>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-1.5 rounded-xl bg-ink-900 text-lime-accent text-[12px] font-bold"
        >
          Muat ulang
        </button>
        <button type="button" onClick={() => setNeedRefresh(false)} aria-label="Tutup" className="text-ink-900/60">
          <IconX size={16} />
        </button>
      </div>
    </div>
  );
}

/** Deteksi apakah app sudah jalan sebagai aplikasi terpasang. */
export function useInstalled() {
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onChange = (e) => setInstalled(e.matches);
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);
  return installed;
}

/**
 * Kartu "pasang aplikasi" di tab Profile.
 * Chrome/Edge menyediakan beforeinstallprompt; iOS Safari tidak punya API-nya,
 * jadi di sana yang ditampilkan langkah manual Share → Add to Home Screen.
 */
export function InstallCard() {
  const installed = useInstalled();
  const [deferred, setDeferred] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setDone(true));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (installed || done) {
    return (
      <Card className="p-4 border-lime-accent/25 bg-lime-accent/[0.05]">
        <p className="text-[13px] font-bold text-lime-accent">Sudah terpasang sebagai aplikasi</p>
        <p className="text-[12px] text-muted leading-relaxed mt-1">
          Jalan offline penuh — gambar gerakan, font, dan semua datamu tersimpan di perangkat ini.
        </p>
      </Card>
    );
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <Card className="p-4">
      <p className="text-[13px] font-bold">Pasang sebagai aplikasi</p>
      <p className="text-[12px] text-muted leading-relaxed mt-1">
        Buka dari home screen tanpa address bar, dan tetap jalan tanpa koneksi.
      </p>
      {deferred ? (
        <Button
          className="w-full mt-3"
          onClick={async () => {
            deferred.prompt();
            const { outcome } = await deferred.userChoice;
            if (outcome === 'accepted') setDone(true);
            setDeferred(null);
          }}
        >
          <IconDownload size={16} /> Pasang sekarang
        </Button>
      ) : (
        <ol className={cx('mt-3 space-y-1.5 text-[12px] text-muted leading-relaxed list-decimal pl-4')}>
          {isIOS ? (
            <>
              <li>Buka di Safari (bukan browser lain).</li>
              <li>
                Tap tombol <span className="text-white font-semibold">Share</span> di bawah.
              </li>
              <li>
                Pilih <span className="text-white font-semibold">Add to Home Screen</span>.
              </li>
            </>
          ) : (
            <>
              <li>Buka menu browser (titik tiga di kanan atas).</li>
              <li>
                Pilih <span className="text-white font-semibold">Install app</span> atau{' '}
                <span className="text-white font-semibold">Add to Home screen</span>.
              </li>
            </>
          )}
        </ol>
      )}
    </Card>
  );
}
