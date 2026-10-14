import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { RbacService } from './rbac.service';
import { authGuard } from './auth.guard';
import { capabilityGuard } from './capability.guard';

describe('Client and capability guards', () => {
  const router = { createUrlTree: (commands: string[]) => ({ redirect: commands }) as unknown as UrlTree };
  const auth = { isAuthenticated: () => false };
  const rbac = { has: (_cap: string) => false };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: RbacService, useValue: rbac },
        { provide: Router, useValue: router },
      ],
    });
  });
  const state = {} as RouterStateSnapshot;
  const route = { data: { capability: 'USER_MANAGEMENT' } } as unknown as ActivatedRouteSnapshot;

  it('permits an authenticated client', () => {
    auth.isAuthenticated = () => true;
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });
  it('redirects an unauthenticated client to login', () => {
    auth.isAuthenticated = () => false;
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toEqual({ redirect: ['/login'] });
  });
  it('permits an authorized administrator', () => {
    rbac.has = cap => cap === 'USER_MANAGEMENT';
    expect(TestBed.runInInjectionContext(() => capabilityGuard(route, state))).toBe(true);
  });
  it('redirects an unauthorized administrator', () => {
    rbac.has = () => false;
    expect(TestBed.runInInjectionContext(() => capabilityGuard(route, state))).toEqual({ redirect: ['/'] });
  });
});
