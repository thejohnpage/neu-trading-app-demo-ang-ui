import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.removeItem('neu-trading-theme');
    document.documentElement.removeAttribute('data-theme');
    TestBed.resetTestingModule();
  });
  afterEach(() => localStorage.removeItem('neu-trading-theme'));

  it('applies a selected theme and persists it', () => {
    const service = TestBed.inject(ThemeService);
    service.set('dark');
    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('neu-trading-theme')).toBe('dark');
    service.toggle();
    expect(service.mode()).toBe('light');
    expect(localStorage.getItem('neu-trading-theme')).toBe('light');
  });

  it('persists projector mode across service initialization', () => {
    const service = TestBed.inject(ThemeService);
    service.set('projector');
    expect(service.mode()).toBe('projector');
    expect(localStorage.getItem('neu-trading-theme')).toBe('projector');
    expect(document.documentElement.getAttribute('data-theme')).toBe('projector');
    TestBed.resetTestingModule();
    const restored = TestBed.inject(ThemeService);
    expect(restored.mode()).toBe('projector');
  });

  it('restores a saved theme in a new injector', () => {
    localStorage.setItem('neu-trading-theme', 'dark');
    const service = TestBed.inject(ThemeService);
    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
