import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { NgxMatAuthErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseRole } from '../models/base-role.model';
import { BaseToken } from '../models/base-token.model';
import { ErrorData } from '../models/error-data.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../services/jwt-auth.service';

/**
 * Interceptor that does error handling for http requests.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    TokenType extends BaseToken,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    AuthServiceType extends JwtAuthService<AuthDataType, RoleValue, Role, TokenType>
> implements HttpInterceptor {

    /**
     * The message to display when the user has no internet connection.
     */
    protected readonly NO_INTERNET_CONNECTION_ERROR_MESSAGE: string = 'No Internet Connection.<br>Please try again later.';

    /**
     * The message to display when an error with CORS occurs.
     */
    protected readonly CORS_ERROR_MESSAGE: string = 'CORS Error<br>Check your console for more information.';

    /**
     * All error codes for which the user should be logged out.
     */
    protected readonly logoutStatuses: number[] = [
        HttpStatusCode.Unauthorized,
        HttpStatusCode.Forbidden
    ];

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * Any api urls for which the user shouldn't be logged out.
     * Eg. The login page.
     */
    protected get apiUrlsWithNoLogout(): string[] {
        return [
            this.authService.API_TURN_ON_TWO_FACTOR_URL,
            this.authService.API_CONFIRM_TURN_ON_TWO_FACTOR_URL
        ];
    }

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
                    void this.authService.logout();
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected errorDialogShouldBeDisplayed(error: HttpErrorResponse, request: HttpRequest<unknown>): boolean {
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
        if (error.error != null && typeof error.error === 'object') {
            return this.getErrorDataMessage(error.error as HttpErrorResponse);
        }

        if (error.message) {
            return error.message;
        }
        if (this.isCORSError(error)) {
            if (!window.navigator.onLine) {
                return this.NO_INTERNET_CONNECTION_ERROR_MESSAGE;
            }
            return this.CORS_ERROR_MESSAGE;
        }
        return JSON.stringify(error);
    }

    /**
     * Checks if the provided error has something to do with CORS.
     *
     * @param error - The error to check.
     * @returns Whether or not the provided error has something to do with CORS.
     */
    protected isCORSError(error: HttpErrorResponse): boolean {
        const stringifiedError: string = JSON.stringify(error);
        return stringifiedError === JSON.stringify({ isTrusted: true })
            || stringifiedError === JSON.stringify({ isTrusted: false });
    }
}