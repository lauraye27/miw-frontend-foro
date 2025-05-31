import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {AuthService} from '@core/services/auth.service';
import {Role} from '@core/models/role.model';

@Injectable({providedIn: 'root'})
export class RoleGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const roles: Role[] = route.data['roles'];

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (this.auth.hasRoles(roles)) {
      return true;
    } else {
      this.router.navigate(['/not-found']);
      return false;
    }
  }
}
