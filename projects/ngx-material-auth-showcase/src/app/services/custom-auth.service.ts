/* eslint-disable jsdoc/require-jsdoc */

import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseAuthData, BaseToken, JwtAuthService } from 'ngx-material-auth';
import { environment } from '../../environments/environment';

export interface CustomToken extends BaseToken {
    additionalValue: string
}

export interface CustomAuthData extends BaseAuthData<CustomToken> {
    superUser: boolean
}

@Injectable({ providedIn: 'root' })
export class CustomAuthService extends JwtAuthService<CustomAuthData, CustomToken> {
    readonly API_LOGIN_URL: string = `${environment.apiUrl}/login`;
    readonly API_REFRESH_TOKEN_URL: string = `${environment.apiUrl}/refresh-token`;
    readonly API_REQUEST_RESET_PASSWORD_URL: string = `${environment.apiUrl}/request-reset-password`;
    readonly API_CONFIRM_RESET_PASSWORD_URL: string = `${environment.apiUrl}/confirm-reset-password`;
    readonly API_VERIFY_RESET_PASSWORD_TOKEN_URL: string = `${environment.apiUrl}/verify-password-reset-token`;

    constructor(
        protected readonly httpClient: HttpClient,
        protected readonly matSnackBar: MatSnackBar,
        protected readonly ngZone: NgZone
    ) {
        super(httpClient, matSnackBar, ngZone);
    }
}