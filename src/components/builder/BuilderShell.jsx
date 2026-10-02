import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';

export default function BuilderShell({ icon, color, title, subtitle, children, onStart, startLabel, hideStart = false }) {
  const { lang } = useApp();
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 touch-target no-tap-highlight">
        <ChevronLeft className="w-4 h-4" /> {t(lang, 'common.back')}
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-card border border-border">{icon}</div>
        <div className="min-w-0">
          <h1 className="text-xl font-heading font-extrabold text-foreground leading-tight">{title}</h1>
          <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      {!hideStart && (
        <button onClick={onStart} className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target no-tap-highlight">
          <Play className="w-5 h-5" /> {startLabel || t(lang, 'builder.start')}
        </button>
      )}
    </div>
  );
}