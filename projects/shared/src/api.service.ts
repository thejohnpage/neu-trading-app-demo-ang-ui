import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Account,CashBalance,CashConversion,CashTransaction,ClientSegmentReport,FxRate,Instrument,InstrumentReport,Order,OrderEvent,Position,Quote,ReportSummary,TradeActivity,VolumeReport } from './models';
export interface ApiVersion { application:string; version:string; timestamp:string; }
@Injectable({providedIn:'root'})
export class ApiService {
 private readonly http=inject(HttpClient); private readonly base='http://localhost:8081/api/v1';
 version(){return this.http.get<ApiVersion>(`${this.base}/version`);}
 instruments(){return this.http.get<Instrument[]>(`${this.base}/instruments`);} quote(symbol:string){return this.http.get<Quote>(`${this.base}/instruments/${encodeURIComponent(symbol)}/quote`);}
 accounts(){return this.http.get<Account[]>(`${this.base}/me/accounts`);} cash(){return this.http.get<CashBalance[]>(`${this.base}/me/cash`);} positions(){return this.http.get<Position[]>(`${this.base}/me/positions`);}
 deposit(body:{accountId:string;currency:string;amount:number}){return this.http.post<CashBalance>(`${this.base}/me/cash/deposits`,body);}
 withdraw(body:{accountId:string;currency:string;amount:number}){return this.http.post<CashBalance>(`${this.base}/me/cash/withdrawals`,body);}
 fxRate(from:string,to:string){return this.http.get<FxRate>(`${this.base}/me/cash/rates`,{params:{from,to}});}
 convertCash(body:{accountId:string;fromCurrency:string;toCurrency:string;amount:number}){return this.http.post<CashConversion>(`${this.base}/me/cash/conversions`,body);}
 cashTransactions(accountId:string){return this.http.get<CashTransaction[]>(`${this.base}/me/cash/transactions`,{params:{accountId}});}
 orders(){return this.http.get<Order[]>(`${this.base}/orders`);} orderEvents(id:string){return this.http.get<OrderEvent[]>(`${this.base}/orders/${id}/events`);}
 submitOrder(body:{accountId:string;symbol:string;side:'BUY'|'SELL';quantity:number}){return this.http.post<Order>(`${this.base}/orders`,body);}
 adminOrders(){return this.http.get<Order[]>(`${this.base}/admin/orders`);} adminOrderEvents(id:string){return this.http.get<OrderEvent[]>(`${this.base}/admin/orders/${id}/events`);} pricing(id:string){return this.http.get<Record<string,unknown>>(`${this.base}/admin/orders/${id}/pricing`);}
 reportSummary(){return this.http.get<ReportSummary>(`${this.base}/admin/reports/summary`);} reportActivity(){return this.http.get<TradeActivity[]>(`${this.base}/admin/reports/activity`);} reportInstruments(){return this.http.get<InstrumentReport[]>(`${this.base}/admin/reports/instruments`);} reportSegments(){return this.http.get<ClientSegmentReport[]>(`${this.base}/admin/reports/client-segments`);} reportVolume(){return this.http.get<VolumeReport[]>(`${this.base}/admin/reports/volume`);}
}
