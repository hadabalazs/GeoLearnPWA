import { Globe } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { Section, SegmentedSelector } from '@/components/settings/Section';

export default function MapStyleSection() {
  const { lang, settings, updateSetting } = useApp();
  const current = settings.mapStyle === 'minimalist' ? 'minimalist' : 'satellite';
  return (
    <Section label={t(lang, 'settings.mapStyle')}>
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-accent/15 grid place-items-center shrink-0">
          <Globe className="w-5 h-5 text-accent" />
        </div>
        <div className="text-base text-foreground">{t(lang, 'settings.mapStyleTitle')}</div>
      </div>
      <SegmentedSelector
        value={current}
        onChange={(v) => updateSetting('mapStyle', v)}
        options={[
          { label: t(lang, 'settings.satellite'), value: 'satellite' },
          { label: t(lang, 'settings.minimalist'), value: 'minimalist' },
        ]}
      />
    </Section>
  );
}