import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadAllData } from './data';
import * as storage from './storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    storage.initSettings();
    return storage.getAllSettings();
  });
  const [datasets, setDatasets] = useState(null);
  const [dataError, setDataError] = useState(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [stats, setStats] = useState(() => storage.getStats());
  const [dailyScores, setDailyScores] = useState(() => storage.getDailyScores());

  const lang = settings.appLanguage;
  const theme = settings.appTheme;

  useEffect(() => {
    loadAllData().then(setDatasets).catch((e) => setDataError(e.message || String(e)));
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-light', 'theme-sage');
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.add('theme-light');
    else if (theme === 'sage') root.classList.add('theme-sage');
    // classicNavy = default (no extra class)
  }, [theme]);

  const updateSetting = useCallback((key, value) => {
    storage.setSetting(key, value);
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const setLang = useCallback((l) => updateSetting('appLanguage', l), [updateSetting]);
  const setTheme = useCallback((th) => updateSetting('appTheme', th), [updateSetting]);

  const recordResult = useCallback((result) => {
    setStats(storage.recordGame(result));
  }, []);

  const recordDailyRatio = useCallback((dateKey, ratio) => {
    setDailyScores(storage.recordDailyRatio(dateKey, ratio));
  }, []);

  const resetStats = useCallback(() => setStats(storage.resetStats()), []);
  const clearHistory = useCallback(() => setStats(storage.clearHistory()), []);
  const resetAllStats = useCallback(() => {
    storage.resetAllStats();
    setStats(storage.getStats());
    setDailyScores(storage.getDailyScores());
  }, []);

  const value = {
    lang, setLang, theme, setTheme,
    settings, updateSetting,
    datasets, dataError, dataReady: !!datasets,
    online, stats, dailyScores, recordResult, recordDailyRatio,
    resetStats, clearHistory, resetAllStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}