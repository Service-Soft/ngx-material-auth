
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot } from '@angular/router';
import { HttpErrorInterceptor, JwtInterceptor, NGX_AUTH_SERVICE, NGX_GUARD_CONFIG, NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS, NgxGuardConfig } from 'ngx-material-auth';
import { NgxMatNavigationFooterModule, NgxMatNavigationNavbarModule } from 'ngx-material-navigation';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomAuthService } from './services/custom-auth.service';
import { environment } from '../environments/environment';

const guardConfig: Partial<NgxGuardConfig> = {
    belongsToGuard: {
        getBelongsToForRoute: getBelongsToForRouteValue
    }
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        MatDialogModule,
        MatSnackBarModule,
        NgxMatNavigationFooterModule,
        NgxMatNavigationNavbarModule,
        RouterModule
    ],
    providers: [
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
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

// eslint-disable-next-line unusedImports/no-unused-vars
function getBelongsToForRouteValue(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authService: CustomAuthService = inject(CustomAuthService);
    if (!authService.authData?.userId) {
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