import { Component,inject } from '@angular/core';import { FormsModule } from '@angular/forms';import { ActivatedRoute,Router,RouterLink } from '@angular/router';import { AuthService } from '../auth.service';
@Component({selector:'app-login',standalone:true,imports:[FormsModule,RouterLink],styleUrl: './login.component.scss', templateUrl: './login.component.html'})
export class LoginComponent{
 private auth=inject(AuthService);private router=inject(Router);private route=inject(ActivatedRoute);
 readonly type=(this.route.snapshot.data['type']??'CLIENT') as 'CLIENT'|'ADMIN';email='';password='';busy=false;error='';
 login(){if(!this.email||!this.password)return;this.busy=true;this.error='';this.auth.login(this.email,this.password,this.type).subscribe({next:()=>{this.busy=false;this.router.navigateByUrl(this.type==='ADMIN'?'/':'/portfolio');},error:()=>{this.busy=false;this.error='Invalid email or password';}});}
}
