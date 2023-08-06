import { NgIf } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
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
     *
     * @default 'Forgot your password?'
     */
    displayName: string,
    /**
     * The route to which the link navigates.
     *
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
     *
     * @default 'Login'
     */
    @Input()
    loginTitle!: string;

    /**
     * A custom label for the email input.
     *
     * @default 'Email'
     */
    @Input()
    emailInputLabel!: string;

    /**
     * A custom label for the password input.
     *
     * @default 'Password'
     */
    @Input()
    passwordInputLabel!: string;

    /**
     * A custom label for the login button.
     *
     * @default 'Login'
     */
    @Input()
    loginButtonLabel!: string;

    /**
     * Data for the forgot password link.
     *
     * @default {
     * displayName: 'Forgot your password?',
     * route: '/reset-password'
     * }
     */
    @Input()
    forgotPasswordLinkData!: ForgotPasswordLinkData;

    /**
     * The route to which the user gets redirected after he logs in successful.
     *
     * @default '/'
     */
    @Input()
    routeAfterLogin!: string;

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

    ngOnInit(): void {
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? this.defaultGetValidationErrorMessage;
        this.loginTitle = this.loginTitle ?? 'Login';
        this.emailInputLabel = this.emailInputLabel ?? 'Email';
        this.passwordInputLabel = this.passwordInputLabel ?? 'Password';
        this.loginButtonLabel = this.loginButtonLabel ?? 'Login';
        // eslint-disable-next-line max-len
        this.forgotPasswordLinkData = this.forgotPasswordLinkData ?? { displayName: 'Forgot your password?', route: this.authService.REQUEST_RESET_PASSWORD_ROUTE };
        this.routeAfterLogin = this.routeAfterLogin ?? '/';
    }

    /**
     * The method that gets called when the user tries to login.
     */
    onSubmit(): void {
        if (!this.email || !this.password) {
            return;
        }
        this.authService.login({ email: this.email, password: this.password })
            .then(() => {
                this.email = undefined;
                this.password = undefined;
                void this.router.navigate([this.routeAfterLogin]);
            })
            .catch(err => {
                this.email = undefined;
                this.password = undefined;
                throw err;
            });
    }
}