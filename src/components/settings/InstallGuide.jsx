import { useState, useEffect } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { X, Check, Smartphone } from 'lucide-react';
import { t } from '@/lib/i18n';
import { getDeferredPrompt, isStandalone, useInstallPrompt } from '@/hooks/useInstallPrompt';
import StepVisual from './InstallStepVisuals';

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'ios';
}

function AppleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function AndroidIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.7-1.21-5.73-1.21-8.43 0L6.16 5.67c-.18-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85L6.91 9.48C4.05 11.07 2.1 14.04 2.1 17.48h19.8c0-3.44-1.95-6.41-4.8-8zM7.5 14.5c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3zm9 0c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3z" />
    </svg>
  );
}

const IOS_STEPS = [
  { titleKey: 'install.iosStep1Title', descKey: 'install.iosStep1Desc', visual: 'safari' },
  { titleKey: 'install.iosStep2Title', descKey: 'install.iosStep2Desc', visual: 'share' },
  { titleKey: 'install.iosStep3Title', descKey: 'install.iosStep3Desc', visual: 'addHome' },
  { titleKey: 'install.iosStep4Title', descKey: 'install.iosStep4Desc', visual: 'check' },
];

const ANDROID_STEPS = [
  { titleKey: 'install.androidStep1Title', descKey: 'install.androidStep1Desc', visual: 'chrome' },
  { titleKey: 'install.androidStep2Title', descKey: 'install.androidStep2Desc', visual: 'dots' },
  { titleKey: 'install.androidStep3Title', descKey: 'install.androidStep3Desc', visual: 'check' },
];

function StepCard({ step, lang, index }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-extrabold text-base flex items-center justify-center shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground leading-snug">{t(lang, step.titleKey)}</h3>
          <p className="text-[15px] text-muted-foreground leading-relaxed mt-1">{t(lang, step.descKey)}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <StepVisual name={step.visual} />
      </div>
    </div>
  );
}

export default function InstallGuide({ open, onClose, lang }) {
  const [platform, setPlatform] = useState('ios');
  const [toast, setToast] = useState(null);
  const [installed, setInstalled] = useState(false);
  const canInstall = useInstallPrompt();

  useEffect(() => {
    if (open) {
      setPlatform(detectPlatform());
      setInstalled(isStandalone());
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const tm = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(tm);
  }, [toast]);

  const handleIOSCTA = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast(t(lang, 'install.toastCopied'));
    } catch {
      setToast(t(lang, 'install.toastCopied'));
    }
  };

  const handleAndroidInstall = async () => {
    const prompt = getDeferredPrompt();
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setToast(t(lang, 'install.toastInstalled'));
      setTimeout(() => onClose(), 1500);
    }
  };

  const steps = platform === 'ios' ? IOS_STEPS : ANDROID_STEPS;
  const hasClipboard = typeof navigator !== 'undefined' && !!navigator.clipboard;

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerContent className="max-h-[88vh]">
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/85 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg whitespace-nowrap">
            {toast}
          </div>
        )}

        {installed ? (
          <div className="px-5 pb-8 pt-4 flex flex-col items-center text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-correct/15 grid place-items-center mb-4">
              <Check className="w-10 h-10 text-correct" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t(lang, 'install.alreadyInstalled')}</h2>
            <p className="text-[15px] text-muted-foreground mt-2">{t(lang, 'install.alreadyInstalledSub')}</p>
            <button onClick={onClose} className="mt-6 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold touch-target">
              {t(lang, 'install.close')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h2 className="text-xl font-heading font-bold text-foreground">{t(lang, 'install.title')}</h2>
              <button onClick={onClose} aria-label={t(lang, 'install.close')} className="w-10 h-10 rounded-full bg-muted grid place-items-center touch-target no-tap-highlight">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div className="flex gap-1 p-1 rounded-2xl bg-muted/60">
                <button onClick={() => setPlatform('ios')}
                  className={`flex-1 h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-sm touch-target no-tap-highlight transition-colors ${
                    platform === 'ios' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}>
                  <AppleIcon size={20} />
                  <span>{t(lang, 'install.iosTab')}</span>
                </button>
                <button onClick={() => setPlatform('android')}
                  className={`flex-1 h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-sm touch-target no-tap-highlight transition-colors ${
                    platform === 'android' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}>
                  <AndroidIcon size={20} />
                  <span>{t(lang, 'install.androidTab')}</span>
                </button>
              </div>
            </div>

            <div className="px-5 pb-4 space-y-3 overflow-y-auto">
              {steps.map((step, i) => (
                <StepCard key={i} step={step} lang={lang} index={i} />
              ))}
            </div>

            <div className="px-5 pt-2 border-t border-border" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
              {platform === 'ios' ? (
                <button onClick={handleIOSCTA}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 touch-target no-tap-highlight">
                  <Smartphone className="w-5 h-5" />
                  {hasClipboard ? t(lang, 'install.iosCtaCopy') : t(lang, 'install.iosCtaFallback')}
                </button>
              ) : canInstall ? (
                <button onClick={handleAndroidInstall}
                  className="w-full h-14 rounded-2xl bg-[#34A853] text-white font-bold text-base flex items-center justify-center gap-2 touch-target no-tap-highlight">
                  {t(lang, 'install.androidCtaInstall')}
                </button>
              ) : (
                <div>
                  <button disabled
                    className="w-full h-14 rounded-2xl border-2 border-border text-muted-foreground font-bold text-base flex items-center justify-center gap-2 opacity-60">
                    {t(lang, 'install.androidCtaManual')}
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-2">{t(lang, 'install.androidCtaHelper')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}