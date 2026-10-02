import React from 'react';
import { act, create } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
import Home from './Home';
import BuilderPage from '@/components/builder/BuilderPage';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('@/lib/AppContext', () => ({ useApp: () => ({ lang: 'en', dailyScores: {}, settings: {} }) }));
vi.mock('@/components/DailyCalendarDialog', () => ({ default: () => null }));
vi.mock('@/components/settings/InstallGuide', () => ({ default: () => null }));
vi.mock('@/hooks/useInstallPrompt', () => ({ useInstallPrompt: () => {}, shouldAutoShow: () => false, markInstallGuideSeen: () => {} }));

it.each([['home', Home, {}], ['friend builder', BuilderPage, { category: 'challengeFriend' }]])(
  'preserves GL2 case through the %s input and launches the encoded order', (_name, Component, props) => {
    navigate.mockClear();
    const payload = { version: 2, mode: 'G', scope: 'Europe', count: 2, seed: 123456, variant: 'normal',
      isExpert: false, hintsEnabled: true, mixedMajorCitiesInCapitalOptions: false,
      timeLimit: 75, orderedTargetIDs: ['FRA', 'DEU'] };
    const code = `GL2-${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
    const view = create(React.createElement(Component, props));
    act(() => { view.root.findByType('input').props.onChange({ target: { value: code } }); });
    expect(view.root.findByType('input').props.value).toBe(code);
    expect(view.root.findByType('input').props.className).toContain('border-correct');
    // Only the parsed-code launch control has an explicit disabled=false prop.
    const launch = view.root.findAllByType('button').find((button) => button.props.disabled === false);
    expect(launch).toBeTruthy();
    act(() => { launch.props.onClick(); });
    expect(navigate).toHaveBeenLastCalledWith('/game', { state: { config: expect.objectContaining({ targets: ['FRA', 'DEU'], timeLimit: 75 }) } });
    act(() => { view.unmount(); });
  },
);
