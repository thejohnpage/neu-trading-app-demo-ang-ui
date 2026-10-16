import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '@shared/api.service';
import { OrderStatusStreamService, OrderStatusUpdate } from '@shared/order-status-stream.service';
import { SimpleChartComponent, ChartDatum } from '@shared/simple-chart/simple-chart.component';
import { Account, CashBalance, CashTransaction, Order, Position } from '@shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule, SimpleChartComponent],
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private api = inject(ApiService);
  private orderStatus = inject(OrderStatusStreamService);
  liveStatus = signal<OrderStatusUpdate | null>(null);
  accounts = signal<Account[]>([]);
  cash = signal<CashBalance[]>([]);
  readonly selectedAccountId = signal('ALL');
  readonly visibleCash = computed(() => this.cash().filter(c => this.selectedAccountId() === 'ALL' || c.accountId === this.selectedAccountId()));
  readonly visiblePositions = computed(() => this.positions().filter(p => this.selectedAccountId() === 'ALL' || p.accountId === this.selectedAccountId()));
  readonly visibleOrders = computed(() => this.orders().filter(o => this.selectedAccountId() === 'ALL' || o.accountId === this.selectedAccountId()));
  readonly visibleAllocation = computed<ChartDatum[]>(() => this.valuedPositions().filter(p => p.marketValue > 0).map(p => ({ label: p.symbol, value: p.marketValue })));
  readonly visibleProfitLoss = computed<ChartDatum[]>(() => this.valuedPositions().map(p => ({ label: p.symbol, value: p.unrealizedGainLoss })));
  readonly selectedAccount = computed(() => this.accounts().find(a => a.accountId === this.selectedAccountId()));
  readonly canMoveCash = computed(() => this.selectedAccountId() !== 'ALL');
  readonly reportingCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];
  readonly reportingCurrency = signal('USD');
  readonly fxRates = signal<Record<string, { rate: number; source: string; quotedAt: string }>>({});
  readonly fxLoading = signal(true);
  readonly fxError = signal('');
  private fxRequest = 0;
  readonly sourceCurrencies = computed(() => [...new Set([
    ...this.visibleCash().map(c => c.currency),
    ...this.visiblePositions().map(p => p.currency),
  ])].sort());
  readonly fxReady = computed(() => !this.fxLoading() && !this.fxError() &&
    this.sourceCurrencies().every(c => c === this.reportingCurrency() || !!this.fxRates()[c]));
  readonly valuedCash = computed(() => this.fxReady()
    ? this.visibleCash().map(c => ({ ...c, reportedBalance: c.balance * (this.fxRates()[c.currency]?.rate ?? 1) }))
    : []);
  readonly valuedPositions = computed(() => this.fxReady()
    ? this.visiblePositions().map(p => {
        const rate = this.fxRates()[p.currency]?.rate ?? 1;
        return { ...p, marketValue: p.marketValue * rate,
          costBasis: p.costBasis * rate, unrealizedGainLoss: p.unrealizedGainLoss * rate };
      })
    : []);
  readonly totalCash = computed(() => this.valuedCash().reduce((sum,c) => sum + c.reportedBalance, 0));
  readonly totalMarketValue = computed(() => this.valuedPositions().reduce((sum,p) => sum + p.marketValue, 0));
  readonly totalCostBasis = computed(() => this.valuedPositions().reduce((sum,p) => sum + p.costBasis, 0));
  readonly totalProfitLoss = computed(() => this.totalMarketValue() - this.totalCostBasis());
  readonly totalEquity = computed(() => this.totalCash() + this.totalMarketValue());
  readonly fxDetails = computed(() => this.sourceCurrencies().filter(c => c !== this.reportingCurrency())
    .map(c => ({ currency: c, ...this.fxRates()[c] })).filter(x => x.rate));
  transactions = signal<CashTransaction[]>([]);
  positions = signal<Position[]>([]);
  orders = signal<Order[]>([]);
  allocation = signal<ChartDatum[]>([]);
  profitLoss = signal<ChartDatum[]>([]);
  busy = signal(false);
  error = signal('');
  message = signal('');
  rate = signal<number | null>(null);
  rateSource = signal('');
  get accountId(): string { return this.selectedAccountId() === 'ALL' ? '' : this.selectedAccountId(); }
  set accountId(id: string) { this.selectedAccountId.set(id); }
  selectAccount(id: string): void {
    this.selectedAccountId.set(id);
    this.loadTransactions();
    this.refreshFx();
  }
  setReportingCurrency(currency: string): void {
    if (!this.reportingCurrencies.includes(currency)) return;
    this.reportingCurrency.set(currency);
    this.refreshFx();
  }
  refreshFx(): void {
    const token = ++this.fxRequest;
    const target = this.reportingCurrency();
    const currencies = this.sourceCurrencies().filter(c => c !== target);
    this.fxError.set('');
    this.fxRates.set({});
    if (!currencies.length) { this.fxLoading.set(false); return; }
    this.fxLoading.set(true);
    forkJoin(currencies.map(c => this.api.fxRate(c, target))).subscribe({
      next: results => {
        if (token !== this.fxRequest) return;
        if (results.some(r => !Number.isFinite(r.rate) || r.rate <= 0)) {
          this.fxError.set('An invalid FX rate was returned. Consolidated values are unavailable.');
        } else {
          this.fxRates.set(Object.fromEntries(results.map(r => [r.fromCurrency, {
            rate: r.rate, source: r.source, quotedAt: r.quotedAt,
          }])));
        }
        this.fxLoading.set(false);
      },
      error: () => {
        if (token !== this.fxRequest) return;
        this.fxError.set('FX rates unavailable. Consolidated totals and charts are hidden to avoid mixing currencies.');
        this.fxLoading.set(false);
      },
    });
  }
  currency = 'USD';
  amount = 1000;
  fromCurrency = 'USD';
  toCurrency = 'GBP';
  convertAmount = 100;
  constructor() {
    this.orderStatus.stream().subscribe({
      next: (s) => {
        this.liveStatus.set(s);
        this.api.orders().subscribe((x) => this.orders.set(x));
        this.api.positions().subscribe((x) => this.setPositions(x));
        this.refresh();
        this.loadTransactions();
      },
      error: () => {},
    });
    this.api.accounts().subscribe((x) => {
      this.accounts.set(x);
      this.accountId = 'ALL';
      this.loadTransactions();
      this.refreshFx();
    });
    this.refresh();
    this.api.positions().subscribe((x) => this.setPositions(x));
    this.api.orders().subscribe((x) => this.orders.set(x));
  }
  private setPositions(x: Position[]) {
    this.positions.set(x);
    this.allocation.set(
      x.filter((p) => p.marketValue > 0).map((p) => ({ label: p.symbol, value: p.marketValue })),
    );
    this.profitLoss.set(x.map((p) => ({ label: p.symbol, value: p.unrealizedGainLoss })));
    this.refreshFx();
  }
  refresh() {
    this.api.cash().subscribe((x) => { this.cash.set(x); this.refreshFx(); });
  }
  loadTransactions() {
    if (!this.accountId) { this.transactions.set([]); return; }
    const requestedAccountId = this.accountId;
    this.api.cashTransactions(requestedAccountId).subscribe({
      next: x => { if (this.accountId === requestedAccountId) this.transactions.set(x); },
      error: () => this.error.set('Unable to load account transactions.'),
    });
  }
  deposit() {
    this.move('deposit');
  }
  withdraw() {
    this.move('withdraw');
  }
  private move(kind: 'deposit' | 'withdraw') {
    if (!this.accountId) { this.error.set('Select an individual account to manage cash.'); return; }
    this.start();
    const call =
      kind === 'deposit'
        ? this.api.deposit({
            accountId: this.accountId,
            currency: this.currency,
            amount: this.amount,
          })
        : this.api.withdraw({
            accountId: this.accountId,
            currency: this.currency,
            amount: this.amount,
          });
    call.subscribe({
      next: () => this.finish(kind === 'deposit' ? 'Deposit completed' : 'Withdrawal completed'),
      error: (e) => this.fail(e),
    });
  }
  getRate() {
    this.start();
    this.api.fxRate(this.fromCurrency, this.toCurrency).subscribe({
      next: (r) => {
        this.rate.set(r.rate);
        this.rateSource.set(r.source);
        this.busy.set(false);
      },
      error: (e) => this.fail(e),
    });
  }
  convert() {
    if (!this.accountId) { this.error.set('Select an individual account to convert cash.'); return; }
    this.start();
    this.api
      .convertCash({
        accountId: this.accountId,
        fromCurrency: this.fromCurrency,
        toCurrency: this.toCurrency,
        amount: this.convertAmount,
      })
      .subscribe({
        next: (r) => {
          this.rate.set(r.rate);
          this.rateSource.set(r.source);
          this.finish(
            `Converted ${r.debitedAmount} ${r.fromCurrency} to ${r.creditedAmount} ${r.toCurrency}`,
          );
        },
        error: (e) => this.fail(e),
      });
  }
  shortId(id: string, prefix: string) {
    return `${prefix}-${id.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
  }
  private start() {
    this.error.set('');
    this.message.set('');
    this.busy.set(true);
  }
  private finish(message: string) {
    this.message.set(message);
    this.busy.set(false);
    this.refresh();
    this.loadTransactions();
  }
  private fail(e: any) {
    this.error.set(e.error?.message ?? 'Cash operation failed');
    this.busy.set(false);
  }
}
