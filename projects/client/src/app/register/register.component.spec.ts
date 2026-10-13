import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(RegisterComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(RegisterComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
