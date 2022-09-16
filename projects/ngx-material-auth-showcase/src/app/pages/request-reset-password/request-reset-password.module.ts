import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestResetPasswordComponent } from './request-reset-password.component';
import { RequestResetPasswordRoutingModule } from './request-reset-password-routing.module';
import { NgxMatAuthRequestResetPasswordModule } from 'ngx-material-auth';

@NgModule({
    imports: [
        CommonModule,
        RequestResetPasswordRoutingModule,
        NgxMatAuthRequestResetPasswordModule
    ],
    declarations: [RequestResetPasswordComponent]
})
export class RequestResetPasswordModule { }