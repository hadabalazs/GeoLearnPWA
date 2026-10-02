import { MapPin, Layers, Compass, Flag, Landmark, Crosshair, Share2 } from 'lucide-react';

const ICONS = {
  find: MapPin, explore: Compass, challenges: Layers, flag: Flag,
  capital: Landmark, findCapital: Crosshair, challenge: Share2,
};

export default function CategoryCard({ catKey, title, desc, scopes, onClick, lang }) {
  const Icon = ICONS[catKey] || MapPin;
  return (
    <button
      onClick={onClick}
      className="group text-left bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md hover:border-accent/40 transition-all active:scale-[0.98] no-tap-highlight"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
          <Icon className="w-5 h-5 text-primary group-hover:text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading font-bold text-foreground leading-tight">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</div>
          <div className="text-[10px] text-accent font-semibold mt-2 uppercase tracking-wide truncate">{scopes}</div>
        </div>
      </div>
    </button>
  );
}