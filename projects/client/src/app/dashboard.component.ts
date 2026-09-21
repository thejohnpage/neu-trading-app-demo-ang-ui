import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/api.service';
import { Account,CashBalance,CashTransaction,Order,Position } from '@shared/models';

@Component({
 selector:'app-dashboard',
 standalone:true,
 imports:[DecimalPipe,FormsModule],
 template:`
 <h1>Portfolio</h1>
 <section class="cards">
   <article><small>Cash currencies</small><strong>{{cash().length}}</strong></article>
   <article><small>Positions</small><strong>{{positions().length}}</strong></article>
   <article><small>Orders</small><strong>{{orders().length}}</strong></article>
 </section>

 <h2>Cash wallet</h2>
 <table>
   <thead><tr><th>Currency</th><th>Balance</th><th>Updated</th></tr></thead>
   <tbody>@for(c of cash();track c.accountId+c.currency){<tr><td>{{c.currency}}</td><td>{{c.balance|number:'1.2-8'}}</td><td>{{c.updatedAt}}</td></tr>}</tbody>
 </table>

 <div class="trade-grid">
  <section class="panel">
   <h3>Deposit / withdraw</h3>
   <label>Account</label><select [(ngModel)]="accountId" (ngModelChange)="loadTransactions()">@for(a of accounts();track a.accountId){<option [value]="a.accountId">{{a.accountNumber}}</option>}</select>
   <label>Currency</label><input [(ngModel)]="currency" maxlength="10">
   <label>Amount</label><input type="number" min="0.01" step="any" [(ngModel)]="amount">
   <div class="side"><button class="primary" (click)="deposit()" [disabled]="busy()">Deposit</button><button (click)="withdraw()" [disabled]="busy()">Withdraw</button></div>
  </section>

  <section class="panel">
   <h3>Convert currency</h3>
   <label>From</label><input [(ngModel)]="fromCurrency" maxlength="10">
   <label>To</label><input [(ngModel)]="toCurrency" maxlength="10">
   <label>Amount</label><input type="number" min="0.01" step="any" [(ngModel)]="convertAmount">
   <button (click)="getRate()" [disabled]="busy()">Get rate</button>
   @if(rate()){<p>1 {{fromCurrency.toUpperCase()}} = <strong>{{rate()|number:'1.4-8'}}</strong> {{toCurrency.toUpperCase()}} <small>({{rateSource()}})</small></p>}
   <button class="primary" (click)="convert()" [disabled]="busy()">Convert</button>
  </section>
 </div>
 @if(message()){<p>{{message()}}</p>}
 @if(error()){<section class="panel error"><p>{{error()}}</p></section>}

 <h3>Cash history</h3>
 <table>
  <thead><tr><th>Time</th><th>Type</th><th>Currency</th><th>Amount</th></tr></thead>
  <tbody>@for(t of transactions();track t.transactionId){<tr><td>{{t.createdAt}}</td><td>{{t.type}}</td><td>{{t.currency}}</td><td>{{t.amount|number:'1.2-8'}}</td></tr>}</tbody>
 </table>

 <h2>Positions</h2>
 <table><thead><tr><th>Symbol</th><th>Type</th><th>Quantity</th></tr></thead><tbody>@for(p of positions();track p.instrumentId){<tr><td>{{p.symbol}}</td><td>{{p.instrumentType}}</td><td>{{p.quantity}}</td></tr>}</tbody></table>
 <h2>Recent orders</h2>
 <table><thead><tr><th>Side</th><th>Quantity</th><th>Status</th><th>Submitted</th></tr></thead><tbody>@for(o of orders();track o.orderId){<tr><td>{{o.side}}</td><td>{{o.quantity}}</td><td>{{o.status}}</td><td>{{o.submittedAt}}</td></tr>}</tbody></table>
 `
})
export class DashboardComponent {
 private api=inject(ApiService);
 accounts=signal<Account[]>([]); cash=signal<CashBalance[]>([]); transactions=signal<CashTransaction[]>([]);
 positions=signal<Position[]>([]); orders=signal<Order[]>([]);
 busy=signal(false); error=signal(''); message=signal(''); rate=signal<number|null>(null); rateSource=signal('');
 accountId=''; currency='USD'; amount=1000; fromCurrency='USD'; toCurrency='GBP'; convertAmount=100;

 constructor(){
  this.api.accounts().subscribe(x=>{this.accounts.set(x);this.accountId=x[0]?.accountId??'';this.loadTransactions();});
  this.refresh(); this.api.positions().subscribe(x=>this.positions.set(x)); this.api.orders().subscribe(x=>this.orders.set(x));
 }

 refresh(){this.api.cash().subscribe(x=>this.cash.set(x));}
 loadTransactions(){if(this.accountId)this.api.cashTransactions(this.accountId).subscribe(x=>this.transactions.set(x));}
 deposit(){this.move('deposit');}
 withdraw(){this.move('withdraw');}
 private move(kind:'deposit'|'withdraw'){
  this.start(); const call=kind==='deposit'?this.api.deposit({accountId:this.accountId,currency:this.currency,amount:this.amount}):this.api.withdraw({accountId:this.accountId,currency:this.currency,amount:this.amount});
  call.subscribe({next:()=>{this.finish(kind==='deposit'?'Deposit completed':'Withdrawal completed');},error:e=>this.fail(e)});
 }
 getRate(){
  this.start();this.api.fxRate(this.fromCurrency,this.toCurrency).subscribe({next:r=>{this.rate.set(r.rate);this.rateSource.set(r.source);this.busy.set(false);},error:e=>this.fail(e)});
 }
 convert(){
  this.start();this.api.convertCash({accountId:this.accountId,fromCurrency:this.fromCurrency,toCurrency:this.toCurrency,amount:this.convertAmount})
   .subscribe({next:r=>{this.rate.set(r.rate);this.rateSource.set(r.source);this.finish(`Converted ${r.debitedAmount} ${r.fromCurrency} to ${r.creditedAmount} ${r.toCurrency}`);},error:e=>this.fail(e)});
 }
 private start(){this.error.set('');this.message.set('');this.busy.set(true);}
 private finish(message:string){this.message.set(message);this.busy.set(false);this.refresh();this.loadTransactions();}
 private fail(e:any){this.error.set(e.error?.message??'Cash operation failed');this.busy.set(false);}
}
