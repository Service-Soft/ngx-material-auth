/* eslint-disable jsdoc/require-jsdoc */
import { Component } from '@angular/core';
import { BaseRole } from 'ngx-material-auth';
import { CustomAuthData, CustomAuthService, Roles } from '../../services/custom-auth.service';

type UserIds = '1' | '2';

const expirationDate: Date = new Date(Date.now() + 1 * 24 * 60 * 60 * 60);
const expirationDateRefreshToken: Date = new Date(Date.now() + 5 * 24 * 60 * 60 * 60);

const userAuthData: CustomAuthData[] = [
    {
        superUser: false,
        roles: [
            {
                displayName: 'User',
                value: Roles.USER
            }
        ],
        userId: '1',
        accessToken: {
            additionalValue: 'User #1',
            value: 'my-token-1',
            expirationDate: expirationDate
        },
        refreshToken: {
            additionalValue: 'User #1',
            value: 'my-refresh-token-1',
            expirationDate: expirationDateRefreshToken
        }
    },
    {
        superUser: false,
        roles: [Roles.ADMIN as unknown as BaseRole<Roles>],
        userId: '2',
        accessToken: {
            additionalValue: 'User #2',
            value: 'my-token-2',
            expirationDate: expirationDate
        },
        refreshToken: {
            additionalValue: 'User #2',
            value: 'my-refresh-token-2',
            expirationDate: expirationDateRefreshToken
        }
    }
];

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    constructor(readonly authService: CustomAuthService) {

    }

    login(userId: UserIds): void {
        this.authService.authData = userAuthData.find(ad => ad.userId === userId);
    }

    logout(): void {
        void this.authService.logout();
    }
}