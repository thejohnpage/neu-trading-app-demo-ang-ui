import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiBaseUrl: string;
  authBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private config: AppConfig | null = null;

  async load(): Promise<void> {
    const data = await firstValueFrom(this.http.get<unknown>('/app-config.json', {
      headers: { 'Cache-Control': 'no-cache' },
    }));
    if (!data || typeof data !== 'object') throw new Error('Invalid application configuration');
    const config = data as Partial<AppConfig>;
    if (!this.validUrl(config.apiBaseUrl) || !this.validUrl(config.authBaseUrl)) {
      throw new Error('Invalid API endpoints in app-config.json');
    }
    this.config = { apiBaseUrl: config.apiBaseUrl!, authBaseUrl: config.authBaseUrl! };
  }

  get apiBaseUrl(): string { return this.get().apiBaseUrl; }
  get authBaseUrl(): string { return this.get().authBaseUrl; }

  private get(): AppConfig {
    if (!this.config) throw new Error('Application configuration has not loaded');
    return this.config;
  }

  private validUrl(value: unknown): value is string {
    if (typeof value !== 'string' || !value || value.endsWith('/')) return false;
    if (value.startsWith('/')) return !value.startsWith('//');
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === 'localhost');
    } catch { return false; }
  }
}
