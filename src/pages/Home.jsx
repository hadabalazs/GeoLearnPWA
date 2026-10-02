import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Play, Check } from 'lucide-react';
import GlobeLogo from '@/components/GlobeLogo';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { parseChallengeCode, randomSeed } from '@/lib/challenge';
import { getRecommendation } from '@/lib/storage';
import { buildDailyLaunchConfig } from '@/lib/dailyChallenge';
import {
  CATEGORIES, BUILDER_ROUTES, COLOR_CLASSES, modeLabel,
  scopeChoiceLabel, scopeChoiceFromScope, countLabel,
} from '@/lib/builderConfig';
import DailyBanner from '@/components/daily/DailyBanner';
import DailyCalendarDialog from '@/components/DailyCalendarDialog';
import InstallGuide from '@/components/settings/InstallGuide';
import { useInstallPrompt, shouldAutoShow, markInstallGuideSeen } from '@/hooks/useInstallPrompt';

const GAME_ORDER = ['findOnMap', 'explore', 'challenges', 'flagSearch', 'capitalSearch', 'capitalLocation'];

function Chip({ children }) {
  return <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-foreground">{children}</span>;
}

export default function Home() {
  const { lang, dailyScores } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  useInstallPrompt();

  const rec = getRecommendation();
  const favConfig = rec
    ? { ...rec, seed: randomSeed() }
    : { mode: 'find', scope: 'world', count: 20, expert: false, hints: true, seed: randomSeed() };
  const favScopeChoice = scopeChoiceFromScope(favConfig.scope);
  const favTitle = modeLabel(favConfig.mode, favScopeChoice, lang);

  const launchDaily = () => {
    navigate('/game', { state: { config: buildDailyLaunchConfig(new Date()) } });
  };

  const onChangeCode = (raw) => setCode(raw.replace(/\s/g, '').toUpperCase());
  let codeParsed = null;
  let codeValid = false;
  if (code) {
    try { codeParsed = parseChallengeCode(code); codeValid = true; } catch { /* invalid */ }
  }
  const playCode = () => { if (codeParsed) navigate('/game', { state: { config: codeParsed } }); };

  useEffect(() => {
    if (shouldAutoShow()) {
      const tm = setTimeout(() => {
        setInstallGuideOpen(true);
        markInstallGuideSeen();
      }, 3000);
      return () => clearTimeout(tm);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col items-center text-center pt-2">
        <div className="mb-2">
          <GlobeLogo size={56} />
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-foreground">GeoLearn</h1>
        <p className="text-sm text-muted-foreground">{t(lang, 'tagline')}</p>
      </header>

      {/* Favorite Game */}
      <section>
        <h2 className="text-sm font-heading font-bold text-foreground mb-2">{t(lang, 'home.favorite')}</h2>
        <button onClick={() => navigate('/game', { state: { config: favConfig } })}
          className="w-full text-left rounded-2xl p-4 bg-card border border-border shadow-sm hover:border-accent/40 transition-all active:scale-[0.99] no-tap-highlight">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center text-xl shrink-0">⭐</div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-foreground leading-tight">{favTitle}</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Chip>{scopeChoiceLabel(favScopeChoice, lang)}</Chip>
                <Chip>{countLabel(favConfig.count, lang)} {t(lang, 'builder.roundsUnit')}</Chip>
                {favConfig.expert && <Chip>{t(lang, 'builder.expert')}</Chip>}
                {favConfig.hints && <Chip>{t(lang, 'builder.hints')}</Chip>}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </button>
      </section>

      {/* Daily Challenge */}
      <section>
        <h2 className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-muted-foreground mb-2">{t(lang, 'home.dailySection')}</h2>
        <DailyBanner date={new Date()} lang={lang} scores={dailyScores} onLaunch={launchDaily} onCalendar={() => setCalOpen(true)} />
      </section>

      {/* Games grid */}
      <section>
        <h2 className="text-sm font-heading font-bold text-foreground mb-2">{t(lang, 'home.games')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {GAME_ORDER.map((key) => {
            const c = CATEGORIES[key];
            const cls = COLOR_CLASSES[c.color];
            return (
              <button key={key} onClick={() => navigate(`/builder/${BUILDER_ROUTES[key]}`)}
                className={`text-left bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md hover:border-accent/40 transition-all active:scale-[0.98] no-tap-highlight min-h-[160px] flex flex-col`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${cls.bg}`}>{c.icon}</div>
                <div className="font-heading font-bold text-foreground leading-tight">{c.title[lang]}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">{c.subtitle[lang]}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Friends */}
      <section>
        <h2 className="text-sm font-heading font-bold text-foreground mb-2">{t(lang, 'home.friends')}</h2>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <div className="font-heading font-bold text-foreground">{t(lang, 'home.playFriend')}</div>
          </div>
          <p className="text-xs text-muted-foreground">{t(lang, 'home.friendDesc')}</p>
          <input value={code} onChange={(e) => onChangeCode(e.target.value)} placeholder={t(lang, 'home.codePlaceholder')}
            className={`w-full px-3 py-2.5 rounded-xl border-2 bg-background text-foreground font-mono font-bold text-sm uppercase touch-target ${
              code ? (codeValid ? 'border-correct' : 'border-incorrect') : 'border-input'}`} />
          {codeValid && codeParsed && (
            <div className="flex items-center gap-1.5 text-xs text-correct">
              <Check className="w-3.5 h-3.5" /> {t(lang, 'home.validCode')} · {modeLabel(codeParsed.mode, scopeChoiceFromScope(codeParsed.scope), lang)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={playCode} disabled={!codeValid}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm touch-target no-tap-highlight disabled:opacity-40">
              <Play className="w-4 h-4" /> {t(lang, 'home.playChallenge')}
            </button>
            <button onClick={() => navigate('/builder/challenge-friend')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent/10 text-foreground border-2 border-accent/30 font-semibold text-sm touch-target no-tap-highlight">
              {t(lang, 'home.makeChallenge')}
            </button>
          </div>
        </div>
      </section>

      <DailyCalendarDialog open={calOpen} onClose={() => setCalOpen(false)} lang={lang} scores={dailyScores} />
      <InstallGuide open={installGuideOpen} onClose={() => setInstallGuideOpen(false)} lang={lang} />
    </div>
  );
}