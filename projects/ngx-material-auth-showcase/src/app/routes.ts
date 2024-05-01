/* eslint-disable promise/prefer-await-to-then */
import { inject } from '@angular/core';
import { JwtBelongsToGuard, JwtLoggedInGuard, JwtRoleGuard } from 'ngx-material-auth';
import { FooterRow, NavElementTypes, NavbarRow, NavUtilities, NavRoute } from 'ngx-material-navigation';

import { CustomAuthService } from './services/custom-auth.service';

/**
 * The rows to display in the navbar.
 */
export const navbarRows: NavbarRow[] = [
    {
        elements: [
            {
                type: NavElementTypes.INTERNAL_LINK,
                route: {
                    title: 'Home',
                    path: '',
                    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
                },
                icon: 'fas fa-home',
                name: 'Home',
                collapse: 'never'
            },
            {
                type: NavElementTypes.INTERNAL_LINK,
                route: {
                    title: 'Login',
                    path: 'login',
                    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
                },
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
                        route: {
                            title: 'Logged In Guard',
                            path: 'guards/logged-in',
                            loadComponent: () => import('./pages/guards/logged-in/logged-in.component').then(m => m.LoggedInComponent),
                            canActivate: [JwtLoggedInGuard]
                        }
                    },
                    {
                        type: NavElementTypes.INTERNAL_LINK,
                        name: 'Role Guard',
                        route: {
                            title: 'Role Guard',
                            path: 'guards/role',
                            loadComponent: () => import('./pages/guards/role/role.component').then(m => m.RoleComponent),
                            canActivate: [JwtRoleGuard],
                            data: { allowedRoles: ['admin'] }
                        }
                    },
                    {
                        type: NavElementTypes.INTERNAL_LINK,
                        name: 'Belongs To Guard',
                        route: {
                            title: 'Belongs To Guard',
                            path: 'guards/belongs-to',
                            loadComponent: () => import('./pages/guards/belongs-to/belongs-to.component').then(m => m.BelongsToComponent),
                            canActivate: [JwtBelongsToGuard],
                            data: { allowedUserIds: ['2'] }
                        }
                    }
                ]
            },
            {
                type: NavElementTypes.INTERNAL_LINK,
                route: {
                    title: 'Interceptors',
                    path: 'interceptors',
                    loadComponent: () => import('./pages/interceptors/interceptors.component').then(m => m.InterceptorsComponent),
                    canActivate: [JwtLoggedInGuard]
                },
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

/**
 * The rows to display in the footer.
 */
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

/**
 * The routes of the project.
 */
export const routes: NavRoute[] = NavUtilities.getAngularRoutes(navbarRows, footerRows, [
    {
        title: 'Request Reset Password',
        path: 'request-reset-password',
        loadComponent: () => import('./pages/request-reset-password/request-reset-password.component').then(m => m.RequestResetPasswordComponent)
    },
    {
        title: 'Request Reset Password',
        path: 'confirm-reset-password/:token',
        loadComponent: () => import('./pages/confirm-reset-password/confirm-reset-password.component').then(m => m.ConfirmResetPasswordComponent)
    }
]);

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