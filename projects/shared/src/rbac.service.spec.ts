import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService, AuthSubject } from './auth.service';
import { RbacService } from './rbac.service';

describe('RbacService', () => {
  const subject = signal<AuthSubject | null>(null);
  let service: RbacService;
  beforeEach(() => {
    subject.set(null);
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: { subject } }] });
    service = TestBed.inject(RbacService);
  });
  it('denies capabilities when no subject is authenticated', () => {
    expect(service.has('USER_MANAGEMENT')).toBe(false);
  });
  it('denies capabilities not assigned to the subject', () => {
    subject.set({ sub: 'a', type: 'ADMIN', email: 'a@example.com', capabilities: ['AUDIT_VIEW'] });
    expect(service.has('USER_MANAGEMENT')).toBe(false);
  });
  it('allows capabilities assigned to the subject', () => {
    subject.set({ sub: 'a', type: 'ADMIN', email: 'a@example.com', capabilities: ['AUDIT_VIEW'] });
    expect(service.has('AUDIT_VIEW')).toBe(true);
  });
  it('handles a subject without a capabilities array', () => {
    subject.set({ sub: 'a', type: 'CLIENT', email: 'a@example.com' });
    expect(service.has('AUDIT_VIEW')).toBe(false);
  });
});
