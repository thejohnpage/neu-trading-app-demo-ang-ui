import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard.component';
import { MarketsComponent } from './markets.component';
import { TradeComponent } from './trade.component';
import { OrdersComponent } from './orders.component';

export const routes:Routes=[
 {path:'',component:HomeComponent},
 {path:'portfolio',component:DashboardComponent},
 {path:'markets',component:MarketsComponent},
 {path:'trade',component:TradeComponent},
 {path:'orders',component:OrdersComponent},
 {path:'**',redirectTo:''}
];
