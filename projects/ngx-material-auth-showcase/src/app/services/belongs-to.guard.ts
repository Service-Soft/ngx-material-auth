/* eslint-disable jsdoc/require-jsdoc */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BaseRole, JwtBelongsToGuard } from 'ngx-material-auth';
import { CustomAuthData, CustomAuthService, CustomToken, Roles } from './custom-auth.service';

@Injectable({ providedIn: 'root' })
export class BelongsToUserGuard extends JwtBelongsToGuard<CustomAuthData, CustomToken, Roles, BaseRole<Roles>, CustomAuthService> {

    constructor(
        private readonly angularRouter: Router,
        private readonly customAuthService: CustomAuthService
    ) {
        super(angularRouter, customAuthService);
    }

    protected getBelongsToForRoute(route: ActivatedRouteSnapshot): boolean {
        if (!this.customAuthService.authData?.userId) {
            return false;
        }
        const allowedUserIds: string[] | undefined = route.data['allowedUserIds'] as string[] | undefined;
        if (!allowedUserIds?.length) {
            return false;
        }
        if (allowedUserIds.find(id => id === this.customAuthService.authData?.userId)) {
            return true;
        }
        return false;
    }
}