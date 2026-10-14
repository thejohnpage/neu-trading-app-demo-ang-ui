import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { RolesComponent } from './roles.component';

describe('RolesComponent behavior', () => {
  const api = {
    rbacCapabilities: vi.fn(() => of(['AUDIT_VIEW', 'USER_MANAGEMENT'])),
    rbacRoles: vi.fn(() => of([{ roleId: 1, roleName: 'OPS', capabilities: ['AUDIT_VIEW'] }])),
    updateRbacRole: vi.fn(() => of({})),
    createRbacRole: vi.fn(() => of({})),
  };
  let component: RolesComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    component = TestBed.runInInjectionContext(() => new RolesComponent());
  });
  it('loads capabilities and roles', () => {
    expect(component.capabilities()).toContain('AUDIT_VIEW');
    expect(component.roles()).toHaveLength(1);
  });
  it('adds and removes capabilities', () => {
    const role = { capabilities: ['AUDIT_VIEW'] };
    component.toggle(role, 'USER_MANAGEMENT');
    expect(role.capabilities).toContain('USER_MANAGEMENT');
    component.toggle(role, 'USER_MANAGEMENT');
    expect(role.capabilities).not.toContain('USER_MANAGEMENT');
  });
  it('initializes a blank role', () => {
    component.newRole();
    expect(component.draft).toEqual({ roleName: '', description: '', capabilities: [] });
  });
  it('saves a role and refreshes the list', () => {
    component.save({ roleId: 1, capabilities: [] });
    expect(api.updateRbacRole).toHaveBeenCalled();
    expect(component.message).toBe('Role updated.');
  });
  it('creates a role and resets the draft', () => {
    component.newRole();
    component.create();
    expect(api.createRbacRole).toHaveBeenCalled();
    expect(component.draft).toBeNull();
  });
  it('surfaces role update errors', () => {
    api.updateRbacRole.mockImplementationOnce(() => throwError(() => ({ error: { message: 'Forbidden' } })));
    component.save({ roleId: 1, capabilities: [] });
    expect(component.error).toBe('Forbidden');
  });
});
