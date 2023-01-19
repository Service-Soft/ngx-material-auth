import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpErrorInterceptor, JwtInterceptor, NGX_AUTH_SERVICE, NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS } from 'ngx-material-auth';
import { NgxMatNavigationFooterModule, NgxMatNavigationNavbarModule } from 'ngx-material-navigation';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomAuthService } from './services/custom-auth.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NgxMatNavigationNavbarModule,
        NgxMatNavigationFooterModule,
        MatSnackBarModule,
        MatDialogModule
    ],
    providers: [
        {
            provide: NGX_AUTH_SERVICE,
            useExisting: CustomAuthService
        },
        {
            provide: NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS,
            useValue: ['localhost:3000']
        },
        {
            provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true
        },
        {
            provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }