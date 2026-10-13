import { Component,inject,signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { Order,OrderEvent } from '@shared/models';

@Component({selector:'app-admin-orders',standalone:true,imports:[JsonPipe,DatePipe],styleUrl: './orders.component.scss', templateUrl: './orders.component.html'})
export class OrdersComponent{
 private api=inject(ApiService);orders=signal<Order[]>([]);selected=signal<Order|null>(null);events=signal<OrderEvent[]>([]);pricing=signal<Record<string,unknown>|null>(null);
 constructor(){this.api.adminOrders().subscribe(x=>{this.orders.set(x);if(x[0])this.select(x[0]);});}
 shortId(id:string){return `ORD-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}
 select(o:Order){this.selected.set(o);this.api.adminOrderEvents(o.orderId).subscribe(x=>this.events.set(x));this.api.pricing(o.orderId).subscribe({next:x=>this.pricing.set(x),error:()=>this.pricing.set(null)});}
}
