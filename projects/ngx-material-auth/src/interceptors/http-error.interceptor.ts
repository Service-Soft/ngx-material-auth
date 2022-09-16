import { Router } from '@angular/router';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { ErrorData } from '../models/error-data.model';
import { NgxMatAuthErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Inject, Injectable } from '@angular/core';

/**
 * Interceptor that does error handling for every error that isn't treated locally.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements HttpInterceptor {

    /**
     * The route to which the user gets redirected to after he triggers an error which should log him out (eg. 401 Unauthorized).
     */
    protected readonly ROUTE_AFTER_LOGOUT = '/';

    /**
     * All error codes for which the user should be logged out.
     */
    protected readonly logoutStatuses: number[] = [
        HttpStatusCode.Unauthorized,
        HttpStatusCode.Forbidden
    ];

    /**
     * Any api urls for which the user shouldn't be logged out.
     * Eg. The login page.
     */
    protected readonly apiUrlsWithNoLogout: string[] = [];

    constructor(
        protected readonly router: Router,
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        protected readonly dialog: MatDialog
    ) { }

    /**
     * The main method used by angular to intercept any http-requests with errors.
     * Displays an error message to the user and logs him out if requested.
     *
     * @param request - The http-request that was intercepted.
     * @param next - The next http-handler in angular's chain.
     * @returns An Observable that is used by angular in the intercept chain.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (this.userShouldBeLoggedOut(error, request)) {
                    this.authService.logout();
                    void this.router.navigate([this.ROUTE_AFTER_LOGOUT], {});
                }
                if (this.errorDialogShouldBeDisplayed(error, request)) {
                    const errorData: ErrorData = { name: 'HTTP-Error', message: this.getErrorDataMessage(error) };
                    this.dialog.open(NgxMatAuthErrorDialogComponent, { data: errorData, autoFocus: false, restoreFocus: false });
                }
                return throwError(() => error);
            })
        );
    }

    /**
     * Checks if the user should be logged out after triggering the provided error.
     *
     * @param error - The http-error that came from the api.
     * @param request - Data about the request that caused the error.
     * @returns Whether or not the current user should be logged out.
     */
    protected userShouldBeLoggedOut(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
        if (this.apiUrlsWithNoLogout.find(url => url === request.url)) {
            return false;
        }
        return !!this.logoutStatuses.find(s => s === error.status);
    }

    /**
     * Checks if an dialog for the given error should be displayed to the user.
     *
     * @param error - The http-error that was thrown.
     * @param request - Data about the request that caused the error.
     * @returns Whether or not an dialog should be displayed for the error.
     */
    protected errorDialogShouldBeDisplayed(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
        if (request.url === this.authService.API_REFRESH_TOKEN_URL) {
            return false;
        }
        return true;
    }

    /**
     * Gets the message from the HttpError.
     * Prefers the most nested one.
     *
     * @param error - The http-error that was thrown.
     * @returns The message of the http-error.
     */
    protected getErrorDataMessage(error: HttpErrorResponse): string {
        if (error.error != null) {
            return this.getErrorDataMessage(error.error as HttpErrorResponse);
        }

        if (typeof error === 'string') {
            return error as string;
        }
        if (error.message) {
            return error.message;
        }
        return JSON.stringify(error);
    }
}