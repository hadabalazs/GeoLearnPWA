import { NavLink, Outlet } from 'react-router-dom';
import { Globe, LayoutDashboard, CalendarCheck, BarChart3, Settings as SettingsIcon, WifiOff } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { t } from '@/lib/i18n';
import OfflineIndicator from './OfflineIndicator';

const NAV = [
  { to: '/', icon: LayoutDashboard, key: 'nav.home' },
  { to: '/daily', icon: CalendarCheck, key: 'nav.daily' },
  { to: '/stats', icon: BarChart3, key: 'nav.stats' },
  { to: '/settings', icon: SettingsIcon, key: 'nav.settings' },
];

export default function Layout() {
  const { lang } = useApp();
  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-30">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/15 flex items-center justify-center">
            <Globe className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-lg leading-none">GeoLearn</div>
            <div className="text-[10px] text-sidebar-foreground/60 mt-0.5">{t(lang, 'tagline')}</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, key }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target ${
                isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60' }`}>
              <Icon className="w-5 h-5" />
              {t(lang, key)}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-[11px] text-sidebar-foreground/50 border-t border-sidebar-border">
          GeoLearn · v1.0
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-60 min-h-screen pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border flex safe-bottom">
        {NAV.map(({ to, icon: Icon, key }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium touch-target no-tap-highlight ${
              isActive ? 'text-foreground' : 'text-muted-foreground' }`}>
            <Icon className="w-5 h-5" />
            {t(lang, key)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}