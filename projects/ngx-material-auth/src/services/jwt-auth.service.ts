import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseToken } from '../models/base-token.model';
import { LoginData } from '../models/login-data.model';
import { InjectionToken, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const NGX_AUTH_SERVICE = new InjectionToken('Provide for the authService used eg. in guards or the login component.', {
    providedIn: 'root',
    factory: () => {
        // eslint-disable-next-line no-console
        console.error(
            // eslint-disable-next-line max-len
            'No AuthService has been provided for the token NGX_AUTH_SERVICE\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_AUTH_SERVICE,\n    useExisting: MyAuthService\n}',
        );
    },
});

const DAY_IN_MS = 86400000;

/**
 * The base class for an authentication service.
 */
export abstract class JwtAuthService<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken
> {

    /**
     * The subject of the currently stored authData.
     */
    authDataSubject: BehaviorSubject<AuthDataType | undefined>;

    /**
     * The key for the authData saved in local storage.
     */
    readonly AUTH_DATA_KEY = 'authData';

    /**
     * The duration of the token in milliseconds.
     *
     * @default 86400000 // 1 day
     */
    readonly TOKEN_DURATION_IN_MS: number = DAY_IN_MS;

    /**
     * The message to display inside a snackbar when the mail for resetting a password was sent successfully.
     */
    readonly REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'A Mail for changing your password is on its way';

    /**
     * The message to display inside a snackbar when password was reset successfully.
     */
    readonly CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'Password changed successfully!';

    /**
     * The default url for login requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_LOGIN_URL: string;
    /**
     * The default url for refresh token requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_REFRESH_TOKEN_URL: string;
    /**
     * The default url for request reset password requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_REQUEST_RESET_PASSWORD_URL: string;
    /**
     * The default url for confirm reset password requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_CONFIRM_RESET_PASSWORD_URL: string;
    /**
     * The default url for verify password reset token requests. Is used when the method doesn't provide an url.
     */
    abstract readonly API_VERIFY_RESET_PASSWORD_TOKEN_URL: string;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The currently stored authData value.
     * Contains at least the token.
     */
    get authData(): AuthDataType | undefined {
        return this.authDataSubject.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set authData(authData: AuthDataType | undefined) {
        localStorage.setItem(this.AUTH_DATA_KEY, JSON.stringify(authData));
        this.authDataSubject.next(authData);
    }

    constructor(
        protected readonly http: HttpClient,
        protected readonly snackbar: MatSnackBar,
        protected readonly zone: NgZone
    ) {
        const stringData = localStorage.getItem(this.AUTH_DATA_KEY);
        const authData = stringData ? JSON.parse(stringData) as AuthDataType : undefined;
        this.authDataSubject = new BehaviorSubject(authData);
    }

    /**
     * Login a user.
     *
     * @param loginData - The data that is sent to the server to login the user.
     * @returns A promise of the received authData.
     */
    async login(loginData: LoginData): Promise<AuthDataType> {
        this.authData = await firstValueFrom(this.http.post<AuthDataType>(this.API_LOGIN_URL, loginData));
        return this.authData;
    }

    /**
     * Logout the current user.
     */
    logout(): void {
        localStorage.removeItem(this.AUTH_DATA_KEY);
        this.authDataSubject.next(null as unknown as AuthDataType);
    }

    /**
     * Refreshes the token.
     * No data is sent to the server as the jwt in the header already contains the necessary information.
     */
    async refreshToken(): Promise<void> {
        if (!this.authData) {
            return;
        }
        // Updates the date of the token instantly. That way it is ensured that refreshToken is called only once.
        const newInvalidAfter = new Date();
        newInvalidAfter.setMilliseconds(newInvalidAfter.getMilliseconds() + this.TOKEN_DURATION_IN_MS);
        this.authData.token.expirationDate = newInvalidAfter;
        this.authData = this.authData; // refreshes subject and local storage

        const token: TokenType = await firstValueFrom(this.http.post<TokenType>(this.API_REFRESH_TOKEN_URL, {}));
        this.authData.token = token;
        this.authData = this.authData;
    }

    /**
     * Requests a new password from the server.
     * Should sent a reset-link to the given email with a one time short lived (~5 minutes) token.
     *
     * @param email - The email of the user that wants to reset his password.
     */
    async requestResetPassword(email: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(this.API_REQUEST_RESET_PASSWORD_URL, { email: email }));
        this.zone.run(() => {
            this.snackbar.open(this.REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE);
        });
    }

    /**
     * Confirms the reset of the password.
     *
     * @param newPassword - The new password.
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     */
    async confirmResetPassword(newPassword: string, resetToken: string): Promise<void> {
        const body = {
            password: newPassword,
            token: resetToken
        };
        await firstValueFrom(this.http.post<void>(this.API_CONFIRM_RESET_PASSWORD_URL, body));
        this.zone.run(() => {
            this.snackbar.open(this.CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE);
        });
    }

    /**
     * Checks if the given reset token is valid.
     *
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     * @returns Whether or not the given token is valid.
     */
    async isResetTokenValid(resetToken: string): Promise<boolean> {
        return await firstValueFrom(
            this.http.post<boolean>(this.API_VERIFY_RESET_PASSWORD_TOKEN_URL, { token: resetToken })
        );
    }

    /**
     * Checks whether or not the currently logged in user has one of the provided roles.
     *
     * @param allowedRolesValues - All roles that are allowed to do a certain thing.
     * @returns Whether or not the user has one of the provided allowed roles.
     */
    hasRole(allowedRolesValues: string[]): boolean {
        if (!this.authData) {
            return false;
        }
        if (allowedRolesValues.find(rv => this.authData?.roles.map(r => r.value).includes(rv))) {
            return true;
        }
        return false;
    }
}