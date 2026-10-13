import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(OverviewComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(OverviewComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
