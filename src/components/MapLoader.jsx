import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import { TIMING, prefersReducedMotion } from '@/lib/animation';

// Full-screen map loading overlay (iOS parity): globe emoji, title, spinner.
// Stays up for at least TIMING.mapLoaderMinimum so fast loads don't strobe,
// then fades out over TIMING.mapRevealFade before unmounting. Because it is an
// overlay, the map underneath can initialise (tiles, markers) behind it.
export default function MapLoader({ lang, show = true, onHidden }) {
  const shownAt = useRef(Date.now());
  const [stage, setStage] = useState('visible'); // visible | fading | gone
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;

  useEffect(() => {
    if (show) { shownAt.current = Date.now(); setStage('visible'); return; }
    const reduced = prefersReducedMotion();
    const wait = Math.max(0, TIMING.mapLoaderMinimum - (Date.now() - shownAt.current));
    const t1 = setTimeout(() => setStage(reduced ? 'gone' : 'fading'), wait);
    const t2 = setTimeout(() => { setStage('gone'); onHiddenRef.current?.(); }, wait + (reduced ? 0 : TIMING.mapRevealFade));
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (stage === 'gone') return null;
  return (
    <div
      className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center text-center px-6 map-loader ${stage === 'fading' ? 'map-loader--out' : ''}`}
      style={{ background: 'hsl(var(--background))' }}
      aria-hidden={stage === 'fading'}
    >
      <div className="text-[56px] leading-none mb-3">🌍</div>
      <div className="text-lg font-heading font-bold text-foreground">{t(lang, 'common.loading')}</div>
      <div className="mt-5 w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}
