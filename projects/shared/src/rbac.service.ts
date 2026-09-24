import { Injectable,inject } from '@angular/core';import { AuthService } from './auth.service';
export type AdminCapability='USER_MANAGEMENT'|'ORDER_OPERATIONS'|'AUDIT'|'REPORTING';
@Injectable({providedIn:'root'}) export class RbacService{
 private auth=inject(AuthService);
 private readonly grants:Record<AdminCapability,string[]>={
  USER_MANAGEMENT:['SUPER_ADMIN'],
  ORDER_OPERATIONS:['SUPER_ADMIN','ADMIN_OPERATIONS','TRADING_OPERATIONS','RISK','COMPLIANCE'],
  AUDIT:['SUPER_ADMIN','ADMIN_OPERATIONS','COMPLIANCE','RISK'],
  REPORTING:['SUPER_ADMIN','ADMIN_REPORTING','ANALYST','FINANCE']
 };
 has(capability:AdminCapability){const roles=this.auth.subject()?.roles??[];return this.grants[capability].some(r=>roles.includes(r));}
}
