import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Aplicar tema antes del bootstrap para evitar parpadeo
try {
  const pref = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = pref === 'dark' || (!pref && prefersDark);
  document.documentElement.classList.toggle('dark', !!isDark);
} catch {}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
