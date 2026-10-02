import { describe, expect, it } from 'vitest';
import { buildCapitalLocationTargets, majorCityLimit, mixCapitalMajorCityOptions, selectedMajorCities, spreadRegionTargets } from './targetSelection';
import { availableToggles } from './builderConfig';

const country = { id: 'USA', type: 'country', name: 'United States', capital: 'Washington', lat: 39, lon: -98, capitalLat: 38.9, capitalLon: -77 };
const cities = [
  { name: 'Washington', lat: 38.9, lon: -77 },
  { name: 'New York', lat: 40.7, lon: -74 },
  { name: 'Los Angeles', lat: 34.1, lon: -118.2 },
  { name: 'Chicago', lat: 41.8, lon: -87.6 },
  { name: 'Houston', lat: 29.7, lon: -95.4 },
  { name: 'Phoenix', lat: 33.4, lon: -112.1 },
  { name: 'Philadelphia', lat: 39.9, lon: -75.2 },
];

describe('Capital Location target selection', () => {
  it('spreads regions using the iOS three-position greedy window without dropping targets', () => {
    const items = ['A1', 'A2', 'B1', 'C1', 'D1', 'A3', 'B2'].map((id) => ({ id, regionId: id[0] }));
    expect(spreadRegionTargets(items).map((item) => item.id)).toEqual(['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'A3']);
    expect(items.map((item) => item.id)).toEqual(['A1', 'A2', 'B1', 'C1', 'D1', 'A3', 'B2']);
  });

  it.each(['global', 'continents', 'hungary', 'us'])('offers major cities in Explore for %s', (scope) => {
    expect(availableToggles('explore', 'explore', scope).has('majorCities')).toBe(true);
  });
  it('matches the iOS city limits and excludes the capital without changing accents', () => {
    expect(majorCityLimit(country)).toBe(6);
    expect(selectedMajorCities({ ...country, capital: 'São Tomé' }, [{ name: 'Sao Tome', lat: 0, lon: 0 }])).toEqual([]);
    expect(selectedMajorCities(country, cities)).toHaveLength(6);
  });

  it('keeps a stable city prompt identity and its parent region identity', () => {
    const targets = buildCapitalLocationTargets([country], { countryMajorCities: { USA: cities } }, true);
    expect(targets).toHaveLength(7);
    expect(targets[0]).toMatchObject({ id: 'USA', regionId: 'USA', isMajorCity: false });
    expect(targets[1]).toMatchObject({ id: 'USA-New York', regionId: 'USA', capital: 'New York', isMajorCity: true });
  });

  it('uses only the current region’s major cities as capital-quiz distractors', () => {
    const fallback = [country, { id: 'CAN', capital: 'Ottawa' }, { id: 'MEX', capital: 'Mexico City' }, { id: 'BRA', capital: 'Brasília' }];
    const options = mixCapitalMajorCityOptions(country, fallback, { countryMajorCities: { USA: cities } }, true);
    expect(options.map((option) => option.capital)).toEqual(['Washington', 'New York', 'Los Angeles', 'Chicago']);
    expect(options[1].id).toBe('USA:city:New York');
  });
});
