import { Component, Inject, Input, NgZone, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BaseAuthData } from '../../models/base-auth-data.model';
import { BaseRole } from '../../models/base-role.model';
import { BaseToken } from '../../models/base-token.model';
import { ErrorData } from '../../models/error-data.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../../services/jwt-auth.service';
import { NgxMatAuthErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { NGX_GET_VALIDATION_ERROR_MESSAGE } from '../get-validation-error-message.function';

/**
 * The interface for the confirm reset password functionality.
 *
 * !!!
 * Also checks if the provided reset token is valid.
 * This tries to get the reset token from theActivatedRoute.params['token'].
 * You have to make sure that your reset password link and the routing makes that possible.
 * !!!
 */
@Component({
    selector: 'ngx-mat-auth-confirm-reset-password',
    templateUrl: './confirm-reset-password.component.html',
    styleUrls: ['./confirm-reset-password.component.scss']
})
export class NgxMatAuthConfirmResetPasswordComponent<
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
     * The title of the confirm reset password box.
     *
     * @default 'New Password'
     */
    @Input()
    confirmResetPasswordTitle!: string;

    /**
     * The label for the password input.
     *
     * @default 'Password'
     */
    @Input()
    passwordInputLabel!: string;

    /**
     * The label for the confirm password input.
     *
     * @default 'Confirm Password'
     */
    @Input()
    confirmPasswordInputLabel!: string;

    /**
     * The label for the change password button.
     *
     * @default 'Change Password'
     */
    @Input()
    changePasswordButtonLabel!: string;

    /**
     * A custom label for the cancel button.
     *
     * @default 'Cancel'
     */
    @Input()
    cancelButtonLabel!: string;

    /**
     * The route to which the user gets redirected when he clicks on the cancel button.
     *
     * @default routeAfterReset
     */
    @Input()
    routeForCancel!: string;

    /**
     * The route to which the user gets redirected after the password has been changed successfully.
     *
     * @default '/login'
     */
    @Input()
    routeAfterReset!: string;

    /**
     * The route to which the user gets redirected if the reset token is not correct.
     *
     * @default '/'
     */
    @Input()
    routeIfResetTokenInvalid!: string;

    /**
     * The error data to display in an dialog when the provided reset token doesn't exist or is invalid.
     *
     * @default
     *{
     * name: 'Error',
     * message: '<p>The provided link is no longer active.</p><p>Please check if the url is correct or request a new link.</p>'
     *}
     */
    @Input()
    invalidResetTokenErrorData!: ErrorData;

    /**
     * The password input by the user.
     */
    password?: string;

    /**
     * The confirm password input by the user.
     */
    confirmPassword?: string;

    /**
     * Whether or not the password input is hidden.
     */
    hide: boolean = true;

    /**
     * Whether or not the confirm password input is hidden.
     */
    hideConfirm: boolean = true;

    private resetToken?: string;

    private readonly defaultInvalidResetTokenErrorData: ErrorData = {
        name: 'Error',
        message: '<p>The provided link is no longer active.</p><p>Please check if the url is correct or request a new link.</p>'
    };

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        @Inject(NGX_GET_VALIDATION_ERROR_MESSAGE)
        protected readonly defaultGetValidationErrorMessage: (model: NgModel) => string,
        protected readonly router: Router,
        protected readonly route: ActivatedRoute,
        protected readonly zone: NgZone,
        protected readonly dialog: MatDialog
    ) { }

    async ngOnInit(): Promise<void> {
        this.initDefaultValues();
        this.resetToken = (await firstValueFrom(this.route.params))['token'] as string | undefined;
        if (
            !this.resetToken
            || !(await this.authService.isResetTokenValid(this.resetToken))
        ) {
            await this.router.navigate([this.routeIfResetTokenInvalid]);
            this.zone.run(() => {
                this.dialog.open(
                    NgxMatAuthErrorDialogComponent,
                    { data: this.invalidResetTokenErrorData, autoFocus: false, restoreFocus: false }
                );
            });
            return;
        }
    }

    private initDefaultValues(): void {
        this.getValidationErrorMessage = this.getValidationErrorMessage ?? this.defaultGetValidationErrorMessage;
        this.confirmResetPasswordTitle = this.confirmResetPasswordTitle ?? 'New Password';
        this.passwordInputLabel = this.passwordInputLabel ?? 'Password';
        this.confirmPasswordInputLabel = this.confirmPasswordInputLabel ?? 'Confirm Password';
        this.changePasswordButtonLabel = this.changePasswordButtonLabel ?? 'Change Password';
        this.cancelButtonLabel = this.cancelButtonLabel ?? 'Cancel';
        this.routeAfterReset = this.routeAfterReset ?? '/login';
        this.routeIfResetTokenInvalid = this.routeIfResetTokenInvalid ?? '/';
        this.routeForCancel = this.routeForCancel ?? this.routeAfterReset;
        this.invalidResetTokenErrorData = this.invalidResetTokenErrorData ?? this.defaultInvalidResetTokenErrorData;
    }

    /**
     * Checks if the user input is invalid.
     *
     * @returns If the user input is invalid.
     */
    inputInvalid(): boolean {
        if (!this.password) {
            return true;
        }
        if (this.password !== this.confirmPassword) {
            return true;
        }
        return false;
    }

    /**
     * Cancels the password reset.
     */
    cancel(): void {
        void this.router.navigate([this.routeForCancel]);
    }

    /**
     * Changes the password.
     */
    onSubmit(): void {
        if (!this.password) {
            return;
        }
        if (this.password !== this.confirmPassword) {
            return;
        }
        this.authService.confirmResetPassword(this.password, this.resetToken as string)
            .then(() => {
                this.resetInputFields();
                void this.router.navigate([this.routeAfterReset]);
            })
            .catch(() => {
                this.resetInputFields();
                void this.router.navigate([this.routeAfterReset]);
            });
    }

    private resetInputFields(): void {
        this.password = '';
        this.confirmPassword = '';
        this.resetToken = '';
    }
}