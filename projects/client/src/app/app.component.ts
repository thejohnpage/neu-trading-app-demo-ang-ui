import { Component,inject,signal } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { ApiService } from '@shared/api.service';
import packageInfo from '../../../../package.json';

@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`
<div class="app-shell"><header><a class="brand" routerLink="/">NEU Trading</a><span>Client</span><nav><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a><a routerLink="/portfolio" routerLinkActive="active">Portfolio</a><a routerLink="/markets" routerLinkActive="active">Markets</a><a routerLink="/trade" routerLinkActive="active">Trade</a><a routerLink="/orders" routerLinkActive="active">Orders</a></nav></header><main><router-outlet/></main><footer>© {{year}} NEU Trading · Client UI v{{uiVersion}} · API v{{apiVersion()}}</footer></div>`})
export class AppComponent{
 private api=inject(ApiService);readonly year=new Date().getFullYear();readonly uiVersion=packageInfo.version;readonly apiVersion=signal('…');
 constructor(){this.api.version().subscribe({next:v=>this.apiVersion.set(v.version),error:()=>this.apiVersion.set('unavailable')});}
}
