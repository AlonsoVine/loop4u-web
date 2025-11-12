import { Component, computed, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemindersMockService } from '../reminders/reminders.mock.service';
import { Reminder } from '../../core/models/reminder.model';
import { computeNextOccurrence, formatRecurrenceLabel } from '../../core/utils/recurrence.util';
import { SettingsService } from '../../core/services/settings.service';
import { CategoriesService } from '../../core/services/categories.service';
import { RouterLink } from '@angular/router';

interface DayCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

@Component({
  standalone: true,
  selector: 'app-calendar',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4">
      <header class="flex items-center justify-between mb-4">
        <button
          class="px-2 py-1 text-sm rounded border border-neutral-300 dark:border-neutral-700"
          (click)="prev()"
        >
          «
        </button>
        <h1 class="text-xl font-semibold">{{ headerLabel() }}</h1>
        <button
          class="px-2 py-1 text-sm rounded border border-neutral-300 dark:border-neutral-700"
          (click)="next()"
        >
          »
        </button>
      </header>

      <div class="grid grid-cols-7 text-xs text-neutral-500 mb-1">
        <div *ngFor="let w of weekdays" class="py-1 text-center">{{ w }}</div>
      </div>

      <div class="grid grid-cols-7 gap-px rounded bg-neutral-200/70 dark:bg-neutral-700/60">
        <ng-container *ngFor="let d of days()">
          <div
            class="min-h-24 bg-white dark:bg-neutral-900 p-1.5 text-xs cursor-pointer"
            [class.opacity-50]="!d.inMonth"
            [class.ring-2]="d.isToday"
            [class.ring-emerald-500]="d.isToday"
            (click)="selectDay(d.date)"
          >
            <div class="text-right text-[11px] mb-0.5">{{ d.date | date : 'd' }}</div>
            <ng-container *ngIf="eventsByDay()[dayKey(d.date)] as items">
              <div
                class="grid gap-0.5 h-[3.8rem]"
                [style.gridTemplateRows]="
                  'repeat(' + (items.length > 0 ? min(items.length, 4) : 0) + ', minmax(0,1fr))'
                "
              >
                <ng-container *ngIf="items.length === 0">
                  <div class="h-full"></div>
                </ng-container>
                <ng-container *ngIf="items.length > 0">
                  <ng-container *ngFor="let ev of items | slice : 0 : 3">
                    <div
                      class="relative min-h-0 overflow-hidden rounded border border-neutral-200 dark:border-neutral-700 px-1 pt-1 pl-2 flex items-start gap-1.5"
                      [class.opacity-60]="ev.r.status === 'paused'"
                    >
                      <span
                        class="absolute left-0 top-0 bottom-0 w-1 rounded"
                        [ngClass]="bgCategory(ev.r.categoryId)"
                      ></span>
                      <span
                        class="absolute right-1 top-1 inline-block h-2.5 w-2.5 rounded-full"
                        [ngClass]="priorityDotClass(ev.r.priority)"
                      ></span>
                      <span
                        *ngIf="ev.r.status === 'paused'"
                        class="absolute right-1 bottom-0.5 text-[10px] leading-none text-amber-500"
                        >â¸</span
                      >
                      <span class="text-base leading-none">{{
                        categoryEmoji(ev.r.categoryId)
                      }}</span>
                      <a
                        [routerLink]="['/reminders', ev.r.id, 'edit']"
                        class="truncate hover:underline"
                        >{{ ev.r.title }}</a
                      >
                    </div>
                  </ng-container>
                  <div
                    *ngIf="items.length > 3"
                    class="min-h-0 overflow-hidden rounded border border-dashed border-neutral-200 dark:border-neutral-700 px-1 flex items-center text-neutral-500"
                  >
                    â€¦ +{{ items.length - 3 }}
                  </div>
                </ng-container>
              </div>
            </ng-container>
          </div>
        </ng-container>
      </div>

      <section class="mt-4" *ngIf="selectedIso() as sel" #dayDetails>
        <h2 class="text-lg font-semibold mb-2">{{ sel | date : 'fullDate' }}</h2>
        <ul
          *ngIf="eventsByDay()[sel.slice(0, 10)] as items; else empty"
          class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60"
        >
          <li
            *ngFor="let ev of items"
            class="py-2 relative pl-3"
            [class.opacity-60]="ev.r.status === 'paused'"
          >
            <span
              class="absolute left-0 top-1 bottom-1 w-1 rounded-full"
              [ngClass]="bgCategory(ev.r.categoryId)"
            ></span>
            <span
              class="absolute right-0 top-0 inline-block h-2.5 w-2.5 rounded-full"
              [ngClass]="priorityDotClass(ev.r.priority)"
            ></span>
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-sm md:text-base inline-flex items-center gap-2">
                <span class="text-base leading-none">{{ categoryEmoji(ev.r.categoryId) }}</span>
                <a
                  [routerLink]="['/reminders', ev.r.id, 'edit']"
                  class="truncate hover:underline"
                  >{{ ev.r.title }}</a
                >
                <span
                  *ngIf="ev.r.status === 'paused'"
                  class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border border-amber-400 text-amber-600"
                  >Pausado</span
                >
              </span>
              <time class="text-xs text-neutral-500">{{ ev.at | date : dateFormat() }}</time>
            </div>
            <div class="text-xs text-neutral-500">
              {{ recurrenceLabel(ev.r.recurrence) }} &middot; {{ ev.r.timeOfDay }}
            </div>
          </li>
        </ul>
        <div *ngIf="eventsByDay()[sel.slice(0, 10)]?.length" class="mt-2">
          <a
            routerLink="/reminders/new"
            [queryParams]="{ date: sel.slice(0, 10) }"
            class="inline-flex items-center rounded border px-3 py-1.5 text-sm border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >Crear recordatorio</a
          >
          <div class="h-16"></div>
        </div>
        <ng-template #empty
          ><div class="text-sm text-neutral-500">
            <p>Sin recordatorios este d&iacute;a.</p>
            <div class="mt-2">
              <a
                routerLink="/reminders/new"
                [queryParams]="{ date: sel.slice(0, 10) }"
                class="inline-flex items-center rounded border px-3 py-1.5 text-sm border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >Crear recordatorio</a
              >
            </div>
          </div></ng-template
        >
      </section>
    </div>
  `,
})
export class CalendarPage {
  private today = new Date();
  year = signal(this.today.getUTCFullYear());
  month = signal(this.today.getUTCMonth()); // 0..11
  private reminders = inject(RemindersMockService);
  private settings = inject(SettingsService);
  private cats = inject(CategoriesService);

  selectedIso = signal<string | null>(null);
  @ViewChild('dayDetails') dayDetails?: ElementRef<HTMLElement>;

  weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  headerLabel = computed(() =>
    new Date(Date.UTC(this.year(), this.month(), 1)).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  );

  days = computed<DayCell[]>(() => {
    const y = this.year();
    const m = this.month();
    const first = new Date(Date.UTC(y, m, 1));
    const last = new Date(Date.UTC(y, m + 1, 0));
    // Monday start: getUTCDay() 0..6 (Sun..Sat) -> we want 1..7 where 1=Mon
    const firstWeekday = (first.getUTCDay() + 6) % 7; // 0..6 offset from Monday
    const daysInMonth = last.getUTCDate();
    const cells: DayCell[] = [];
    // Start date = Monday of first week
    const start = new Date(first);
    start.setUTCDate(first.getUTCDate() - firstWeekday);
    // 6 weeks grid to cover all cases
    for (let i = 0; i < 42; i++) {
      const d = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i)
      );
      const inMonth = d.getUTCMonth() === m;
      const isToday = this.isSameUTCDate(d, this.today);
      cells.push({ date: d, inMonth, isToday });
    }
    return cells;
  });

  // Rango visible del mes en ISO
  private monthStart = computed(() =>
    new Date(Date.UTC(this.year(), this.month(), 1)).toISOString()
  );
  private monthEnd = computed(() =>
    new Date(Date.UTC(this.year(), this.month() + 1, 0, 23, 59, 59, 999)).toISOString()
  );

  // Eventos por dÃ­a del mes visible
  eventsByDay = computed(() => this.computeMonthEvents(this.monthStart(), this.monthEnd()));

  dateFormat = computed(() => (this.settings.hourFormat() === '24' ? 'HH:mm' : 'h:mm a'));

  prev(): void {
    let y = this.year();
    let m = this.month() - 1;
    if (m < 0) {
      y--;
      m = 11;
    }
    this.year.set(y);
    this.month.set(m);
  }

  next(): void {
    let y = this.year();
    let m = this.month() + 1;
    if (m > 11) {
      y++;
      m = 0;
    }
    this.year.set(y);
    this.month.set(m);
  }

  private isSameUTCDate(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  selectDay(d: Date) {
    this.selectedIso.set(
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString()
    );
    // Scroll suave hacia el bloque de detalles tras renderizar
    setTimeout(() => {
      try {
        this.dayDetails?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {}
    });
  }

  private computeMonthEvents(
    startIso: string,
    endIso: string
  ): Record<string, { r: Reminder; at: string }[]> {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const result: Record<string, { r: Reminder; at: string }[]> = {};
    for (const r of this.reminders.listAll()) {
      // primera ocurrencia >= start
      let from = new Date(start.getTime() - 1).toISOString();
      while (true) {
        const next = computeNextOccurrence({ reminder: r, from });
        const nextD = new Date(next);
        if (nextD.getTime() > end.getTime()) break;
        const key = this.dayKey(nextD);
        (result[key] ||= []).push({ r, at: next });
        // avanzar desde la ocurrencia para siguiente
        from = new Date(nextD.getTime() + 1000).toISOString();
      }
    }
    // ordenar por hora dentro del dÃ­a
    for (const k of Object.keys(result)) {
      result[k].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    }
    return result;
  }

  dayKey(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Helper accesible en template
  min(a: number, b: number) {
    return Math.min(a, b);
  }

  priorityDotClass(p: 'none' | 'low' | 'med' | 'high') {
    switch (p) {
      case 'none':
        return 'hidden';
      case 'high':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.55)]';
      case 'med':
        return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.55)]';
      default:
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]';
    }
  }

  categoryEmoji(categoryId?: string): string {
    return this.cats.icon(categoryId);
  }
  bgCategory(categoryId?: string): string {
    const c = this.cats.color(categoryId) || 'neutral-400';
    return 'bg-' + c.replace(/[^a-z0-9-]/gi, '');
  }
  recurrenceLabel(rec: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
  }): string {
    return formatRecurrenceLabel(rec.frequency, rec.interval ?? 1);
  }
}
