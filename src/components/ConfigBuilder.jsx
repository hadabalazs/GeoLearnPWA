import { useMemo, useState } from 'react';
import { Play, Share2, Copy, Check, RefreshCw } from 'lucide-react';
import { t } from '@/lib/i18n';
import { scopeLabel, CONTINENTS } from '@/lib/data';
import { randomSeed, makeChallengeCode } from '@/lib/challenge';

const MODES = [
  { key: 'find', labelKey: 'modes.find', scopes: ['world', ...CONTINENTS, 'hungary', 'us'], mods: ['expert', 'hints', 'oneChance', 'timeTrial'] },
  { key: 'explore', labelKey: 'modes.explore', scopes: ['world', ...CONTINENTS, 'hungary', 'us'], mods: ['hints', 'oneChance'] },
  { key: 'flagMatch', labelKey: 'modes.flagMatch', scopes: ['world', ...CONTINENTS], mods: ['timeTrial'] },
  { key: 'flagReverse', labelKey: 'modes.flagReverse', scopes: ['world', ...CONTINENTS], mods: ['timeTrial'] },
  { key: 'capital', labelKey: 'modes.capital', scopes: ['world', ...CONTINENTS, 'hungary', 'us'], mods: ['timeTrial', 'mixCities'] },
  { key: 'findCapital', labelKey: 'modes.findCapital', scopes: ['world', ...CONTINENTS, 'hungary', 'us'], mods: ['timeTrial', 'hideRegion'] },
];

const MOD_LABEL = { expert: 'builder.expert', hints: 'builder.hints', oneChance: 'builder.oneChance', timeTrial: 'builder.timeTrial', mixCities: 'builder.mixCities', hideRegion: 'builder.hideRegion' };
const COUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 0];
const BULLSEYE_RADII = [10, 25, 50, 75, 100];

function Toggle({ on, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors touch-target ${
        on ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-muted-foreground'}`}>
      {label}
      <span className={`w-10 h-6 rounded-full relative transition-colors ${on ? 'bg-accent' : 'bg-muted'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export default function ConfigBuilder({ lang, initialMode = 'find', onLaunch }) {
  const [mode, setMode] = useState(initialMode);
  const modeDef = MODES.find((m) => m.key === mode);
  const [scope, setScope] = useState(modeDef.scopes[0]);
  const [count, setCount] = useState(10);
  const [mods, setMods] = useState({ expert: false, hints: true, oneChance: false, timeTrial: false, mixCities: false, hideRegion: false });
  const [bullseyeRadius, setBullseyeRadius] = useState(50);
  const [seed, setSeed] = useState(() => randomSeed());
  const [copied, setCopied] = useState(false);

  const changeMode = (m) => {
    setMode(m);
    const md = MODES.find((x) => x.key === m);
    if (!md.scopes.includes(scope)) setScope(md.scopes[0]);
  };

  const pickScope = (s) => {
    setScope(s);
    if (mode === 'findCapital' && s === 'hungary') setBullseyeRadius(10);
  };

  const buildConfig = () => ({
    mode, scope, count,
    expert: mods.expert, hints: mods.hints, oneChance: mods.oneChance,
    timeTrial: mods.timeTrial, mixCities: mods.mixCities, hideRegionName: mods.hideRegion,
    bullseyeRadiusKM: mode === 'findCapital' ? bullseyeRadius : undefined,
    seed,
  });

  const liveCode = useMemo(() => makeChallengeCode(buildConfig()), [mode, scope, count, mods, bullseyeRadius, seed]);

  const launch = () => onLaunch(buildConfig());
  const copyCode = () => {
    if (!liveCode) return;
    navigator.clipboard?.writeText(liveCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };
  const regenerate = () => setSeed(randomSeed());

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-heading font-extrabold text-foreground">{t(lang, 'builder.title')}</h1>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.mode')}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button key={m.key} onClick={() => changeMode(m.key)}
              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors touch-target ${
                mode === m.key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/30'}`}>
              {t(lang, m.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.scope')}</div>
        <div className="flex flex-wrap gap-2">
          {modeDef.scopes.map((s) => (
            <button key={s} onClick={() => pickScope(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors touch-target ${
                scope === s ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-muted-foreground'}`}>
              {scopeLabel(s, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.rounds')}</div>
        <div className="flex flex-wrap gap-2">
          {COUNTS.map((c) => (
            <button key={c} onClick={() => setCount(c)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors touch-target ${
                count === c ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}>
              {c === 0 ? t(lang, 'builder.allRounds') : c}
            </button>
          ))}
        </div>
      </div>

      {modeDef.mods.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
          {modeDef.mods.map((mk) => (
            <Toggle key={mk} on={mods[mk]} onClick={() => setMods((s) => ({ ...s, [mk]: !s[mk] }))} label={t(lang, MOD_LABEL[mk])} />
          ))}
        </div>
      )}

      {mode === 'findCapital' && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.bullseyeRadius')} (km)</div>
          <div className="flex flex-wrap gap-2">
            {BULLSEYE_RADII.map((r) => (
              <button key={r} onClick={() => setBullseyeRadius(r)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors touch-target ${
                  bullseyeRadius === r ? 'border-gold bg-gold/10 text-gold-foreground' : 'border-border bg-background text-muted-foreground'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={launch} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target">
          <Play className="w-5 h-5" /> {t(lang, 'builder.launch')}
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-accent" /> {t(lang, 'builder.yourCode')}
        </div>
        {liveCode ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 rounded-lg bg-muted font-mono text-sm text-foreground truncate">{liveCode}</code>
            <button onClick={regenerate} title={t(lang, 'builder.regenerate')} className="px-3 py-2.5 rounded-lg bg-muted text-foreground touch-target">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={copyCode} className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-1.5 touch-target">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t(lang, 'builder.copied') : t(lang, 'results.copy')}
            </button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">{t(lang, 'results.noCode')}</div>
        )}
      </div>
    </div>
  );
}