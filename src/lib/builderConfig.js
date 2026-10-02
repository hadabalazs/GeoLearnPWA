// Category / scope / mode / count configuration for the GeoLearn builder screens.
// Mirrors the iOS GeoLearn menu + submenu structure.

import { CONTINENTS } from './data';
import { t } from './i18n';

// The four scope tabs. `pwa` is the data scope used in the launch config
// (null for continents — the chosen continent becomes the scope).
export const SCOPE_CHOICES = [
  { key: 'global', icon: '🌍', label: { en: 'Global', hu: 'Világ' } },
  { key: 'continents', icon: '🌐', label: { en: 'Continents', hu: 'Kontinens' } },
  { key: 'hungary', icon: '🇭🇺', label: { en: 'Hungary', hu: 'Magyarország' } },
  { key: 'us', icon: '🇺🇸', label: { en: 'USA', hu: 'USA' } },
];

export const CONTINENT_OPTIONS = [
  { key: 'africa', label: { en: 'Africa', hu: 'Afrika' } },
  { key: 'americas', label: { en: 'Americas', hu: 'Amerikák' } },
  { key: 'asia', label: { en: 'Asia', hu: 'Ázsia' } },
  { key: 'europe', label: { en: 'Europe', hu: 'Európa' } },
  { key: 'oceania', label: { en: 'Oceania', hu: 'Óceánia' } },
];

export const CATEGORIES = {
  findOnMap: {
    title: { en: 'Find on Map', hu: 'Keresd a térképen' },
    subtitle: { en: 'Get a target, spot it fast on the map, and build a streak.', hu: 'Kapj egy célt, találd meg gyorsan a térképen, és építs sorozatot.' },
    icon: '🗺️', color: 'blue',
    scopes: ['global', 'continents', 'hungary', 'us'],
    modes: { global: ['find'], continents: ['find'], hungary: ['find'], us: ['find'] },
  },
  explore: {
    title: { en: 'Explore', hu: 'Felfedezés' },
    subtitle: { en: 'Find the place first, then answer capital and flag follow-ups.', hu: 'Keresd meg a helyet, válaszolj a főváros- és zászlókérdésekre.' },
    icon: '🔍', color: 'green',
    scopes: ['global', 'continents', 'hungary', 'us'],
    modes: { global: ['explore'], continents: ['explore'], hungary: ['explore'], us: ['explore'] },
  },
  challenges: {
    title: { en: 'Challenges', hu: 'Kihívások' },
    subtitle: { en: 'Build a tense run with one-chance or time-trial rules.', hu: 'Építs feszült menetet egy-esély vagy időverseny szabályokkal.' },
    icon: '⚡', color: 'orange',
    scopes: ['global', 'continents', 'hungary', 'us'],
    modes: {
      global: ['find', 'explore', 'flagMatch', 'flagReverse', 'capital', 'findCapital'],
      continents: ['find', 'explore', 'flagMatch', 'flagReverse', 'capital', 'findCapital'],
      hungary: ['find', 'explore', 'capital', 'findCapital'],
      us: ['find', 'explore', 'capital', 'findCapital'],
    },
  },
  flagSearch: {
    title: { en: 'Flag Quiz', hu: 'Zászlókvíz' },
    subtitle: { en: 'Practice flag recognition in quick rounds with a clear visual focus.', hu: 'Gyakorold a zászlófelismerést gyors körökben.' },
    icon: '🚩', color: 'red',
    scopes: ['global', 'continents'],
    modes: { global: ['flagMatch', 'flagReverse'], continents: ['flagMatch', 'flagReverse'] },
  },
  capitalSearch: {
    title: { en: 'Capital Quiz', hu: 'Főváros kvíz' },
    subtitle: { en: 'See a country, county, or state and name its capital.', hu: 'Láss egy országot, vármegyét vagy államot, nevezd meg a fővárosát.' },
    icon: '🏛️', color: 'teal',
    scopes: ['global', 'continents', 'hungary', 'us'],
    modes: { global: ['capital'], continents: ['capital'], hungary: ['capital'], us: ['capital'] },
  },
  capitalLocation: {
    title: { en: 'Find Capital', hu: 'Keresd a fővárost' },
    subtitle: { en: 'Tap the map where the capital sits and see how close you are.', hu: 'Koppints a térképen a főváros helyére, lásd milyen közel vagy.' },
    icon: '📍', color: 'gold',
    scopes: ['global', 'continents', 'hungary', 'us'],
    modes: { global: ['findCapital'], continents: ['findCapital'], hungary: ['findCapital'], us: ['findCapital'] },
  },
  challengeFriend: {
    title: { en: 'Challenge a Friend', hu: 'Hívd ki egy barátodat' },
    subtitle: { en: 'Build a shareable challenge code or enter a friend\u2019s code.', hu: 'Hozz létre megosztható kódot, vagy add meg egy barátod kódját.' },
    icon: '🤝', color: 'purple',
    scopes: ['global', 'continents', 'hungary', 'us'],
    modes: {
      global: ['find', 'explore', 'flagMatch', 'flagReverse', 'capital', 'findCapital'],
      continents: ['find', 'explore', 'flagMatch', 'flagReverse', 'capital', 'findCapital'],
      hungary: ['find', 'explore', 'capital', 'findCapital'],
      us: ['find', 'explore', 'capital', 'findCapital'],
    },
  },
};

export const BUILDER_ROUTES = {
  findOnMap: 'find-on-map',
  explore: 'explore',
  challenges: 'challenges',
  flagSearch: 'flag-quiz',
  capitalSearch: 'capital-quiz',
  capitalLocation: 'find-capital',
  challengeFriend: 'challenge-friend',
};

