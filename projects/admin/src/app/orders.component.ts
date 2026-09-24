import { Component,inject,signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { Order,OrderEvent } from '@shared/models';

@Component({selector:'app-admin-orders',standalone:true,imports:[JsonPipe,DatePipe],template:`
<h1>Order inspection</h1><div class="split">
<table><thead><tr><th>Order</th><th>Side</th><th>Qty</th><th>Status</th><th>Submitted</th></tr></thead><tbody>@for(o of orders();track o.orderId){<tr (click)="select(o)" [class.selected]="selected()?.orderId===o.orderId"><td title="{{o.orderId}}">{{shortId(o.orderId)}}</td><td>{{o.side}}</td><td>{{o.quantity}}</td><td>{{o.status}}</td><td>{{o.submittedAt|date:'medium'}}</td></tr>}</tbody></table>
@if(selected();as o){<section><div class="panel"><h2>Lifecycle — {{shortId(o.orderId)}}</h2><p class="muted">Technical ID: {{o.orderId}}</p><ol>@for(e of events();track e.eventId){<li><strong>{{e.eventType}}</strong><small>{{e.eventTime|date:'medium'}}</small></li>}</ol></div><div class="panel"><h2>Pricing decision</h2><pre>{{pricing()|json}}</pre></div></section>}
</div>`})
export class OrdersComponent{
 private api=inject(ApiService);orders=signal<Order[]>([]);selected=signal<Order|null>(null);events=signal<OrderEvent[]>([]);pricing=signal<Record<string,unknown>|null>(null);
 constructor(){this.api.adminOrders().subscribe(x=>{this.orders.set(x);if(x[0])this.select(x[0]);});}
 shortId(id:string){return `ORD-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}
 select(o:Order){this.selected.set(o);this.api.adminOrderEvents(o.orderId).subscribe(x=>this.events.set(x));this.api.pricing(o.orderId).subscribe({next:x=>this.pricing.set(x),error:()=>this.pricing.set(null)});}
}
