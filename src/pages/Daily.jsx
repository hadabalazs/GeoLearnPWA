import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { todayKey, isDailyDone } from '@/lib/storage';
import { buildDailyLaunchConfig } from '@/lib/dailyChallenge';
import DailyBanner from '@/components/daily/DailyBanner';
import DailyCalendarDialog from '@/components/DailyCalendarDialog';

export default function Daily() {
  const { lang, stats, dailyScores } = useApp();
  const navigate = useNavigate();
  const [calOpen, setCalOpen] = useState(false);
  const dKey = todayKey();
  const done = isDailyDone(dKey);
  const doneInfo = stats.dailyDone?.[dKey];

  const launchDaily = () => {
    navigate('/game', { state: { config: buildDailyLaunchConfig(new Date()) } });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <DailyBanner date={new Date()} lang={lang} scores={dailyScores} onLaunch={launchDaily} onCalendar={() => setCalOpen(true)} />

      {done && doneInfo && (
        <div className="rounded-2xl bg-correct/10 border border-correct/30 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-correct" />
          <div>
            <div className="font-semibold text-foreground">{t(lang, 'daily.completed')}</div>
            <div className="text-sm text-muted-foreground">{t(lang, 'daily.score')}: {doneInfo.score} · {doneInfo.accuracy}%</div>
          </div>
        </div>
      )}

      <DailyCalendarDialog open={calOpen} onClose={() => setCalOpen(false)} lang={lang} scores={dailyScores} />
    </div>
  );
}