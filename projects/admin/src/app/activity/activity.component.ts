import { Component,inject,signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '@shared/api.service';
import { TradeActivity } from '@shared/models';

@Component({selector:'app-activity',standalone:true,imports:[DecimalPipe,DatePipe],styleUrl: './activity.component.scss', templateUrl: './activity.component.html'})
export class ActivityComponent{private api=inject(ApiService);rows=signal<TradeActivity[]>([]);constructor(){this.api.reportActivity().subscribe(x=>this.rows.set(x));}shortId(id:string){return `ORD-${id.replaceAll('-','').slice(0,8).toUpperCase()}`;}}
