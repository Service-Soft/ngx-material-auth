import { BaseAuthData, BaseRole, BaseToken, LoginData } from 'projects/ngx-material-auth/src/public-api';

/* eslint-disable jsdoc/require-jsdoc */
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

export const correctLoginData: LoginData = {
    email: 'user@example.com',
    // eslint-disable-next-line cspell/spellchecker
    password: 'stringstring'
};

export const authData: CustomAuthData = {
    userId: '1',
    roles: [{
        displayName: 'User',
        value: Roles.USER
    }],
    refreshToken: {
        expirationDate: new Date(),
        value: 'refresh.token.value',
        additionalValue: 'additional value'
    },
    superUser: true,
    accessToken: {
        expirationDate: new Date(),
        value: 'access.token.value',
        additionalValue: 'additional value'
    }
};

export function refreshAccessToken(): void {
    authData.accessToken.expirationDate = new Date(Date.now() + 3600000);
}

export function refreshRefreshToken(): void {
    authData.refreshToken.expirationDate = new Date(Date.now() + 8640000000);
}