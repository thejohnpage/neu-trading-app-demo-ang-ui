import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { OrdersComponent } from './orders.component';

describe('OrdersComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(OrdersComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(OrdersComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
