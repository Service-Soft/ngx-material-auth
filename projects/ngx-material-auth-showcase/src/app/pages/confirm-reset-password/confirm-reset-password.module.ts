import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmResetPasswordComponent } from './confirm-reset-password.component';
import { NgxMatAuthConfirmResetPasswordModule } from 'ngx-material-auth';
import { ConfirmResetPasswordRoutingModule } from './confirm-reset-password-routing.module';

@NgModule({
    imports: [
        CommonModule,
        NgxMatAuthConfirmResetPasswordModule,
        ConfirmResetPasswordRoutingModule
    ],
    declarations: [ConfirmResetPasswordComponent]
})
export class ConfirmResetPasswordModule { }