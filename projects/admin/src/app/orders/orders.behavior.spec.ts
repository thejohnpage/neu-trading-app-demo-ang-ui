import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { OrdersComponent } from './orders.component';

describe('Admin OrdersComponent behavior', () => {
  const order = { orderId: '12345678-abcd', symbol: 'MSFT' } as any;
  const api = {
    adminOrders: vi.fn(() => of([order])),
    adminOrderEvents: vi.fn(() => of([{ status: 'FILLED' }])),
    pricing: vi.fn(() => of({ executionPrice: 100 })),
  };
  let component: OrdersComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    component = TestBed.runInInjectionContext(() => new OrdersComponent());
  });
  it('loads and selects the first order', () => {
    expect(component.selected()).toEqual(order);
    expect(component.events()).toHaveLength(1);
    expect(component.pricing()).toEqual({ executionPrice: 100 });
  });
  it('formats order identifiers', () => {
    expect(component.shortId('12345678-abcd')).toBe('ORD-12345678');
  });
  it('clears pricing when lookup fails', () => {
    api.pricing.mockImplementationOnce(() => throwError(() => new Error('Unavailable')));
    component.select(order);
    expect(component.pricing()).toBeNull();
  });
});
