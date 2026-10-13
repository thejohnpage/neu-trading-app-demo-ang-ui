import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(DashboardComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(DashboardComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
