import { Component,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { Account,CashBalance,Instrument,Order,Quote } from '@shared/models';

@Component({selector:'app-trade',standalone:true,imports:[FormsModule,DecimalPipe],styleUrl: './trade.component.scss', templateUrl: './trade.component.html'})
export class TradeComponent{
 private api=inject(ApiService);private route=inject(ActivatedRoute);accounts=signal<Account[]>([]);instruments=signal<Instrument[]>([]);cash=signal<CashBalance[]>([]);quote=signal<Quote|null>(null);result=signal<Order|null>(null);error=signal('');busy=signal(false);
 accountId='';symbol='AAPL';side:'BUY'|'SELL'='BUY';quantity=1;
 constructor(){const requested=this.route.snapshot.queryParamMap.get('symbol');if(requested)this.symbol=requested;this.api.accounts().subscribe(x=>{this.accounts.set(x);this.accountId=x[0]?.accountId??'';});this.api.cash().subscribe(x=>this.cash.set(x));this.api.instruments().subscribe(x=>{this.instruments.set(x);this.loadQuote();});}
 loadQuote(){if(this.symbol)this.api.quote(this.symbol).subscribe(x=>this.quote.set(x));} availableCash(currency:string){return this.cash().find(c=>c.accountId===this.accountId&&c.currency===currency)?.balance??0;} shortId(id:string){return `ORD-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}
 submit(){this.error.set('');this.result.set(null);this.busy.set(true);this.api.submitOrder({accountId:this.accountId,symbol:this.symbol,side:this.side,quantity:this.quantity}).subscribe({next:o=>{this.result.set(o);this.busy.set(false);},error:e=>{this.error.set(e.error?.message??'Unable to submit order');this.busy.set(false);}});}
}
