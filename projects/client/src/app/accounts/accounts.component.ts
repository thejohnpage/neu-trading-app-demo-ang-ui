import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { Account } from '@shared/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent {
  private readonly api = inject(ApiService);
  readonly accounts = signal<Account[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly currencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];
  accountName = '';
  accountType: 'INDIVIDUAL' = 'INDIVIDUAL';
  baseCurrency = 'USD';
  initialDeposit = 0;
  depositAccountId: string | null = null;
  depositAmount: number | null = null;
  readonly balances = signal<Record<string, number>>({});
  editingId: string | null = null;
  editName = '';
  closingId: string | null = null;
  transferFromId = '';
  transferToId = '';
  transferAmount: number | null = null;
  readonly transferPreview = signal<{ rate: number; source: string; fromCurrency: string; toCurrency: string; amount: number; transferId: string } | null>(null);
  readonly reviewingTransfer = signal(false);

  constructor() { this.reload(); }

  private validAmount(amount: number | null): boolean {
    return amount !== null && Number.isFinite(amount) && amount > 0 && Math.round(amount * 100) === amount * 100;
  }

  private loadBalances(): void {
    this.api.cash().subscribe({
      next: balances => this.balances.set(Object.fromEntries(balances.map(b => [b.accountId + ':' + b.currency, b.balance]))),
      error: () => this.error.set('Unable to refresh cash balances.'),
    });
  }

  balance(account: Account): number | undefined {
    return this.balances()[account.accountId + ':' + account.baseCurrency];
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.accounts().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: accounts => {
        this.accounts.set(accounts);
        const active = accounts.filter(a => a.status === 'ACTIVE');
        if (!active.some(a => a.accountId === this.transferFromId)) this.transferFromId = active[0]?.accountId ?? '';
        if (!active.some(a => a.accountId === this.transferToId) || this.transferToId === this.transferFromId)
          this.transferToId = active.find(a => a.accountId !== this.transferFromId)?.accountId ?? '';
        this.transferPreview.set(null);
        this.loadBalances();
      },
      error: () => this.error.set('Unable to load accounts.'),
    });
  }

  activeAccounts(): Account[] { return this.accounts().filter(a => a.status === 'ACTIVE'); }
  transferFrom(): Account | undefined { return this.accounts().find(a => a.accountId === this.transferFromId); }
  transferTo(): Account | undefined { return this.accounts().find(a => a.accountId === this.transferToId); }
  resetTransferReview(): void { this.transferPreview.set(null); }

  reviewTransfer(): void {
    const from = this.transferFrom(), to = this.transferTo();
    if (this.busy() || this.reviewingTransfer() || !from || !to || from.accountId === to.accountId ||
        !this.validAmount(this.transferAmount)) {
      this.error.set('Choose two different active accounts and a positive amount with at most two decimal places.');
      return;
    }
    const available = this.balance(from);
    if (available === undefined) {
      this.error.set('Cash balances are still loading. Please try again.');
      return;
    }
    if (available < this.transferAmount!) {
      this.error.set('Insufficient available cash in ' + from.baseCurrency + '.');
      return;
    }
    this.error.set('');
    this.message.set('');
    this.reviewingTransfer.set(true);
    const amount = this.transferAmount!;
    this.api.fxRate(from.baseCurrency, to.baseCurrency)
      .pipe(finalize(() => this.reviewingTransfer.set(false))).subscribe({
        next: fx => {
          if (fx.rate <= 0 || !Number.isFinite(fx.rate)) {
            this.error.set('No valid exchange rate is available.');
            return;
          }
          this.transferPreview.set({
            rate: fx.rate, source: fx.source,
            fromCurrency: from.baseCurrency, toCurrency: to.baseCurrency,
            amount, transferId: crypto.randomUUID(),
          });
        },
        error: e => this.error.set(e.error?.message ?? 'Unable to retrieve an FX rate for these accounts.'),
      });
  }

  confirmTransfer(): void {
    const preview = this.transferPreview();
    const from = this.transferFrom(), to = this.transferTo();
    if (this.busy() || !preview || !from || !to || from.accountId === to.accountId ||
        preview.amount !== this.transferAmount || preview.fromCurrency !== from.baseCurrency ||
        preview.toCurrency !== to.baseCurrency) return;
    this.busy.set(true);
    this.error.set('');
    this.api.transferCash({
      transferId: preview.transferId, fromAccountId: from.accountId,
      toAccountId: to.accountId, amount: preview.amount,
    }).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: result => {
        this.transferPreview.set(null);
        this.transferAmount = null;
        this.message.set('Transferred ' + result.debitedAmount.toFixed(2) + ' ' + result.fromCurrency +
          ' from ' + from.accountName + ' to ' + to.accountName +
          ' (' + result.creditedAmount.toFixed(2) + ' ' + result.toCurrency + ').');
        this.loadBalances();
      },
      error: e => {
        this.error.set(e.error?.message ??
          'Transfer could not be confirmed. Check balances before retrying; the same transfer ID will be reused.');
        this.loadBalances();
      },
    });
  }

  openAccount(): void {
    const name = this.accountName.trim();
    if (this.busy() || !name || name.length > 100) return;
    const amount = this.initialDeposit;
    if (amount !== 0 && !this.validAmount(amount)) {
      this.error.set('Initial deposit must be a positive amount with at most two decimal places, or zero.');
      return;
    }
    const currency = this.baseCurrency;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    this.api.createAccount({ accountName: name, accountType: this.accountType, baseCurrency: currency }).subscribe({
        next: account => {
          this.accounts.update(accounts => [...accounts, account]);
          this.accountName = '';
          this.baseCurrency = 'USD';
          this.initialDeposit = 0;
          if (amount > 0) {
            this.api.deposit({ accountId: account.accountId, currency, amount }).subscribe({
              next: () => {
                this.busy.set(false);
                this.message.set('Account ' + account.accountNumber + ' opened and funded with ' + amount.toFixed(2) + ' ' + currency + '.');
                this.loadBalances();
              },
              error: () => {
                this.busy.set(false);
                this.error.set('Account ' + account.accountNumber + ' was created, but its initial deposit could not be confirmed. Check the balance before retrying the deposit.');
                this.loadBalances();
              },
            });
          } else {
            this.busy.set(false);
            this.message.set('Account ' + account.accountNumber + ' opened successfully.');
            this.loadBalances();
          }
        },
        error: e => {
          this.busy.set(false);
          this.error.set(e.error?.message ?? 'Account creation could not be confirmed. Refresh accounts before retrying.');
        },
      });
  }

  startDeposit(account: Account): void {
    if (this.busy() || account.status !== 'ACTIVE') return;
    this.depositAccountId = account.accountId;
    this.depositAmount = null;
    this.editingId = null;
    this.closingId = null;
    this.error.set('');
    this.message.set('');
  }

  addFunds(account: Account): void {
    if (this.busy() || this.depositAccountId !== account.accountId || account.status !== 'ACTIVE') return;
    if (!this.validAmount(this.depositAmount)) {
      this.error.set('Enter a positive deposit amount with at most two decimal places.');
      return;
    }
    const amount = this.depositAmount!;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    this.api.deposit({ accountId: account.accountId, currency: account.baseCurrency, amount })
      .pipe(finalize(() => this.busy.set(false))).subscribe({
        next: () => {
          this.depositAccountId = null;
          this.depositAmount = null;
          this.message.set('Deposit of ' + amount.toFixed(2) + ' ' + account.baseCurrency + ' completed for ' + account.accountNumber + '.');
          this.loadBalances();
        },
        error: e => {
          this.error.set(e.error?.message ?? 'Deposit could not be confirmed. Refresh the balance before retrying.');
          this.loadBalances();
        },
      });
  }

  startEdit(account: Account): void {
    this.editingId = account.accountId;
    this.editName = account.accountName;
    this.closingId = null;
    this.depositAccountId = null;
    this.error.set('');
  }

  saveEdit(account: Account): void {
    const name = this.editName.trim();
    if (this.busy() || !name || name.length > 100) return;
    this.busy.set(true);
    this.error.set('');
    this.api.renameAccount(account.accountId, name).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: updated => {
        this.accounts.update(accounts => accounts.map(a => a.accountId === updated.accountId ? updated : a));
        this.editingId = null;
        this.message.set('Account renamed.');
      },
      error: e => this.error.set(e.error?.message ?? 'Unable to rename account.'),
    });
  }

  confirmClose(account: Account): void {
    if (this.busy()) return;
    this.closingId = account.accountId;
    this.editingId = null;
    this.depositAccountId = null;
    this.error.set('');
  }

  closeAccount(account: Account): void {
    if (this.busy() || this.closingId !== account.accountId) return;
    this.busy.set(true);
    this.error.set('');
    this.api.closeAccount(account.accountId).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: updated => {
        this.accounts.update(accounts => accounts.map(a => a.accountId === updated.accountId ? updated : a));
        this.closingId = null;
        this.message.set('Account closed. Its financial history is retained.');
      },
      error: e => this.error.set(e.error?.message ?? 'Unable to close account. Ensure it has no cash, holdings or outstanding orders.'),
    });
  }
}
