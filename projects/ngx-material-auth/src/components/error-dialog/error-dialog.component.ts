import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorData } from '../../models/error-data.model';

/**
 * A generic Error Dialog that displays ErrorData.
 */
@Component({
    selector: 'ngx-material-auth-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule
    ]
})
export class NgxMatAuthErrorDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<NgxMatAuthErrorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public error: ErrorData
    ) { }

    /**
     * Closes the dialog.
     */
    close(): void {
        this.dialogRef.close();
    }
}