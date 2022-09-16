import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMatAuthConfirmResetPasswordComponent } from './confirm-reset-password.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NgxMatAuthErrorDialogComponent } from '../error-dialog/error-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        NgxMatAuthErrorDialogComponent
    ],
    declarations: [NgxMatAuthConfirmResetPasswordComponent],
    exports: [NgxMatAuthConfirmResetPasswordComponent]
})
export class NgxMatAuthConfirmResetPasswordModule { }