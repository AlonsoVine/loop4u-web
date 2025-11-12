import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsService } from './core/services/settings.service';

@Component({
selector: 'app-root',
standalone: true,
imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
template: `
  <div class="min-h-dvh flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
    <header class="sticky top-0 z-10 border-b border-neutral-200/60 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <div class="mx-auto max-w-screen-md px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="assets/icons/app/logo.png" alt="Loop4U" class="h-[60px] w-[60px] select-none pointer-events-none object-contain" />
          <h1 class="font-semibold">Loop4U</h1>
        </div>
        <nav class="text-sm text-neutral-500">v0.0.0</nav>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-screen-md px-4 pb-24 pt-4">
      <router-outlet></router-outlet>
    </main>

    @if (!onSettings()) {
      <a routerLink="/reminders/new" class="fixed bottom-16 right-6 md:right-[calc(50%-28rem)] inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 focus:outline-none">
        +
      </a>
    }
  </div>

  <!-- Navbar inferior fuera del contenedor para garantizar que siempre sea fijo al viewport -->
  <nav class="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200/60 dark:border-neutral-700/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur">
    <div class="mx-auto max-w-screen-md h-14 grid grid-cols-3 text-sm">
      <a routerLink="/" routerLinkActive="text-emerald-600" [routerLinkActiveOptions]="{ exact: true }"
         #homeRla="routerLinkActive"
         [ngClass]="homeRla.isActive ? 'text-emerald-600' : 'text-neutral-600 dark:text-white'"
         class="flex items-center justify-center gap-2">
        <span>Inicio</span>
      </a>
      <a routerLink="/calendar" routerLinkActive="text-emerald-600"
         #calRla="routerLinkActive"
         [ngClass]="calRla.isActive ? 'text-emerald-600' : 'text-neutral-600 dark:text-white'"
         class="flex items-center justify-center gap-2">
        <span>Calendario</span>
      </a>
      <a routerLink="/settings" routerLinkActive="text-emerald-600"
         #setRla="routerLinkActive"
         [ngClass]="setRla.isActive ? 'text-emerald-600' : 'text-neutral-600 dark:text-white'"
         class="flex items-center justify-center gap-2">
        <span>Ajustes</span>
      </a>
    </div>
  </nav>
  `
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private settings = inject(SettingsService);

  ngOnInit(): void {
    // Si aterrizamos en '/', redirigir a la pestaña inicial
    const url = this.router.url;
    if (url === '/' || url === '') {
      const tab = this.settings.initialTab();
      if (tab === 'calendar') this.router.navigateByUrl('/calendar');
      else if (tab === 'settings') this.router.navigateByUrl('/settings');
      // 'home' mantiene '/'
    }
  }

  onSettings(): boolean {
    try { return this.router.url.startsWith('/settings'); } catch { return false; }
  }
}
