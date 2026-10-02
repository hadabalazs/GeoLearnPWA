import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, RefreshCw, Play } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { parseChallengeCode, randomSeed } from '@/lib/challenge';
import { saveRecommendation } from '@/lib/storage';
import {
  hasVariant, modeLabel, buildTags,
  scopeChoiceLabel, continentLabel, scopeChoiceFromScope, countLabel,
} from '@/lib/builderConfig';
import { useBuilder } from './useBuilder';
import BuilderShell from './BuilderShell';
import {
  ScopeSelector, ContinentFilter, ModePicker, RoundPicker, Toggle,
  VariantControl, BullseyePicker, FormatPicker, PreviewCard,
} from './controls';

export default function BuilderPage({ category }) {
  const { lang, settings } = useApp();
  const navigate = useNavigate();
  const forFriend = category === 'challengeFriend';
  const b = useBuilder(category, {
    forFriend,
    defaultDisableHints: settings.defaultDisableHints,
    defaultExpertMode: settings.defaultExpertMode,
    defaultMixMajorCities: settings.defaultMixMajorCities,
    defaultOneChanceMode: settings.defaultOneChanceMode,
    defaultTimeTrialMode: settings.defaultTimeTrialMode,
    capitalLocatorHideCountryNameDefault: settings.capitalLocatorHideCountryNameDefault,
  });
  const cat = b.cat;

  const showContinent = b.scopeChoice === 'continents';
  const showModePicker = b.modeOptions.length > 1;
  const showVariant = hasVariant(category);
  const showFormat = category === 'capitalSearch' && b.worldLike;
  const showBullseye = b.mode === 'findCapital';

  const start = () => {
    saveRecommendation(b.config);
    navigate('/game', { state: { config: { ...b.config, seed: b.seed } } });
  };

  const tags = buildTags(b, lang);

  return (
    <BuilderShell icon={cat.icon} color={cat.color} title={cat.title[lang]} subtitle={cat.subtitle[lang]} onStart={start} hideStart={forFriend}>
      <ScopeSelector value={b.scopeChoice} onChange={b.setScopeChoice} scopes={cat.scopes} lang={lang} />
      {showContinent && <ContinentFilter value={b.continent} onChange={b.setContinent} lang={lang} />}
      {showModePicker && <ModePicker value={b.mode} onChange={b.setMode} options={b.modeOptions} scopeChoice={b.scopeChoice} lang={lang} />}
      <RoundPicker value={b.count} onChange={b.setCount} options={b.countOptions} lang={lang} />
      {showFormat && <FormatPicker value={b.format} onChange={b.setFormat} lang={lang} />}
      {showVariant && <VariantControl value={b.variant} onChange={b.setVariant} lang={lang} />}
      {b.toggles.has('expert') && <Toggle on={b.expert} onClick={() => b.setExpert(!b.expert)} label={t(lang, 'builder.expert')} />}
      {b.toggles.has('hints') && !b.expert && <Toggle on={b.hints} onClick={() => b.setHints(!b.hints)} label={t(lang, 'builder.hints')} />}
      {b.toggles.has('majorCities') && <Toggle on={b.majorCities} onClick={() => b.setMajorCities(!b.majorCities)} label={t(lang, 'builder.majorCities')} />}
      {b.toggles.has('hideRegion') && <Toggle on={b.hideRegion} onClick={() => b.setHideRegion(!b.hideRegion)} label={t(lang, 'builder.hideRegion')} />}
      {showBullseye && <BullseyePicker value={b.bullseye} onChange={b.setBullseye} lang={lang} />}
      <PreviewCard icon={cat.icon} color={cat.color} title={modeLabel(b.mode, b.scopeChoice, lang)} subtitle={cat.subtitle[lang]} tags={tags} />
      {forFriend && <FriendCodeSection lang={lang} liveCode={b.liveCode} onRegenerate={() => b.setSeed(randomSeed())} onStart={start} />}
    </BuilderShell>
  );
}

function FriendCodeSection({ lang, liveCode, onRegenerate, onStart }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');

  let parsed = null;
  let valid = false;
  if (code) {
    try { parsed = parseChallengeCode(code); valid = true; } catch { /* invalid */ }
  }

  const copy = () => {
    if (!liveCode) return;
    navigator.clipboard?.writeText(liveCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  const startParsed = () => { if (parsed) navigate('/game', { state: { config: parsed } }); };

  return (
    <>
      {/* Create a Challenge */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="text-sm font-heading font-bold text-foreground">{t(lang, 'builder.createChallenge')}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(lang, 'builder.yourCode')}</div>
        {liveCode ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 rounded-lg bg-muted font-mono text-sm text-foreground truncate">{liveCode}</code>
            <button onClick={onRegenerate} title={t(lang, 'builder.regenerate')} className="px-3 py-2.5 rounded-lg bg-muted text-foreground touch-target no-tap-highlight">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={copy} className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-1.5 touch-target no-tap-highlight">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t(lang, 'builder.copied') : t(lang, 'builder.copy')}
            </button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">{t(lang, 'results.noCode')}</div>
        )}
        <button onClick={onStart} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target no-tap-highlight">
          <Play className="w-5 h-5" /> {t(lang, 'builder.startChallenge')}
        </button>
      </div>

      {/* Enter a Code */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="text-sm font-heading font-bold text-foreground">{t(lang, 'builder.enterCode')}</div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
          placeholder="EA20NH-483921"
          className={`w-full px-3 py-2.5 rounded-xl border-2 bg-background text-foreground font-mono font-bold text-sm uppercase touch-target ${
            code ? (valid ? 'border-correct' : 'border-incorrect') : 'border-input'}`}
        />
        {valid && parsed && (
          <DecodedSummary cfg={parsed} lang={lang} />
        )}
        <button onClick={startParsed} disabled={!valid}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm touch-target no-tap-highlight disabled:opacity-40">
          <Play className="w-4 h-4" /> {t(lang, 'builder.startChallenge')}
        </button>
      </div>
    </>
  );
}

function DecodedSummary({ cfg, lang }) {
  const sc = scopeChoiceFromScope(cfg.scope);
  const rows = [
    { k: 'builder.mode', v: modeLabel(cfg.mode, sc, lang) },
    { k: 'builder.scope', v: sc === 'continents' ? continentLabel(cfg.scope, lang) : scopeChoiceLabel(sc, lang) },
    { k: 'builder.rounds', v: countLabel(cfg.count, lang) },
    { k: 'builder.variant', v: t(lang, `variants.${cfg.oneChance ? 'deathRun' : cfg.timeTrial ? 'timeTrial' : 'normal'}`) },
    { k: 'builder.expert', v: cfg.expert ? t(lang, 'common.yes') : t(lang, 'common.no') },
    { k: 'builder.hints', v: cfg.hints ? t(lang, 'common.yes') : t(lang, 'common.no') },
  ];
  if (cfg.mode === 'findCapital') rows.push({ k: 'builder.bullseyeRadius', v: `${cfg.bullseyeRadiusKM} km` });
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{t(lang, 'builder.decoded')}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{t(lang, r.k)}</span>
            <span className="font-semibold text-foreground text-right">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
