import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Account,CashBalance,ClientSegmentReport,Instrument,InstrumentReport,Order,OrderEvent,Position,Quote,ReportSummary,TradeActivity,VolumeReport } from './models';
@Injectable({providedIn:'root'})
export class ApiService {
 private readonly http=inject(HttpClient); private readonly base='http://localhost:8081/api/v1';
 instruments(){return this.http.get<Instrument[]>(`${this.base}/instruments`);} quote(symbol:string){return this.http.get<Quote>(`${this.base}/instruments/${encodeURIComponent(symbol)}/quote`);}
 accounts(){return this.http.get<Account[]>(`${this.base}/me/accounts`);} cash(){return this.http.get<CashBalance[]>(`${this.base}/me/cash`);} positions(){return this.http.get<Position[]>(`${this.base}/me/positions`);}
 orders(){return this.http.get<Order[]>(`${this.base}/orders`);} orderEvents(id:string){return this.http.get<OrderEvent[]>(`${this.base}/orders/${id}/events`);}
 submitOrder(body:{accountId:string;symbol:string;side:'BUY'|'SELL';quantity:number}){return this.http.post<Order>(`${this.base}/orders`,body);}
 adminOrders(){return this.http.get<Order[]>(`${this.base}/admin/orders`);} adminOrderEvents(id:string){return this.http.get<OrderEvent[]>(`${this.base}/admin/orders/${id}/events`);} pricing(id:string){return this.http.get<Record<string,unknown>>(`${this.base}/admin/orders/${id}/pricing`);}
 reportSummary(){return this.http.get<ReportSummary>(`${this.base}/admin/reports/summary`);} reportActivity(){return this.http.get<TradeActivity[]>(`${this.base}/admin/reports/activity`);} reportInstruments(){return this.http.get<InstrumentReport[]>(`${this.base}/admin/reports/instruments`);} reportSegments(){return this.http.get<ClientSegmentReport[]>(`${this.base}/admin/reports/client-segments`);} reportVolume(){return this.http.get<VolumeReport[]>(`${this.base}/admin/reports/volume`);}
}
