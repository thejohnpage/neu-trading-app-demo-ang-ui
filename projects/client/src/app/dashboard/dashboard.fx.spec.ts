import { TestBed } from '@angular/core/testing';
import { of, NEVER, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { OrderStatusStreamService } from '@shared/order-status-stream.service';
import { DashboardComponent } from './dashboard.component';

describe('Portfolio FX valuation', () => {
  const api = {
    accounts: vi.fn(() => of([
      { accountId: 'a', accountName: 'US', accountNumber: 'A', baseCurrency: 'USD', status: 'ACTIVE' },
      { accountId: 'b', accountName: 'UK', accountNumber: 'B', baseCurrency: 'GBP', status: 'ACTIVE' },
    ])),
    cash: vi.fn(() => of([
      { accountId: 'a', currency: 'USD', balance: 100, updatedAt: '2026-10-16T00:00:00Z' },
      { accountId: 'b', currency: 'GBP', balance: 50, updatedAt: '2026-10-16T00:00:00Z' },
    ])),
    positions: vi.fn(() => of([
      { accountId: 'b', instrumentId: 'i', symbol: 'ABC', currency: 'GBP', quantity: 2,
        currentPrice: 10, marketValue: 20, costBasis: 12, unrealizedGainLoss: 8,
        unrealizedGainLossPercent: 66.67, instrumentType: 'EQUITY', updatedAt: '2026-10-16T00:00:00Z' },
    ])),
    orders: vi.fn(() => of([])),
    fxRate: vi.fn((from: string, to: string) => of({
      fromCurrency: from, toCurrency: to, rate: from === 'GBP' ? 1.25 : 0.8,
      source: 'TEST', quotedAt: '2026-10-16T00:00:00Z',
    })),
  };
  let component: DashboardComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    api.fxRate.mockImplementation((from: string, to: string) => of({
      fromCurrency: from, toCurrency: to, rate: from === 'GBP' ? 1.25 : 0.8,
      source: 'TEST', quotedAt: '2026-10-16T00:00:00Z',
    }));
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
        { provide: OrderStatusStreamService, useValue: { stream: () => NEVER } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new DashboardComponent());
  });

  it('converts all accounts to USD without altering native values', () => {
    expect(component.fxReady()).toBe(true);
    expect(component.totalCash()).toBe(162.5);
    expect(component.totalMarketValue()).toBe(25);
    expect(component.totalCostBasis()).toBe(15);
    expect(component.totalProfitLoss()).toBe(10);
    expect(component.totalEquity()).toBe(187.5);
    expect(component.cash()[1].balance).toBe(50);
    expect(component.positions()[0].marketValue).toBe(20);
  });

  it('recalculates totals when an individual account is selected', () => {
    component.selectAccount('a');
    expect(component.totalCash()).toBe(100);
    expect(component.totalMarketValue()).toBe(0);
    component.selectAccount('b');
    expect(component.totalCash()).toBe(62.5);
    expect(component.totalMarketValue()).toBe(25);
  });

  it('supports GBP reporting currency', () => {
    component.setReportingCurrency('GBP');
    expect(component.totalCash()).toBe(130);
    expect(component.totalMarketValue()).toBe(20);
  });

  it('hides mixed-currency totals when FX rates are unavailable', () => {
    api.fxRate.mockImplementation(() => throwError(() => new Error('No quote')));
    component.refreshFx();
    expect(component.fxReady()).toBe(false);
    expect(component.fxError()).toContain('unavailable');
    expect(component.valuedPositions()).toEqual([]);
  });
});
