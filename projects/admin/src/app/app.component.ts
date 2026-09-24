import { Component,inject,signal } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { ApiService } from '@shared/api.service';import { SessionTimeoutComponent } from '@shared/session-timeout.component';import { SessionHeaderComponent } from '@shared/session-header.component';import { RbacService } from '@shared/rbac.service';import packageInfo from '../../../../package.json';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,SessionTimeoutComponent,SessionHeaderComponent],template:`
<div class="admin-shell">
 <aside class="sidebar"><div class="admin-brand"><strong>NEU Trading</strong><span>Operations Console</span></div><nav>
 <p>Workspace</p><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Overview</a>
 @if(rbac.has('ORDER_OPERATIONS')){<a routerLink="/orders" routerLinkActive="active">Orders</a>}
 @if(rbac.has('REPORTING')){<p>Reporting</p><a routerLink="/activity" routerLinkActive="active">Activity</a><a routerLink="/instruments" routerLinkActive="active">Instruments</a><a routerLink="/segments" routerLinkActive="active">Segments</a><a routerLink="/volume" routerLinkActive="active">Volume</a>}
 @if(rbac.has('AUDIT_VIEW')||rbac.has('CLIENT_MANAGEMENT')||rbac.has('USER_MANAGEMENT')||rbac.has('ROLE_MANAGEMENT')){<p>Governance</p>}
 @if(rbac.has('AUDIT_VIEW')){<a routerLink="/audit" routerLinkActive="active">Audit Trail</a>} @if(rbac.has('CLIENT_MANAGEMENT')){<a routerLink="/clients" routerLinkActive="active">Clients</a>}
 @if(rbac.has('USER_MANAGEMENT')){<a routerLink="/users" routerLinkActive="active">Users</a>}
 @if(rbac.has('ROLE_MANAGEMENT')){<a routerLink="/roles" routerLinkActive="active">Roles & Capabilities</a>}
 </nav></aside>
 <div class="admin-workspace"><header class="admin-topbar"><div><strong>Administration</strong><span>Secure operations & reporting</span></div><app-session-header/></header><main><router-outlet/></main><footer>© {{year}} NEU Trading · Admin UI v{{uiVersion}} · API v{{apiVersion()}}</footer></div>
 <app-session-timeout/>
</div>`})
export class AppComponent{private api=inject(ApiService);readonly rbac=inject(RbacService);readonly year=new Date().getFullYear();readonly uiVersion=packageInfo.version;readonly apiVersion=signal('…');constructor(){this.api.version().subscribe({next:v=>this.apiVersion.set(v.version),error:()=>this.apiVersion.set('unavailable')});}}
