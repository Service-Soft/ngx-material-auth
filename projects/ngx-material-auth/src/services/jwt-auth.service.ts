import { HttpClient } from '@angular/common/http';
import { InjectionToken, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { NgxMatAuthSetupTwoFactorDialogComponent } from '../components/setup-two-factor-dialog/setup-two-factor-dialog.component';
import { SetupTwoFactorDialogConfig } from '../components/setup-two-factor-dialog/setup-two-factor-dialog.config';
import { NgxMatAuthTwoFactorDialogComponent } from '../components/two-factor-dialog/two-factor-dialog.component';
import { TwoFactorDialogConfig } from '../components/two-factor-dialog/two-factor.dialog.config';
import { BaseAuthData } from '../models/base-auth-data.model';
import { BaseRole } from '../models/base-role.model';
import { BaseToken } from '../models/base-token.model';
import { LoginData } from '../models/login-data.model';

// eslint-disable-next-line @typescript-eslint/typedef
export const NGX_AUTH_SERVICE = new InjectionToken(
    'Provide for the authService used eg. in guards or the login component.',
    {
        providedIn: 'root',
        factory: () => {
            // eslint-disable-next-line no-console
            console.error(
                // eslint-disable-next-line max-len
                'No AuthService has been provided for the token NGX_AUTH_SERVICE\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_AUTH_SERVICE,\n    useExisting: MyAuthService\n}'
            );
        }
    }
);

const ONE_HUNDRED_DAYS_IN_MS: number = 8640000000;
const HOUR_IN_MS: number = 3600000;

/**
 * The response with the qr code url to enable 2fa.
 */
interface TwoFactorUrlResponse {
    /**
     * The totp qr code url.
     */
    url: string
}

/**
 * The response that is sent when logging in requires a 2fa code.
 */
interface RequireTwoFactorResponse {
    /**
     * Notice that the login process requires a 2fa code.
     */
    require2fa: boolean
}

/**
 * The base class for an authentication service.
 */
export abstract class JwtAuthService<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    TokenType extends BaseToken
> {
    /**
     * The subject of the currently stored authData.
     */
    authDataSubject: BehaviorSubject<AuthDataType | undefined>;

    /**
     * The key for the authData saved in local storage.
     */
    readonly AUTH_DATA_KEY: string = 'authData';

    /**
     * The duration of the access token in milliseconds.
     *
     * @default 3600000 // 1 hour
     */
    readonly ACCESS_TOKEN_DURATION_IN_MS: number = HOUR_IN_MS;

    /**
     * The duration of the refresh token in milliseconds.
     *
     * @default 8640000000 // 100 days
     */
    readonly REFRESH_TOKEN_DURATION_IN_MS: number = ONE_HUNDRED_DAYS_IN_MS;

    /**
     * The message to display inside a snackbar when the mail for resetting a password was sent successfully.
     */
    readonly REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'A Mail for changing your password is on its way';

    /**
     * The message to display inside a snackbar when password was reset successfully.
     */
    readonly CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'Password changed successfully!';

    /**
     * The name of the custom header that is used to transport two factor codes.
     */
    readonly TWO_FACTOR_HEADER: string = 'X-Authorization-2FA';

    /**
     * The default url for login requests.
     */
    abstract readonly API_LOGIN_URL: string;

    /**
     * The default url for logout requests.
     */
    abstract readonly API_LOGOUT_URL: string;

    /**
     * When the user tries to access a route for which he doesn't have the permission and is logged out
     * he gets redirected to this route afterwards.
     */
    protected readonly ROUTE_AFTER_LOGOUT: string = '/login';

    /**
     * The default url for refresh token requests.
     */
    abstract readonly API_REFRESH_TOKEN_URL: string;

    /**
     * The default url for request reset password requests.
     */
    abstract readonly API_REQUEST_RESET_PASSWORD_URL: string;

    /**
     * The default url for confirm reset password requests.
     */
    abstract readonly API_CONFIRM_RESET_PASSWORD_URL: string;

    /**
     * The default url for verify password reset token requests.
     */
    abstract readonly API_VERIFY_RESET_PASSWORD_TOKEN_URL: string;

    /**
     * The api url for turning on two factor authentication. Needs to return a qr code url.
     */
    abstract readonly API_TURN_ON_TWO_FACTOR_URL: string;
    /**
     * The api url to confirm turning on two factor authentication.
     */
    abstract readonly API_CONFIRM_TURN_ON_TWO_FACTOR_URL: string;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The currently stored authData value.
     * Contains at least the token.
     */
    get authData(): AuthDataType | undefined {
        return this.authDataSubject.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set authData(value: AuthDataType | undefined) {
        value = this.transformAuthDataBeforeSetting(value);
        localStorage.setItem(this.AUTH_DATA_KEY, JSON.stringify(value));
        if (!value) {
            localStorage.removeItem(this.AUTH_DATA_KEY);
        }
        this.authDataSubject.next(value);
    }

    constructor(
        protected readonly http: HttpClient,
        protected readonly snackbar: MatSnackBar,
        protected readonly zone: NgZone,
        protected readonly router: Router,
        protected readonly dialog: MatDialog
    ) {
        const stringData: string | null = localStorage.getItem(this.AUTH_DATA_KEY);
        const authData: AuthDataType | undefined = stringData ? JSON.parse(stringData) as AuthDataType : undefined;
        this.authDataSubject = new BehaviorSubject(authData);
    }

    /**
     * Gets called right before auth data is set.
     * Can be used to transform some of the data.
     *
     * DEFAULT: When the api sends roles as a list of strings instead of Role objects,
     * they are transformed to role objects with displayName and value being the string send by the api.
     *
     * @param authData - The auth data that should be set.
     * @returns The transformed auth data or undefined.
     */
    protected transformAuthDataBeforeSetting(authData: AuthDataType | undefined): AuthDataType | undefined {
        if (!authData) {
            return undefined;
        }
        if (typeof authData.roles[0] === 'string') {
            authData.roles = (authData.roles as unknown as RoleValue[]).map(r => {
                return { displayName: r, value: r };
            }) as unknown as Role[];
        }
        return authData;
    }

    /**
     * Login a user.
     *
     * @param loginData - The data that is sent to the server to login the user.
     * @returns A promise of the received authData.
     */
    async login(loginData: LoginData): Promise<AuthDataType> {
        const res: AuthDataType | RequireTwoFactorResponse = await firstValueFrom(
            this.http.post<AuthDataType | RequireTwoFactorResponse>(this.API_LOGIN_URL, loginData)
        );
        if (this.isAuthDataType(res)) {
            this.authData = res;
            return this.authData;
        }
        const code: string | undefined = await this.openInput2FADialog();
        if (!code) {
            throw new Error('No two factor code has been provided.');
        }
        this.authData = await firstValueFrom(
            this.http.post<AuthDataType>(this.API_LOGIN_URL, loginData, { headers: { [this.TWO_FACTOR_HEADER]: code } })
        );
        return this.authData;
    }

    /**
     * Opens a two factor dialog with the given configuration data and returns the code that has been input.
     *
     * @param data - Configuration data for the dialog.
     * @returns The input two factor code or undefined if the dialog was closed with cancel.
     */
    async openInput2FADialog(data?: Partial<TwoFactorDialogConfig>): Promise<string | undefined> {
        const dialogRef: MatDialogRef<NgxMatAuthTwoFactorDialogComponent> = this.dialog.open(
            NgxMatAuthTwoFactorDialogComponent,
            { data: data, disableClose: true, restoreFocus: false }
        );
        return firstValueFrom<string | undefined>(dialogRef.afterClosed() as Observable<string | undefined>);
    }

    private isAuthDataType(value: AuthDataType | RequireTwoFactorResponse): value is AuthDataType {
        return !!(value as AuthDataType).userId;
    }

    /**
     * Logout the current user.o.
     */
    async logout(): Promise<void> {
        if (!this.authData) {
            return;
        }
        const refreshTokenValue: string = this.authData.refreshToken.value;
        this.authData = undefined;
        await firstValueFrom(this.http.post<void>(this.API_LOGOUT_URL, { refreshToken: refreshTokenValue }));
        void this.router.navigate([this.ROUTE_AFTER_LOGOUT], {});
    }

    /**
     * Refreshes the token.
     */
    async refreshToken(): Promise<void> {
        if (!this.authData) {
            return;
        }
        this.authData = await firstValueFrom(
            this.http.post<AuthDataType>(this.API_REFRESH_TOKEN_URL, { refreshToken: this.authData.refreshToken.value })
        );
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
            this.snackbar.open(this.REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE, undefined, { duration: 5000 });
        });
    }

    /**
     * Confirms the reset of the password.
     *
     * @param newPassword - The new password.
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     */
    async confirmResetPassword(newPassword: string, resetToken: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(this.API_CONFIRM_RESET_PASSWORD_URL, { password: newPassword, resetToken: resetToken }));
        this.zone.run(() => {
            this.snackbar.open(this.CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE, undefined, { duration: 5000 });
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
            this.http.post<boolean>(this.API_VERIFY_RESET_PASSWORD_TOKEN_URL, { value: resetToken })
        );
    }

    /**
     * Checks whether or not the currently logged in user has one of the provided roles.
     *
     * @param allowedRolesValues - All roles that are allowed to do a certain thing.
     * @returns Whether or not the user has one of the provided allowed roles.
     */
    hasRole(allowedRolesValues: RoleValue[]): boolean {
        if (!this.authData) {
            return false;
        }
        if (allowedRolesValues.find(rv => this.authData?.roles.map(r => r.value).includes(rv))) {
            return true;
        }
        return false;
    }

    /**
     * Generates a qr code url to setup 2fa in eg. Google Authenticator.
     *
     * @returns The response with the qr code url.
     */
    async turnOn2FA(): Promise<TwoFactorUrlResponse> {
        return await firstValueFrom(this.http.post<TwoFactorUrlResponse>(this.API_TURN_ON_TWO_FACTOR_URL, undefined));
    }

    /**
     * Opens the dialog to turn on 2fa. The dialog displays a qr code and an input to confirm with a two factor code.
     *
     * @param data - Configuration data for the dialog.
     */
    openTurnOn2FADialog(data?: Partial<SetupTwoFactorDialogConfig>): void {
        this.dialog.open(NgxMatAuthSetupTwoFactorDialogComponent, { data: data, disableClose: true, restoreFocus: false });
    }

    /**
     * Confirms turning on two factor authentication.
     * Sends the provided two factor code to the configured endpoint.
     *
     * @param twoFactorCode - The two factor code that the user generated using eg. Google Authenticator.
     */
    async confirmTurnOn2FA(twoFactorCode: string): Promise<void> {
        await firstValueFrom(
            this.http.post<void>(
                this.API_CONFIRM_TURN_ON_TWO_FACTOR_URL,
                undefined,
                { headers: { [this.TWO_FACTOR_HEADER]: twoFactorCode } }
            )
        );
        // @ts-ignore
        this.authData = {
            ...this.authData,
            twoFactorEnabled: true
        };
    }
}