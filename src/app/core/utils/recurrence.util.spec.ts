import { computeNextOccurrence } from './recurrence.util';
import { Reminder } from '../../core/models/reminder.model';

function baseReminder(partial: Partial<Reminder>): Reminder {
  const nowIso = new Date().toISOString();
  return {
    id: 't',
    title: 't',
    timezone: 'UTC',
    startDate: '2025-01-01T00:00:00.000Z',
    timeOfDay: '09:00',
    recurrence: { frequency: 'daily', interval: 1 },
    leadTimes: [],
    priority: 'med',
    status: 'active',
    nextOccurrence: nowIso,
    ownerId: 'u',
    createdAt: nowIso,
    updatedAt: nowIso,
    ...partial,
  } as Reminder;
}

describe('computeNextOccurrence', () => {
  it('returns same-day time when now is before time (daily)', () => {
    const r = baseReminder({
      startDate: '2025-01-01T00:00:00.000Z',
      timeOfDay: '09:00',
      recurrence: { frequency: 'daily', interval: 1 },
    });
    const res = computeNextOccurrence({ reminder: r, from: '2025-01-01T08:00:00.000Z' });
    expect(res).toBe('2025-01-01T09:00:00.000Z');
  });

  it('skips to next day when now passed time (daily)', () => {
    const r = baseReminder({
      startDate: '2025-01-01T00:00:00.000Z',
      timeOfDay: '09:00',
      recurrence: { frequency: 'daily', interval: 1 },
    });
    const res = computeNextOccurrence({ reminder: r, from: '2025-01-01T10:00:00.000Z' });
    expect(res).toBe('2025-01-02T09:00:00.000Z');
  });

  it('finds next weekday within same week (weekly byDay)', () => {
    const r = baseReminder({
      startDate: '2025-01-06T00:00:00.000Z', // Monday
      timeOfDay: '09:00',
      recurrence: { frequency: 'weekly', interval: 1, byDay: ['MO', 'WE'] },
    });
    const res = computeNextOccurrence({ reminder: r, from: '2025-01-06T10:00:00.000Z' });
    expect(res).toBe('2025-01-08T09:00:00.000Z'); // Wednesday 09:00
  });

  it('handles monthly byMonthDay clamped for short months', () => {
    const r = baseReminder({
      startDate: '2025-01-31T00:00:00.000Z',
      timeOfDay: '09:00',
      recurrence: { frequency: 'monthly', interval: 1, byMonthDay: 31 },
    });
    const res = computeNextOccurrence({ reminder: r, from: '2025-02-01T00:00:00.000Z' });
    expect(res).toBe('2025-02-28T09:00:00.000Z');
  });

  it('advances years for yearly frequency', () => {
    const r = baseReminder({
      startDate: '2025-03-10T00:00:00.000Z',
      timeOfDay: '12:30',
      recurrence: { frequency: 'yearly', interval: 1 },
    });
    const res = computeNextOccurrence({ reminder: r, from: '2026-03-10T13:00:00.000Z' });
    expect(res).toBe('2027-03-10T12:30:00.000Z');
  });
});

