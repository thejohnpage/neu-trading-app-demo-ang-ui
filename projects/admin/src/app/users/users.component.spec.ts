import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(UsersComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(UsersComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
