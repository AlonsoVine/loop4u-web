import { Injectable, computed, signal } from '@angular/core';
import { LeadTime } from '../models/recurrence.types';

type HourFormat = '24' | '12';

const KEY_HOUR = 'loop4u.settings.hourFormat';
const KEY_LEADS = 'loop4u.settings.defaultLeadTimes';
const KEY_INITIAL_TAB = 'loop4u.settings.initialTab';

export type InitialTab = 'home' | 'calendar' | 'settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private hour = signal<HourFormat>(this.readHour());
  private leads = signal<LeadTime[]>(this.readLeads());
  private tab = signal<InitialTab>(this.readInitialTab());

  hourFormat = computed(() => this.hour());
  defaultLeadTimes = computed(() => this.leads());
  initialTab = computed(() => this.tab());

  setHourFormat(fmt: HourFormat) {
    this.hour.set(fmt);
    localStorage.setItem(KEY_HOUR, fmt);
  }

  setDefaultLeadTimes(list: LeadTime[]) {
    this.leads.set(list);
    localStorage.setItem(KEY_LEADS, JSON.stringify(list));
  }

  setInitialTab(tab: InitialTab) {
    this.tab.set(tab);
    localStorage.setItem(KEY_INITIAL_TAB, tab);
  }

  private readHour(): HourFormat {
    const v = localStorage.getItem(KEY_HOUR);
    return v === '12' || v === '24' ? v : '24';
  }

  private readLeads(): LeadTime[] {
    try {
      const raw = localStorage.getItem(KEY_LEADS);
      if (!raw) return [{ unit: 'day', value: 1 }];
      const parsed = JSON.parse(raw) as LeadTime[];
      return Array.isArray(parsed) && parsed.length ? parsed : [{ unit: 'day', value: 1 }];
    } catch {
      return [{ unit: 'day', value: 1 }];
    }
  }

  private readInitialTab(): InitialTab {
    const v = localStorage.getItem(KEY_INITIAL_TAB) as InitialTab | null;
    return v === 'calendar' || v === 'settings' ? v : 'home';
  }
}
