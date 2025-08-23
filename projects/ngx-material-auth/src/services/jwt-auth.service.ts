import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, InjectionToken, NgZone, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';

import { NgxMatAuthErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { NgxMatAuthSetupTwoFactorDialogComponent } from '../components/setup-two-factor-dialog/setup-two-factor-dialog.component';
import { SetupTwoFactorDialogConfig } from '../components/setup-two-factor-dialog/setup-two-factor-dialog.config';
import { NgxMatAuthTwoFactorDialogComponent } from '../components/two-factor-dialog/two-factor-dialog.component';
import { TwoFactorDialogConfig } from '../components/two-factor-dialog/two-factor.dialog.config';
import { BaseAuthData, BiometricCredentials } from '../models/base-auth-data.model';
import { BaseRole } from '../models/base-role.model';
import { BaseToken } from '../models/base-token.model';
import { ErrorData } from '../models/error-data.model';
import { LoginData } from '../models/login-data.model';
import { WebauthnUtilities, PublicKeyCredentialCreationOptions, BiometricRegistrationResponse, ConfirmBiometricRegistrationResponse, AuthenticationResponse, PublicKeyCredentialRequestOptions } from '../utilities/webauthn.utilities';

/**
 * Injection Token for the auth service.
 */
// eslint-disable-next-line typescript/no-explicit-any
export const NGX_AUTH_SERVICE: InjectionToken<JwtAuthService<any, any, any, any>> = new InjectionToken<JwtAuthService<any, any, any, any>>(
    'Provider for the authService used eg. in guards or the login component.',
    {
        providedIn: 'root',
        factory: (() => {
            // eslint-disable-next-line no-console
            console.error(
                // eslint-disable-next-line stylistic/max-len
                'No AuthService has been provided for the token NGX_AUTH_SERVICE\nAdd this to your app.module.ts provider array:\n{\n    provide: NGX_AUTH_SERVICE,\n    useExisting: MyAuthService\n}'
            );
            // eslint-disable-next-line typescript/no-explicit-any
        }) as unknown as () => JwtAuthService<any, any, any, any>
    }
);

const ONE_HUNDRED_DAYS_IN_MS: number = 8640000000;
const HOUR_IN_MS: number = 3600000;

/**
 * The response with the qr code url to enable 2fa.
 */
export interface TwoFactorUrlResponse {
    /**
     * The totp qr code url.
     */
    url: string
}

/**
 * The response that is sent when logging in requires a 2fa code.
 */
export interface RequireTwoFactorResponse {
    /**
     * Notice that the login process requires a 2fa code.
     */
    require2fa: boolean
}

/**
 * The Response vor verifying a password reset token.
 */
export interface VerifyResetTokenResponse {
    /**
     * Whether or not the provided reset token is valid.s.
     */
    isValid: boolean
}

/**
 * The response sent to a user logging in when he is required to change his password.
 */
export interface RequirePasswordChangeResponse {
    /**
     * Whether or not the user is required to change his password.
     */
    requirePasswordChange: boolean
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
    readonly authDataSubject: BehaviorSubject<AuthDataType | undefined>;

    /**
     * Subject to check if the access token is currently being refreshed.
     */
    readonly isRefreshingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * The key for the authData saved in local storage.
     */
    readonly AUTH_DATA_KEY: string = 'authData';

    /**
     * The key for the biometricCredentials saved in local storage.
     */
    readonly BIOMETRIC_CREDENTIALS_KEY: string = 'biometricCredentials';

    /**
     * The duration of the access token in milliseconds.
     * @default 3600000 // 1 hour
     */
    readonly ACCESS_TOKEN_DURATION_IN_MS: number = HOUR_IN_MS;

    /**
     * The duration of the refresh token in milliseconds.
     * @default 8640000000 // 100 days
     */
    readonly REFRESH_TOKEN_DURATION_IN_MS: number = ONE_HUNDRED_DAYS_IN_MS;

    /**
     * The route for requesting a password change.
     * @default '/request-reset-password'
     */
    readonly REQUEST_RESET_PASSWORD_ROUTE: string = '/request-reset-password';

    /**
     * The message to display inside a snackbar when the mail for resetting a password was sent successfully.
     * @default 'A Mail for changing your password is on its way'
     */
    readonly REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'A Mail for changing your password is on its way';

    /**
     * The message to display inside a snackbar when password was reset successfully.
     * @default 'Password changed successfully!'
     */
    readonly CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE: string = 'Password changed successfully!';

    /**
     * The name of the custom header that is used to transport two factor codes.
     * @default 'X-Authorization-2FA'
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
     * @default '/login'
     */
    readonly ROUTE_AFTER_LOGOUT: string = '/login';

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
    /**
     * The api url for turning off two factor authentication.
     */
    abstract readonly API_TURN_OFF_TWO_FACTOR_URL: string;
    /**
     * The api url for registering a biometric credential.
     */
    abstract readonly API_REGISTER_BIOMETRIC_CREDENTIAL: string;
    /**
     * The api url for confirming the registration of a biometric credential.
     */
    abstract readonly API_CONFIRM_REGISTER_BIOMETRIC_CREDENTIAL: string;
    /**
     * The api url for getting all possible biometric credentials.
     */
    abstract readonly API_GENERATE_BIOMETRIC_AUTHENTICATION_OPTIONS: string;
    /**
     * The api url for canceling the registration of a biometric credential.
     */
    abstract readonly API_CANCEL_REGISTER_BIOMETRIC_CREDENTIAL: string;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The currently stored authData value.
     * Contains at least the token.
     */
    get authData(): AuthDataType | undefined {
        return this.authDataSubject.value;
    }

    set authData(value: AuthDataType | undefined) {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        value = this.transformAuthDataBeforeSetting(value);
        localStorage.setItem(this.AUTH_DATA_KEY, JSON.stringify(value));
        if (!value) {
            localStorage.removeItem(this.AUTH_DATA_KEY);
        }
        if (value?.biometricCredentials?.length) {
            this.biometricCredentials = value.biometricCredentials;
        }
        this.authDataSubject.next(value);
    }

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The biometricCredentials saved in local storage.
     * This is separated from the auth data because it's also needed when the user is logged out.
     */
    get biometricCredentials(): BiometricCredentials[] {
        if (!isPlatformBrowser(this.platformId)) {
            return [];
        }
        const jsonString: string | null = localStorage.getItem(this.BIOMETRIC_CREDENTIALS_KEY);
        if (!jsonString) {
            return [];
        }
        return JSON.parse(jsonString) as BiometricCredentials[];
    }

    set biometricCredentials(value: BiometricCredentials[] | undefined) {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        localStorage.setItem(this.BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(value));
        if (!value) {
            localStorage.removeItem(this.BIOMETRIC_CREDENTIALS_KEY);
        }
    }

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * Whether or not the access token is currently being refreshed.
     */
    get isRefreshing(): boolean {
        return this.isRefreshingSubject.value;
    }

    constructor(
        protected readonly http: HttpClient,
        protected readonly snackbar: MatSnackBar,
        protected readonly zone: NgZone,
        protected readonly router: Router,
        protected readonly dialog: MatDialog,
        @Inject(PLATFORM_ID)
        protected readonly platformId: Object
    ) {
        if (!isPlatformBrowser(platformId)) {
            this.authDataSubject = new BehaviorSubject<AuthDataType | undefined>(undefined);
            return;
        }
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
     * @param authData - The auth data that should be set.
     * @returns The transformed auth data or undefined.
     */
    protected transformAuthDataBeforeSetting(authData: AuthDataType | undefined): AuthDataType | undefined {
        if (!authData) {
            return undefined;
        }
        if (typeof authData.roles[0] === 'string') {
            authData.roles = (authData.roles as unknown as RoleValue[]).map(r => {
                return {
                    displayName: r,
                    value: r
                };
            }) as unknown as Role[];
        }
        return authData;
    }

    /**
     * Login a user.
     * @param loginData - The data that is sent to the server to login the user.
     * @returns A promise of the received authData.
     */
    async login(loginData: LoginData | AuthenticationResponse): Promise<AuthDataType> {
        const res: AuthDataType | RequireTwoFactorResponse | RequirePasswordChangeResponse = await firstValueFrom(
            this.http.post<AuthDataType | RequireTwoFactorResponse | RequirePasswordChangeResponse>(this.API_LOGIN_URL, loginData)
        );
        if (this.isAuthDataType(res)) {
            this.authData = res;
            return this.authData;
        }
        if (this.isRequirePasswordChangeType(res)) {
            await this.openChangePasswordDialog();
            await this.router.navigateByUrl(this.REQUEST_RESET_PASSWORD_ROUTE);
            throw new Error('You are required to reset your password.');
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

    private async openChangePasswordDialog(): Promise<void> {
        const data: ErrorData = {
            name: 'Password change required',
            message: 'You are required to reset your password.'
        };
        const dialogRef: MatDialogRef<NgxMatAuthErrorDialogComponent, void> = this.dialog.open(
            NgxMatAuthErrorDialogComponent,
            {
                data: data,
                disableClose: true,
                restoreFocus: false
            }
        );
        await firstValueFrom(dialogRef.afterClosed());
    }

    private isRequirePasswordChangeType(
        res: RequireTwoFactorResponse | RequirePasswordChangeResponse
    ): res is RequirePasswordChangeResponse {
        return !!(res as RequirePasswordChangeResponse).requirePasswordChange;
    }

    /**
     * Opens a two factor dialog with the given configuration data and returns the code that has been input.
     * @param data - Configuration data for the dialog.
     * @returns The input two factor code or undefined if the dialog was closed with cancel.
     */
    async openInput2FADialog(data?: Partial<TwoFactorDialogConfig>): Promise<string | undefined> {
        const dialogRef: MatDialogRef<NgxMatAuthTwoFactorDialogComponent, string> = this.dialog.open(
            NgxMatAuthTwoFactorDialogComponent,
            {
                data: data,
                disableClose: true,
                restoreFocus: false
            }
        );
        return firstValueFrom(dialogRef.afterClosed());
    }

    private isAuthDataType(value: AuthDataType | RequireTwoFactorResponse | RequirePasswordChangeResponse): value is AuthDataType {
        return !!(value as AuthDataType).userId;
    }

    /**
     * Logout the current user.
     */
    async logout(): Promise<void> {
        if (!this.authData) {
            await this.router.navigateByUrl(this.ROUTE_AFTER_LOGOUT);
            return;
        }
        const refreshTokenValue: string = this.authData.refreshToken.value;
        this.authData = undefined;
        await firstValueFrom(this.http.post<void>(this.API_LOGOUT_URL, { refreshToken: refreshTokenValue }));
        await this.router.navigateByUrl(this.ROUTE_AFTER_LOGOUT);
    }

    /**
     * Refreshes the token.
     */
    async refreshToken(): Promise<void> {
        if (!this.authData) {
            return;
        }
        if (this.isRefreshing) {
            await firstValueFrom(this.isRefreshingSubject.asObservable().pipe(filter(v => !v)));
            return;
        }
        this.isRefreshingSubject.next(true);
        try {
            this.authData = await firstValueFrom(
                this.http.post<AuthDataType>(this.API_REFRESH_TOKEN_URL, { refreshToken: this.authData.refreshToken.value })
            );
            this.isRefreshingSubject.next(false);
        }
        catch (error) {
            this.isRefreshingSubject.next(false);
            await this.logout();
            throw error;
        }
    }

    /**
     * Requests a new password from the server.
     * Should sent a reset-link to the given email with a one time short lived (~5 minutes) token.
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
     * @param newPassword - The new password.
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     */
    async confirmResetPassword(newPassword: string, resetToken: string): Promise<void> {
        await firstValueFrom(this.http.post<void>(this.API_CONFIRM_RESET_PASSWORD_URL, {
            password: newPassword,
            resetToken: resetToken
        }));
        this.zone.run(() => {
            this.snackbar.open(this.CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE, undefined, { duration: 5000 });
        });
    }

    /**
     * Checks if the given reset token is valid.
     * @param resetToken - The token from the email. Needed to authorize the password reset.
     * @returns Whether or not the given token is valid.
     */
    async isResetTokenValid(resetToken: string): Promise<boolean> {
        const res: VerifyResetTokenResponse = await firstValueFrom(
            this.http.post<VerifyResetTokenResponse>(this.API_VERIFY_RESET_PASSWORD_TOKEN_URL, { value: resetToken })
        );
        return res.isValid;
    }

    /**
     * Checks whether or not the currently logged in user has one of the provided roles.
     * @param allowedRolesValues - All roles that are allowed to do a certain thing.
     * @returns Whether or not the user has one of the provided allowed roles.
     */
    hasRole(allowedRolesValues: RoleValue[]): boolean {
        const data: AuthDataType | undefined = this.authData;
        if (!data) {
            return false;
        }
        return !!allowedRolesValues.find(rv => data.roles.map(r => r.value).includes(rv));
    }

    /**
     * Generates a qr code url to setup 2fa in eg. Google Authenticator.
     * @returns The response with the qr code url.
     */
    async turnOn2FA(): Promise<TwoFactorUrlResponse> {
        return firstValueFrom(this.http.post<TwoFactorUrlResponse>(this.API_TURN_ON_TWO_FACTOR_URL, undefined));
    }

    /**
     * Opens the dialog to turn on 2fa. The dialog displays a qr code and an input to confirm with a two factor code.
     * @param data - Configuration data for the dialog.
     */
    openTurnOn2FADialog(data?: Partial<SetupTwoFactorDialogConfig>): void {
        this.dialog.open(NgxMatAuthSetupTwoFactorDialogComponent, {
            data: data,
            disableClose: true,
            restoreFocus: false
        });
    }

    /**
     * Confirms turning on two factor authentication.
     * Sends the provided two factor code to the configured endpoint.
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
        this.authData = {
            ...(this.authData as AuthDataType),
            twoFactorEnabled: true
        };
    }

    /**
     * Turns off two factor authentication for the current user.
     */
    async turnOff2FA(): Promise<void> {
        await firstValueFrom(this.http.post<void>(this.API_TURN_OFF_TWO_FACTOR_URL, undefined));
        if (this.authData) {
            this.authData = {
                ...this.authData,
                twoFactorEnabled: false
            };
        }
    }

    /**
     * Registers a new biometric credential for the currently logged in user.
     */
    async registerBiometricCredential(): Promise<void> {
        if (!this.authData) {
            // eslint-disable-next-line no-console
            console.error('Registering new biometric credentials is only possible when already logged in');
            return;
        }
        if (!WebauthnUtilities.browserSupportsWebAuthn()) {
            // eslint-disable-next-line no-console
            console.error('The current browser does not support webauthn.');
            return;
        }
        const options: PublicKeyCredentialCreationOptions = await firstValueFrom(
            this.http.post<PublicKeyCredentialCreationOptions>(this.API_REGISTER_BIOMETRIC_CREDENTIAL, undefined)
        );
        try {
            const registrationResponse: BiometricRegistrationResponse = await WebauthnUtilities.startRegistration(options);
            const confirmRegistrationResponse: ConfirmBiometricRegistrationResponse = await firstValueFrom(
                this.http.post<ConfirmBiometricRegistrationResponse>(
                    `${this.API_CONFIRM_REGISTER_BIOMETRIC_CREDENTIAL}/${options.challenge}`,
                    registrationResponse
                )
            );
            if (!confirmRegistrationResponse.verified) {
                // TODO: How should this be handled?
                throw new Error('Could not register a biometric credential');
            }
            this.authData = {
                ...this.authData,
                biometricCredentials: confirmRegistrationResponse.biometricCredentials
            };
        }
        catch (error) {
            await firstValueFrom(this.http.delete(`${this.API_CANCEL_REGISTER_BIOMETRIC_CREDENTIAL}/${options.challenge}`));
            throw error;
        }
    }

    /**
     * Tries to login with biometric authentication.
     */
    async loginWithBiometricAuthentication(): Promise<void> {
        if (!this.biometricCredentials.length) {
            return;
        }
        const options: PublicKeyCredentialRequestOptions = await firstValueFrom(
            this.http.get<PublicKeyCredentialRequestOptions>(
                `${this.API_GENERATE_BIOMETRIC_AUTHENTICATION_OPTIONS}/${this.biometricCredentials[0].baseUserId}`
            )
        );
        const authenticationResponse: AuthenticationResponse = await WebauthnUtilities.startAuthentication(options);
        await this.login(authenticationResponse);
    }
}