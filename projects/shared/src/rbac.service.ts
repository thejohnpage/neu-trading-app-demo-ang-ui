import { Injectable,inject } from '@angular/core';import { AuthService } from './auth.service';
export type AdminCapability='USER_MANAGEMENT'|'ROLE_MANAGEMENT'|'CLIENT_MANAGEMENT'|'ORDER_OPERATIONS'|'AUDIT_VIEW'|'REPORTING';
@Injectable({providedIn:'root'}) export class RbacService{private auth=inject(AuthService);has(capability:AdminCapability){return (this.auth.subject()?.capabilities??[]).includes(capability);}}
