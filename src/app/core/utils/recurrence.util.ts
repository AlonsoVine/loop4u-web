import { parseTimeOfDay, toIso, fromIso } from './date.util';
import { Reminder } from '../models/reminder.model';
import { Weekday } from '../models/recurrence.types';

// Map JS getUTCDay() (0..6, Sun..Sat) to Weekday strings
const JS_TO_WEEKDAY: Weekday[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function addDays(d: Date, days: number): Date {
  const nd = new Date(d.getTime());
  nd.setUTCDate(nd.getUTCDate() + days);
  return nd;
}

function addMonths(d: Date, months: number): Date {
  const nd = new Date(d.getTime());
  const month = nd.getUTCMonth() + months;
  const day = nd.getUTCDate();
  nd.setUTCMonth(month, Math.min(day, daysInMonthUTC(nd.getUTCFullYear(), (month % 12 + 12) % 12)));
  return nd;
}

function addYears(d: Date, years: number): Date {
  const nd = new Date(d.getTime());
  nd.setUTCFullYear(nd.getUTCFullYear() + years);
  return nd;
}

function daysInMonthUTC(year: number, monthZeroBased: number): number {
  return new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();
}

function combineDateAndTimeUTC(dateOnlyUTC: Date, timeOfDay: string): Date {
  const { hours, minutes } = parseTimeOfDay(timeOfDay);
  const d = new Date(Date.UTC(
    dateOnlyUTC.getUTCFullYear(),
    dateOnlyUTC.getUTCMonth(),
    dateOnlyUTC.getUTCDate(),
    hours,
    minutes,
    0,
    0,
  ));
  return d;
}

export interface NextOccurrenceInput {
  reminder: Reminder;
  from?: string | Date; // compute next occurrence strictly after 'from' (default: now)
}

/**
 * computeNextOccurrence: cálculo simple y determinista en UTC.
 * Nota: Ignora DST/tz avanzada; en integración real usar `date-fns-tz`.
 */
export function computeNextOccurrence({ reminder, from }: NextOccurrenceInput): string {
  const now = from ? (typeof from === 'string' ? fromIso(from) : from) : new Date();
  const start = fromIso(reminder.startDate);

  // Punto base con hora del día
  const base = combineDateAndTimeUTC(start, reminder.timeOfDay);
  let candidate = new Date(base.getTime());

  // Si endDate existe y from > endDate al final del día, no hay próxima.
  if (reminder.endDate) {
    const end = fromIso(reminder.endDate);
    if (now.getTime() > end.getTime()) {
      return reminder.endDate; // o vacío; aquí devolvemos end como límite
    }
  }

  const { frequency, interval = 1, byDay, byMonthDay } = reminder.recurrence;

  const after = (d: Date) => d.getTime() <= now.getTime();

  switch (frequency) {
    case 'daily': {
      while (after(candidate)) {
        candidate = addDays(candidate, Math.max(1, interval));
      }
      break;
    }
    case 'weekly': {
      // Si no hay byDay, usar el día de inicio
      const by = (byDay && byDay.length) ? byDay : [JS_TO_WEEKDAY[base.getUTCDay()]];
      // Iterar por semanas hasta encontrar un día > now
      candidate = nextWeeklyOccurrence(candidate, by, interval, now, reminder.timeOfDay);
      break;
    }
    case 'monthly': {
      if (byMonthDay && byMonthDay >= 1 && byMonthDay <= 31) {
        candidate = nextMonthlyByMonthDay(candidate, byMonthDay, interval, now, reminder.timeOfDay);
      } else {
        // Fallback: mismo día del mes que start
        const startDay = base.getUTCDate();
        candidate = nextMonthlyByMonthDay(candidate, startDay, interval, now, reminder.timeOfDay);
      }
      break;
    }
    case 'yearly': {
      while (after(candidate)) {
        candidate = addYears(candidate, Math.max(1, interval));
      }
      break;
    }
    default:
      break;
  }

  return toIso(candidate);
}

/**
 * Format a human label for recurrence "frequency + interval" in English.
 * - interval 1 -> keep base words: daily/weekly/monthly/yearly
 * - interval >1 -> "every N days/weeks/months/years"
 */
export function formatRecurrenceLabel(
  freq: 'daily'|'weekly'|'monthly'|'yearly',
  interval?: number
): string {
  const n = Math.max(1, interval || 1);
  if (n === 1) return freq;
  const unit = freq === 'daily' ? 'days'
    : freq === 'weekly' ? 'weeks'
    : freq === 'monthly' ? 'months'
    : 'years';
  return `every ${n} ${unit}`;
}

function nextWeeklyOccurrence(startCandidate: Date, by: Weekday[], interval: number, now: Date, timeOfDay: string): Date {
  // Orden de días empezando desde el inicio de semana del candidate
  const ordered: Weekday[] = orderFromCandidateWeek(startCandidate, by);
  let weekStart = startOfUTCDay(startCandidate);

  while (true) {
    for (const w of ordered) {
      const d = dateOfWeekday(weekStart, w, timeOfDay);
      if (d.getTime() > now.getTime()) return d;
    }
    // Siguiente semana según intervalo
    weekStart = addDays(weekStart, 7 * Math.max(1, interval));
  }
}

function orderFromCandidateWeek(candidate: Date, by: Weekday[]): Weekday[] {
  const startIdx = candidate.getUTCDay(); // 0..6 (Sun..Sat)
  const order = [0,1,2,3,4,5,6].map(i => JS_TO_WEEKDAY[(startIdx + i) % 7]);
  return order.filter(d => by.includes(d));
}

function dateOfWeekday(weekStart: Date, weekday: Weekday, timeOfDay: string): Date {
  const weekStartDay = weekStart.getUTCDay();
  const targetIdx = JS_TO_WEEKDAY.indexOf(weekday);
  const delta = (targetIdx - weekStartDay + 7) % 7;
  const day = addDays(weekStart, delta);
  return combineDateAndTimeUTC(day, timeOfDay);
}

function startOfUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function nextMonthlyByMonthDay(candidate: Date, monthDay: number, interval: number, now: Date, timeOfDay: string): Date {
  let y = candidate.getUTCFullYear();
  let m = candidate.getUTCMonth();
  while (true) {
    const dim = daysInMonthUTC(y, m);
    const day = Math.min(monthDay, dim);
    const d = combineDateAndTimeUTC(new Date(Date.UTC(y, m, day)), timeOfDay);
    if (d.getTime() > now.getTime()) return d;
    // avanzar interval meses
    m += Math.max(1, interval);
    while (m >= 12) { y++; m -= 12; }
  }
}
