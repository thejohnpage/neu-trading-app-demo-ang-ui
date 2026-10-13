import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { KafkaMonitorComponent } from './kafka-monitor.component';

describe('KafkaMonitorComponent', () => {
  it('declares a standalone Angular component', () => {
    const metadata = reflectComponentType(KafkaMonitorComponent);
    expect(metadata).not.toBeNull();
    expect(metadata?.isStandalone).toBe(true);
  });

  it('has a component selector', () => {
    const metadata = reflectComponentType(KafkaMonitorComponent);
    expect(metadata?.selector).toMatch(/^app-/);
  });
});
