/* eslint-disable jsdoc/require-jsdoc */
import { Component, Inject } from '@angular/core';
import { NGX_AUTH_SERVICE } from 'ngx-material-auth';
import { CustomAuthData, CustomAuthService } from '../../services/custom-auth.service';

type UserIds = '1' | '2';

const userAuthData: CustomAuthData[] = [
    {
        superUser: false,
        roles: [
            {
                displayName: 'User',
                value: 'user'
            }
        ],
        userId: '1',
        token: {
            additionalValue: 'User #1',
            value: 'my-token-1',
            expirationDate: new Date()
        }
    },
    {
        superUser: false,
        roles: [
            {
                displayName: 'Administrator',
                value: 'admin'
            }
        ],
        userId: '2',
        token: {
            additionalValue: 'User #2',
            value: 'my-token-2',
            expirationDate: new Date()
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
        this.authService.logout();
    }
}