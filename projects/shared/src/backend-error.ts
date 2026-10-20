import { HttpErrorResponse } from '@angular/common/http';

/** Present safe, actionable messages without exposing internal server details. */
export function backendErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred. Please try again.';
  }
  if (error.status === 0) {
    return 'Cannot connect to the service. Check your connection and try again.';
  }
  if (error.status === 401) return 'Your credentials or session could not be verified.';
  if (error.status === 403) return 'You do not have permission to perform this action.';
  if (error.status === 408 || error.status === 504) {
    return 'The service took too long to respond. Please check the latest status before retrying a transaction.';
  }
  if ([500, 502, 503].includes(error.status)) {
    return 'The service is temporarily unavailable. Please try again later.';
  }
  if (error.status === 429) return 'Too many requests. Please wait before trying again.';
  return 'The request could not be completed. Please try again.';
}
