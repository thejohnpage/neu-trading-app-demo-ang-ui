import { Routes } from '@angular/router';import { OverviewComponent } from './overview/overview.component';import { OrdersComponent } from './orders/orders.component';import { ActivityComponent } from './activity/activity.component';import { WarehouseActivityComponent } from './warehouse-activity/warehouse-activity.component';import { InstrumentsComponent } from './instruments/instruments.component';import { SegmentsComponent } from './segments/segments.component';import { VolumeComponent } from './volume/volume.component';import { RolesComponent } from './roles/roles.component';import { KafkaMonitorComponent } from './kafka-monitor/kafka-monitor.component';import { ClientsComponent } from './clients/clients.component';import { UsersComponent } from './users/users.component';import { AuditComponent } from './audit/audit.component';import { LoginComponent } from '@shared/login/login.component';import { authGuard } from '@shared/auth.guard';import { capabilityGuard } from '@shared/capability.guard';
export const routes:Routes=[
 {path:'login',component:LoginComponent,data:{type:'ADMIN'}},
 {path:'',component:OverviewComponent,canActivate:[authGuard]},
 {path:'orders',component:OrdersComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'ORDER_OPERATIONS'}},{path:'kafka',component:KafkaMonitorComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'KAFKA_MONITORING'}},
 {path:'activity',component:ActivityComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'warehouse',component:WarehouseActivityComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'instruments',component:InstrumentsComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'segments',component:SegmentsComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'volume',component:VolumeComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'audit',component:AuditComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'AUDIT_VIEW'}},
 {path:'clients',component:ClientsComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'CLIENT_MANAGEMENT'}},{path:'users',component:UsersComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'USER_MANAGEMENT'}},{path:'roles',component:RolesComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'ROLE_MANAGEMENT'}},
 {path:'**',redirectTo:''}
];