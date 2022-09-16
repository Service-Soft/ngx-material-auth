import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';

/**
 * Contains the necessary base information for an angular role guard.
 * Checks if the currently logged in user has the role required for a specific route.
 */
@Injectable({ providedIn: 'root' })
export class JwtRoleGuard<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements CanActivate {

    /**
     * When the user tries to access a route for which he doesn't have the permission he is logged out.
     * This is the route to which he is redirected afterwards.
     */
    protected readonly REDIRECT_ROUTE = '/login';

    constructor(
        protected readonly router: Router,
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType
    ) { }


    /**
     * The main method used by angular to determine if a user can access a certain route.
     *
     * @param route - The route that the user tries to access.
     * @param state - State data of the route.
     * @returns Whether or not the user can access the provided route.
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const allowedRoles = this.getAllowedRolesForRoute(route, state);
        if (!this.authService.hasRole(allowedRoles)) {
            this.authService.logout();
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }

    /**
     * Gets all allowed roles for the provided route.
     *
     * By default this method tries to get these from the routes data property.
     *
     * @see https://angular.io/api/router/Route#data
     * @param route - The route that the user tries to navigate to.
     * @param state - State data of the route.
     * @returns The allowed roles for the provided route as an array.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getAllowedRolesForRoute(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): string[] {
        return route.data['allowedRoles'] as string[] ?? [];
    }
}