export const BUILDER_COUNTS = {
  global: [10, 20, 50, 0],
  continents: [5, 10, 20, 50],
  hungary: [5, 10, 15, 20],
  us: [10, 20, 30, 0],
};

export const FRIEND_COUNTS = {
  global: [5, 10, 15, 20, 25, 30, 40, 50],
  continents: [5, 10, 15, 20, 25, 30, 40, 50],
  hungary: [5, 10, 15, 20],
  us: [5, 10, 15, 20, 25, 30, 40, 50],
};

export const DEFAULT_COUNT = { global: 20, continents: 10, hungary: 10, us: 10 };

export const BULLSEYE_RADII = [10, 25, 50, 75, 100];
export const DEFAULT_BULLSEYE = { global: 50, continents: 50, hungary: 10, us: 50 };

export const CAPITAL_FORMATS = [
  { key: 'flagName', label: { en: 'Flag + Name', hu: 'Zászló + Név' }, expert: false, hints: false },
  { key: 'flagOnly', label: { en: 'Flag only', hu: 'Csak zászló' }, expert: true, hints: false },
  { key: 'nameOnly', label: { en: 'Name only', hu: 'Csak név' }, expert: false, hints: true },
];

export const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/30' },
  gold: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
};

export function deriveScope(scopeChoice, continent) {
  if (scopeChoice === 'global') return 'world';
  if (scopeChoice === 'continents') return continent;
  return scopeChoice;
}

export function scopeChoiceFromScope(scope) {
  if (scope === 'world') return 'global';
  if (CONTINENTS.includes(scope)) return 'continents';
  if (scope === 'hungary') return 'hungary';
  if (scope === 'us') return 'us';
  return 'global';
}

export function scopeChoiceLabel(scopeChoice, lang) {
  const s = SCOPE_CHOICES.find((x) => x.key === scopeChoice);
  return s ? s.label[lang] : scopeChoice;
}

export function continentLabel(key, lang) {
  const c = CONTINENT_OPTIONS.find((x) => x.key === key);
  return c ? c.label[lang] : key;
}

export function countLabel(value, lang) {
  if (value === 0) return lang === 'hu' ? 'Összes' : 'All';
  return String(value);
}

export function modeLabel(mode, scopeChoice, lang) {
  const isH = scopeChoice === 'hungary';
  const isU = scopeChoice === 'us';
  const map = {
    find: isH ? { en: 'Find the County', hu: 'Találd Meg a Megyét' } : isU ? { en: 'Find the State', hu: 'Találd meg az államot' } : { en: 'Find Countries', hu: 'Országkeresés' },
    explore: isH ? { en: 'Explore Hungary', hu: 'Fedezd Fel Magyarországot' } : isU ? { en: 'Explore US', hu: 'USA felfedezése' } : { en: 'Explore', hu: 'Felfedezés' },
    flagMatch: { en: 'Flag Match', hu: 'Zászlópárosítás' },
    flagReverse: { en: 'Flag Reverse', hu: 'Fordított Zászlók' },
    capital: isH ? { en: 'County Seat Quiz', hu: 'Vármegye székhely kvíz' } : isU ? { en: 'State Capital Quiz', hu: 'Állam főváros kvíz' } : { en: 'Capital Quiz', hu: 'Főváros kvíz' },
    findCapital: isH ? { en: 'Find County Seat', hu: 'Vármegye székhely keresés' } : isU ? { en: 'Find State Capital', hu: 'Állam főváros keresés' } : { en: 'Find Capital', hu: 'Főváros keresés' },
  };
  return map[mode]?.[lang] || map[mode]?.en || mode;
}

// Which optional toggles apply to a (category, mode, scopeChoice) combination.
export function availableToggles(category, mode, scopeChoice) {
  const set = new Set();
  const worldLike = scopeChoice === 'global' || scopeChoice === 'continents';
  if ((mode === 'find' || mode === 'explore') && worldLike) set.add('expert');
  if (mode === 'find' && scopeChoice !== 'hungary') set.add('hints');
  if (mode === 'explore' && worldLike) set.add('hints');
  if (mode === 'capital' || mode === 'findCapital' || mode === 'explore') set.add('majorCities');
  if (mode === 'findCapital') set.add('hideRegion');
  return set;
}

export function hasVariant(category) {
  return ['challenges', 'flagSearch', 'capitalLocation', 'challengeFriend'].includes(category);
}

export function buildTags(b, lang) {
  const tags = [];
  tags.push(scopeChoiceLabel(b.scopeChoice, lang));
  if (b.scopeChoice === 'continents') tags.push(continentLabel(b.continent, lang));
  tags.push(modeLabel(b.mode, b.scopeChoice, lang));
  tags.push(`${countLabel(b.count, lang)} ${t(lang, 'builder.roundsUnit')}`);
  if (b.toggles.has('expert') && b.expert) tags.push(t(lang, 'builder.expert'));
  if (b.toggles.has('hints') && !b.expert && b.hints) tags.push(t(lang, 'builder.hints'));
  if (b.toggles.has('majorCities') && b.majorCities) tags.push(t(lang, 'builder.majorCities'));
  if (b.toggles.has('hideRegion') && b.hideRegion) tags.push(t(lang, 'builder.hideRegion'));
  if (hasVariant(b.category) && b.variant !== 'normal') tags.push(t(lang, `variants.${b.variant}`));
  if (b.mode === 'findCapital') tags.push(`${b.bullseye} km`);
  return tags;
}
