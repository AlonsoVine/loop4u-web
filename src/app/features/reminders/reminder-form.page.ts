import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RemindersMockService } from './reminders.mock.service';
import { SettingsService } from '../../core/services/settings.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Reminder } from '../../core/models/reminder.model';

@Component({
  standalone: true,
  selector: 'app-reminder-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-screen-md mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold" *ngIf="!editing()">Nuevo recordatorio</h1>
        <h1 class="text-xl font-semibold" *ngIf="editing()">Editar recordatorio</h1>
        <button *ngIf="editing()" type="button" (click)="onDelete()" class="ml-4 inline-flex items-center rounded border px-3 py-1.5 text-sm border-red-400 text-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ">Eliminar</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Título</label>
          <input type="text" formControlName="title" [class]="inputClass('title')" placeholder="p. ej., Tomar medicación" />
          <div class="mt-1 text-xs text-red-600" *ngIf="showError('title','required')">El título es obligatorio.</div>
          <div class="mt-1 text-xs text-red-600" *ngIf="showError('title','maxlength')">Máximo 140 caracteres.</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Fecha de inicio</label>
            <input type="date" formControlName="startDate" [class]="inputClass('startDate')" />
            <div class="mt-1 text-xs text-red-600" *ngIf="showError('startDate','required')">Requerida.</div>
          </div>
          <div>
            <label class="block text-sm mb-1">Hora del día</label>
            <input type="time" formControlName="timeOfDay" [class]="inputClass('timeOfDay')" />
            <div class="mt-1 text-xs text-red-600" *ngIf="showError('timeOfDay','required')">Requerida.</div>
          </div>
        </div>

        <!-- Frecuencia e intervalo justo debajo de hora del día -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Frecuencia</label>
            <select formControlName="frequency" [class]="inputClass('frequency')">
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Intervalo</label>
            <input type="number" min="1" formControlName="interval" [class]="inputClass('interval')" />
            <div class="mt-1 text-xs text-red-600" *ngIf="showError('interval','min')">Debe ser ≥ 1.</div>
          </div>
        </div>

        <!-- En la línea de Categoría, también Prioridad -->
        <div class="grid grid-cols-2 gap-3">
          <div class="relative" (click)="$event.stopPropagation()">
            <label class="block text-sm mb-1">Categoría</label>
            <button type="button"
              class="w-full rounded border px-3 py-2 text-sm bg-white/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 flex items-center justify-between"
              (click)="toggleCatOpen()">
              <span class="flex items-center gap-2 truncate">
                <span class="inline-block h-3 w-3 rounded-full" [ngClass]="bgCategory(currentCategoryId())"></span>
                <span class="text-base leading-none">{{ categoryEmoji(currentCategoryId()) }}</span>
                <span class="truncate">{{ categoryName(currentCategoryId()) }}</span>
              </span>
              <span class="text-neutral-400">▾</span>
            </button>
            <div *ngIf="catOpen()" class="absolute z-10 mt-1 w-full rounded border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-md max-h-64 overflow-auto" (click)="$event.stopPropagation()">
              <button type="button" class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                (click)="setCategory(undefined)">
                <span class="inline-block h-3 w-3 rounded-full bg-neutral-400"></span>
                <span class="text-base leading-none">🏷️</span>
                <span>Sin categoría</span>
              </button>
              <button *ngFor="let c of categoriesList()" type="button" class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                (click)="setCategory(c.id)">
                <span class="inline-block h-3 w-3 rounded-full" [ngClass]="bgColorClass(c.color)"></span>
                <span class="text-base leading-none">{{ c.emoji }}</span>
                <span class="truncate">{{ c.name }}</span>
              </button>
            </div>
          </div>
          <div class="relative" (click)="$event.stopPropagation()">
            <label class="block text-sm mb-1">Prioridad</label>
            <button type="button"
              class="w-full rounded border px-3 py-2 text-sm bg-white/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 flex items-center justify-between"
              (click)="togglePriorityOpen()">
              <span class="flex items-center gap-2 truncate">
                <span class="inline-block h-3 w-3 rounded-full" [ngClass]="priorityDotClass(currentPriority())"></span>
                <span class="truncate">{{ priorityLabel(currentPriority()) }}</span>
              </span>
              <span class="text-neutral-400">▾</span>
            </button>
            <div *ngIf="priorityOpen()" class="absolute z-10 mt-1 w-full rounded border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-md" (click)="$event.stopPropagation()">
              <button type="button" class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                (click)="setPriority('none')">
                <span class="inline-block h-3 w-3 rounded-full hidden"></span>
                <span>Sin prioridad</span>
              </button>
              <button type="button" class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                (click)="setPriority('low')">
                <span class="inline-block h-3 w-3 rounded-full" [ngClass]="priorityDotClass('low')"></span>
                <span>Baja</span>
              </button>
              <button type="button" class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                (click)="setPriority('med')">
                <span class="inline-block h-3 w-3 rounded-full" [ngClass]="priorityDotClass('med')"></span>
                <span>Media</span>
              </button>
              <button type="button" class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                (click)="setPriority('high')">
                <span class="inline-block h-3 w-3 rounded-full" [ngClass]="priorityDotClass('high')"></span>
                <span>Alta</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm mb-1">Notas</label>
          <textarea formControlName="notes" rows="3" class="w-full rounded border border-neutral-300 bg-white/80 px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700" placeholder="Detalles opcionales"></textarea>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="form.invalid" class="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-white text-sm hover:bg-emerald-700 disabled:opacity-50">Guardar</button>
          <a routerLink="/" class="inline-flex items-center rounded border px-4 py-2 text-sm border-neutral-300 dark:border-neutral-700">Cancelar</a>
          <button *ngIf="editing()" type="button" (click)="onTogglePause()" class="inline-flex items-center rounded border px-4 py-2 text-sm border-neutral-300 dark:border-neutral-700" [ngClass]="isPaused() ? 'border-amber-400 text-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.45)]' : ''">
            {{ isPaused() ? 'Reanudar' : 'Pausar' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ReminderFormPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(RemindersMockService);
  private settings = inject(SettingsService);
  private cats = inject(CategoriesService);

  editing = signal(false);

  form = this.fb.group({
    id: this.fb.control<string | null>(null),
    title: this.fb.control('', { validators: [Validators.required, Validators.maxLength(140)] }),
    notes: this.fb.control<string>(''),
    categoryId: this.fb.control<string | undefined>(undefined),
    startDate: this.fb.control<string>(new Date().toISOString().slice(0, 10), { validators: [Validators.required] }),
    timeOfDay: this.fb.control('09:00', { validators: [Validators.required] }),
    frequency: this.fb.control<'daily'|'weekly'|'monthly'|'yearly'>('daily', { validators: [Validators.required] }),
    interval: this.fb.control(1, { validators: [Validators.required, Validators.min(1)] }),
    priority: this.fb.control<'none'|'low'|'med'|'high'>('none'),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = this.service.getById(id);
      if (data) {
        this.editing.set(true);
        this.form.patchValue({
          id: data.id,
          title: data.title,
          notes: data.notes ?? '',
          categoryId: data.categoryId,
          startDate: data.startDate.slice(0,10),
          timeOfDay: data.timeOfDay,
          frequency: data.recurrence.frequency,
          interval: data.recurrence.interval,
          priority: data.priority,
        });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();

    const base: Omit<Reminder,'id'|'createdAt'|'updatedAt'|'nextOccurrence'> = {
      title: values.title!,
      notes: values.notes || undefined,
      categoryId: values.categoryId || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid',
      startDate: new Date(values.startDate! + 'T00:00:00.000Z').toISOString(),
      timeOfDay: values.timeOfDay!,
      recurrence: { frequency: values.frequency!, interval: values.interval! },
      leadTimes: this.settings.defaultLeadTimes(),
      priority: values.priority!,
      status: 'active',
      lastCompletedAt: undefined,
      history: [],
      ownerId: 'demo',
    };

    const id = values.id;
    if (id) {
      this.service.update(id, base);
    } else {
      this.service.create(base);
    }
    this.router.navigateByUrl('/');
  }

  onDelete(): void {
    const id = this.form.value.id;
    if (!id) return;
    const ok = confirm('¿Seguro que quieres eliminar este recordatorio?');
    if (!ok) return;
    this.service.delete(id);
    this.router.navigateByUrl('/');
  }

  // Pausar/Reanudar
  isPaused(): boolean {
    return this.form.get('status')?.value === 'paused' || this.service.getById(this.form.value.id || '')?.status === 'paused';
  }
  onTogglePause(): void {
    const id = this.form.value.id;
    if (!id) return;
    const current = this.service.getById(id);
    if (!current) return;
    const nextStatus = current.status === 'paused' ? 'active' : 'paused';
    this.service.update(id, { status: nextStatus });
    // refrescar formulario para reflejar estado
    this.form.patchValue({ id });
  }

  // Helpers de validación/estilos
  showError(name: string, err: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.hasError(err as any);
  }

  inputClass(name: string): string {
    const base = 'w-full rounded border px-3 py-2 text-sm bg-white/80 dark:bg-neutral-800';
    const ok = 'border-neutral-300 dark:border-neutral-700';
    const bad = 'border-red-500';
    const c = this.form.get(name);
    const invalid = !!c && c.touched && c.invalid;
    return `${base} ${invalid ? bad : ok}`;
  }

  // Indicador de prioridad (mismo estilo que en tarjetas)
  currentPriority(): 'none'|'low'|'med'|'high' {
    const v = this.form.get('priority')?.value as 'none'|'low'|'med'|'high' | null | undefined;
    return (v === 'none' || v === 'low' || v === 'med' || v === 'high') ? v : 'none';
  }
  priorityDotClass(p: 'none'|'low'|'med'|'high') {
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

  priorityOpen = signal(false);
  togglePriorityOpen() { this.priorityOpen.set(!this.priorityOpen()); }
  setPriority(p: 'none'|'low'|'med'|'high') { this.form.get('priority')?.setValue(p); this.priorityOpen.set(false); }
  priorityLabel(p: 'none'|'low'|'med'|'high') { return p === 'none' ? 'Sin prioridad' : p === 'low' ? 'Baja' : p === 'high' ? 'Alta' : 'Media'; }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.priorityOpen()) this.priorityOpen.set(false);
    if (this.catOpen()) this.catOpen.set(false);
  }

  // Categorías: estado y helpers para dropdown visual
  categoriesList = signal(this.cats.list());
  catOpen = signal(false);
  toggleCatOpen() { this.catOpen.set(!this.catOpen()); }
  setCategory(id: string | undefined) { this.form.get('categoryId')?.setValue(id); this.catOpen.set(false); }
  currentCategoryId(): string | undefined { return this.form.get('categoryId')?.value ?? undefined; }
  categoryEmoji(id?: string): string { return this.cats.icon(id); }
  categoryName(id?: string): string {
    const c = id ? this.cats.get(id) : undefined;
    return c?.name ?? 'Sin categoría';
  }

  bgCategory(id?: string): string {
    const c = this.cats.color(id) || 'neutral-400';
    return 'bg-' + c.replace(/[^a-z0-9-]/gi, '');
  }
  bgColorClass(c: string): string { return 'bg-' + (c || 'neutral-400').replace(/[^a-z0-9-]/gi, ''); }

}









