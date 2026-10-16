import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/api.service';
import { Account } from '@shared/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [FormsModule],
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
  editingId: string | null = null;
  editName = '';
  closingId: string | null = null;

  constructor() { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.accounts().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: accounts => this.accounts.set(accounts),
      error: () => this.error.set('Unable to load accounts.'),
    });
  }

  openAccount(): void {
    const name = this.accountName.trim();
    if (this.busy() || !name || name.length > 100) return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    this.api.createAccount({ accountName: name, accountType: this.accountType, baseCurrency: this.baseCurrency })
      .pipe(finalize(() => this.busy.set(false))).subscribe({
        next: account => {
          this.accounts.update(accounts => [...accounts, account]);
          this.accountName = '';
          this.baseCurrency = 'USD';
          this.message.set('Account ' + account.accountNumber + ' opened successfully.');
        },
        error: e => this.error.set(e.error?.message ?? 'Account creation could not be confirmed. Refresh accounts before retrying.'),
      });
  }

  startEdit(account: Account): void {
    this.editingId = account.accountId;
    this.editName = account.accountName;
    this.closingId = null;
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
