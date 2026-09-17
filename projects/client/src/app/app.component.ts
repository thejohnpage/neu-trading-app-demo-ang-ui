import { Component } from '@angular/core'; import { RouterOutlet } from '@angular/router';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet],template:`<header><strong>NEU Trading</strong><span>Client</span></header><main><router-outlet/></main>`}) export class AppComponent{}
