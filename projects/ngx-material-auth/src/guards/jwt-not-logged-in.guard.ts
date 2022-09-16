import { CanActivate, Router } from '@angular/router';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { Inject, Injectable } from '@angular/core';

/**
 * Checks if the user is currently NOT logged in.
 * This can be useful if you want to disable already logged in user to access the login page etc.
 */
@Injectable({ providedIn: 'root' })
export class JwtNotLoggedInGuard<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements CanActivate {

    /**
     * The route to which the user is redirected if he is already logged in.
     */
    protected readonly REDIRECT_ROUTE = '/';

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
        if (this.authService.authData != null) {
            void this.router.navigate([this.REDIRECT_ROUTE], {});
            return false;
        }
        return true;
    }
}