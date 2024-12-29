import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BaseAuthData, BaseRole, BaseToken, JwtAuthService } from 'ngx-material-auth';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export enum Roles {
    USER = 'user',
    ADMIN = 'admin'
}

export interface CustomToken extends BaseToken {
    additionalValue: string
}

export interface CustomAuthData extends BaseAuthData<CustomToken, Roles, BaseRole<Roles>> {
    superUser: boolean
}

@Injectable({ providedIn: 'root' })
export class CustomAuthService extends JwtAuthService<CustomAuthData, Roles, BaseRole<Roles>, CustomToken> {
    readonly API_LOGIN_URL: string = `${environment.apiUrl}/login`;
    readonly API_LOGOUT_URL: string = `${environment.apiUrl}/logout`;
    readonly API_REFRESH_TOKEN_URL: string = `${environment.apiUrl}/refresh-token`;
    readonly API_REQUEST_RESET_PASSWORD_URL: string = `${environment.apiUrl}/request-reset-password`;
    readonly API_CONFIRM_RESET_PASSWORD_URL: string = `${environment.apiUrl}/confirm-reset-password`;
    readonly API_VERIFY_RESET_PASSWORD_TOKEN_URL: string = `${environment.apiUrl}/verify-password-reset-token`;
    readonly API_TURN_ON_TWO_FACTOR_URL: string = `${environment.apiUrl}/2fa/turn-on`;
    readonly API_CONFIRM_TURN_ON_TWO_FACTOR_URL: string = `${environment.apiUrl}/2fa/confirm-turn-on`;
    readonly API_TURN_OFF_TWO_FACTOR_URL: string = `${environment.apiUrl}/2fa/confirm-turn-off`;
    readonly API_REGISTER_BIOMETRIC_CREDENTIAL: string = `${environment.apiUrl}/biometric/register`;
    readonly API_CONFIRM_REGISTER_BIOMETRIC_CREDENTIAL: string = `${environment.apiUrl}/biometric/confirm-register`;
    readonly API_GENERATE_BIOMETRIC_AUTHENTICATION_OPTIONS: string = `${environment.apiUrl}/biometric/authentication-options`;
    readonly API_CANCEL_REGISTER_BIOMETRIC_CREDENTIAL: string = `${environment.apiUrl}/biometric/cancel-register`;

    constructor(
        http: HttpClient,
        snackBar: MatSnackBar,
        ngZone: NgZone,
        router: Router,
        dialog: MatDialog,
        @Inject(PLATFORM_ID)
        platformId: Object
    ) {
        super(http, snackBar, ngZone, router, dialog, platformId);
    }

    async deleteAllBiometricCredentials(): Promise<void> {
        await firstValueFrom(this.http.delete(`${environment.apiUrl}/all-biometric-credentials`));
        this.biometricCredentials = undefined;
    }
}