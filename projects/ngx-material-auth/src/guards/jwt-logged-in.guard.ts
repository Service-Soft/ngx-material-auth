import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { BooleanFunction } from './boolean-function.type';
import { NGX_GUARD_CONFIG, NgxGuardConfig } from './guard-config.type';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

/**
 * Configuration for the JwtLoggedInGuard.
 */
export interface JwtLoggedInGuardConfig {
    /**
     * When the user tries to access a route for which he doesn't have the permission and is logged out
     * he gets redirected to this route afterwards.
     * @default The auth service ROUTE_AFTER_LOGOUT, which defaults to '/login'
     */
    routeAfterLogout: string,
    /**
     * When the user tries to access a route for which he doesn't have the permission but is NOT logged out
     * he gets redirected to this route afterwards.
     * @default '/'
     */
    routeAfterRedirect: string,
    /**
     * Defines whether or not the user should be logged out based on the route he tried to access.
     * By default this simply returns true.
     * @param route - The route that the user failed to access.
     * @param state - The router state.
     * @returns Whether or not the user should be logged out.
     */
    userShouldBeLoggedOut: BooleanFunction
}

// eslint-disable-next-line jsdoc/require-param
/**
 * Checks if the user is currently logged in.
 */
export const JwtLoggedInGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    // eslint-disable-next-line typescript/no-explicit-any
    const authService: JwtAuthService<any, any, any, any> = inject(NGX_AUTH_SERVICE);
    const config: Partial<NgxGuardConfig> = inject(NGX_GUARD_CONFIG);
    const routeAfterLogout: string = config.loggedInGuard?.routeAfterLogout ?? authService.ROUTE_AFTER_LOGOUT;
    const routeAfterRedirect: string = config.loggedInGuard?.routeAfterRedirect ?? '/';
    const userShouldBeLoggedOut: BooleanFunction = config.loggedInGuard?.userShouldBeLoggedOut ?? (() => true);

    if (authService.authData != undefined) {
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