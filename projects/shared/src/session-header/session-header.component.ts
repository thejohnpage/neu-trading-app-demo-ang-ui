import { Component,inject,signal } from '@angular/core';import { Router } from '@angular/router';import { AuthService } from '../auth.service';
/** Header controls showing access-token time remaining and explicit logout. */
@Component({selector:'app-session-header',standalone:true,styleUrl: './session-header.component.scss',templateUrl: './session-header.component.html'})
export class SessionHeaderComponent{
 readonly auth=inject(AuthService);private router=inject(Router);readonly remaining=signal('--:--');readonly expiring=signal(false);private tick?:number;
 constructor(){this.update();this.tick=window.setInterval(()=>this.update(),1000);window.addEventListener('auth-session-changed',()=>this.update());}
 private update(){const exp=this.auth.expiresAt();if(!exp){this.remaining.set('--:--');this.expiring.set(false);return;}const s=Math.max(0,Math.ceil((exp-Date.now())/1000));this.expiring.set(s<=300);this.remaining.set(`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`);}
 logout(){this.auth.logout();this.router.navigate(['/login']);}
}
