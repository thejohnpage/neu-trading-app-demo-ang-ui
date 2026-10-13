import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { SegmentsComponent } from './segments.component';

describe('SegmentsComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(SegmentsComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(SegmentsComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
