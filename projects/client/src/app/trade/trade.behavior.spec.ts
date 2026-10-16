import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { TradeComponent } from './trade.component';

describe('TradeComponent behavior', () => {
  const api = {
    accounts: vi.fn(() => of([{ accountId: 'account-1' }])),
    cash: vi.fn(() => of([{ accountId: 'account-1', currency: 'USD', balance: 1500 }])),
    positions: vi.fn(() => of([])),
    instruments: vi.fn(() => of([])),
    quote: vi.fn(() => of({ bid: 99, ask: 100, quoteCurrency: 'USD' })),
    submitOrder: vi.fn(() => of({ orderId: 'order-1' })),
  };
  let component: TradeComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    api.submitOrder.mockImplementation(() => of({ orderId: 'order-1' }));
    api.positions.mockImplementation(() => of([]));
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => 'MSFT' } } } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new TradeComponent());
  });
  it('loads the requested symbol and first account', () => {
    expect(component.symbol).toBe('MSFT');
    expect(component.accountId).toBe('account-1');
    expect(component.availableCash('USD')).toBe(1500);
    expect(component.availableCash('GBP')).toBe(0);
  });
  it('disables sell when no holding exists for the selected ticker', () => {
    expect(component.canBuy()).toBe(true);
    expect(component.canSell()).toBe(false);
  });
  it('disables both actions for an unfunded account', () => {
    component.cash.set([{ accountId: 'account-1', currency: 'USD', balance: 0, updatedAt: '2026-10-16T00:00:00Z' }]);
    expect(component.canBuy()).toBe(false);
    expect(component.canSell()).toBe(false);
    expect(component.canSubmit()).toBe(false);
  });
  it('enables sell only for an owned ticker position', () => {
    component.positions.set([{ accountId: 'account-1', symbol: 'MSFT', quantity: 5 } as any]);
    expect(component.canSell()).toBe(true);
    component.symbol = 'AAPL';
    expect(component.canSell()).toBe(false);
  });
  it('permits selling an owned holding even with no cash', () => {
    component.positions.set([{ accountId: 'account-1', symbol: 'MSFT', quantity: 5 } as any]);
    component.cash.set([{ accountId: 'account-1', currency: 'USD', balance: 0, updatedAt: '2026-10-16T00:00:00Z' }]);
    expect(component.canSell()).toBe(true);
    expect(component.canBuy()).toBe(false);
    expect(component.needsFunding()).toBe(false);
  });
  it('shows a funding requirement when both holdings and cash are empty', () => {
    component.cash.set([{ accountId: 'account-1', currency: 'USD', balance: 0, updatedAt: '2026-10-16T00:00:00Z' }]);
    expect(component.needsFunding()).toBe(true);
  });
  it('formats order identifiers', () => {
    expect(component.shortId('abcd1234-5678-9012')).toBe('ORD-ABCD1234');
  });
  it('submits the selected trade and clears busy state', () => {
    component.quantity = 5;
    component.submit();
    expect(api.submitOrder).toHaveBeenCalledWith({
      accountId: 'account-1', symbol: 'MSFT', side: 'BUY', quantity: 5,
    });
    expect(component.result()).toEqual({ orderId: 'order-1' });
    expect(component.busy()).toBe(false);
  });
  it('shows API errors and resets busy state', () => {
    api.submitOrder.mockImplementationOnce(() => throwError(() => ({ error: { message: 'Insufficient cash' } })));
    component.submit();
    expect(component.error()).toBe('Insufficient cash');
    expect(component.result()).toBeNull();
    expect(component.busy()).toBe(false);
  });
  it('uses a fallback error when no API message exists', () => {
    api.submitOrder.mockImplementationOnce(() => throwError(() => ({})));
    component.submit();
    expect(component.error()).toBe('Unable to submit order');
  });
});
