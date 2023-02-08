import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { Inject, Injectable } from '@angular/core';
import { BaseRole } from '../public-api';

/**
 * Checks if the user is currently NOT logged in.
 * This can be useful if you want to disable already logged in user to access the login page etc.
 */
@Injectable({ providedIn: 'root' })
export class JwtNotLoggedInGuard<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, RoleValue, Role, TokenType>
> implements CanActivate {

    /**
     * When the user tries to access a route for which he doesn't have the permission and is logged out
     * he gets redirected to this route afterwards.
     */
    protected readonly ROUTE_AFTER_LOGOUT: string = '/login';

    /**
     * When the user tries to access a route for which he doesn't have the permission but is NOT logged out
     * he gets redirected to this route afterwards.
     */
    protected readonly ROUTE_AFTER_REDIRECT: string = '/';

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
        if (this.authService.authData != null) {
            if (this.userShouldBeLoggedOut(route, state)) {
                void this.authService.logout().then(() => {
                    void this.router.navigate([this.ROUTE_AFTER_LOGOUT], {});
                });
            }
            else {
                void this.router.navigate([this.ROUTE_AFTER_REDIRECT], {});
            }
            return false;
        }
        return true;
    }

    /**
     * Defines whether or not the user should be logged out based on the route he tried to access.
     *
     * @param route - The route that the user failed to access.
     * @param state - The router state.
     * @returns Whether or not the user should be logged out.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected userShouldBeLoggedOut(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return true;
    }
}