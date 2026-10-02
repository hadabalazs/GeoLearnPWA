import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';

// Each theme: 3 swatch colours (background, accent, recommended base) plus the
// selected card's fill/text (per the iOS spec — Classic Navy inverts to white).
const THEMES = [
  { key: 'classicNavy', labelKey: 'settings.themeNavy', swatches: ['#1E3A5F', '#2E86AB', '#427FA0'], selectedFill: '#FFFFFF', selectedText: '#1E3A5F' },
  { key: 'light', labelKey: 'settings.themeLight', swatches: ['#E7EEF4', '#2E86AB', '#75B5C0'], selectedFill: '#2E86AB', selectedText: '#FFFFFF' },
  { key: 'dark', labelKey: 'settings.themeDark', swatches: ['#0F1724', '#56A7D1', '#295C7D'], selectedFill: '#56A7D1', selectedText: '#FFFFFF' },
  { key: 'sage', labelKey: 'settings.themeSage', swatches: ['#DCE6D7', '#6EBCC2', '#70B8C4'], selectedFill: '#6EBCC2', selectedText: '#FFFFFF' },
];

export default function ThemeGrid() {
  const { lang, theme, setTheme } = useApp();
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {THEMES.map((th) => {
        const active = theme === th.key;
        return (
          <button
            key={th.key}
            onClick={() => setTheme(th.key)}
            style={active ? { backgroundColor: th.selectedFill, color: th.selectedText, borderColor: th.selectedFill } : undefined}
            className={`flex flex-col items-start gap-2 p-3 rounded-2xl border-2 transition-all touch-target no-tap-highlight h-[92px] ${
              active ? '' : 'border-border bg-background text-foreground'
            }`}
          >
            <div className="flex gap-1.5">
              {th.swatches.map((c, i) => (
                <span key={i} className="w-[22px] h-[22px] rounded-md border border-black/10" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-sm font-semibold">{t(lang, th.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}