/* eslint-disable cspell/spellchecker */
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtInterceptor, NGX_AUTH_SERVICE, NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS } from 'ngx-material-auth';
import { firstValueFrom } from 'rxjs';

import { CustomAuthService } from './custom-auth.service';

describe('CustomAuthService', () => {
    let service: CustomAuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                MatSnackBarModule,
                MatDialogModule
            ],
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                {
                    provide: NGX_AUTH_SERVICE,
                    useExisting: CustomAuthService
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: JwtInterceptor,
                    multi: true
                },
                {
                    provide: NGX_JWT_INTERCEPTOR_ALLOWED_DOMAINS,
                    useValue: ['localhost:3000']
                }
            ]
        });
        service = TestBed.inject(CustomAuthService);
    });

    it('should initiate the service with the default values', () => {
        expect(service).toBeDefined();
        expect(service.AUTH_DATA_KEY).toBe('authData');
        expect(service.ACCESS_TOKEN_DURATION_IN_MS).toBe(3600000);
        expect(service.REFRESH_TOKEN_DURATION_IN_MS).toBe(8640000000);
        expect(service.REQUEST_RESET_PASSWORD_ROUTE).toBe('/request-reset-password');
        expect(service.REQUEST_RESET_PASSWORD_SNACK_BAR_MESSAGE).toBe('A Mail for changing your password is on its way');
        expect(service.CONFIRM_RESET_PASSWORD_SNACK_BAR_MESSAGE).toBe('Password changed successfully!');
        expect(service.TWO_FACTOR_HEADER).toBe('X-Authorization-2FA');
        expect(service.ROUTE_AFTER_LOGOUT).toBe('/login');
    });

    it('should set auth data after successful login', async () => {

        await service.login({
            email: 'user@example.com',
            password: 'stringstring'
        });
        expect(service.authData).toBeDefined();
        expect(service.authData?.userId).toBe('1');
        service.authData = undefined;
    });

    it('should not set auth data after failed login', async () => {
        try {

            await service.login({
                email: 'user@test.com',
                password: 'stringstring'
            });
        }
        catch { }
        expect(service.authData).toBeUndefined();
    });

    it('should automatically refresh when the access token expires', async () => {

        await service.login({
            email: 'user@example.com',
            password: 'stringstring'
        });
        const now: Date = new Date();
        // eslint-disable-next-line typescript/no-non-null-assertion
        service.authData!.accessToken.expirationDate = now;
        const getSpy: jasmine.Spy = spyOn(service['http'], 'get').and.callThrough();
        const postSpy: jasmine.Spy = spyOn(service['http'], 'post').and.callThrough();
        const refreshSpy: jasmine.Spy = spyOn(service, 'refreshToken').and.callThrough();
        await Promise.all([
            firstValueFrom(service['http'].get('http://localhost:3000', { responseType: 'text' })),
            firstValueFrom(service['http'].get('http://localhost:3000', { responseType: 'text' })),
            firstValueFrom(service['http'].get('http://localhost:3000', { responseType: 'text' })),
            firstValueFrom(service['http'].get('http://localhost:3000', { responseType: 'text' })),
            firstValueFrom(service['http'].get('http://localhost:3000', { responseType: 'text' }))
        ]);

        expect(service.authData?.accessToken.expirationDate).toBeDefined();
        expect(service.authData?.accessToken.expirationDate).not.toEqual(now);
        expect(refreshSpy).toHaveBeenCalledTimes(5);
        expect(getSpy).toHaveBeenCalledTimes(5);
        expect(postSpy).toHaveBeenCalledTimes(1);
        service.authData = undefined;
    });
});