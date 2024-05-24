import { NgIf } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';

import { BaseAuthData } from '../../models/base-auth-data.model';
import { BaseRole } from '../../models/base-role.model';
import { BaseToken } from '../../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../../services/jwt-auth.service';
import { NGX_GET_VALIDATION_ERROR_MESSAGE } from '../get-validation-error-message.function';

/**
 * The data for the forgot password link in the login component.
 */
export interface ForgotPasswordLinkData {
    /**
     * What is displayed in the UI.
     * @default 'Forgot your password?'
     */
    displayName: string,
    /**
     * The route to which the link navigates.
     * @default '/reset-password'
     */
    route: string
}

/**
 * A simple login box.
 */
@Component({
    selector: 'ngx-mat-auth-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        FormsModule,
        MatFormFieldModule,
        RouterModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class NgxMatAuthLoginComponent<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    TokenType extends BaseToken,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    AuthServiceType extends JwtAuthService<AuthDataType, RoleValue, Role, TokenType>
> implements OnInit {

    /**
     * (optional) A custom function to generate the error-message for invalid inputs.
     */
    @Input()
    getValidationErrorMessage!: (model: NgModel) => string;

    /**
     * A custom title of the login box.
     * @default 'Login'
     */
    @Input()
    loginTitle: string = 'Login';

    /**
     * A custom label for the email input.
     * @default 'Email'
     */
    @Input()
    emailInputLabel: string = 'Email';

    /**
     * A custom label for the password input.
     * @default 'Password'
     */
    @Input()
    passwordInputLabel: string = 'Password';

    /**
     * A custom label for the login button.
     * @default 'Login'
     */
    @Input()
    loginButtonLabel: string = 'Login';

    /**
     * Data for the forgot password link.
     * @default {
     * displayName: 'Forgot your password?',
     * route: '/reset-password'
     * }
     */
    @Input()
    forgotPasswordLinkData!: ForgotPasswordLinkData;

    /**
     * The route to which the user gets redirected after he logs in successful.
     * @default '/'
     */
    @Input()
    routeAfterLogin: string = '/';

    /**
     * Whether or not the user should be prompted for biometric login if the option is available.
     * @default true
     */
    @Input()
    automaticallyPromptForBiometricLogin: boolean = true;

    /**
     * The password input by the user.
     */
    password?: string;

    /**
     * The email input by the user.
     */
    email?: string;

    /**
     * Whether or not the password input is hidden.
     */
    hide: boolean = true;

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        @Inject(NGX_GET_VALIDATION_ERROR_MESSAGE)
        protected readonly defaultGetValidationErrorMessage: (model: NgModel) => string,
        protected readonly router: Router
    ) { }

    async ngOnInit(): Promise<void> {
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? this.defaultGetValidationErrorMessage;
        this.forgotPasswordLinkData = this.forgotPasswordLinkData ?? {
            displayName: 'Forgot your password?',
            route: this.authService.REQUEST_RESET_PASSWORD_ROUTE
        };

        if (this.automaticallyPromptForBiometricLogin && !this.authService.authData && this.authService.biometricCredentials.length) {
            await this.authService.loginWithBiometricAuthentication();
        }
    }

    /**
     * The method that gets called when the user tries to login.
     * @param form - The login form. Is passed to clear it without triggering input validation errors.
     */
    async onSubmit(form: NgForm): Promise<void> {
        if (!this.email || !this.password) {
            return;
        }
        try {
            await this.authService.login({
                email: this.email,
                password: this.password
            });
            form.resetForm();
            await this.router.navigateByUrl(this.routeAfterLogin);
        }
        catch (error) {
            form.resetForm();
            throw error;
        }
    }
}