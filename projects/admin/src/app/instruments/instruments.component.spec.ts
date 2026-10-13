import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { InstrumentsComponent } from './instruments.component';

describe('InstrumentsComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(InstrumentsComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(InstrumentsComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
