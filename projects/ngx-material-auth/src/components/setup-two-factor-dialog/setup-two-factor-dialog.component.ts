import { NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { toCanvas } from 'qrcode';
import { BaseAuthData } from '../../models/base-auth-data.model';
import { BaseRole } from '../../models/base-role.model';
import { BaseToken } from '../../models/base-token.model';
import { JwtAuthService, NGX_AUTH_SERVICE } from '../../services/jwt-auth.service';
import { NgxMatAuthTwoFactorCodeInputComponent } from '../two-factor-code-input/two-factor-code-input.component';
import { SetupTwoFactorDialogConfig } from './setup-two-factor-dialog.config';

/**
 * The dialog to setup two factor authentication.
 */
@Component({
    selector: 'ngx-mat-auth-setup-two-factor-dialog',
    templateUrl: './setup-two-factor-dialog.component.html',
    styleUrls: ['./setup-two-factor-dialog.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        MatDialogModule,
        MatButtonModule,
        NgxMatAuthTwoFactorCodeInputComponent
    ]
})
export class NgxMatAuthSetupTwoFactorDialogComponent<
    AuthDataType extends BaseAuthData<TokenType, RoleValue, Role>,
    TokenType extends BaseToken,
    RoleValue extends string,
    Role extends BaseRole<RoleValue>,
    AuthServiceType extends JwtAuthService<AuthDataType, RoleValue, Role, TokenType>
> implements OnInit {

    /**
     * The secret for generating totp's.
     */
    secret?: string;

    /**
     * Configuration data for the dialog.
     */
    data!: SetupTwoFactorDialogConfig;

    /**
     * The verification code model used in forms.
     */
    verificationCode: string = '';

    constructor(
        @Inject(NGX_AUTH_SERVICE)
        protected readonly authService: AuthServiceType,
        protected readonly dialogRef: MatDialogRef<Component>,
        @Inject(MAT_DIALOG_DATA)
        protected readonly inputData?: Partial<SetupTwoFactorDialogConfig>
    ) {
        this.dialogRef.disableClose = true;
    }

    async ngOnInit(): Promise<void> {
        this.data = {
            title: this.inputData?.title ?? 'Two-Factor Authentication',
            description: this.inputData?.description ?? [
                'To enable two-factor authentication you can scan the QR Code',
                'with your authenticator app and enter the verification code below.',
                'Alternatively you can manually add the secret key.'
            ],
            secretLabel: this.inputData?.secretLabel ?? 'Secret',
            verificationCodeLabel: this.inputData?.verificationCodeLabel ?? 'Verification Code',
            cancelButtonLabel: this.inputData?.cancelButtonLabel ?? 'Cancel',
            confirmButtonLabel: this.inputData?.confirmButtonLabel ?? 'Activate'
        };
        void this.authService.turnOn2FA().then(async response => {
            const canvas: HTMLCanvasElement = document.getElementById('2fa-canvas') as HTMLCanvasElement;
            await toCanvas(canvas, response.url, { width: 180, margin: 0 });
            this.secret = this.getSecretFromCode(response.url);
        });
    }

    private getSecretFromCode(qrCode: string): string {
        const queryString: string = qrCode.split('?')[1];
        const urlParams: URLSearchParams = new URLSearchParams(queryString);
        return urlParams.get('secret') ?? 'No secret could be found in the given url.';
    }

    /**
     * Confirms setting upt 2fa and then closes the dialog with true.
     */
    async confirm(): Promise<void> {
        await this.authService.confirmTurnOn2FA(this.verificationCode);
        this.dialogRef.close(true);
    }

    /**
     * Closes the dialog with false.
     */
    cancel(): void {
        this.dialogRef.close(false);
    }
}