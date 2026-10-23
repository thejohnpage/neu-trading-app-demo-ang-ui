import { Component, inject, signal } from '@angular/core';
import { BackendUnavailableComponent } from '@shared/backend-unavailable.component';
import { BackendAvailabilityService } from '@shared/backend-availability.service';
import { ThemeToggleComponent } from '@shared/theme-toggle/theme-toggle.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from '@shared/api.service';
import { SessionTimeoutComponent } from '@shared/session-timeout/session-timeout.component';
import { SessionHeaderComponent } from '@shared/session-header/session-header.component';
import packageInfo from '../../../../../package.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SessionTimeoutComponent,
    SessionHeaderComponent,
    ThemeToggleComponent,
    BackendUnavailableComponent,
  ],
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private api = inject(ApiService);
  private readonly availability = inject(BackendAvailabilityService);
  readonly year = new Date().getFullYear();
  readonly uiVersion = packageInfo.version;
  readonly apiVersion = signal('…');
  constructor() {
    this.api.version().subscribe({
      next: (v) => {
        this.apiVersion.set(v.version);
        this.availability.markAvailable();
      },
      error: () => {
        this.apiVersion.set('unavailable');
        this.availability.markUnavailable();
      },
    });
  }
}
