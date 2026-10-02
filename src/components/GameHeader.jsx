import { useEffect, useRef, useState } from 'react';
import { Timer, Flame, Target, Zap, EyeOff, Eye, Skull } from 'lucide-react';
import { t } from '@/lib/i18n';
import { TIMING, prefersReducedMotion } from '@/lib/animation';

function Badge({ icon: Icon, label, tone }) {
  const tones = {
    gold: 'bg-gold/15 text-foreground',
    accent: 'bg-accent/15 text-foreground',
    muted: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone] || tones.muted}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

// Counts up from the previously shown value to `value` over a short tween.
function AnimatedNumber({ value }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value || prefersReducedMotion()) { fromRef.current = value; setShown(value); return; }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / TIMING.scoreCountUp);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`text-foreground tabular-nums ${shown !== value ? 'score-ticking' : ''}`}>{shown}</span>;
}

// Self-contained time-trial clock. Owns the ticking state so the rest of the
// game tree (map, ~200 markers) is not re-rendered every second. Uses a
// deadline timestamp rather than a setTimeout chain, so it doesn't drift.
// `bonusSeconds` is a running total; any increase is added to the deadline.
function TimeTrialClock({ seconds, running, bonusSeconds = 0, onExpire }) {
  const deadlineRef = useRef(Date.now() + seconds * 1000);
  const bonusSeen = useRef(0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const [left, setLeft] = useState(seconds);

  if (bonusSeconds !== bonusSeen.current) {
    deadlineRef.current += (bonusSeconds - bonusSeen.current) * 1000;
    bonusSeen.current = bonusSeconds;
  }

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const l = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0 && !expiredRef.current) { expiredRef.current = true; onExpireRef.current?.(); }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      <Timer className={`w-4 h-4 ${left <= 10 ? 'text-incorrect' : 'text-accent'}`} />
      <span className={`tabular-nums ${left <= 10 ? 'text-incorrect' : 'text-foreground'}`}>{left}s</span>
    </div>
  );
}

export default function GameHeader({ round, total, score, streak, config, lang, timerRunning = true, bonusSeconds = 0, onTimeUp }) {
  const badges = [];
  if (config?.expert) badges.push(<Badge key="x" icon={EyeOff} label={t(lang, 'builder.expert')} tone="gold" />);
  if (config?.hints) badges.push(<Badge key="h" icon={Eye} label={t(lang, 'builder.hints')} tone="accent" />);
  if (config?.oneChance) badges.push(<Badge key="o" icon={Skull} label={t(lang, 'builder.oneChance')} tone="muted" />);
  if (config?.timeTrial) badges.push(<Badge key="t" icon={Zap} label={t(lang, 'builder.timeTrial')} tone="gold" />);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-card border-b border-border sticky top-0 z-20">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <Target className="w-4 h-4 text-accent" />
        <span className="text-foreground">{round + 1}</span>
        <span className="text-muted-foreground">/ {total}</span>
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <span className="text-muted-foreground">{t(lang, 'game.score')}:</span>
        <AnimatedNumber value={score} />
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-gold' : 'text-muted-foreground'}`} />
        <span className="text-foreground">{streak}</span>
      </div>
      {config?.timeTrial && (
        <TimeTrialClock seconds={60} running={timerRunning} bonusSeconds={bonusSeconds} onExpire={onTimeUp} />
      )}
      <div className="ml-auto flex flex-wrap gap-1.5">{badges}</div>
    </div>
  );
}
