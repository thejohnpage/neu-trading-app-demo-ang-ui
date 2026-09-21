import { Component,inject,signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { TradeActivity } from '@shared/models';

@Component({selector:'app-activity',standalone:true,imports:[DecimalPipe,DatePipe],template:`
<h1>Trading activity</h1><p class="muted">Warehouse-backed completed trade activity.</p>
<table><thead><tr><th>Filled</th><th>Order</th><th>Account</th><th>Segment</th><th>Symbol</th><th>Side</th><th>Qty</th><th>Price</th><th>Notional</th></tr></thead>
<tbody>@for(r of rows();track r.order_id){<tr><td>{{r.filled_at|date:'medium'}}</td><td title="{{r.order_id}}">{{shortId(r.order_id)}}</td><td>{{r.account_number}}</td><td>{{r.client_segment}}</td><td>{{r.symbol}}</td><td>{{r.side}}</td><td>{{r.quantity|number:'1.0-8'}}</td><td>{{r.execution_price|number:'1.2-8'}}</td><td>{{r.notional|number:'1.2-8'}} {{r.currency}}</td></tr>}</tbody></table>`})
export class ActivityComponent{private api=inject(ApiService);rows=signal<TradeActivity[]>([]);constructor(){this.api.reportActivity().subscribe(x=>this.rows.set(x));}shortId(id:string){return `ORD-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}}
