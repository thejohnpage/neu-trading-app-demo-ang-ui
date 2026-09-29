import { Component,inject,signal } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { ApiService } from '@shared/api.service';
import { SessionTimeoutComponent } from '@shared/session-timeout.component';
import { SessionHeaderComponent } from '@shared/session-header.component';
import packageInfo from '../../../../package.json';

@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,SessionTimeoutComponent,SessionHeaderComponent],template:`
<div class="app-shell">
 <header class="topbar">
  <div class="brand-lockup">
   <a class="brand" routerLink="/"><span class="brand-mark">N</span><span><strong>NEU Trading</strong><small>Client Brokerage</small></span></a>
  </div>
  <app-session-header/>
 </header>
 <nav class="primary-nav" aria-label="Primary navigation">
  <div class="nav-inner">
   <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span class="nav-icon">⌂</span><span>Overview</span></a>
   <a routerLink="/portfolio" routerLinkActive="active"><span class="nav-icon">▥</span><span>Portfolio</span></a>
   <a routerLink="/markets" routerLinkActive="active"><span class="nav-icon">⌁</span><span>Markets</span></a>
   <a class="trade-nav" routerLink="/trade" routerLinkActive="active"><span class="nav-icon">↗</span><span>Trade</span></a>
   <a routerLink="/orders" routerLinkActive="active"><span class="nav-icon">≡</span><span>Orders</span></a>
  </div>
 </nav>
 <main><router-outlet/></main>
 <footer><span>© {{year}} NEU Trading</span><span class="footer-dot">•</span><span>Client UI v{{uiVersion}}</span><span class="footer-dot">•</span><span>API v{{apiVersion()}}</span></footer>
 <app-session-timeout/>
</div>`})
export class AppComponent{private api=inject(ApiService);readonly year=new Date().getFullYear();readonly uiVersion=packageInfo.version;readonly apiVersion=signal('…');constructor(){this.api.version().subscribe({next:v=>this.apiVersion.set(v.version),error:()=>this.apiVersion.set('unavailable')});}}
