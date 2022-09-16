import { CanActivate, Router } from '@angular/router';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { Inject, Injectable } from '@angular/core';

/**
 * Contains the necessary base information for an angular logged in guard.
 * Checks if the user is currently logged in.
 */
@Injectable({ providedIn: 'root' })
export class JwtLoggedInGuard<
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
     * @returns Whether or not the user can access the provided route.
     */
    canActivate(): boolean {
        if (this.authService.authData == null) {
            this.authService.logout();
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }
}