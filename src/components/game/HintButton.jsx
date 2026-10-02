import { LocateFixed } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';

// 40×40px floating hint button — bottom-right of the map screen.
// Pans the map to reveal the target's approximate location.
export default function HintButton({ onClick }) {
  const { lang } = useApp();
  return (
    <button
      onClick={onClick}
      aria-label={t(lang, 'game.hint')}
      className="absolute bottom-10 right-4 z-[500] w-10 h-10 rounded-[10px] bg-[rgba(20,41,77,0.85)] grid place-items-center shadow-lg touch-target no-tap-highlight transition-transform active:scale-95"
    >
      <LocateFixed className="w-5 h-5 text-white" />
    </button>
  );
}