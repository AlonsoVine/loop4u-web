import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RemindersMockService } from './reminders.mock.service';
import { SettingsService } from '../../core/services/settings.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Reminder } from '../../core/models/reminder.model';

@Component({
  standalone: true,
  selector: 'app-reminder-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-screen-md mx-auto p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold" *ngIf="!editing()">Nuevo recordatorio</h1>
        <h1 class="text-xl font-semibold" *ngIf="editing()">Editar recordatorio</h1>
        <button *ngIf="editing()" type="button" (click)="onDelete()" class="ml-4 inline-flex items-center rounded border px-3 py-1.5 text-sm border-red-400 text-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Titulo <span class="text-red-500">*</span></label>
          <input type="text" formControlName="title" [class]="inputClass('title')" placeholder="p. ej., Tomar medicacion" />
          <div class="mt-1 text-xs text-red-600" *ngIf="showError('title','required')">El titulo es obligatorio.</div>
          <div class="mt-1 text-xs text-red-600" *ngIf="showError('title','maxlength')">Maximo 140 caracteres.</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Fecha de inicio <span class="text-red-500">*</span></label>
            <input type="date" formControlName="startDate" [class]="inputClass('startDate')" />
            <div class="mt-1 text-xs text-red-600" *ngIf="showError('startDate','required')">Requerida.</div>
          </div>
          <div>
            <label class="block text-sm mb-1">Hora del dia <span class="text-red-500">*</span></label>
            <input type="time" formControlName="timeOfDay" [class]="inputClass('timeOfDay')" />
            <div class="mt-1 text-xs text-red-600" *ngIf="showError('timeOfDay','required')">Requerida.</div>
          </div>
        </div>

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
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Categoria</label>
            <select formControlName="categoryId" [class]="inputClass('categoryId')">
              <option [ngValue]="undefined">🏷️ Sin categoria</option>
              <option *ngFor="let c of categoriesList()" [ngValue]="c.id">{{ categoryEmoji(c.id) }} {{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">Prioridad</label>
            <div class="relative">
              <select formControlName="priority" [class]="inputClass('priority') + ' pr-8'">
                <option value="none">Sin prioridad</option>
                <option value="low">Baja</option>
                <option value="med">Media</option>
                <option value="high">Alta</option>
              </select>
              <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-block h-3 w-3 rounded-full" [ngClass]="priorityDotClass(currentPriority())"></span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm mb-1">Notas</label>
          <textarea formControlName="notes" [class]="inputClass('notes')" rows="3"></textarea>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button *ngIf="editing()" type="button" (click)="onTogglePause()" class="inline-flex items-center rounded border px-3 py-1.5 text-sm border-amber-400 text-amber-600 dark:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20">
            {{ isPaused() ? 'Reanudar' : 'Pausar' }}
          </button>
          <span></span>
          <button type="submit" class="inline-flex items-center rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500">Guardar</button>
        </div>
      </form>
    </div>
  `,
})
export class ReminderFormPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(RemindersMockService);
  private settings = inject(SettingsService);
  private cats = inject(CategoriesService);

  editing = signal(false);

  form = this.fb.group({
    id: this.fb.control<string | null>(null),
    title: this.fb.control('', { validators: [Validators.required, Validators.maxLength(140)] }),
    notes: this.fb.control<string | null>(null),
    startDate: this.fb.control('', { validators: [Validators.required] }),
    timeOfDay: this.fb.control('09:00', { validators: [Validators.required] }),
    frequency: this.fb.control<'daily'|'weekly'|'monthly'|'yearly'>('weekly'),
    interval: this.fb.control(1, { validators: [Validators.min(1)] }),
    categoryId: this.fb.control<string | undefined>(undefined),
    priority: this.fb.control<'none'|'low'|'med'|'high'>('none'),
    status: this.fb.control<'active'|'paused'|'archived'>('active'),
  });

  constructor() {
    const qDate = this.route.snapshot.queryParamMap.get('date');
    if (qDate) this.form.patchValue({ startDate: qDate });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const r = this.service.getById(id);
      if (r) {
        this.editing.set(true);
        this.form.patchValue({
          id: r.id,
          title: r.title,
          notes: r.notes ?? null,
          startDate: r.startDate.slice(0,10),
          timeOfDay: r.timeOfDay,
          frequency: r.recurrence.frequency,
          interval: r.recurrence.interval ?? 1,
          categoryId: r.categoryId,
          priority: r.priority,
          status: r.status,
        });
      }
    }
  }

  categoriesList() { return this.cats.list(); }
  categoryEmoji(id?: string) { return this.cats.icon(id); }
  categoryName(id?: string) { const c = id ? this.cats.get(id) : undefined; return c?.name ?? 'Sin categoria'; }
  bgCategory(id?: string): string { const c = this.cats.color(id) || 'neutral-400'; return 'bg-' + c.replace(/[^a-z0-9-]/gi, ''); }

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

  priorityDotClass(p: 'none'|'low'|'med'|'high') {
    switch (p) {
      case 'none': return 'hidden';
      case 'high': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.55)]';
      case 'med':  return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.55)]';
      default:     return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]';
    }
  }

  currentPriority(): 'none'|'low'|'med'|'high' {
    const v = this.form.get('priority')?.value as any;
    return (v === 'low' || v === 'med' || v === 'high' || v === 'none') ? v : 'none';
  }

  isPaused(): boolean { return this.form.get('status')?.value === 'paused'; }
  onTogglePause(): void {
    const id = this.form.value.id as string | null | undefined;
    if (!id) return;
    const current = this.service.getById(id);
    if (!current) return;
    const next = current.status === 'paused' ? 'active' : 'paused';
    this.service.update(id, { status: next });
    this.form.patchValue({ status: next });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value as any;
    const base: Omit<Reminder, 'id'|'createdAt'|'updatedAt'|'nextOccurrence'> = {
      title: v.title,
      notes: v.notes || undefined,
      categoryId: v.categoryId || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid',
      startDate: new Date(v.startDate + 'T00:00:00.000Z').toISOString(),
      timeOfDay: v.timeOfDay,
      recurrence: { frequency: v.frequency, interval: v.interval ?? 1 },
      leadTimes: this.settings.defaultLeadTimes(),
      priority: v.priority,
      status: v.status,
      lastCompletedAt: undefined,
      history: [],
      ownerId: 'demo',
    } as any;

    if (v.id) {
      this.service.update(v.id as string, base);
    } else {
      this.service.create(base);
    }
    this.router.navigateByUrl('/');
  }

  onDelete(): void {
    const id = this.form.value.id as string | null | undefined;
    if (!id) return;
    const ok = confirm('Seguro que quieres eliminar este recordatorio?');
    if (!ok) return;
    this.service.delete(id);
    this.router.navigateByUrl('/');
  }

  @HostListener('document:click') onDocClick() { /* dropdowns simples */ }
}

