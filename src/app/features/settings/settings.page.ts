import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { RemindersMockService } from '../reminders/reminders.mock.service';
import { LeadTime } from '../../core/models/recurrence.types';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';

type ThemePref = 'system' | 'light' | 'dark';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 space-y-6 max-w-screen-md mx-auto">
      <header>
        <h1 class="text-xl font-semibold">Ajustes</h1>
        <p class="text-sm text-neutral-500">Preferencias b&aacute;sicas y acerca de la app</p>
      </header>

      <section class="space-y-3">
        <h2 class="text-lg font-medium">Apariencia</h2>
        <div class="flex gap-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="theme" value="system" [checked]="theme()==='system'" (change)="setTheme('system')" /> Sistema
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="theme" value="light" [checked]="theme()==='light'" (change)="setTheme('light')" /> Claro
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="theme" value="dark" [checked]="theme()==='dark'" (change)="setTheme('dark')" /> Oscuro
          </label>
        </div>
      </section>

      

      <section class="space-y-3">
        <h2 class="text-lg font-medium">Formato de hora</h2>
        <div class="flex gap-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="hourfmt" value="24" [checked]="hourFormat()==='24'" (change)="setHourFormat('24')" /> 24 horas
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="hourfmt" value="12" [checked]="hourFormat()==='12'" (change)="setHourFormat('12')" /> 12 horas (AM/PM)
          </label>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-medium">Pesta&ntilde;a inicial</h2>
        <div class="flex gap-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="starttab" value="home" [checked]="initialTab()==='home'" (change)="setInitialTab('home')" /> Inicio (por defecto)
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="starttab" value="calendar" [checked]="initialTab()==='calendar'" (change)="setInitialTab('calendar')" /> Calendario
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="radio" name="starttab" value="settings" [checked]="initialTab()==='settings'" (change)="setInitialTab('settings')" /> Ajustes
          </label>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-medium">Avisos por defecto</h2>
        <div class="flex flex-wrap gap-3 text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" [checked]="hasLead('week',1)" (change)="toggleLeadTime({unit:'week', value:1})" /> 1 semana
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" [checked]="hasLead('day',1)" (change)="toggleLeadTime({unit:'day', value:1})" /> 1 d&iacute;a
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" [checked]="hasLead('hour',1)" (change)="toggleLeadTime({unit:'hour', value:1})" /> 1 hora
          </label>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-medium">Exportar / Importar</h2>

        <!-- JSON -->
        <div class="space-y-2">
          <div class="flex flex-wrap gap-3">
            <button type="button" (click)="exportJSON()" class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Exportar JSON</button>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <span class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Importar JSON</span>
              <input type="file" accept="application/json,.json" class="hidden" (change)="onImportJSON($event)" />
            </label>
          </div>
          <p class="text-xs text-neutral-500">JSON conserva todos los campos. Recomendado para copias de seguridad.</p>
        </div>

        <!-- CSV -->
        <div class="space-y-2">
          <div class="flex flex-wrap gap-3">
            <button type="button" (click)="exportCSV()" class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Exportar CSV</button>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <span class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Importar CSV</span>
              <input type="file" accept="text/csv,.csv" class="hidden" (change)="onImportCSV($event)" />
            </label>
          </div>
          <p class="text-xs text-neutral-500">CSV es compatible con Excel/Sheets. &Uacute;til para edici&oacute;n en tabla.</p>
        </div>

        <!-- iCalendar -->
        <div class="space-y-2">
          <div class="flex flex-wrap gap-3">
            <button type="button" (click)="exportICS()" class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Exportar iCalendar</button>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <span class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Importar iCalendar</span>
              <input type="file" accept="text/calendar,.ics" class="hidden" (change)="onImportICS($event)" />
            </label>
          </div>
          <p class="text-xs text-neutral-500">iCalendar se integra con Apple/Google/Outlook. Importa eventos b&aacute;sicos a recordatorios.</p>
        </div>

        <!-- Opciones avanzadas (preview) -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-neutral-500">Opciones avanzadas (preview)</h3>
          <div class="flex flex-wrap gap-3">
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <span class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Importar JSON (preview)</span>
              <input type="file" accept="application/json,.json" class="hidden" (change)="onImportJSONPreview($event)" />
            </label>
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <span class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Importar CSV (preview)</span>
              <input type="file" accept="text/csv,.csv" class="hidden" (change)="onImportCSVPreview($event)" />
            </label>
          </div>
          <div *ngIf="previewOpen()" class="mt-2 rounded border border-neutral-300 dark:border-neutral-700 p-3 text-sm">
            <div class="flex items-center justify-between mb-2">
              <strong>Previsualizaci&oacute;n de importaci&oacute;n</strong>
              <button type="button" class="underline" (click)="cancelPreview()">Cancelar</button>
            </div>
            <p class="text-neutral-500 mb-2">Origen: {{ previewSource() | uppercase }} &middot; {{ previewItems().length }} elemento(s)</p>
            <label class="inline-flex items-center gap-2 mb-2">
              <input type="checkbox" [checked]="createMissingCategories()" (change)="toggleCreateMissing($any($event.target).checked)" /> Crear categor&iacute;as que falten (seg&uacute;n nombre)
            </label>
            <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60">
              <li *ngFor="let it of previewItems() | slice:0:3" class="py-1 flex items-baseline justify-between">
                <span class="truncate"><strong>{{ it.title || 'Sin titulo' }}</strong> &middot; {{ it.startDate?.slice(0,10) }} {{ it.timeOfDay }}</span>
                <span class="text-neutral-500">{{ it.categoryName || it.categoryId || 'Sin categor&iacute;a' }}</span>
              </li>
            </ul>
            <div class="mt-3 flex gap-2">
              <button type="button" class="inline-flex items-center rounded bg-emerald-600 px-3 py-2 text-white" (click)="applyPreviewImport()">Aplicar importaci&oacute;n</button>
              <button type="button" class="inline-flex items-center rounded border px-3 py-2 border-neutral-300 dark:border-neutral-700" (click)="cancelPreview()">Cancelar</button>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-medium">Categor&iacute;as</h2>
        <ul class="divide-y divide-neutral-200/70 dark:divide-neutral-700/60 text-sm">
          <li *ngFor="let c of categories.list()" class="py-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ c.emoji }}</span>
              <span>{{ c.name }}</span>
              <span class="inline-block h-2.5 w-2.5 rounded-full" [ngClass]="bgColorClass(c.color)"></span>
            </div>
            <div class="flex gap-2">
              <button type="button" class="underline" (click)="editCategory(c)">Editar</button>
              <button type="button" class="text-red-600 underline" (click)="deleteCategory(c)">Eliminar</button>
            </div>
          </li>
        </ul>
        <form class="grid sm:grid-cols-4 gap-2 items-end" (ngSubmit)="saveCategory()">
          <div>
            <label class="block text-xs mb-1">Emoji</label>
            <input [(ngModel)]="catForm.emoji" name="emoji" class="w-full rounded border px-2 py-1 text-sm bg-white/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700" placeholder="🏷️" />
          </div>
          <div>
            <label class="block text-xs mb-1">Nombre</label>
            <input [(ngModel)]="catForm.name" name="name" class="w-full rounded border px-2 py-1 text-sm bg-white/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700" placeholder="Salud" />
          </div>
          <div>
            <label class="block text-xs mb-1">Color (Tailwind)</label>
            <input [(ngModel)]="catForm.color" name="color" class="w-full rounded border px-2 py-1 text-sm bg-white/80 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700" placeholder="emerald-500" />
          </div>
          <div class="flex gap-2">
            <button type="submit" class="inline-flex items-center rounded bg-emerald-600 px-3 py-2 text-white text-sm">{{ catForm.id ? 'Guardar' : 'A&ntilde;adir' }}</button>
            <button type="button" class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700" (click)="resetCategoryForm()" *ngIf="catForm.id">Cancelar</button>
          </div>
        </form>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-medium">Datos</h2>
        <div class="flex flex-wrap gap-3">
          <button type="button" (click)="clearLocalData()" class="inline-flex items-center rounded border px-3 py-2 text-sm border-neutral-300 dark:border-neutral-700">Borrar datos de recordatorios</button>
          <button type="button" (click)="clearAllData()" class="inline-flex items-center rounded border px-3 py-2 text-sm border-red-400 text-red-600 dark:border-red-500">Borrar TODOS los datos</button>
        </div>
        <p class="text-xs text-neutral-500">Elimina datos locales de pruebas. La opci&oacute;n en rojo borra todas las preferencias (tema, recordatorios, etc.).</p>
      </section>

      <!-- Sobre la app (al final) -->
      <section class="mt-6 rounded border border-neutral-300 dark:border-neutral-700 p-3 space-y-1">
        <h2 class="text-lg font-medium">Sobre la app</h2>
        <p class="text-sm text-neutral-500">Loop4U &middot; Versi&oacute;n 0.0.0</p>
        <p class="text-sm text-neutral-500">
          Autor: Alonso Vi&ntilde;&eacute; &mdash;
          <a href="https://alonsovine.github.io/portfolio/" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:underline">Portfolio</a>
        </p>
        <p class="text-xs text-neutral-500">&copy; {{ year }} Alonso Vi&ntilde;&eacute;. Todos los derechos reservados.</p>
      </section>

    </div>
  `
})
export class SettingsPage {
  private settings = inject(SettingsService);
  private reminders = inject(RemindersMockService);
  categories = inject(CategoriesService);
  year = new Date().getFullYear();

  theme = signal<ThemePref>(this.readTheme());
  hourFormat = computed(() => this.settings.hourFormat());
  defaultLeads = computed(() => this.settings.defaultLeadTimes());
  initialTab = computed(() => this.settings.initialTab());

  // Preview state
  previewOpen = signal(false);
  previewItems = signal<any[]>([]);
  previewSource = signal<'json'|'csv'>('json');
  createMissingCategories = signal(true);

  setTheme(pref: ThemePref) {
    this.theme.set(pref);
    if (pref === 'system') {
      localStorage.removeItem('theme');
      document.documentElement.classList.remove('dark');
    } else if (pref === 'light') {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  }

  setHourFormat(fmt: '24'|'12') { this.settings.setHourFormat(fmt as any); }
  setInitialTab(tab: 'home'|'calendar'|'settings') { this.settings.setInitialTab(tab as any); }

  hasLead(unit: LeadTime['unit'], value: number) { return !!this.defaultLeads().find(l => l.unit===unit && l.value===value); }
  toggleLeadTime(item: LeadTime) {
    const list = this.defaultLeads();
    const exists = list.find(l => l.unit===item.unit && l.value===item.value);
    const next = exists ? list.filter(l => !(l.unit===item.unit && l.value===item.value)) : list.concat(item);
    this.settings.setDefaultLeadTimes(next);
  }

  // Export/Import helpers
  private triggerDownload(url: string, filename: string) { const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }

  exportJSON() { const data = this.reminders.listAll(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); this.triggerDownload(url, 'loop4u-reminders.json'); }

  exportCSV() {
    const rows = this.reminders.listAll();
    const header = ['id','title','startDate','timeOfDay','frequency','interval','nextOccurrence','priority','status'];
    const lines = [header.join(',')].concat(rows.map(r => [r.id, esc(r.title), r.startDate, r.timeOfDay, r.recurrence.frequency, String(r.recurrence.interval), r.nextOccurrence, r.priority, r.status].join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); this.triggerDownload(url, 'loop4u-reminders.csv');
    function esc(s: string){ if(!s) return ''; const needs=/[",\n]/.test(s); return needs? '"'+s.replace(/"/g,'""')+'"' : s; }
  }

  exportICS() {
    const items = this.reminders.listUpcoming(200);
    const now = new Date();
    const lines: string[] = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Loop4U//ES'];
    for (const r of items) {
      const start = new Date(r.nextOccurrence);
      const dtstamp = icsDT(now); const dtstart = icsDT(start); const dtend = icsDT(new Date(start.getTime()+30*60*1000));
      const cat = this.categories.get(r.categoryId || '')?.name || '';
      lines.push('BEGIN:VEVENT','UID:'+r.id+'-'+start.getTime()+'@loop4u','DTSTAMP:'+dtstamp,'DTSTART:'+dtstart,'DTEND:'+dtend,'SUMMARY:'+icsText(r.title||'Recordatorio')); if(r.notes) lines.push('DESCRIPTION:'+icsText(r.notes)); if(cat) lines.push('CATEGORIES:'+icsText(cat)); lines.push('STATUS:CONFIRMED','END:VEVENT');
    }
    lines.push('END:VCALENDAR'); const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'}); const url=URL.createObjectURL(blob); this.triggerDownload(url,'loop4u-reminders.ics');
    function pad(n:number){return String(n).padStart(2,'0');}
    function icsDT(d:Date){return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';}
    function icsText(s:string){return s.replace(/[\\;,\n]/g,(m)=>({"\\":"\\\\",";":"\\;",",":"\\,","\n":"\\n"} as any)[m]||m);}    
  }

  onImportJSON(event: Event) {
    const input = event.target as HTMLInputElement | null; if(!input) return; const file = input.files && input.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=()=>{ try{ const parsed=JSON.parse(String(reader.result)); if(!Array.isArray(parsed)) throw new Error('Formato invalido'); for(const r of parsed){ const leads:Array<LeadTime>=Array.isArray(r.leadTimes)?r.leadTimes:this.defaultLeads(); this.reminders.create({ title:r.title??'Sin titulo', notes:r.notes??undefined, categoryId:r.categoryId??undefined, timezone:r.timezone??Intl.DateTimeFormat().resolvedOptions().timeZone, startDate:r.startDate??new Date().toISOString(), timeOfDay:r.timeOfDay??'09:00', recurrence:r.recurrence??{frequency:'daily',interval:1}, leadTimes:leads, priority:r.priority??'none', status:r.status??'active', lastCompletedAt:r.lastCompletedAt??undefined, history:Array.isArray(r.history)?r.history:[], ownerId:r.ownerId??'import', } as any); } alert('Importacion completada'); } catch(e){ alert('Error al importar JSON: '+(((e as any)?.message)||String(e))); } input.value=''; }; reader.readAsText(file);
  }

  onImportCSV(event: Event) {
    const input = event.target as HTMLInputElement | null; if(!input) return; const file = input.files && input.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=()=>{ try{ const text=String(reader.result??''); const rows=parseCSV(text); if(!rows.length) throw new Error('CSV vacio'); const header=rows[0].map(h=>h.trim()); const idx=(n:string)=>header.indexOf(n); const iTitle=idx('title'), iStart=idx('startDate'), iTime=idx('timeOfDay'), iFreq=idx('frequency'), iInterval=idx('interval'), iPriority=idx('priority'), iStatus=idx('status'); for(let r=1;r<rows.length;r++){ const row=rows[r]; if(!row||row.length===0) continue; this.reminders.create({ title:row[iTitle]||'Sin titulo', timezone:Intl.DateTimeFormat().resolvedOptions().timeZone, startDate:row[iStart]||new Date().toISOString(), timeOfDay:row[iTime]||'09:00', recurrence:{frequency:(row[iFreq] as any)||'daily', interval:Number(row[iInterval]||1)}, leadTimes:this.defaultLeads(), priority:(row[iPriority] as any)||'none', status:(row[iStatus] as any)||'active', history:[], ownerId:'import', } as any);} alert('CSV importado'); } catch(e){ alert('Error al importar CSV: '+(((e as any)?.message)||String(e))); } input.value=''; }; reader.readAsText(file);
    function parseCSV(text:string){ const rows:string[][]=[]; let cur:string[]=[]; let field=''; let i=0; let inQ=false; while(i<text.length){ const c=text[i++]; if(inQ){ if(c==='"'){ if(text[i]==='"'){ field+='"'; i++; } else inQ=false; } else field+=c; } else { if(c==='"') inQ=true; else if(c===','){ cur.push(field); field=''; } else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i]=='\n') i++; cur.push(field); rows.push(cur); cur=[]; field=''; } else field+=c; } } if(field.length>0||cur.length>0){ cur.push(field); rows.push(cur);} return rows; }
  }

  onImportICS(event: Event) {
    const input = event.target as HTMLInputElement | null; if(!input) return; const file = input.files && input.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=()=>{ try{ const text=String(reader.result??''); const events=this.parseICS(text); let count=0; for(const ev of events){ this.reminders.create({ title:ev.title||'Evento', notes:ev.description||undefined, categoryId:undefined, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone, startDate:ev.startDate, timeOfDay:ev.timeOfDay, recurrence:ev.recurrence, leadTimes:this.defaultLeads(), priority:'none', status:'active', history:[], ownerId:'import', } as any); count++; } alert('Importados desde iCalendar: '+count+' evento(s).'); } catch(e){ alert('Error al importar iCalendar: '+(((e as any)?.message)||String(e))); } input.value=''; }; reader.readAsText(file);
  }

  // Preview (advanced)
  onImportJSONPreview(event: Event) {
    const input = event.target as HTMLInputElement | null; if(!input) return; const file = input.files && input.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=()=>{ try{ const parsed=JSON.parse(String(reader.result??'[]')); if(!Array.isArray(parsed)) throw new Error('Formato invalido'); const items=parsed.map((r:any)=>({ title:r.title??'Sin titulo', notes:r.notes??undefined, categoryId:r.categoryId??undefined, categoryName:r.categoryName??undefined, timezone:r.timezone??Intl.DateTimeFormat().resolvedOptions().timeZone, startDate:r.startDate??new Date().toISOString(), timeOfDay:r.timeOfDay??'09:00', recurrence:r.recurrence??{frequency:'daily',interval:1}, leadTimes:Array.isArray(r.leadTimes)?r.leadTimes:this.defaultLeads(), priority:r.priority??'none', status:r.status??'active', lastCompletedAt:r.lastCompletedAt??undefined, history:Array.isArray(r.history)?r.history:[], ownerId:r.ownerId??'import', })); this.previewItems.set(items); this.previewSource.set('json'); this.previewOpen.set(true);} catch(e){ alert('Error al leer JSON: '+(((e as any)?.message)||String(e))); } input.value=''; }; reader.readAsText(file);
  }

  onImportCSVPreview(event: Event) {
    const input = event.target as HTMLInputElement | null; if(!input) return; const file = input.files && input.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=()=>{ try{ const text=String(reader.result??''); const rows=text.split(/\r?\n/).map(l=>l.split(',')); if(!rows.length) throw new Error('CSV vacio'); const header=rows[0].map(h=>h.trim()); const idx=(n:string)=>header.indexOf(n); const iTitle=idx('title'), iStart=idx('startDate'), iTime=idx('timeOfDay'), iFreq=idx('frequency'), iInterval=idx('interval'), iPriority=idx('priority'), iStatus=idx('status'); const items:any[]=[]; for(let r=1;r<rows.length;r++){ const row=rows[r]; if(!row||row.length===0) continue; items.push({ title:row[iTitle]||'Sin titulo', timezone:Intl.DateTimeFormat().resolvedOptions().timeZone, startDate:row[iStart]||new Date().toISOString(), timeOfDay:row[iTime]||'09:00', recurrence:{frequency:(row[iFreq] as any)||'daily', interval:Number(row[iInterval]||1)}, leadTimes:this.defaultLeads(), priority:(row[iPriority] as any)||'none', status:(row[iStatus] as any)||'active', history:[], ownerId:'import'}); } this.previewItems.set(items); this.previewSource.set('csv'); this.previewOpen.set(true);} catch(e){ alert('Error al leer CSV: '+(((e as any)?.message)||String(e))); } input.value=''; }; reader.readAsText(file);
  }

  toggleCreateMissing(v: boolean) { this.createMissingCategories.set(!!v); }
  cancelPreview() { this.previewOpen.set(false); this.previewItems.set([]); }
  applyPreviewImport() {
    const items=this.previewItems(); const createMissing=this.createMissingCategories(); const cats=this.categories.list(); const findByName=(name?:string)=>name?cats.find(c=>(c.name||'').toLowerCase()===(name||'').toLowerCase()):undefined;
    for(const r of items){ let categoryId:string|undefined=r.categoryId; if(!categoryId&&r.categoryName){ const found=findByName(r.categoryName); if(found) categoryId=found.id; else if(createMissing){ const created=this.categories.create({ name:r.categoryName, emoji: '🏷️', color:'neutral-400', sortOrder:Date.now(), ownerId:'local' }); categoryId=created.id; } }
      this.reminders.create({ title:r.title, notes:r.notes, categoryId, timezone:r.timezone, startDate:r.startDate, timeOfDay:r.timeOfDay, recurrence:r.recurrence, leadTimes:r.leadTimes, priority:r.priority, status:r.status, lastCompletedAt:r.lastCompletedAt, history:r.history, ownerId:r.ownerId } as any);
    }
    this.cancelPreview(); alert('Importacion completada: '+items.length+' elemento(s)');
  }

  clearLocalData() { localStorage.removeItem('loop4u.reminders'); alert('Recordatorios eliminados del almacenamiento local.'); }
  clearAllData() { localStorage.clear(); alert('Todos los datos locales eliminados.'); }

  bgColorClass(c: string): string { const safe=(c||'').replace(/[^a-z0-9-]/gi,''); return 'bg-'+(safe||'neutral-400'); }

  private readTheme(): ThemePref { const v=localStorage.getItem('theme') as ThemePref | null; return v==='light'||v==='dark'?v:'system'; }

  private parseICS(text: string): { title: string; description?: string; startDate: string; timeOfDay: string; recurrence: { frequency: 'daily'|'weekly'|'monthly'|'yearly'; interval: number } }[] {
    const lines=text.split(/\r?\n/); const events:any[]=[]; let cur:any=null; for(let raw of lines){ const line=raw.trim(); if(line==='BEGIN:VEVENT'){ cur={}; continue;} if(line==='END:VEVENT'){ if(cur){ events.push(cur); cur=null;} continue;} if(!cur) continue; if(line.startsWith('SUMMARY:')) cur.title=line.slice(8).trim(); else if(line.startsWith('DESCRIPTION:')) cur.description=line.slice(12).trim(); else if(line.startsWith('DTSTART')){ const dt=line.split(':')[1]||''; const {date,time}=this.splitIcsDate(dt); cur.startDate=date; cur.timeOfDay=time; } else if(line.startsWith('RRULE:')){ const rule=line.slice(6); const m=/FREQ=([A-Z]+);?INTERVAL=?(\d+)?/.exec(rule); const freq=(m?.[1]||'YEARLY').toLowerCase(); const interval=Number(m?.[2]||1); cur.recurrence={ frequency: (['daily','weekly','monthly','yearly'].includes(freq)?freq:'yearly') as any, interval }; } }
    for(const ev of events){ ev.title=ev.title||'Evento'; ev.recurrence=ev.recurrence||{frequency:'yearly',interval:1}; if(!ev.startDate||!ev.timeOfDay){ const now=new Date(); ev.startDate=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())).toISOString(); ev.timeOfDay='09:00'; } } return events as any[];
  }

  private splitIcsDate(dt: string): { date: string; time: string } { const y=Number(dt.slice(0,4)); const m=Number(dt.slice(4,6))-1; const d=Number(dt.slice(6,8)); let hh=9, mm=0; if(dt.length>=15){ hh=Number(dt.slice(9,11)); mm=Number(dt.slice(11,13)); } const date=new Date(Date.UTC(y,m,d)); const dateIso=date.toISOString(); const time=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; return { date: dateIso, time }; }

  // GestiÃ³n de Categor&iacute;as (form inline)
  catForm: Partial<Category> = { id: undefined, emoji: '🏷️', name: '', color: 'emerald-500', sortOrder: 999, ownerId: 'local', createdAt: '', updatedAt: '' };

  editCategory(c: Category) { this.catForm = { ...c }; }
  resetCategoryForm() { this.catForm = { id: undefined, emoji: '🏷️', name: '', color: 'emerald-500', sortOrder: 999, ownerId: 'local', createdAt: '', updatedAt: '' }; }
  saveCategory() {
    if (!this.catForm.name || !this.catForm.emoji || !this.catForm.color) return;
    if (this.catForm.id) {
      this.categories.update(this.catForm.id, { name: this.catForm.name!, emoji: this.catForm.emoji!, color: this.catForm.color! });
    } else {
      this.categories.create({ name: this.catForm.name!, emoji: this.catForm.emoji!, color: this.catForm.color!, sortOrder: Date.now(), ownerId: 'local' });
    }
    this.resetCategoryForm();
  }
  deleteCategory(c: Category) { const ok = confirm('Â¿Eliminar la categoria "' + c.name + '"?'); if (ok) this.categories.delete(c.id); }
}











