import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { AppConfigService } from './app-config.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(AppConfigService);
  const token = inject(AuthService).accessToken();
  const isAuthRequest = req.url === config.authBaseUrl || req.url.startsWith(config.authBaseUrl + '/');
  if (!token || isAuthRequest) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
