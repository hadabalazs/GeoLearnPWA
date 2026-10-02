import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trophy, Flame, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { t } from '@/lib/i18n';
import { buildDailyLaunchConfig, isoDateKey, hasTrophy, didPlay, currentStreak, weekDaysHeader, TROPHY_THRESHOLD } from '@/lib/dailyChallenge';

export default function DailyCalendarDialog({ open, onClose, lang, scores }) {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const first = new Date(view.y, view.m, 1);
  const firstIdx = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  const monthName = first.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-US', { month: 'long', year: 'numeric' });
  const headers = weekDaysHeader(lang);

  const isCurrentOrFutureMonth =
    view.y > today.getFullYear() || (view.y === today.getFullYear() && view.m >= today.getMonth());

  const prevMonth = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }));
  const nextMonth = () => {
    if (isCurrentOrFutureMonth) return;
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }));
  };

  const trophies = Object.values(scores).filter((r) => r >= TROPHY_THRESHOLD).length;
  const played = Object.keys(scores).length;
  const streak = currentStreak(scores, today);

  const pick = (d) => {
    const date = new Date(view.y, view.m, d);
    date.setHours(0, 0, 0, 0);
    if (date > today) return;
    onClose();
    navigate('/game', { state: { config: buildDailyLaunchConfig(date) } });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border pr-12">
          <div className="font-heading font-bold text-foreground">{t(lang, 'calendar.title')}</div>
        </div>

        <div className="px-4 py-3 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Summary tiles */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryTile icon={Trophy} color="text-gold" value={trophies} label={t(lang, 'calendar.trophies')} />
            <SummaryTile icon={Flame} color="text-incorrect" value={streak} label={t(lang, 'calendar.streak')} />
            <SummaryTile icon={CheckCircle2} color="text-correct" value={played} label={t(lang, 'calendar.played')} />
          </div>

          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted touch-target no-tap-highlight">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-semibold text-foreground capitalize">{monthName}</div>
            <button
              onClick={nextMonth}
              disabled={isCurrentOrFutureMonth}
              className="p-1.5 rounded-lg hover:bg-muted touch-target no-tap-highlight disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {headers.map((h, i) => (
              <div key={i} className="text-[9px] font-bold text-muted-foreground py-1">{h}</div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="h-[52px]" />;
              const date = new Date(view.y, view.m, d);
              date.setHours(0, 0, 0, 0);
              const isToday = isoDateKey(date) === isoDateKey(today);
              const isFuture = date > today;
              const trophy = hasTrophy(scores, date);
              const playedNoTrophy = !trophy && didPlay(scores, date);
              return (
                <button
                  key={i}
                  onClick={() => pick(d)}
                  disabled={isFuture}
                  aria-label={`${monthName.split(' ')[0]} ${d}, ${isFuture ? t(lang, 'calendar.future') : t(lang, 'calendar.title')}${trophy ? ', ' + t(lang, 'calendar.legendTrophy') : playedNoTrophy ? ', ' + t(lang, 'calendar.legendPlayed') : ''}`}
                  className="h-[52px] grid place-items-center bg-transparent border-0 no-tap-highlight disabled:opacity-40"
                >
                  <div className="h-[34px] grid place-items-center">
                    {trophy ? (
                      <span className="text-[20px] leading-none">🏆</span>
                    ) : isToday ? (
                      <div className="w-[34px] h-[34px] rounded-full border-[1.8px] border-gold/95 bg-gold/15 grid place-items-center font-bold text-foreground">
                        {d}
                      </div>
                    ) : playedNoTrophy ? (
                      <div className="relative w-[30px] h-[30px] rounded-full bg-muted grid place-items-center text-sm font-medium text-foreground">
                        {d}
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-correct/80" />
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-foreground">{d}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
            <div className="text-[10px] font-extrabold tracking-[0.5px] text-muted-foreground">{t(lang, 'calendar.legend')}</div>
            <LegendRow title={t(lang, 'calendar.legendTrophy')} sub={t(lang, 'calendar.legendTrophySub')}>
              <span className="text-base">🏆</span>
            </LegendRow>
            <LegendRow title={t(lang, 'calendar.legendPlayed')} sub={t(lang, 'calendar.legendPlayedSub')}>
              <div className="relative w-5 h-5 rounded-full bg-muted">
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-correct/80" />
              </div>
            </LegendRow>
            <LegendRow title={t(lang, 'calendar.legendToday')} sub={t(lang, 'calendar.legendTodaySub')}>
              <div className="w-5 h-5 rounded-full border-[1.5px] border-gold/95 bg-gold/15" />
            </LegendRow>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryTile({ icon: Icon, color, value, label }) {
  return (
    <div className="rounded-2xl border border-border bg-card py-3.5 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
      <div className="text-lg font-heading font-extrabold text-foreground leading-none">{value}</div>
      <div className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function LegendRow({ title, sub, children }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 grid place-items-center shrink-0">{children}</div>
      <div>
        <div className="text-xs font-semibold text-foreground">{title}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}