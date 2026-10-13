import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { AuditComponent } from './audit.component';

describe('AuditComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(AuditComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(AuditComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
