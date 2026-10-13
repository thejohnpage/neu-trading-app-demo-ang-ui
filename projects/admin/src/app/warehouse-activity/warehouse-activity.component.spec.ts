import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { WarehouseActivityComponent } from './warehouse-activity.component';

describe('WarehouseActivityComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(WarehouseActivityComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(WarehouseActivityComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
