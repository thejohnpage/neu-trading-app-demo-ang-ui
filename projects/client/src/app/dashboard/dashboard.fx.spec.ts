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
    cashTransactions: vi.fn(() => of([])),
    portfolioValuation: vi.fn((currency: string, accountId?: string) => of({
      reportingCurrency: currency,
      totalCash: accountId === 'a' ? '100' : accountId === 'b' ? '62.5' : currency === 'GBP' ? '130' : '162.5',
      totalMarketValue: accountId === 'a' ? '0' : currency === 'GBP' ? '20' : '25',
      totalCostBasis: '15', unrealizedProfitLoss: '10', totalEquity: '187.5',
      cash: [], positions: [], rates: [],
    })),
  };
  let component: DashboardComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    api.portfolioValuation.mockImplementation((currency: string, accountId?: string) => of({
      reportingCurrency: currency,
      totalCash: accountId === 'a' ? '100' : accountId === 'b' ? '62.5' : currency === 'GBP' ? '130' : '162.5',
      totalMarketValue: accountId === 'a' ? '0' : currency === 'GBP' ? '20' : '25',
      totalCostBasis: '15', unrealizedProfitLoss: '10', totalEquity: '187.5',
      cash: [], positions: [], rates: [],
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
    expect(component.totalCash()).toBe('162.5');
    expect(component.totalMarketValue()).toBe('25');
    expect(component.totalCostBasis()).toBe('15');
    expect(component.totalProfitLoss()).toBe('10');
    expect(component.totalEquity()).toBe('187.5');
    expect(component.cash()[1].balance).toBe(50);
    expect(component.positions()[0].marketValue).toBe(20);
  });

  it('recalculates totals when an individual account is selected', () => {
    component.selectAccount('a');
    expect(component.totalCash()).toBe('100');
    expect(component.totalMarketValue()).toBe('0');
    component.selectAccount('b');
    expect(component.totalCash()).toBe('62.5');
    expect(component.totalMarketValue()).toBe('25');
  });

  it('supports GBP reporting currency', () => {
    component.setReportingCurrency('GBP');
    expect(component.totalCash()).toBe('130');
    expect(component.totalMarketValue()).toBe('20');
  });

  it('hides mixed-currency totals when FX rates are unavailable', () => {
    api.portfolioValuation.mockImplementation(() => throwError(() => new Error('No quote')));
    component.refreshFx();
    expect(component.fxReady()).toBe(false);
    expect(component.fxError()).toContain('unavailable');
    expect(component.valuation()).toBeNull();
  });
});
