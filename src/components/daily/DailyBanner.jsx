import { Calendar } from 'lucide-react';
import { t } from '@/lib/i18n';
import { scopeLabel } from '@/lib/data';
import { modeLabel, scopeChoiceFromScope } from '@/lib/builderConfig';
import { dailyConfigForDate, isoDateKey, weekdayShort, TROPHY_THRESHOLD, MODE_TAG_COLOR } from '@/lib/dailyChallenge';
import WeeklyTracker from './WeeklyTracker';

const TAG_BASE = 'text-[10px] font-extrabold px-2 py-1 rounded-full whitespace-nowrap';

export default function DailyBanner({ date, lang, scores, onLaunch, onCalendar }) {
  const cfg = dailyConfigForDate(date);
  const dKey = isoDateKey(date);
  const ratio = scores[dKey] ?? null;
  const completed = ratio != null && ratio >= TROPHY_THRESHOLD;
  const name = lang === 'hu' ? cfg.nameHU : cfg.name;
  const desc = lang === 'hu' ? cfg.descHU : cfg.desc;
  const gt = cfg.gameType;
  const modeColor = MODE_TAG_COLOR[gt.type] || 'bg-accent';
  const scopeChoice = scopeChoiceFromScope(cfg.scope);

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onLaunch(); }
  };

  const modifiers = [];
  if (gt.isOneChance || cfg.oneChance) modifiers.push(t(lang, 'builder.oneChance'));
  if (gt.isExpert || cfg.expert) modifiers.push(t(lang, 'builder.expert'));
  if (gt.hintsEnabled === false) modifiers.push(t(lang, 'builder.noHints'));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onLaunch}
      onKeyDown={handleKey}
      aria-label={`${name}. ${t(lang, 'home.startDailyA11y')}`}
      className={`relative w-full rounded-2xl p-3.5 bg-card border-[1.5px] overflow-hidden cursor-pointer no-tap-highlight active:scale-[0.99] transition-transform ${
        completed ? 'border-gold/85' : 'border-gold/45'
      }`}
    >
      <div className="absolute left-0 right-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/75 to-transparent" />

      {/* Header row */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center text-xl shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.92), hsl(var(--accent)))' }}
        >
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.5px] text-gold">
            {t(lang, 'home.dayWord')} {cfg.day} · {weekdayShort(date, lang)}
          </div>
          <div className="text-base font-heading font-extrabold text-foreground truncate">{name}</div>
        </div>
        {completed && <span className="text-xl shrink-0" aria-hidden>🏆</span>}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCalendar(); }}
          aria-label={t(lang, 'home.openCalendarA11y')}
          className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-gold/15 border border-gold/60 text-gold touch-target no-tap-highlight"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="mt-2 text-xs font-medium text-muted-foreground leading-[1.35] line-clamp-2">{desc}</p>

      {/* Tags */}
      <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
        <span className={`${TAG_BASE} text-black ${modeColor}`}>{modeLabel(cfg.mode, scopeChoice, lang)}</span>
        <span className={`${TAG_BASE} bg-muted text-foreground`}>{scopeLabel(cfg.scope, lang)}</span>
        <span className={`${TAG_BASE} bg-muted text-foreground`}>{cfg.count} {t(lang, 'builder.roundsUnit')}</span>
        {modifiers.map((m) => (
          <span key={m} className={`${TAG_BASE} text-gold bg-gold/15`}>{m}</span>
        ))}
      </div>

      {/* Divider */}
      <div className="my-2 h-px bg-border/80" />

      {/* Weekly tracker */}
      <WeeklyTracker scores={scores} lang={lang} today={date} />
    </div>
  );
}
