import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type ApiSource = 'spring-boot' | 'nestjs';

@Component({
  selector: 'app-api-documentation',
  standalone: true,
  templateUrl: './api-documentation.component.html',
  styleUrl: './api-documentation.component.scss',
})
export class ApiDocumentationComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly source = input.required<ApiSource>();
  readonly sources: Record<ApiSource, { title: string; url: string; description: string }> = {
    'spring-boot': {
      title: 'Spring Boot Trading API',
      url: 'http://localhost:8081/swagger-ui/index.html',
      description: 'Trading, portfolio, cash wallet, reporting and administration endpoints.',
    },
    nestjs: {
      title: 'NestJS Authentication API',
      url: 'http://localhost:3001/api-docs',
      description: 'Authentication, access-token validation, refresh sessions and logout.',
    },
  };
  readonly selected = computed(() => this.sources[this.source()]);
  readonly iframeUrl = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(\n      this.refreshKey() === 0 ? this.selected().url : `${this.selected().url}?reload=${this.refreshKey()}`,\n    ),
  );
  // Incrementing the frame key forces a fresh embedded Swagger UI instance.
  refreshKey = 0;
  refresh(): void {
    this.refreshKey.update((value) => value + 1);
  }
}
