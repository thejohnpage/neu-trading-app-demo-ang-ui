import { Component, inject } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button type="button" class="theme-toggle" (click)="theme.toggle()"
      [attr.aria-label]="theme.mode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.aria-pressed]="theme.mode() === 'dark'"
      title="Toggle light and dark appearance">
      <span aria-hidden="true">{{ theme.mode() === 'dark' ? '☀' : '☾' }}</span>
      <span>{{ theme.mode() === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle { display:inline-flex; align-items:center; gap:8px; border:1px solid var(--control-border,#64748b);
      border-radius:999px; background:var(--control-bg,transparent); color:var(--text-primary,inherit);
      padding:8px 13px; font:600 12px/1.2 inherit; cursor:pointer; white-space:nowrap; }
    .theme-toggle:hover { background:var(--surface-hover,#273449); }
    .theme-toggle:focus-visible { outline:3px solid var(--focus-ring,#80b6ff); outline-offset:3px; }
    .theme-toggle span:first-child { font-size:17px; line-height:1; }
  `]
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
