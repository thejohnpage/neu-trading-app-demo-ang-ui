import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { Account, CashBalance, Instrument, Order, Position, Quote } from '@shared/models';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink],
  styleUrl: './trade.component.scss',
  templateUrl: './trade.component.html',
})
export class TradeComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  accounts = signal<Account[]>([]);
  instruments = signal<Instrument[]>([]);
  cash = signal<CashBalance[]>([]);
  positions = signal<Position[]>([]);
  readonly balancesLoaded = signal(false);
  readonly positionsLoaded = signal(false);
  hasCash(): boolean { return this.cash().some(c => c.accountId === this.accountId && c.balance > 0); }
  hasHoldings(): boolean { return this.positions().some(p => p.accountId === this.accountId && p.quantity > 0); }
  needsFunding(): boolean { return !!this.accountId && this.balancesLoaded() && this.positionsLoaded() && !this.hasCash() && !this.hasHoldings(); }
  heldQuantity(): number { return this.positions().filter(p => p.accountId === this.accountId && p.symbol === this.symbol).reduce((sum, p) => sum + p.quantity, 0); }
  canBuy(): boolean { const q = this.quote(); return !!this.accountId && !!q && this.hasCash() && this.availableCash(q.quoteCurrency) > 0; }
  canSell(): boolean { return !!this.accountId && this.heldQuantity() > 0; }
  canSubmit(): boolean { return !this.busy() && this.quantity > 0 && (this.side === 'BUY' ? this.canBuy() : this.canSell()) && (this.side !== 'SELL' || this.quantity <= this.heldQuantity()); }
  quote = signal<Quote | null>(null);
  result = signal<Order | null>(null);
  error = signal('');
  busy = signal(false);
  accountId = '';
  onAccountChange(id: string) { this.accountId = id; this.ensureValidSide(); }
  onSymbolChange(symbol: string) { this.symbol = symbol; this.quote.set(null); this.loadQuote(); this.ensureValidSide(); }
  private ensureValidSide() { if (this.side === 'SELL' && !this.canSell()) this.side = 'BUY'; }
  private refreshBalances() {
    this.api.cash().subscribe({ next: x => { this.cash.set(x); this.balancesLoaded.set(true); this.ensureValidSide(); }, error: () => this.error.set('Unable to load cash balances.') });
    this.api.positions().subscribe({ next: x => { this.positions.set(x); this.positionsLoaded.set(true); this.ensureValidSide(); }, error: () => this.error.set('Unable to load positions.') });
  }
  symbol = 'AAPL';
  side: 'BUY' | 'SELL' = 'BUY';
  quantity = 1;
  constructor() {
    const requested = this.route.snapshot.queryParamMap.get('symbol');
    if (requested) this.symbol = requested;
    this.api.accounts().subscribe((x) => {
      this.accounts.set(x);
      this.accountId = x[0]?.accountId ?? '';
    });
    this.refreshBalances();
    this.api.instruments().subscribe((x) => {
      this.instruments.set(x);
      this.loadQuote();
    });
  }
  loadQuote() {
    if (this.symbol) {
      const requestedSymbol = this.symbol;
      this.api.quote(requestedSymbol).subscribe({
        next: x => { if (this.symbol === requestedSymbol) this.quote.set(x); },
        error: () => { if (this.symbol === requestedSymbol) { this.quote.set(null); this.error.set('Unable to load quote.'); } },
      });
    }
  }
  availableCash(currency: string) {
    return (
      this.cash().find((c) => c.accountId === this.accountId && c.currency === currency)?.balance ??
      0
    );
  }
  shortId(id: string) {
    return `ORD-${id.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
  }
  submit() {
    if (!this.canSubmit()) return;
    this.error.set('');
    this.result.set(null);
    this.busy.set(true);
    this.api
      .submitOrder({
        accountId: this.accountId,
        symbol: this.symbol,
        side: this.side,
        quantity: this.quantity,
      })
      .subscribe({
        next: (o) => {
          this.result.set(o);
          this.busy.set(false);
          this.refreshBalances();
        },
        error: (e) => {
          this.error.set(e.error?.message ?? 'Unable to submit order');
          this.busy.set(false);
        },
      });
  }
}
