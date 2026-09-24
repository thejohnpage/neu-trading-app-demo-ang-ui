import { Injectable,signal } from '@angular/core';import { HttpClient } from '@angular/common/http';import { tap } from 'rxjs';
export interface AuthSubject{sub:string;type:'CLIENT'|'ADMIN';email:string;roles?:string[]}
export interface LoginResponse{accessToken:string;refreshToken:string;tokenType:string;expiresIn:string;subject:AuthSubject}
@Injectable({providedIn:'root'}) export class AuthService{
 private base='http://localhost:3001/api/v1/auth';subject=signal<AuthSubject|null>(this.readSubject());
 constructor(private http:HttpClient){}
 login(email:string,password:string,type:'CLIENT'|'ADMIN'){return this.http.post<LoginResponse>(this.base+'/login',{email,password,type}).pipe(tap(r=>this.store(r)));}
 logout(){const refreshToken=localStorage.getItem('refreshToken');const done=()=>{localStorage.removeItem('accessToken');localStorage.removeItem('refreshToken');localStorage.removeItem('authSubject');this.subject.set(null);};if(refreshToken)this.http.post(this.base+'/logout',{refreshToken}).subscribe({next:done,error:done});else done();}
 accessToken(){return localStorage.getItem('accessToken');}
 isAuthenticated(){return !!this.accessToken();}
 private store(r:LoginResponse){localStorage.setItem('accessToken',r.accessToken);localStorage.setItem('refreshToken',r.refreshToken);localStorage.setItem('authSubject',JSON.stringify(r.subject));this.subject.set(r.subject);}
 private readSubject(){try{const v=localStorage.getItem('authSubject');return v?JSON.parse(v):null;}catch{return null;}}
}
