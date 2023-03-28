/* eslint-disable jsdoc/require-jsdoc */

import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BaseAuthData, BaseRole, BaseToken, JwtAuthService } from 'ngx-material-auth';
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

    constructor(
        httpClient: HttpClient,
        matSnackBar: MatSnackBar,
        ngZone: NgZone,
        router: Router
    ) {
        super(httpClient, matSnackBar, ngZone, router);
    }
}