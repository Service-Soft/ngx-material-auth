import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { BaseAuthData } from '../../models/base-auth-data.model';
import { BaseRole } from '../../models/base-role.model';
import { BaseToken } from '../../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../../services/jwt-auth.service';
import { NGX_GET_VALIDATION_ERROR_MESSAGE } from '../get-validation-error-message.function';

/**
 * A simple request reset password box.
 */
@Component({
    selector: 'ngx-mat-auth-request-reset-password',
    templateUrl: './request-reset-password.component.html',
    styleUrls: ['./request-reset-password.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class NgxMatAuthRequestResetPasswordComponent<
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
     * The title of the request reset password box.
     * @default 'Forgot Password'
     */
    @Input()
    requestResetPasswordTitle!: string;

    /**
     * A custom label for the email input.
     * @default 'Email'
     */
    @Input()
    emailInputLabel!: string;

    /**
     * A custom label for the send email button.
     * @default 'Send Email'
     */
    @Input()
    sendEmailButtonLabel!: string;

    /**
     * A custom label for the cancel button.
     * @default 'Cancel'
     */
    @Input()
    cancelButtonLabel!: string;

    /**
     * The route to navigate to after the user successfully requests the reset of his password.
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
        @Inject(NGX_GET_VALIDATION_ERROR_MESSAGE)
        protected readonly defaultGetValidationErrorMessage: (model: NgModel) => string,
        protected readonly router: Router
    ) { }

    ngOnInit(): void {
        this.requestResetPasswordTitle = this.requestResetPasswordTitle ?? 'Forgot Password';
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? this.defaultGetValidationErrorMessage;
        this.emailInputLabel = this.emailInputLabel ?? 'Email';
        this.sendEmailButtonLabel = this.sendEmailButtonLabel ?? 'Send Email';
        this.cancelButtonLabel = this.cancelButtonLabel ?? 'Cancel';
        this.routeAfterRequest = this.routeAfterRequest ?? '/login';
    }

    /**
     * Cancels the password reset.
     */
    async cancel(): Promise<void> {
        await this.router.navigateByUrl(this.routeAfterRequest);
    }

    /**
     * Requests the reset of the password for the user with the given email.
     * @param form - The login form. Is passed to clear it without triggering input validation errors.
     */
    async onSubmit(form: NgForm): Promise<void> {
        if (!this.email) {
            return;
        }
        try {
            await this.authService.requestResetPassword(this.email);
            form.resetForm();
            await this.router.navigateByUrl(this.routeAfterRequest);
        }
        catch (error) {
            form.resetForm();
            throw error;
        }
    }
}