import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { SimpleChartComponent } from './simple-chart.component';

describe('SimpleChartComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(SimpleChartComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(SimpleChartComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
