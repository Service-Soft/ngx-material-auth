/* eslint-disable jsdoc/require-jsdoc */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { JwtBelongsToGuard } from 'ngx-material-auth';
import { CustomAuthData, CustomAuthService, CustomToken } from './custom-auth.service';

@Injectable({ providedIn: 'root' })
export class BelongsToUserGuard extends JwtBelongsToGuard<CustomAuthData, CustomToken, CustomAuthService> {

    constructor(
        private readonly angularRouter: Router,
        private readonly customAuthService: CustomAuthService
    ) {
        super(angularRouter, customAuthService);
    }

    protected getBelongsToForRoute(route: ActivatedRouteSnapshot): boolean {
        if (!this.authService.authData?.userId) {
            return false;
        }
        const allowedUserIds: string[] | undefined = route.data['allowedUserIds'] as string[] | undefined;
        if (!allowedUserIds?.length) {
            return false;
        }
        if (allowedUserIds.find(id => id === this.authService.authData?.userId)) {
            return true;
        }
        return false;
    }
}