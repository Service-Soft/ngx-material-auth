import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, firstValueFrom, from } from 'rxjs';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseRole } from '../models/base-role.model';
import { BaseToken } from '../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

export const NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS: InjectionToken<string[]> = new InjectionToken(
    'Used to define domains to which an jwt token should be added. This should be used to not send tokens e.g. to third party apis.',
    {
        providedIn: 'root',
        factory: () => {
            // eslint-disable-next-line no-console
            console.warn(
                // eslint-disable-next-line max-len
                'No allowedDomains have been provided for the token NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS.\nRight now every http-request adds the jwt token. It is encouraged to provide a value for this to prohibit sending jwt tokens to e.g. third party apis.\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS,\n    useValue: ["myDomain", "myOtherDomain"]\n}'
            );
        }
    }
);

/**
 * Interceptor that sets the authorization header to the current token on every request.
 * Does nothing when the user isn't logged in.
 */
@Injectable({ providedIn: 'root' })
export class JwtInterceptor<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    TokenType extends BaseToken,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    AuthServiceType extends JwtAuthService<AuthDataType, RoleValue, Role, TokenType>
> implements HttpInterceptor {

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        @Inject(NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS)
        protected readonly allowedDomains?: string[]
    ) {
        this.allowedDomains = this.allowedDomains?.map(ad => this.getDomainFromUrl(ad));
    }

    /**
     * The main method used by angular to intercept any http-requests and append the jwt.
     *
     * @param request - The http-request that was intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns An Observable that is used by angular in the intercept chain.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.refreshTokenExpired()) {
            this.authService.authData = undefined;
        }
        if (!this.authService.authData?.accessToken) {
            return next.handle(request);
        }
        if (this.requestIsToDisallowedDomain(request)) {
            return next.handle(request);
        }
        if (this.requestDoesNotRequireToken(request)) {
            return next.handle(request);
        }
        if (this.tokenNeedsToBeRefreshed(request)) {
            return from(this.refreshAndHandle(request, next));
        }
        request = request.clone({
            setHeaders: {
                authorization: `Bearer ${this.authService.authData.accessToken.value}`
            }
        });
        return next.handle(request);
    }

    /**
     * Check if the intercepted request is one of the special cases where no token is required.
     *
     * @param request - The http-request that was intercepted.
     * @returns Whether or not the intercepted request is one of the special cases where no token is required.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected requestDoesNotRequireToken(request: HttpRequest<unknown>): boolean {
        return false;
    }

    /**
     * Refreshes the token synchronous and sends the request afterwards.
     *
     * @param request - The http-request that was intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns A promise of an unknown HttpEvent. Inside the interceptor you need to call "return from(this.refreshAndHandle(...))".
     */
    protected async refreshAndHandle(request: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
        await this.authService.refreshToken();
        request = request.clone({
            setHeaders: {
                authorization: `Bearer ${this.authService.authData?.accessToken.value}`
            }
        });
        return await firstValueFrom(next.handle(request));
    }

    /**
     * Checks whether or not the token needs to be refreshed.
     *
     * @param request - The request to check.
     * @returns Whether or not the token needs to be refreshed.
     */
    protected tokenNeedsToBeRefreshed(request: HttpRequest<unknown>): boolean {
        if (
            request.url === this.authService.API_REFRESH_TOKEN_URL
            || request.url === this.authService.API_LOGOUT_URL
        ) {
            return false;
        }
        const tokenExpirationDate: Date = new Date(this.authService.authData?.accessToken.expirationDate as Date);
        const expirationInMs: number = tokenExpirationDate.getTime();
        return expirationInMs <= Date.now();
    }

    /**
     * Checks whether or not the refresh token is expired.
     *
     * @returns Whether or not the refresh token is expired.
     */
    protected refreshTokenExpired(): boolean {
        const tokenExpirationDate: Date = new Date(this.authService.authData?.refreshToken.expirationDate as Date);
        const expirationInMs: number = tokenExpirationDate.getTime();
        return expirationInMs <= Date.now();
    }

    /**
     * Checks if the request is to an allowed domain.
     *
     * @param request - The request to check.
     * @returns Whether the request is to an allowed domain or not. Defaults to true if no allowed host names were provided.
     */
    protected requestIsToDisallowedDomain(request: HttpRequest<unknown>): boolean {
        if (!this.allowedDomains) {
            return false;
        }
        const domain: string = this.getDomainFromUrl(request.url);
        if (this.allowedDomains.includes(domain)) {
            return false;
        }
        return true;
    }

    /**
     * Gets a normalized domain from an url.
     * Is used for comparing the request url with the allowed domains array.
     *
     * @param url - The url to get the domain from.
     * @returns The domain of the url.
     */
    protected getDomainFromUrl(url: string): string {
        if (url.startsWith('https://')) {
            url = url.split('https://')[1];
        }
        if (url.startsWith('http://')) {
            url = url.split('http://')[1];
        }
        if (url.startsWith('www.')) {
            url = url.split('www.')[1];
        }
        url = url.split('/')[0];
        return url;
    }
}