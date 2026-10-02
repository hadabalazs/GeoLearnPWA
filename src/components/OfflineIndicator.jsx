import { WifiOff } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';

export default function OfflineIndicator() {
  const { online, lang } = useApp();
  if (online) return null;
  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-gold-foreground text-xs font-semibold shadow-lg animate-pop">
      <WifiOff className="w-3.5 h-3.5" />
      {t(lang, 'settings.offline')}
    </div>
  );
}