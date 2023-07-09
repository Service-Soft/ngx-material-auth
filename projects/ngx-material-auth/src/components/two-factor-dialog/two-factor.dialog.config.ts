/**
 * Configuration for the two factor code dialog.
 */
export interface TwoFactorDialogConfig {
    /**
     * The title of the dialog.
     *
     * @default 'Two-Factor Authentication'
     */
    title: string,
    /**
     * The description to display below the title.
     * Each item in the array is a paragraph.
     *
     * @default ['Enter the 6-digit code from your authenticator app']
     */
    description: string[],
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