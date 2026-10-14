import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { UsersComponent } from './users.component';

describe('UsersComponent behavior', () => {
  const api = {
    adminUsers: vi.fn(() => of([])),
    rbacRoles: vi.fn(() => of([{ roleName: 'ADMIN_OPERATIONS' }, { roleName: 'SUPER_ADMIN' }])),
    createAdminUser: vi.fn(() => of({})),
    setAdminUserStatus: vi.fn(() => of({})),
    setAdminUserRoles: vi.fn(() => of({})),
    adminUserProfile: vi.fn(() => of({ department: 'Trading' })),
    updateAdminUserProfile: vi.fn(() => of({})),
  };
  let component: UsersComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    component = TestBed.runInInjectionContext(() => new UsersComponent());
  });
  it('loads users and available roles', () => {
    expect(component.users()).toEqual([]);
    expect(component.roles).toContain('ADMIN_OPERATIONS');
  });
  it('toggles draft roles without duplicates', () => {
    component.toggleDraftRole('SUPER_ADMIN');
    expect(component.draft.roles).toContain('SUPER_ADMIN');
    component.toggleDraftRole('SUPER_ADMIN');
    expect(component.draft.roles).not.toContain('SUPER_ADMIN');
  });
  it('rejects incomplete user details', () => {
    component.create();
    expect(component.error).toContain('required');
    expect(api.createAdminUser).not.toHaveBeenCalled();
  });
  it('rejects short temporary passwords', () => {
    Object.assign(component.draft, { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'short' });
    component.create();
    expect(component.error).toContain('at least 10');
  });
  it('requires at least one role', () => {
    Object.assign(component.draft, { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'longpassword', roles: [] });
    component.create();
    expect(component.error).toContain('at least one role');
  });
  it('creates a valid administrative user', () => {
    Object.assign(component.draft, { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'longpassword' });
    component.create();
    expect(api.createAdminUser).toHaveBeenCalled();
    expect(component.message).toBe('Administrative user created.');
  });
  it('does not remove the final role', () => {
    const user = { userId: 'u1', roles: ['ADMIN_OPERATIONS'] } as any;
    component.toggleUserRole(user, 'ADMIN_OPERATIONS');
    expect(component.error).toContain('at least one role');
    expect(api.setAdminUserRoles).not.toHaveBeenCalled();
  });
  it('counts active super administrators', () => {
    component.users.set([{ active: true, roles: ['SUPER_ADMIN'] }, { active: false, roles: ['SUPER_ADMIN'] }] as any);
    expect(component.activeSuperAdmins()).toBe(1);
  });
  it('reports a failed user creation', () => {
    api.createAdminUser.mockImplementationOnce(() => throwError(() => ({ status: 409, error: { message: 'Duplicate email' } })));
    Object.assign(component.draft, { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'longpassword' });
    component.create();
    expect(component.error).toBe('Duplicate email');
  });
});
