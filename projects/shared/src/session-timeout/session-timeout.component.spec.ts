import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { SessionTimeoutComponent } from './session-timeout.component';

describe('SessionTimeoutComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(SessionTimeoutComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(SessionTimeoutComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
