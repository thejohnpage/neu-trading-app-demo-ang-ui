import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { AuthService, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const subject = { sub: 'client-1', type: 'CLIENT' as const, email: 'client@example.com' };
  const response: LoginResponse = {
    accessToken: 'header.payload.signature',
    refreshToken: 'refresh-1',
    tokenType: 'Bearer',
    expiresIn: '15m',
    subject,
  };
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); localStorage.clear(); TestBed.resetTestingModule(); });

  it('logs in and stores tokens and subject', () => {
    let result: LoginResponse | undefined;
    service.login(subject.email, 'secret', 'CLIENT').subscribe(r => result = r);
    const req = http.expectOne('http://localhost:3001/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: subject.email, password: 'secret', type: 'CLIENT' });
    req.flush(response);
    expect(result).toEqual(response);
    expect(localStorage.getItem('accessToken')).toBe(response.accessToken);
    expect(localStorage.getItem('refreshToken')).toBe(response.refreshToken);
    expect(service.subject()).toEqual(subject);
  });

  it('refreshes with the saved refresh token', () => {
    localStorage.setItem('refreshToken', 'old-refresh');
    service.refresh().subscribe();
    const req = http.expectOne('http://localhost:3001/api/v1/auth/refresh');
    expect(req.request.body).toEqual({ refreshToken: 'old-refresh' });
    req.flush(response);
    expect(localStorage.getItem('refreshToken')).toBe('refresh-1');
  });

  it('rejects refresh without a token', () => {
    expect(() => service.refresh()).toThrow('No refresh token');
    http.expectNone('http://localhost:3001/api/v1/auth/refresh');
  });

  it('clears local credentials on logout without a refresh token', () => {
    localStorage.setItem('accessToken', 'old');
    service.logout();
    expect(service.accessToken()).toBeNull();
    expect(service.subject()).toBeNull();
  });

  it('clears local credentials after server logout failure', () => {
    localStorage.setItem('refreshToken', 'old');
    service.logout();
    const req = http.expectOne('http://localhost:3001/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'unavailable' }, { status: 503, statusText: 'Unavailable' });
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('rejects malformed access tokens', () => {
    localStorage.setItem('accessToken', 'bad-token');
    expect(service.expiresAt()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('accepts a future expiry and rejects an expired token', () => {
    const token = (exp: number) => 'header.' + btoa(JSON.stringify({ exp })) + '.signature';
    localStorage.setItem('accessToken', token(Math.floor(Date.now() / 1000) + 3600));
    expect(service.isAuthenticated()).toBe(true);
    localStorage.setItem('accessToken', token(Math.floor(Date.now() / 1000) - 60));
    expect(service.isAuthenticated()).toBe(false);
  });
});
