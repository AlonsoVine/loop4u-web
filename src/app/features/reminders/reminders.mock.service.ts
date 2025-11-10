import { Injectable } from '@angular/core';
import { Reminder } from '../../core/models/reminder.model';
import { computeNextOccurrence } from '../../core/utils/recurrence.util';
import { demoReminders } from './seed';

const STORAGE_KEY = 'loop4u.reminders';

function generateId(): string {
  // Simple ID; reemplazar por Firestore autoId en integración real
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowIso(): string { return new Date().toISOString(); }

@Injectable({ providedIn: 'root' })
export class RemindersMockService {
  private cache: Reminder[] | null = null;

  private load(): Reminder[] {
    if (this.cache) return this.cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.cache = raw ? (JSON.parse(raw) as Reminder[]) : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache ?? []));
  }

  listAll(): Reminder[] {
    return this.load().slice();
  }

  listUpcoming(limit = 50): Reminder[] {
    const now = new Date();
    return this.load()
      .filter(r => r.status === 'active' && new Date(r.nextOccurrence).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime())
      .slice(0, limit);
  }

  listOverdue(limit = 50): Reminder[] {
    const now = new Date();
    return this.load()
      .filter(r => r.status === 'active' && new Date(r.nextOccurrence).getTime() < now.getTime())
      .sort((a, b) => new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime())
      .slice(0, limit);
  }

  listPaused(limit = 50): Reminder[] {
    return this.load()
      .filter(r => r.status === 'paused')
      .sort((a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''))
      .slice(0, limit);
  }

  getById(id: string): Reminder | undefined {
    return this.load().find(r => r.id === id);
  }

  create(input: Omit<Reminder, 'id'|'createdAt'|'updatedAt'|'nextOccurrence'>): Reminder {
    const createdAt = nowIso();
    const updatedAt = createdAt;
    const temp: Reminder = {
      ...input,
      id: generateId(),
      createdAt,
      updatedAt,
      nextOccurrence: createdAt,
    };
    // Calcular nextOccurrence real
    temp.nextOccurrence = computeNextOccurrence({ reminder: temp });
    const list = this.load();
    list.push(temp);
    this.persist();
    return temp;
  }

  update(id: string, changes: Partial<Reminder>): Reminder | undefined {
    const list = this.load();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const updated: Reminder = { ...list[idx], ...changes, updatedAt: nowIso() };
    updated.nextOccurrence = computeNextOccurrence({ reminder: updated });
    list[idx] = updated;
    this.persist();
    return updated;
  }

  delete(id: string): boolean {
    const before = this.load().length;
    this.cache = this.load().filter(r => r.id !== id);
    this.persist();
    return this.cache.length < before;
  }

  complete(id: string, at: string = nowIso()): Reminder | undefined {
    const list = this.load();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const r = list[idx];
    const history = (r.history ?? []).concat({ action: 'completed', at });
    const updated: Reminder = { ...r, lastCompletedAt: at, history };
    updated.nextOccurrence = computeNextOccurrence({ reminder: updated, from: at });
    updated.updatedAt = nowIso();
    list[idx] = updated;
    this.persist();
    return updated;
  }

  /**
   * Seed opcional con datos de ejemplo, solo si no hay nada guardado.
   */
  seedDemo(): void {
    const list = this.load();
    if (list.length > 0) return;
    for (const r of demoReminders) {
      const input: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'nextOccurrence'> = {
        title: r.title,
        notes: r.notes,
        categoryId: r.categoryId,
        timezone: r.timezone,
        startDate: r.startDate,
        timeOfDay: r.timeOfDay,
        recurrence: r.recurrence,
        leadTimes: r.leadTimes,
        priority: r.priority,
        status: r.status,
        lastCompletedAt: r.lastCompletedAt,
        nextOccurrence: r.nextOccurrence,
        history: r.history,
        ownerId: r.ownerId,
      } as unknown as Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'nextOccurrence'>;
      this.create(input);
    }
  }
}
