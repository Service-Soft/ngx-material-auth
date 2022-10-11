import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtAuthService } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { BaseRole } from '../models/base-role.model';

/**
 * Contains the necessary base information for an angular belongs to guard.
 * Checks if the user is in any way associated with the provided route.
 *
 * This can be useful when eg. The user is allowed to display his own user-profile but not the user-profiles of others.
 */
export abstract class JwtBelongsToGuard<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    TokenType extends BaseToken,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    AuthServiceType extends JwtAuthService<AuthDataType, RoleValue, Role, TokenType>
> implements CanActivate {

    /**
     * When the user tries to access a route for which he doesn't have the permission and is logged out
     * he gets redirected to this route afterwards.
     */
    protected readonly ROUTE_AFTER_LOGOUT = '/login';

    /**
     * When the user tries to access a route for which he doesn't have the permission but is NOT logged out
     * he gets redirected to this route afterwards.
     */
    protected readonly ROUTE_AFTER_REDIRECT = '/';

    constructor(
        protected readonly router: Router,
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
        if (!this.getBelongsToForRoute(route, state)) {
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

    /**
     * Gets all allowed roles for the provided route.
     *
     * @param route - The route that the user tries to navigate to.
     * @param state - State data of the route.
     */
    protected abstract getBelongsToForRoute(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean;
}