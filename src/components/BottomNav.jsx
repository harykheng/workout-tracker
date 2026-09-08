import { cx } from './ui/Primitives.jsx';
import { IconHome, IconDumbbell, IconChart, IconUser } from './ui/Icons.jsx';

const TABS = [
  { id: 'home', label: 'Home', icon: IconHome },
  { id: 'workouts', label: 'Workouts', icon: IconDumbbell },
  { id: 'progress', label: 'Progress', icon: IconChart },
  { id: 'profile', label: 'Profile', icon: IconUser },
];

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="flex items-center justify-between gap-1 rounded-3xl bg-ink-800/95 backdrop-blur-xl border border-white/8 px-2 py-2 shadow-[0_-6px_30px_rgba(0,0,0,.55)]">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300',
                  active ? 'text-ink-900' : 'text-muted hover:text-white'
                )}
              >
                <span
                  className={cx(
                    'absolute inset-0 rounded-2xl bg-lime-accent transition-all duration-300 origin-center',
                    active ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  )}
                />
                <span className="relative">
                  <t.icon size={20} />
                </span>
                <span className={cx('relative text-[10px] font-bold tracking-wide', !active && 'font-semibold')}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
