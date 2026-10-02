import { useMemo, useState } from 'react';
import { scopeItems, localizedName } from '@/lib/data';
import { buildOptions } from '@/lib/options';
import { mixCapitalMajorCityOptions } from '@/lib/targetSelection';
import { t, tf } from '@/lib/i18n';
import FlagImage from '../FlagImage';

export default function QuizQuestion({ mode, target, ds, lang, config, status, onResult, roundIndex }) {
  const items = useMemo(() => scopeItems(config.scope, ds), [config.scope, ds]);
  const seed = config.seed + roundIndex * 13;

  const options = useMemo(() => {
    if (mode === 'capital') {
      const opts = buildOptions(target, items, seed, 4, 'id');
      return mixCapitalMajorCityOptions(target, opts, ds, config.mixCities);
    }
    return buildOptions(target, items, seed, 4, 'id');
  }, [mode, target, items, seed, config.mixCities, ds]);

  const [selected, setSelected] = useState(null);
  // Persisted across rounds; clear the pick synchronously on a new round.
  const [roundSeen, setRoundSeen] = useState(roundIndex);
  if (roundSeen !== roundIndex) { setRoundSeen(roundIndex); setSelected(null); }

  const prompt = mode === 'flagMatch'
    ? t(lang, 'game.flagPrompt')
    : mode === 'flagReverse'
    ? `${t(lang, 'game.flagReversePrompt')} ${localizedName(target, lang)}?`
    : mode === 'capital' && config.expert
    ? t(lang, 'capital.whatIsCapitalOfLabel')
    : tf(lang, 'game.capitalPrompt', localizedName(target, lang));

  const handlePick = (opt) => {
    if (status !== 'playing') return;
    setSelected(opt.id);
    let correct;
    if (mode === 'capital') correct = opt.capital === target.capital;
    else if (mode === 'flagMatch') correct = opt.id === target.id;
    else correct = opt.id === target.id;
    onResult(correct, { selectedId: opt.id });
  };

  const isCorrect = (opt) => {
    if (mode === 'capital') return opt.capital === target.capital;
    if (mode === 'flagMatch') return opt.id === target.id;
    return opt.id === target.id;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-4 bg-card text-center shrink-0">
        {mode === 'flagMatch' && (
          <div className="flex justify-center mb-2">
            <FlagImage flagCode={target.flagCode} priority className="rounded shadow-md border border-border h-20 sm:h-24 w-auto" size={320} />
          </div>
        )}
        {mode === 'capital' && !config.hints && target.flagCode && (
          <div className="flex justify-center mb-2">
            <FlagImage flagCode={target.flagCode} priority className="rounded shadow-md border border-border h-20 sm:h-24 w-auto" size={320} />
          </div>
        )}
        <div className="text-base sm:text-lg font-heading font-bold text-foreground max-w-xl mx-auto">{prompt}</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className={`w-full max-w-xl mx-auto my-auto p-4 grid gap-3 ${mode === 'flagReverse' ? 'grid-cols-2 sm:gap-4' : ''}`}>
        {options.map((opt) => {
          const picked = selected === opt.id;
          let cls = 'bg-card border-border text-foreground';
          if (status === 'feedback') {
            if (isCorrect(opt)) cls = 'bg-correct border-correct text-correct-foreground';
            else if (picked) cls = 'bg-incorrect border-incorrect text-incorrect-foreground';
            else cls = 'bg-card border-border text-foreground opacity-50';
          }
          return (
            <button
              key={opt.id + (mode === 'capital' ? opt.capital : '')}
              onClick={() => handlePick(opt)}
              disabled={status === 'feedback'}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all touch-target no-tap-highlight ${mode === 'flagReverse' ? 'justify-center' : 'text-left'} ${cls}`}
            >
              {mode === 'flagReverse' ? (
                <FlagImage flagCode={opt.flagCode} priority className="rounded shadow-sm border border-border w-16 h-11 sm:w-24 sm:h-16" size={160} />
              ) : (
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + options.indexOf(opt))}
                </span>
              )}
              {mode !== 'flagReverse' && (
                <span className="font-semibold">
                  {mode === 'capital' ? opt.capital : localizedName(opt, lang)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}
