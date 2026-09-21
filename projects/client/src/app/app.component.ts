import { Component } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';

@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`
<header><a class="brand" routerLink="/">NEU Trading</a><span>Client</span><nav><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a><a routerLink="/portfolio" routerLinkActive="active">Portfolio</a><a routerLink="/markets" routerLinkActive="active">Markets</a><a routerLink="/trade" routerLinkActive="active">Trade</a><a routerLink="/orders" routerLinkActive="active">Orders</a></nav></header><main><router-outlet/></main>`})
export class AppComponent{}
