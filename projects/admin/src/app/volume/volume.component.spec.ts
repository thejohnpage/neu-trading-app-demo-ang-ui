import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { VolumeComponent } from './volume.component';

describe('VolumeComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(VolumeComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(VolumeComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
