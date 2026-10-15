import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { ApiService } from './api.service';

describe('ApiService HTTP contracts', () => {
  let api: ApiService;
  let http: HttpTestingController;
  const base = 'http://localhost:8081/api/v1';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('encodes instrument symbols in quote requests', () => {
    api.quote('GBP/USD').subscribe();
    const req = http.expectOne(base + '/instruments/GBP%2FUSD/quote');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('posts cash deposits with the correct payload', () => {
    const body = { accountId: 'acc', currency: 'USD', amount: 100 };
    api.deposit(body).subscribe();
    const req = http.expectOne(base + '/me/cash/deposits');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('posts a trade order with the correct payload', () => {
    const body = { accountId: 'acc', symbol: 'MSFT', side: 'BUY' as const, quantity: 5 };
    api.submitOrder(body).subscribe();
    const req = http.expectOne(base + '/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('passes FX rate query parameters', () => {
    api.fxRate('USD', 'GBP').subscribe();
    const req = http.expectOne(r => r.url === base + '/me/cash/rates');
    expect(req.request.params.get('from')).toBe('USD');
    expect(req.request.params.get('to')).toBe('GBP');
    req.flush({});
  });

  it('passes cash transaction account ID', () => {
    api.cashTransactions('account-123').subscribe();
    const req = http.expectOne(r => r.url === base + '/me/cash/transactions');
    expect(req.request.params.get('accountId')).toBe('account-123');
    req.flush([]);
  });

  it('includes selected audit filters and omits blank filters', () => {
    api.auditEvents({ action: 'LOGIN', actorType: '', resourceType: 'ORDER' }).subscribe();
    const req = http.expectOne(r => r.url === base + '/admin/audit');
    expect(req.request.params.get('action')).toBe('LOGIN');
    expect(req.request.params.has('actorType')).toBe(false);
    expect(req.request.params.get('resourceType')).toBe('ORDER');
    expect(req.request.params.get('limit')).toBe('100');
    req.flush([]);
  });

  it('sends user status as a PATCH parameter', () => {
    api.setAdminUserStatus('user-1', false).subscribe();
    const req = http.expectOne(r => r.url === base + '/admin/users/user-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('active')).toBe('false');
    req.flush({});
  });

  it('uses the default Kafka event limit', () => {
    api.kafkaEvents().subscribe();
    const req = http.expectOne(r => r.url === base + '/admin/kafka/events');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush([]);
  });

  it('fetches portfolio accounts and positions', () => {
    api.accounts().subscribe();
    api.positions().subscribe();
    http.expectOne(base + '/me/accounts').flush([]);
    http.expectOne(base + '/me/positions').flush([]);
  });

  it('updates admin roles using PUT', () => {
    api.setAdminUserRoles('user-1', ['ADMIN']).subscribe();
    const req = http.expectOne(base + '/admin/users/user-1/roles');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(['ADMIN']);
    req.flush({});
  });
});
