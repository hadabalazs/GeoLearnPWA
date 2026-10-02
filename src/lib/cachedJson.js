// Refresh once per app session; retain the last successful data for offline use.
export async function fetchCachedJson(url, storeKey, validate = (data) => data != null) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    const data = await response.json();
    if (!validate(data)) throw new Error(`Invalid data from ${url}`);
    try { localStorage.setItem(storeKey, JSON.stringify(data)); } catch {}
    return data;
  } catch (error) {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (validate(data)) return data;
      }
    } catch {}
    throw error;
  }
}
