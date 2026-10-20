import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError, timeout } from 'rxjs';

/**
 * Bound requests so an offline backend cannot leave the UI spinning forever.
 * Do not retry mutations: a timed-out trade or cash movement may have succeeded.
 * Preserve HttpErrorResponse for existing status-specific component handlers.
 */
export const backendErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    timeout({ first: 15000 }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) return throwError(() => error);
      return throwError(() => new HttpErrorResponse({
        status: 504,
        statusText: 'Request timed out',
        url: request.url,
        error: { message: 'The request timed out.' },
      }));
    }),
  );
