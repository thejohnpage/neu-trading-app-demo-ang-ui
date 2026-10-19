import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'neu-trading-theme';
  readonly mode = signal<ThemeMode>('light');

  constructor() {
    if (!this.browser) return;
    let stored: string | null = null;
    try { stored = localStorage.getItem(this.storageKey); } catch { /* storage disabled */ }
    const preferred: ThemeMode = stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.apply(preferred);
  }

  toggle(): void { this.set(this.mode() === 'dark' ? 'light' : 'dark'); }

  set(mode: ThemeMode): void {
    this.apply(mode);
    if (!this.browser) return;
    try { localStorage.setItem(this.storageKey, mode); } catch { /* storage disabled */ }
  }

  private apply(mode: ThemeMode): void {
    this.mode.set(mode);
    this.document.documentElement.setAttribute('data-theme', mode);
    this.document.documentElement.style.colorScheme = mode;
  }
}
