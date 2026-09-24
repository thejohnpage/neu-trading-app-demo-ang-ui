import { Component,inject,signal } from '@angular/core';import { Router } from '@angular/router';import { AuthService } from './auth.service';
@Component({selector:'app-session-timeout',standalone:true,template:`@if(open()){<div class="session-backdrop"><section class="session-modal" role="dialog" aria-modal="true" aria-labelledby="session-title"><h2 id="session-title">Session expiring</h2><p>Your session will expire in {{remaining()}}. Refresh your session to continue without signing in again, or log out now.</p><div class="session-actions"><button (click)="logout()">Log out now</button><button class="primary" (click)="refresh()" [disabled]="busy()">{{busy()?'Refreshing…':'Refresh session'}}</button></div>@if(error()){<p class="error">{{error()}}</p>}</section></div>}`})
export class SessionTimeoutComponent{
 private auth=inject(AuthService);private router=inject(Router);open=signal(false);busy=signal(false);error=signal('');remaining=signal('5:00');private timer?:number;private tick?:number;
 constructor(){this.schedule();window.addEventListener('auth-session-changed',()=>this.schedule());}
 private schedule(){if(this.timer)clearTimeout(this.timer);if(this.tick)clearInterval(this.tick);this.open.set(false);const exp=this.auth.expiresAt();if(!exp)return;const warning=exp-Date.now()-5*60_000;if(warning<=0)this.show();else this.timer=window.setTimeout(()=>this.show(),warning);}
 private show(){this.open.set(true);this.updateRemaining();this.tick=window.setInterval(()=>this.updateRemaining(),1000);}
 private updateRemaining(){const ms=Math.max(0,(this.auth.expiresAt()??Date.now())-Date.now());const s=Math.ceil(ms/1000);this.remaining.set(`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`);if(ms<=0){this.auth.clear();this.router.navigate(['/login']);}}
 refresh(){this.busy.set(true);this.error.set('');this.auth.refresh().subscribe({next:()=>{this.busy.set(false);this.schedule();},error:()=>{this.busy.set(false);this.error.set('Unable to refresh the session. Please log in again.');}});}
 logout(){this.auth.logout();this.router.navigate(['/login']);}
}
