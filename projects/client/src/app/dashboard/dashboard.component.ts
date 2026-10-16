import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  readonly selectedAccount = computed(() => this.accounts().find(a => a.accountId === this.selectedAccountId()));
  readonly canMoveCash = computed(() => this.selectedAccountId() !== 'ALL');
  readonly reportingCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];
  readonly reportingCurrency = signal('USD');
  readonly valuation = signal<{
    reportingCurrency: string; totalCash: string; totalMarketValue: string;
    totalCostBasis: string; unrealizedProfitLoss: string; totalEquity: string;
    cash: { accountId: string; currency: string; nativeBalance: string; reportedBalance: string }[];
    positions: { accountId: string; instrumentId: string; symbol: string; currency: string;
      nativeMarketValue: string; nativeCostBasis: string; nativeProfitLoss: string;
      reportedMarketValue: string; reportedCostBasis: string; reportedProfitLoss: string }[];
    rates: { fromCurrency: string; toCurrency: string; rate: string; source: string; quotedAt: string | null }[];
  } | null>(null);
  readonly fxLoading = signal(true);
  readonly fxError = signal('');
  private fxRequest = 0;
  readonly fxReady = computed(() => !this.fxLoading() && !this.fxError() && !!this.valuation());
  readonly totalCash = computed(() => this.valuation()?.totalCash ?? '0');
  readonly totalMarketValue = computed(() => this.valuation()?.totalMarketValue ?? '0');
  readonly totalCostBasis = computed(() => this.valuation()?.totalCostBasis ?? '0');
  readonly totalProfitLoss = computed(() => this.valuation()?.unrealizedProfitLoss ?? '0');
  readonly totalEquity = computed(() => this.valuation()?.totalEquity ?? '0');
  readonly fxDetails = computed(() => (this.valuation()?.rates ?? [])
    .filter(r => r.fromCurrency !== r.toCurrency)
    .map(r => ({ currency: r.fromCurrency, rate: r.rate, source: r.source, quotedAt: r.quotedAt })));
  readonly valuedPositions = computed(() => this.valuation()?.positions ?? []);
  readonly visibleAllocation = computed<ChartDatum[]>(() => this.valuedPositions()
    .filter(p => Number(p.reportedMarketValue) > 0)
    .map(p => ({ label: p.symbol, value: Number(p.reportedMarketValue) })));
  readonly visibleProfitLoss = computed<ChartDatum[]>(() => this.valuedPositions()
    .map(p => ({ label: p.symbol, value: Number(p.reportedProfitLoss) })));
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
    this.fxLoading.set(true);
    this.fxError.set('');
    this.valuation.set(null);
    this.api.portfolioValuation(
      this.reportingCurrency(),
      this.selectedAccountId() === 'ALL' ? undefined : this.selectedAccountId(),
    ).subscribe({
      next: result => {
        if (token !== this.fxRequest) return;
        this.valuation.set(result);
        this.fxLoading.set(false);
      },
      error: () => {
        if (token !== this.fxRequest) return;
        this.fxError.set('Portfolio valuation unavailable. Totals and charts are hidden.');
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
