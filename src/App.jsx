import { Component, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './hooks/useStore.jsx';
import { RestTimerProvider } from './hooks/useRestTimer.jsx';
import BottomNav from './components/BottomNav.jsx';
import RestTimerBar from './components/RestTimerBar.jsx';
import Home from './screens/Home.jsx';
import Workouts from './screens/Workouts.jsx';
import Progress from './screens/Progress.jsx';
import Profile from './screens/Profile.jsx';
import WorkoutDetail from './screens/WorkoutDetail.jsx';
import { useElapsed } from './hooks/useStore.jsx';
import { fmtDuration } from './lib/date.js';
import { getDay } from './data/schedule.js';
import { IconPlay } from './components/ui/Icons.jsx';

function Shell() {
  const { state } = useStore();
  const [tab, setTab] = useState('home');
  const [detail, setDetail] = useState(null); // dayId yang lagi dibuka

  const openDay = (dayId) => {
    setDetail(dayId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goTab = (next) => {
    setDetail(null);
    setTab(next);
    window.scrollTo({ top: 0 });
  };

  // sesi aktif yang ditinggal -> tombol lanjut melayang
  const active = state.active;

  return (
    <RestTimerProvider settings={state.settings}>
      <div className="min-h-screen bg-ink-900 text-white">
        <main className="mx-auto max-w-md px-4 pt-4 pb-32">
          {detail ? (
            <WorkoutDetail key={detail} dayId={detail} onBack={() => setDetail(null)} />
          ) : (
            <>
              {tab === 'home' && <Home key="home" onOpenDay={openDay} onGoTab={goTab} />}
              {tab === 'workouts' && <Workouts key="workouts" onOpenDay={openDay} />}
              {tab === 'progress' && <Progress key="progress" />}
              {tab === 'profile' && <Profile key="profile" />}
            </>
          )}
        </main>

        {/* stack melayang di atas bottom nav: rest timer + tombol lanjut sesi */}
        <div className="fixed bottom-[92px] inset-x-0 z-[45] px-4 pointer-events-none">
          <div className="mx-auto max-w-md space-y-2">
            <RestTimerBar />
            {active && !detail && <ResumeBar active={active} onOpen={() => openDay(active.dayId)} />}
          </div>
        </div>
        <BottomNav tab={detail ? 'workouts' : tab} onChange={goTab} />
      </div>
    </RestTimerProvider>
  );
}

function ResumeBar({ active, onOpen }) {
  const elapsed = useElapsed(active);
  const day = getDay(active.dayId);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full anim-pop pointer-events-auto"
      aria-label="Lanjutkan sesi berjalan"
    >
      <span className="flex items-center gap-3 rounded-3xl bg-lime-accent text-ink-900 px-4 py-3 shadow-[0_10px_40px_-10px_rgba(212,255,61,.5)]">
        <span className="w-9 h-9 grid place-items-center rounded-full bg-ink-900 text-lime-accent shrink-0">
          <IconPlay size={15} />
        </span>
        <span className="flex-1 min-w-0 text-left">
          <span className="block text-[10.5px] font-extrabold uppercase tracking-wider opacity-70">
            {active.running ? 'Sesi berjalan' : 'Sesi dijeda'}
          </span>
          <span className="display block text-[15px] truncate">{day?.title || 'Workout'}</span>
        </span>
        <span className="timer-num text-[20px]">{fmtDuration(elapsed)}</span>
      </span>
    </button>
  );
}

/** Jaga-jaga: satu error di sub-tree gak boleh bikin layar putih. */
class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[app] render error', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-ink-900 text-white grid place-items-center p-8 text-center">
          <div>
            <p className="text-lg font-extrabold">Ada yang error di tampilan</p>
            <p className="text-[13px] text-muted mt-2 max-w-[38ch]">
              Data kamu aman di localStorage. Coba reload halaman — kalau masih error, export JSON lewat tab Profile di
              browser lain.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 px-5 py-3 rounded-2xl bg-lime-accent text-ink-900 font-bold"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    document.documentElement.style.background = '#0a0a0a';
  }, []);
  return (
    <Boundary>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </Boundary>
  );
}
