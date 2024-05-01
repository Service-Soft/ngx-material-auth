import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { BooleanFunction } from './boolean-function.type';
import { NGX_GUARD_CONFIG, NgxGuardConfig } from './guard-config.type';
import { JwtLoggedInGuardConfig } from './jwt-logged-in.guard';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

/**
 * Configuration for the JwtBelongsToGuard.
 */
export interface JwtBelongsToGuardConfig extends JwtLoggedInGuardConfig {
    /**
     * Gets all allowed roles for the provided route.
     * @param route - The route that the user tries to navigate to.
     * @param state - State data of the route.
     */
    getBelongsToForRoute: BooleanFunction
}

// eslint-disable-next-line jsdoc/require-param
/**
 * Checks if the currently logged in user has the role required for a specific route.
 */
export const JwtBelongsToGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    // eslint-disable-next-line typescript/no-explicit-any
    const authService: JwtAuthService<any, any, any, any> = inject(NGX_AUTH_SERVICE);
    const config: Partial<NgxGuardConfig> = inject(NGX_GUARD_CONFIG);
    const routeAfterLogout: string = config.belongsToGuard?.routeAfterLogout ?? authService.ROUTE_AFTER_LOGOUT;
    const routeAfterRedirect: string = config.belongsToGuard?.routeAfterRedirect ?? '/';
    const userShouldBeLoggedOut: BooleanFunction = config.belongsToGuard?.userShouldBeLoggedOut ?? (() => true);
    const getBelongsToForRoute: BooleanFunction = config.belongsToGuard?.getBelongsToForRoute ?? defaultGetBelongsToForRoute;

    if (await getBelongsToForRoute(route, state)) {
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
function defaultGetBelongsToForRoute(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    throw new Error('If you want to use the JwtBelongsToGuard, the guard configuration needs to be provided on the Injection Token NGX_GUARD_CONFIG.');
}