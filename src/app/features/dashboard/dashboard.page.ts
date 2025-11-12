import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RemindersMockService } from '../reminders/reminders.mock.service';
import { SettingsService } from '../../core/services/settings.service';
import { CategoriesService } from '../../core/services/categories.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Dashboard</h1>
          <p class="text-sm text-neutral-500">Resumen y listas</p>
        </div>
        <a
          routerLink="/reminders/new"
          class="inline-flex items-center rounded border px-3 py-1.5 text-sm border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          Crear recordatorio
        </a>
      </header>

      <div
        *ngIf="!hasAny()"
        class="rounded border border-dashed p-4 text-sm border-neutral-300 dark:border-neutral-700"
      >
        <p class="mb-2 text-neutral-500">Añade un nuevo recordatorio cuando lo necesites.</p>
        <div>
          <a
            routerLink="/reminders/new"
            class="inline-flex items-center rounded bg-emerald-600 px-3 py-2 text-white text-sm"
          >
            Crear recordatorio
          </a>
        </div>
      </div>

      <!-- Selector de vista -->
      <div class="mt-4 -mb-2 flex items-center justify-end gap-2">
        <label class="text-sm text-neutral-600 dark:text-neutral-300">Ver:</label>
        <select
          class="text-sm rounded border px-2 py-1 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          [value]="activeTab()"
          (change)="selectTab($any($event.target).value)"
        >
          <option value="upcoming">Próximos</option>
          <option value="all">Todos</option>
          <option value="categories">Categorías</option>
          <option value="paused">Pausados</option>
          <option value="overdue">Atrasados</option>
        </select>
      </div>

      <!-- Próximos -->
      <section *ngIf="activeTab() === 'upcoming'">
        <div class="flex items-center justify-between mt-6 mb-3">
          <h2 class="text-lg md:text-xl font-semibold">Próximos</h2>
        </div>
        <div *ngIf="upcoming().length === 0" class="text-sm text-neutral-500">
          Nada por ahora. Crea tu primer recordatorio.
        </div>
        <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60">
          <li *ngFor="let r of upcoming()" class="py-2 relative pl-3">
            <span
              class="absolute left-0 top-1 bottom-1 w-1 rounded-full"
              [ngClass]="bgCategory(r.categoryId)"
            ></span>
            <span
              class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full"
              [ngClass]="priorityDotClass(r.priority)"
            ></span>
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-sm md:text-base inline-flex items-center gap-2">
                <span class="text-base leading-none">{{ categoryEmoji(r.categoryId) }}</span>
                <a [routerLink]="['/reminders', r.id, 'edit']" class="truncate hover:underline">{{
                  r.title
                }}</a>
              </span>
              <time class="text-xs text-neutral-500">{{
                r.nextOccurrence | date : dateFormat()
              }}</time>
            </div>
            <div class="text-xs text-neutral-500">
              {{ r.recurrence.frequency }} · {{ r.timeOfDay }}
            </div>
          </li>
        </ul>
      </section>

      <!-- Categorías -->
      <section *ngIf="activeTab() === 'categories'">
        <h2 class="text-lg md:text-xl font-semibold mt-6 mb-3">Categorías</h2>
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            *ngFor="let c of categoriesForChips()"
            type="button"
            (click)="selectCategory(c.id)"
            [ngClass]="chipClass(c.id === selectedCategory())"
            class="inline-flex items-center gap-1"
          >
            <span class="text-base leading-none">{{ c.emoji }}</span>
            <span class="text-sm">{{ c.name }}</span>
          </button>
        </div>
        <div *ngIf="bySelectedCategory().length === 0" class="text-sm text-neutral-500">
          Sin elementos para esta categoría.
        </div>
        <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60">
          <li *ngFor="let r of bySelectedCategory()" class="py-2 relative pl-3">
            <span
              class="absolute left-0 top-1 bottom-1 w-1 rounded-full"
              [ngClass]="bgCategory(r.categoryId)"
            ></span>
            <span
              class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full"
              [ngClass]="priorityDotClass(r.priority)"
            ></span>
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-sm md:text-base inline-flex items-center gap-2">
                <span class="text-base leading-none">{{ categoryEmoji(r.categoryId) }}</span>
                <a [routerLink]="['/reminders', r.id, 'edit']" class="truncate hover:underline">{{
                  r.title
                }}</a>
              </span>
              <time class="text-xs text-neutral-500">{{
                r.nextOccurrence | date : dateFormat()
              }}</time>
            </div>
            <div class="text-xs text-neutral-500">
              {{ r.recurrence.frequency }} · {{ r.timeOfDay }}
            </div>
          </li>
        </ul>
      </section>

      <!-- Pausados -->
      <section *ngIf="activeTab() === 'paused'">
        <h2 class="text-lg md:text-xl font-semibold mt-6 mb-3">Pausados</h2>
        <div *ngIf="paused().length === 0" class="text-sm text-neutral-500">
          No hay recordatorios pausados.
        </div>
        <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60">
          <li *ngFor="let r of paused()" class="py-2 relative pl-3 opacity-60">
            <span
              class="absolute left-0 top-1 bottom-1 w-1 rounded-full"
              [ngClass]="bgCategory(r.categoryId)"
            ></span>
            <span
              class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full"
              [ngClass]="priorityDotClass(r.priority)"
            ></span>
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-sm md:text-base inline-flex items-center gap-2">
                <span class="text-base leading-none">{{ categoryEmoji(r.categoryId) }}</span>
                <a [routerLink]="['/reminders', r.id, 'edit']" class="truncate hover:underline">{{
                  r.title
                }}</a>
                <button
                  type="button"
                  (click)="onResume(r.id)"
                  class="text-[10px] inline-flex items-center rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 px-2 py-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                >
                  Reanudar
                </button>
              </span>
              <time class="text-xs text-neutral-500">{{ r.updatedAt | date : dateFormat() }}</time>
            </div>
            <div class="text-xs text-neutral-500">
              {{ r.recurrence.frequency }} · {{ r.timeOfDay }}
            </div>
          </li>
        </ul>
      </section>

      <!-- Atrasados -->
      <section *ngIf="activeTab() === 'overdue'">
        <h2 class="text-lg md:text-xl font-semibold mt-6 mb-3">Atrasados</h2>
        <div *ngIf="overdue().length === 0" class="text-sm text-neutral-500">Sin pendientes.</div>
        <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60">
          <li *ngFor="let r of overdue()" class="py-2 relative pl-3">
            <span
              class="absolute left-0 top-1 bottom-1 w-1 rounded-full"
              [ngClass]="bgCategory(r.categoryId)"
            ></span>
            <span
              class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full"
              [ngClass]="priorityDotClass(r.priority)"
            ></span>
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-sm md:text-base inline-flex items-center gap-2">
                <span class="text-base leading-none">{{ categoryEmoji(r.categoryId) }}</span>
                <a [routerLink]="['/reminders', r.id, 'edit']" class="truncate hover:underline">{{
                  r.title
                }}</a>
              </span>
              <time class="text-xs text-neutral-500">{{
                r.nextOccurrence | date : dateFormat()
              }}</time>
            </div>
            <div class="text-xs text-neutral-500">
              {{ r.recurrence.frequency }} · {{ r.timeOfDay }}
            </div>
          </li>
        </ul>
      </section>

      <!-- Todos -->
      <section *ngIf="activeTab() === 'all'">
        <div class="flex items-center justify-between mt-6 mb-3">
          <h2 class="text-lg md:text-xl font-semibold">Todos</h2>
        </div>

        <form class="flex items-center gap-3 text-sm mb-3">
          <label class="text-neutral-600 dark:text-neutral-300">Ordenar por</label>
          <select
            class="rounded border px-2 py-1 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            [value]="sortBy()"
            (change)="setSortBy($any($event.target).value)"
          >
            <option value="next">Proximidad</option>
            <option value="priority">Prioridad</option>
            <option value="title">Título</option>
            <option value="category">Categoría</option>
            <option value="status">Estado</option>
            <option value="updated">Actualizado</option>
            <option value="created">Creado</option>
          </select>

          <select
            class="rounded border px-2 py-1 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            [value]="sortDir()"
            (change)="setSortDir($any($event.target).value)"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </form>

        <div *ngIf="allSorted().length === 0" class="text-sm text-neutral-500">Sin elementos.</div>

        <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60">
          <li
            *ngFor="let r of allSorted()"
            class="py-2 relative pl-3"
            [class.opacity-60]="r.status === 'paused'"
          >
            <span
              class="absolute left-0 top-1 bottom-1 w-1 rounded-full"
              [ngClass]="bgCategory(r.categoryId)"
            ></span>
            <span
              class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full"
              [ngClass]="priorityDotClass(r.priority)"
            ></span>
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-medium text-sm md:text-base inline-flex items-center gap-2">
                <span class="text-base leading-none">{{ categoryEmoji(r.categoryId) }}</span>
                <a [routerLink]="['/reminders', r.id, 'edit']" class="truncate hover:underline">{{
                  r.title
                }}</a>
                <span
                  *ngIf="r.status === 'paused'"
                  class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border border-amber-400 text-amber-600"
                >
                  Pausado
                </span>
              </span>
              <time class="text-xs text-neutral-500">{{
                r.nextOccurrence | date : dateFormat()
              }}</time>
            </div>
            <div class="text-xs text-neutral-500">
              {{ r.recurrence.frequency }} · {{ r.timeOfDay }}
            </div>
          </li>
        </ul>
      </section>
    </div>
  `,
})
export class DashboardPage {
  private service = inject(RemindersMockService);
  private settings = inject(SettingsService);
  private cats = inject(CategoriesService);

  private version = signal(0);

  // Vista actual (selector)
  activeTab = signal<'upcoming' | 'categories' | 'paused' | 'overdue' | 'all'>('upcoming');
  selectTab(tab: 'upcoming' | 'categories' | 'paused' | 'overdue' | 'all') {
    this.activeTab.set(tab);
  }

  // Lists
  upcoming = computed(() => {
    this.version();
    return this.service.listUpcoming();
  });
  overdue = computed(() => {
    this.version();
    return this.service.listOverdue();
  });
  paused = computed(() => {
    this.version();
    return this.service.listPaused();
  });
  hasAny = computed(() => {
    this.version();
    return this.service.listAll().length > 0;
  });

  dateFormat = computed(() =>
    this.settings.hourFormat() === '24' ? 'dd/MM/yy, HH:mm' : 'dd/MM/yy, h:mm a'
  );

  // Todos + ordenación
  sortBy = signal<'next' | 'priority' | 'title' | 'category' | 'status' | 'updated' | 'created'>(
    'next'
  );
  sortDir = signal<'asc' | 'desc'>('asc');
  setSortBy(v: 'next' | 'priority' | 'title' | 'category' | 'status' | 'updated' | 'created') {
    this.sortBy.set(v);
  }
  setSortDir(v: 'asc' | 'desc') {
    this.sortDir.set(v);
  }

  allSorted = computed(() => {
    this.version();
    const by = this.sortBy();
    const dir = this.sortDir();
    const factor = dir === 'asc' ? 1 : -1;

    const priorityRank: Record<'none' | 'low' | 'med' | 'high', number> = {
      none: 0,
      low: 1,
      med: 2,
      high: 3,
    };
    const statusRank: Record<'active' | 'paused' | 'archived', number> = {
      active: 1,
      paused: 2,
      archived: 3,
    };

    const get = (r: any) => {
      switch (by) {
        case 'next':
          return new Date(r.nextOccurrence).getTime() || 0;
        case 'priority':
          return priorityRank[(r.priority ?? 'none') as 'none' | 'low' | 'med' | 'high'] ?? 0;
        case 'title':
          return r.title?.toLowerCase?.() ?? '';
        case 'category':
          return this.cats.get(r.categoryId)?.name?.toLowerCase?.() ?? '';
        case 'status':
          return statusRank[(r.status ?? 'active') as 'active' | 'paused' | 'archived'] ?? 0;
        case 'updated':
          return new Date(r.updatedAt).getTime() || 0;
        case 'created':
          return new Date(r.createdAt).getTime() || 0;
      }
      return 0;
    };

    return this.service
      .listAll()
      .slice()
      .sort((a, b) => {
        const av = get(a) as any;
        const bv = get(b) as any;
        if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * factor;
        return ((av as number) - (bv as number)) * factor;
      });
  });

  // Estado de pestaña Categorías
  selectedCategory = signal<string | undefined>(undefined);
  selectCategory(id: string | undefined) {
    this.selectedCategory.set(id);
  }

  categoriesForChips = computed(() => {
    const list = this.cats.list();
    const chips = [
      {
        id: undefined as string | undefined,
        name: 'Sin categoría',
        emoji: '🗂️',
        color: 'neutral-400',
      },
      ...list.map((c: any) => ({ id: c.id, name: c.name, emoji: c.emoji, color: c.color })),
    ];
    const sel = this.selectedCategory();
    if (sel === undefined) return chips;
    const idx = chips.findIndex((c) => c.id === sel);
    if (idx > 0) {
      const picked = chips.splice(idx, 1)[0];
      chips.unshift(picked);
    }
    return chips;
  });

  bySelectedCategory = computed(() => {
    this.version();
    const sel = this.selectedCategory();
    return this.service
      .listAll()
      .filter((r: any) => r.status === 'active')
      .filter((r: any) => (sel === undefined ? !r.categoryId : r.categoryId === sel))
      .sort(
        (a: any, b: any) =>
          (new Date(a.nextOccurrence).getTime() || 0) - (new Date(b.nextOccurrence).getTime() || 0)
      );
  });

  chipClass(active: boolean) {
    const base = 'rounded-full border px-3 py-1 text-sm';
    const on = 'border-neutral-400 dark:border-neutral-600 bg-white/70 dark:bg-neutral-800';
    const off =
      'border-transparent bg-neutral-200/40 dark:bg-neutral-800/40 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60';
    return base + ' ' + (active ? on : off);
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
    const c = this.cats.color(categoryId) ?? 'neutral-400';
    return 'bg-' + c.replace(/[^a-z0-9-]/gi, '');
  }

  onResume(id: string) {
    this.service.update(id, { status: 'active' });
    this.version.update((v) => v + 1);
  }
}
