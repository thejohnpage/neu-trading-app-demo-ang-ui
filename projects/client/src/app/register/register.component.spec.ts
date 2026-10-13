import { reflectComponentType } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  it('is a standalone Angular component with a selector', () => {
    const metadata = reflectComponentType(RegisterComponent);
    expect(metadata?.isStandalone).toBe(true);
    expect(metadata?.selector).toMatch(/^app-/);
  });

  // Exercise validation without constructing the component's API/router dependencies.
  function validationSubject(password: string, confirmPassword: string): RegisterComponent {
    const component = Object.create(RegisterComponent.prototype) as RegisterComponent;
    component.password = password;
    component.confirmPassword = confirmPassword;
    component.error = '';
    component.busy = false;
    return component;
  }

  it('rejects mismatched passwords before invoking the API', () => {
    const component = validationSubject('longsecret123', 'different123');
    component.register();
    expect(component.error).toBe('Passwords do not match.');
    expect(component.busy).toBe(false);
  });

  it('rejects passwords shorter than ten characters', () => {
    const component = validationSubject('short', 'short');
    component.register();
    expect(component.error).toBe('Password must be at least 10 characters.');
    expect(component.busy).toBe(false);
  });
});
