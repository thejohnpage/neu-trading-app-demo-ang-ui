import { Component,inject,signal } from '@angular/core';import { DatePipe } from '@angular/common';import { ApiService } from '@shared/api.service';
@Component({selector:'app-audit',standalone:true,imports:[DatePipe],styleUrl: './audit.component.scss', templateUrl: './audit.component.html'})
export class AuditComponent{private api=inject(ApiService);events=signal<any[]>([]);actionFilter='';actorType='';resourceType='';constructor(){this.load();}load(){this.api.auditEvents({action:this.actionFilter,actorType:this.actorType,resourceType:this.resourceType}).subscribe(v=>this.events.set(v));}}
