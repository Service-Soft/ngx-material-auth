/* eslint-disable cspell/spellchecker */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NGX_AUTH_SERVICE } from 'ngx-material-auth';

import { LoginComponent } from './login.component';
import { CustomAuthService } from '../../services/custom-auth.service';

const mockForm: NgForm = {
    resetForm: () => {}
} as unknown as NgForm;

describe('LoginComponent', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let component: LoginComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                HttpClientModule,
                MatSnackBarModule,
                MatDialogModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: NGX_AUTH_SERVICE,
                    useExisting: CustomAuthService
                }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should initiate with empty inputs and default configuration values', () => {
        expect(component.loginComponent).toBeDefined();
        // empty inputs
        expect(component.loginComponent.email).toBeUndefined();
        expect(component.loginComponent.password).toBeUndefined();
        expect(component.loginComponent.hide).toBeTrue();
        // default configuration
        expect(component.loginComponent.loginTitle).toEqual('Login');
        expect(component.loginComponent.emailInputLabel).toEqual('Email');
        expect(component.loginComponent.passwordInputLabel).toEqual('Password');
        expect(component.loginComponent.loginButtonLabel).toEqual('Login');
        expect(component.loginComponent.routeAfterLogin).toEqual('/');
        expect(component.loginComponent.forgotPasswordLinkData).toEqual({
            displayName: 'Forgot your password?',
            route: '/request-reset-password'
        });
    });

    it('should not be able to submit with incomplete form data', async () => {
        const loginSpy: jasmine.Spy = spyOn(component.authService, 'login');
        // no data
        await component.loginComponent.onSubmit(mockForm);
        expect(loginSpy.calls.count()).toEqual(0);
        // only email
        component.loginComponent.email = 'user@example.com';
        await component.loginComponent.onSubmit(mockForm);
        expect(loginSpy.calls.count()).toEqual(0);
        // only password
        component.loginComponent.password = 'stringstring';
        component.loginComponent.email = undefined;
        await component.loginComponent.onSubmit(mockForm);
        expect(loginSpy.calls.count()).toEqual(0);
    });

    it('should login with correct data', async () => {
        const navigateSpy: jasmine.Spy = spyOn(component.loginComponent['router'], 'navigateByUrl');
        component.loginComponent.email = 'user@example.com';
        component.loginComponent.password = 'stringstring';
        await component.loginComponent.onSubmit(mockForm);

        expect(navigateSpy.calls.count()).toEqual(1);
        component.authService.authData = undefined;
    });

    it('should fail login with incorrect data', async () => {
        const navigateSpy: jasmine.Spy = spyOn(component.loginComponent['router'], 'navigateByUrl');
        component.loginComponent.email = 'user@test.com';
        component.loginComponent.password = 'stringstring';

        await expectAsync(component.loginComponent.onSubmit(mockForm)).toBeRejected();
        expect(navigateSpy.calls.count()).toEqual(0);
    });
});