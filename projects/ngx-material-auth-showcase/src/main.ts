/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable no-console */
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { HttpErrorInterceptor, JwtInterceptor, NGX_AUTH_SERVICE, NGX_GUARD_CONFIG, NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS, NgxGuardConfig } from 'ngx-material-auth';

import { AppComponent } from './app/app.component';
import { routes } from './app/routes';
import { CustomAuthService } from './app/services/custom-auth.service';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

// eslint-disable-next-line unusedImports/no-unused-vars
function getBelongsToForRouteValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authService: CustomAuthService = inject(CustomAuthService);
    if (authService.authData?.userId) {
        return false;
    }
    const allowedUserIds: string[] | undefined = route.data['allowedUserIds'] as string[] | undefined;
    if (!allowedUserIds?.length) {
        return false;
    }
    return !!allowedUserIds.find(id => id === authService.authData?.userId);
}

function urlToDomain(url: string): string {
    url = url.split('//')[1];
    return url;
}

const guardConfig: Partial<NgxGuardConfig> = {
    belongsToGuard: {
        getBelongsToForRoute: getBelongsToForRouteValue
    }
};

bootstrapApplication(
    AppComponent,
    {
        providers: [
            provideRouter(routes),
            provideAnimations(),
            provideHttpClient(withInterceptorsFromDi()),
            {
                provide: NGX_AUTH_SERVICE,
                useExisting: CustomAuthService
            },
            {
                provide: NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS,
                useValue: ['localhost:3000', urlToDomain(environment.apiUrl)]
            },
            {
                provide: NGX_GUARD_CONFIG,
                useValue: guardConfig
            },
            {
                provide: HTTP_INTERCEPTORS,
                useClass: JwtInterceptor,
                multi: true
            },
            {
                provide: HTTP_INTERCEPTORS,
                useClass: HttpErrorInterceptor,
                multi: true
            }
        ]
    }
).catch(error => console.error(error));