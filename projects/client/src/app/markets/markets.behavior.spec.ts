import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '@shared/api.service';
import { MarketsComponent } from './markets.component';

describe('MarketsComponent behavior', () => {
  const navigate = vi.fn();
  const api = {
    instruments: vi.fn(() => of([{ symbol: 'MSFT' }, { symbol: 'AAPL' }])),
    quote: vi.fn((symbol: string) => of({ symbol, bid: 100, ask: 101 })),
  };
  let component: MarketsComponent;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, { provide: Router, useValue: { navigate } }],
    });
    component = TestBed.runInInjectionContext(() => new MarketsComponent());
  });
  it('loads instruments and their quotes', () => {
    expect(component.instruments()).toHaveLength(2);
    expect(api.quote).toHaveBeenCalledWith('MSFT');
    expect(api.quote).toHaveBeenCalledWith('AAPL');
    expect(Object.keys(component.quotes())).toEqual(['MSFT', 'AAPL']);
  });
  it('navigates to trade with the selected symbol', () => {
    component.trade('MSFT');
    expect(navigate).toHaveBeenCalledWith(['/trade'], { queryParams: { symbol: 'MSFT' } });
  });
});
