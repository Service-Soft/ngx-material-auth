import { Component, Inject, Input, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseAuthData } from '../../models/base-auth-data.model';
import { BaseToken } from '../../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../../services/jwt-auth.service';
import { getValidationErrorMessage } from '../get-validation-error-message.function';

/**
 * The interface for the request reset password functionality.
 */
@Component({
    selector: 'ngx-mat-auth-request-reset-password',
    templateUrl: './request-reset-password.component.html',
    styleUrls: ['./request-reset-password.component.scss']
})
export class NgxMatAuthRequestResetPasswordComponent<
    AuthDataType extends BaseAuthData<TokenType>,
    TokenType extends BaseToken,
    AuthServiceType extends JwtAuthService<AuthDataType, TokenType>
> implements OnInit {

    /**
     * (optional) A custom function to generate the error-message for invalid inputs.
     */
    @Input()
    getValidationErrorMessage!: (model: NgModel) => string;

    /**
     * The title of the request reset password box.
     *
     * @default 'Forgot Password'
     */
    @Input()
    requestResetPasswordTitle!: string;

    /**
     * A custom label for the email input.
     *
     * @default 'Email'
     */
    @Input()
    emailInputLabel!: string;

    /**
     * A custom label for the send email button.
     *
     * @default 'Send Email'
     */
    @Input()
    sendEmailButtonLabel!: string;

    /**
     * A custom label for the cancel button.
     *
     * @default 'Cancel'
     */
    @Input()
    cancelButtonLabel!: string;

    /**
     * The route to navigate to after the user successfully requests the reset of his password.
     *
     * @default '/login'
     */
    @Input()
    routeAfterRequest!: string;

    /**
     * The email for the account which password should be reset.
     */
    email?: string;

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        protected readonly router: Router
    ) { }

    ngOnInit(): void {
        this.requestResetPasswordTitle = this.requestResetPasswordTitle ?? 'Forgot Password';
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? getValidationErrorMessage;
        this.emailInputLabel = this.emailInputLabel ?? 'Email';
        this.sendEmailButtonLabel = this.sendEmailButtonLabel ?? 'Send Email';
        this.cancelButtonLabel = this.cancelButtonLabel ?? 'Cancel';
        this.routeAfterRequest = this.routeAfterRequest ?? '/login';
    }

    /**
     * Cancels the password reset.
     */
    cancel(): void {
        void this.router.navigate([this.routeAfterRequest]);
    }

    /**
     * Requests the reset of the password for the user with the given email.
     */
    onSubmit(): void {
        if (!this.email) {
            return;
        }
        this.authService.requestResetPassword(this.email)
            .then(() => {
                this.email = undefined;
                void this.router.navigate([this.routeAfterRequest]);
            })
            .catch(err => {
                this.email = undefined;
                throw err;
            });
    }
}