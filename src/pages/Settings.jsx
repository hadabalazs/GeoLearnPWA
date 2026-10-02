import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Map as MapIcon, Trash2, Mail, HelpCircle, ChevronRight, Smartphone } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { Section, ToggleRow } from '@/components/settings/Section';
import ThemeGrid from '@/components/settings/ThemeGrid';
import FavoriteGameSection from '@/components/settings/FavoriteGameSection';
import MapDataSheet from '@/components/settings/MapDataSheet';
import MapStyleSection from '@/components/settings/MapStyleSection';
import InstallGuide from '@/components/settings/InstallGuide';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

const MAIL_FEEDBACK = 'mailto:development.hada@gmail.com?subject=GeoLearn%20Feedback';
const MAIL_SUPPORT = 'mailto:development.hada@gmail.com?subject=GeoLearn%20Support';

export default function Settings() {
  const { lang, setLang, settings, updateSetting, resetAllStats } = useApp();
  const navigate = useNavigate();
  const [mapDataOpen, setMapDataOpen] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  const openMail = (url) => {
    let opened = false;
    const onBlur = () => { opened = true; };
    window.addEventListener('blur', onBlur, { once: true });
    window.location.href = url;
    setTimeout(() => {
      window.removeEventListener('blur', onBlur);
      if (!opened) alert(t(lang, 'settings.mailFallback'));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-1 px-4 h-14">
          <button
            onClick={() => navigate('/')}
            aria-label={t(lang, 'common.back')}
            className="flex items-center gap-1 -ml-2 px-2 py-1.5 rounded-lg text-foreground touch-target no-tap-highlight"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t(lang, 'common.back')}</span>
          </button>
          <h1 className="text-base font-heading font-bold text-foreground ml-1">{t(lang, 'settings.title')}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6 pb-16">
        {/* Install App */}
        <Section label={t(lang, 'install.sectionLabel')}>
          <button onClick={() => setInstallGuideOpen(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left touch-target no-tap-highlight">
            <div className="w-9 h-9 rounded-xl bg-primary/15 grid place-items-center shrink-0">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-foreground">{t(lang, 'install.howToInstall')}</div>
              <div className="text-xs text-muted-foreground leading-snug">{t(lang, 'install.subtitle')}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </Section>

        {/* Language */}
        <Section label={t(lang, 'settings.language')}>
          {['en', 'hu'].map((l, i) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left touch-target no-tap-highlight ${
                i === 0 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-base text-foreground">{l === 'en' ? 'English' : 'Magyar'}</span>
              {lang === l && <Check className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </Section>

        {/* Appearance */}
        <Section label={t(lang, 'settings.appearance')}>
          <ThemeGrid />
        </Section>

        {/* Favorite Game */}
        <Section label={t(lang, 'settings.favoriteGame')}>
          <FavoriteGameSection />
        </Section>

        {/* Gameplay Defaults */}
        <Section label={t(lang, 'settings.gameplayDefaults')}>
          <ToggleRow label={t(lang, 'settings.defExpert')} checked={settings.defaultExpertMode} onChange={(v) => updateSetting('defaultExpertMode', v)} />
          <ToggleRow label={t(lang, 'settings.defHintsOff')} checked={settings.defaultDisableHints} onChange={(v) => updateSetting('defaultDisableHints', v)} />
          <ToggleRow label={t(lang, 'settings.defMixCities')} checked={settings.defaultMixMajorCities} onChange={(v) => updateSetting('defaultMixMajorCities', v)} />
          <ToggleRow
            label={t(lang, 'settings.defOneChance')}
            checked={settings.defaultOneChanceMode}
            onChange={(v) => { updateSetting('defaultOneChanceMode', v); if (v) updateSetting('defaultTimeTrialMode', false); }}
          />
          <ToggleRow
            label={t(lang, 'settings.defTimeTrial')}
            checked={settings.defaultTimeTrialMode}
            onChange={(v) => { updateSetting('defaultTimeTrialMode', v); if (v) updateSetting('defaultOneChanceMode', false); }}
          />
          <ToggleRow label={t(lang, 'settings.defHideCountry')} checked={settings.capitalLocatorHideCountryNameDefault} onChange={(v) => updateSetting('capitalLocatorHideCountryNameDefault', v)} />
          <ToggleRow label={t(lang, 'settings.defNextButtonOnCorrect')} checked={settings.nextButtonOnCorrect} onChange={(v) => updateSetting('nextButtonOnCorrect', v)} />
        </Section>

        {/* Map */}
        <Section label={t(lang, 'settings.map')}>
          <ToggleRow label={t(lang, 'settings.showZoom')} checked={settings.showZoomControls} onChange={(v) => updateSetting('showZoomControls', v)} />
          <ToggleRow label={t(lang, 'settings.animateWrongAnswers')} checked={settings.animateWrongAnswers} onChange={(v) => updateSetting('animateWrongAnswers', v)} />
          <ToggleRow label={t(lang, 'settings.showMissedInfo')} checked={settings.showMissedCountryInfo} onChange={(v) => updateSetting('showMissedCountryInfo', v)} />
        </Section>

        {/* Map Style */}
        <MapStyleSection />

        {/* Map Data */}
        <Section label={t(lang, 'settings.mapData')}>
          <button onClick={() => setMapDataOpen(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left touch-target no-tap-highlight">
            <div className="w-9 h-9 rounded-xl bg-accent/15 grid place-items-center shrink-0">
              <MapIcon className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base text-foreground">{t(lang, 'settings.landmarkBoundaries')}</div>
              <div className="text-xs text-muted-foreground leading-snug">{t(lang, 'settings.landmarkSub')}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </Section>

        {/* Data */}
        <Section label={t(lang, 'settings.data')}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left touch-target no-tap-highlight">
                <div className="w-9 h-9 rounded-xl bg-incorrect/15 grid place-items-center shrink-0">
                  <Trash2 className="w-5 h-5 text-incorrect" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base text-incorrect">{t(lang, 'settings.resetAll')}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{t(lang, 'settings.resetAllSub')}</div>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t(lang, 'settings.resetConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t(lang, 'settings.resetConfirmMsg')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t(lang, 'settings.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetAllStats}
                  className="bg-incorrect text-incorrect-foreground hover:bg-incorrect/90"
                >
                  {t(lang, 'settings.reset')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        {/* Contact */}
        <Section label={t(lang, 'settings.contact')}>
          <button
            onClick={() => openMail(MAIL_FEEDBACK)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-border touch-target no-tap-highlight"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/15 grid place-items-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base text-foreground">{t(lang, 'settings.sendFeedback')}</div>
              <div className="text-xs text-muted-foreground leading-snug">{t(lang, 'settings.sendFeedbackSub')}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
          <button
            onClick={() => openMail(MAIL_SUPPORT)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left touch-target no-tap-highlight"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 grid place-items-center shrink-0">
              <HelpCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base text-foreground">{t(lang, 'settings.support')}</div>
              <div className="text-xs text-muted-foreground leading-snug">{t(lang, 'settings.supportSub')}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </Section>
      </div>

      <MapDataSheet open={mapDataOpen} onClose={() => setMapDataOpen(false)} lang={lang} />
      <InstallGuide open={installGuideOpen} onClose={() => setInstallGuideOpen(false)} lang={lang} />
    </div>
  );
}
