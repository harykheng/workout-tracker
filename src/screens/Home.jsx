import { useMemo, useState } from 'react';
import { CYCLE_DAYS, SPECIAL_DAYS, getDay, resolveExercises, requiredSetCount } from '../data/schedule.js';
import { useStore } from '../hooks/useStore.jsx';
import { resolveTodayDayId, cyclePosition, computeStreak, weekSummary, weightStats, sessionProgress, sessionSetStats } from '../lib/stats.js';
import { todayKey, formatLong, fmtDurationShort, fmtDuration, diffDays } from '../lib/date.js';
import { Button, Card, Chip, ProgressRing, StatCard, StatRow, Segmented, Sheet, SectionTitle, cx } from '../components/ui/Primitives.jsx';
import {
  IconArrowRight, IconFlame, IconTimer, IconLayers, IconRacket, IconWaves, IconCheck,
  IconRefresh, IconScale, IconSteam, IconWarn, DAY_ICONS, IconHome, IconDumbbell,
} from '../components/ui/Icons.jsx';
import ExerciseMedia from '../components/ExerciseMedia.jsx';

export default function Home({ onOpenDay, onGoTab }) {
  const { state, actions } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [specialSheet, setSpecialSheet] = useState(null);

  const today = todayKey();
  const dayId = resolveTodayDayId(state);
  const day = getDay(dayId) || CYCLE_DAYS[0];
  const pos = cyclePosition(dayId);
  const manual = !!state.prefs.manualDayId;

  const mode = state.active?.dayId === dayId ? state.active.mode : state.prefs.modeByDay[dayId] || 'home';
  const streak = useMemo(() => computeStreak(state.sessions), [state.sessions]);
  const week = useMemo(() => weekSummary(state.sessions), [state.sessions]);
  const weight = useMemo(() => weightStats(state), [state]);

  const todaySessions = state.sessions.filter((s) => s.date === today && s.completed);
  const activeToday = state.active?.date === today ? state.active : null;
  const doneSessionForDay = todaySessions.find((s) => s.dayId === dayId);
  const shownSession = activeToday?.dayId === dayId ? activeToday : doneSessionForDay;
  const progress = shownSession ? sessionProgress(shownSession, day) : { pct: 0, done: 0, total: 0 };

  const exercises = day.special ? [] : resolveExercises(day, { mode, skipLegSprinkle: false, includeCore: false });
  const totalSets = day.special ? 0 : requiredSetCount(day, { mode });

  const recentPadel = state.sessions.find((s) => s.dayId === 'padel' && s.completed);
  const padelRecently = recentPadel ? diffDays(today, recentPadel.date) <= 2 : false;

  return (
    <div className="anim-screen space-y-5">
      {/* ---------------------------------------------------------- header */}
      <header className="flex items-start justify-between gap-3 pt-1">
        <div className="min-w-0">
          <p className="text-[13px] text-muted">{formatLong(today)}</p>
          <h1 className="display text-[34px] mt-1">Hi {state.profile.name || 'there'},</h1>
          <p className="text-[14px] text-muted leading-snug">Ready to crush your goals today?</p>
        </div>
        <button
          type="button"
          onClick={() => onGoTab('profile')}
          className="display w-12 h-12 shrink-0 grid place-items-center rounded-2xl bg-lime-accent text-ink-900 text-[22px] pt-0.5"
          aria-label="Buka profil"
        >
          {(state.profile.name || 'H').slice(0, 1).toUpperCase()}
        </button>
      </header>

      {/* ------------------------------------------------------ hero rings */}
      <Card className="p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={progress.pct} size={132} stroke={11}>
            <span className="display-num text-[40px]">{progress.pct}%</span>
            <span className="text-[10.5px] uppercase tracking-wider text-muted mt-1">
              {day.special ? 'Hari aktif' : 'Sesi hari ini'}
            </span>
          </ProgressRing>

          <div className="flex-1 min-w-0 space-y-3">
            <MiniRing
              value={Math.min(100, (streak.current / 7) * 100)}
              big={streak.current}
              label="Hari streak"
              icon={IconFlame}
            />
            <MiniRing
              value={weight.pct}
              big={`${weight.current}`}
              suffix="kg"
              label={`Target ${weight.goalMin}-${weight.goal}kg`}
              icon={IconScale}
            />
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------ stat cards */}
      <StatRow>
        <StatCard icon={IconLayers} value={week.sets} label="Set / 7 hari" accent />
        <StatCard icon={IconTimer} value={fmtDurationShort(week.totalSec)} label="Durasi" />
        <StatCard icon={IconFlame} value={`${week.activeDays}/7`} label="Hari aktif" />
      </StatRow>

      {/* -------------------------------------------------------- CTA card */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenDay(dayId)}
          className="w-full text-left rounded-3xl p-5 bg-gradient-to-br from-lime-accent to-[#a8e000] text-ink-900 transition-transform duration-200 active:scale-[0.985] shadow-[0_10px_40px_-12px_rgba(212,255,61,.45)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-ink-900/15 px-2 py-0.5 rounded-full">
                  {day.special ? 'Non-siklus' : `Hari ${day.num} / ${pos?.total ?? 4}`}
                </span>
                {manual && (
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-ink-900/15 px-2 py-0.5 rounded-full">
                    manual
                  </span>
                )}
              </div>
              <p className="display text-[32px] mt-2.5">{day.title}</p>
              <p className="text-[13px] font-semibold opacity-70 mt-0.5">
                {day.special
                  ? day.blurb
                  : `${exercises.length} gerakan · ${totalSets} set · ${mode === 'gym' ? 'versi gym' : 'versi rumah'}`}
              </p>
            </div>
            <span className="w-12 h-12 shrink-0 grid place-items-center rounded-full bg-ink-900 text-lime-accent">
              <IconArrowRight size={20} />
            </span>
          </div>
          <p className="mt-4 text-[13px] font-extrabold uppercase tracking-wide">
            {activeToday?.dayId === dayId ? 'Lanjutkan sesi →' : doneSessionForDay ? 'Lihat / ulangi sesi →' : 'Start workout →'}
          </p>
        </button>
      </div>

      {/* ----------------------------------------------- kontrol hari & mode */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-ink-800 border border-white/6 px-3 py-3 text-[13px] font-semibold hover:bg-ink-750 transition"
        >
          <IconRefresh size={15} className="text-lime-accent" />
          {manual ? 'Ganti hari' : 'Aku pilih hari sendiri'}
        </button>
        {manual && (
          <Button variant="ghost" onClick={() => actions.setManualDay(null)} className="px-4">
            Auto
          </Button>
        )}
      </div>

      {day.hasGym && (
        <Segmented
          value={mode}
          onChange={(m) => actions.setDayMode(dayId, m)}
          options={[
            { value: 'home', label: 'Rumah', icon: IconHome },
            { value: 'gym', label: 'Gym', icon: IconDumbbell },
          ]}
        />
      )}

      {/* peringatan padel untuk Hari 4 */}
      {day.padelWarning && padelRecently && (
        <Card className="p-3.5 border-amber-400/25 bg-amber-400/[0.06] flex gap-3">
          <IconWarn size={18} className="text-amber-300 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-100/90 leading-relaxed">{day.padelWarning}</p>
        </Card>
      )}

      {/* ------------------------------------------------ daftar gerakan hari ini */}
      {!day.special && (
        <section>
          <SectionTitle
            action={
              <span className="text-[12px] text-muted tabular">
                {progress.done}/{progress.total || totalSets} set
              </span>
            }
          >
            Gerakan hari ini
          </SectionTitle>
          <div className="space-y-2 anim-stagger">
            {exercises.map((ex) => {
              const sets = shownSession?.entries?.[ex.id]?.sets || [];
              const done = sets.length >= ex.sets && sets.slice(0, ex.sets).every((s) => s.done);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onOpenDay(dayId)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-ink-800 border border-white/5 p-2.5 text-left hover:bg-ink-750 transition"
                >
                  <ExerciseMedia term={ex.search} name={ex.name} size={46} rounded="rounded-xl" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-bold truncate">{ex.name}</span>
                    <span className="block text-[11.5px] text-muted">
                      {ex.sets} × {ex.reps} {ex.unit || ''} {ex.isGymAlt ? '· gym' : ''}
                    </span>
                  </span>
                  <span
                    className={cx(
                      'w-7 h-7 shrink-0 grid place-items-center rounded-full',
                      done ? 'bg-lime-accent text-ink-900' : 'bg-white/6 text-white/25'
                    )}
                  >
                    <IconCheck size={14} />
                  </span>
                </button>
              );
            })}
          </div>
          {day.footer && (
            <div className="flex items-center gap-2.5 mt-3 px-1 text-[12px] text-muted">
              <IconSteam size={16} className="text-lime-accent/70 shrink-0" />
              {day.footer}
            </div>
          )}
        </section>
      )}

      {/* --------------------------------------------- selesai hari ini */}
      {todaySessions.length > 0 && (
        <section>
          <SectionTitle>Selesai hari ini</SectionTitle>
          <div className="space-y-2">
            {todaySessions.map((s) => {
              const d = getDay(s.dayId);
              const Icon = DAY_ICONS[s.dayId] || IconCheck;
              const st = sessionSetStats(s);
              return (
                <Card key={s.id} className="p-3 flex items-center gap-3 border-lime-accent/25 bg-lime-accent/[0.05]">
                  <span className="w-10 h-10 shrink-0 grid place-items-center rounded-xl bg-lime-accent text-ink-900">
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-bold truncate">
                      {d?.special ? d.title : `Hari ${d?.num} — ${d?.title || s.dayId}`}
                    </span>
                    <span className="block text-[11.5px] text-muted tabular">
                      {s.durationSec ? `${fmtDuration(s.durationSec)} · ` : ''}
                      {s.special ? s.meta?.intensity || 'aktif' : `${st.done} set${st.volume ? ` · ${st.volume} kg volume` : ''}`}
                    </span>
                  </span>
                  <IconCheck size={18} className="text-lime-accent shrink-0" />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* --------------------------------------------- hari di luar siklus */}
      <section>
        <SectionTitle>Di luar siklus</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {SPECIAL_DAYS.map((sp) => {
            const Icon = DAY_ICONS[sp.id];
            const loggedToday = todaySessions.some((s) => s.dayId === sp.id);
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSpecialSheet(sp)}
                className={cx(
                  'rounded-2xl border p-3.5 text-left transition active:scale-[0.98]',
                  loggedToday ? 'bg-lime-accent/10 border-lime-accent/30' : 'bg-ink-800 border-white/5 hover:bg-ink-750'
                )}
              >
                <span
                  className={cx(
                    'w-9 h-9 grid place-items-center rounded-xl mb-2',
                    sp.id === 'padel' ? 'bg-amber-400/15 text-amber-300' : 'bg-sky-400/15 text-sky-300'
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className="block text-[13.5px] font-bold">{sp.title}</span>
                <span className="block text-[11.5px] text-muted leading-snug mt-0.5">{sp.blurb}</span>
                {loggedToday && <Chip tone="lime" className="mt-2">tercatat hari ini</Chip>}
              </button>
            );
          })}
        </div>
      </section>

      <DayPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentId={dayId}
        onPick={(id) => {
          actions.setManualDay(id);
          setPickerOpen(false);
        }}
        onAuto={() => {
          actions.setManualDay(null);
          setPickerOpen(false);
        }}
      />

      <SpecialLogSheet
        day={specialSheet}
        onClose={() => setSpecialSheet(null)}
        onSave={(meta) => {
          actions.logSpecialDay(specialSheet.id, meta);
          setSpecialSheet(null);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ sub-komponen */

function MiniRing({ value, big, suffix, label, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      <ProgressRing value={value} size={54} stroke={5}>
        <Icon size={16} className="text-lime-accent" />
      </ProgressRing>
      <div className="min-w-0">
        <p className="display-num text-[24px]">
          {big}
          {suffix && <span className="font-sans text-[12px] font-bold text-muted ml-1">{suffix}</span>}
        </p>
        <p className="text-[11px] text-muted truncate">{label}</p>
      </div>
    </div>
  );
}

export function DayPicker({ open, onClose, currentId, onPick, onAuto }) {
  const { state } = useStore();
  const autoId = resolveTodayDayId({ ...state, prefs: { ...state.prefs, manualDayId: null } });
  return (
    <Sheet open={open} onClose={onClose} title="Pilih hari">
      <p className="text-[12.5px] text-muted mb-4 leading-relaxed">
        Default-nya app ngikutin urutan siklus 4 hari — hari rest & padel gak menggeser urutan. Pilih manual kalau mau lompat.
      </p>
      <div className="space-y-2">
        {[...CYCLE_DAYS, ...SPECIAL_DAYS].map((d) => {
          const Icon = DAY_ICONS[d.id];
          const active = d.id === currentId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onPick(d.id)}
              className={cx(
                'w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                active ? 'bg-lime-accent/12 border-lime-accent/40' : 'bg-ink-800 border-white/5 hover:bg-ink-750'
              )}
            >
              <span className={cx('w-10 h-10 grid place-items-center rounded-xl', active ? 'bg-lime-accent text-ink-900' : 'bg-white/6 text-muted')}>
                <Icon size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13.5px] font-bold">
                  {d.special ? d.title : `Hari ${d.num} — ${d.title}`}
                </span>
                <span className="block text-[11.5px] text-muted truncate">
                  {d.special ? d.blurb : `${d.exercises.length} gerakan · ${d.tag}`}
                </span>
              </span>
              {d.id === autoId && <Chip tone="lime">auto</Chip>}
            </button>
          );
        })}
      </div>
      <Button variant="ghost" className="w-full mt-4" onClick={onAuto}>
        <IconRefresh size={15} /> Balik ke urutan otomatis
      </Button>
    </Sheet>
  );
}

export function SpecialLogSheet({ day, onClose, onSave }) {
  const [values, setValues] = useState({});
  if (!day) return null;
  const Icon = DAY_ICONS[day.id];
  return (
    <Sheet
      open={!!day}
      onClose={onClose}
      title={day.title}
      footer={
        <Button className="w-full" size="lg" onClick={() => onSave(values)}>
          <IconCheck size={16} /> Catat sebagai hari aktif
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className={cx(
            'w-12 h-12 grid place-items-center rounded-2xl',
            day.id === 'padel' ? 'bg-amber-400/15 text-amber-300' : 'bg-sky-400/15 text-sky-300'
          )}
        >
          <Icon size={22} />
        </span>
        <p className="text-[12.5px] text-muted leading-relaxed flex-1">{day.detail}</p>
      </div>

      <div className="space-y-3">
        {day.fields.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-[11px] uppercase tracking-wider text-muted mb-1.5 font-semibold">{f.label}</span>
            {f.type === 'select' ? (
              <select
                value={values[f.key] || f.options[0]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full bg-ink-900/80 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-accent/60 transition"
              >
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={f.placeholder}
                  value={values[f.key] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full bg-ink-900/80 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm tabular outline-none focus:border-lime-accent/60 transition"
                />
                {f.unit && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-muted">{f.unit}</span>}
              </div>
            )}
          </label>
        ))}
      </div>
    </Sheet>
  );
}

export { IconRacket, IconWaves };
