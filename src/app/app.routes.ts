// Ejemplo de rutas (standalone components) para 3 tabs + FAB global
// Nota: Los componentes son placeholders; crear al integrar en Angular real.
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.page').then(m => m.CalendarPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.page').then(m => m.SettingsPage),
  },
  {
    path: 'reminders/new',
    loadComponent: () => import('./features/reminders/reminder-form.page').then(m => m.ReminderFormPage),
  },
  {
    path: 'reminders/:id/edit',
    loadComponent: () => import('./features/reminders/reminder-form.page').then(m => m.ReminderFormPage),
  },
  { path: '**', redirectTo: '' },
];
