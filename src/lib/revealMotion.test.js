import { describe, expect, it, vi } from 'vitest';
import { revealMissedAnswer } from './revealMotion';
import { SETTINGS_DEFAULTS } from './storage';

function mockMap(lng = 10) {
  return {
    getCenter: vi.fn(() => ({ lat: 25, lng })),
    stop: vi.fn(), panTo: vi.fn(), flyTo: vi.fn(),
    setView: vi.fn(), fitBounds: vi.fn(), setZoom: vi.fn(),
  };
}

describe('shared wrong-answer map movement', () => {
  it('leaves the map untouched with the default setting', () => {
    const map = mockMap();
    expect(SETTINGS_DEFAULTS.animateWrongAnswers).toBe(false);
    revealMissedAnswer(map, { lat: 47, lng: 19 }, SETTINGS_DEFAULTS.animateWrongAnswers);
    Object.values(map).forEach((method) => expect(method).not.toHaveBeenCalled());
  });

  it.each([false, true])('only pans when opted in (reduced motion: %s)', (reducedMotion) => {
    const map = mockMap();
    revealMissedAnswer(map, { lat: 47, lng: 19 }, true, reducedMotion);
    expect(map.stop).toHaveBeenCalledOnce();
    expect(map.panTo).toHaveBeenCalledExactlyOnceWith([47, 19], { animate: !reducedMotion, duration: 0.6 });
    for (const method of ['flyTo', 'setView', 'fitBounds', 'setZoom']) {
      expect(map[method]).not.toHaveBeenCalled();
    }
  });

  it('does not move without a missed-answer target', () => {
    const map = mockMap();
    revealMissedAnswer(map, null, true);
    expect(map.panTo).not.toHaveBeenCalled();
  });

  it.each([[145, -175, 185], [-170, 175, -185], [540, -175, 545]])(
    'uses the nearest world copy from longitude %s to %s', (from, target, expected) => {
      const map = mockMap(from);
      revealMissedAnswer(map, { lat: -20, lng: target }, true);
      expect(map.panTo.mock.calls[0][0]).toEqual([-20, expected]);
    }
  );
});
