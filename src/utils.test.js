import { describe, expect, it } from 'vitest';

import { getBatchRunLabel } from './utils';

describe('getBatchRunLabel', () => {
  it('shows the run day, the location and the period', () => {
    expect(getBatchRunLabel({
      runDate: '2024-02-03T10:15:00',
      runYear: 2024,
      runMonth: 1,
      location: { code: 'R1', name: 'Region One' },
    })).toBe('2024-02-03 R1 Region One: 2024-1');
  });

  it('is empty when nothing is selected', () => {
    expect(getBatchRunLabel(null)).toBe('');
  });

  // Currently fails: a batch run processed for the whole country has no location, and
  // the label reads location.code unguarded, so the picker throws on such a run.
  it.fails('labels a national batch run, which has no location', () => {
    const label = getBatchRunLabel({
      runDate: '2024-02-03T10:15:00', runYear: 2024, runMonth: 1, location: null,
    });

    expect(label).toContain('2024-02-03');
    expect(label).toContain('2024-1');
  });
});
