import { afterEach, expect, it, vi } from 'vitest';
import { fetchCachedJson } from './cachedJson';

afterEach(() => vi.unstubAllGlobals());

it('replaces old cached data with a successful online response', async () => {
  const store = { getItem: vi.fn(() => JSON.stringify({ old: true })), setItem: vi.fn() };
  vi.stubGlobal('localStorage', store);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ updated: true }) }));
  expect(await fetchCachedJson('/data/test.json', 'test')).toEqual({ updated: true });
  expect(store.setItem).toHaveBeenCalledWith('test', '{"updated":true}');
});

it('retains cached records offline without overwriting them', async () => {
  const store = { getItem: () => '{"offline":true}', setItem: vi.fn() };
  vi.stubGlobal('localStorage', store);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  expect(await fetchCachedJson('/data/test.json', 'test')).toEqual({ offline: true });
  expect(store.setItem).not.toHaveBeenCalled();
});

it('retries a boundary download after a failed first attempt', async () => {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
  const data = { type: 'FeatureCollection', features: [] };
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ ok: true, json: async () => data });
  vi.stubGlobal('fetch', fetchMock);
  const { loadBoundaries } = await import('./boundaries');
  await expect(loadBoundaries('hungary')).rejects.toThrow('offline');
  expect(await loadBoundaries('hungary')).toEqual(data);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
