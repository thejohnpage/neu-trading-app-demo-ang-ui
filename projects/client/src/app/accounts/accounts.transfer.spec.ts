import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { AccountsComponent } from './accounts.component';

describe('AccountsComponent cash transfers', () => {
  const accounts = [
    { accountId: 'a', accountNumber: 'ACC-A', accountName: 'US Trading', accountType: 'INDIVIDUAL', baseCurrency: 'USD', status: 'ACTIVE' },
    { accountId: 'b', accountNumber: 'ACC-B', accountName: 'UK Trading', accountType: 'INDIVIDUAL', baseCurrency: 'GBP', status: 'ACTIVE' },
  ];
  const api = {
    accounts: vi.fn(() => of(accounts)),
    cash: vi.fn(() => of([{ accountId: 'a', currency: 'USD', balance: 1000, updatedAt: '2026-10-16T00:00:00Z' }])),
    fxRate: vi.fn(() => of({ fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.8, source: 'TEST', quotedAt: '2026-10-16T00:00:00Z' })),
    transferCash: vi.fn(() => of({
      transferId: 'transfer-1', fromAccountId: 'a', toAccountId: 'b',
      fromCurrency: 'USD', toCurrency: 'GBP', debitedAmount: 100,
      creditedAmount: 80, exchangeRate: 0.8, rateSource: 'TEST', createdAt: '2026-10-16T00:00:00Z',
    })),
  };
  let component: AccountsComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    api.transferCash.mockImplementation(() => of({
      transferId: 'transfer-1', fromAccountId: 'a', toAccountId: 'b',
      fromCurrency: 'USD', toCurrency: 'GBP', debitedAmount: 100,
      creditedAmount: 80, exchangeRate: 0.8, rateSource: 'TEST', createdAt: '2026-10-16T00:00:00Z',
    }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    component = TestBed.runInInjectionContext(() => new AccountsComponent());
  });

  it('preselects two distinct active accounts', () => {
    expect(component.transferFromId).toBe('a');
    expect(component.transferToId).toBe('b');
  });

  it('rejects insufficient cash before calling the FX service', () => {
    component.transferAmount = 1500;
    component.reviewTransfer();
    expect(component.error()).toContain('Insufficient');
    expect(api.fxRate).not.toHaveBeenCalled();
  });

  it('previews FX and transfers with an idempotency ID', () => {
    component.transferAmount = 100;
    component.reviewTransfer();
    const preview = component.transferPreview();
    expect(preview?.rate).toBe(0.8);
    expect(preview?.transferId).toBeTruthy();
    component.confirmTransfer();
    expect(api.transferCash).toHaveBeenCalledWith({
      transferId: preview!.transferId, fromAccountId: 'a', toAccountId: 'b', amount: 100,
    });
    expect(component.message()).toContain('Transferred');
    expect(component.transferPreview()).toBeNull();
  });

  it('retains the transfer ID after a failed response for safe retry', () => {
    component.transferAmount = 100;
    component.reviewTransfer();
    const id = component.transferPreview()!.transferId;
    api.transferCash.mockImplementationOnce(() => throwError(() => ({ error: { message: 'Network error' } })));
    component.confirmTransfer();
    expect(component.transferPreview()?.transferId).toBe(id);
    expect(component.error()).toContain('Network error');
  });
});
