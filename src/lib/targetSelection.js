import { getMajorCities } from './data';

// Matches AntiRepeatPicker.spread in iOS. Explicit replay orders bypass this.
export function spreadRegionTargets(items, spacing = 3) {
  const pending = [...items];
  const result = [];
  while (pending.length) {
    const recent = new Set(result.slice(-spacing).map((item) => item.regionId));
    const index = pending.findIndex((item) => !recent.has(item.regionId));
    result.push(pending.splice(Math.max(0, index), 1)[0]);
  }
  return result;
}

const LARGE_COUNTRY_IDS = new Set(['AUS', 'BRA', 'CAN', 'CHN', 'IND', 'RUS', 'USA']);
const CITY_STATE_IDS = new Set(['AND', 'BHR', 'BRN', 'COM', 'DMA', 'LIE', 'LUX', 'MLT', 'MCO', 'SGP', 'SMR', 'VAT']);
const LARGE_STATE_IDS = new Set(['CA', 'TX', 'FL', 'NY', 'PA', 'IL']);

function folded(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

export function majorCityLimit(item) {
  if (item.type === 'country') {
    if (CITY_STATE_IDS.has(item.id)) return 1;
    return LARGE_COUNTRY_IDS.has(item.id) ? 6 : 3;
  }
  if (item.type === 'state') return LARGE_STATE_IDS.has(item.id) ? 5 : 3;
  return 3;
}

export function selectedMajorCities(item, cities) {
  const capital = folded(item.capital);
  return (cities || [])
    .filter((city) => folded(city.name) !== capital && Number.isFinite(city.lat) && Number.isFinite(city.lon))
    .slice(0, majorCityLimit(item));
}

// Capital Location uses individual city prompts while retaining the parent
// country/state/county identity for boundary display and statistics.
export function buildCapitalLocationTargets(items, ds, includeMajorCities) {
  const targets = items
    .filter((item) => Number.isFinite(item.capitalLat ?? item.lat) && Number.isFinite(item.capitalLon ?? item.lon))
    .map((item) => ({
      ...item,
      regionId: item.id,
      promptId: item.id,
      capitalLat: item.capitalLat ?? item.lat,
      capitalLon: item.capitalLon ?? item.lon,
      isMajorCity: false,
    }));

  if (!includeMajorCities) return targets;

  return targets.flatMap((target) => [
    target,
    ...selectedMajorCities(target, getMajorCities(target.regionId, target.type, ds)).map((city) => ({
      ...target,
      id: `${target.regionId}-${city.name}`,
      promptId: `${target.regionId}-${city.name}`,
      capital: city.name,
      capitalLat: city.lat,
      capitalLon: city.lon,
      isMajorCity: true,
    })),
  ]);
}

// Capital quizzes use major cities belonging to the current target as
// distractors. The answer keeps its region identity; city choices get a
// separate stable option identity so React keys and selected feedback remain
// unambiguous even when two regions share a city name.
export function mixCapitalMajorCityOptions(target, fallbackOptions, ds, includeMajorCities) {
  if (!includeMajorCities) return fallbackOptions;
  const usedCapitals = new Set([target.capital]);
  const cityOptions = selectedMajorCities(target, getMajorCities(target.id, target.type, ds))
    .filter((city) => !usedCapitals.has(city.name))
    .slice(0, 3)
    .map((city) => {
      usedCapitals.add(city.name);
      return { ...target, id: `${target.id}:city:${city.name}`, capital: city.name, isMajorCity: true };
    });
  let cityIndex = 0;
  return fallbackOptions.map((option) => {
    if (option.id === target.id) return target;
    const city = cityOptions[cityIndex];
    if (city) {
      cityIndex += 1;
      return city;
    }
    return option;
  });
}
