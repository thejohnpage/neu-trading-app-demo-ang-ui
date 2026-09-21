import { Component,inject,signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@shared/api.service';
import { CashBalance,Order,Position } from '@shared/models';

@Component({selector:'app-home',standalone:true,imports:[DecimalPipe,RouterLink],template:`
<section class="page-heading"><div><p class="eyebrow">Welcome back</p><h1>Accounts overview</h1><p class="muted">A quick view of your trading account.</p></div><a class="action-link" routerLink="/portfolio">View portfolio</a></section>
<section class="summary-strip">
 <article><small>Cash balances</small><strong>{{cash().length}}</strong><span>Available currencies</span></article>
 <article><small>Open positions</small><strong>{{positions().length}}</strong><span>Current holdings</span></article>
 <article><small>Recent orders</small><strong>{{orders().length}}</strong><span>Order history</span></article>
</section>
<section class="home-grid">
 <article class="panel"><h2>Cash at a glance</h2>@for(c of cash();track c.accountId+c.currency){<div class="account-line"><span>{{c.currency}}</span><strong>{{c.balance|number:'1.2-2'}}</strong></div>}<a routerLink="/portfolio">Manage cash and portfolio →</a></article>
 <article class="panel"><h2>Quick actions</h2><div class="quick-actions"><a routerLink="/trade">Place a trade</a><a routerLink="/markets">Explore markets</a><a routerLink="/orders">Review orders</a></div></article>
</section>`})
export class HomeComponent{private api=inject(ApiService);cash=signal<CashBalance[]>([]);positions=signal<Position[]>([]);orders=signal<Order[]>([]);constructor(){this.api.cash().subscribe(x=>this.cash.set(x));this.api.positions().subscribe(x=>this.positions.set(x));this.api.orders().subscribe(x=>this.orders.set(x));}}
