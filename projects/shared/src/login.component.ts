import { Component,inject } from '@angular/core';import { FormsModule } from '@angular/forms';import { ActivatedRoute,Router,RouterLink } from '@angular/router';import { AuthService } from './auth.service';
@Component({selector:'app-login',standalone:true,imports:[FormsModule,RouterLink],template:`
<div class="login-page">
 <section class="login-card">
  <div class="login-brand">NEU Trading</div>
  <p class="login-context">{{type==='ADMIN'?'Admin & Reporting':'Client'}}</p>
  <h1>Sign in</h1>
  <p class="muted">{{type==='ADMIN'?'Sign in with your administrative account.':'Sign in to access your trading account.'}}</p>
  <form (ngSubmit)="login()">
   <label for="login-email">Email</label><input id="login-email" name="email" type="email" autocomplete="username" [(ngModel)]="email" required>
   <label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" [(ngModel)]="password" required>
   <button class="primary" type="submit" [disabled]="busy">{{busy?'Signing in…':'Sign in'}}</button>
  </form>
  @if(error){<p class="login-error">{{error}}</p>} @if(type==='CLIENT'){<p class="login-switch">New to NEU Trading? <a routerLink="/register">Open an account</a></p>}
 </section>
</div>`})
export class LoginComponent{
 private auth=inject(AuthService);private router=inject(Router);private route=inject(ActivatedRoute);
 readonly type=(this.route.snapshot.data['type']??'CLIENT') as 'CLIENT'|'ADMIN';email='';password='';busy=false;error='';
 login(){if(!this.email||!this.password)return;this.busy=true;this.error='';this.auth.login(this.email,this.password,this.type).subscribe({next:()=>{this.busy=false;this.router.navigateByUrl(this.type==='ADMIN'?'/':'/portfolio');},error:()=>{this.busy=false;this.error='Invalid email or password';}});}
}
