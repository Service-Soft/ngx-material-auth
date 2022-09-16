import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

const SIX_HOURS_IN_MS = 21600000;

/**
 * Interceptor that sets the authorization header to the current token on every request.
 * Does nothing when the user isn't logged in.
 */
@Injectable({ providedIn: 'root' })
export class JwtInterceptor<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements HttpInterceptor {

    /**
     * The maximum amount of milliseconds before the expiration date to refresh the token.
     * If the token still has more time than this left, it will not get refreshed.
     */
    protected readonly MAXIMUM_MS_BEFORE_EXPIRATION_FOR_REFRESH: number = SIX_HOURS_IN_MS;

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType
    ) { }

    /**
     * The main method used by angular to intercept any http-requests and append the jwt.
     *
     * @param request - The http-request that was intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns An Observable that is used by angular in the intercept chain.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (!this.authService.authData?.token) {
            return next.handle(request);
        }
        if (this.tokenNeedsToBeRefreshed()) {
            void this.authService.refreshToken();
        }
        request = request.clone({
            setHeaders: {
                authorization: `Bearer ${this.authService.authData.token.value}`
            }
        });
        return next.handle(request);
    }

    /**
     * Checks whether or not the token needs to be refreshed.
     *
     * @returns Whether or not the token needs to be refreshed.
     */
    protected tokenNeedsToBeRefreshed(): boolean {
        const tokenExpirationDate: Date = new Date(this.authService.authData?.token.expirationDate as Date);
        const expirationInMs: number = tokenExpirationDate.getTime();
        return (expirationInMs - Date.now()) <= this.MAXIMUM_MS_BEFORE_EXPIRATION_FOR_REFRESH;
    }
}