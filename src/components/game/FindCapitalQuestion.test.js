import React from 'react';
import { act, create } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
import FindCapitalQuestion from './FindCapitalQuestion';

vi.mock('../MapView', () => ({ default: (props) => React.createElement('test-map', props) }));
vi.mock('@/lib/boundaries', () => ({ useBoundary: () => null }));

it('names the major city, permits adjusting a pin, and submits once on confirmation', () => {
  const onResult = vi.fn();
  const props = {
    target: { id: 'FRA-Lyon', regionId: 'FRA', name: 'France', capital: 'Lyon', capitalLat: 45.76, capitalLon: 4.84 },
    ds: {}, lang: 'en', config: { scope: 'europe' }, status: 'playing', roundIndex: 0, onResult,
  };
  const view = create(React.createElement(FindCapitalQuestion, props));
  expect(JSON.stringify(view.toJSON())).toContain('Lyon');
  expect(view.root.findByType('button').props.disabled).toBe(true);
  act(() => { view.root.findByType('test-map').props.onMapClick({ lat: 48.85, lng: 2.35 }); });
  expect(onResult).not.toHaveBeenCalled();
  act(() => { view.root.findByType('test-map').props.onMapClick({ lat: 45.76, lng: 4.84 }); });
  expect(onResult).not.toHaveBeenCalled();
  act(() => {
    view.root.findByType('button').props.onClick();
    view.root.findByType('button').props.onClick();
  });
  expect(onResult).toHaveBeenCalledTimes(1);
  expect(onResult).toHaveBeenCalledWith(true, { distance: 0 });
  act(() => { view.update(React.createElement(FindCapitalQuestion, { ...props, roundIndex: 1 })); });
  expect(view.root.findByType('button').props.disabled).toBe(true);
  act(() => { view.unmount(); });
});
