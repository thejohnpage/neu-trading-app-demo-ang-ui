import { Component, inject, signal } from '@angular/core';
import { ApiService } from '@shared/api.service';
import { Account } from '@shared/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-accounts',
  standalone: true,
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent {
  private readonly api = inject(ApiService);
  readonly accounts = signal<Account[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly error = signal('');
  readonly message = signal('');

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
    if (this.creating()) return;
    this.creating.set(true);
    this.error.set('');
    this.message.set('');
    this.api.createAccount().pipe(finalize(() => this.creating.set(false))).subscribe({
      next: account => {
        this.accounts.update(accounts => [...accounts, account]);
        this.message.set('Account ' + account.accountNumber + ' opened successfully.');
      },
      error: () => this.error.set('Account creation could not be confirmed. Refresh your accounts before trying again.'),
    });
  }
}
