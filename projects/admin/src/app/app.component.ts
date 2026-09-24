import { Component,inject,signal } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { ApiService } from '@shared/api.service';
import { SessionTimeoutComponent } from '@shared/session-timeout.component';
import { SessionHeaderComponent } from '@shared/session-header.component';
import packageInfo from '../../../../package.json';

@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,SessionTimeoutComponent,SessionHeaderComponent],template:`
<div class="app-shell"><header><strong>NEU Trading</strong><span>Admin & Reporting</span><nav><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Overview</a><a routerLink="/orders" routerLinkActive="active">Orders</a><a routerLink="/activity" routerLinkActive="active">Activity</a><a routerLink="/instruments" routerLinkActive="active">Instruments</a><a routerLink="/segments" routerLinkActive="active">Segments</a><a routerLink="/volume" routerLinkActive="active">Volume</a><a routerLink="/audit" routerLinkActive="active">Audit</a><a routerLink="/users" routerLinkActive="active">Users</a></nav><app-session-header/></header><main><router-outlet/></main><footer>© {{year}} NEU Trading · Admin UI v{{uiVersion}} · API v{{apiVersion()}}</footer><app-session-timeout/></div>`})
export class AppComponent{
 private api=inject(ApiService);readonly year=new Date().getFullYear();readonly uiVersion=packageInfo.version;readonly apiVersion=signal('…');
 constructor(){this.api.version().subscribe({next:v=>this.apiVersion.set(v.version),error:()=>this.apiVersion.set('unavailable')});}
}
