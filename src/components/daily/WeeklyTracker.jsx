import { t } from '@/lib/i18n';
import { mondayOfWeek, isoDateKey, hasTrophy, currentStreak, addDays, weekDaysHeader } from '@/lib/dailyChallenge';

export default function WeeklyTracker({ scores, lang, today }) {
  const monday = mondayOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const streak = currentStreak(scores, today);
  const headers = weekDaysHeader(lang);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-extrabold tracking-[0.5px] text-muted-foreground">{t(lang, 'home.thisWeek')}</span>
        {streak >= 2 && (
          <span className="text-[9px] font-extrabold text-incorrect flex items-center gap-1">
            🔥 {streak} {t(lang, 'home.dayStreak')}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex justify-between items-start">
        {days.map((d, i) => {
          const trophy = hasTrophy(scores, d);
          const isToday = isoDateKey(d) === isoDateKey(today);
          return (
            <div key={i} className="w-[26px] grid justify-items-center gap-[3px]">
              <div className="w-[26px] h-[22px] grid place-items-center">
                {trophy ? (
                  <span className="text-base leading-none">🏆</span>
                ) : isToday ? (
                  <div className="w-[22px] h-[22px] rounded-full border-[1.5px] border-gold/90 bg-gold/15" />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full bg-muted" />
                )}
              </div>
              <div className={`text-[8px] font-medium text-muted-foreground ${isToday ? 'font-extrabold text-gold' : ''}`}>
                {headers[i]}
              </div>
              {isToday && !trophy && <div className="w-[3px] h-[3px] rounded-full bg-gold" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}