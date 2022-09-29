import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

const SIX_HOURS_IN_MS = 21600000;

export const NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS = new InjectionToken<string[] | void>(
    'Used to define domains to which an jwt token should be added. This should be used to not send tokens e.g. to third party apis.',
    {
        providedIn: 'root',
        factory: () => {
            // eslint-disable-next-line no-console
            console.warn(
                // eslint-disable-next-line max-len
                'No allowedDomains have been provided for the token NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS.\nRight now every http-request adds the jwt token. It is encouraged to provide a value for this to prohibit sending jwt tokens to e.g. third party apis.\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS,\n    useValue: ["myDomain", "myOtherDomain"]\n}',
            );
        },
    }
);

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
        if (!this.authService.authData?.token) {
            return next.handle(request);
        }
        if (this.tokenNeedsToBeRefreshed()) {
            void this.authService.refreshToken();
        }
        if (!this.requestIsToAllowedDomain(request)) {
            return next.handle(request);
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

    /**
     * Checks if the request is to an allowed domain.
     *
     * @param request - The request to check.
     * @returns Whether the request is to an allowed domain or not. Defaults to true if no allowed host names were provided.
     */
    protected requestIsToAllowedDomain(request: HttpRequest<unknown>): boolean {
        if (!this.allowedDomains) {
            return true;
        }
        const domain = this.getDomainFromUrl(request.url);
        if (this.allowedDomains.includes(domain)) {
            return true;
        }
        return false;
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