import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomAuthService } from './services/custom-auth.service';
import { HttpErrorInterceptor, JwtInterceptor, NGX_AUTH_SERVICE, NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS } from 'ngx-material-auth';
import { NgxMatNavigationNavbarModule, NgxMatNavigationFooterModule } from 'ngx-material-navigation';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

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
            useValue: ['localhost']
        },
        {
            provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true
        },
        {
            provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }