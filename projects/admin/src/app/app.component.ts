import { Component,inject,signal } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { ApiService } from '@shared/api.service';
import { SessionTimeoutComponent } from '@shared/session-timeout.component';
import { SessionHeaderComponent } from '@shared/session-header.component';
import { RbacService } from '@shared/rbac.service';
import packageInfo from '../../../../package.json';

@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,SessionTimeoutComponent,SessionHeaderComponent],template:`
<div class="app-shell"><header><strong>NEU Trading</strong><span>Admin & Reporting</span><nav>
<a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Overview</a>
@if(rbac.has('ORDER_OPERATIONS')){<a routerLink="/orders" routerLinkActive="active">Orders</a>}
@if(rbac.has('REPORTING')){<a routerLink="/activity" routerLinkActive="active">Activity</a><a routerLink="/instruments" routerLinkActive="active">Instruments</a><a routerLink="/segments" routerLinkActive="active">Segments</a><a routerLink="/volume" routerLinkActive="active">Volume</a>}
@if(rbac.has('AUDIT')){<a routerLink="/audit" routerLinkActive="active">Audit</a>}
@if(rbac.has('USER_MANAGEMENT')){<a routerLink="/users" routerLinkActive="active">Users</a>}
</nav><app-session-header/></header><main><router-outlet/></main><footer>© {{year}} NEU Trading · Admin UI v{{uiVersion}} · API v{{apiVersion()}}</footer><app-session-timeout/></div>`})
export class AppComponent{
 private api=inject(ApiService);readonly rbac=inject(RbacService);readonly year=new Date().getFullYear();readonly uiVersion=packageInfo.version;readonly apiVersion=signal('…');
 constructor(){this.api.version().subscribe({next:v=>this.apiVersion.set(v.version),error:()=>this.apiVersion.set('unavailable')});}
}
