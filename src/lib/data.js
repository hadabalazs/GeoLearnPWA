// GeoLearn data layer — loads the geography datasets, caches them in
// localStorage so the app works offline after first load, and exposes
// normalized accessors used across the game.
//
// Datasets are served exclusively from this site's own /data folder
// (fully self-hosted, no external dependency).

const DATA_FILES = {
  countries: 'countries.json',
  countryProfiles: 'country_profiles.json',
  countryFacts: 'country_facts.json',
  countryFactsHu: 'country_facts_hu.json',
  countryMajorCities: 'country_major_cities.json',
  usStates: 'us_states.json',
  usStateProfiles: 'us_state_profiles.json',
  usStateFacts: 'us_state_facts.json',
  usStateFactsHu: 'us_state_facts_hu.json',
  usStateMajorCities: 'us_state_major_cities.json',
  hungaryCounties: 'hungary_counties.json',
  countyProfiles: 'county_profiles.json',
  countyFacts: 'county_facts.json',
  countyFactsHu: 'county_facts_hu.json',
  countyMajorCities: 'county_major_cities.json',
};

export const DATA_URLS = Object.fromEntries(
  Object.entries(DATA_FILES).map(([k, f]) => [k, `/data/${f}`])
);

const memCache = {};

export async function loadData(key) {
  if (memCache[key]) return memCache[key];
  const storeKey = `geolearn:data:${key}`;
  let data = null;
  try {
    const raw = localStorage.getItem(storeKey);
    if (raw) data = JSON.parse(raw);
  } catch {}
  if (!data) {
    const res = await fetch(DATA_URLS[key]);
    if (!res.ok) throw new Error(`Failed to load ${key}`);
    data = await res.json();
    try { localStorage.setItem(storeKey, JSON.stringify(data)); } catch {}
  }
  memCache[key] = data;
  return data;
}

export async function loadAllData() {
  const keys = Object.keys(DATA_URLS);
  const values = await Promise.all(keys.map((k) => loadData(k)));
  const obj = {};
  keys.forEach((k, i) => { obj[k] = values[i]; });
  return obj;
}

export const CONTINENTS = ['africa', 'americas', 'asia', 'europe', 'oceania'];

function continentMatch(country, scope) {
  const cont = (country.continent || '').toLowerCase();
  if (scope === 'americas') return cont.includes('america');
  return cont === scope;
}

// Normalize any source record into a uniform game item.
function norm(rec, type) {
  return {
    id: rec.id,
    name: rec.name,
    nameHU: rec.nameHU || rec.name,
    capital: rec.capital || rec.seat || '',
    seat: rec.seat || rec.capital || '',
    lat: rec.lat ?? rec.latitude,
    lon: rec.lon ?? rec.longitude,
    capitalLat: rec.capitalLat ?? rec.capitalLatitude ?? rec.seatLatitude ?? rec.seatLat,
    capitalLon: rec.capitalLon ?? rec.capitalLongitude ?? rec.seatLongitude ?? rec.seatLon,
    type,
    flagCode: rec.flagCode,
    continent: rec.continent,
  };
}

export function scopeItems(scope, ds) {
  if (!ds) return [];
  if (scope === 'world') return ds.countries.map((c) => norm(c, 'country'));
  if (CONTINENTS.includes(scope)) return ds.countries.filter((c) => continentMatch(c, scope)).map((c) => norm(c, 'country'));
  if (scope === 'hungary') return ds.hungaryCounties.map((c) => norm(c, 'county'));
  if (scope === 'us') return ds.usStates.map((c) => norm(c, 'state'));
  return [];
}

export function scopeLabel(scope, lang) {
  const labels = {
    world: { en: 'World', hu: 'Világ' },
    africa: { en: 'Africa', hu: 'Afrika' },
    americas: { en: 'Americas', hu: 'Amerikák' },
    asia: { en: 'Asia', hu: 'Ázsia' },
    europe: { en: 'Europe', hu: 'Európa' },
    oceania: { en: 'Oceania', hu: 'Óceánia' },
    hungary: { en: 'Hungary', hu: 'Magyarország' },
    us: { en: 'United States', hu: 'Egyesült Államok' },
  };
  return labels[scope]?.[lang] || scope;
}

export function localizedName(item, lang) {
  return lang === 'hu' ? item.nameHU || item.name : item.name;
}

export function getFact(id, type, lang, ds) {
  if (!ds) return null;
  if (type === 'country') return (lang === 'hu' ? ds.countryFactsHu?.[id] : ds.countryFacts?.[id]) ?? null;
  if (type === 'state') return (lang === 'hu' ? ds.usStateFactsHu?.[id] : ds.usStateFacts?.[id]) ?? null;
  if (type === 'county') return (lang === 'hu' ? ds.countyFactsHu?.[id] : ds.countyFacts?.[id]) ?? null;
  return null;
}

export function getMajorCities(id, type, ds) {
  if (!ds) return [];
  if (type === 'country') return ds.countryMajorCities?.[id] || [];
  if (type === 'state') return ds.usStateMajorCities?.[id] || [];
  if (type === 'county') return ds.countyMajorCities?.[id] || [];
  return [];
}

export function getProfile(id, type, ds) {
  if (!ds) return null;
  if (type === 'country') return ds.countryProfiles?.[id] || null;
  if (type === 'state') return ds.usStateProfiles?.[id] || null;
  if (type === 'county') return ds.countyProfiles?.[id] || null;
  return null;
}

export function flagUrl(flagCode, w = 320) {
  // Somaliland has no ISO 3166-1 alpha-2 code, so flagcdn.com (which uses
  // ISO codes) can't serve it. Fall back to the Wikimedia Commons thumbnail.
  if (flagCode === 'somaliland') {
    // Wikimedia only serves a 330px PNG thumb for this file; CSS scales it.
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Flag_of_Somaliland.svg/330px-Flag_of_Somaliland.svg.png';
  }
  return `https://flagcdn.com/w${w}/${flagCode}.png`;
}
