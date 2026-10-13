import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { ClientsComponent } from './clients.component';

describe('ClientsComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(ClientsComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(ClientsComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
