import { AfterViewInit,Component,ElementRef,OnDestroy,ViewChild,effect,input } from '@angular/core';
import Chart from 'chart.js/auto';
export interface ChartDatum{label:string;value:number}
@Component({selector:'app-simple-chart',standalone:true,styles:[`
:host{display:block;min-width:0}.chart-card{background:#fff;border:1px solid #dfe5ec;border-radius:8px;padding:18px 20px;box-shadow:0 4px 14px rgba(21,34,56,.06);height:100%}.chart-card h3{margin:0;font-size:16px}.chart-card p{margin:4px 0 12px;color:#667085;font-size:12px}.chart-wrap{position:relative;height:260px;min-width:0}
`],template:`<section class="chart-card"><h3>{{title()}}</h3><p>{{subtitle()}}</p><div class="chart-wrap"><canvas #canvas></canvas></div></section>`})
export class SimpleChartComponent implements AfterViewInit,OnDestroy{
 @ViewChild('canvas') canvas?:ElementRef<HTMLCanvasElement>;
 title=input.required<string>();subtitle=input('');type=input<'bar'|'donut'|'line'>('bar');data=input<ChartDatum[]>([]);prefix=input('');
 private chart?:Chart;private ready=false;
 constructor(){effect(()=>{this.data();this.type();this.prefix();if(this.ready)this.render();});}
 ngAfterViewInit(){this.ready=true;this.render();}ngOnDestroy(){this.chart?.destroy();}
 private render(){if(!this.canvas)return;this.chart?.destroy();const rows=this.data();const type=this.type()==='donut'?'doughnut':this.type();const values=rows.map(x=>x.value);const positive='#2b61ad',negative='#b42318';
  this.chart=new Chart(this.canvas.nativeElement,{type:type as any,data:{labels:rows.map(x=>x.label),datasets:[{label:this.title(),data:values,backgroundColor:type==='doughnut'?['#2b61ad','#16a085','#7c5ce5','#d97706','#4f7f52','#be4b72','#64748b']:values.map(v=>v<0?negative:positive),borderColor:type==='line'?positive:undefined,borderWidth:type==='line'?2:0,fill:type==='line'?false:undefined,tension:type==='line'?.3:undefined}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:450},plugins:{legend:{display:type==='doughnut',position:'right'},tooltip:{callbacks:{label:(ctx:any)=>`${ctx.label??ctx.dataset.label}: ${this.prefix()}${Number(ctx.raw).toLocaleString(undefined,{maximumFractionDigits:2})}`}}},scales:type==='doughnut'?undefined:{y:{beginAtZero:true,grid:{color:'#edf1f5'},ticks:{callback:(v:any)=>this.prefix()+Number(v).toLocaleString()}},x:{grid:{display:false}}}}});}
}
