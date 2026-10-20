import { Component, inject } from '@angular/core';
import { BackendAvailabilityService } from './backend-availability.service';

@Component({
  selector: 'app-backend-unavailable',
  standalone: true,
  template: `
    @if (availability.unavailable()) {
      <div class="service-overlay">
        <section class="service-modal" role="alertdialog" aria-modal="true" aria-labelledby="service-title" aria-describedby="service-description">
          <h2 id="service-title">Backend currently unavailable</h2>
          <p id="service-description">The backend is currently unavailable. Please try again later.</p>
          <button type="button" (click)="availability.markAvailable()">OK</button>
        </section>
      </div>
    }
  `,
  styles: [`
    .service-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; background: rgba(0,0,0,.7); padding: 1rem; }
    .service-modal { box-sizing: border-box; width: min(100%, 460px); padding: 2rem; border-radius: 12px; background: var(--surface, #fff); color: var(--text, #182235); border: 2px solid #7d8796; text-align: center; box-shadow: 0 20px 60px #0005; }
    h2 { font-size: 1.5rem; line-height: 1.3; }
    p { font-size: 1.1rem; line-height: 1.5; }
    button { padding: .75rem 2rem; font-size: 1rem; border: 0; border-radius: 8px; background: #1558bc; color: white; cursor: pointer; }
  `],
})
export class BackendUnavailableComponent {
  readonly availability = inject(BackendAvailabilityService);
}
