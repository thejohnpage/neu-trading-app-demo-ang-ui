import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { AppConfigService } from './app-config.service';

describe('authInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  const auth = { accessToken: () => 'token-123' };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: AppConfigService, useValue: { authBaseUrl: 'http://localhost:3001/api/v1/auth' } },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });
  it('adds bearer authorization to API calls', () => {
    client.get('/api/v1/orders').subscribe();
    const req = http.expectOne('/api/v1/orders');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush([]);
  });
  it('does not attach authorization to auth server calls', () => {
    client.post('http://localhost:3001/api/v1/auth/login', {}).subscribe();
    const req = http.expectOne('http://localhost:3001/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
  it('does not attach authorization when token is absent', () => {
    auth.accessToken = () => '';
    client.get('/api/v1/orders').subscribe();
    const req = http.expectOne('/api/v1/orders');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
