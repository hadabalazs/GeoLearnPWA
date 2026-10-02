import { t } from '@/lib/i18n';
import {
  SCOPE_CHOICES, CONTINENT_OPTIONS, BULLSEYE_RADII, CAPITAL_FORMATS,
  modeLabel, countLabel, COLOR_CLASSES,
} from '@/lib/builderConfig';

export function ScopeSelector({ value, onChange, scopes, lang }) {
  const opts = SCOPE_CHOICES.filter((s) => scopes.includes(s.key));
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.scope')}</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {opts.map((s) => (
          <button key={s.key} onClick={() => onChange(s.key)}
            className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border-2 text-sm font-semibold text-center break-words transition-colors touch-target no-tap-highlight ${
              value === s.key ? 'border-accent bg-accent/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            <span className="shrink-0">{s.icon}</span> {s.label[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ContinentFilter({ value, onChange, lang }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.continent')}</div>
      <div className="flex flex-wrap gap-2">
        {CONTINENT_OPTIONS.map((c) => (
          <button key={c.key} onClick={() => onChange(c.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border-2 transition-colors touch-target no-tap-highlight ${
              value === c.key ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            {c.label[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ModePicker({ value, onChange, options, scopeChoice, lang }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.mode')}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((m) => (
          <button key={m} onClick={() => onChange(m)}
            className={`px-2 py-2.5 rounded-xl border-2 text-sm font-semibold text-center break-words transition-colors touch-target no-tap-highlight ${
              value === m ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            {modeLabel(m, scopeChoice, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RoundPicker({ value, onChange, options, lang }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.rounds')}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => (
          <button key={c} onClick={() => onChange(c)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors touch-target no-tap-highlight ${
              value === c ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            {countLabel(c, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ on, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors touch-target no-tap-highlight ${
        on ? 'border-accent bg-accent/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
      {label}
      <span className={`w-10 h-6 rounded-full relative transition-colors ${on ? 'bg-accent' : 'bg-muted'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

const VARIANTS = [
  { key: 'normal', labelKey: 'variants.normal' },
  { key: 'timeTrial', labelKey: 'variants.timeTrial' },
  { key: 'deathRun', labelKey: 'variants.deathRun' },
];

export function VariantControl({ value, onChange, lang }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.variant')}</div>
      <div className="grid grid-cols-3 gap-2">
        {VARIANTS.map((v) => (
          <button key={v.key} onClick={() => onChange(v.key)}
            className={`px-2 py-2.5 rounded-xl border-2 text-sm font-semibold text-center break-words transition-colors touch-target no-tap-highlight ${
              value === v.key ? 'border-gold bg-gold/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            {t(lang, v.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BullseyePicker({ value, onChange, lang }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.bullseyeRadius')} (km)</div>
      <div className="flex flex-wrap gap-2">
        {BULLSEYE_RADII.map((r) => (
          <button key={r} onClick={() => onChange(r)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors touch-target no-tap-highlight ${
              value === r ? 'border-gold bg-gold/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FormatPicker({ value, onChange, lang }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t(lang, 'builder.format')}</div>
      <div className="grid grid-cols-3 gap-2">
        {CAPITAL_FORMATS.map((f) => (
          <button key={f.key} onClick={() => onChange(f.key)}
            className={`px-2 py-2.5 rounded-xl border-2 text-xs font-semibold text-center break-words transition-colors touch-target no-tap-highlight ${
              value === f.key ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground'}`}>
            {f.label[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PreviewCard({ icon, color, title, subtitle, tags }) {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  return (
    <div className={`rounded-2xl border-2 p-4 ${c.border} ${c.bg}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-xl shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="font-heading font-bold text-foreground leading-tight">{title}</div>
          <div className="text-xs text-muted-foreground leading-snug">{subtitle}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {tags.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-card border border-border text-[11px] font-medium text-foreground">{tag}</span>
        ))}
      </div>
    </div>
  );
}