import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMatAuthConfirmResetPasswordComponent } from 'ngx-material-auth';
import { ConfirmResetPasswordRoutingModule } from './confirm-reset-password-routing.module';
import { ConfirmResetPasswordComponent } from './confirm-reset-password.component';

@NgModule({
    imports: [
        CommonModule,
        NgxMatAuthConfirmResetPasswordComponent,
        ConfirmResetPasswordRoutingModule
    ],
    declarations: [ConfirmResetPasswordComponent]
})
export class ConfirmResetPasswordModule { }