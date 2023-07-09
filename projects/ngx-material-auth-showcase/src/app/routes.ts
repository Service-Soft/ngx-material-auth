import { inject } from '@angular/core';
import { FooterRow, NavElementTypes, NavbarRow } from 'ngx-material-navigation';
import { CustomAuthService } from './services/custom-auth.service';

export const navbarRows: NavbarRow[] = [
    {
        elements: [
            {
                type: NavElementTypes.INTERNAL_LINK,
                route: '',
                icon: 'fas fa-home',
                name: 'Home',
                collapse: 'never'
            },
            {
                type: NavElementTypes.INTERNAL_LINK,
                route: 'login',
                icon: 'fas fa-user',
                name: 'Login',
                collapse: 'sm'
            },
            {
                type: NavElementTypes.MENU,
                icon: 'fas fa-lock',
                name: 'Restricted Routes',
                collapse: 'sm',
                elements: [
                    {
                        type: NavElementTypes.INTERNAL_LINK,
                        name: 'Logged In Guard',
                        route: 'guards/logged-in'
                    },
                    {
                        type: NavElementTypes.INTERNAL_LINK,
                        name: 'Role Guard',
                        route: 'guards/role'
                    },
                    {
                        type: NavElementTypes.INTERNAL_LINK,
                        name: 'Belongs To Guard',
                        route: 'guards/belongs-to'
                    }
                ]
            },
            {
                type: NavElementTypes.INTERNAL_LINK,
                route: 'interceptors',
                name: 'Interceptors',
                collapse: 'sm'
            },
            {
                type: NavElementTypes.BUTTON,
                name: 'Setup 2FA',
                action: setup2FA,
                condition: isLoggedIn
            }
        ]
    }
];

export const footerRows: FooterRow[] = [
    {
        elements: [
            {
                type: NavElementTypes.TITLE,
                title: 'NGX-MATERIAL-AUTH',
                position: 'center'
            }
        ]
    }
];

// eslint-disable-next-line jsdoc/require-jsdoc
function setup2FA(): void {
    const service: CustomAuthService = inject(CustomAuthService);
    service.openTurnOn2FADialog();
}

// eslint-disable-next-line jsdoc/require-jsdoc
function isLoggedIn(): boolean {
    const service: CustomAuthService = inject(CustomAuthService);
    return !!service.authData;
}