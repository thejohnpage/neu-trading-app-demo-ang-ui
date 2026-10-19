import { Component, inject } from '@angular/core';
import { ThemeService, ThemeMode } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <div class="theme-switch" role="group" aria-label="Appearance">
      @for (option of options; track option.mode) {
        <button type="button" class="theme-option"
          [class.selected]="theme.mode() === option.mode"
          [attr.aria-pressed]="theme.mode() === option.mode"
          [attr.title]="option.label + ' appearance'"
          (click)="theme.set(option.mode)">
          <span aria-hidden="true">{{ option.icon }}</span>
          <span>{{ option.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .theme-switch { display:inline-flex; align-items:center; gap:2px; padding:3px;
      background:var(--surface-alt,#f7f9fc); border:1px solid var(--control-border,#64748b);
      border-radius:999px; white-space:nowrap; }
    .theme-option { display:inline-flex; align-items:center; gap:5px; padding:7px 10px;
      border:1px solid transparent; border-radius:999px; background:transparent;
      color:var(--text-primary,#172033); font:600 12px/1.2 inherit; cursor:pointer; }
    .theme-option.selected { background:var(--accent,#205caa) !important;
      border-color:var(--accent,#205caa) !important;
      color:var(--accent-contrast,#fff) !important; }
    .theme-option:focus-visible { outline:3px solid var(--focus-ring,#80b6ff); outline-offset:2px; }
    .theme-option span:first-child { font-size:15px; }
    @media (max-width:650px) { .theme-option { padding:7px 8px; } .theme-option span:last-child { display:none; } }
  `]
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
  readonly options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: '☀' },
    { mode: 'dark', label: 'Dark', icon: '☾' },
    { mode: 'projector', label: 'Projector', icon: '▣' },
  ];
}
