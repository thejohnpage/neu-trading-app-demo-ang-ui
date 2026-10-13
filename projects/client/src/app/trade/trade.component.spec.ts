import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { TradeComponent } from './trade.component';

describe('TradeComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(TradeComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(TradeComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
