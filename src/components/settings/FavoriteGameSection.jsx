import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import { SegmentedSelector, ToggleRow } from './Section';
import { LENGTH_OPTIONS, LENGTH_MAX } from '@/lib/storage';

const MAP_OPTIONS = [
  { value: 'world', labelKey: 'settings.mapWorld' },
  { value: 'continent', labelKey: 'settings.mapContinent' },
  { value: 'hungary', labelKey: 'settings.mapHungary' },
  { value: 'us', labelKey: 'settings.mapUS' },
];

const CONTINENT_OPTS = [
  { value: 'africa', labelKey: 'settings.contAfrica' },
  { value: 'americas', labelKey: 'settings.contAmericas' },
  { value: 'asia', labelKey: 'settings.contAsia' },
  { value: 'europe', labelKey: 'settings.contEurope' },
  { value: 'oceania', labelKey: 'settings.contOceania' },
];

function modeOptions(map, lang) {
  if (map === 'world' || map === 'continent') {
    return [
      { value: 'find', label: t(lang, 'settings.modeFindCountries') },
      { value: 'explore', label: t(lang, 'settings.modeExplore') },
      { value: 'flag', label: t(lang, 'settings.modeFlagMatch') },
    ];
  }
  if (map === 'hungary') {
    return [
      { value: 'find', label: t(lang, 'settings.modeFindCounty') },
      { value: 'explore', label: t(lang, 'settings.modeExploreHungary') },
    ];
  }
  return [
    { value: 'find', label: t(lang, 'settings.modeFindState') },
    { value: 'explore', label: t(lang, 'settings.modeExploreUS') },
  ];
}

export default function FavoriteGameSection() {
  const { lang, settings, updateSetting } = useApp();
  const map = settings.recommendedMap;
  const mode = settings.recommendedMode;

  const changeMap = (newMap) => {
    const validModes = newMap === 'world' || newMap === 'continent' ? ['find', 'explore', 'flag'] : ['find', 'explore'];
    let nextMode = mode;
    if (!validModes.includes(mode)) nextMode = 'find';
    const opts = LENGTH_OPTIONS[newMap];
    let nextLen = settings.recommendedLength;
    if (!opts.includes(nextLen)) nextLen = opts[opts.length - 1];
    updateSetting('recommendedMap', newMap);
    if (nextMode !== mode) updateSetting('recommendedMode', nextMode);
    if (nextLen !== settings.recommendedLength) updateSetting('recommendedLength', nextLen);
  };

  const lengthOpts = LENGTH_OPTIONS[map].map((v) => ({
    value: v,
    label: v === LENGTH_MAX[map] ? t(lang, 'settings.lengthAll') : String(v),
  }));

  const showContinent = map === 'continent';
  const showExpert = (map === 'world' || map === 'continent') && mode !== 'flag';
  const showHints = map !== 'hungary' && mode !== 'flag';

  return (
    <>
      <SegmentedSelector
        label={t(lang, 'settings.favMap')}
        value={map}
        options={MAP_OPTIONS.map((o) => ({ value: o.value, label: t(lang, o.labelKey) }))}
        onChange={changeMap}
      />
      <SegmentedSelector
        label={t(lang, 'settings.favMode')}
        value={mode}
        options={modeOptions(map, lang)}
        onChange={(v) => updateSetting('recommendedMode', v)}
      />
      {showContinent && (
        <SegmentedSelector
          label={t(lang, 'settings.favContinent')}
          value={settings.recommendedContinent}
          options={CONTINENT_OPTS.map((o) => ({ value: o.value, label: t(lang, o.labelKey) }))}
          onChange={(v) => updateSetting('recommendedContinent', v)}
        />
      )}
      <SegmentedSelector
        label={t(lang, 'settings.favLength')}
        value={settings.recommendedLength}
        options={lengthOpts}
        onChange={(v) => updateSetting('recommendedLength', v)}
      />
      {showExpert && (
        <ToggleRow label={t(lang, 'settings.favExpert')} checked={settings.recommendedExpert} onChange={(v) => updateSetting('recommendedExpert', v)} />
      )}
      {showHints && (
        <ToggleRow label={t(lang, 'settings.favHints')} checked={settings.recommendedHints} onChange={(v) => updateSetting('recommendedHints', v)} />
      )}
    </>
  );
}