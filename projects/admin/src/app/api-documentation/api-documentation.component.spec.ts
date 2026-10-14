import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ApiDocumentationComponent } from './api-documentation.component';

describe('ApiDocumentationComponent', () => {
  it('shows the Spring Boot Swagger URL', () => {
    const fixture = TestBed.createComponent(ApiDocumentationComponent);
    fixture.componentRef.setInput('source', 'spring-boot');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Spring Boot Trading API');
    expect(fixture.componentInstance.selected().url).toBe('http://localhost:8081/swagger-ui/index.html');
  });

  it('shows the NestJS Swagger URL', () => {
    const fixture = TestBed.createComponent(ApiDocumentationComponent);
    fixture.componentRef.setInput('source', 'nestjs');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('NestJS Authentication API');
    expect(fixture.componentInstance.selected().url).toBe('http://localhost:3001/api-docs');
  });

  it('increments the reload counter', () => {
    const fixture = TestBed.createComponent(ApiDocumentationComponent);
    fixture.componentRef.setInput('source', 'nestjs');
    fixture.detectChanges();
    fixture.componentInstance.refresh();
    expect(fixture.componentInstance.refreshKey()).toBe(1);
  });
});
