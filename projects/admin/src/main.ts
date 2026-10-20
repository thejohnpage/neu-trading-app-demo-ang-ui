import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from '@shared/auth.interceptor';
import { backendErrorInterceptor } from '@shared/backend-error.interceptor';
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([authInterceptor, backendErrorInterceptor])), provideRouter(routes, withComponentInputBinding())],
}).catch(console.error);
