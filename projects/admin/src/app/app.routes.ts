import { Routes } from '@angular/router';import { OverviewComponent } from './overview.component';import { OrdersComponent } from './orders.component';import { ActivityComponent } from './activity.component';import { InstrumentsComponent } from './instruments.component';import { SegmentsComponent } from './segments.component';import { VolumeComponent } from './volume.component';import { RolesComponent } from './roles.component';import { UsersComponent } from './users.component';import { AuditComponent } from './audit.component';import { LoginComponent } from '@shared/login.component';import { authGuard } from '@shared/auth.guard';import { capabilityGuard } from '@shared/capability.guard';
export const routes:Routes=[
 {path:'login',component:LoginComponent,data:{type:'ADMIN'}},
 {path:'',component:OverviewComponent,canActivate:[authGuard]},
 {path:'orders',component:OrdersComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'ORDER_OPERATIONS'}},
 {path:'activity',component:ActivityComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'instruments',component:InstrumentsComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'segments',component:SegmentsComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'volume',component:VolumeComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'REPORTING'}},
 {path:'audit',component:AuditComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'AUDIT_VIEW'}},
 {path:'users',component:UsersComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'USER_MANAGEMENT'}},{path:'roles',component:RolesComponent,canActivate:[authGuard,capabilityGuard],data:{capability:'ROLE_MANAGEMENT'}},
 {path:'**',redirectTo:''}
];