import { Component,inject,signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@shared/api.service';
import { CashBalance,Order,Position } from '@shared/models';

@Component({selector:'app-home',standalone:true,imports:[DecimalPipe,RouterLink],styleUrl: './home.component.scss', templateUrl: './home.component.html'})
export class HomeComponent{private api=inject(ApiService);cash=signal<CashBalance[]>([]);positions=signal<Position[]>([]);orders=signal<Order[]>([]);constructor(){this.api.cash().subscribe(x=>this.cash.set(x));this.api.positions().subscribe(x=>this.positions.set(x));this.api.orders().subscribe(x=>this.orders.set(x));}}
