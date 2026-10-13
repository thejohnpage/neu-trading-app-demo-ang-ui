import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { SessionHeaderComponent } from './session-header.component';

describe('SessionHeaderComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(SessionHeaderComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(SessionHeaderComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
