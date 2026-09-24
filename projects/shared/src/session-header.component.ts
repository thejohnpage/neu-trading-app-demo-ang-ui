import { Component,inject,signal } from '@angular/core';import { Router } from '@angular/router';import { AuthService } from './auth.service';
/** Header controls showing access-token time remaining and explicit logout. */
@Component({selector:'app-session-header',standalone:true,template:`@if(auth.isAuthenticated()){<div class="session-header"><span title="Access token time remaining">Session {{remaining()}}</span><button type="button" (click)="logout()">Logout</button></div>}`})
export class SessionHeaderComponent{
 readonly auth=inject(AuthService);private router=inject(Router);readonly remaining=signal('--:--');private tick?:number;
 constructor(){this.update();this.tick=window.setInterval(()=>this.update(),1000);window.addEventListener('auth-session-changed',()=>this.update());}
 private update(){const exp=this.auth.expiresAt();if(!exp){this.remaining.set('--:--');return;}const s=Math.max(0,Math.ceil((exp-Date.now())/1000));this.remaining.set(`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`);}
 logout(){this.auth.logout();this.router.navigate(['/login']);}
}
