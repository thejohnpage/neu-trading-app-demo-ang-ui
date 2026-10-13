import { Component,inject,signal } from '@angular/core';import { FormsModule } from '@angular/forms';import { DatePipe } from '@angular/common';import { ApiService } from '@shared/api.service';import { AdminUser } from '@shared/models';
@Component({selector:'app-users',standalone:true,imports:[FormsModule,DatePipe],styleUrl: './users.component.scss', templateUrl: './users.component.html'})
export class UsersComponent{
 private api=inject(ApiService);users=signal<AdminUser[]>([]);showCreate=false;message='';error='';roles:string[]=[];draft={email:'',firstName:'',lastName:'',password:'',roles:['ADMIN_OPERATIONS'] as string[]};
 editing:AdminUser|null=null;profile:any={};
 constructor(){this.load();this.loadRoles();}
 loadRoles(){this.api.rbacRoles().subscribe({next:v=>{this.roles=v.map((r:any)=>r.roleName);if(!this.draft.roles.length&&this.roles.length)this.draft.roles=[this.roles.find(r=>r!=='SUPER_ADMIN')??this.roles[0]];},error:()=>this.error='Unable to load available roles.'});}
 activeSuperAdmins(){return this.users().filter(u=>u.active&&u.roles.includes('SUPER_ADMIN')).length;}
 edit(user:AdminUser){this.editing=user;this.api.adminUserProfile(user.userId).subscribe(p=>this.profile={firstName:user.firstName,lastName:user.lastName,email:user.email,...p});}
 saveProfile(){if(!this.editing)return;this.api.updateAdminUserProfile(this.editing.userId,this.profile).subscribe({next:()=>{this.editing=null;this.message='Profile updated.';this.load();},error:()=>this.error='Unable to update profile.'});}
 load(){this.api.adminUsers().subscribe({next:v=>this.users.set(v),error:e=>this.error=e.status===403?'Super Admin permission is required.':'Unable to load users.'});}
 toggleDraftRole(role:string){this.draft.roles=this.draft.roles.includes(role)?this.draft.roles.filter(r=>r!==role):[...this.draft.roles,role];}
 create(){this.error='';this.message='';if(!this.draft.firstName.trim()||!this.draft.lastName.trim()||!this.draft.email.trim()){this.error='First name, last name and email are required.';return;}if(this.draft.password.length<10){this.error='Temporary password must be at least 10 characters.';return;}if(!this.draft.roles.length){this.error='Select at least one role.';return;}this.api.createAdminUser(this.draft).subscribe({next:()=>{this.message='Administrative user created.';this.showCreate=false;this.draft={email:'',firstName:'',lastName:'',password:'',roles:[]};this.load();},error:e=>{const m=e.error?.message;this.error=Array.isArray(m)?m.join(' '):(m??`Unable to create user (HTTP ${e.status}).`);}});}
 setStatus(user:AdminUser,active:boolean){this.api.setAdminUserStatus(user.userId,active).subscribe({next:()=>this.load(),error:()=>this.error='Unable to change user status.'});}
 toggleUserRole(user:AdminUser,role:string){const next=user.roles.includes(role)?user.roles.filter(r=>r!==role):[...user.roles,role];if(!next.length){this.error='An administrative user must have at least one role.';return;}this.api.setAdminUserRoles(user.userId,next).subscribe({next:()=>this.load(),error:()=>this.error='Unable to update roles.'});}
}
