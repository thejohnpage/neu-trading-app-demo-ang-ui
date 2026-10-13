import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(AppComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(AppComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
