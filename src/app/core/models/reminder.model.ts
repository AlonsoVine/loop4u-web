import { LeadTime, Recurrence } from './recurrence.types';

export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  categoryId?: string;
  timezone: string; // IANA
  startDate: string; // ISO UTC (e.g., 2025-11-09T00:00:00.000Z)
  endDate?: string; // ISO UTC
  timeOfDay: string; // "HH:mm"
  recurrence: Recurrence;
  leadTimes: LeadTime[];
  priority: 'none' | 'low' | 'med' | 'high';
  status: 'active' | 'paused' | 'archived';
  lastCompletedAt?: string; // ISO
  nextOccurrence: string; // ISO
  history?: { action: 'completed' | 'skipped' | 'snoozed'; at: string }[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
