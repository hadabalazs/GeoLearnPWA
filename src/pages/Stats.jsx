import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { scopeLabel } from '@/lib/data';
import { accuracyColor } from '@/lib/animation';
import { Trophy, Target, Flame, BarChart3 } from 'lucide-react';

function accOf(bucket) {
  if (!bucket) return null;
  const tot = bucket.correct + bucket.missed;
  return tot ? Math.round((bucket.correct / tot) * 100) : null;
}

function Heatmap({ dailyDone, lang }) {
  const days = 119;
  const today = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const info = dailyDone[key];
    cells.push({ key, info, date: d });
  }
  return (
    <div className="grid grid-cols-[repeat(17,1fr)] gap-1">
      {cells.map((c) => {
        const bg = c.info ? accuracyColor((c.info.accuracy ?? 0) / 100).fill : 'hsl(var(--muted))';
        return <div key={c.key} title={c.info ? `${c.key}: ${c.info.score}` : c.key} className="aspect-square rounded-[3px]" style={{ background: bg }} />;
      })}
    </div>
  );
}

export default function Stats() {
  const { lang, stats } = useApp();
  const overall = stats.totalCorrect + stats.totalMissed;
  const overallAcc = overall ? Math.round((stats.totalCorrect / overall) * 100) : 0;

  const modeKeys = Object.keys(stats.byMode || {});
  const scopeKeys = Object.keys(stats.byScope || {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-heading font-extrabold text-foreground">{t(lang, 'stats.title')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4"><BarChart3 className="w-5 h-5 text-accent mb-1" /><div className="text-2xl font-heading font-bold">{stats.gamesPlayed}</div><div className="text-xs text-muted-foreground">{t(lang, 'stats.games')}</div></div>
        <div className="bg-card rounded-2xl border border-border p-4"><Target className="w-5 h-5 text-correct mb-1" /><div className="text-2xl font-heading font-bold">{overallAcc}%</div><div className="text-xs text-muted-foreground">{t(lang, 'stats.accuracy')}</div></div>
        <div className="bg-card rounded-2xl border border-border p-4"><Flame className="w-5 h-5 text-gold mb-1" /><div className="text-2xl font-heading font-bold">{stats.bestStreak}</div><div className="text-xs text-muted-foreground">{t(lang, 'stats.bestStreak')}</div></div>
        <div className="bg-card rounded-2xl border border-border p-4"><Trophy className="w-5 h-5 text-gold mb-1" /><div className="text-2xl font-heading font-bold">{stats.totalCorrect}</div><div className="text-xs text-muted-foreground">{t(lang, 'stats.correct')}</div></div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="text-sm font-heading font-bold text-foreground mb-3">{t(lang, 'stats.calendar')}</div>
        <Heatmap dailyDone={stats.dailyDone || {}} lang={lang} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-sm font-heading font-bold text-foreground mb-2">{t(lang, 'stats.byMode')}</div>
          {modeKeys.length === 0 ? <div className="text-xs text-muted-foreground">{t(lang, 'stats.none')}</div> : modeKeys.map((k) => {
            const a = accOf(stats.byMode[k]);
            return <div key={k} className="flex items-center justify-between text-sm py-1"><span className="text-foreground">{t(lang, `modes.${k}`)}</span><div className="flex items-center gap-2"><div className="w-24 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-accent" style={{ width: `${a}%` }} /></div><span className="text-muted-foreground w-9 text-right">{a}%</span></div></div>;
          })}
        </div>
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-sm font-heading font-bold text-foreground mb-2">{t(lang, 'stats.byScope')}</div>
          {scopeKeys.length === 0 ? <div className="text-xs text-muted-foreground">{t(lang, 'stats.none')}</div> : scopeKeys.map((k) => {
            const a = accOf(stats.byScope[k]);
            return <div key={k} className="flex items-center justify-between text-sm py-1"><span className="text-foreground">{scopeLabel(k, lang)}</span><div className="flex items-center gap-2"><div className="w-24 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gold" style={{ width: `${a}%` }} /></div><span className="text-muted-foreground w-9 text-right">{a}%</span></div></div>;
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="text-sm font-heading font-bold text-foreground mb-2">{t(lang, 'stats.recentMisses')}</div>
        {(stats.recentMisses || []).length === 0 ? <div className="text-xs text-muted-foreground">{t(lang, 'stats.none')}</div> : (
          <div className="flex flex-wrap gap-2">
            {(stats.recentMisses || []).slice(0, 24).map((m, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-incorrect/10 text-incorrect text-xs font-semibold">{m.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}