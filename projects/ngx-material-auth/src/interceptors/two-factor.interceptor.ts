import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, exhaustMap, from } from 'rxjs';

import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseRole } from '../models/base-role.model';
import { BaseToken } from '../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

/**
 * Used to define urls where a two factor code is needed.
 */
export const NGX_JWT_INTERCEPTOR_RESTRICTED_URLS: InjectionToken<string[]> = new InjectionToken(
    'Used to define urls where a two factor code is needed.',
    {
        providedIn: 'root',
        factory: () => []
    }
);

/**
 * Interceptor that prompts the user for a two factor code .
 */
@Injectable()
export class TwoFactorInterceptor implements HttpInterceptor {

    constructor(
        @Inject(NGX_JWT_INTERCEPTOR_RESTRICTED_URLS)
        protected readonly restrictedUrls: string[],
        @Inject(NGX_AUTH_SERVICE)
        // eslint-disable-next-line stylistic/max-len
        protected readonly authService: JwtAuthService<BaseAuthData<BaseToken, string, BaseRole<string>>, string, BaseRole<string>, BaseToken>
    ) {}

    // eslint-disable-next-line jsdoc/require-jsdoc
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.authService.authData?.twoFactorEnabled === true && this.restrictedUrls.includes(request.url)) {
            return this.addCodeAndHandle(request, next);
        }
        return next.handle(request);
    }

    /**
     * Prompts the user for a two factor code, adds it to the given request.
     * @param request - The request that got intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns A promise of the http event stream. Needs to be returned with "from" inside the intercept method.
     */
    protected addCodeAndHandle(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return from(this.authService.openInput2FADialog()).pipe(
            exhaustMap(code => {
                if (!code) {
                    throw new Error('No two factor code has been provided.');
                }
                request = request.clone({
                    setHeaders: {
                        [this.authService.TWO_FACTOR_HEADER]: code
                    }
                });
                return next.handle(request);
            })
        );
    }
}