import { inject } from '@angular/core';import { CanActivateFn,Router } from '@angular/router';import { AdminCapability,RbacService } from './rbac.service';
export const capabilityGuard:CanActivateFn=route=>{const capability=route.data['capability'] as AdminCapability;return inject(RbacService).has(capability)?true:inject(Router).createUrlTree(['/']);};
