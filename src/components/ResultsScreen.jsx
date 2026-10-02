import { useState } from 'react';
import { Trophy, Target, Flame, Clock, Copy, Check, RefreshCw, Home, Share2, X, ChevronDown, ChevronUp, LocateFixed } from 'lucide-react';
import { t } from '@/lib/i18n';
import { scopeLabel } from '@/lib/data';

function Stat({ icon: Icon, label, value, tone }) {
  const tones = { gold: 'text-gold', accent: 'text-accent', correct: 'text-correct', muted: 'text-muted-foreground' };
  return (
    <div className="flex items-center gap-2 bg-card rounded-xl border border-border p-3">
      <Icon className={`w-5 h-5 ${tones[tone] || tones.muted}`} />
      <div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-lg font-heading font-bold text-foreground leading-none">{value}</div>
      </div>
    </div>
  );
}

export default function ResultsScreen({ result, config, code, onRetry, onHome, lang }) {
  const [copied, setCopied] = useState(false);
  const [review, setReview] = useState(false);
  const copy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };
  const mins = Math.floor(result.timeMs / 60000);
  const secs = Math.floor((result.timeMs % 60000) / 1000);
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
  const variantLabel = result.variant ? t(lang, `variants.${result.variant}`) : '';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 max-w-2xl mx-auto">
      <div className="w-full rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground p-6 text-center shadow-xl">
        <Trophy className="w-10 h-10 mx-auto mb-2 text-gold" />
        <div className="text-3xl font-heading font-extrabold">{result.score}</div>
        <div className="text-sm text-primary-foreground/80">{t(lang, 'results.finalScore')}</div>
        <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-primary-foreground/15 font-semibold">{t(lang, `modes.${result.mode}`)}</span>
          <span className="px-2.5 py-1 rounded-full bg-primary-foreground/15 font-semibold">{scopeLabel(result.scope, lang)}</span>
          {variantLabel && <span className="px-2.5 py-1 rounded-full bg-primary-foreground/15 font-semibold">{variantLabel}</span>}
        </div>
        {result.variant === 'deathRun' && result.misses.length > 0 && (
          <div className="text-xs text-primary-foreground/70 mt-2">{t(lang, 'results.endedOneChance')} {result.correct + 1}.</div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-4">
        <Stat icon={Target} label={t(lang, 'results.accuracy')} value={`${result.accuracy}%`} tone="accent" />
        <Stat icon={Flame} label={t(lang, 'results.bestStreak')} value={result.bestStreak} tone="gold" />
        <Stat icon={Clock} label={t(lang, 'results.timeTaken')} value={timeStr} tone="muted" />
        <Stat icon={Trophy} label={t(lang, 'game.score')} value={result.score} tone="correct" />
      </div>

      {result.maxScore != null && (
        <div className="grid grid-cols-2 gap-3 w-full mt-3">
          <Stat icon={Trophy} label={t(lang, 'results.maxScore')} value={result.maxScore} tone="muted" />
          <Stat icon={Target} label={t(lang, 'results.avgDistance')} value={`${Math.round(result.averageDistance)} km`} tone="accent" />
        </div>
      )}

      {result.hintsUsed != null && (
        <div className="w-full mt-3">
          <Stat icon={LocateFixed} label={t(lang, 'results.hintsUsed')} value={result.hintsUsed} tone={result.hintsUsed === 0 ? 'correct' : 'gold'} />
        </div>
      )}

      <div className="w-full mt-4 bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-heading font-bold text-foreground">{t(lang, 'results.missed')}</div>
          {result.misses.length > 0 && (
            <button onClick={() => setReview((r) => !r)} className="flex items-center gap-1 text-xs font-semibold text-foreground touch-target">
              {review ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {t(lang, 'results.reviewMissed')}
            </button>
          )}
        </div>
        {result.misses.length === 0 ? (
          <div className="text-sm text-correct font-semibold">{t(lang, 'results.none')}</div>
        ) : !review ? (
          <div className="flex flex-wrap gap-2">
            {result.misses.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-incorrect/15 text-foreground text-xs font-semibold">
                <X className="w-3 h-3 text-incorrect" /> {m.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {result.misses.map((m, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-incorrect" />
                  <span className="font-semibold text-foreground text-sm">{m.name}</span>
                  {m.answer && <span className="text-xs text-muted-foreground">· {m.answer}</span>}
                </div>
                {m.fact && <div className="text-xs text-muted-foreground mt-1">{m.fact}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {code && (
        <div className="w-full mt-4 bg-card rounded-2xl border border-border p-4">
          <div className="text-sm font-heading font-bold text-foreground mb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accent" /> {t(lang, 'results.share')}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 rounded-lg bg-muted font-mono text-sm text-foreground truncate">{code}</code>
            <button onClick={copy} className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-1.5 touch-target">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t(lang, 'results.copied') : t(lang, 'results.copy')}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 w-full mt-5">
        <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-semibold touch-target">
          <RefreshCw className="w-4 h-4" /> {t(lang, 'results.retry')}
        </button>
        <button onClick={onHome} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-foreground font-semibold touch-target">
          <Home className="w-4 h-4" /> {t(lang, 'results.home')}
        </button>
      </div>
    </div>
  );
}