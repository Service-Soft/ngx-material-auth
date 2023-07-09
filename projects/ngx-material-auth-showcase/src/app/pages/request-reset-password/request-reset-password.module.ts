import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMatAuthRequestResetPasswordComponent } from 'ngx-material-auth';
import { RequestResetPasswordRoutingModule } from './request-reset-password-routing.module';
import { RequestResetPasswordComponent } from './request-reset-password.component';

@NgModule({
    imports: [
        CommonModule,
        RequestResetPasswordRoutingModule,
        NgxMatAuthRequestResetPasswordComponent
    ],
    declarations: [RequestResetPasswordComponent]
})
export class RequestResetPasswordModule { }