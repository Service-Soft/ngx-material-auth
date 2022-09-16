import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtAuthService } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';

/**
 * Contains the necessary base information for an angular belongs to guard.
 * Checks if the user is in any way associated with the provided route.
 *
 * This can be useful when eg. The user is allowed to display his own user-profile but not the user-profiles of others.
 */
export abstract class JwtBelongsToGuard<
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
            this.authService.logout();
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
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