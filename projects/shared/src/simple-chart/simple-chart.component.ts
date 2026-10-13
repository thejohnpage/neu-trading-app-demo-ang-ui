import { AfterViewChecked,Component,ElementRef,OnDestroy,ViewChild,input } from '@angular/core';
import Chart from 'chart.js/auto';
export interface ChartDatum{label:string;value:number}
@Component({selector:'app-simple-chart',standalone:true,styleUrl: './simple-chart.component.scss',templateUrl: './simple-chart.component.html'})
export class SimpleChartComponent implements AfterViewChecked,OnDestroy{
 @ViewChild('canvas') canvas?:ElementRef<HTMLCanvasElement>;
 title=input.required<string>();subtitle=input('');type=input<'bar'|'donut'|'line'>('bar');data=input<ChartDatum[]>([]);prefix=input('');
 private chart?:Chart;private signature='';
 ngAfterViewChecked(){const rows=this.data();const next=JSON.stringify({type:this.type(),prefix:this.prefix(),rows});if(this.canvas&&rows.length&&next!==this.signature){this.signature=next;this.render(rows);}if(!rows.length){this.chart?.destroy();this.chart=undefined;this.signature='';}}
 ngOnDestroy(){this.chart?.destroy();}
 private render(rows:ChartDatum[]){if(!this.canvas)return;this.chart?.destroy();const type=this.type()==='donut'?'doughnut':this.type();const values=rows.map(x=>Number(x.value)||0);const positive='#2b61ad',negative='#b42318';
  this.chart=new Chart(this.canvas.nativeElement,{type:type as any,data:{labels:rows.map(x=>x.label),datasets:[{label:this.title(),data:values,backgroundColor:type==='doughnut'?['#2b61ad','#16a085','#7c5ce5','#d97706','#4f7f52','#be4b72','#64748b']:values.map(v=>v<0?negative:positive),borderColor:type==='line'?positive:undefined,borderWidth:type==='line'?2:0,fill:false,tension:type==='line'?.3:undefined}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:450},plugins:{legend:{display:type==='doughnut',position:'right'},tooltip:{callbacks:{label:(ctx:any)=>`${ctx.label??ctx.dataset.label}: ${this.prefix()}${Number(ctx.raw).toLocaleString(undefined,{maximumFractionDigits:2})}`}}},scales:type==='doughnut'?undefined:{y:{beginAtZero:true,grid:{color:'#edf1f5'},ticks:{callback:(v:any)=>this.prefix()+Number(v).toLocaleString()}},x:{grid:{display:false}}}}});}
}
