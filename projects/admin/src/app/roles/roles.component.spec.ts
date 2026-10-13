import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { RolesComponent } from './roles.component';

describe('RolesComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(RolesComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(RolesComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
