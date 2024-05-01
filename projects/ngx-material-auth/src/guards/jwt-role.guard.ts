import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { NGX_GUARD_CONFIG, NgxGuardConfig } from './guard-config.type';
import { JwtLoggedInGuardConfig } from './jwt-logged-in.guard';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

// eslint-disable-next-line jsdoc/require-jsdoc
type AllowedRolesFunction<RoleValue extends string> = ((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => RoleValue[]) | ((route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => Promise<RoleValue[]>)

/**
 * Configuration for the JwtRoleGuard.
 */
export interface JwtRoleGuardConfig<RoleValue extends string> extends JwtLoggedInGuardConfig {
    /**
     * Gets all allowed roles for the provided route.
     *
     * By default this method tries to get these from the routes data property.
     * @see https://angular.io/api/router/Route#data
     * @param route - The route that the user tries to navigate to.
     * @param state - State data of the route.
     * @returns The allowed roles for the provided route as an array.
     */
    getAllowedRoleValuesForRoute: AllowedRolesFunction<RoleValue>
}

// eslint-disable-next-line jsdoc/require-param
/**
 * Checks if the currently logged in user has the role required for a specific route.
 */
export const JwtRoleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    // eslint-disable-next-line typescript/no-explicit-any
    const authService: JwtAuthService<any, any, any, any> = inject(NGX_AUTH_SERVICE);
    const config: Partial<NgxGuardConfig> = inject(NGX_GUARD_CONFIG);
    const routeAfterLogout: string = config.roleGuard?.routeAfterLogout ?? authService.ROUTE_AFTER_LOGOUT;
    const routeAfterRedirect: string = config.roleGuard?.routeAfterRedirect ?? '/';
    // eslint-disable-next-line typescript/typedef
    const userShouldBeLoggedOut = config.roleGuard?.userShouldBeLoggedOut ?? (() => true);
    // eslint-disable-next-line typescript/typedef
    const getAllowedRoleValuesForRoute = config.roleGuard?.getAllowedRoleValuesForRoute ?? defaultGetAllowedRoleValuesForRoute;

    const allowedRoles: string[] = await getAllowedRoleValuesForRoute(route, state);
    const hasRole: boolean = authService.hasRole(allowedRoles);
    if (hasRole) {
        return true;
    }

    if (await userShouldBeLoggedOut(route, state)) {
        await authService.logout();
        await router.navigateByUrl(routeAfterLogout);
    }
    else {
        await router.navigateByUrl(routeAfterRedirect);
    }
    return false;
};

// eslint-disable-next-line jsdoc/require-jsdoc, unusedImports/no-unused-vars
function defaultGetAllowedRoleValuesForRoute<RoleValue extends string>(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): RoleValue[] {
    return route.data['allowedRoles'] as RoleValue[] ?? [];
}