import { NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxMatAuthTwoFactorCodeInputComponent } from '../two-factor-code-input/two-factor-code-input.component';
import { TwoFactorDialogConfig } from './two-factor.dialog.config';

/**
 * A dialog to input a two factor code.
 */
@Component({
    selector: 'ngx-mat-auth-two-factor-dialog',
    templateUrl: './two-factor-dialog.component.html',
    styleUrls: ['./two-factor-dialog.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NgxMatAuthTwoFactorCodeInputComponent,
        MatDialogModule,
        MatButtonModule
    ]
})
export class NgxMatAuthTwoFactorDialogComponent implements OnInit {

    /**
     * The code value. Gets updated as the user types.
     */
    code: string = '';

    /**
     * The Configuration for title, labels etc.
     */
    data!: TwoFactorDialogConfig;

    constructor(
        protected readonly dialogRef: MatDialogRef<NgxMatAuthTwoFactorDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        protected readonly inputData?: Partial<TwoFactorDialogConfig>
    ) { }

    ngOnInit(): void {
        this.data = {
            title: this.inputData?.title ?? 'Two-Factor Authentication',
            description: this.inputData?.description ?? [
                'Enter the 6-digit code from your authenticator app'
            ],
            cancelButtonLabel: this.inputData?.cancelButtonLabel ?? 'Cancel',
            confirmButtonLabel: this.inputData?.confirmButtonLabel ?? 'Confirm'
        };
    }

    /**
     * Closes the dialog with the input code.
     */
    confirm(): void {
        this.dialogRef.close(this.code);
    }

    /**
     * Closes the dialog.
     */
    cancel(): void {
        this.dialogRef.close();
    }
}