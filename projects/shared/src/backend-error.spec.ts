import { HttpErrorResponse } from '@angular/common/http';
import { backendErrorMessage } from './backend-error';

describe('backendErrorMessage', () => {
  it('distinguishes network outages from bad credentials', () => {
    expect(backendErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('Cannot connect');
    expect(backendErrorMessage(new HttpErrorResponse({ status: 401 }))).toContain('credentials');
  });
  it('does not expose server internals', () => {
    const error = new HttpErrorResponse({ status: 500, error: { message: 'database password secret' } });
    expect(backendErrorMessage(error)).not.toContain('secret');
  });
  it('warns about uncertain transaction outcomes after a timeout', () => {
    expect(backendErrorMessage(new HttpErrorResponse({ status: 504 }))).toContain('before retrying');
  });
});
