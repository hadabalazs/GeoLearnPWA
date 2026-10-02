import { Switch } from '@/components/ui/switch';

export function Section({ label, children }) {
  return (
    <section>
      <h2 className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-muted-foreground mb-2 px-1">{label}</h2>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">{children}</div>
    </section>
  );
}

export function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-b-0">
      <span className="text-base text-foreground pr-3">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SegmentedSelector({ label, value, options, onChange }) {
  return (
    <div className="px-4 py-3.5 border-b border-border last:border-b-0">
      {label && <div className="text-base text-foreground mb-2">{label}</div>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex-1 min-w-0 rounded-[10px] min-h-[46px] px-2 py-2 text-sm font-semibold text-center break-words touch-target no-tap-highlight transition-colors ${
                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}