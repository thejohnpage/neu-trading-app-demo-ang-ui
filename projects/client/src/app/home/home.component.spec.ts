import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(HomeComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(HomeComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
