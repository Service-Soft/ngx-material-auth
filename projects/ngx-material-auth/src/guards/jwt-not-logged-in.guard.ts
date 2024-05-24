import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { BooleanFunction } from './boolean-function.type';
import { NGX_GUARD_CONFIG, NgxGuardConfig } from './guard-config.type';
import { JwtLoggedInGuardConfig } from './jwt-logged-in.guard';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

/**
 * Configuration for the JwtNotLoggedInGuard.
 */
export type JwtNotLoggedInGuardConfig = JwtLoggedInGuardConfig;

// eslint-disable-next-line jsdoc/require-param
/**
 * Checks if the user is currently NOT logged in.
 * This can be useful if you want to disable already logged in user to access the login page etc.
 */
export const JwtNotLoggedInGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    // eslint-disable-next-line typescript/no-explicit-any
    const authService: JwtAuthService<any, any, any, any> = inject(NGX_AUTH_SERVICE);
    const config: Partial<NgxGuardConfig> = inject(NGX_GUARD_CONFIG);
    const routeAfterLogout: string = config.notLoggedInGuard?.routeAfterLogout ?? authService.ROUTE_AFTER_LOGOUT;
    const routeAfterRedirect: string = config.notLoggedInGuard?.routeAfterRedirect ?? '/';
    const userShouldBeLoggedOut: BooleanFunction = config.notLoggedInGuard?.userShouldBeLoggedOut ?? (() => true);

    if (authService.authData == undefined) {
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