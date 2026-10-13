import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/api.service';
import { OrderStatusStreamService,OrderStatusUpdate } from '@shared/order-status-stream.service';
import { SimpleChartComponent,ChartDatum } from '@shared/simple-chart/simple-chart.component';
import { Account,CashBalance,CashTransaction,Order,Position } from '@shared/models';

@Component({selector:'app-dashboard',standalone:true,imports:[DecimalPipe,DatePipe,FormsModule,SimpleChartComponent],styleUrl: './dashboard.component.scss', templateUrl: './dashboard.component.html'})
export class DashboardComponent {
 private api=inject(ApiService);private orderStatus=inject(OrderStatusStreamService);liveStatus=signal<OrderStatusUpdate|null>(null);accounts=signal<Account[]>([]);cash=signal<CashBalance[]>([]);transactions=signal<CashTransaction[]>([]);positions=signal<Position[]>([]);orders=signal<Order[]>([]);
 allocation=signal<ChartDatum[]>([]);profitLoss=signal<ChartDatum[]>([]);busy=signal(false);error=signal('');message=signal('');rate=signal<number|null>(null);rateSource=signal('');accountId='';currency='USD';amount=1000;fromCurrency='USD';toCurrency='GBP';convertAmount=100;
 constructor(){this.orderStatus.stream().subscribe({next:s=>{this.liveStatus.set(s);this.api.orders().subscribe(x=>this.orders.set(x));this.api.positions().subscribe(x=>this.setPositions(x));this.refresh();this.loadTransactions();},error:()=>{}});this.api.accounts().subscribe(x=>{this.accounts.set(x);this.accountId=x[0]?.accountId??'';this.loadTransactions();});this.refresh();this.api.positions().subscribe(x=>this.setPositions(x));this.api.orders().subscribe(x=>this.orders.set(x));}
 private setPositions(x:Position[]){this.positions.set(x);this.allocation.set(x.filter(p=>p.marketValue>0).map(p=>({label:p.symbol,value:p.marketValue})));this.profitLoss.set(x.map(p=>({label:p.symbol,value:p.unrealizedGainLoss})));}
 refresh(){this.api.cash().subscribe(x=>this.cash.set(x));}loadTransactions(){if(this.accountId)this.api.cashTransactions(this.accountId).subscribe(x=>this.transactions.set(x));}
 deposit(){this.move('deposit');}withdraw(){this.move('withdraw');}
 private move(kind:'deposit'|'withdraw'){this.start();const call=kind==='deposit'?this.api.deposit({accountId:this.accountId,currency:this.currency,amount:this.amount}):this.api.withdraw({accountId:this.accountId,currency:this.currency,amount:this.amount});call.subscribe({next:()=>this.finish(kind==='deposit'?'Deposit completed':'Withdrawal completed'),error:e=>this.fail(e)});}
 getRate(){this.start();this.api.fxRate(this.fromCurrency,this.toCurrency).subscribe({next:r=>{this.rate.set(r.rate);this.rateSource.set(r.source);this.busy.set(false);},error:e=>this.fail(e)});}
 convert(){this.start();this.api.convertCash({accountId:this.accountId,fromCurrency:this.fromCurrency,toCurrency:this.toCurrency,amount:this.convertAmount}).subscribe({next:r=>{this.rate.set(r.rate);this.rateSource.set(r.source);this.finish(`Converted ${r.debitedAmount} ${r.fromCurrency} to ${r.creditedAmount} ${r.toCurrency}`);},error:e=>this.fail(e)});}
 shortId(id:string,prefix:string){return `${prefix}-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}private start(){this.error.set('');this.message.set('');this.busy.set(true);}private finish(message:string){this.message.set(message);this.busy.set(false);this.refresh();this.loadTransactions();}private fail(e:any){this.error.set(e.error?.message??'Cash operation failed');this.busy.set(false);}
}
