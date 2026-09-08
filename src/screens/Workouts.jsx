import { useMemo, useState } from 'react';
import { CYCLE_DAYS, SPECIAL_DAYS, getDay, resolveExercises, requiredSetCount } from '../data/schedule.js';
import { useStore } from '../hooks/useStore.jsx';
import { resolveTodayDayId, sessionSetStats } from '../lib/stats.js';
import { relativeLabel, fmtDuration, todayKey } from '../lib/date.js';
import { Card, Chip, SectionTitle, Button, cx, EmptyState } from '../components/ui/Primitives.jsx';
import { DAY_ICONS, IconChevronRight, IconCheck, IconTimer, IconLayers, IconTrash, IconCalendar } from '../components/ui/Icons.jsx';

export default function Workouts({ onOpenDay }) {
  const { state, actions } = useStore();
  const [tab, setTab] = useState('plan');
  const autoId = resolveTodayDayId(state);

  const recent = useMemo(() => state.sessions.slice(0, 30), [state.sessions]);

  return (
    <div className="anim-screen space-y-5">
      <header className="pt-1">
        <h1 className="display text-[27px]">Workouts</h1>
        <p className="text-[13px] text-muted mt-0.5">Siklus 4 hari + hari di luar siklus</p>
      </header>

      <div className="flex p-1 rounded-2xl bg-ink-800 border border-white/5">
        {[
          { id: 'plan', label: 'Program' },
          { id: 'history', label: 'Riwayat sesi' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cx(
              'flex-1 py-2 rounded-xl text-[13px] font-bold transition-all duration-250',
              tab === t.id ? 'bg-lime-accent text-ink-900' : 'text-muted hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plan' ? (
        <div className="space-y-5 anim-fade">
          <section>
            <SectionTitle>Siklus 4 hari</SectionTitle>
            <div className="space-y-2.5 anim-stagger">
              {CYCLE_DAYS.map((day) => {
                const Icon = DAY_ICONS[day.id];
                const mode = state.prefs.modeByDay[day.id] || 'home';
                const isNext = day.id === autoId;
                const lastDone = state.sessions.find((s) => s.dayId === day.id && s.completed);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => onOpenDay(day.id)}
                    className={cx(
                      'w-full flex items-center gap-3 rounded-3xl border p-3.5 text-left transition active:scale-[0.99]',
                      isNext ? 'bg-lime-accent/8 border-lime-accent/30' : 'bg-ink-800 border-white/5 hover:bg-ink-750'
                    )}
                  >
                    <span
                      className={cx(
                        'w-12 h-12 shrink-0 grid place-items-center rounded-2xl',
                        isNext ? 'bg-lime-accent text-ink-900' : 'bg-white/6 text-muted'
                      )}
                    >
                      <Icon size={22} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Hari {day.num}</span>
                        {isNext && <Chip tone="lime">berikutnya</Chip>}
                        {day.hasGym && mode === 'gym' && <Chip>gym</Chip>}
                      </span>
                      <span className="display block text-[16px] mt-0.5 truncate">{day.title}</span>
                      <span className="block text-[11.5px] text-muted mt-0.5">
                        {resolveExercises(day, { mode }).length} gerakan · {requiredSetCount(day, { mode })} set
                        {lastDone ? ` · terakhir ${relativeLabel(lastDone.date)}` : ' · belum pernah'}
                      </span>
                    </span>
                    <IconChevronRight size={18} className="text-muted shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionTitle>Di luar siklus</SectionTitle>
            <div className="space-y-2.5">
              {SPECIAL_DAYS.map((day) => {
                const Icon = DAY_ICONS[day.id];
                const last = state.sessions.find((s) => s.dayId === day.id && s.completed);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => onOpenDay(day.id)}
                    className="w-full flex items-center gap-3 rounded-3xl bg-ink-800 border border-white/5 p-3.5 text-left hover:bg-ink-750 transition active:scale-[0.99]"
                  >
                    <span
                      className={cx(
                        'w-12 h-12 shrink-0 grid place-items-center rounded-2xl',
                        day.id === 'padel' ? 'bg-amber-400/15 text-amber-300' : 'bg-sky-400/15 text-sky-300'
                      )}
                    >
                      <Icon size={22} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="display block text-[16px]">{day.title}</span>
                      <span className="block text-[11.5px] text-muted mt-0.5 truncate">
                        {day.blurb}
                        {last ? ` · terakhir ${relativeLabel(last.date)}` : ''}
                      </span>
                    </span>
                    <IconChevronRight size={18} className="text-muted shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-2.5 anim-fade">
          {recent.length === 0 ? (
            <EmptyState
              icon={IconCalendar}
              title="Belum ada sesi tercatat"
              text="Mulai workout pertama dari tab Home — semua set, beban, dan durasi bakal masuk ke sini."
            />
          ) : (
            recent.map((s) => <SessionRow key={s.id} session={s} onDelete={() => actions.deleteSession(s.id)} />)
          )}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const day = getDay(session.dayId);
  const Icon = DAY_ICONS[session.dayId] || IconLayers;
  const stats = sessionSetStats(session);
  const isToday = session.date === todayKey();

  return (
    <Card className="p-3 flex items-center gap-3">
      <span
        className={cx(
          'w-11 h-11 shrink-0 grid place-items-center rounded-2xl',
          session.special
            ? session.dayId === 'padel'
              ? 'bg-amber-400/15 text-amber-300'
              : 'bg-sky-400/15 text-sky-300'
            : 'bg-lime-accent/15 text-lime-accent'
        )}
      >
        <Icon size={20} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold truncate">
          {day?.special ? day.title : `Hari ${day?.num} — ${day?.title || session.dayId}`}
        </p>
        <p className="text-[11.5px] text-muted flex items-center gap-2 flex-wrap mt-0.5">
          <span>{isToday ? 'Hari ini' : relativeLabel(session.date)}</span>
          {session.durationSec > 0 && (
            <span className="inline-flex items-center gap-1 tabular">
              <IconTimer size={11} /> {fmtDuration(session.durationSec)}
            </span>
          )}
          {!session.special && (
            <span className="inline-flex items-center gap-1 tabular">
              <IconLayers size={11} /> {stats.done} set
            </span>
          )}
          {session.mode === 'gym' && !session.special && <Chip tone="lime">gym</Chip>}
          {session.meta?.intensity && <Chip>{session.meta.intensity}</Chip>}
        </p>
      </div>
      {confirm ? (
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" variant="danger" onClick={onDelete}>
            Hapus
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
            Batal
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-7 h-7 grid place-items-center rounded-full bg-lime-accent/15 text-lime-accent">
            <IconCheck size={14} />
          </span>
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="w-7 h-7 grid place-items-center rounded-full text-muted hover:text-red-300 transition"
            aria-label="Hapus sesi"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </Card>
  );
}
