/**
 * Configuration data for the SetupTwoFactorDialog.
 */
export interface SetupTwoFactorDialogConfig {
    /**
     * The title of the dialog.
     *
     * @default 'Two-Factor Authentication'
     */
    title: string,
    /**
     * A list of paragraphs to display above the qr code. Is used as a small guide for the user.
     *
     * @default [
     * 'To enable two-factor authentication you can scan the QR Code',
     * 'with your authenticator app and enter the verification code below.',
     * 'Alternatively you can manually add the secret key.'
     * ]
     */
    description: string[],
    /**
     * The label above the secret. (For users that can't use the qr code).
     *
     * @default 'Secret'
     */
    secretLabel: string,
    /**
     * The label to display above the two factor code input.
     *
     * @default 'Verification Code'
     */
    verificationCodeLabel: string,
    /**
     * The label for the cancel button.
     *
     * @default 'Cancel'
     */
    cancelButtonLabel: string,
    /**
     * The label for the confirm button.
     *
     * @default 'Confirm'
     */
    confirmButtonLabel: string
}