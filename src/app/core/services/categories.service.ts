import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';

const STORAGE_KEY = 'loop4u.categories';

function nowIso() { return new Date().toISOString(); }
function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private cache: Category[] | null = null;

  private load(): Category[] {
    if (this.cache) return this.cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.cache = raw ? (JSON.parse(raw) as Category[]) : this.seed();
    } catch {
      this.cache = this.seed();
    }
    return this.cache;
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache ?? []));
  }

  private seed(): Category[] {
    const createdAt = nowIso();
    const updatedAt = createdAt;
    const seed: Omit<Category, 'id'>[] = [
      { name: 'Salud', emoji: '💊', color: 'emerald-500', sortOrder: 1, ownerId: 'local', createdAt, updatedAt },
      { name: 'Hogar', emoji: '🏠', color: 'sky-500', sortOrder: 2, ownerId: 'local', createdAt, updatedAt },
      { name: 'Vehículo', emoji: '🚗', color: 'amber-500', sortOrder: 3, ownerId: 'local', createdAt, updatedAt },
      { name: 'Finanzas', emoji: '💰', color: 'lime-500', sortOrder: 4, ownerId: 'local', createdAt, updatedAt },
      { name: 'Personales', emoji: '👤', color: 'violet-500', sortOrder: 5, ownerId: 'local', createdAt, updatedAt },
      { name: 'Trabajo', emoji: '💼', color: 'indigo-500', sortOrder: 6, ownerId: 'local', createdAt, updatedAt },
      { name: 'Mascotas', emoji: '🐶', color: 'rose-500', sortOrder: 7, ownerId: 'local', createdAt, updatedAt },
    ];
    return seed.map((c, i) => ({ ...c, id: `seed-${i}` }));
  }

  list(): Category[] { return this.load().slice().sort((a,b)=>a.sortOrder-b.sortOrder); }
  get(id: string): Category | undefined { return this.load().find(c=>c.id===id); }

  create(input: Omit<Category, 'id'|'createdAt'|'updatedAt'>): Category {
    const createdAt = nowIso();
    const item: Category = { ...input, id: genId(), createdAt, updatedAt: createdAt };
    const list = this.load();
    list.push(item);
    this.persist();
    return item;
  }

  update(id: string, changes: Partial<Category>): Category | undefined {
    const list = this.load();
    const idx = list.findIndex(c=>c.id===id);
    if (idx<0) return undefined;
    list[idx] = { ...list[idx], ...changes, updatedAt: nowIso() };
    this.persist();
    return list[idx];
  }

  delete(id: string): boolean {
    const before = this.load().length;
    this.cache = this.load().filter(c=>c.id!==id);
    this.persist();
    return this.cache.length < before;
  }

  // Resolver representación visual
  icon(id?: string): string { return (id && this.get(id)?.emoji) || '🏷️'; }
  color(id?: string): string { return (id && this.get(id)?.color) || 'neutral-400'; }
}

