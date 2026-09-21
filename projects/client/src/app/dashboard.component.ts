import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/api.service';
import { Account,CashBalance,CashTransaction,Order,Position } from '@shared/models';

@Component({selector:'app-dashboard',standalone:true,imports:[DecimalPipe,DatePipe,FormsModule],template:`
<section class="page-heading"><div><p class="eyebrow">Brokerage account</p><h1>Portfolio</h1><p class="muted">Holdings, cash and recent account activity.</p></div><select class="account-picker" [(ngModel)]="accountId" (ngModelChange)="loadTransactions()">@for(a of accounts();track a.accountId){<option [value]="a.accountId">{{a.accountNumber}}</option>}</select></section>
<section class="portfolio-summary"><article><small>Cash currencies</small><strong>{{cash().length}}</strong></article><article><small>Positions</small><strong>{{positions().length}}</strong></article><article><small>Orders</small><strong>{{orders().length}}</strong></article></section>

<section class="portfolio-section"><div class="section-title"><div><h2>Positions</h2><p class="muted">Securities currently held in this account.</p></div></div>
<table class="portfolio-table"><thead><tr><th>Symbol</th><th>Asset type</th><th class="numeric">Quantity</th><th class="numeric">Price</th><th class="numeric">Market value</th><th class="numeric">Cost basis</th><th class="numeric">Gain / loss</th></tr></thead><tbody>@for(p of positions();track p.instrumentId){<tr><td><strong>{{p.symbol}}</strong><small class="cell-sub">{{p.currency}}</small></td><td>{{p.instrumentType}}</td><td class="numeric">{{p.quantity|number:'1.0-8'}}</td><td class="numeric">{{p.currentPrice|number:'1.2-4'}}</td><td class="numeric">{{p.marketValue|number:'1.2-2'}}</td><td class="numeric">{{p.costBasis|number:'1.2-2'}}</td><td class="numeric" [class.positive]="p.unrealizedGainLoss>0" [class.negative]="p.unrealizedGainLoss<0">{{p.unrealizedGainLoss|number:'1.2-2'}}<small class="cell-sub">{{p.unrealizedGainLossPercent|number:'1.2-2'}}%</small></td></tr>}@empty{<tr><td colspan="7" class="empty">No positions currently held.</td></tr>}</tbody></table></section>

<section class="portfolio-section"><div class="section-title"><div><h2>Cash balances</h2><p class="muted">Available buying power by currency.</p></div></div>
<table class="portfolio-table"><thead><tr><th>Currency</th><th class="numeric">Available cash</th><th>Last updated</th></tr></thead><tbody>@for(c of cash();track c.accountId+c.currency){<tr><td><strong>{{c.currency}}</strong></td><td class="numeric">{{c.balance|number:'1.2-2'}}</td><td>{{c.updatedAt|date:'medium'}}</td></tr>}</tbody></table>

<details class="money-tools"><summary>Manage cash & currency</summary><div class="trade-grid">
<section class="panel"><h3>Deposit / withdraw</h3><label>Currency</label><input [(ngModel)]="currency" maxlength="10"><label>Amount</label><input type="number" min="0.01" step="any" [(ngModel)]="amount"><div class="side"><button class="primary" (click)="deposit()" [disabled]="busy()">Deposit</button><button (click)="withdraw()" [disabled]="busy()">Withdraw</button></div></section>
<section class="panel"><h3>Convert currency</h3><label>From</label><input [(ngModel)]="fromCurrency" maxlength="10"><label>To</label><input [(ngModel)]="toCurrency" maxlength="10"><label>Amount</label><input type="number" min="0.01" step="any" [(ngModel)]="convertAmount"><button (click)="getRate()" [disabled]="busy()">Get rate</button>@if(rate()){<p>1 {{fromCurrency.toUpperCase()}} = <strong>{{rate()|number:'1.4-8'}}</strong> {{toCurrency.toUpperCase()}} <small>({{rateSource()}})</small></p>}<button class="primary" (click)="convert()" [disabled]="busy()">Convert</button></section>
</div></details>
@if(message()){<p class="success-message">{{message()}}</p>}@if(error()){<section class="panel error"><p>{{error()}}</p></section>}
</section>

<section class="portfolio-section"><div class="section-title"><div><h2>Recent orders</h2><p class="muted">Latest trading instructions and their status.</p></div></div>
<table class="portfolio-table"><thead><tr><th>Order</th><th>Side</th><th class="numeric">Quantity</th><th>Status</th><th>Submitted</th></tr></thead><tbody>@for(o of orders();track o.orderId){<tr><td>{{shortId(o.orderId,'ORD')}}</td><td>{{o.side}}</td><td class="numeric">{{o.quantity|number:'1.0-8'}}</td><td><span class="status-pill">{{o.status}}</span></td><td>{{o.submittedAt|date:'medium'}}</td></tr>}</tbody></table></section>

<section class="portfolio-section"><div class="section-title"><div><h2>Cash activity</h2><p class="muted">Deposits, withdrawals, currency conversions and trade cash movements.</p></div></div>
<table class="portfolio-table"><thead><tr><th>Date</th><th>Activity</th><th>Currency</th><th class="numeric">Amount</th></tr></thead><tbody>@for(t of transactions();track t.transactionId){<tr><td>{{t.createdAt|date:'medium'}}</td><td>{{t.type}}</td><td>{{t.currency}}</td><td class="numeric">{{t.amount|number:'1.2-8'}}</td></tr>}</tbody></table></section>`})
export class DashboardComponent {
 private api=inject(ApiService);accounts=signal<Account[]>([]);cash=signal<CashBalance[]>([]);transactions=signal<CashTransaction[]>([]);positions=signal<Position[]>([]);orders=signal<Order[]>([]);
 busy=signal(false);error=signal('');message=signal('');rate=signal<number|null>(null);rateSource=signal('');accountId='';currency='USD';amount=1000;fromCurrency='USD';toCurrency='GBP';convertAmount=100;
 constructor(){this.api.accounts().subscribe(x=>{this.accounts.set(x);this.accountId=x[0]?.accountId??'';this.loadTransactions();});this.refresh();this.api.positions().subscribe(x=>this.positions.set(x));this.api.orders().subscribe(x=>this.orders.set(x));}
 refresh(){this.api.cash().subscribe(x=>this.cash.set(x));}loadTransactions(){if(this.accountId)this.api.cashTransactions(this.accountId).subscribe(x=>this.transactions.set(x));}
 deposit(){this.move('deposit');}withdraw(){this.move('withdraw');}
 private move(kind:'deposit'|'withdraw'){this.start();const call=kind==='deposit'?this.api.deposit({accountId:this.accountId,currency:this.currency,amount:this.amount}):this.api.withdraw({accountId:this.accountId,currency:this.currency,amount:this.amount});call.subscribe({next:()=>this.finish(kind==='deposit'?'Deposit completed':'Withdrawal completed'),error:e=>this.fail(e)});}
 getRate(){this.start();this.api.fxRate(this.fromCurrency,this.toCurrency).subscribe({next:r=>{this.rate.set(r.rate);this.rateSource.set(r.source);this.busy.set(false);},error:e=>this.fail(e)});}
 convert(){this.start();this.api.convertCash({accountId:this.accountId,fromCurrency:this.fromCurrency,toCurrency:this.toCurrency,amount:this.convertAmount}).subscribe({next:r=>{this.rate.set(r.rate);this.rateSource.set(r.source);this.finish(`Converted ${r.debitedAmount} ${r.fromCurrency} to ${r.creditedAmount} ${r.toCurrency}`);},error:e=>this.fail(e)});}
 shortId(id:string,prefix:string){return `${prefix}-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}private start(){this.error.set('');this.message.set('');this.busy.set(true);}private finish(message:string){this.message.set(message);this.busy.set(false);this.refresh();this.loadTransactions();}private fail(e:any){this.error.set(e.error?.message??'Cash operation failed');this.busy.set(false);}
}
