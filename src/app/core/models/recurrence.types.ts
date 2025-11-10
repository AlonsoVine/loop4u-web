export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type LeadUnit = 'minute' | 'hour' | 'day' | 'week';

export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number; // >= 1
  byDay?: Weekday[]; // for weekly/monthly (nth weekday handled client-side)
  byMonthDay?: number; // 1..31 for monthly
}

export interface LeadTime { unit: LeadUnit; value: number; }

